import { afterEach, describe, expect, it, vi } from 'vitest'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { boundFirstContent, isContentEvent } from '../src/sse.ts'
import { DEFAULT_STREAM_FIRST_PAYLOAD_TIMEOUT_MS, resolveAdapterOptions } from '../src/index.ts'
import { Config } from '../src/config.ts'
import { adapter, chunks, options, sse, start, textEvents } from './helpers.ts'

/**
 * The first-content bound exists because a heartbeat is transport activity but
 * not progress. Observed 2026-09-14 on `deepseek-flash`: HTTP 200, then only
 * `: keep-alive` for about fifteen minutes, then EOF. The idle watchdog could
 * not see it, because every heartbeat rearmed it. On the Messages wire the
 * first frames are `message_start` and `ping`, which arrive before inference, so
 * the bound waits for the first CONTENT event, not the first frame.
 */

type Event = Record<string, unknown>

/** An event generator whose emissions are driven by the test's own clock. */
async function* paced(entries: readonly (readonly [delayMs: number, event: Event])[]): AsyncGenerator<Event> {
  for (const [delayMs, event] of entries) {
    await new Promise<void>((resolve) => { setTimeout(resolve, delayMs) })
    yield event
  }
}

async function collect(stream: AsyncIterable<Event>): Promise<Event[]> {
  const out: Event[] = []
  for await (const item of stream) out.push(item)
  return out
}

const ping = { type: 'ping' }
const content = { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }
const delta = { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'hi' } }

const endpoints: Array<{ close: () => void }> = []
afterEach(() => {
  for (const endpoint of endpoints.splice(0)) endpoint.close()
})

describe('isContentEvent', () => {
  it('treats only content_block_* frames as content', () => {
    expect(isContentEvent(start)).toBe(false)
    expect(isContentEvent(ping)).toBe(false)
    expect(isContentEvent({ type: 'message_delta' })).toBe(false)
    expect(isContentEvent(content)).toBe(true)
    expect(isContentEvent(delta)).toBe(true)
    expect(isContentEvent({ type: 'content_block_stop', index: 0 })).toBe(true)
  })
})

describe('boundFirstContent', () => {
  it('fails as retryable TIMEOUT when no event ever arrives', async () => {
    const error = await collect(boundFirstContent(paced([[10_000, content]]), 50)).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(LlmError)
    expect((error as LlmError).code).toBe('TIMEOUT')
    expect((error as LlmError).message).toMatch(/sent no stream content within 50ms/)
  })

  it('is not satisfied by message_start and ping frames', async () => {
    // The Messages-wire stall shape: the provider opens the message and pings,
    // and inference never starts.
    const stalled = paced([[0, start], [20, ping], [20, ping], [20, ping], [10_000, content]])
    const seen: Event[] = []
    const error = await (async () => {
      for await (const event of boundFirstContent(stalled, 50)) seen.push(event)
    })().catch((e: unknown) => e)
    expect((error as LlmError).code).toBe('TIMEOUT')
    // The frames that did arrive still passed through, in order.
    expect(seen[0]).toEqual(start)
    expect(seen.slice(1).every(event => event.type === 'ping')).toBe(true)
  })

  it('does not bound anything after the first content event', async () => {
    const slowSecond = paced([[0, start], [0, content], [120, delta]])
    await expect(collect(boundFirstContent(slowSecond, 60))).resolves.toEqual([start, content, delta])
  })

  it('signals the first content event exactly once', async () => {
    const onFirstContent = vi.fn()
    await collect(boundFirstContent(paced([[0, start], [0, content], [0, delta]]), 1_000, onFirstContent))
    expect(onFirstContent).toHaveBeenCalledTimes(1)
  })

  it('ends normally when the stream finishes before any content', async () => {
    const onFirstContent = vi.fn()
    const empty = paced([[0, start], [0, { type: 'message_delta' }], [0, { type: 'message_stop' }]])
    await expect(collect(boundFirstContent(empty, 1_000, onFirstContent))).resolves.toHaveLength(3)
    expect(onFirstContent).not.toHaveBeenCalled()
  })

  it('leaves the upstream error intact when the transport fails first', async () => {
    async function* broken(): AsyncGenerator<Event> {
      throw new LlmError('DeepSeek Messages stream ended before message_stop', 'STREAM_CLOSED')
    }
    const error = await collect(boundFirstContent(broken(), 5_000)).catch((e: unknown) => e)
    expect((error as LlmError).code).toBe('STREAM_CLOSED')
  })

  it('disables the bound at zero, so a slow first content event still arrives', async () => {
    await expect(collect(boundFirstContent(paced([[80, content]]), 0))).resolves.toEqual([content])
  })

  it('does not reject after content wins the race', async () => {
    // Regression guard: the losing timer must be cleared and its rejection
    // handled, or a fast stream leaves an unhandled rejection behind it.
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      await collect(boundFirstContent(paced([[0, content]]), 20))
      await new Promise<void>((resolve) => { setTimeout(resolve, 60) })
    } finally {
      process.off('unhandledRejection', unhandled)
    }
    expect(unhandled).not.toHaveBeenCalled()
  })
})

describe('streamFirstPayloadTimeoutMs configuration', () => {
  it('defaults to the measured 25-second bound', () => {
    expect(DEFAULT_STREAM_FIRST_PAYLOAD_TIMEOUT_MS).toBe(25_000)
    expect(resolveAdapterOptions({}).streamFirstPayloadTimeoutMs).toBe(25_000)
  })

  it('accepts zero as the off switch and rejects out-of-range values', () => {
    expect(resolveAdapterOptions({ streamFirstPayloadTimeoutMs: 0 }).streamFirstPayloadTimeoutMs).toBe(0)
    expect(() => resolveAdapterOptions({ streamFirstPayloadTimeoutMs: -1 })).toThrow(/streamFirstPayloadTimeoutMs/)
    expect(() => resolveAdapterOptions({ streamFirstPayloadTimeoutMs: Number.NaN })).toThrow(/streamFirstPayloadTimeoutMs/)
  })

  it('is volatile, so a settings form or legacy settings import can write it', () => {
    const parsed = Config({ streamFirstPayloadTimeoutMs: 1_000 })
    const field = parsed.streamFirstPayloadTimeoutMs
    expect(typeof field.get).toBe('function')
    expect(field.get()).toBe(1_000)
  })
})

describe('first-content bound on the wire', () => {
  /** A local Messages endpoint that sends `reply`'s frames to every request. */
  async function endpoint(reply: (response: import('node:http').ServerResponse) => void) {
    const { createServer } = await import('node:http')
    const http = createServer((request, response) => {
      request.resume()
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'text/event-stream' })
        reply(response)
      })
    })
    await new Promise<void>((resolve) => { http.listen(0, '127.0.0.1', resolve) })
    const address = http.address()
    if (address === null || typeof address === 'string') throw new Error('no address')
    const close = () => { http.closeAllConnections(); http.close() }
    endpoints.push({ close })
    return { url: `http://127.0.0.1:${address.port}` }
  }

  it('fails a keep-alive-only stream as TIMEOUT even though the idle watchdog stays fresh', async () => {
    // keepalive_stall: comments and pings forever, never a content event. The
    // idle timeout is set far longer than the bound, so this would hang (and
    // time the test out) if heartbeats still held the call open.
    const http = await endpoint((response) => {
      response.write(sse([start]))
      const beat = setInterval(() => {
        response.write(': keep-alive\n\n')
        response.write(sse([ping]))
      }, 10)
      response.once('close', () => { clearInterval(beat) })
    })
    const started = Date.now()
    await expect(chunks(adapter({ baseURL: http.url, streamIdleTimeoutMs: 60_000, streamFirstPayloadTimeoutMs: 150 })
      .stream(options()))).rejects.toMatchObject({ code: 'TIMEOUT' })
    expect(Date.now() - started).toBeLessThan(5_000)
  })

  it('leaves a stream whose content arrives within the bound untouched', async () => {
    const http = await endpoint((response) => {
      response.write(': keep-alive\n\n')
      setTimeout(() => { response.end(sse(textEvents)) }, 30)
    })
    const output = await chunks(adapter({ baseURL: http.url, streamFirstPayloadTimeoutMs: 2_000 }).stream(options()))
    expect(output.map(chunk => chunk.type)).toContain('text-delta')
  })
})

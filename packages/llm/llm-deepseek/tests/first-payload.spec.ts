import { describe, expect, it, vi } from 'vitest'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { boundFirstPayload } from '../src/adapter.ts'

/**
 * The first-payload bound exists because a keep-alive comment is transport
 * activity but not progress. Observed 2026-09-14 on `deepseek-flash`: HTTP 200,
 * then only `: keep-alive` for about fifteen minutes, then EOF without
 * `[DONE]`. The idle watchdog could not see it, because every comment rearmed
 * it. These tests pin the window this bound covers and, just as importantly,
 * the windows it must leave alone.
 */

/** A payload generator whose emissions are driven by the test's own clock. */
async function* paced(
  entries: readonly (readonly [delayMs: number, payload: string])[],
): AsyncGenerator<string> {
  for (const [delayMs, payload] of entries) {
    await new Promise<void>((resolve) => { setTimeout(resolve, delayMs) })
    yield payload
  }
}

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = []
  for await (const item of stream) out.push(item)
  return out
}

describe('boundFirstPayload', () => {
  it('fails as retryable TIMEOUT when no payload ever arrives', async () => {
    // The live outage shape: the transport stays open and produces nothing.
    const stalled = paced([[10_000, 'never reached']])
    const error = await collect(boundFirstPayload(stalled, 50, () => {})).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(LlmError)
    expect((error as LlmError).code).toBe('TIMEOUT')
    expect((error as LlmError).message).toMatch(/sent no stream payload within 50ms/)
  })

  it('does not bound anything after the first payload', async () => {
    // A slow SECOND payload is the idle watchdog's business, not this bound's.
    const slowSecond = paced([[0, 'first'], [120, 'second']])
    await expect(collect(boundFirstPayload(slowSecond, 60, () => {}))).resolves
      .toEqual(['first', 'second'])
  })

  it('passes payloads through unchanged and in order', async () => {
    const stream = paced([[0, 'a'], [0, 'b'], [0, '[DONE]']])
    await expect(collect(boundFirstPayload(stream, 1_000, () => {}))).resolves
      .toEqual(['a', 'b', '[DONE]'])
  })

  it('signals the first payload exactly once', async () => {
    const onFirstPayload = vi.fn()
    await collect(boundFirstPayload(paced([[0, 'a'], [0, 'b'], [0, 'c']]), 1_000, onFirstPayload))
    expect(onFirstPayload).toHaveBeenCalledTimes(1)
  })

  it('never signals a first payload for a stream that produced none', async () => {
    const onFirstPayload = vi.fn()
    await collect(boundFirstPayload(paced([]), 1_000, onFirstPayload))
    expect(onFirstPayload).not.toHaveBeenCalled()
  })

  it('leaves the upstream error intact when the transport fails first', async () => {
    async function* broken(): AsyncGenerator<string> {
      throw new LlmError('SSE stream ended without [DONE]', 'STREAM_CLOSED')
    }
    const error = await collect(boundFirstPayload(broken(), 5_000, () => {})).catch((e: unknown) => e)
    expect((error as LlmError).code).toBe('STREAM_CLOSED')
  })

  it('disables the bound at zero, so a slow first payload still arrives', async () => {
    await expect(collect(boundFirstPayload(paced([[80, 'late']]), 0, () => {}))).resolves
      .toEqual(['late'])
  })

  it('does not reject after the payload wins the race', async () => {
    // Regression guard: the losing timer must be cleared and its rejection
    // handled, or a fast stream leaves an unhandled rejection behind it.
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      await collect(boundFirstPayload(paced([[0, 'a']]), 20, () => {}))
      await new Promise<void>((resolve) => { setTimeout(resolve, 60) })
    } finally {
      process.off('unhandledRejection', unhandled)
    }
    expect(unhandled).not.toHaveBeenCalled()
  })
})

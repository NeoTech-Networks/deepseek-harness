/** SSE framing delegated to eventsource-parser; JSON errors remain provider failures. */

import { EventSourceParserStream } from 'eventsource-parser/stream'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { object } from './replay.ts'
import { providerError } from './transport.ts'

/** Decode complete SSE frames without treating an unterminated tail as an event.
 * @param body - provider response bytes.
 * @param activity - pulse the idle watchdog for events and heartbeat comments.
 * @returns JSON events, including message_stop; the translator owns completion.
 */
export async function* parseSse(body: ReadableStream<BufferSource>, activity: () => void): AsyncGenerator<Record<string, unknown>> {
  const events = body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream({ onComment: activity }))
  for await (const frame of events) {
    activity()
    let raw: unknown
    try { raw = JSON.parse(frame.data) } catch (_invalidSseJson) {
      throw new LlmError('DeepSeek Messages SSE contains invalid JSON', 'MALFORMED_RESPONSE')
    }
    const event = object(raw)
    if (typeof event.type !== 'string' || (frame.event !== undefined && frame.event !== event.type)) {
      throw new LlmError('DeepSeek Messages SSE event type mismatch', 'MALFORMED_RESPONSE')
    }
    if (event.type === 'error') throw providerError(event, undefined)
    yield event
  }
}

/**
 * Whether one Messages event carries content, the progress a first-content
 * bound waits for. `message_start` and `ping` are not content: a provider
 * sends both before any inference, so neither proves the stream is producing.
 * @param event - one decoded Messages event.
 * @returns true for `content_block_start`, `content_block_delta` and `content_block_stop`.
 */
export function isContentEvent(event: Record<string, unknown>): boolean {
  return typeof event.type === 'string' && event.type.startsWith('content_block_')
}

/**
 * Bound the wait for a stream's FIRST content event, then get out of the way.
 *
 * The idle watchdog cannot do this alone: it is rearmed by transport activity,
 * and a keep-alive comment (or a `ping` frame) is transport activity. A provider
 * that returns HTTP 200 and then emits nothing but heartbeats keeps that
 * watchdog perpetually fresh (observed 2026-09-14 on `deepseek-flash`: fifteen
 * minutes, zero payloads, then EOF, which surfaces as the non-retryable
 * `STREAM_CLOSED`). This deadline covers exactly that window, and expiry is
 * reported as `TIMEOUT`, which the default retry policy already recovers.
 *
 * Every event passes through unchanged and in order, including the
 * `message_start` and `ping` frames that precede content. Only the first
 * content event is bounded; once the stream is producing, pacing is the idle
 * watchdog's business again. A stream that ends before any content ends
 * normally, so the translator still owns completion.
 *
 * @param events - decoded Messages events from {@link parseSse}.
 * @param timeoutMs - first-content deadline; `<= 0` disables the bound.
 * @param onFirstContent - called once, when the first content event arrives (optional).
 * @returns the same events.
 * @throws {LlmError} `TIMEOUT` when no content event arrives within `timeoutMs`.
 */
export async function* boundFirstContent<T extends Record<string, unknown>>(
  events: AsyncGenerator<T>,
  timeoutMs: number,
  onFirstContent: () => void = () => {},
): AsyncGenerator<T> {
  if (timeoutMs <= 0) {
    yield* events
    return
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const expiry = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new LlmError(
        `DeepSeek accepted the request and sent no stream content within ${timeoutMs}ms`,
        'TIMEOUT',
      ))
    }, timeoutMs)
  })
  // The loser of a race is never awaited again. Marking both handled keeps a
  // late settlement from surfacing as an unhandled rejection; the transport is
  // torn down by the consumer abort the caller already owns.
  expiry.catch(() => {})
  try {
    while (true) {
      const pending = events.next()
      pending.catch(() => {})
      const next = await Promise.race([pending, expiry])
      if (next.done === true) return
      if (isContentEvent(next.value)) {
        clearTimeout(timer)
        onFirstContent()
        yield next.value
        break
      }
      yield next.value
    }
  } finally {
    clearTimeout(timer)
  }
  yield* events
}

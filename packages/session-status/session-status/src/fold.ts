/**
 * Pure fold of the session-status domain: the event drive the projection
 * registry replays. Kept here, free of cordis and zod, so tests fold a raw
 * event list without a registry.
 *
 * @module @deepseek-ai/dsh-session-status/fold
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { SessionStatusValue } from './types.ts'

/**
 * Fold one durable event into the current declared status.
 *
 * A `session/status` event sets the value, or clears it when `status` is
 * `null`. Any human-authored `user/message` clears it, because the human has
 * answered whatever the status was holding for. Every other event returns the
 * same reference so the projection change feed stays quiet between status
 * boundaries.
 *
 * @param state - the status covering all prior events, or null.
 * @param event - the next committed session event.
 * @returns the next status (the same reference when the event is unrelated).
 */
export function applySessionStatusProjection(
  state: SessionStatusValue | null,
  event: SessionEvent,
): SessionStatusValue | null {
  if (event.type === 'session/status') return event.data.status
  if (event.type === 'user/message' && event.data.source.kind === 'user') return null
  return state
}

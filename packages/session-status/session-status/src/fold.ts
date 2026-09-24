/**
 * Pure fold of the session-status domain: the event drive the projection
 * registry replays. Kept here, free of cordis and zod, so tests fold a raw
 * event list without a registry.
 *
 * @module @deepseek-ai/dsh-session-status/fold
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {
  SessionStatusProjectionState,
  SessionStatusValue,
  SessionStatusVocabularyResolver,
} from './types.ts'

/** The empty state: no declared status, no goal phase observed yet. */
export const INITIAL_SESSION_STATUS_STATE: SessionStatusProjectionState = {
  status: null,
  goalPhase: null,
}

/**
 * Which shipped status id a durable goal phase declares. `active` maps to no
 * status: a goal that is running is not a hold, so it clears the badge rather
 * than branding the row.
 */
const GOAL_PHASE_STATUS: Readonly<Record<string, string | null>> = {
  active: null,
  paused: 'paused',
  blocked: 'stuck',
  complete: 'finished',
}

/**
 * Read the durable phase carried by a foreign `goal/change` event.
 *
 * The goal domain's payload is read STRUCTURALLY, not through its types. That
 * event is declared in `@deepseek-ai/dsh-goal`'s host-coupled `domain.ts`,
 * which pulls dsh-agent and dsh-llm into whatever program imports it, and this
 * module is also compiled into the client program. The shape is validated
 * field by field instead, and anything unrecognized is ignored.
 *
 * @param data - the raw `goal/change` payload.
 * @returns the durable phase, `'clear'` for the tombstone, or undefined when the payload is not recognized.
 */
function readGoalPhase(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const record = data as { operation?: unknown; goal?: unknown }
  if (record.operation === 'clear') return 'clear'
  const goal = record.goal
  if (typeof goal !== 'object' || goal === null) return undefined
  const phase = (goal as { phase?: unknown }).phase
  return typeof phase === 'string' ? phase : undefined
}

/**
 * Fold one durable event into the declared-status state.
 *
 * Three drives, one badge:
 *
 *  * A `session/status` event sets the value, or clears it when `status` is
 *    `null`.
 *  * A `goal/change` event that MOVES the goal to a new durable phase declares
 *    the matching shipped status (`complete` finished, `blocked` stuck,
 *    `paused` paused); an `active` phase or a clear tombstone clears it. Only
 *    a transition acts, so a run of edits at one phase cannot keep clobbering
 *    a status the operator or the model set deliberately.
 *  * Any human-authored `user/message` clears it, because the human has
 *    answered whatever the status was holding for.
 *
 * That last rule is why the goal mapping lives here rather than in the client.
 * The client used to derive a badge straight from the `goal` projection, which
 * has no expiry, so one completed goal pinned a green check on the sidebar row
 * for the rest of the session no matter what it did afterwards.
 *
 * Every other event returns the same reference so the projection change feed
 * stays quiet between status boundaries.
 *
 * @param state - the state covering all prior events.
 * @param event - the next committed session event.
 * @param resolve - resolves a shipped status id against the deployment vocabulary.
 * @returns the next state (the same reference when the event is unrelated).
 */
export function applySessionStatusProjection(
  state: SessionStatusProjectionState,
  event: SessionEvent,
  resolve: SessionStatusVocabularyResolver,
): SessionStatusProjectionState {
  if (event.type === 'session/status') {
    return state.status === event.data.status ? state : { ...state, status: event.data.status }
  }
  if (event.type === 'user/message' && event.data.source.kind === 'user') {
    return state.status === null ? state : { ...state, status: null }
  }
  // Widened deliberately: `goal/change` belongs to a domain this package does
  // not import, so it is not in the SessionEventType union seen here.
  const type: string = event.type
  if (type !== 'goal/change') return state
  const phase = readGoalPhase((event as { data: unknown }).data)
  if (phase === undefined) return state
  if (phase === 'clear') {
    return state.status === null && state.goalPhase === null ? state : { status: null, goalPhase: null }
  }
  if (phase === state.goalPhase) return state
  const statusId = GOAL_PHASE_STATUS[phase]
  // An unrecognized phase records the transition but declares nothing: a goal
  // phase added later must not brand the row with a status nobody chose.
  const status = statusId === null || statusId === undefined ? null : resolve(statusId) ?? null
  return { status, goalPhase: phase }
}

/**
 * The status a folded state currently declares.
 * @param state - the folded state.
 * @returns the declared status, or null while none is in force.
 */
export function sessionStatusOf(state: SessionStatusProjectionState): SessionStatusValue | null {
  return state.status
}

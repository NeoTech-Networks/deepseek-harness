/**
 * Durable declared session status for the DeepSeek Harness: a `session/status`
 * session event, the `sessionStatus` projection that folds it, and a service
 * that resolves statuses against a validated deployment vocabulary. The status
 * is what makes a sidebar row say "waiting on you to deploy", "stuck", or
 * "finished" without reading model text: both the agent (through the sibling
 * tool package) and the operator (through the controller route) append the
 * same log event, so it behaves identically on every model backend.
 *
 * @module @deepseek-ai/dsh-session-status
 */

import { Context, Service } from '@deepseek-ai/cordis'
import { z as zod } from 'zod'
import type { ZodType } from 'zod'
import type { Session } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-session-projection'
import { applySessionStatusProjection, INITIAL_SESSION_STATUS_STATE, sessionStatusOf } from './fold.ts'
import type {
  SessionStatusConfig,
  SessionStatusIconId,
  SessionStatusProjectionState,
  SessionStatusTone,
  SessionStatusValue,
  SessionStatusVocabularyEntry,
  SessionStatusVocabularyResolver,
} from './types.ts'
export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Resolves and appends declared session statuses against the vocabulary. */
    sessionStatus: SessionStatusService
  }
}

/** The error for a status id outside the deployment vocabulary. */
export class SessionStatusUnknownError extends Error {
  constructor(id: string) {
    super(`unknown session status ${JSON.stringify(id)}`)
    this.name = 'SessionStatusUnknownError'
  }
}

/** The shipped icon-id allowlist, so a malformed entry fails at load. */
const ICON_IDS: readonly SessionStatusIconId[] = ['right-up', 'stop', 'check', 'clock', 'pause']

/** The shipped tone allowlist, so a malformed entry fails at load. */
const TONES: readonly SessionStatusTone[] = ['attention', 'error', 'success', 'neutral']

/** The shipped default vocabulary; a deployment overrides it through config. */
const DEFAULT_VOCABULARY: readonly SessionStatusVocabularyEntry[] = [
  { id: 'waiting-production', label: 'Waiting on you: deploy to production', icon: 'right-up', tone: 'attention' },
  { id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error' },
  { id: 'finished', label: 'Finished', icon: 'check', tone: 'success' },
  { id: 'waiting-external', label: 'Waiting on someone else', icon: 'clock', tone: 'attention' },
  { id: 'paused', label: 'Paused', icon: 'pause', tone: 'neutral' },
]

/** The projection key and its wire form share the same value type. */
const sessionStatusSchema: ZodType<SessionStatusValue | null> = zod.union([
  zod.object({
    id: zod.string().min(1),
    label: zod.string().min(1),
    icon: zod.union([
      zod.literal('right-up'), zod.literal('stop'), zod.literal('check'),
      zod.literal('clock'), zod.literal('pause'),
    ]),
    tone: zod.union([
      zod.literal('attention'), zod.literal('error'),
      zod.literal('success'), zod.literal('neutral'),
    ]),
  }).strict(),
  zod.null(),
])

/** Persisted fold state: the published status plus the goal-transition marker. */
const sessionStatusStateSchema: ZodType<SessionStatusProjectionState> = zod.object({
  status: sessionStatusSchema,
  goalPhase: zod.string().nullable(),
}).strict()

/**
 * Build the `sessionStatus` projection for one resolved vocabulary.
 *
 * The definition is per-deployment rather than a module constant because the
 * fold now declares a status of its own on a durable goal phase transition,
 * and the value it declares must come from the vocabulary that deployment
 * validated at load, not from a table hard-coded in the fold.
 *
 * @param resolve - resolves a shipped status id against the deployment vocabulary.
 * @returns the projection definition to register.
 */
export function createSessionStatusProjectionDefinition(resolve: SessionStatusVocabularyResolver) {
  // No return annotation: `register` demands a definition whose `wire` is
  // present, and annotating the optional-`wire` interface would widen it away.
  return {
    key: 'sessionStatus',
    // v2: state gained `goalPhase` and the fold gained the goal drive, so
    // every v1 checkpoint must be discarded and re-folded.
    stateVersion: 2,
    stateSchema: sessionStatusStateSchema,
    init: () => INITIAL_SESSION_STATUS_STATE,
    apply: (state, event) => applySessionStatusProjection(state, event, resolve),
    // `status` is the reference carried by the event, so an internal-only
    // change (a goal transition that declares nothing) republishes nothing.
    wire: { viewSchema: sessionStatusSchema, view: state => state.status },
  } satisfies ProjectionDefinition<'sessionStatus', SessionStatusProjectionState>
}

/**
 * Validate the deployment vocabulary and return it detached. Missing, blank,
 * duplicate, or out-of-allowlist fields fail here, at plugin load, rather than
 * being ignored and leaving a row with an undrawable status.
 *
 * @param config - raw plugin config.
 * @returns the validated vocabulary.
 */
export function resolveVocabulary(config: SessionStatusConfig): readonly SessionStatusVocabularyEntry[] {
  const raw = (config as Partial<SessionStatusConfig>).vocabulary
  if (!Array.isArray(raw)) {
    throw new Error('SessionStatus config needs an array `vocabulary`')
  }
  const seen = new Set<string>()
  return raw.map((entry, index) => {
    const value = entry as Partial<SessionStatusVocabularyEntry>
    const id = typeof value.id === 'string' ? value.id.trim() : ''
    const label = typeof value.label === 'string' ? value.label.trim() : ''
    const icon = value.icon
    const tone = value.tone
    if (id === '') throw new Error(`SessionStatus vocabulary[${String(index)}] needs a non-empty id`)
    if (label === '') throw new Error(`SessionStatus vocabulary[${String(index)}] (${id}) needs a non-empty label`)
    if (icon === undefined || !ICON_IDS.includes(icon)) {
      throw new Error(`SessionStatus vocabulary[${String(index)}] (${id}) has unknown icon ${String(icon)}`)
    }
    if (tone === undefined || !TONES.includes(tone)) {
      throw new Error(`SessionStatus vocabulary[${String(index)}] (${id}) has unknown tone ${String(tone)}`)
    }
    if (seen.has(id)) throw new Error(`SessionStatus vocabulary has duplicate id ${JSON.stringify(id)}`)
    seen.add(id)
    return { id, label, icon, tone }
  })
}

/**
 * `ctx.sessionStatus`: owns the status vocabulary and the projection
 * registration, and appends the whole-value `session/status` event on set and
 * clear. Carriers serve the projection on the history tail page and the
 * `session/projection` push frame, so a cold sidebar row reads it without the
 * session being opened.
 */
export class SessionStatusService extends Service {
  static inject = ['sessionProjections']

  private readonly byId: ReadonlyMap<string, SessionStatusValue>

  constructor(ctx: Context, config: SessionStatusConfig = { vocabulary: DEFAULT_VOCABULARY }) {
    super(ctx, 'sessionStatus')
    const vocabulary = resolveVocabulary(config)
    const byId = new Map(vocabulary.map(entry => [entry.id, entry]))
    this.byId = byId
    ctx.sessionProjections.register(
      createSessionStatusProjectionDefinition(id => byId.get(id)),
    )
  }

  /**
   * The deployment's current vocabulary, in declaration order.
   * @returns the vocabulary entries.
   */
  list(): readonly SessionStatusValue[] {
    return [...this.byId.values()]
  }

  /**
   * Append the whole-value status for one vocabulary id, or throw when the id
   * is not in the vocabulary so an unknown id is a rendered error rather than
   * a silently dropped write.
   *
   * @param session - the owning session.
   * @param id - a vocabulary id.
   * @param note - optional operator or agent note recorded beside the status.
   */
  set(session: Session, id: string, note?: string): void {
    const status = this.byId.get(id)
    if (status === undefined) throw new SessionStatusUnknownError(id)
    session.append('session/status', { status, ...(note === undefined ? {} : { note }) })
  }

  /**
   * Clear the declared status.
   * @param session - the owning session.
   */
  clear(session: Session): void {
    session.append('session/status', { status: null })
  }

  /**
   * The current declared status, or null while none is in force.
   * @param session - the owning session.
   * @returns the current declared status, or null.
   */
  current(session: Session): SessionStatusValue | null {
    const state = this.ctx.sessionProjections.stateOf(session, 'sessionStatus')
    if (state === undefined) throw new Error('session-status requires the sessionStatus session projection')
    return sessionStatusOf(state)
  }
}

export default SessionStatusService

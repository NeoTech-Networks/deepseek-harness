/**
 * The Session's one-sentence purpose as a client-visible projection, so the
 * Session footer's fourth line follows the Session while it runs.
 *
 * The sentence is written once by the session-title plugin as a log-only
 * `session/purpose` event; this unit only folds it (latest wins). An event
 * the unit does not care about returns the SAME state reference, which is the
 * projection contract's no-downstream-work requirement; the view is the state
 * itself, so an unchanged answer republishes nothing.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
// Side-effect type import: the `session/purpose` session-event merge this unit reads by name.
import type {} from '@deepseek-ai/dsh-session-title'
import { z } from 'zod'
import type { SessionPurpose } from './types.ts'

const stateSchema: z.ZodType<SessionPurpose> = z.object({
  purpose: z.string().min(1).nullable(),
}).strict()

/**
 * Advance the folded purpose by one Session event.
 * @param state - state before the event.
 * @param event - next committed Session event.
 * @returns the same state reference unless a different purpose landed.
 */
function applySessionPurposeProjection(state: SessionPurpose, event: SessionEvent): SessionPurpose {
  if (event.type !== 'session/purpose') return state
  const purpose = event.data.purpose
  if (purpose === '' || purpose === state.purpose) return state
  return { purpose }
}

/** The client-visible unit: what the Session is for. */
export const sessionPurposeProjection = {
  key: 'sessionPurpose',
  stateSchema,
  init: () => ({ purpose: null }),
  apply: applySessionPurposeProjection,
  wire: { viewSchema: stateSchema, view: (state: SessionPurpose) => state },
  stateVersion: 1,
} satisfies ProjectionDefinition<'sessionPurpose', SessionPurpose>

/**
 * Register the Session purpose projection.
 * @param ctx - Session Controller context carrying the projection registry.
 */
export function installSessionPurposeProjection(ctx: Context): void {
  ctx.sessionProjections.register(sessionPurposeProjection)
}

/**
 * The skills and commands the OPERATOR typed in this Session, as a
 * client-visible projection, so the Session footer's third line follows the
 * Session while it runs.
 *
 * Two durable signals are folded, and both are operator-authored by
 * construction:
 *
 *   1. `user/message` whose source is `skill-invocation`: the record
 *      `dsh-tool-skill` writes when the operator's own `/name` gesture
 *      resolves to a user-invocable skill. A skill the MODEL loads with the
 *      `skill` tool never produces it, which is exactly the distinction the
 *      line exists to show.
 *   2. `command/run`: a resolved slash command. Every executor caller is a
 *      human-facing surface dispatching a human-typed line, so no command
 *      record can be authored by anyone but the operator.
 *
 * The fold keeps NAMES only, deduplicated in FIRST-USE order, so the line
 * reads in the order the operator reached for things. An event the unit does
 * not care about returns the SAME state reference, which is the projection
 * contract's no-downstream-work requirement; the view is the state itself, so
 * an unchanged answer republishes nothing.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
// Side-effect type imports: the `skill-invocation` message source and the
// `command/run` session-event merges this unit reads by name.
import type {} from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-commands/types'
import { z } from 'zod'
import type { SkillsUsed } from './types.ts'

/**
 * Names retained per Session. A Session with more distinct slash invocations
 * than this keeps its EARLIEST uses, because the footer answers "what did I
 * reach for", and the first uses are the ones that shape the Session.
 */
export const MAX_SKILLS_USED = 32

const stateSchema: z.ZodType<SkillsUsed> = z.object({
  skills: z.array(z.string().min(1)).max(MAX_SKILLS_USED),
}).strict()

/**
 * Read the skill or command name one Session event records, operator-typed.
 *
 * A message the operator did not author carries no invocation record, and the
 * `skill` tool's own calls are tool events rather than these two shapes, so
 * neither can reach this fold.
 *
 * @param event - one committed Session event.
 * @returns the name, or `undefined` when the event records no operator invocation.
 */
function usedNameOf(event: SessionEvent): string | undefined {
  if (event.type === 'user/message') {
    const source = event.data.source
    if (source.kind !== 'skill-invocation') return undefined
    return source.name === '' ? undefined : source.name
  }
  if (event.type === 'command/run') {
    return event.data.name === '' ? undefined : event.data.name
  }
  return undefined
}

/**
 * Advance the retained name list by one Session event.
 * @param state - state before the event.
 * @param event - next committed Session event.
 * @returns the same state reference unless a not-yet-listed invocation landed.
 */
function applySkillsUsedProjection(state: SkillsUsed, event: SessionEvent): SkillsUsed {
  const name = usedNameOf(event)
  if (name === undefined || state.skills.includes(name)) return state
  if (state.skills.length >= MAX_SKILLS_USED) return state
  return { skills: [...state.skills, name] }
}

/**
 * The client-visible unit: the skills and commands the operator typed.
 *
 * The view is the folded state itself, so the reference stability the
 * projection contract asks of an object-valued view comes from `apply` alone.
 */
export const skillsUsedProjection = {
  key: 'skillsUsed',
  stateSchema,
  init: () => ({ skills: [] }),
  apply: applySkillsUsedProjection,
  wire: { viewSchema: stateSchema, view: (state: SkillsUsed) => state },
  stateVersion: 1,
} satisfies ProjectionDefinition<'skillsUsed', SkillsUsed>

/**
 * Register the operator-invocation projection.
 * @param ctx - Session Controller context carrying the projection registry.
 */
export function installSkillsUsedProjection(ctx: Context): void {
  ctx.sessionProjections.register(skillsUsedProjection)
}

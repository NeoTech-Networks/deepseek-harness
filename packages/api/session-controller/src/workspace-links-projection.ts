/**
 * The dashboard a Session's operator messages name, as a client-visible
 * projection, so the Session footer follows the Session while it runs.
 *
 * The fold is deliberately MAP-FREE: it keeps the addresses and `/dashboard`
 * targets each operator message carries ({@link WorkspaceLinkCandidates}) and
 * nothing else. Classification against the two profile maps happens in the wire
 * view, at read time, for two reasons: a regenerated map is then picked up with
 * no restart and no cache invalidation, and a replayed fold can never depend on
 * a file outside the Session log.
 *
 * The view is what the Session footer renders through `useProjection`, and the
 * registry's change feed publishes it to the open Session as a `projection`
 * frame, which is why the footer updates while the operator works instead of
 * only when the Session list is pulled.
 */

import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { z } from 'zod'
import type { WorkspaceLinksProjectionState } from './types.ts'
import {
  linkCandidatesOf, loadWorkspaceLinks, resolveSessionLinks, MAX_CANDIDATE_URLS,
  type WorkspaceLinks,
} from './workspace-links.ts'

/**
 * Candidate-bearing messages retained per Session. Only a message that carries
 * an address or a `/dashboard` target enters the ring, so ordinary chatter
 * never evicts a mention; eight is far more than a Session needs to still name
 * the dashboard it moved to.
 */
export const MAX_RETAINED_CANDIDATES = 8

/** Bounded reference memo, so an unchanged answer republishes nothing. */
const VIEW_MEMO_MAX = 256
const viewMemo = new Map<string, WorkspaceLinks>()

const candidateSchema = z.object({
  seq: z.number().int().nonnegative(),
  urls: z.array(z.string().min(1)).max(MAX_CANDIDATE_URLS),
  target: z.string().min(1).nullable(),
}).strict()

const stateSchema: z.ZodType<WorkspaceLinksProjectionState> = z.object({
  cwd: z.string(),
  candidates: z.array(candidateSchema).max(MAX_RETAINED_CANDIDATES),
}).strict()

const viewShape = z.object({
  dashboardUrl: z.string().min(1).optional(),
  designProject: z.string().min(1).optional(),
}).strict()

/**
 * Whether a value is a well-formed wire view: at most the two named fields,
 * each a non-empty string when present.
 *
 * zod types `.optional()` as `?: string | undefined`, which
 * `exactOptionalPropertyTypes` will not assign to {@link WorkspaceLinks}'
 * `?: string`, so the shape validates and this guard supplies the declared type.
 * An explicitly `undefined` field is refused, which is what `?: string` means.
 *
 * @param value - candidate view.
 * @returns true when `value` is a {@link WorkspaceLinks}.
 */
function isWorkspaceLinks(value: unknown): value is WorkspaceLinks {
  const parsed = viewShape.safeParse(value)
  return parsed.success && Object.values(parsed.data).every(field => field !== undefined)
}

/** The view passes through unchanged, so the memoised reference survives the parse. */
const viewSchema = z.custom<WorkspaceLinks>(isWorkspaceLinks)

/**
 * Read one operator message's exact text content, or nothing.
 *
 * Eligibility mirrors the title unit: a `user/message` whose source is the
 * operator. A message with no text block carries no address and no command, so
 * it is not a candidate message.
 *
 * @param event - one committed Session event.
 * @returns the joined text of the message's text blocks.
 */
function operatorTextOf(event: SessionEvent): string | undefined {
  if (event.type !== 'user/message' || event.data.source.kind !== 'user') return undefined
  const content = event.data.content
  return content
    .filter((block): block is Extract<(typeof content)[number], { type: 'text' }> => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

/**
 * Advance the retained candidate ring by one Session event.
 * @param state - state before the event.
 * @param event - next committed Session event.
 * @returns the same state reference unless a candidate-bearing message landed.
 */
function applyWorkspaceLinksProjection(
  state: WorkspaceLinksProjectionState,
  event: SessionEvent,
): WorkspaceLinksProjectionState {
  const text = operatorTextOf(event)
  if (text === undefined || text === '') return state
  const candidates = linkCandidatesOf(event.seq, text)
  if (candidates.urls.length === 0 && candidates.target === null) return state
  return {
    cwd: state.cwd,
    candidates: [...state.candidates, candidates].slice(-MAX_RETAINED_CANDIDATES),
  }
}

/**
 * Resolve the folded candidates against the CURRENT profile maps.
 *
 * Two contracts are honoured here. First, the answer is memoised by content, so
 * an internal-only state change republishes nothing (the projection contract
 * requires an object-valued view to keep its reference). Second, an unreadable
 * map at worst costs a blank footer: {@link loadWorkspaceLinks} already treats a
 * missing or malformed file as no entries.
 *
 * @param state - folded candidate state for one Session.
 * @param root - profile directory holding both maps; defaults to the live one.
 * @returns the dashboard and design project, or an empty object.
 */
export function resolveProjectedLinks(
  state: WorkspaceLinksProjectionState,
  root: string = join(homedir(), '.dsh'),
): WorkspaceLinks {
  const links = resolveSessionLinks(state.cwd, state.candidates, loadWorkspaceLinks(root))
  const key = `${state.cwd}\u0000${links.dashboardUrl ?? ''}\u0000${links.designProject ?? ''}`
  const held = viewMemo.get(key)
  if (held !== undefined) return held
  if (viewMemo.size >= VIEW_MEMO_MAX) {
    const oldest = viewMemo.keys().next()
    if (!oldest.done) viewMemo.delete(oldest.value)
  }
  viewMemo.set(key, links)
  return links
}

/**
 * The client-visible unit: the dashboard the Session's own messages name.
 *
 * `init` keeps the immutable workspace directory, which is the stronger signal
 * and needs no event; the fold adds message candidates; the view resolves both
 * against the live maps, newest message first.
 */
export const workspaceLinksProjection = {
  key: 'workspaceLinks',
  stateSchema,
  init: (header: SessionHeader) => ({ cwd: header.cwd ?? '', candidates: [] }),
  apply: applyWorkspaceLinksProjection,
  wire: {
    viewSchema,
    view: (state: WorkspaceLinksProjectionState) => resolveProjectedLinks(state),
  },
  stateVersion: 1,
} satisfies ProjectionDefinition<'workspaceLinks', WorkspaceLinksProjectionState>

/**
 * Register the workspace-links projection.
 * @param ctx - Session Controller context carrying the projection registry.
 */
export function installWorkspaceLinksProjection(ctx: Context): void {
  ctx.sessionProjections.register(workspaceLinksProjection)
}

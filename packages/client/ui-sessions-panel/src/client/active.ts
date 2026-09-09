/**
 * The sessions panel's pure derivation: which sessions are visible, whether
 * each is active, and the active-first order.
 *
 * This package re-derives phase on its own rather than importing the left
 * sidebar's `derivePhase` (a feature plugin must not runtime-import another
 * feature plugin's values). The lineage walk below is the same small
 * projection `indexSubagentDescendants` performs, re-expressed here so the
 * panel owns its own view of "running subagents", matching the precedent that
 * the UI Subagent and UI Workspace domains project independently.
 *
 * Everything here is a pure function over plain data, so the classifier and
 * its ordering are testable without React or a Cordis context.
 */
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionPendingInteractionBase } from '@deepseek-ai/dsh-client-ui-session/client'
// Type-only: pulls the `plan` projection key into SessionProjectionMap.
import type {} from '@deepseek-ai/dsh-plan-mode/client'
// Type-only: pulls the `sessionStatus` projection key into SessionProjectionMap.
import type {} from '@deepseek-ai/dsh-session-status/client'
import type { SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/**
 * The phase a session row presents in this panel, the same precedence the left
 * sidebar applies.
 *
 * `declared` is the durable status the session declared about itself. This
 * panel had no such state at all, so one session could read as "waiting on you
 * to deploy" in the workspace sidebar and as a plain idle row here, in the
 * same window.
 */
export type SessionPanelPhase =
  | 'awaiting'
  | 'planning'
  | 'running'
  | 'subagents'
  | 'declared'
  | 'done'
  | 'idle'

/** One list row the panel renders: identity, display title, phase, and recency. */
export interface SessionPanelRow {
  id: SessionId
  /** Display title; empty for a blank (New Session) row. */
  title: string
  blank: boolean
  phase: SessionPanelPhase
  /** The declared status behind a `declared` phase; absent for every other phase. */
  declaredStatus?: SessionStatusValue
  updatedAt: number
  /** Whether this row is the currently selected session. */
  current: boolean
}

/** Pending-interaction kinds that mean the operator's input is blocked on. */
const AWAITING_KINDS = new Set(['approval', 'plan-review', 'question'])

/** Ascending order: lower sorts first, so awaiting-* leads and idle trails. */
const PHASE_RANK: Readonly<Record<SessionPanelPhase, number>> = {
  awaiting: 0,
  planning: 1,
  running: 2,
  subagents: 3,
  declared: 4,
  done: 5,
  idle: 6,
}

/**
 * Running subagent descendant counts keyed by the ancestor the descendants run
 * under. A running subagent contributes one to every subagent ancestor and to
 * its top-level parent, so a parent whose delegated work is still running
 * surfaces as `subagents`.
 */
function runningSubagentCounts(
  byId: Readonly<Record<SessionId, SessionSummary>>,
): ReadonlyMap<SessionId, number> {
  const counts = new Map<SessionId, number>()
  for (const summary of Object.values(byId)) {
    if (summary.origin !== 'subagent' || !summary.running) continue
    const seen = new Set<SessionId>()
    let current: SessionSummary | undefined = summary
    while (current !== undefined && current.origin === 'subagent' && current.parentId !== undefined && !seen.has(current.id)) {
      seen.add(current.id)
      counts.set(current.parentId, (counts.get(current.parentId) ?? 0) + 1)
      current = byId[current.parentId]
    }
  }
  return counts
}

/**
 * The one phase a session presents, mirroring the left sidebar's precedence.
 *
 * A declared status sits below everything the session is actually doing, for
 * the same reason it does there: the mark reports what is happening, and a
 * status is what an idle session says about why it is idle.
 */
function phaseOf(
  summary: SessionSummary,
  runningSubagentCount: number,
  pendingKind: string | undefined,
): SessionPanelPhase {
  if (pendingKind !== undefined && AWAITING_KINDS.has(pendingKind)) return 'awaiting'
  if (summary.projectionValues?.plan?.active === true) return 'planning'
  if (summary.running) return 'running'
  if (runningSubagentCount > 0) return 'subagents'
  if (summary.projectionValues?.sessionStatus != null) return 'declared'
  if (summary.completed === true) return 'done'
  return 'idle'
}

/** A session the panel shows: ordinary (non-subagent), unarchived, and not a blank row but the current one. */
function visible(summary: SessionSummary, current: SessionId | undefined, archived: ReadonlySet<SessionId>): boolean {
  return summary.origin !== 'subagent'
    && !archived.has(summary.id)
    && (!summary.blank || summary.id === current)
}

/**
 * Derive the panel's rows: every visible session, active ones first.
 *
 * Visibility mirrors the left sidebar's `sessionVisible`: subagent rows are
 * folded into their parents (never listed), archived rows are hidden, and only
 * the selected blank row shows. Active rows lead in phase-precedence order,
 * then recency; idle rows trail by recency.
 *
 * @param list - the session list snapshot.
 * @param archivedSessionIds - registry-global archive set.
 * @param pendingInteractions - pending UI interactions keyed by session.
 * @returns active and idle rows, each already sorted.
 */
export function deriveSessions(
  list: SessionListState,
  archivedSessionIds: readonly SessionId[],
  pendingInteractions: ReadonlyMap<SessionId, SessionPendingInteractionBase>,
): { active: SessionPanelRow[]; idle: SessionPanelRow[] } {
  const archived = new Set(archivedSessionIds)
  const runningCounts = runningSubagentCounts(list.byId)
  const rows: SessionPanelRow[] = []
  for (const id of list.ids) {
    const summary = list.byId[id]
    if (summary === undefined || !visible(summary, list.current, archived)) continue
    const phase = phaseOf(summary, runningCounts.get(id) ?? 0, pendingInteractions.get(id)?.kind)
    const declaredStatus = summary.projectionValues?.sessionStatus
    rows.push({
      id,
      title: summary.blank ? '' : summary.displayTitle,
      blank: summary.blank,
      phase,
      ...(phase === 'declared' && declaredStatus != null ? { declaredStatus } : {}),
      updatedAt: summary.updatedAt,
      current: id === list.current,
    })
  }
  rows.sort((left, right) => {
    const rankDelta = PHASE_RANK[left.phase] - PHASE_RANK[right.phase]
    if (rankDelta !== 0) return rankDelta
    if (right.updatedAt !== left.updatedAt) return right.updatedAt - left.updatedAt
    return left.id < right.id ? -1 : 1
  })
  const active = rows.filter(row => row.phase !== 'idle')
  const idle = rows.filter(row => row.phase === 'idle')
  return { active, idle }
}

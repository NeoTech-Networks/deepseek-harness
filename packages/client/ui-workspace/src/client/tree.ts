/**
 * Derives the workspace browser tree from Host Workspace order and membership.
 * Unassigned Sessions trail under Ungrouped; only the selected blank Session
 * remains visible.
 */
import {
  type SessionListState, type SessionSearchResultItem, type SessionSummary,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {
  SessionPendingInteractionBase,
} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-plan-mode/client'
import type {} from '@deepseek-ai/dsh-schedule/client'
import type {} from '@deepseek-ai/dsh-goal/client'
import type { SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { workspaceTitleOf } from '@deepseek-ai/dsh-util-workspace-path'
import {
  indexSubagentDescendants, type SubagentDescendantSummary,
} from './subagent-lineage.ts'

/** Group key for Sessions outside every Workspace. */
export const UNGROUPED_KEY = ''

/**
 * Resolve the Workspace browser group that owns one Session.
 * @param workspaces - authoritative Workspace membership.
 * @param sessionId - Session whose browser group is required.
 * @returns owning Workspace id, or {@link UNGROUPED_KEY} when no Workspace accounts for it.
 */
export function owningGroupKey(
  workspaces: readonly WorkspaceView[],
  sessionId: SessionId,
): string {
  return (workspaces.find(workspace => workspace.sessionIds.includes(sessionId))
    ?.workspaceId as string | undefined) ?? UNGROUPED_KEY
}

/** Pending interaction kinds with dedicated Workspace-row presentation. */
export type SessionPendingInteractionStatus = 'approval' | 'plan-review' | 'question'
type SessionPendingInteractions = ReadonlyMap<SessionId, SessionPendingInteractionBase>

/**
 * The single phase a session row's status slot presents, in the precedence
 * {@link derivePhase} applies. `subagents` is descendant-only activity; `done`
 * is the finished-but-unopened reminder, distinct from `idle`.
 */
export type SessionPhase =
  | 'awaiting-approval'
  | 'awaiting-plan-review'
  | 'awaiting-answer'
  | 'declared'
  | 'planning'
  | 'running'
  | 'subagents'
  | 'done'
  | 'idle'

/**
 * Live facts every session row surface derives identically — grouped rows, the
 * flat list, and search results. They come from the list projection and the
 * subagent lineage index, never from the surface rendering them.
 */
export interface SessionRowFacts {
  /** A Session-scoped UI consumer is awaiting this user. */
  pendingInteraction?: SessionPendingInteractionStatus
  running: boolean
  /** Running descendants connected through uninterrupted subagent-origin lineage. */
  runningSubagentCount: number
  /** Finished running while not selected and not yet opened (the green "done" reminder dot). */
  completed: boolean
  /** Logged plan mode is in force (the `plan` projection's `active`). */
  planActive: boolean
  /** A declared status, from `sessionStatus` or the goal-phase fallback. */
  declaredStatus?: SessionStatusValue
  /** The current list projection contains at least one active Schedule record. */
  hasActiveSchedule: boolean
  /** The winning phase for the row's status slot. */
  phase: SessionPhase
}

/** One top-level session row in a group or the flat list. */
export interface SessionNode extends SessionRowFacts {
  id: SessionId
  /** Stored display title; the renderer substitutes the localized New Session label for blank rows. */
  title: string
  /** The provisional blank session (renderer shows the localized New Session title). */
  blank: boolean
  updatedAt: number
}

/** Session order selected by the Workspace browser. */
export type SessionOrderBy = 'manual' | 'updated'

/** One workspace group section: header row facts + visible top-level session rows. */
export interface GroupNode {
  /** Group key: the workspace id or {@link UNGROUPED_KEY}. */
  key: string
  /** Backing Workspace id; absent only for the ungrouped bucket. */
  workspaceId: WorkspaceId | undefined
  cwd: string | undefined
  /** Workspace creation time (epoch ms); absent only for the ungrouped bucket. */
  createdAt: number | undefined
  label: string
  /** Grouping label; empty string means ungrouped. */
  group: string
  /** Total visible sessions in the group. */
  sessionCount: number
  expanded: boolean
  /** The group contains the selected session (active folder tint; supplied here so the renderer never scans). */
  containsCurrent: boolean
  /** Visible session rows (empty while the group is folded). */
  sessions: readonly SessionNode[]
}

/** One top-level group section: named groups nest Workspace rows under a header. */
export interface GroupSectionNode {
  /** Stable section key. */
  key: string
  /** Header label; undefined renders the section's Workspaces without a header. */
  label: string | undefined
  /** Some Workspace in the section contains the selected session. */
  containsCurrent: boolean
  /** Workspace sections in stable Host order. */
  workspaces: readonly GroupNode[]
}

/** One flat search row combining list metadata with an optional content match. */
export interface SearchResultNode extends SessionRowFacts {
  id: SessionId
  title: string
  workspace: string
  snippet?: string
}

/** Bounded merged search projection plus the refine-query hint bit. */
export interface SearchResultSet {
  items: readonly SearchResultNode[]
  hasMore: boolean
}

/** Viewing state consumed by the derivation. */
export interface TreeView {
  expandedGroups: readonly string[]
  /** Browser-local order for Sessions without a backing Workspace account. */
  ungroupedOrder?: readonly string[]
}

interface Group {
  key: string
  workspaceId: WorkspaceId | undefined
  cwd: string | undefined
  createdAt: number | undefined
  label: string
  group: string
  sessions: SessionSummary[]
}

/**
 * Directory display label: basename of the path (both separators accepted).
 * Ungrouped-bucket fallback for surfaces without a workspace title.
 * @param cwd - directory path, or undefined for the ungrouped bucket.
 * @returns basename, the raw cwd when it has no basename, or an empty ungrouped marker.
 */
export function workspaceLabel(cwd: string | undefined): string {
  if (cwd === undefined || cwd === '') return ''
  const base = workspaceTitleOf(cwd)
  return base !== '' ? base : cwd
}

/** Recency comparator: newest first, id as the deterministic tiebreak (ids are unique per group). */
function byRecency(a: SessionSummary, b: SessionSummary): number {
  if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt
  return a.id < b.id ? -1 : 1
}

/**
 * Ordinary sessions are visible; among blank sessions, only the current one
 * is visible. Subagent children use their parent header catalog; archived
 * sessions are visible nowhere, while their accounting slots remain so
 * unarchiving restores position.
 */
function sessionVisible(session: SessionSummary, current: SessionId | undefined, archived: ReadonlySet<SessionId>): boolean {
  return session.origin !== 'subagent'
    && !archived.has(session.id)
    && (!session.blank || session.id === current)
}

/**
 * A blank session is the selected Workspace's provisional New Session row;
 * its canonical title never enters search (blank rows are query-excluded)
 * and the renderer localizes its display label.
 */
function sessionTitle(session: SessionSummary): string {
  return session.blank ? '' : session.displayTitle
}

/** The list projection alone owns the best-effort active-Schedule indicator. */
function hasActiveSchedule(session: SessionSummary): boolean {
  return (session.projectionValues?.schedule?.length ?? 0) > 0
}

/**
 * Logged plan mode from the list projection. A `pending` selection is
 * deliberately not plan mode: the row follows the state in force, so a `/plan`
 * command that fails never flips the icon. An absent key is capability absence
 * (plan-mode not composed, or hints that have not warmed) and reads as false.
 */
function planActive(session: SessionSummary): boolean {
  return session.projectionValues?.plan?.active === true
}

/**
 * The declared status a row presents. The `sessionStatus` projection wins when
 * present; otherwise a goal's durable phase maps to the matching shipped
 * status, so a session that manages a goal through the goal tools lights up
 * the icon without a second declaration. An absent key is capability absence
 * (session-status not composed, or hints that have not warmed) and reads as no
 * status.
 */
function declaredStatusOf(session: SessionSummary): SessionStatusValue | undefined {
  const explicit = session.projectionValues?.sessionStatus
  if (explicit != null) return explicit
  const goal = session.projectionValues?.goal?.goal
  switch (goal?.phase) {
    case 'blocked': return { id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error' }
    case 'complete': return { id: 'finished', label: 'Finished', icon: 'check', tone: 'success' }
    case 'paused': return { id: 'paused', label: 'Paused', icon: 'pause', tone: 'neutral' }
    default: return undefined
  }
}

/* v8 ignore next 3 -- closed-union backstop; only reached if a pending kind is forged */
function assertNever(value: never): never {
  throw new Error(`unknown pending interaction: ${String(value)}`)
}

/**
 * Resolve the one phase a row presents. Anything blocking this operator
 * outranks everything the agent can do alone; a declared status outranks plan
 * mode and activity because it is the durable state the operator asked to see,
 * and a new prompt clears it anyway; plan mode outranks activity because it is
 * the durable collaboration state a running turn does not change; own activity
 * outranks descendant activity; the finished-but-unopened reminder is last
 * before idle.
 * @param facts - the row's derived live facts.
 * @returns the winning phase.
 */
export function derivePhase(facts: Omit<SessionRowFacts, 'phase'>): SessionPhase {
  switch (facts.pendingInteraction) {
    case 'approval': return 'awaiting-approval'
    case 'plan-review': return 'awaiting-plan-review'
    case 'question': return 'awaiting-answer'
    case undefined: break
    /* v8 ignore next -- closed SessionPendingInteractionStatus union */
    default: return assertNever(facts.pendingInteraction)
  }
  if (facts.declaredStatus !== undefined) return 'declared'
  if (facts.planActive) return 'planning'
  if (facts.running) return 'running'
  if (facts.runningSubagentCount > 0) return 'subagents'
  return facts.completed ? 'done' : 'idle'
}

/** Build one group without projecting session lineage into presentation. */
function buildGroup(
  key: string,
  workspaceId: WorkspaceId | undefined,
  cwd: string | undefined,
  createdAt: number | undefined,
  label: string,
  group: string,
  members: readonly SessionSummary[],
  order: 'account' | 'recency',
): Group {
  const sessions = [...members]
  // Real Workspace order comes from sessionIds. Ungrouped falls back to
  // recency until the browser supplies its persisted local order.
  if (order === 'recency') sessions.sort(byRecency)
  return { key, workspaceId, cwd, createdAt, label, group, sessions }
}

/** Apply a stored Ungrouped order and append newly loose Sessions by recency. */
function orderedUngrouped(members: readonly SessionSummary[], stored: readonly string[]): SessionSummary[] {
  const byId = new Map(members.map(session => [session.id as string, session]))
  const included = new Set<string>()
  const ordered: SessionSummary[] = []
  for (const key of stored) {
    const session = byId.get(key)
    if (session === undefined || included.has(key)) continue
    ordered.push(session)
    included.add(key)
  }
  for (const session of [...members].sort(byRecency)) {
    if (included.has(session.id)) continue
    ordered.push(session)
  }
  return ordered
}

/**
 * Group Sessions by Host Workspace: one group per entity in stable Host
 * order, with members resolved from sessionIds in their stored order. Sessions
 * outside every Workspace trail in the browser-local Ungrouped order, which
 * falls back to recency before that order is initialized.
 */
function groupByWorkspace(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archived: ReadonlySet<SessionId>,
  ungroupedOrder: readonly string[] | undefined,
): Group[] {
  const groups: Group[] = []
  const accounted = new Set<SessionId>()
  for (const workspace of workspaces) {
    const members: SessionSummary[] = []
    for (const id of workspace.sessionIds) {
      const summary = list.byId[id]
      if (summary === undefined) continue // account may lead the list pull; the row appears when the summary lands
      accounted.add(id)
      if (!sessionVisible(summary, list.current, archived)) continue
      members.push(summary)
    }
    groups.push(buildGroup(
      workspace.workspaceId, workspace.workspaceId, workspace.path,
      Date.parse(workspace.createdAt), workspace.title, workspace.group, members, 'account',
    ))
  }
  const stray = list.ids
    .map(id => list.byId[id])
    .filter((s): s is SessionSummary =>
      s !== undefined && !accounted.has(s.id) && sessionVisible(s, list.current, archived))
  if (stray.length > 0) {
    groups.push(buildGroup(
      UNGROUPED_KEY,
      undefined,
      undefined,
      undefined,
      '',
      '',
      ungroupedOrder === undefined ? stray : orderedUngrouped(stray, ungroupedOrder),
      ungroupedOrder === undefined ? 'recency' : 'account',
    ))
  }
  return groups
}

/** Keep navigation presentation independent from domain-owned interaction objects. */
function visiblePendingKind(kind: string | undefined): SessionPendingInteractionStatus | undefined {
  switch (kind) {
    case 'approval':
    case 'plan-review':
    case 'question':
      return kind
    default:
      return undefined
  }
}

/** Derive the live facts and the winning phase once, for every row surface. */
function sessionRowFacts(
  s: SessionSummary,
  descendants: ReadonlyMap<SessionId, SubagentDescendantSummary>,
  pendingInteractions: SessionPendingInteractions,
): SessionRowFacts {
  const pendingInteraction = visiblePendingKind(pendingInteractions.get(s.id)?.kind)
  const declaredStatus = declaredStatusOf(s)
  const facts: Omit<SessionRowFacts, 'phase'> = {
    running: s.running,
    runningSubagentCount: descendants.get(s.id)?.runningCount ?? 0,
    completed: s.completed === true,
    planActive: planActive(s),
    hasActiveSchedule: hasActiveSchedule(s),
    ...(pendingInteraction === undefined ? {} : { pendingInteraction }),
    ...(declaredStatus === undefined ? {} : { declaredStatus }),
  }
  return { ...facts, phase: derivePhase(facts) }
}

function sessionNode(
  s: SessionSummary,
  descendants: ReadonlyMap<SessionId, SubagentDescendantSummary>,
  pendingInteractions: SessionPendingInteractions,
): SessionNode {
  return {
    id: s.id,
    title: sessionTitle(s),
    blank: s.blank,
    updatedAt: s.updatedAt,
    ...sessionRowFacts(s, descendants, pendingInteractions),
  }
}

/** Section key for Workspaces without a group label. */
const UNGROUPED_SECTION_KEY = '\u0000ungrouped'
/** Section key for Sessions outside every Workspace. */
const LOOSE_SECTION_KEY = '\u0000loose'

/** Group Workspace rows into sections: named groups first, ungrouped next, loose sessions last. */
function sectionize(nodes: readonly GroupNode[]): GroupSectionNode[] {
  const sections: GroupSectionNode[] = []
  const named = new Map<string, GroupNode[]>()
  const namedOrder: string[] = []
  const ungrouped: GroupNode[] = []
  const loose: GroupNode[] = []
  for (const node of nodes) {
    if (node.workspaceId === undefined) { loose.push(node); continue }
    const label = node.group.trim()
    if (label === '') { ungrouped.push(node); continue }
    const bucket = named.get(label)
    if (bucket === undefined) { named.set(label, [node]); namedOrder.push(label) }
    else bucket.push(node)
  }
  // Named groups render alphabetically, independent of the order their
  // members appear in Host order, so a newly added group slots in place.
  namedOrder.sort((a, b) => a.localeCompare(b))
  for (const label of namedOrder) {
    const workspaces = named.get(label) as GroupNode[]
    sections.push({
      key: label,
      label,
      containsCurrent: workspaces.some(node => node.containsCurrent),
      workspaces,
    })
  }
  if (ungrouped.length > 0) {
    sections.push({
      key: UNGROUPED_SECTION_KEY,
      label: undefined,
      containsCurrent: ungrouped.some(node => node.containsCurrent),
      workspaces: ungrouped,
    })
  }
  if (loose.length > 0) {
    sections.push({
      key: LOOSE_SECTION_KEY,
      label: undefined,
      containsCurrent: loose.some(node => node.containsCurrent),
      workspaces: loose,
    })
  }
  return sections
}

/**
 * Derive the workspace browser sections: named groups nest Workspace rows
 * under a header, ungrouped Workspaces render without one, and Sessions
 * outside every Workspace trail in the browser-local Ungrouped bucket.
 *
 * Every group shows; sessions populate under expanded groups in the selected
 * local order. Blank sessions are excluded except for the selected
 * provisional New Session row; archived sessions are excluded everywhere.
 * Content search lives outside this derivation
 * (see {@link deriveSearchResults}).
 * @param list - sessions list snapshot (`current` feeds containsCurrent).
 * @param workspaces - real workspaces in stable Host order.
 * @param archivedSessionIds - registry-global archive set.
 * @param pendingInteractions - pending UI interactions by Session.
 * @param view - local expansion arrays.
 * @returns group sections in render order.
 */
export function deriveGroups(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
  pendingInteractions: SessionPendingInteractions,
  view: TreeView,
): GroupSectionNode[] {
  const archived = new Set(archivedSessionIds)
  const expandedGroups = new Set(view.expandedGroups)
  const descendants = indexSubagentDescendants(list.byId)
  const currentGroup = list.current === undefined
    ? undefined
    : owningGroupKey(workspaces, list.current)
  const groups: GroupNode[] = []
  for (const g of groupByWorkspace(list, workspaces, archived, view.ungroupedOrder)) {
    const expanded = expandedGroups.has(g.key)
    groups.push({
      key: g.key,
      workspaceId: g.workspaceId,
      cwd: g.cwd,
      createdAt: g.createdAt,
      label: g.label,
      group: g.group,
      sessionCount: g.sessions.length,
      expanded,
      containsCurrent: g.key === currentGroup,
      sessions: expanded
        ? g.sessions.map(session => sessionNode(session, descendants, pendingInteractions))
        : [],
    })
  }
  return sectionize(groups)
}

/**
 * Derive the flat session list ("In one list" mode): every session — fork
 * children included — as a top-level row, strictly newest-first. No grouping,
 * no parent/child adjacency. Content search lives outside this derivation
 * (see {@link deriveSearchResults}).
 * @param list - sessions list snapshot.
 * @param archivedSessionIds - registry-global archive set.
 * @param pendingInteractions - pending UI interactions by Session.
 * @returns flat rows in render order.
 */
export function deriveFlat(
  list: SessionListState,
  archivedSessionIds: readonly SessionId[],
  pendingInteractions: SessionPendingInteractions,
): SessionNode[] {
  const archived = new Set(archivedSessionIds)
  const descendants = indexSubagentDescendants(list.byId)
  const rows: SessionSummary[] = []
  for (const id of list.ids) {
    const s = list.byId[id]
    if (s === undefined || !sessionVisible(s, list.current, archived)) continue
    rows.push(s)
  }
  rows.sort(byRecency)
  return rows.map(session => sessionNode(session, descendants, pendingInteractions))
}

/**
 * Merge immediate title/Workspace substring matches with ranked Host content
 * matches. Local rows lead newest-first, content-only rows retain backend
 * order, and duplicate sessions receive the backend snippet in place.
 * @param list - session metadata authority.
 * @param workspaces - Workspace membership and display labels.
 * @param query - caller text; surrounding whitespace is ignored.
 * @param archivedSessionIds - registry-global archive set (members never match).
 * @param pendingInteractions - pending UI interactions by Session.
 * @param content - ranked Host content-search page.
 * @param limit - protocol-owned maximum merged row count.
 * @returns bounded deduplicated flat rows and a refine-query hint bit.
 */
export function deriveSearchResults(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  query: string,
  archivedSessionIds: readonly SessionId[],
  pendingInteractions: SessionPendingInteractions,
  content: { items: readonly SessionSearchResultItem[]; hasMore: boolean },
  limit: number,
): SearchResultSet {
  const q = query.trim().toLowerCase()
  if (q === '') return { items: [], hasMore: false }
  const archived = new Set(archivedSessionIds)
  const descendants = indexSubagentDescendants(list.byId)

  const workspaceBySession = new Map<SessionId, string>()
  for (const workspace of workspaces) {
    for (const sessionId of workspace.sessionIds) {
      if (!workspaceBySession.has(sessionId)) workspaceBySession.set(sessionId, workspace.title)
    }
  }
  const labelOf = (summary: SessionSummary): string =>
    workspaceBySession.get(summary.id) ?? workspaceLabel(summary.cwd)
  const contentBySession = new Map<SessionId, SessionSearchResultItem>()
  for (const item of content.items) {
    if (!contentBySession.has(item.sessionId)) contentBySession.set(item.sessionId, item)
  }

  const local: SessionSummary[] = []
  for (const id of list.ids) {
    const summary = list.byId[id]
    // Blank placeholders never match a query (their canonical title displays
    // localized, so matching it would tie search to one language).
    if (summary === undefined || summary.blank || !sessionVisible(summary, list.current, archived)) continue
    if (
      sessionTitle(summary).toLowerCase().includes(q)
      || labelOf(summary).toLowerCase().includes(q)
    ) {
      local.push(summary)
    }
  }
  local.sort(byRecency)

  const ordered: SessionSummary[] = []
  const included = new Set<SessionId>()
  const include = (summary: SessionSummary): void => {
    if (included.has(summary.id)) return
    included.add(summary.id)
    ordered.push(summary)
  }
  for (const summary of local) include(summary)
  for (const item of content.items) {
    const summary = list.byId[item.sessionId]
    if (summary !== undefined && !summary.blank && sessionVisible(summary, list.current, archived)) include(summary)
  }

  return {
    items: ordered.slice(0, limit).map((summary) => {
      const match = contentBySession.get(summary.id)
      return {
        id: summary.id,
        title: sessionTitle(summary),
        workspace: labelOf(summary),
        ...sessionRowFacts(summary, descendants, pendingInteractions),
        ...match === undefined ? {} : { snippet: match.snippet },
      }
    }),
    hasMore: content.hasMore || ordered.length > limit,
  }
}

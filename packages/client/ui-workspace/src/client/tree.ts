/**
 * Derives the workspace browser tree from caller-projected Workspace and
 * Session order. Unassigned Sessions trail under Ungrouped; only the selected
 * blank Session remains visible.
 */
import {
  type SessionListState, type SessionSearchResultItem, type SessionSummary,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {
  SessionStatusSnapshot,
} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-schedule/client'
// Type-only: the `plan` and `sessionStatus` list projection merges the stage marks read.
import type {} from '@deepseek-ai/dsh-plan-mode/client'
import type { SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { assertNever } from '@deepseek-ai/dsh-util-values'
import { workspaceTitleOf } from '@deepseek-ai/dsh-util-workspace-path'

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
type SessionStatuses = SessionStatusSnapshot

function mainSessionId(list: SessionListState): SessionId | undefined {
  return Object.values(list.byId)
    .find(session => (session.retainedBy.mainView ?? 0) > 0)?.id
}

/**
 * The single phase a session row's status slot presents (fork stage marks), in
 * the precedence {@link derivePhase} applies. `subagents` is descendant-only
 * activity; `done` is the finished-but-unopened reminder, distinct from `idle`.
 */
export type SessionPhase =
  | 'awaiting-approval'
  | 'awaiting-plan-review'
  | 'awaiting-answer'
  | 'planning'
  | 'running'
  | 'subagents'
  | 'declared'
  | 'done'
  | 'idle'

/** Live facts every session row surface derives identically (tree, flat list, search, All Sessions). */
export interface SessionRowFacts {
  /** A Session-scoped UI consumer is awaiting this user. */
  pendingInteraction?: SessionPendingInteractionStatus
  running: boolean
  /** Running direct children in the loaded subagent catalog. */
  runningSubagentCount: number
  /** Finished running while not selected and not yet opened. */
  completed: boolean
  /** Logged plan mode is in force (the `plan` list projection's `active`); absent reads as off. */
  planActive?: boolean
  /** A declared status, from the `sessionStatus` list projection. */
  declaredStatus?: SessionStatusValue
}

/**
 * Resolve the one phase a row presents: the mark says what the session is doing
 * now, and a declared status is what an idle session says about why it is idle.
 * Anything blocking the operator outranks everything the agent does alone; then
 * plan mode, then own activity, then descendant activity; a declared status sits
 * below all of those (the model sets it before its turn actually ends), and the
 * finished-but-unopened reminder is last before idle.
 * @param facts - the row's derived live facts.
 * @returns the winning phase.
 */
export function derivePhase(facts: SessionRowFacts): SessionPhase {
  switch (facts.pendingInteraction) {
    case 'approval': return 'awaiting-approval'
    case 'plan-review': return 'awaiting-plan-review'
    case 'question': return 'awaiting-answer'
    case undefined: break
    /* v8 ignore next -- closed SessionPendingInteractionStatus union */
    default: return assertNever(facts.pendingInteraction)
  }
  if (facts.planActive === true) return 'planning'
  if (facts.running) return 'running'
  if (facts.runningSubagentCount > 0) return 'subagents'
  if (facts.declaredStatus !== undefined) return 'declared'
  return facts.completed ? 'done' : 'idle'
}

/** Plan mode in force; an absent key (plan-mode not composed, hints not warmed) reads as false. */
function planActiveOf(session: SessionSummary): boolean {
  return session.projectionValues?.plan?.active === true
}

/** The declared status, whole; an absent key reads as no status. */
function declaredStatusOf(session: SessionSummary): SessionStatusValue | undefined {
  return session.projectionValues?.sessionStatus ?? undefined
}

/** Shared live facts plus the phase, for one Session summary. */
function rowFacts(
  s: SessionSummary,
  list: SessionListState,
  statuses: SessionStatuses,
): SessionRowFacts {
  const status = statuses.get(s.id)
  const pendingInteraction = visiblePendingKind(status?.pendingInteraction?.kind)
  const declaredStatus = declaredStatusOf(s)
  const facts: SessionRowFacts = {
    running: status?.running ?? s.running,
    runningSubagentCount: runningChildCount(list, s.id, statuses),
    completed: status?.completionUnread === true,
    // Present only while on, so rows without plan mode keep upstream's shape.
    ...(planActiveOf(s) ? { planActive: true } : {}),
    ...(pendingInteraction === undefined ? {} : { pendingInteraction }),
    ...(declaredStatus === undefined ? {} : { declaredStatus }),
  }
  return facts
}

/** One top-level session row in a group or the flat list. */
export interface SessionNode {
  id: SessionId
  /** Stored display title; the renderer substitutes the localized New Session label for blank rows. */
  title: string
  /** The provisional blank session (renderer shows the localized New Session title). */
  blank: boolean
  /** A Session-scoped UI consumer is awaiting this user. */
  pendingInteraction?: SessionPendingInteractionStatus
  running: boolean
  /** Running direct children in the loaded subagent catalog. */
  runningSubagentCount: number
  /** Finished running while not selected and not yet opened (the green "done" reminder dot). */
  completed: boolean
  /** The current list projection contains at least one active Schedule record. */
  hasActiveSchedule: boolean
  /** In the registry-global pin set: leads its section, reorderable only among pinned rows. */
  pinned: boolean
  /** In the registry-global archive set: shown grayed in place and not openable. */
  archived: boolean
  updatedAt: number
  /** Logged plan mode is in force (fork stage marks); absent reads as off. */
  planActive?: boolean
  /** A declared status from the `sessionStatus` projection (fork). */
  declaredStatus?: SessionStatusValue
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
  /** Named Workspace group label (fork); empty for ungrouped Workspaces and the ungrouped bucket. */
  group: string
  /** Total visible sessions in the group. */
  sessionCount: number
  /**
   * Unarchived ordinary Sessions the group accounts (fork's folder count
   * badge), independent of the archived filter and of folding.
   */
  unarchivedCount: number
  expanded: boolean
  /** The group contains the selected session (active folder tint; supplied here so the renderer never scans). */
  containsCurrent: boolean
  /** Visible session rows (empty while the group is folded). */
  sessions: readonly SessionNode[]
}

/** One flat search row combining list metadata with an optional content match. */
export interface SearchResultNode {
  id: SessionId
  title: string
  workspace: string
  /** A Session-scoped UI consumer is awaiting this user. */
  pendingInteraction?: SessionPendingInteractionStatus
  running: boolean
  /** Running direct children in the loaded subagent catalog. */
  runningSubagentCount: number
  /** Finished running while not selected and not yet opened (the green "done" reminder dot). */
  completed: boolean
  /** The current list projection contains at least one active Schedule record. */
  hasActiveSchedule: boolean
  /** In the registry-global archive set: shown grayed and not openable. */
  archived: boolean
  snippet?: string
  /** Logged plan mode is in force (fork stage marks); absent reads as off. */
  planActive?: boolean
  /** A declared status from the `sessionStatus` projection (fork). */
  declaredStatus?: SessionStatusValue
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
  unarchivedCount: number
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

/**
 * Project known account members by current Session recency.
 * @param sessionIds - authoritative account membership.
 * @param summaries - current Session summaries; members without a summary are omitted until it arrives.
 * @returns known members newest first, with Session identity as the deterministic tie-break.
 */
export function orderByRecency(
  sessionIds: readonly SessionId[],
  summaries: SessionListState['byId'],
): SessionId[] {
  return sessionIds.flatMap((id) => {
    const summary = summaries[id]
    if (summary === undefined) return []
    return [{ id, rank: summary.updatedAt }]
  })
    .sort((a, b) => {
      if (a.rank !== b.rank) return b.rank - a.rank
      return a.id < b.id ? -1 : 1
    })
    .map(member => member.id)
}

/**
 * Reconcile a browser-local manual order with current account membership.
 * New ordinary forks precede their sources without changing saved entries' relative order.
 * @param memberIds - authoritative account membership.
 * @param savedOrder - previously saved browser-local order.
 * @param summaries - current Session metadata; unknown new members wait for their summaries.
 * @param rowState - global pin and archive membership; only account members can supplement the order.
 * @returns saved relative positions plus missing members ordered by pin, fork source, recency, and archive status.
 */
export function reconcileManualOrder(
  memberIds: readonly SessionId[],
  savedOrder: readonly string[] | undefined,
  summaries: SessionListState['byId'],
  rowState?: Pick<SessionRowState, 'pinnedSessionIds' | 'archivedSessionIds'>,
): SessionId[] {
  const members = new Map(memberIds.map(id => [id as string, id]))
  const included = new Set<string>()
  const ordered: SessionId[] = []
  for (const key of savedOrder ?? []) {
    const id = members.get(key)
    if (id === undefined || included.has(key)) continue
    ordered.push(id)
    included.add(key)
  }
  const archived = new Set(rowState?.archivedSessionIds)
  const pins: SessionId[] = []
  for (const sessionId of rowState?.pinnedSessionIds ?? []) {
    const id = members.get(sessionId)
    if (id === undefined || included.has(id) || archived.has(id) || summaries[id] === undefined) continue
    pins.push(id)
    included.add(id)
  }
  const ordinary: SessionId[] = []
  const archives: SessionId[] = []
  for (const id of orderByRecency([...members.values()].filter(id => !included.has(id)), summaries)) {
    if (archived.has(id)) archives.push(id)
    else ordinary.push(id)
  }
  const result = [...pins, ...ordered, ...ordinary, ...archives]
  const pending = new Set(ordinary)
  const placeFork = (id: SessionId): void => {
    if (!pending.delete(id)) return
    const parentId = summaries[id]?.parentId
    if (parentId === undefined || parentId === id || !result.includes(parentId)) return
    placeFork(parentId)
    result.splice(result.indexOf(id), 1)
    result.splice(result.indexOf(parentId), 0, id)
  }
  for (const id of [...ordinary].reverse()) placeFork(id)
  return result
}

/**
 * Keep the selected provisional New Session ahead of either base order.
 * @param order - recency or reconciled manual order.
 * @param currentBlank - selected blank Session in this account, when present.
 * @returns a copy with the selected blank first and no duplicate slot.
 */
export function pinCurrentBlank(
  order: readonly SessionId[],
  currentBlank: SessionId | undefined,
): SessionId[] {
  if (currentBlank === undefined) return [...order]
  return [currentBlank, ...order.filter(id => id !== currentBlank)]
}

/**
 * Archived-row visibility choice: the default hides archived rows, `show`
 * mixes them into their kept slots, and `only` restricts the view (and
 * search) to archived rows.
 */
export type ArchivedFilter = 'default' | 'show' | 'only'

/**
 * Ordinary sessions are visible; among blank sessions, only the current one
 * is visible. Subagent children use their parent header catalog; archived
 * sessions follow the archived filter, while their accounting slots remain
 * either way so unarchiving restores position.
 */
function sessionVisible(
  session: SessionSummary,
  current: SessionId | undefined,
  archived: ReadonlySet<SessionId>,
  archivedFilter: ArchivedFilter,
): boolean {
  if (session.origin === 'subagent') return false
  if (session.blank && session.id !== current) return false
  switch (archivedFilter) {
    case 'default':
      return !archived.has(session.id)
    case 'show':
      return true
    case 'only':
      return archived.has(session.id)
    /* v8 ignore next 2 -- closed-union backstop; only reached if the filter is forged */
    default:
      return assertNever(archivedFilter)
  }
}

/** Registry-global row state consumed by every tree derivation. */
export interface SessionRowState {
  /** Registry-global pin ids; pinned rows lead their section in the local order. */
  pinnedSessionIds: readonly SessionId[]
  /** Archive set; members keep their slots and show grayed while visible. */
  archivedSessionIds: readonly SessionId[]
  /** Archived-row visibility choice applied to lists and search alike. */
  archivedFilter: ArchivedFilter
}

/**
 * Keep the visible New Session placeholder first, then partition pinned and
 * ordinary rows without changing either partition's caller order.
 */
function sectionMembers(
  members: readonly SessionSummary[],
  pinned: ReadonlySet<SessionId>,
  archived: ReadonlySet<SessionId>,
): SessionSummary[] {
  const placeholders: SessionSummary[] = []
  const leading: SessionSummary[] = []
  const rest: SessionSummary[] = []
  for (const member of members) {
    if (member.blank) placeholders.push(member)
    else if (!archived.has(member.id) && pinned.has(member.id)) leading.push(member)
    else rest.push(member)
  }
  return [...placeholders, ...leading, ...rest]
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

/** Build one group without projecting session lineage into presentation. */
function buildGroup(
  key: string,
  workspaceId: WorkspaceId | undefined,
  cwd: string | undefined,
  createdAt: number | undefined,
  label: string,
  group: string,
  members: readonly SessionSummary[],
  unarchivedCount: number,
): Group {
  return { key, workspaceId, cwd, createdAt, label, group, sessions: [...members], unarchivedCount }
}

/** An account member the folder count badge counts: ordinary, not a blank placeholder, not archived. */
function countsAsUnarchived(session: SessionSummary, archived: ReadonlySet<SessionId>): boolean {
  return session.origin !== 'subagent' && !session.blank && !archived.has(session.id)
}

/** Apply a stored Ungrouped order and append newly loose Sessions by recency. */
function orderedUngrouped(
  members: readonly SessionSummary[],
  stored: readonly string[] | undefined,
  summaries: SessionListState['byId'],
): SessionSummary[] {
  const byId = new Map(members.map(session => [session.id as string, session]))
  const ids = stored === undefined
    ? orderByRecency(members.map(session => session.id), summaries)
    : reconcileManualOrder(members.map(session => session.id), stored, summaries)
  return ids.flatMap((id) => {
    const session = byId.get(id)
    /* v8 ignore next -- ids are projected exclusively from the members used to build byId. */
    return session === undefined ? [] : [session]
  })
}

/**
 * Group Sessions by Workspace: one group per caller-ordered entity, with
 * members resolved from caller-ordered sessionIds. Sessions outside every
 * Workspace trail in the browser-local Ungrouped order, which falls back to
 * recency before that order is initialized.
 */
function groupByWorkspace(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archived: ReadonlySet<SessionId>,
  archivedFilter: ArchivedFilter,
  ungroupedOrder: readonly string[] | undefined,
): Group[] {
  const current = mainSessionId(list)
  const groups: Group[] = []
  const accounted = new Set<SessionId>()
  for (const workspace of workspaces) {
    const members: SessionSummary[] = []
    let unarchivedCount = 0
    for (const id of workspace.sessionIds) {
      const summary = list.byId[id]
      if (summary === undefined) continue // account may lead the list pull; the row appears when the summary lands
      accounted.add(id)
      if (countsAsUnarchived(summary, archived)) unarchivedCount += 1
      if (!sessionVisible(summary, current, archived, archivedFilter)) continue
      members.push(summary)
    }
    groups.push(buildGroup(
      workspace.workspaceId, workspace.workspaceId, workspace.path,
      Date.parse(workspace.createdAt), workspace.title, workspace.group?.trim() ?? '', members, unarchivedCount,
    ))
  }
  const stray = list.ids
    .map(id => list.byId[id])
    .filter((s): s is SessionSummary =>
      s !== undefined && !accounted.has(s.id) && sessionVisible(s, current, archived, archivedFilter))
  if (stray.length > 0) {
    groups.push(buildGroup(
      UNGROUPED_KEY,
      undefined,
      undefined,
      undefined,
      '',
      '',
      orderedUngrouped(stray, ungroupedOrder, list.byId),
      stray.filter(session => countsAsUnarchived(session, archived)).length,
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

function runningChildCount(list: SessionListState, parentId: SessionId, statuses: SessionStatuses): number {
  return list.projectionsBySession[parentId]?.values.subagentCatalog?.reduce(
    (count, child) => count + ((statuses.get(child.id)?.running ?? list.byId[child.id]?.running) === true ? 1 : 0),
    0,
  ) ?? 0
}

function sessionNode(
  s: SessionSummary,
  list: SessionListState,
  statuses: SessionStatuses,
  pinned: ReadonlySet<SessionId>,
  archived: ReadonlySet<SessionId>,
): SessionNode {
  return {
    ...rowFacts(s, list, statuses),
    id: s.id,
    title: sessionTitle(s),
    blank: s.blank,
    hasActiveSchedule: hasActiveSchedule(s),
    pinned: !archived.has(s.id) && pinned.has(s.id),
    archived: archived.has(s.id),
    updatedAt: s.updatedAt,
  }
}

/**
 * Derive the workspace browser groups with every session as a top-level row.
 *
 * Every group shows; sessions populate under expanded groups with pinned rows
 * leading in the selected local order. Blank sessions are
 * excluded except for the selected provisional New Session row; archived
 * sessions keep their slots and appear per the archived filter. Content
 * search lives outside this derivation (see {@link deriveSearchResults}).
 * @param list - sessions list snapshot (`mainView` retention feeds containsCurrent).
 * @param workspaces - real Workspaces in Host group order with caller-projected Session order.
 * @param rowState - registry-global pin and archive sets plus the archived filter.
 * @param statuses - unified UI status by Session.
 * @param view - local expansion arrays.
 * @returns group sections in render order.
 */
export function deriveGroups(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  rowState: SessionRowState,
  statuses: SessionStatuses,
  view: TreeView,
): GroupNode[] {
  const archived = new Set(rowState.archivedSessionIds)
  const pinned = new Set(rowState.pinnedSessionIds)
  const expandedGroups = new Set(view.expandedGroups)
  const current = mainSessionId(list)
  const currentGroup = current === undefined
    ? undefined
    : owningGroupKey(workspaces, current)
  const groups: GroupNode[] = []
  for (const g of groupByWorkspace(list, workspaces, archived, rowState.archivedFilter, view.ungroupedOrder)) {
    const expanded = expandedGroups.has(g.key)
    groups.push({
      key: g.key,
      workspaceId: g.workspaceId,
      cwd: g.cwd,
      createdAt: g.createdAt,
      label: g.label,
      group: g.group,
      sessionCount: g.sessions.length,
      unarchivedCount: g.unarchivedCount,
      expanded,
      containsCurrent: g.key === currentGroup,
      sessions: expanded
        ? sectionMembers(g.sessions, pinned, archived)
          .map(session => sessionNode(session, list, statuses, pinned, archived))
        : [],
    })
  }
  return groups
}

/** One section of the `workspace` grouping mode: an optional named header over its Workspace rows. */
export interface GroupSectionNode {
  /** Stable section key: the group label, or a reserved key for the unlabelled sections. */
  key: string
  /** Header label; undefined renders the section's Workspaces without a header. */
  label: string | undefined
  /** Some Workspace in the section contains the selected session. */
  containsCurrent: boolean
  /** Workspace rows in render order. */
  workspaces: readonly GroupNode[]
}

/** Section key for Workspaces without a named group. */
export const UNGROUPED_SECTION_KEY = '\u0000ungrouped'
/** Section key for Sessions outside every Workspace. */
export const LOOSE_SECTION_KEY = '\u0000loose'

/** Natural, case-insensitive name order, the order the file explorer uses for its rows. */
const NAME_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Order Workspace rows by the name the row shows. A cleared title falls back
 * to the path; equal names keep their Host order because Array.sort is stable.
 * @param left - one Workspace row.
 * @param right - the other Workspace row.
 * @returns the collator's ordering of the two displayed names.
 */
export function byWorkspaceName(left: GroupNode, right: GroupNode): number {
  const nameOf = (node: GroupNode): string => node.label.trim() === '' ? node.cwd ?? '' : node.label
  return NAME_COLLATOR.compare(nameOf(left), nameOf(right))
}

/**
 * Group root Workspace rows into sections: named groups first (headers and
 * members both A-Z, so a folder added on disk slots into place), then the
 * Workspaces without a group in their Host order (drag reorder stays live
 * there), then the loose-Session bucket.
 * @param nodes - root Workspace rows in Host order.
 * @returns sections in render order.
 */
export function sectionize(nodes: readonly GroupNode[]): GroupSectionNode[] {
  const named = new Map<string, GroupNode[]>()
  const ungrouped: GroupNode[] = []
  const loose: GroupNode[] = []
  for (const node of nodes) {
    if (node.workspaceId === undefined) loose.push(node)
    else if (node.group === '') ungrouped.push(node)
    else {
      const bucket = named.get(node.group)
      if (bucket === undefined) named.set(node.group, [node])
      else bucket.push(node)
    }
  }
  const sections: GroupSectionNode[] = [...named.keys()]
    .sort((a, b) => NAME_COLLATOR.compare(a, b))
    .map((label) => {
      const workspaces = [...(named.get(label) ?? [])].sort(byWorkspaceName)
      return { key: label, label, containsCurrent: workspaces.some(node => node.containsCurrent), workspaces }
    })
  if (ungrouped.length > 0) {
    sections.push({
      key: UNGROUPED_SECTION_KEY, label: undefined,
      containsCurrent: ungrouped.some(node => node.containsCurrent), workspaces: ungrouped,
    })
  }
  if (loose.length > 0) {
    sections.push({
      key: LOOSE_SECTION_KEY, label: undefined,
      containsCurrent: loose.some(node => node.containsCurrent), workspaces: loose,
    })
  }
  return sections
}

/**
 * A named section shows its Workspaces unless the operator folded it; an
 * unlabelled section has no header and always shows them.
 * @param expansion - persisted fold state keyed by section key.
 * @param section - the section to test.
 * @returns whether the section's Workspace rows render.
 */
export function sectionShowsWorkspaces(
  expansion: Readonly<Record<string, boolean>> | undefined,
  section: GroupSectionNode,
): boolean {
  return section.label === undefined || expansion?.[section.key] !== false
}

/** One All Sessions quick-nav row (fork): a Session row plus the Workspace it belongs to. */
export interface AllSessionNode extends SessionNode {
  /** Owning Workspace title, the cwd basename for a loose session, or empty. */
  workspace: string
}

/**
 * Derive the All Sessions quick-nav rows (fork): every visible unarchived
 * Session, newest first with pinned rows leading, each labelled with its
 * Workspace. The archived filter of the browser below does not apply here.
 * @param list - sessions list snapshot.
 * @param workspaces - Workspace membership and display labels.
 * @param rowState - registry-global pin and archive sets.
 * @param statuses - unified UI status by Session.
 * @returns flat rows in render order.
 */
export function deriveAllSessions(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  rowState: Pick<SessionRowState, 'pinnedSessionIds' | 'archivedSessionIds'>,
  statuses: SessionStatuses,
): AllSessionNode[] {
  const archived = new Set(rowState.archivedSessionIds)
  const pinned = new Set(rowState.pinnedSessionIds)
  const current = mainSessionId(list)
  const workspaceBySession = new Map<SessionId, string>()
  for (const workspace of workspaces) {
    for (const sessionId of workspace.sessionIds) {
      if (!workspaceBySession.has(sessionId)) workspaceBySession.set(sessionId, workspace.title)
    }
  }
  const visible = orderByRecency(list.ids.filter((id) => {
    const summary = list.byId[id]
    return summary !== undefined && sessionVisible(summary, current, archived, 'default')
  }), list.byId).flatMap((id) => {
    const summary = list.byId[id]
    return summary === undefined ? [] : [summary]
  })
  return sectionMembers(visible, pinned, archived).map(summary => ({
    ...sessionNode(summary, list, statuses, pinned, archived),
    workspace: workspaceBySession.get(summary.id) ?? workspaceLabel(summary.cwd),
  }))
}

/**
 * Select complete flat-list membership, independently of archive visibility.
 * @param list - sessions list snapshot.
 * @returns known ordinary Session ids, including archives and only the current blank.
 */
export function sessionMemberIds(list: SessionListState): SessionId[] {
  return visibleSessionIds(list, [], 'show')
}

/**
 * Select visible flat-list members without deriving row presentation or ordering.
 * @param list - sessions list snapshot.
 * @param archivedSessionIds - registry-global archive set.
 * @param archivedFilter - archived-row visibility choice.
 * @returns known visible Session ids in list order, including ordinary forks and only the current blank.
 */
export function visibleSessionIds(
  list: SessionListState,
  archivedSessionIds: readonly SessionId[],
  archivedFilter: ArchivedFilter,
): SessionId[] {
  const archived = new Set(archivedSessionIds)
  const current = mainSessionId(list)
  return list.ids.filter((id) => {
    const s = list.byId[id]
    return s !== undefined && sessionVisible(s, current, archived, archivedFilter)
  })
}

/**
 * Derive flat rows from the browser's complete ordered Session ids, with
 * pinned rows fronted ahead of the supplied order.
 * @param list - sessions list snapshot used to select the ids.
 * @param sessionIds - complete account members in the selected order, including hidden archives.
 * @param rowState - registry-global pin and archive sets plus the archived filter.
 * @param statuses - unified UI status by Session.
 * @returns flat rows in sectioned order with current status indicators.
 */
export function deriveFlat(
  list: SessionListState,
  sessionIds: readonly SessionId[],
  rowState: SessionRowState,
  statuses: SessionStatuses,
): SessionNode[] {
  const archived = new Set(rowState.archivedSessionIds)
  const pinned = new Set(rowState.pinnedSessionIds)
  const current = mainSessionId(list)
  const members = sessionIds.flatMap((id) => {
    const session = list.byId[id]
    return session !== undefined && sessionVisible(session, current, archived, rowState.archivedFilter)
      ? [session]
      : []
  })
  return sectionMembers(members, pinned, archived)
    .map(session => sessionNode(session, list, statuses, pinned, archived))
}

/**
 * Merge immediate title/Workspace substring matches with ranked Host content
 * matches. Local rows lead newest-first, content-only rows retain backend
 * order, and duplicate sessions receive the backend snippet in place.
 * @param list - session metadata authority.
 * @param workspaces - Workspace membership and display labels.
 * @param query - caller text; surrounding whitespace is ignored.
 * @param archivedSessionIds - registry-global archive set (members match per the archived filter).
 * @param archivedFilter - archived-row visibility choice; search follows it.
 * @param statuses - unified UI status by Session.
 * @param content - ranked Host content-search page.
 * @param limit - protocol-owned maximum merged row count.
 * @returns bounded deduplicated flat rows and a refine-query hint bit.
 */
export function deriveSearchResults(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  query: string,
  archivedSessionIds: readonly SessionId[],
  archivedFilter: ArchivedFilter,
  statuses: SessionStatuses,
  content: { items: readonly SessionSearchResultItem[]; hasMore: boolean },
  limit: number,
): SearchResultSet {
  const q = query.trim().toLowerCase()
  if (q === '') return { items: [], hasMore: false }
  const archived = new Set(archivedSessionIds)
  const current = mainSessionId(list)

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
    if (summary === undefined || summary.blank || !sessionVisible(summary, current, archived, archivedFilter)) continue
    if (
      sessionTitle(summary).toLowerCase().includes(q)
      || labelOf(summary).toLowerCase().includes(q)
    ) {
      local.push(summary)
    }
  }
  const localById = new Map(local.map(summary => [summary.id, summary]))
  const orderedLocal = orderByRecency(local.map(summary => summary.id), list.byId)
    .map(id => localById.get(id) as SessionSummary)

  const ordered: SessionSummary[] = []
  const included = new Set<SessionId>()
  const include = (summary: SessionSummary): void => {
    if (included.has(summary.id)) return
    included.add(summary.id)
    ordered.push(summary)
  }
  for (const summary of orderedLocal) include(summary)
  for (const item of content.items) {
    const summary = list.byId[item.sessionId]
    if (summary !== undefined && !summary.blank && sessionVisible(summary, current, archived, archivedFilter)) include(summary)
  }

  return {
    items: ordered.slice(0, limit).map((summary) => {
      const match = contentBySession.get(summary.id)
      return {
        ...rowFacts(summary, list, statuses),
        id: summary.id,
        title: sessionTitle(summary),
        workspace: labelOf(summary),
        hasActiveSchedule: hasActiveSchedule(summary),
        archived: archived.has(summary.id),
        ...match === undefined ? {} : { snippet: match.snippet },
      }
    }),
    hasMore: content.hasMore || ordered.length > limit,
  }
}

/** Normalize separators for comparison without interpreting POSIX backslashes as separators. */
function folderPath(path: string): string {
  const windows = /^[A-Za-z]:[/\\]/.test(path) || path.startsWith('\\\\')
  return (windows ? path.replaceAll('\\', '/') : path).replace(/\/+$/, '')
}

/**
 * Find the nearest registered ancestor, excluding the Workspace directory itself.
 * Paths use Host spelling; matching is case-sensitive, like Workspace identity.
 * @param path - Workspace directory.
 * @param parents - registered Workspace directory paths.
 * @returns the owning parent path, or undefined when no parent contains the Workspace.
 */
export function owningParentFolder(path: string, parents: readonly string[]): string | undefined {
  const child = folderPath(path)
  let owner: string | undefined
  let length = -1
  for (const parent of parents) {
    const root = folderPath(parent)
    if (root.length > length && child !== root && child.startsWith(`${root}/`)) {
      owner = parent
      length = root.length
    }
  }
  return owner
}

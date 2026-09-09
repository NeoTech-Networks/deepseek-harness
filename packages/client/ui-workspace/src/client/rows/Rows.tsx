/**
 * Workspace browser tree row components (figma Cell set 14:3080): pure presentational —
 * all data and callbacks arrive via props. Hover swaps (folder->chevron,
 * time->ellipsis, action buttons) are CSS-only. Row ... menus are visual-only
 * except workspace Rename/Delete and session Rename/Fork/Archive; the session
 * and workspace hover cards are suppressed while a menu is open.
 */
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  HoverCard, IconAlarmClockOutline16, IconAgentPresetOutline16, IconArchiveOutline20,
  IconBranchOutline16, IconCheckOutline16, IconChecklistOutline14, IconClockOutline16,
  IconEditOutline16, IconEllipsisOutline16, IconFolderClose16, IconFolderOpen16,
  IconListPenOutline16, IconPauseOutline16, IconPlusOutline16, IconQuestionOutline14,
  IconRightUpOutline16, IconStopFill16, IconTrashOutline16, IconTriangleRightFill14,
  IconWarningOutline16, Menu, relativeTime, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { IconProps, StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  SessionStatusIconId, SessionStatusTone, SessionStatusValue,
} from '@deepseek-ai/dsh-session-status/client'
import { abbreviateHomePath } from '@deepseek-ai/dsh-util-workspace-path'
import type { WorkspaceBrowserProps } from '../contract/slots.ts'
import type {
  GroupNode, SearchResultNode, SessionNode, SessionPhase, SessionRowFacts,
} from '../tree.ts'
import css from './Rows.module.css'

/** The standard locale seat, prop-passed from the browser root. */
type RowTranslate = WorkspaceBrowserProps['t']

/** Row display title: blank rows show the localized New Session label. */
function displayTitle(node: SessionNode, t: RowTranslate): string {
  return node.blank ? t('session.new') : node.title
}

/** Localized compact relative time ("刚刚"/"5分钟" in zh, "now"/"5min" in en). */
function timeLabel(updatedAt: number, now: number, t: RowTranslate): string {
  const { unit, n } = relativeTime(updatedAt, now)
  return unit === 'now' ? t('time.now') : t(`time.${unit}`, { n })
}

/** Hover-card variant: distances wrap in the ago template; the now bucket stays bare (no "now ago"). */
function hoverTimeLabel(updatedAt: number, now: number, t: RowTranslate): string {
  const { unit, n } = relativeTime(updatedAt, now)
  return unit === 'now' ? t('time.now') : t('time.ago', { t: t(`time.${unit}`, { n }) })
}

/**
 * Absolute creation time through the dictionary's date template (the message
 * clock pattern): `toLocaleString` would follow the browser language, not the
 * app locale, and produce mixed-language text after a switch.
 */
function createdLabel(createdAt: number, t: RowTranslate): string {
  const d = new Date(createdAt)
  const pad2 = (v: number): string => String(v).padStart(2, '0')
  const date = t('date.ymd', { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() })
  return t('hover.created', { time: `${date} ${pad2(d.getHours())}:${pad2(d.getMinutes())}` })
}

/** Hover-card body: workspace title, display directory path, absolute creation time. */
function WorkspaceHoverContent({ label, cwd, createdAt, t }: {
  label: string
  cwd: string | undefined
  createdAt: number
  t: RowTranslate
}) {
  return (
    <div className={css.hoverContent}>
      <div className={css.hoverTitle}>{label}</div>
      <div className={css.hoverPath}>{cwd}</div>
      <div className={css.hoverTime}>{createdLabel(createdAt, t)}</div>
    </div>
  )
}

/**
 * Row drag wiring supplied by the tree owner. `drop` reports the half of the
 * row where the pointer released so the owner can resolve an insert anchor.
 */
export interface RowDragProps {
  /** Start dragging this row. */
  start: () => void
  /** A compatible row drag is in flight. */
  active: boolean
  /** Current marker on this row: insert line above, below, or none. */
  marker: 'before' | 'after' | null
  /** Report the hovered half while a compatible drag passes over this row. */
  hover: (half: 'before' | 'after') => void
  drop: (half: 'before' | 'after') => void
  end: () => void
}

/** Drag lifecycle owned by a workspace row; its enclosing group owns hit testing. */
interface WorkspaceRowDragProps {
  start: () => void
  end: () => void
}

/** Pointer-position half of a row (insert line above or below). */
function rowHalf(e: { clientY: number; currentTarget: HTMLElement }): 'before' | 'after' {
  const rect = e.currentTarget.getBoundingClientRect()
  return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

/**
 * Project (workspace) header row: folder + title;
 * hover reveals the chevron and create button, and dwelling on a real
 * Workspace shows its hover card (the ungrouped bucket has none).
 * `containsCurrent` arrives on the node (derivation fact, no renderer scan).
 * @param props.group - derived group node.
 * @param props.onToggle - expand/collapse the group.
 * @param props.onCreate - start a frontend Session inside this Workspace.
 * @param props.drag - optional workspace-row drag wiring.
 * @param props.home - host account home for POSIX hover-path abbreviation.
 * @param props.t - the browser root's locale seat.
 * @returns the row element.
 */
export function ProjectRowItem({ group, onToggle, onCreate, actions, drag, home, t }: {
  group: GroupNode
  onToggle: () => void
  onCreate: () => void
  /** Real-Workspace actions; absent for the ungrouped bucket (no menu shown). */
  actions?: { rename: () => void; setGroup: () => void; delete: () => void } | undefined
  /** Present only for real Workspace rows in the grouped view. */
  drag?: WorkspaceRowDragProps | undefined
  /** Host account home; POSIX home-rooted hover paths display as `~`. */
  home?: string | undefined
  t: RowTranslate
}) {
  const row = group
  // The ungrouped bucket has no workspace title: its label is dictionary copy.
  const label = row.workspaceId === undefined ? t('group.ungrouped') : row.label
  const active = group.expanded && group.containsCurrent
  const [menuOpen, setMenuOpen] = useState(false)
  const workspaceMenuItems = [
    { id: 'rename', label: t('rename'), icon: <IconEditOutline16 /> },
    { id: 'setGroup', label: t('group.set'), icon: <IconFolderOpen16 /> },
    { id: 'delete', label: t('delete.workspace'), icon: <IconTrashOutline16 />, danger: true },
  ]
  const ownRow = (
    <div
      className={clsx(css.projectRow, menuOpen && css.menuOpen)}
      role="treeitem"
      aria-expanded={row.expanded}
      onClick={onToggle}
      draggable={drag !== undefined}
      onDragStart={drag === undefined
        ? undefined
        : (e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', row.key)
          drag.start()
        }}
      onDragEnd={drag?.end}
    >
      <span className={clsx(css.slot, css.folder, active && css.folderActive)}>
        {row.expanded ? <IconFolderOpen16 /> : <IconFolderClose16 />}
      </span>
      <span className={clsx(css.slot, css.chevron)}>
        <IconTriangleRightFill14 className={clsx(css.arrow, row.expanded && css.arrowOpen)} />
      </span>
      <span className={css.projectText}>
        <span className={css.title}>{label}</span>
      </span>
      <span className={css.rowActions}>
        {actions !== undefined && (
          <Menu
            open={menuOpen}
            onClose={() => { setMenuOpen(false) }}
            items={workspaceMenuItems}
            onSelect={(id) => {
              setMenuOpen(false)
              // Unknown ids leave before the dispatch: a future menu row must
              // not inherit the destructive branch as an else fallback.
              /* v8 ignore next -- Menu can emit only the rename, set-group, and delete rows supplied above. */
              if (id !== 'rename' && id !== 'setGroup' && id !== 'delete') return
              if (id === 'rename') actions.rename()
              else if (id === 'setGroup') actions.setGroup()
              else actions.delete()
            }}
            portal
            closeOnPointerLeave
            anchor={(
              <button
                type="button"
                className={css.iconButton}
                aria-label={t('actions.workspace.aria', { name: label })}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
              >
                <IconEllipsisOutline16 />
              </button>
            )}
          />
        )}
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('actions.newSession.aria', { name: label })}
          onClick={(e) => { e.stopPropagation(); onCreate() }}
        >
          <IconPlusOutline16 />
        </button>
      </span>
    </div>
  )
  // The ungrouped bucket has no backing Workspace: no card to show.
  if (row.createdAt === undefined) return ownRow
  return (
    <HoverCard
      anchor={ownRow}
      content={<WorkspaceHoverContent
        label={row.label}
        cwd={row.cwd === undefined ? undefined : abbreviateHomePath(row.cwd, home)}
        createdAt={row.createdAt}
        t={t}
      />}
      disabled={menuOpen}
      copyText={row.cwd}
      copyLabel={t('copy')}
      copiedLabel={t('hover.copied')}
    />
  )
}

interface SessionStatus {
  state: StateDotState
  label: string
}

/** Map a status tone to the state-dot colour used in the hover card. */
function toneState(tone: SessionStatusTone): StateDotState {
  switch (tone) {
    case 'attention': return 'warning'
    case 'error': return 'error'
    case 'success': return 'done'
    case 'neutral': return 'idle'
  }
}

/**
 * Every live status a row carries, ordered by the same precedence
 * `derivePhase` applies — so the first entry always describes the row's phase
 * and the rest are the secondary facts the hover card lists. A row with no
 * live status falls back to the finished-but-unopened reminder or idle.
 */
export function sessionStatuses(node: SessionRowFacts, t: RowTranslate): readonly [SessionStatus, ...SessionStatus[]] {
  const active: SessionStatus[] = []
  if (node.pendingInteraction === 'approval') active.push({ state: 'warning', label: t('status.waitingApproval') })
  if (node.pendingInteraction === 'plan-review') active.push({ state: 'warning', label: t('status.planReview') })
  if (node.pendingInteraction === 'question') active.push({ state: 'warning', label: t('status.waitingAnswer') })
  if (node.planActive) active.push({ state: 'warning', label: t('status.planning') })
  if (node.running) active.push({ state: 'ongoing', label: t('status.running') })
  if (node.runningSubagentCount > 0) {
    active.push({
      state: 'ongoing',
      label: t(
        node.runningSubagentCount === 1
          ? 'status.subagentsRunning.one'
          : 'status.subagentsRunning.other',
        { n: node.runningSubagentCount },
      ),
    })
  }
  // Last of the active facts, matching `derivePhase`: a declared status is
  // what an idle session says about why it is idle, so anything the session is
  // actually doing describes the row ahead of it. The status is never dropped
  // from this list, so the hover card still reports it while work is running.
  if (node.declaredStatus !== undefined) {
    active.push({ state: toneState(node.declaredStatus.tone), label: node.declaredStatus.label })
  }
  const settled: SessionStatus = {
    state: 'done',
    label: node.completed ? t('status.completed') : t('status.idle'),
  }
  const [primary = settled, ...rest] = active
  return [primary, ...rest]
}

/**
 * Phases the status slot names with a glyph instead of the state dot: the ones
 * a color alone cannot tell apart, because all three awaiting-* phases block
 * this operator and plan mode is a session mode rather than an outcome. Every
 * remaining phase keeps the dot, whose animation carries liveness.
 */
const PHASE_GLYPHS: Partial<Record<SessionPhase, (props: IconProps) => ReturnType<typeof IconWarningOutline16>>> = {
  'awaiting-approval': IconWarningOutline16,
  'awaiting-plan-review': IconChecklistOutline14,
  'awaiting-answer': IconQuestionOutline14,
  planning: IconListPenOutline16,
  subagents: IconAgentPresetOutline16,
}

/** Status icon id to glyph component, drawn for the declared phase. */
const STATUS_ICONS: Record<SessionStatusIconId, (props: IconProps) => ReturnType<typeof IconWarningOutline16>> = {
  'right-up': IconRightUpOutline16,
  stop: IconStopFill16,
  check: IconCheckOutline16,
  clock: IconClockOutline16,
  pause: IconPauseOutline16,
}

/** Neutral fallback for an icon id this client does not know (never throws). */
const UNKNOWN_STATUS_ICON = IconEllipsisOutline16

/**
 * Whether a glyph phase should carry the live treatment (pulse plus the
 * ongoing colour).
 *
 * Only the two phases whose glyph replaces a running indicator qualify. Plan
 * mode outranks `running`, so a working plan-mode session would otherwise show
 * the same still grey pen as an idle one, and that is the whole liveness
 * signal for the majority of sessions here. `subagents` is running by
 * definition, and used to render completely static.
 *
 * The awaiting-* phases deliberately stay still even though the agent is
 * technically running behind an open approval: they mean "you are blocking
 * me", and a blinking version of that is noise, not information.
 * @param phase - the row's winning phase.
 * @param running - whether this session's own agent is running.
 * @returns whether to mark the glyph live.
 */
function liveGlyph(phase: SessionPhase, running: boolean): boolean {
  if (phase === 'subagents') return true
  return phase === 'planning' && running
}

/**
 * The row's phase mark plus every status's screen-reader label, shared by the
 * search and session rows. The mark itself stays `aria-hidden` in both
 * branches: the labels below it are the accessible text. The declared phase
 * draws the status's own glyph with its tone colour instead of the phase
 * table, because the status vocabulary is deployment-owned.
 */
export function SessionStatusDots({ phase, statuses, declared, running }: {
  phase: SessionPhase
  statuses: readonly [SessionStatus, ...SessionStatus[]]
  declared: SessionStatusValue | undefined
  running: boolean
}) {
  if (phase === 'declared' && declared !== undefined) {
    const Glyph = STATUS_ICONS[declared.icon] ?? UNKNOWN_STATUS_ICON
    return (
      <>
        <span className={css.phaseIcon} data-tone={declared.tone} aria-hidden="true">
          <Glyph size={14} />
        </span>
        {statuses.map(status => (
          <span className={css.visuallyHidden} key={status.label}>{status.label}</span>
        ))}
      </>
    )
  }
  const Glyph = PHASE_GLYPHS[phase]
  return (
    <>
      {Glyph === undefined
        ? <StateDot state={statuses[0].state} />
        : (
          <span
            className={css.phaseIcon}
            data-phase={phase}
            data-active={liveGlyph(phase, running) ? 'true' : undefined}
            aria-hidden="true"
          >
            <Glyph size={14} />
          </span>
        )}
      {statuses.map(status => (
        <span className={css.visuallyHidden} key={status.label}>{status.label}</span>
      ))}
    </>
  )
}

/** Non-interactive active-Schedule marker; the enclosing row remains the only action. */
function ActiveScheduleIndicator({ t, search = false }: { t: RowTranslate; search?: boolean }) {
  const label = t('schedule.active')
  return (
    <span
      className={clsx(css.scheduleIndicator, search && css.searchScheduleIndicator)}
      role="img"
      aria-label={label}
      title={label}
    >
      <IconAlarmClockOutline16 />
    </span>
  )
}

/** Hover-card body: full title, relative time, and every relevant live status. */
function SessionHoverContent({ node, now, t }: { node: SessionNode; now: number; t: RowTranslate }) {
  const statuses = sessionStatuses(node, t)
  return (
    <div className={css.hoverContent}>
      <div className={css.hoverTitle}>{displayTitle(node, t)}</div>
      {/* Same placeholder rule as the row's trailing cell: no timestamp
          before the first prompt. */}
      {!node.blank && <div className={css.hoverTime}>{hoverTimeLabel(node.updatedAt, now, t)}</div>}
      {statuses.map(status => (
        <div className={css.hoverStatus} key={status.label}>
          <StateDot state={status.state} />
          <span>{status.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * One flat search result: title, Workspace context, and optional content
 * excerpt. Search navigation opens the session only; it does not address an
 * event inside the conversation.
 * @param props.result - merged local/content search row.
 * @param props.currentId - selected session id.
 * @param props.onOpen - open the selected session.
 * @param props.t - Workspace-browser translation seat.
 * @returns the result button.
 */
export function SearchResultItem({ result, currentId, onOpen, t }: {
  result: SearchResultNode
  currentId: string | undefined
  onOpen: (id: SearchResultNode['id']) => void
  t: RowTranslate
}) {
  const selected = result.id === currentId
  const statuses = sessionStatuses(result, t)
  return (
    <button
      type="button"
      className={clsx(css.searchResultRow, selected && css.selected)}
      role="treeitem"
      aria-selected={selected}
      onClick={() => { onOpen(result.id) }}
    >
      <span className={css.searchResultHeading}>
        <span className={css.slot}>
          {result.phase !== 'idle' && (
            <SessionStatusDots phase={result.phase} statuses={statuses} declared={result.declaredStatus} running={result.running} />
          )}
        </span>
        <span className={css.searchResultTitle}>{result.title}</span>
        {result.hasActiveSchedule && <ActiveScheduleIndicator t={t} search />}
      </span>
      <span className={css.searchResultMeta}>
        <span className={css.searchResultWorkspace}>{result.workspace || t('group.ungrouped')}</span>
        {result.snippet !== undefined && (
          <span className={css.searchResultSnippet}>{result.snippet}</span>
        )}
      </span>
    </button>
  )
}

/**
 * One top-level 34px session row: status dot (pending user interaction outranks
 * own or descendant activity), title, relative time, and the row actions menu.
 * @param props.node - derived session node.
 * @param props.currentId - selected session id (row highlight).
 * @param props.now - epoch ms for relative-time formatting.
 * @param props.onOpen - open a session by id.
 * @param props.onRename - open the session rename dialog (id + current title).
 * @param props.onFork - fork a session at its last completed turn.
 * @param props.onArchive - archive a session by id.
 * @param props.onReveal - scroll this row into view after search navigation, then acknowledge it.
 * @param props.drag - optional draggable-row wiring.
 * @param props.flat - omit the empty status slot in the hierarchy-free flat list.
 * @param props.t - the browser root's locale seat.
 * @returns the session row.
 */
export function SessionNodeItem({
  node, currentId, now, onOpen, onRename, onFork, onArchive, onSetStatus, onClearStatus, onReveal, drag, flat = false, t,
}: {
  node: SessionNode
  currentId: string | undefined
  now: number
  onOpen: (id: SessionNode['id']) => void
  /** Open the browser-owned session rename dialog (row menu action). */
  onRename: (id: SessionNode['id'], currentTitle: string) => void
  /** Fork a session at its last completed turn (row menu action). */
  onFork: (id: SessionNode['id']) => void
  /** Archive this session (row menu action; commits without a dialog). */
  onArchive: (id: SessionNode['id']) => void
  /** Open the browser-owned set-status dialog (row menu action). */
  onSetStatus?: ((id: SessionNode['id']) => void) | undefined
  /** Clear this session's declared status (row menu action; commits without a dialog). */
  onClearStatus?: ((id: SessionNode['id']) => void) | undefined
  /** Scroll this row into view after search navigation, then acknowledge it. */
  onReveal?: (() => void) | undefined
  /** Present only on draggable rows (workspace-group sessions outside search). */
  drag?: RowDragProps | undefined
  /** The row is rendered without a parent Workspace header. */
  flat?: boolean | undefined
  t: RowTranslate
}) {
  const row = node
  const title = displayTitle(node, t)
  const selected = node.id === currentId
  const statuses = sessionStatuses(node, t)
  const showStatus = node.phase !== 'idle'
  const [menuOpen, setMenuOpen] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (onReveal === undefined) return
    rowRef.current?.scrollIntoView({ block: 'nearest' })
    onReveal()
  }, [onReveal])
  // Archive hides the row through the registry-global archive set and never
  // touches the session log, so it is not styled as destructive and needs no
  // confirmation dialog.
  const sessionMenuItems = [
    { id: 'rename', label: t('rename'), icon: <IconEditOutline16 /> },
    { id: 'fork', label: t('menu.fork'), icon: <IconBranchOutline16 /> },
    ...(onSetStatus === undefined
      ? []
      : [{ id: 'setStatus', label: t('menu.setStatus'), icon: <IconPauseOutline16 /> }]),
    ...(onClearStatus !== undefined && node.declaredStatus !== undefined
      ? [{ id: 'clearStatus', label: t('menu.clearStatus'), icon: <IconStopFill16 /> }]
      : []),
    // 20-native glyph in the menu's 16px icon slot (Menu.module.css .itemIcon).
    { id: 'archive', label: t('menu.archiveSession'), icon: <IconArchiveOutline20 size={16} /> },
  ]
  // Figma session cell: pad 8, status slot 16, then a 4px title gap.
  const ownRow = (
    <div
      ref={rowRef}
      className={clsx(
        css.sessionRow, selected && css.selected, menuOpen && css.menuOpen,
        flat && !showStatus && css.flatSessionRowWithoutStatus,
        drag?.marker === 'before' && css.dropBefore, drag?.marker === 'after' && css.dropAfter,
      )}
      role="treeitem"
      aria-selected={selected}
      onClick={() => { onOpen(node.id) }}
      draggable={drag !== undefined}
      onDragStart={drag === undefined
        ? undefined
        : (e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', node.id)
          drag.start()
        }}
      onDragEnd={drag?.end}
      onDragOver={drag === undefined
        ? undefined
        : (e) => {
          if (!drag.active) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          drag.hover(rowHalf(e))
        }}
      onDrop={drag === undefined
        ? undefined
        : (e) => {
          if (!drag.active) return
          e.preventDefault()
          drag.drop(rowHalf(e))
        }}
    >
      {/* Pending interaction and own or descendant activity outrank the
          finished-but-unviewed reminder, which returns after activity stops
          and is cleared by opening the session. */}
      {(!flat || showStatus) && (
        <span className={css.slot}>
          {showStatus && <SessionStatusDots phase={node.phase} statuses={statuses} declared={node.declaredStatus} running={node.running} />}
        </span>
      )}
      <span className={css.title}>{title}</span>
      {row.hasActiveSchedule && <ActiveScheduleIndicator t={t} />}
      {/* A blank New Session row is a provisional placeholder: nothing has
          happened in it yet, so a "now" timestamp and the row verbs
          (rename/fork/archive) would all act on content that does not
          exist — both trailing cells stay off until the first prompt. */}
      {!row.blank && <span className={css.time}>{timeLabel(row.updatedAt, now, t)}</span>}
      {!row.blank && (
        <span className={css.rowActions}>
          <Menu
            open={menuOpen}
            onClose={() => { setMenuOpen(false) }}
            items={sessionMenuItems}
            onSelect={(id) => {
              setMenuOpen(false)
              if (id === 'rename') onRename(node.id, row.title)
              if (id === 'fork') onFork(node.id)
              if (id === 'setStatus' && onSetStatus !== undefined) onSetStatus(node.id)
              if (id === 'clearStatus' && onClearStatus !== undefined) onClearStatus(node.id)
              if (id === 'archive') onArchive(node.id)
            }}
            portal
            closeOnPointerLeave
            anchor={(
              <button
                type="button"
                className={css.iconButton}
                aria-label={t('actions.session.aria', { name: title })}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
              >
                <IconEllipsisOutline16 />
              </button>
            )}
          />
        </span>
      )}
    </div>
  )
  return (
    <HoverCard
      anchor={ownRow}
      content={<SessionHoverContent node={node} now={now} t={t} />}
      disabled={menuOpen || drag?.active === true}
      copyText={row.blank ? undefined : row.title}
      copyLabel={t('copy')}
      copiedLabel={t('hover.copied')}
    />
  )
}

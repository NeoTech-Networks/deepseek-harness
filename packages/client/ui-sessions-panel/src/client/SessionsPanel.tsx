/**
 * The sessions panel's body: a cross-workspace session list, active first.
 *
 * Two framework facts meet here: the session list and pending interactions
 * (`useSessions` / `useSessionPendingInteraction`) and the workspace roster
 * (`useWorkspaces`), all global standard hooks, plus the single injected `open`
 * action. The body owns only its own Active/All filter as local state; the
 * classification and ordering are the pure `deriveSessions` derivation. A row
 * opens its session through `open`; nothing here writes session state.
 */
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  IconAgentPresetOutline16, IconCheckOutline16, IconClockOutline16, IconEllipsisOutline16,
  IconListPenOutline16, IconPauseOutline16, IconRightUpOutline16, IconStopFill16,
  StateDot, relativeTime,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { IconProps, StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionStatusIconId, SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
// Type-only: the global `useSessions` / `useSessionPendingInteraction` hook merge.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
// Type-only: the global `useWorkspaces` hook merge.
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { deriveSessions, type SessionPanelPhase, type SessionPanelRow } from './active.ts'
import type { SessionsPanelInjected } from './contract/slots.ts'
import css from './SessionsPanel.module.css'

/** The panel's composed props: the tab seat's standard shares, the face, and copy. */
export type SessionsPanelProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & InjectFace<SessionsPanelInjected>
  & PropsLocale<'sessionsPanel'>

/** The Active/All filter, component-local (only this component reads it). */
type Filter = 'active' | 'all'

/**
 * The state-dot semantic for each phase; idle rows carry no dot, and the two
 * glyph phases below carry no dot either.
 */
function phaseDot(phase: SessionPanelPhase): StateDotState | undefined {
  switch (phase) {
    case 'awaiting':
      return 'warning'
    case 'running':
      return 'ongoing'
    case 'done':
      return 'done'
    case 'planning':
    case 'subagents':
    case 'declared':
    case 'idle':
      return undefined
  }
}

/**
 * Phases this panel names with a glyph instead of a dot, matching the
 * workspace sidebar. Plan mode is a session MODE, not an outcome, and running
 * descendants are not the same thing as this session running: an amber dot for
 * the first and the plain ongoing dot for the second (what this panel used to
 * draw) told the operator neither fact.
 */
const PHASE_GLYPHS: Partial<Record<SessionPanelPhase, (props: IconProps) => ReactNode>> = {
  planning: IconListPenOutline16,
  subagents: IconAgentPresetOutline16,
}

/** Status icon id to glyph, matching the workspace sidebar's table. */
const STATUS_ICONS: Record<SessionStatusIconId, (props: IconProps) => ReactNode> = {
  'right-up': IconRightUpOutline16,
  stop: IconStopFill16,
  check: IconCheckOutline16,
  clock: IconClockOutline16,
  pause: IconPauseOutline16,
}

/** Neutral fallback for an icon id this client does not know (never throws). */
const UNKNOWN_STATUS_ICON = IconEllipsisOutline16

/** The mark one row draws: a declared glyph, a phase glyph, or a state dot. */
function RowMark({ phase, declared }: {
  phase: SessionPanelPhase
  declared: SessionStatusValue | undefined
}): ReactNode {
  if (phase === 'declared' && declared !== undefined) {
    const Glyph = STATUS_ICONS[declared.icon] ?? UNKNOWN_STATUS_ICON
    return <span className={css.glyph} data-tone={declared.tone}><Glyph size={12} /></span>
  }
  const Glyph = PHASE_GLYPHS[phase]
  if (Glyph !== undefined) {
    // `subagents` is running by definition; plan mode is live only while the
    // session's own turn runs, which this coarser phase cannot see (plan mode
    // outranks running here too), so it stays still rather than lying.
    return (
      <span className={css.glyph} data-phase={phase} data-active={phase === 'subagents' ? 'true' : undefined}>
        <Glyph size={12} />
      </span>
    )
  }
  const dot = phaseDot(phase)
  return dot === undefined ? null : <StateDot state={dot} />
}

/** Localized compact relative time, the same bucket words the workspace browser uses. */
function timeLabel(updatedAt: number, now: number, t: SessionsPanelProps['t']): string {
  const { unit, n } = relativeTime(updatedAt, now)
  return unit === 'now' ? t('time.now') : t(`time.${unit}`, { n })
}

/**
 * The sessions type's body, registered under `sidebar.right.pane.tab` as `sessions`.
 * @param props - composed slot props.
 * @returns the filter header and the ordered session list.
 */
export function SessionsPanel({
  useSessions, useSessionPendingInteraction, useWorkspaces, open, t,
}: SessionsPanelProps): ReactNode {
  const [filter, setFilter] = useState<Filter>('active')
  const list = useSessions(s => s)
  const pendingInteractions = useSessionPendingInteraction(s => s)
  const workspaces = useWorkspaces(s => s)

  const workspaceBySession = useMemo(() => {
    const map = new Map<SessionId, string>()
    for (const workspace of workspaces.items) {
      for (const id of workspace.sessionIds) {
        if (!map.has(id)) map.set(id, workspace.title)
      }
    }
    return map
  }, [workspaces])

  const { active, idle } = useMemo(
    () => deriveSessions(list, workspaces.archivedSessionIds, pendingInteractions),
    [list, workspaces.archivedSessionIds, pendingInteractions],
  )
  const rows = filter === 'active' ? active : [...active, ...idle]
  const now = Date.now()

  const renderRow = (row: SessionPanelRow): ReactNode => {
    const workspace = workspaceBySession.get(row.id)
    return (
      <button
        key={row.id}
        type="button"
        className={clsx(css.row, row.current && css.current)}
        aria-current={row.current || undefined}
        data-sessions-panel-row={row.id}
        onClick={() => { open(row.id) }}
      >
        <span className={css.status}>
          <RowMark phase={row.phase} declared={row.declaredStatus} />
        </span>
        <span className={css.body}>
          <span className={css.title}>{row.blank ? t('session.new') : row.title}</span>
          {workspace !== undefined && <span className={css.workspace}>{workspace}</span>}
        </span>
        {!row.blank && <span className={css.time}>{timeLabel(row.updatedAt, now, t)}</span>}
      </button>
    )
  }

  return (
    <div className={css.root} data-sessions-panel>
      <div className={css.toolbar}>
        <button
          type="button"
          className={clsx(css.filter, filter === 'active' && css.filterOn)}
          aria-pressed={filter === 'active'}
          data-sessions-panel-filter="active"
          onClick={() => { setFilter('active') }}
        >
          {t('filter.active')}
        </button>
        <button
          type="button"
          className={clsx(css.filter, filter === 'all' && css.filterOn)}
          aria-pressed={filter === 'all'}
          data-sessions-panel-filter="all"
          onClick={() => { setFilter('all') }}
        >
          {t('filter.all')}
        </button>
      </div>
      <div className={css.list} role="list" aria-label={t('aria.list')}>
        {rows.length === 0 && (
          <div className={css.empty}>{filter === 'active' ? t('empty.active') : t('empty.none')}</div>
        )}
        {rows.map(renderRow)}
      </div>
    </div>
  )
}

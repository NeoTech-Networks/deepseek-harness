/**
 * The sessions panel's body: a cross-workspace session list, active first.
 *
 * Two framework facts meet here: the session list and pending interactions
 * (`useSessions` / `useSessionStatus`) and the workspace roster
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
  IconAgentPresetOutlineRegular, IconEllipsisOutlineMedium, IconPauseOutlineRegular,
  IconStageAwaitingInputOutlineRegular, IconStageBlockedOutlineRegular, IconStageDeployingOutlineRegular,
  IconStageFailedOutlineRegular, IconStagePlanReadyOutlineRegular, IconStageSavedOutlineRegular,
  IconStageWorkingOutlineRegular, StateDot, relativeTime,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { IconProps, StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionStatusIconId, SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
// Type-only: the global `useSessions` / `useSessionStatus` hook merge.
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
 * workspace sidebar AND its new stage marks (Claude Design project "dsh icons",
 * 2026-09-19). Plan mode is a session MODE, not an outcome; running descendants
 * are not the same thing as this session running; and a session that is working
 * or blocked on the operator says more with a mark than with a dot that means
 * "busy".
 *
 * `subagents` keeps its own agent mark: the design covers eight session stages
 * and delegated work is not one of them.
 */
const PHASE_GLYPHS: Partial<Record<SessionPanelPhase, (props: IconProps) => ReactNode>> = {
  awaiting: IconStageAwaitingInputOutlineRegular,
  running: IconStageWorkingOutlineRegular,
  planning: IconStagePlanReadyOutlineRegular,
  subagents: IconAgentPresetOutlineRegular,
}

/**
 * Status icon id to glyph, the same table the workspace sidebar draws from.
 * Legacy ids stay valid and map to the nearest stage mark, because an icon id
 * rides a stored `session/status` event: dropping one would make an old row's
 * status undrawable.
 */
const STATUS_ICONS: Record<SessionStatusIconId, (props: IconProps) => ReactNode> = {
  'right-up': IconStageDeployingOutlineRegular,
  stop: IconStageBlockedOutlineRegular,
  check: IconStageSavedOutlineRegular,
  clock: IconStageAwaitingInputOutlineRegular,
  pause: IconPauseOutlineRegular,
  deploying: IconStageDeployingOutlineRegular,
  blocked: IconStageBlockedOutlineRegular,
  saved: IconStageSavedOutlineRegular,
  failed: IconStageFailedOutlineRegular,
}

/** Neutral fallback for an icon id this client does not know (never throws). */
const UNKNOWN_STATUS_ICON = IconEllipsisOutlineMedium

/** The mark one row draws: a declared glyph, a phase glyph, or a state dot. */
function RowMark({ phase, declared }: {
  phase: SessionPanelPhase
  declared: SessionStatusValue | undefined
}): ReactNode {
  if (phase === 'declared' && declared !== undefined) {
    const Glyph = (STATUS_ICONS as Partial<Record<string, (props: IconProps) => ReactNode>>)[declared.icon] ?? UNKNOWN_STATUS_ICON
    return <span className={css.glyph} data-tone={declared.tone}><Glyph size={12} /></span>
  }
  const Glyph = PHASE_GLYPHS[phase]
  if (Glyph !== undefined) {
    // A running turn and running descendants are live by definition. Plan mode
    // is live only while the session's own turn runs, which this coarser phase
    // cannot see (plan mode outranks running here too), so it stays still
    // rather than lying.
    const live = phase === 'subagents' || phase === 'running'
    return (
      <span className={css.glyph} data-phase={phase} data-active={live ? 'true' : undefined}>
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
  useSessions, useSessionStatus, useWorkspaces, open, t,
}: SessionsPanelProps): ReactNode {
  const [filter, setFilter] = useState<Filter>('active')
  const list = useSessions(s => s)
  const statuses = useSessionStatus(s => s)
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
    () => deriveSessions(list, workspaces.archivedSessionIds, statuses),
    [list, workspaces.archivedSessionIds, statuses],
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

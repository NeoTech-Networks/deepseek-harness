/**
 * The "All Sessions" quick-nav section filling the sidebar shell's
 * `sidebar.allSessions` hole: a collapsible header above the workspace
 * browser, and a flat newest-first list of every unarchived session. Each row
 * shows the session's live status mark, its title, and the Workspace it
 * belongs to; clicking a row opens that session. Wide-only: the collapsed
 * 56px rail already carries its own search/add icons, so this section renders
 * nothing there.
 */
import { Component, useMemo, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconTriangleRightFill14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { AllSessionsProps } from '../contract/slots.ts'
import { deriveAllSessions, type AllSessionNode } from '../tree.ts'
import { SessionStatusDots, sessionStatuses } from './Rows.tsx'
import css from './AllSessions.module.css'

/** One quick-nav row: status mark, title, and the owning Workspace label. */
function AllSessionRow({ node, currentId, onOpen, t }: {
  node: AllSessionNode
  currentId: string | undefined
  onOpen: (id: AllSessionNode['id']) => void
  t: AllSessionsProps['t']
}) {
  const statuses = sessionStatuses(node, t)
  const selected = node.id === currentId
  return (
    <button
      type="button"
      className={clsx(css.row, selected && css.selected)}
      role="treeitem"
      aria-selected={selected}
      onClick={() => { onOpen(node.id) }}
    >
      <span className={css.status}>
        {node.phase !== 'idle' && (
          <SessionStatusDots
            phase={node.phase}
            statuses={statuses}
            declared={node.declaredStatus}
            running={node.running}
          />
        )}
      </span>
      <span className={css.title}>{node.blank ? t('session.new') : node.title}</span>
      <span className={css.workspace}>{node.workspace || t('group.ungrouped')}</span>
    </button>
  )
}

/**
 * Section-scoped error boundary. An exception anywhere in the section's own
 * render (a store slice that is momentarily absent, a projection value the
 * client does not know) would otherwise be caught by the shared per-slot
 * boundary, which renders an empty div and logs one console line. Nothing
 * remounts that boundary until the entry's identity changes, so the section
 * stayed blank until the next app start. This keeps the failure visible, and
 * one retry re-reads the current snapshots, which is enough for a transient
 * cause.
 */
class AllSessionsBoundary extends Component<
  { t: AllSessionsProps['t']; children: ReactNode },
  { message: string | null }
> {
  override state: { message: string | null } = { message: null }

  static getDerivedStateFromError(error: unknown): { message: string } {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  override componentDidCatch(error: unknown): void {
    console.error('all sessions section crashed:', error)
  }

  override render(): ReactNode {
    if (this.state.message === null) return this.props.children
    return (
      <div className={css.crash} role="alert" data-all-sessions-error="">
        <div className={css.crashTitle}>{this.props.t('error.sectionCrashed')}</div>
        <div className={css.crashDetail}>{this.state.message}</div>
        <button
          type="button" className={css.crashRetry}
          onClick={() => { this.setState({ message: null }) }}
        >
          {this.props.t('error.sectionRetry')}
        </button>
      </div>
    )
  }
}

/**
 * Render the "All Sessions" quick-nav section, inside its own recovery
 * boundary so a crash in this section can never blank it silently.
 * @param props - composed slot props (shell owner share + fold store + injected open + locale).
 * @returns the section element tree, or the section's recovery row.
 */
export function AllSessionsSection(props: AllSessionsProps) {
  return (
    <AllSessionsBoundary t={props.t}>
      <AllSessionsInner {...props} />
    </AllSessionsBoundary>
  )
}

/**
 * Render the "All Sessions" quick-nav section.
 * @param props - composed slot props (shell owner share + fold store + injected open + locale).
 * @returns the section element tree, or null on the collapsed rail.
 */
function AllSessionsInner({
  wide,
  useSessions,
  useWorkspaces,
  useSessionPendingInteraction,
  open,
  useStore,
  actions,
  t,
}: AllSessionsProps) {
  const list = useSessions(s => s)
  const workspaces = useWorkspaces(s => s.items)
  const archivedSessionIds = useWorkspaces(s => s.archivedSessionIds)
  const pendingInteractions = useSessionPendingInteraction(s => s)
  const expanded = useStore(s => s.expanded)

  // Wide-only: the rail has no room for a second list and keeps its own icons.
  if (!wide) return null

  const rows = useMemo(
    () => deriveAllSessions(list, workspaces, archivedSessionIds, pendingInteractions),
    [list, workspaces, archivedSessionIds, pendingInteractions],
  )

  return (
    <div className={css.root}>
      <button
        type="button"
        className={css.header}
        aria-expanded={expanded}
        aria-label={t('allSessions.toggle')}
        onClick={() => { actions.setExpanded(!expanded) }}
      >
        <IconTriangleRightFill14 className={clsx(css.chevron, expanded && css.chevronOpen)} />
        <span className={css.label}>{t('section.allSessions')}</span>
      </button>
      {expanded && (
        <div className={css.list} role="tree" aria-label={t('section.allSessions')}>
          {rows.length === 0 && (
            <div className={css.empty}>{t('empty.none')}</div>
          )}
          {rows.map(node => (
            <AllSessionRow
              key={node.id}
              node={node}
              currentId={list.current}
              onOpen={open}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

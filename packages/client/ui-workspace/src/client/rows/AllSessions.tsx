/**
 * The "All Sessions" quick-nav section (fork) filling the sidebar shell's
 * `sidebar.allSessions` hole: a collapsible header above the workspace
 * browser, and a flat newest-first list of every unarchived session (pinned
 * first). Each row shows the session's live status mark, its title, and the
 * Workspace it belongs to; clicking a row opens that session. Sessions the
 * bots own trail the list in their own collapsible "Bot Sessions" group,
 * derived from the same live snapshot so a new bot chat joins it by itself.
 * A session is a bot session when its Workspace is ds-bot's, or when ds-bot
 * published its id: the bots work in ordinary project folders the operator
 * also works in, so the folder alone does not answer it.
 * Wide-only: the collapsed rail keeps its own search/add icons, so the section
 * renders nothing there.
 */
import { Component, useMemo, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconTriangleRightFillRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { AllSessionsProps } from '../contract/slots.ts'
import { deriveAllSessions, type AllSessionNode } from '../tree.ts'
import { useBotSessionIds } from '../bot-sessions.ts'
import { SessionMark } from './Rows.tsx'
import css from './AllSessions.module.css'

/** One quick-nav row: status mark, title, and the owning Workspace label. */
function AllSessionRow({ node, currentId, onOpen, t }: {
  node: AllSessionNode
  currentId: string | undefined
  onOpen: (id: AllSessionNode['id']) => void
  t: AllSessionsProps['t']
}) {
  const selected = node.id === currentId
  return (
    <button
      type="button"
      className={clsx(css.row, selected && css.selected)}
      role="treeitem"
      aria-selected={selected}
      data-all-sessions-row={node.id}
      onClick={() => { onOpen(node.id) }}
    >
      <span className={css.status}>
        <SessionMark node={node} t={t} />
      </span>
      <span className={css.title}>{node.blank ? t('session.new') : node.title || t('session.untitled')}</span>
      <span className={css.workspace}>{node.workspace === '' ? t('group.ungrouped') : node.workspace}</span>
    </button>
  )
}

/**
 * Section-scoped error boundary. An exception in the section's own render
 * would otherwise be caught by the shared per-slot boundary, which renders an
 * empty div until the entry's identity changes (in practice, the next app
 * start). This keeps the failure visible, and one retry re-reads the current
 * snapshots, which is enough for a transient cause.
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
          type="button"
          className={css.crashRetry}
          onClick={() => { this.setState({ message: null }) }}
        >
          {this.props.t('error.sectionRetry')}
        </button>
      </div>
    )
  }
}

/**
 * Render the "All Sessions" quick-nav section inside its own recovery
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
 * Render the section. Every hook runs before the rail early-return: the fork
 * called `useMemo` after it, so toggling rail/wide changed the hook count and
 * crashed the section (the class of failure the boundary above exists for).
 * @param props - composed slot props.
 * @returns the section element tree, or null on the collapsed rail.
 */
function AllSessionsInner({
  wide, useSessions, useWorkspaces, useSessionStatus, usePanelInfo, open, useStore, actions, t,
}: AllSessionsProps) {
  const list = useSessions(s => s)
  const workspaces = useWorkspaces(s => s.items)
  const archivedSessionIds = useWorkspaces(s => s.archivedSessionIds)
  const pinnedSessionIds = useWorkspaces(s => s.pinnedSessionIds)
  const statuses = useSessionStatus(s => s)
  const panelActive = usePanelInfo(info => info.activePanelId !== null)
  const expanded = useStore(s => s.expanded)
  const botExpanded = useStore(s => s.botExpanded) === true
  // ds-bot publishes the sessions it owns: they work in ordinary project
  // folders, so the Workspace rule alone cannot find them.
  const botSessionIds = useBotSessionIds()
  const rows = useMemo(
    () => deriveAllSessions(list, workspaces, { archivedSessionIds, pinnedSessionIds }, statuses, botSessionIds),
    [list, workspaces, archivedSessionIds, pinnedSessionIds, statuses, botSessionIds],
  )

  // Wide-only: the rail has no room for a second list and keeps its own icons.
  if (!wide) return null

  const currentId = panelActive
    ? undefined
    : Object.values(list.byId).find(session => (session.retainedBy.mainView ?? 0) > 0)?.id
  // The bot rows are derived from the same live snapshot as the ordinary ones,
  // so a session ds-bot starts owning joins the group on its next render with
  // nothing to tag, move or cache.
  const ordinaryRows = rows.filter(node => !node.bot)
  const botRows = rows.filter(node => node.bot)
  return (
    <div className={clsx(css.root, expanded && css.rootOpen)} data-all-sessions="">
      <button
        type="button"
        className={css.header}
        aria-expanded={expanded}
        aria-label={t('allSessions.toggle')}
        onClick={() => { actions.setExpanded(!expanded) }}
      >
        <IconTriangleRightFillRegular className={clsx(css.chevron, expanded && css.chevronOpen)} />
        <span className={css.label}>{t('section.allSessions')}</span>
      </button>
      {expanded && (
        <div className={css.list} role="tree" aria-label={t('section.allSessions')}>
          {rows.length === 0 && <div className={css.empty}>{t('empty.none')}</div>}
          {ordinaryRows.map(node => (
            <AllSessionRow key={node.id} node={node} currentId={currentId} onOpen={open} t={t} />
          ))}
          {/* Trails the ordinary rows inside the one scrolling list, so the
              group can never become a second scroll container. No bot rows
              means no header and no placeholder. */}
          {botRows.length > 0 && (
            <div className={css.group} data-all-sessions-bot-group="">
              <button
                type="button"
                className={css.groupHeader}
                aria-expanded={botExpanded}
                aria-label={t('allSessions.botToggle')}
                onClick={() => { actions.setBotExpanded(!botExpanded) }}
              >
                <IconTriangleRightFillRegular className={clsx(css.chevron, botExpanded && css.chevronOpen)} />
                <span className={css.groupLabel}>{t('allSessions.botSessions')}</span>
              </button>
              {botExpanded && (
                <div className={css.groupRows} role="tree" aria-label={t('allSessions.botSessions')}>
                  {botRows.map(node => (
                    <AllSessionRow key={node.id} node={node} currentId={currentId} onOpen={open} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

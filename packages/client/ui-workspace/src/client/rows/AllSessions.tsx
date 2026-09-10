/**
 * The "All Sessions" quick-nav section filling the sidebar shell's
 * `sidebar.allSessions` hole: a collapsible header above the workspace
 * browser, and a flat newest-first list of every unarchived session. Each row
 * shows the session's live status mark, its title, and the Workspace it
 * belongs to; clicking a row opens that session. Wide-only: the collapsed
 * 56px rail already carries its own search/add icons, so this section renders
 * nothing there.
 */
import { useMemo } from 'react'
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
 * Render the "All Sessions" quick-nav section.
 * @param props - composed slot props (shell owner share + fold store + injected open + locale).
 * @returns the section element tree, or null on the collapsed rail.
 */
export function AllSessionsSection({
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

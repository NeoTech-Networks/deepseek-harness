/**
 * The file tree's body: the session's workspace root, listed one level at a time.
 *
 * Everything the tree keeps lives in its store, keyed by tab; everything it asks
 * for goes through its injected face. The component itself only decides what to
 * draw for each absolute path and what a click means: a directory toggles, a
 * file opens through the owner's `tabActions` for a `file:` viewer to claim, and
 * anything else is shown but refuses to open. The header uses the shared
 * PathLabel for the root, followed by reload for the expanded directories.
 *
 * A right-click on a directory row, or on the root header, opens a small menu
 * with two "new session" gestures: adopt this one directory, or adopt every
 * immediate sub-directory (picked in a dialog, optionally under one group
 * label). The injected face performs the Workspace work; the body only draws
 * the menu, the dialog and the one-line outcome. The menu is not offered when
 * the Client has no Workspace services.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime, PropsStore, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  FileTypeIcon, IconFolderCloseRegular, IconFolderOpenRegular, IconRefreshOutlineRegular, classifyFileType,
  IconPauseOutlineRegular, IconPlayOutlineRegular, PathLabel,
  Button, Input, Menu, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import { fileAddressFor } from '@deepseek-ai/dsh-util-workspace-path'
import type { WorkspaceDirectoryEntry } from '@deepseek-ai/dsh-api-workspace-files/types'
import { childPath } from './face.ts'
import type { FilesInjected, SubDirectoryCandidate } from './face.ts'
import type {} from './locales.ts'
import type { FilesTabState, createFilesStore } from './store.ts'
import css from './FilesBody.module.css'

/** The body's composed props: the tab it draws, its store, its face, and its copy. */
export type FilesBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsStore<ReturnType<typeof createFilesStore>>
  & FilesInjected
  & PropsLocale<'sidebarFiles'>

/** Menu entry ids for the two "new session" gestures. */
const MENU_NEW_SESSION_HERE = 'new-session-here'
const MENU_NEW_SESSION_EACH = 'new-session-each'

/** Natural, case-insensitive name order, so `file2` precedes `file10`. */
const byName = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Order one level's entries for display: directories first, then everything
 * else, each group by name. The endpoint's order is a listing fact; this is the
 * reader's.
 * @param entries - the listing as the endpoint returned it.
 * @returns a new array, directories first, then by name within each group.
 */
export function orderEntries(entries: readonly WorkspaceDirectoryEntry[]): WorkspaceDirectoryEntry[] {
  return [...entries].sort((left, right) => {
    const group = Number(right.type === 'directory') - Number(left.type === 'directory')
    return group !== 0 ? group : byName.compare(left.name, right.name)
  })
}

/**
 * Say why a directory could not be listed, in terms of the directory.
 * @param t - namespace-bound translate.
 * @param failure - the settled Remote failure.
 * @returns the line to show under the directory.
 */
export function failureLine(t: TranslateNS<'sidebarFiles'>, failure: RemoteFailure): string {
  switch (failure.code) {
    case 'workspace-file/not-found': return t('error.notFound')
    case 'workspace-file/outside-workspace': return t('error.outsideWorkspace')
    case 'workspace-file/not-directory': return t('error.notDirectory')
    // Carrier and unclassified host failures reach the reader as themselves:
    // this tree knows nothing useful to add to a transport-level message.
    default: return t('error.unavailable', { message: failure.message })
  }
}

/** What every level shares: the tab's tree and the two gestures. */
interface TreeContext {
  readonly state: FilesTabState
  readonly onToggle: (parent: string, path: string) => void
  readonly onOpen: (path: string) => void
  /** Open the directory menu at the pointer, or undefined when no menu is offered. */
  readonly onDirectoryMenu: ((path: string, x: number, y: number) => void) | undefined
  readonly t: TranslateNS<'sidebarFiles'>
}

/** One entry's row, and its children when it is an expanded directory. */
function Entry({ parent, entry, tree }: { parent: string; entry: WorkspaceDirectoryEntry; tree: TreeContext }): ReactNode {
  const path = childPath(parent, entry.name)
  if (entry.type === 'directory') {
    const expanded = tree.state.expanded.includes(path)
    return (
      <li className={css.item} data-files-entry="directory" data-files-path={path}>
        <button
          type="button"
          className={css.row}
          aria-expanded={expanded}
          onClick={() => { tree.onToggle(parent, path) }}
          onContextMenu={tree.onDirectoryMenu === undefined ? undefined : (event) => {
            event.preventDefault()
            tree.onDirectoryMenu?.(path, event.clientX, event.clientY)
          }}
        >
          {expanded ? <IconFolderOpenRegular className={css.icon} /> : <IconFolderCloseRegular className={css.icon} />}
          <span className={css.name}>{entry.name}</span>
        </button>
        {expanded && <ul className={css.level}><Level path={path} tree={tree} /></ul>}
      </li>
    )
  }
  if (entry.type === 'file') {
    return (
      <li className={css.item} data-files-entry="file" data-files-path={path}>
        <button type="button" className={css.row} onClick={() => { tree.onOpen(path) }}>
          <FileTypeIcon kind={classifyFileType(entry.name)} size={16} className={css.fileIcon} />
          <span className={css.name}>{entry.name}</span>
        </button>
      </li>
    )
  }
  return (
    <li className={css.item} data-files-entry="other" data-files-path={path}>
      <span className={clsx(css.row, css.other)} aria-disabled="true" title={tree.t('entry.other')}>
        <span className={css.name}>{entry.name}</span>
      </span>
    </li>
  )
}

/** One directory's rows: its state while listing, its entries once listed. */
function Level({ path, tree }: { path: string; tree: TreeContext }): ReactNode {
  const { state, t } = tree
  const level = state.levels[path]
  if (level === undefined || level.kind === 'loading') {
    return <li className={css.note} data-files-row="loading">{t('loading')}</li>
  }
  if (level.kind === 'failed') {
    return (
      <li className={css.note} data-files-row="failed" data-files-code={level.failure.code}>
        {failureLine(t, level.failure)}
      </li>
    )
  }
  const entries = orderEntries(level.level.entries)
  return (
    <>
      {level.failure !== undefined && <li className={css.note} data-files-row="failed">{failureLine(t, level.failure)}</li>}
      {entries.length === 0 && <li className={css.note} data-files-row="empty">{t('empty')}</li>}
      {entries.map(entry => <Entry key={entry.name} parent={path} entry={entry} tree={tree} />)}
      {level.level.truncated && <li className={css.note} data-files-row="truncated">{t('truncated')}</li>}
    </>
  )
}

/**
 * A zero-size rectangle at the pointer, for placing the directory menu.
 * @param x - viewport x.
 * @param y - viewport y.
 * @returns the anchor rectangle.
 */
function pointRect(x: number, y: number): DOMRect {
  return { x, y, left: x, top: y, right: x, bottom: y, width: 0, height: 0, toJSON: () => ({}) }
}

/** The bulk dialog's draft: the folder being split, its sub-folders, and what is ticked. */
interface BulkDraft {
  readonly path: string
  readonly candidates: readonly SubDirectoryCandidate[]
  readonly selected: readonly string[]
  readonly group: string
  readonly listing: boolean
}

/** The file tree's body: the workspace root and whatever the reader has opened under it. */
export function FilesBody({
  useTabInfo, sessionId, useSessions, useStore, actions, start, refresh, setAutoRefresh, toggle, t,
  canOpenSessions, canGroup, openDirectory, listDirectories, openSubDirectories, inheritedGroup,
}: FilesBodyProps): ReactNode {
  const { tab } = useTabInfo()
  const { signal, actions: tabActions } = tab
  const cwd = useSessions(sessions => sessions.byId[sessionId]?.cwd)
  const state = useStore(store => store.byTab[tab.id])
  const bodyRef = useRef<HTMLDivElement>(null)
  const scrollTopRef = useRef(0)
  // Come back where the reader was: loaded levels outlive the body in the
  // store, so a remounted tree lays out at its full height before this runs
  // and the stored offset re-lands exactly. A fresh tree stores 0.
  const seeded = state !== undefined
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (seeded && body !== null) {
      body.scrollTop = state.scrollTop
      scrollTopRef.current = body.scrollTop
    }
  }, [seeded])
  // Scrolling only moves the ref; the store hears about it once, on unmount,
  // so a scroll neither re-renders the tree nor writes after the owner's
  // abort has forgotten the bucket.
  useEffect(() => () => {
    if (seeded && !signal.aborted) actions.scrolled(tab.id, scrollTopRef.current)
  }, [seeded, signal, tab.id, actions])
  useEffect(() => {
    // A bucket gone because the record aborted must not be re-seeded by a
    // component that has not unmounted yet.
    if (state !== undefined || cwd === undefined || signal.aborted) return
    start(tab.id, cwd, signal)
  }, [state, cwd, tab.id, signal, start])
  const [menu, setMenu] = useState<{ readonly path: string; readonly x: number; readonly y: number } | null>(null)
  const [bulk, setBulk] = useState<BulkDraft | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [outcome, setOutcome] = useState<string | null>(null)
  const openMenu = useCallback((path: string, x: number, y: number): void => {
    setMenu({ path, x, y })
  }, [])
  const prepareBulk = useCallback((path: string): void => {
    setOutcome(null)
    setBulk({ path, candidates: [], selected: [], group: inheritedGroup(), listing: true })
    listDirectories(path).then(
      (candidates) => {
        setBulk(draft => draft?.path !== path ? draft : {
          ...draft, candidates, selected: candidates.map(candidate => candidate.path), listing: false,
        })
      },
      (reason: unknown) => {
        setBulk(null)
        setOutcome(reason instanceof Error ? reason.message : String(reason))
      },
    )
  }, [inheritedGroup, listDirectories])

  if (cwd === undefined) {
    return (
      <div className={css.status} data-files-state="no-workspace">
        <p className={css.statusLine}>{t('noWorkspace')}</p>
      </div>
    )
  }
  if (state === undefined) return null
  const tree: TreeContext = {
    state,
    onToggle: (parent, path) => { toggle(tab.id, parent, path, state.expanded, signal) },
    // Every row is under the tree's root, so its address is session-relative.
    onOpen: (path) => { tabActions.openResource(fileAddressFor(sessionId, state.root, path)) },
    onDirectoryMenu: canOpenSessions() ? openMenu : undefined,
    t,
  }
  const menuItems: readonly MenuEntry[] = [
    { id: MENU_NEW_SESSION_HERE, label: t('menu.newSessionHere') },
    { id: MENU_NEW_SESSION_EACH, label: t('menu.newSessionEach') },
  ]
  const onMenuSelect = (id: string): void => {
    const target = menu?.path
    setMenu(null)
    /* v8 ignore next -- the menu only selects while open, so its path is present. */
    if (target === undefined) return
    if (id === MENU_NEW_SESSION_HERE) openDirectory(target)
    else if (id === MENU_NEW_SESSION_EACH) prepareBulk(target)
  }
  const closeBulk = (): void => { setBulk(null) }
  const confirmBulk = (): void => {
    /* v8 ignore next -- the open button is disabled while nothing is selected. */
    if (bulk === null || bulk.selected.length === 0) return
    setBulkBusy(true)
    const group = canGroup() ? bulk.group.trim() : ''
    openSubDirectories(bulk.selected, group).then(
      (count) => {
        setBulkBusy(false)
        setBulk(null)
        setOutcome(t('bulk.done', { count: String(count) }))
      },
      (reason: unknown) => {
        setBulkBusy(false)
        setOutcome(reason instanceof Error ? reason.message : String(reason))
      },
    )
  }
  const toggleSelected = (path: string): void => {
    if (bulk === null) return
    const selected = bulk.selected.includes(path)
      ? bulk.selected.filter(item => item !== path)
      : [...bulk.selected, path]
    setBulk({ ...bulk, selected })
  }
  const allSelected = bulk !== null && bulk.candidates.length > 0 && bulk.selected.length === bulk.candidates.length
  const reload = (): void => {
    refresh(tab.id)
  }
  return (
    <div className={css.root} data-files-state="tree" data-files-root={state.root}>
      <div
        className={css.header}
        onContextMenu={tree.onDirectoryMenu === undefined ? undefined : (event) => {
          event.preventDefault()
          openMenu(state.root, event.clientX, event.clientY)
        }}
      >
        <PathLabel path={state.root} className={css.path} data-files-path />
        <span hidden>
          <button type="button" className={css.tool} aria-label={t('autoRefresh')}
            aria-pressed={state.autoRefresh} data-files-auto-refresh
            title={t(state.autoRefresh ? 'autoRefresh.disable' : 'autoRefresh.enable')}
            onClick={() => { setAutoRefresh(tab.id, !state.autoRefresh) }}>
            {state.autoRefresh ? <IconPauseOutlineRegular /> : <IconPlayOutlineRegular />}
          </button>
        </span>
        <button
          type="button"
          className={css.tool}
          aria-label={t('reload')}
          title={t('reload')}
          data-files-reload
          onClick={reload}
        >
          <IconRefreshOutlineRegular />
        </button>
      </div>
      <div
        ref={bodyRef}
        className={css.body}
        data-files-body
        onScroll={(event) => { scrollTopRef.current = event.currentTarget.scrollTop }}
      >
        <ul className={css.level}><Level path={state.root} tree={tree} /></ul>
      </div>
      {outcome !== null && <div className={css.bulkOutcome} role="status" data-files-bulk-outcome>{outcome}</div>}
      <Menu
        open={menu !== null}
        anchor={<span className={css.menuAnchor} />}
        items={menuItems}
        onSelect={onMenuSelect}
        onClose={() => { setMenu(null) }}
        portal
        getAnchorRect={() => (menu === null ? null : pointRect(menu.x, menu.y))}
      />
      <Modal
        open={bulk !== null}
        onClose={closeBulk}
        title={t('bulk.title')}
        closeLabel={t('bulk.close')}
        description={t('bulk.description')}
        footer={(
          <div className={css.bulkFooter}>
            <Button variant="ghost" onClick={closeBulk}>{t('bulk.cancel')}</Button>
            <Button variant="primary" disabled={bulk === null || bulk.selected.length === 0 || bulkBusy} onClick={confirmBulk}>
              {t('bulk.open')}
            </Button>
          </div>
        )}
      >
        {bulk !== null && (
          <div className={css.bulkBody} data-files-bulk={bulk.path}>
            {canGroup() && (
              <label className={css.bulkField}>
                <span className={css.bulkLabel}>{t('bulk.group')}</span>
                <Input value={bulk.group} onChange={(event) => { setBulk({ ...bulk, group: event.target.value }) }} />
              </label>
            )}
            {bulk.listing
              ? <p className={css.note}>{t('loading')}</p>
              : bulk.candidates.length === 0
                ? <p className={css.note}>{t('bulk.none')}</p>
                : (
                  <ul className={css.bulkList}>
                    <li>
                      <button
                        type="button"
                        className={css.bulkRow}
                        data-files-bulk-all
                        onClick={() => { setBulk({ ...bulk, selected: allSelected ? [] : bulk.candidates.map(item => item.path) }) }}
                      >
                        <input type="checkbox" readOnly tabIndex={-1} checked={allSelected} />
                        <span>{t('bulk.all')}</span>
                      </button>
                    </li>
                    {bulk.candidates.map(candidate => (
                      <li key={candidate.path}>
                        <button type="button" className={css.bulkRow} data-files-bulk-path={candidate.path} onClick={() => { toggleSelected(candidate.path) }}>
                          <input type="checkbox" readOnly tabIndex={-1} checked={bulk.selected.includes(candidate.path)} />
                          <span className={css.name}>{candidate.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
          </div>
        )}
      </Modal>
    </div>
  )
}

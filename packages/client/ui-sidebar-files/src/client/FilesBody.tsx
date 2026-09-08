/**
 * The file tree's body: the session's workspace root, listed one level at a time.
 *
 * Everything the tree keeps lives in its store, keyed by tab; everything it asks
 * for goes through its injected face. The component itself only decides what to
 * draw for each absolute path and what a click means: a directory toggles, a
 * file opens through the owner's `tabActions` for a `file:` viewer to claim, and
 * anything else is shown but refuses to open. The header row carries the one
 * control: reload, which drops every listed level and asks again for the
 * expanded ones.
 *
 * A right-click on a directory row (or on the root header) opens a small menu
 * with two "open in a session" gestures: adopt this one directory, or adopt
 * every immediate sub-directory under one group label. Both are fire-and-forget
 * from the tree's perspective; the injected face performs the create/group/open
 * and reports through the bulk dialog's result line.
 */
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime, PropsStore, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  Button, DocumentFileIcon, IconFolderClose16, IconFolderOpen16, IconRefreshOutline16,
  Input, Menu, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import { fileAddressFor, workspaceTitleOf } from '@deepseek-ai/dsh-util-workspace-path'
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

/** Natural, case-insensitive name order, so `file2` precedes `file10`. */
const byName = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** Menu entry ids for the two right-click gestures. */
const MENU_OPEN_HERE = 'open-here'
const MENU_OPEN_SUB = 'open-sub'

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

/** What every level shares: the tab's tree and its gestures. */
interface TreeContext {
  readonly state: FilesTabState
  readonly onToggle: (path: string) => void
  readonly onOpen: (path: string) => void
  readonly onContextMenu: (path: string, x: number, y: number) => void
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
          onClick={() => { tree.onToggle(path) }}
          onContextMenu={(event) => { event.preventDefault(); tree.onContextMenu(path, event.clientX, event.clientY) }}
        >
          {expanded ? <IconFolderOpen16 className={css.icon} /> : <IconFolderClose16 className={css.icon} />}
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
          <DocumentFileIcon className={css.fileIcon} />
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
      {entries.length === 0 && <li className={css.note} data-files-row="empty">{t('empty')}</li>}
      {entries.map(entry => <Entry key={entry.name} parent={path} entry={entry} tree={tree} />)}
      {level.level.truncated && <li className={css.note} data-files-row="truncated">{t('truncated')}</li>}
    </>
  )
}

/** The right-click menu's anchor: a cursor-sized rectangle the portal positions from. */
function pointRect(x: number, y: number): DOMRect {
  return { x, y, left: x, top: y, right: x, bottom: y, width: 0, height: 0 } as DOMRect
}

/** The bulk dialog's draft: the folder being split and what is ticked. */
interface BulkDraft {
  readonly path: string
  readonly candidates: readonly SubDirectoryCandidate[]
  readonly selected: readonly string[]
  readonly group: string
}

/** The file tree's body: the workspace root and whatever the reader has opened under it. */
export function FilesBody({
  useTabInfo, sessionId, useSessions, useStore, actions, start, load, toggle, t,
  openDirectory, listDirectories, openSubDirectories, inheritedGroup,
}: FilesBodyProps): ReactNode {
  const { tab } = useTabInfo()
  const { signal, actions: tabActions } = tab
  const cwd = useSessions(sessions => sessions.byId[sessionId]?.cwd)
  const state = useStore(store => store.byTab[tab.id])
  const [menu, setMenu] = useState<{ path: string; x: number; y: number } | null>(null)
  const [bulk, setBulk] = useState<BulkDraft | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  useEffect(() => {
    // A bucket gone because the record aborted must not be re-seeded by a
    // component that has not unmounted yet.
    if (state !== undefined || cwd === undefined || signal.aborted) return
    start(tab.id, cwd, signal)
  }, [state, cwd, tab.id, signal, start])

  const openContextMenu = useCallback((path: string, x: number, y: number): void => {
    setMenu({ path, x, y })
  }, [])

  const prepareBulk = useCallback((path: string): void => {
    setMenu(null)
    setBulkError(null)
    setBulk({ path, candidates: [], selected: [], group: inheritedGroup })
    listDirectories(path).then(
      (candidates) => {
        setBulk({ path, candidates, selected: candidates.map(candidate => candidate.path), group: inheritedGroup })
      },
      (reason: unknown) => {
        setBulk(null)
        setBulkError(reason instanceof Error ? reason.message : String(reason))
      },
    )
  }, [inheritedGroup, listDirectories])

  const closeMenu = useCallback((): void => { setMenu(null) }, [])

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
    onToggle: (path) => { toggle(tab.id, path, state.levels[path] !== undefined, signal) },
    // Every row is under the tree's root, so its address is session-relative.
    onOpen: (path) => { tabActions.openResource(fileAddressFor(sessionId, state.root, path)) },
    onContextMenu: openContextMenu,
    t,
  }
  // Reload drops every level and asks again for the expanded ones; a collapsed
  // level is fetched again the next time it opens.
  const reload = (): void => {
    actions.reset(tab.id)
    for (const path of state.expanded) load(tab.id, path, signal)
  }
  // A separator-only root has no final segment; the root itself is the label then.
  const title = workspaceTitleOf(state.root) || state.root
  const menuItems: readonly MenuEntry[] = [
    { id: MENU_OPEN_HERE, label: t('menu.newSessionHere') },
    { id: MENU_OPEN_SUB, label: t('menu.newSessionEach') },
  ]
  const menuAnchor = (
    <span className={css.menuAnchor} />
  )
  const onMenuSelect = (id: string): void => {
    const target = menu?.path
    closeMenu()
    /* v8 ignore next -- onSelect only fires while the menu is open, so its path is present. */
    if (target === undefined) return
    if (id === MENU_OPEN_HERE) openDirectory(target)
    else if (id === MENU_OPEN_SUB) prepareBulk(target)
  }

  const confirmBulk = (): void => {
    /* v8 ignore next -- the Open button is disabled whenever the draft is empty or unset. */
    if (bulk === null || bulk.selected.length === 0) return
    setBulkBusy(true)
    setBulkError(null)
    openSubDirectories(bulk.selected, bulk.group.trim()).then(
      (count) => {
        setBulkBusy(false)
        setBulk(null)
        setBulkError(t('bulk.done', { count: String(count) }))
      },
      (reason: unknown) => {
        setBulkBusy(false)
        setBulkError(reason instanceof Error ? reason.message : String(reason))
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

  return (
    <div className={css.root} data-files-state="tree" data-files-root={state.root}>
      <div
        className={css.header}
        onContextMenu={(event) => { event.preventDefault(); openContextMenu(state.root, event.clientX, event.clientY) }}
      >
        <IconFolderOpen16 className={css.icon} />
        <span className={css.name}>{title}</span>
        <button
          type="button"
          className={css.tool}
          aria-label={t('reload')}
          title={t('reload')}
          data-files-reload
          onClick={reload}
        >
          <IconRefreshOutline16 />
        </button>
      </div>
      <ul className={css.level}><Level path={state.root} tree={tree} /></ul>

      <Menu
        open={menu !== null}
        anchor={menuAnchor}
        items={menuItems}
        onSelect={onMenuSelect}
        onClose={closeMenu}
        portal
        getAnchorRect={() => (menu === null ? null : pointRect(menu.x, menu.y))}
      />

      <Modal
        open={bulk !== null}
        onClose={() => { setBulk(null); setBulkError(null) }}
        title={t('bulk.title')}
        closeLabel={t('bulk.close')}
        description={t('bulk.description')}
        footer={(
          <div className={css.bulkFooter}>
            <Button variant="ghost" onClick={() => { setBulk(null); setBulkError(null) }}>{t('bulk.cancel')}</Button>
            <Button variant="primary" disabled={bulk === null || bulk.selected.length === 0 || bulkBusy} onClick={confirmBulk}>
              {t('bulk.open')}
            </Button>
          </div>
        )}
      >
        {bulk === null ? null : (
          <div className={css.bulkBody}>
            <label className={css.bulkField}>
              <span className={css.bulkLabel}>{t('bulk.group')}</span>
              <Input
                value={bulk.group}
                onChange={(event) => { setBulk({ ...bulk, group: event.target.value }) }}
              />
            </label>
            {bulk.candidates.length === 0
              ? <p className={css.note}>{t('bulk.none')}</p>
              : (
                <ul className={css.level}>
                  <li className={css.bulkToggle}>
                    <button
                      type="button"
                      className={css.bulkRow}
                      onClick={() => {
                        const all = bulk.selected.length === bulk.candidates.length
                        setBulk({ ...bulk, selected: all ? [] : bulk.candidates.map(item => item.path) })
                      }}
                    >
                      <input type="checkbox" readOnly checked={bulk.selected.length === bulk.candidates.length} />
                      <span>{t('bulk.all')}</span>
                    </button>
                  </li>
                  {bulk.candidates.map(candidate => (
                    <li key={candidate.path}>
                      <button type="button" className={css.bulkRow} onClick={() => { toggleSelected(candidate.path) }}>
                        <input type="checkbox" readOnly checked={bulk.selected.includes(candidate.path)} />
                        <span className={css.name}>{candidate.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}
      </Modal>

      {bulkError !== null && <div className={css.bulkError} role="alert" data-files-bulk-error>{bulkError}</div>}
    </div>
  )
}

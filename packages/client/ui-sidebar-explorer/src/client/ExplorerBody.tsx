/**
 * What the explorer draws: the operator's pinned roots, each expandable into
 * the Host's own directories, and one row of controls for changing the list.
 *
 * The component owns no asynchrony. Every read and write goes through the
 * injected face, which writes the outcome into the store; the component reads
 * the store and draws it.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime, PropsStore, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  Button, DocumentFileIcon, IconFolderClose16, IconFolderOpen16, IconRefreshOutline16, Input,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PinnedEntry, PinnedRoot } from '@deepseek-ai/dsh-api-pinned-files/types'
import { EXPLORER_TEXT_KIND } from './definition.ts'
import type { ExplorerInjected } from './face.ts'
import type {} from './locales.ts'
import type { ExplorerTabState, LevelState, createExplorerStore } from './store.ts'
import css from './ExplorerBody.module.css'

/** The four shares the framework composes for this seat. */
export type ExplorerBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsStore<ReturnType<typeof createExplorerStore>>
  & ExplorerInjected
  & PropsLocale<'sidebarExplorer'>

/** Namespace-bound translate, as every helper below takes it. */
type T = TranslateNS<'sidebarExplorer'>

/** Directories first, then natural case-insensitive name order. */
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Order one level for display.
 * @param entries - the endpoint's entries, in its own order.
 * @returns directories first, each group by natural name.
 */
function orderEntries(entries: readonly PinnedEntry[]): readonly PinnedEntry[] {
  return [...entries].sort((left, right) => {
    if (left.type !== right.type) {
      if (left.type === 'directory') return -1
      if (right.type === 'directory') return 1
    }
    return COLLATOR.compare(left.name, right.name)
  })
}

/**
 * One line of operator-facing copy for a settled failure.
 * @param t - namespace-bound translate.
 * @param failure - the settled Remote failure.
 * @returns the line to draw.
 */
export function failureLine(t: T, failure: RemoteFailure): string {
  switch (failure.code) {
    case 'pinned-files/not-found': return t('error.notFound')
    case 'pinned-files/not-directory': return t('error.notDirectory')
    case 'pinned-files/not-absolute': return t('error.notAbsolute')
    case 'pinned-files/unreadable': return t('error.unreadable')
    case 'pinned-files/not-writable': return t('error.notWritable')
    case 'pinned-files/too-large': return t('error.tooLarge')
    case 'pinned-files/not-text': return t('error.notText')
    default: return t('error.unavailable', { message: failure.message })
  }
}

/** Everything one level of rows needs, threaded down instead of re-derived per row. */
interface TreeContext {
  readonly state: ExplorerTabState
  readonly onToggle: (path: string) => void
  readonly onOpen: (path: string) => void
  readonly t: T
}

/**
 * One directory level: its state, or its rows.
 * @param props - the listed directory's path, the tree context, and the indent depth.
 * @returns the level's nodes.
 */
function Level({ path, tree, depth }: { path: string; tree: TreeContext; depth: number }): ReactNode {
  const level: LevelState | undefined = tree.state.levels[path]
  const indent = { paddingLeft: `${8 + depth * 12}px` }
  if (level === undefined || level.kind === 'loading') return null
  if (level.kind === 'failed') {
    return <div className={css.failure} style={indent}>{failureLine(tree.t, level.failure)}</div>
  }
  if (level.level.entries.length === 0) {
    return <div className={css.note} style={indent}>{tree.t('level.empty')}</div>
  }
  return (
    <>
      {orderEntries(level.level.entries).map(entry => (
        <Entry key={entry.path} entry={entry} tree={tree} depth={depth} />
      ))}
      {level.level.truncated
        ? <div className={css.note} style={indent}>{tree.t('level.truncated')}</div>
        : null}
    </>
  )
}

/**
 * One row: a directory that toggles, a file that opens, or an unclickable other.
 * @param props - the entry, the tree context, and the parent's indent depth.
 * @returns the row and, for an open directory, the level under it.
 */
function Entry({ entry, tree, depth }: { entry: PinnedEntry; tree: TreeContext; depth: number }): ReactNode {
  const indent = { paddingLeft: `${8 + depth * 12}px` }
  if (entry.type === 'other') {
    return <div className={clsx(css.row, css.other)} style={indent}><span className={css.rowName}>{entry.name}</span></div>
  }
  if (entry.type === 'file') {
    return (
      <button type="button" className={css.row} style={indent} onClick={() => { tree.onOpen(entry.path) }}>
        <DocumentFileIcon />
        <span className={css.rowName}>{entry.name}</span>
      </button>
    )
  }
  const open = tree.state.expanded.includes(entry.path)
  return (
    <>
      <button type="button" className={css.row} style={indent} onClick={() => { tree.onToggle(entry.path) }}>
        {open ? <IconFolderOpen16 /> : <IconFolderClose16 />}
        <span className={css.rowName}>{entry.name}</span>
      </button>
      {open ? <Level path={entry.path} tree={tree} depth={depth + 1} /> : null}
    </>
  )
}

/**
 * One pinned root: its header row, its unpin control, and its level.
 * @param props - the root, the tree context, and the unpin callback.
 * @returns the root's nodes.
 */
function Root(
  { root, tree, onRemove }: { root: PinnedRoot; tree: TreeContext; onRemove: (path: string) => void },
): ReactNode {
  const open = tree.state.expanded.includes(root.path)
  return (
    <>
      <div className={css.rootRow}>
        <button type="button" className={css.row} title={root.path} onClick={() => { tree.onToggle(root.path) }}>
          {open ? <IconFolderOpen16 /> : <IconFolderClose16 />}
          <span className={css.rowName}>{root.label}</span>
          {root.available ? null : <span className={css.note}>{tree.t('roots.unavailable')}</span>}
        </button>
        <Button size="sm" variant="ghost" onClick={() => { onRemove(root.path) }}>{tree.t('roots.remove')}</Button>
      </div>
      {open ? <Level path={root.path} tree={tree} depth={1} /> : null}
    </>
  )
}

/**
 * The explorer tab's body.
 * @param props - the composed slot shares.
 * @returns the explorer.
 */
export function ExplorerBody({
  useTabInfo, useStore, start, refresh, load, toggle, addRoot, removeRoot, browse, t,
}: ExplorerBodyProps): ReactNode {
  const { tab } = useTabInfo()
  const { signal, actions: tabActions } = tab
  const state = useStore(store => store.byTab[tab.id])
  const roots = useStore(store => store.roots)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    // A bucket gone because the record aborted must not be re-seeded by a
    // component that has not unmounted yet.
    if (state !== undefined || signal.aborted) return
    start(tab.id, signal)
  }, [state, tab.id, signal, start])

  if (state === undefined) return null

  const tree: TreeContext = {
    state,
    onToggle: (path) => { toggle(tab.id, path, state.levels[path] !== undefined, signal) },
    onOpen: (path) => { tabActions.openTab(EXPLORER_TEXT_KIND, { params: { path } }) },
    t,
  }

  const submit = (): void => {
    const path = draft.trim()
    if (path === '') return
    addRoot(tab.id, path, signal)
    setDraft('')
  }

  return (
    <div className={css.body} data-explorer-state={roots.kind}>
      <div className={css.header}>
        <span className={css.title}>{t('type.label')}</span>
        <Button
          size="sm"
          variant="ghost"
          title={t('action.reload')}
          onClick={() => {
            refresh(tab.id, signal)
            for (const path of state.expanded) load(tab.id, path, signal)
          }}
        >
          <IconRefreshOutline16 />
        </Button>
      </div>
      <div className={css.tree}>
        {roots.kind === 'failed' ? <div className={css.failure}>{failureLine(t, roots.failure)}</div> : null}
        {roots.kind === 'ready' && roots.roots.length === 0
          ? <div className={css.note}>{t('roots.empty')}</div>
          : null}
        {roots.kind === 'ready'
          ? roots.roots.map(root => (
            <Root
              key={root.path}
              root={root}
              tree={tree}
              onRemove={(path) => { removeRoot(tab.id, path, signal) }}
            />
          ))
          : null}
        {state.writeFailure === undefined
          ? null
          : <div className={css.failure}>{failureLine(t, state.writeFailure)}</div>}
      </div>
      <div className={css.addRow}>
        <Input
          value={draft}
          placeholder={t('roots.placeholder')}
          onChange={(event) => { setDraft(event.target.value) }}
          onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
        />
        <Button
          size="sm"
          onClick={() => {
            void browse(signal).then((picked) => { if (picked !== undefined) setDraft(picked) })
          }}
        >
          {t('roots.browse')}
        </Button>
        <Button size="sm" variant="primary" onClick={submit}>{t('roots.add')}</Button>
      </div>
    </div>
  )
}

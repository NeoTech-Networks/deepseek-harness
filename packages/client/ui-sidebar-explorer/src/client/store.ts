/**
 * The explorer's view state: the operator's roots, which directories are open,
 * and what each loaded level contains.
 *
 * The roots are Host state and identical in every Session, but the store is
 * Slot-standard and therefore session-scoped, so each Session holds its own
 * copy of the answer rather than a shared cache nobody owns. Levels are
 * bucketed by tab id because two explorer tabs in one Session expand
 * independently.
 *
 * Writers run between `start` and `forget`: the owner's `signal` is what ends a
 * bucket's life, and the face stops dispatching once it aborts.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { TabId } from '@deepseek-ai/dsh-client-ui-dockkit'
import type { PinnedEntry, PinnedRoot } from '@deepseek-ai/dsh-api-pinned-files/types'

/** One directory's contents, as one expanded level of the tree. */
export interface DirLevel {
  /** The directory's entries, in the endpoint's order. */
  readonly entries: readonly PinnedEntry[]
  /** The listing hit the endpoint's entry cap, so entries are missing. */
  readonly truncated: boolean
}

/** What one directory level is doing right now. */
export type LevelState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly level: DirLevel }
  | { readonly kind: 'failed'; readonly failure: RemoteFailure }

/** What the root list is doing right now. */
export type RootsState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly roots: readonly PinnedRoot[] }
  | { readonly kind: 'failed'; readonly failure: RemoteFailure }

/** One tab's tree: the levels it has asked for, and what is open. */
export interface ExplorerTabState {
  /** Level state by absolute directory path; a path absent here was never asked for. */
  levels: Record<string, LevelState>
  /** Expanded absolute directory paths. */
  expanded: string[]
  /** The last write's failure, shown under the add row until the next write. */
  writeFailure: RemoteFailure | undefined
}

/** The roots, shared by every explorer tab in the Session, plus each tab's tree. */
export interface ExplorerState {
  roots: RootsState
  byTab: Record<TabId, ExplorerTabState>
}

/**
 * One tab's bucket, which every writer after `start` relies on: the face only
 * dispatches while the record's signal is live, and `forget` runs on its abort.
 * @param state - the draft.
 * @param tabId - the tab being written.
 * @returns the tab's tree.
 */
function bucket(state: ExplorerState, tabId: TabId): ExplorerTabState {
  const tree = state.byTab[tabId]
  if (tree === undefined) throw new Error(`ui-sidebar-explorer: no tree for tab "${tabId}"`)
  return tree
}

/** The explorer store's write set; every level action names the tab it writes. */
type ExplorerActions = {
  start: (draft: ExplorerState, tabId: TabId) => void
  rootsLoading: (draft: ExplorerState) => void
  rootsLoaded: (draft: ExplorerState, roots: readonly PinnedRoot[]) => void
  rootsFailed: (draft: ExplorerState, failure: RemoteFailure) => void
  loading: (draft: ExplorerState, tabId: TabId, path: string) => void
  loaded: (draft: ExplorerState, tabId: TabId, path: string, level: DirLevel) => void
  failed: (draft: ExplorerState, tabId: TabId, path: string, failure: RemoteFailure) => void
  toggled: (draft: ExplorerState, tabId: TabId, path: string) => void
  wrote: (draft: ExplorerState, tabId: TabId, failure: RemoteFailure | undefined) => void
  reset: (draft: ExplorerState, tabId: TabId) => void
  forget: (draft: ExplorerState, tabId: TabId) => void
}

/**
 * Declare the explorer's store.
 *
 * A factory rather than a shared handle: the registration declares it as an
 * exclusive store, so the framework mints one instance per session.
 * @returns the store handle to declare on the registration.
 */
export function createExplorerStore(): EngineStoreHandle<ExplorerState, ExplorerActions> {
  return defineStore({
    init: (): ExplorerState => ({ roots: { kind: 'loading' }, byTab: {} }),
    actions: {
      /**
       * Seed one tab's tree, with nothing expanded and no write pending.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       */
      start: (d, tabId: TabId) => {
        d.byTab[tabId] = { levels: {}, expanded: [], writeFailure: undefined }
      },
      /**
       * Mark the root list as being read.
       * @param d - draft state.
       */
      rootsLoading: (d) => {
        d.roots = { kind: 'loading' }
      },
      /**
       * Record the operator's roots.
       * @param d - draft state.
       * @param roots - the roots the Host reported, in the operator's order.
       */
      rootsLoaded: (d, roots: readonly PinnedRoot[]) => {
        d.roots = { kind: 'ready', roots }
      },
      /**
       * Record why the root list could not be read.
       * @param d - draft state.
       * @param failure - the settled Remote failure.
       */
      rootsFailed: (d, failure: RemoteFailure) => {
        d.roots = { kind: 'failed', failure }
      },
      /**
       * Mark one directory as being listed.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param path - absolute directory path.
       */
      loading: (d, tabId: TabId, path: string) => {
        bucket(d, tabId).levels[path] = { kind: 'loading' }
      },
      /**
       * Record one directory's contents.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param path - absolute directory path.
       * @param level - the listing to show under it.
       */
      loaded: (d, tabId: TabId, path: string, level: DirLevel) => {
        bucket(d, tabId).levels[path] = { kind: 'ready', level }
      },
      /**
       * Record why one directory could not be listed.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param path - absolute directory path.
       * @param failure - the settled Remote failure.
       */
      failed: (d, tabId: TabId, path: string, failure: RemoteFailure) => {
        bucket(d, tabId).levels[path] = { kind: 'failed', failure }
      },
      /**
       * Open a collapsed directory, or collapse an open one.
       *
       * A collapsed level keeps what it loaded, so reopening it draws at once.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param path - absolute directory path.
       */
      toggled: (d, tabId: TabId, path: string) => {
        const state = bucket(d, tabId)
        const at = state.expanded.indexOf(path)
        if (at >= 0) state.expanded.splice(at, 1)
        else state.expanded.push(path)
      },
      /**
       * Record the outcome of a root-list write, so a refusal is shown once
       * and cleared by the next attempt.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param failure - the settled failure, or `undefined` when the write landed.
       */
      wrote: (d, tabId: TabId, failure: RemoteFailure | undefined) => {
        bucket(d, tabId).writeFailure = failure
      },
      /**
       * Drop every loaded level, keeping what is expanded.
       *
       * This is the refresh gesture's first half: the expanded set says which
       * levels to fetch again.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       */
      reset: (d, tabId: TabId) => {
        bucket(d, tabId).levels = {}
      },
      /**
       * Forget one tab's tree, for a tab record that is gone.
       * @param d - draft state.
       * @param tabId - the tab that went away.
       */
      forget: (d, tabId: TabId) => {
        d.byTab = Object.fromEntries(Object.entries(d.byTab).filter(([id]) => id !== tabId))
      },
    },
  })
}

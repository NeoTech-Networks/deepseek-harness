/**
 * The tree's asynchronous half: listing directories into the store.
 *
 * The component never awaits anything. It calls `start` / `load` / `toggle`, and
 * this face performs the listing and writes the outcome through the store's own
 * actions — the Slot-standard `inject` shape, so the session id is resolved by
 * the framework and the write set stays the store's.
 *
 * The listing itself is bound here to the Client Remote face: the tree keys
 * every level by absolute path and hands the endpoint that same absolute path;
 * the endpoint answers with the directory's workspace-relative path as well,
 * which the tree has no use for and drops.
 *
 * One level has one listing in force: asking for a level again — the reload
 * gesture, a directory reopened after a reset — retires the listing still in
 * flight for it, whose settlement then writes nothing. Cleanup rides the owner's
 * `signal`: a request is not made for a record that already ended, and when the
 * record goes away the bucket and the tab's listing bookkeeping are forgotten,
 * so no later settlement writes to it.
 */
import type { ClientRemote, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-store'
import type { TabId } from '@deepseek-ai/dsh-client-ui-dockkit'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { DirLevel, createFilesStore } from './store.ts'

/**
 * One directory listing, bound to a Remote face.
 *
 * The session travels with the call because the endpoint resolves the workspace
 * root from it: the same path means different directories in different sessions.
 * A Remote call does not reject — the result carries the failure.
 */
export type ListWorkspaceDirectory = (
  sessionId: SessionId,
  path: string,
  signal: AbortSignal,
) => Promise<RemoteResult<DirLevel>>

/**
 * The slice of the Client Remote face this package calls: the `workspaceFiles`
 * namespace's `list`, exactly as the Host's generated client declares it.
 */
export type WorkspaceFilesListRemote = {
  readonly workspaceFiles: Pick<ClientRemote['workspaceFiles'], 'list'>
}

/**
 * Bind the listing to one Remote face, keeping only what the tree stores.
 * @param remote - the Client Remote face carrying the `workspaceFiles` namespace.
 * @returns the listing the tree's face performs.
 */
export function createList(remote: WorkspaceFilesListRemote): ListWorkspaceDirectory {
  return async (sessionId, path, signal) => {
    const result = await remote.workspaceFiles.list(sessionId, path, signal)
    if (!result.ok) return result
    return { ok: true, value: { entries: result.value.entries, truncated: result.value.truncated } }
  }
}

/**
 * The absolute path of one child entry.
 *
 * Joined with `/` whatever the parent's separators: the Host resolves mixed
 * separators, and the tree only needs a stable key.
 * @param parent - absolute path of the listed directory.
 * @param name - the entry's basename.
 * @returns the child's absolute path.
 */
export function childPath(parent: string, name: string): string {
  return `${parent.replace(/[/\\]+$/, '')}/${name}`
}

/** One sub-directory offered by the bulk "open each sub-folder" flow. */
export interface SubDirectoryCandidate {
  /** Basename inside the listed directory. */
  readonly name: string
  /** Absolute path of the child directory. */
  readonly path: string
}

/** The tree's injected business face, as the body receives it. */
export interface FilesInjected {
  /**
   * Seed this tab's tree and list its root.
   * @param tabId - the tab being drawn.
   * @param root - absolute path of the workspace root.
   * @param signal - the tab record's lifetime.
   */
  readonly start: (tabId: TabId, root: string, signal: AbortSignal) => void
  /**
   * List one directory into the store.
   * @param tabId - the tab being drawn.
   * @param path - absolute directory path.
   * @param signal - the tab record's lifetime.
   */
  readonly load: (tabId: TabId, path: string, signal: AbortSignal) => void
  /**
   * Open or collapse one directory, listing it the first time it opens.
   * @param tabId - the tab being drawn.
   * @param path - absolute directory path.
   * @param loaded - whether this level already has state.
   * @param signal - the tab record's lifetime.
   */
  readonly toggle: (tabId: TabId, path: string, loaded: boolean, signal: AbortSignal) => void
  /**
   * Open (or reuse) a Session whose workspace root is the given directory.
   * @param path - absolute directory inside the tree's root.
   */
  readonly openDirectory: (path: string) => void
  /**
   * List the immediate sub-directories of one directory, for the bulk flow.
   * @param path - absolute directory inside the tree's root.
   * @returns directories only, dot-directories excluded.
   */
  readonly listDirectories: (path: string) => Promise<readonly SubDirectoryCandidate[]>
  /**
   * Register each selected sub-directory as its own Workspace under one group,
   * opening a Session only in the first one.
   * @param paths - absolute directories to register.
   * @param group - grouping label applied to every newly grouped Workspace.
   * @returns how many Workspaces were registered.
   */
  readonly openSubDirectories: (paths: readonly string[], group: string) => Promise<number>
  /**
   * The grouping label this Session's Workspace already carries (its group, or
   * its title when ungrouped); the bulk dialog prefills its group field from it.
   */
  readonly inheritedGroup: string
}

/** The workspace-open capability the tree's "open in a session" actions call. */
export interface FilesOpenCapability {
  /**
   * Open or reuse a Session rooted at an absolute directory.
   * @param path - absolute directory to own as a Workspace.
   */
  readonly openDirectory: (path: string) => Promise<void>
  /**
   * Register each selected sub-directory as its own Workspace under `group`,
   * opening a Session only in the first one.
   * @param sessionId - the Session whose workspace root scopes the listing.
   * @param paths - absolute directories to register.
   * @param group - grouping label applied to every newly grouped Workspace.
   * @returns how many Workspaces were registered.
   */
  readonly openSubDirectories: (sessionId: SessionId, paths: readonly string[], group: string) => Promise<number>
  /**
   * The grouping label this Session's Workspace already carries.
   * @param sessionId - the Session whose owning Workspace supplies the label.
   */
  readonly groupFor: (sessionId: SessionId) => string
}

/**
 * Bind the tree's face to one directory listing and the open capability.
 * @param list - the bound `workspaceFiles.list` call.
 * @param capability - the workspace-open actions behind the two menu gestures.
 * @returns the Slot `inject` factory: session and bound actions in, face out.
 */
export function filesFace(
  list: ListWorkspaceDirectory,
  capability: FilesOpenCapability,
): (sessionId: SessionId, actions: BoundActions<ReturnType<typeof createFilesStore>>) => FilesInjected {
  return (
    sessionId: SessionId,
    actions: BoundActions<ReturnType<typeof createFilesStore>>,
  ): FilesInjected => {
    /** Per tab, per absolute path: the listing generation a settlement must match; the latest request wins. */
    const generations = new Map<TabId, Map<string, number>>()
    const nextGeneration = (tabId: TabId, path: string): number => {
      const byPath = generations.get(tabId) ?? new Map<string, number>()
      generations.set(tabId, byPath)
      const generation = (byPath.get(path) ?? 0) + 1
      byPath.set(path, generation)
      return generation
    }
    const load = (tabId: TabId, path: string, signal: AbortSignal): void => {
      if (signal.aborted) return
      const generation = nextGeneration(tabId, path)
      actions.loading(tabId, path)
      void list(sessionId, path, signal).then((result) => {
        // A newer listing of this level was asked for since, or the record is
        // gone and its bookkeeping with it: nothing left for this one to write.
        if (generations.get(tabId)?.get(path) !== generation) return
        if (result.ok) actions.loaded(tabId, path, result.value)
        else actions.failed(tabId, path, result.error)
      })
    }
    return {
      start(tabId, root, signal) {
        actions.start(tabId, root)
        signal.addEventListener('abort', () => {
          generations.delete(tabId)
          actions.forget(tabId)
        }, { once: true })
        load(tabId, root, signal)
      },
      load,
      toggle(tabId, path, loaded, signal) {
        actions.toggled(tabId, path)
        if (!loaded) load(tabId, path, signal)
      },
      openDirectory: (path) => {
        void capability.openDirectory(path).catch((reason: unknown) => {
          console.warn('open session in directory failed:', reason)
        })
      },
      listDirectories: async (path) => {
        const result = await list(sessionId, path, new AbortController().signal)
        if (!result.ok) throw new Error(result.error.message)
        return result.value.entries
          .filter(entry => entry.type === 'directory' && !entry.name.startsWith('.'))
          .map(entry => ({ name: entry.name, path: childPath(path, entry.name) }))
      },
      openSubDirectories: (paths, group) => capability.openSubDirectories(sessionId, paths, group),
      inheritedGroup: capability.groupFor(sessionId),
    }
  }
}

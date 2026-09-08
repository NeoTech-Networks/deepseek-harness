/**
 * The explorer's asynchronous half: reading the operator's roots, listing
 * directories, and changing the root list.
 *
 * The component never awaits anything. It calls the methods below, and this
 * face performs the call and writes the outcome through the store's own
 * actions — the Slot-standard `inject` shape, so the write set stays the
 * store's.
 *
 * Nothing here takes a Session. The `pinnedFiles` namespace answers for the
 * Host machine, not for a workspace, which is exactly why the same roots
 * appear in every Session and every Workspace.
 *
 * One level has one listing in force: asking for a level again — the refresh
 * gesture, a directory reopened after a reset — retires the listing still in
 * flight for it, whose settlement then writes nothing. Cleanup rides the
 * owner's `signal`.
 */
import type { ClientRemote, RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-store'
import type { TabId } from '@deepseek-ai/dsh-client-ui-dockkit'
import type { PinnedFileText } from '@deepseek-ai/dsh-api-pinned-files/types'
import type { createExplorerStore } from './store.ts'

/**
 * The slice of the Client Remote face this package calls: the whole
 * `pinnedFiles` namespace, and the directory picker's `pick` for the Browse
 * button.
 */
export type ExplorerRemote = {
  readonly pinnedFiles: ClientRemote['pinnedFiles']
  readonly directoryPicker: Pick<ClientRemote['directoryPicker'], 'pick'>
}

/** The explorer's injected business face, as the tree body receives it. */
export interface ExplorerInjected {
  /**
   * Seed this tab and read the operator's roots.
   * @param tabId - the tab being drawn.
   * @param signal - the tab record's lifetime.
   */
  readonly start: (tabId: TabId, signal: AbortSignal) => void
  /**
   * Read the roots again and drop every listed level.
   * @param tabId - the tab being drawn.
   * @param signal - the tab record's lifetime.
   */
  readonly refresh: (tabId: TabId, signal: AbortSignal) => void
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
   * Pin one directory and re-read the roots.
   * @param tabId - the tab being drawn.
   * @param path - absolute directory to pin.
   * @param signal - the tab record's lifetime.
   */
  readonly addRoot: (tabId: TabId, path: string, signal: AbortSignal) => void
  /**
   * Unpin one directory and re-read the roots.
   * @param tabId - the tab being drawn.
   * @param path - absolute directory to unpin.
   * @param signal - the tab record's lifetime.
   */
  readonly removeRoot: (tabId: TabId, path: string, signal: AbortSignal) => void
  /**
   * Open the Host's own folder chooser.
   * @param signal - the tab record's lifetime.
   * @returns the chosen absolute path, or `undefined` when the operator
   *   cancelled or this deployment has no native chooser; the caller falls
   *   back to the typed path field either way.
   */
  readonly browse: (signal: AbortSignal) => Promise<string | undefined>
}

/** The preview body's injected business face. */
export interface ExplorerTextInjected {
  /**
   * Read one file's whole text.
   * @param path - absolute path of the file.
   * @param signal - the tab record's lifetime.
   * @returns the file, or the failure that stopped it.
   */
  readonly read: (path: string, signal: AbortSignal) => Promise<
    { readonly ok: true; readonly value: PinnedFileText } | { readonly ok: false; readonly error: RemoteFailure }
  >
}

/**
 * Bind the explorer's face to one Remote.
 * @param remote - the Client Remote face carrying the `pinnedFiles` namespace.
 * @returns the Slot `inject` factory: bound actions in, face out.
 */
export function explorerFace(
  remote: ExplorerRemote,
): (actions: BoundActions<ReturnType<typeof createExplorerStore>>) => ExplorerInjected {
  return (actions: BoundActions<ReturnType<typeof createExplorerStore>>): ExplorerInjected => {
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
      void remote.pinnedFiles.list(path, signal).then((result) => {
        // A newer listing of this level was asked for since, or the record is
        // gone and its bookkeeping with it: nothing left for this one to write.
        if (generations.get(tabId)?.get(path) !== generation) return
        if (result.ok) actions.loaded(tabId, path, { entries: result.value.entries, truncated: result.value.truncated })
        else actions.failed(tabId, path, result.error)
      })
    }
    const readRoots = (signal: AbortSignal): void => {
      if (signal.aborted) return
      actions.rootsLoading()
      void remote.pinnedFiles.state(signal).then((result) => {
        if (signal.aborted) return
        if (result.ok) actions.rootsLoaded(result.value.roots)
        else actions.rootsFailed(result.error)
      })
    }
    return {
      start(tabId, signal) {
        actions.start(tabId)
        signal.addEventListener('abort', () => {
          generations.delete(tabId)
          actions.forget(tabId)
        }, { once: true })
        readRoots(signal)
      },
      refresh(tabId, signal) {
        actions.reset(tabId)
        readRoots(signal)
      },
      load,
      toggle(tabId, path, loaded, signal) {
        actions.toggled(tabId, path)
        if (!loaded) load(tabId, path, signal)
      },
      addRoot(tabId, path, signal) {
        if (signal.aborted) return
        void remote.pinnedFiles.addRoot(path, signal).then((result) => {
          if (signal.aborted) return
          actions.wrote(tabId, result.ok ? undefined : result.error)
          if (result.ok) actions.rootsLoaded(result.value.roots)
        })
      },
      removeRoot(tabId, path, signal) {
        if (signal.aborted) return
        void remote.pinnedFiles.removeRoot(path, signal).then((result) => {
          if (signal.aborted) return
          actions.wrote(tabId, result.ok ? undefined : result.error)
          if (result.ok) actions.rootsLoaded(result.value.roots)
        })
      },
      async browse(signal) {
        const result = await remote.directoryPicker.pick(signal)
        // A deployment whose composed picker has no native chooser answers
        // `directory-picker/unavailable`; the typed field is the whole
        // fallback, so the button simply does nothing visible.
        return result.ok && result.value !== null ? result.value : undefined
      },
    }
  }
}

/**
 * Bind the preview's face to one Remote.
 * @param remote - the Client Remote face carrying the `pinnedFiles` namespace.
 * @returns the Slot `inject` factory's product; it holds no per-session state.
 */
export function explorerTextFace(remote: Pick<ExplorerRemote, 'pinnedFiles'>): ExplorerTextInjected {
  return {
    read: async (path, signal) => await remote.pinnedFiles.read(path, signal),
  }
}

/** The final segment of an absolute path, for a row label. */
export function baseNameOf(path: string): string {
  const trimmed = path.replace(/[/\\]+$/, '')
  const separator = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  const name = trimmed.slice(separator + 1)
  return name === '' ? trimmed : name
}

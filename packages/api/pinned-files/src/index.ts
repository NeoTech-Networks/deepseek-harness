/**
 * Pinned-files service: the operator's own list of directories anywhere on the
 * Host, and unconfined directory listings for them, exposed as the
 * `pinnedFiles` Remote namespace.
 *
 * This is deliberately NOT `workspaceFiles` with the fence removed. That
 * service answers for one Session's workspace root and refuses everything
 * outside it, which is the correct rule for content an Agent addresses. This
 * one answers for directories the operator named on the machine they are
 * sitting at, which is a different question with a different authority: the
 * roots come from the operator's own settings document, and nothing here is
 * reachable from a path a model chose.
 *
 * Four rules hold instead of the workspace fence:
 *
 * 1. A path must be absolute before any filesystem call. A relative path would
 *    resolve against the Host process cwd (or, on Windows, its current drive),
 *    which is never what a wire caller meant.
 * 2. Only directories are listed and only directories may be pinned; the
 *    listing reports metadata and never file content. Reading a pinned file's
 *    text is `workspaceFiles`' job through a `dsh-resource://file/absolute/…`
 *    address, which keeps every content read on one audited path.
 * 3. The entry cap is validated Config. A listing is cut by entries and says so.
 * 4. Failures are one `RemoteError` per reason, declared in `./types`.
 *
 * The root list lives in the settings namespace `pinned-files`, so it is one
 * line in `$DSH_HOME/settings.yaml`, survives restarts, is identical in every
 * Session and every Workspace, and can be edited by hand without this service
 * running.
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-fs'
import type { FsDirEntry } from '@deepseek-ai/dsh-fs'
import type {} from '@deepseek-ai/dsh-settings'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { PinnedEntry, PinnedFileText, PinnedListing, PinnedRoot, PinnedState } from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host owner of the `pinnedFiles` Remote namespace. */
    pinnedFiles: PinnedFiles
  }
}

/** Deployment caps on one listing and one read. */
export interface Config {
  /** Cap on returned directory entries; the rest is dropped and reported cut. */
  readonly maxEntries: number
  /** Inclusive byte cap on one file read. A larger file is refused, never truncated. */
  readonly maxBytes: number
}

/** The operator-owned section stored under the `pinned-files` settings namespace. */
interface PinnedSection {
  /** Absolute directory paths, in the order the operator added them. */
  readonly roots: string[]
  /** Whether the explorer opens itself in every Session. */
  readonly autoOpen: boolean
}

/** The settings namespace this service owns; also the key in `$DSH_HOME/settings.yaml`. */
const NAMESPACE = 'pinned-files'

/** The operator's section as the settings document stores and validates it. */
const SECTION_SCHEMA: z<PinnedSection> = z.object({
  roots: z.array(z.string()).default([]),
  autoOpen: z.boolean().default(false),
})

/**
 * Absolute in the sense the wire needs: a POSIX root, a Windows drive root, or
 * a UNC share. A bare `\foo` is drive-relative on Windows and is refused with
 * everything else that would resolve against the Host process.
 */
const ABSOLUTE = /^(?:[a-zA-Z]:[/\\]|[/\\]{2}[^/\\]|\/)/

/** The byte text never carries: its presence marks a read as binary. */
const NUL = String.fromCharCode(0)

/**
 * The backend's non-text refusal, recognized by its code alone: the error class
 * belongs to whichever `dsh-fs` instance the provider loaded, so no class
 * identity is shared across the package boundary.
 */
function isNotTextRefusal(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'FS_NOT_TEXT'
}

/** Trailing separators are presentation, never identity: one root is one string. */
function normalize(path: string): string {
  const trimmed = path.trim()
  if (trimmed.length <= 3) return trimmed
  return trimmed.replace(/[/\\]+$/, '')
}

/**
 * The label a root header shows: its basename, or the whole path when the
 * directory is a filesystem root and has none.
 */
function labelOf(path: string): string {
  const segments = path.split(/[/\\]+/).filter(segment => segment !== '')
  const last = segments.at(-1)
  return last === undefined || last.endsWith(':') ? path : last
}

/** Compose one child's absolute path from the listed directory's own. */
function childPathOf(parent: string, name: string): string {
  const separator = parent.includes('\\') && !parent.includes('/') ? '\\' : '/'
  return `${parent.replace(/[/\\]+$/, '')}${separator}${name}`
}

/** Strip the resolved child target: the wire carries names, paths, and metadata only. */
function entryOf(parent: string, child: FsDirEntry): PinnedEntry {
  return {
    name: child.name,
    path: childPathOf(parent, child.name),
    type: child.type,
    ...child.size === undefined ? {} : { size: child.size },
  }
}

/** Host Remote service over the composed filesystem, confined to nothing and authorized by the operator. */
export class PinnedFiles extends TypertRemoteService {
  static inject = ['fs', 'settings', 'typert']

  static Config: z<Config> = z.object({
    maxEntries: z.number().step(1).min(1).default(2000),
    maxBytes: z.number().step(1).min(1).default(2 * 1024 * 1024),
  })

  private readonly scope: SettingsScope<PinnedSection>

  /**
   * @param ctx - Host context carrying the filesystem and the settings document.
   * @param config - deployment cap on one listing.
   */
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'pinnedFiles')
    this.scope = ctx.settings.register(NAMESPACE, SECTION_SCHEMA)
  }

  /**
   * Report the operator's pinned roots and explorer preferences.
   * @param signal - caller cancellation.
   * @returns every pinned root with its current reachability, and the auto-open preference.
   */
  @Remote
  async state(signal: AbortSignal): Promise<PinnedState> {
    return await this.currentState(signal)
  }

  /**
   * Pin one directory, appending it to the operator's list.
   *
   * Idempotent: pinning a directory already in the list moves nothing and
   * fails nothing, because the operator's gesture was "make sure this is
   * there", and a picker can hand back a path they already chose once.
   * @param path - absolute directory to pin.
   * @param signal - caller cancellation.
   * @returns the state after the write.
   */
  @Remote
  async addRoot(path: string, signal: AbortSignal): Promise<PinnedState> {
    const target = this.requireAbsolute(path)
    const info = await this.ctx.fs.lstat(target, {}, signal)
    if (info === undefined) {
      throw new RemoteError('pinned-files/not-found', `no directory at "${target}"`, { path: target })
    }
    if (info.type !== 'directory') {
      throw new RemoteError(
        'pinned-files/not-directory',
        `"${target}" is a ${info.type}`,
        { path: target, kind: info.type },
      )
    }
    const roots = this.section().roots
    if (!roots.includes(target)) await this.write([...roots, target], target)
    return await this.currentState(signal)
  }

  /**
   * Unpin one directory. A path that is not pinned is left alone rather than
   * refused: the list already says what the caller wanted it to say.
   * @param path - absolute directory to unpin.
   * @param signal - caller cancellation.
   * @returns the state after the write.
   */
  @Remote
  async removeRoot(path: string, signal: AbortSignal): Promise<PinnedState> {
    const target = normalize(path)
    const roots = this.section().roots
    if (roots.includes(target)) await this.write(roots.filter(root => root !== target), target)
    return await this.currentState(signal)
  }

  /**
   * Set whether the explorer opens itself in every Session.
   * @param autoOpen - the operator's preference.
   * @param signal - caller cancellation.
   * @returns the state after the write.
   */
  @Remote
  async setAutoOpen(autoOpen: boolean, signal: AbortSignal): Promise<PinnedState> {
    await this.persist({ autoOpen }, '')
    return await this.currentState(signal)
  }

  /**
   * List the direct children of one directory anywhere the Host can read.
   *
   * The directory does not have to be a pinned root, or under one: the tree
   * walks downward from a root the operator authorized, and re-checking
   * ancestry on every level would cost a resolve per row without adding an
   * authority the caller does not already have.
   * @param path - absolute directory to list.
   * @param signal - caller cancellation.
   * @returns the directory's children in the backend's stable name order, bounded by the entry cap.
   */
  @Remote
  async list(path: string, signal: AbortSignal): Promise<PinnedListing> {
    const requested = this.requireAbsolute(path)
    const info = await this.ctx.fs.lstat(requested, {}, signal)
    if (info === undefined) {
      throw new RemoteError('pinned-files/not-found', `no entry at "${requested}"`, { path: requested })
    }
    if (info.type !== 'directory') {
      throw new RemoteError(
        'pinned-files/not-directory',
        `"${requested}" is a ${info.type}`,
        { path: requested, kind: info.type },
      )
    }
    const target = await this.ctx.fs.resolve(requested, { signal })
    const resolved = this.ctx.fs.processPath(target)
    let children: FsDirEntry[]
    try {
      children = await this.ctx.fs.listDir(target, signal)
    } catch (error: unknown) {
      throw new RemoteError(
        'pinned-files/unreadable',
        `"${resolved}" could not be listed: ${errorMessage(error)}`,
        { path: resolved },
        { cause: error },
      )
    }
    return {
      path: resolved,
      entries: children.slice(0, this.config.maxEntries).map(child => entryOf(resolved, child)),
      truncated: children.length > this.config.maxEntries,
    }
  }

  /**
   * Read one regular file's whole text from anywhere the Host can read.
   *
   * A file above the byte cap is refused with its size rather than shortened,
   * because a silently cut file reads as the whole file.
   * @param path - absolute path of the file.
   * @param signal - caller cancellation.
   * @returns the file's identity, size, and complete decoded text.
   */
  @Remote
  async read(path: string, signal: AbortSignal): Promise<PinnedFileText> {
    const requested = this.requireAbsolute(path)
    const entry = await this.ctx.fs.lstat(requested, {}, signal)
    if (entry === undefined) {
      throw new RemoteError('pinned-files/not-found', `no entry at "${requested}"`, { path: requested })
    }
    if (entry.type !== 'file') {
      throw new RemoteError(
        'pinned-files/not-regular-file',
        `"${requested}" is a ${entry.type}`,
        { path: requested, kind: entry.type },
      )
    }
    const target = await this.ctx.fs.resolve(requested, { signal })
    const resolved = this.ctx.fs.processPath(target)
    const info = await this.ctx.fs.stat(target, signal)
    if (info === undefined || info.type !== 'file') {
      throw new RemoteError('pinned-files/not-found', `no file at "${resolved}"`, { path: resolved })
    }
    const bytes = info.size ?? 0
    if (bytes > this.config.maxBytes) {
      throw new RemoteError(
        'pinned-files/too-large',
        `"${resolved}" is ${bytes} bytes, past the ${this.config.maxBytes} byte cap`,
        { path: resolved, bytes, limit: this.config.maxBytes },
      )
    }
    let text: string
    try {
      text = await this.ctx.fs.readText(target, signal)
    } catch (error: unknown) {
      if (isNotTextRefusal(error)) {
        throw new RemoteError('pinned-files/not-text', `"${resolved}" is not UTF-8 text`, { path: resolved }, { cause: error })
      }
      throw new RemoteError(
        'pinned-files/unreadable',
        `"${resolved}" could not be read: ${errorMessage(error)}`,
        { path: resolved },
        { cause: error },
      )
    }
    if (text.includes(NUL)) {
      throw new RemoteError('pinned-files/not-text', `"${resolved}" contains NUL bytes`, { path: resolved })
    }
    return { path: resolved, version: String(info.version), bytes, text }
  }

  /** The stored section as it stands, with schema defaults already applied. */
  private section(): PinnedSection {
    return this.scope.get()
  }

  /** Refuse a path that would resolve against the Host process before touching the filesystem. */
  private requireAbsolute(path: string): string {
    const target = normalize(path)
    if (target === '' || !ABSOLUTE.test(target)) {
      throw new RemoteError('pinned-files/not-absolute', `"${path}" is not an absolute path`, { path })
    }
    return target
  }

  /** Persist a new root list, classifying a read-only or absent settings document. */
  private async write(roots: readonly string[], path: string): Promise<void> {
    await this.persist({ roots: [...roots] }, path)
  }

  /** One settings write, with the operator-facing refusal a read-only document earns. */
  private async persist(patch: Partial<PinnedSection>, path: string): Promise<void> {
    try {
      await this.scope.update(patch)
    } catch (error: unknown) {
      throw new RemoteError(
        'pinned-files/not-writable',
        `the settings document refused the change: ${errorMessage(error)}`,
        { path },
        { cause: error },
      )
    }
  }

  /** Read the section and probe each root's reachability in one pass. */
  private async currentState(signal: AbortSignal): Promise<PinnedState> {
    const section = this.section()
    const roots: PinnedRoot[] = []
    for (const path of section.roots) {
      roots.push({ path, label: labelOf(path), available: await this.reachable(path, signal) })
    }
    return { roots, autoOpen: section.autoOpen }
  }

  /**
   * Whether one pinned root is a directory right now. A root on a disconnected
   * drive is a fact to report, never a reason to fail the whole read.
   */
  private async reachable(path: string, signal: AbortSignal): Promise<boolean> {
    try {
      return (await this.ctx.fs.lstat(path, {}, signal))?.type === 'directory'
    } catch {
      return false
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default PinnedFiles

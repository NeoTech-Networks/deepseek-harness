/**
 * Wire types of the `pinnedFiles` Remote namespace. Types only: generated
 * Remote clients consume this module without Host runtime code.
 *
 * One path vocabulary leaves here and it is absolute throughout. Unlike
 * `workspaceFiles`, whose every method is confined to one Session's workspace
 * root, a pinned root is a directory the operator named on the Host machine and
 * is deliberately unrelated to any Session. The listing therefore carries each
 * child's absolute path rather than a path relative to a root, so a consumer
 * never joins segments itself and never needs a Session to interpret an answer.
 *
 * @module @deepseek-ai/dsh-api-pinned-files/types
 */

// Import the protocol module so the declaration at the end of this file
// augments its error map rather than defining an unrelated ambient module.
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** One directory the operator pinned into the explorer. */
export interface PinnedRoot {
  /**
   * Absolute path of the pinned directory in the Host's execution world,
   * symlinks resolved. This is the identity of the root: the operator's
   * settings document stores exactly this string, and removal matches on it.
   */
  readonly path: string
  /**
   * Display name for the root's header row. The basename of {@link path} when
   * the operator supplied no label, and the path itself for a filesystem root
   * that has no basename.
   */
  readonly label: string
  /**
   * Whether the directory could still be reached at the time the roots were
   * read. A root on a disconnected drive stays pinned and reports `false`
   * rather than disappearing from the operator's list.
   */
  readonly available: boolean
}

/**
 * Everything the explorer needs about the operator's own configuration, read
 * and returned whole by every write so a caller never reconciles two answers.
 */
export interface PinnedState {
  /** The pinned roots in the order the operator added them. */
  readonly roots: readonly PinnedRoot[]
  /** Whether the explorer opens itself in every Session rather than waiting to be picked. */
  readonly autoOpen: boolean
}

/** One direct child of a listed directory. */
export interface PinnedEntry {
  /** Basename inside the listed directory. */
  readonly name: string
  /**
   * Absolute path of the child, composed by the Host so a consumer never joins
   * path segments and never has to know the platform's separator.
   */
  readonly path: string
  /**
   * What the child resolves to. A symlink reports the type of its destination,
   * and `other` covers everything that is neither a regular file nor a
   * directory.
   */
  readonly type: 'file' | 'directory' | 'other'
  /** Byte size, present only for a regular file whose backend reports it. */
  readonly size?: number
}

/** Direct children of one directory anywhere the Host can read. */
export interface PinnedListing {
  /** Absolute path of the listed directory, symlinks resolved. */
  readonly path: string
  /**
   * Direct children in the backend's stable name order, cut to the configured
   * entry cap. Presentation order is the caller's choice.
   */
  readonly entries: readonly PinnedEntry[]
  /** Whether the entry cap dropped children from {@link entries}. */
  readonly truncated: boolean
}

/**
 * One pinned file's whole text.
 *
 * There is no paging here on purpose. A pinned root's file is opened to be
 * looked at in a narrow sidebar column, and a file too big for one read is
 * refused with its size rather than served in windows: paging is a reading
 * surface's problem, and the reading surface for a file an Agent works on is
 * `workspaceFiles`, which already has it.
 */
export interface PinnedFileText {
  /** Absolute path of the file, symlinks resolved. */
  readonly path: string
  /** Opaque freshness token at the time of the read; never parsed. */
  readonly version: string
  /** Byte size of the file. */
  readonly bytes: number
  /** The file's complete decoded text. */
  readonly text: string
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** No entry exists at that absolute path on the Host. */
    'pinned-files/not-found': { readonly path: string }
    /** The path is not a directory, so it has neither children nor a place in the root list. */
    'pinned-files/not-directory': {
      readonly path: string
      readonly kind: 'file' | 'symlink' | 'other'
    }
    /** The path was rejected before any filesystem call: it is empty or not absolute. */
    'pinned-files/not-absolute': { readonly path: string }
    /** The entry exists but the Host account cannot read it. */
    'pinned-files/unreadable': { readonly path: string }
    /** The path is not a regular file, so it has no text to read. */
    'pinned-files/not-regular-file': {
      readonly path: string
      readonly kind: 'directory' | 'symlink' | 'other'
    }
    /** The file is larger than the configured read cap; nothing is returned. */
    'pinned-files/too-large': { readonly path: string; readonly bytes: number; readonly limit: number }
    /** The file is not decodable UTF-8 text, or carries NUL bytes. */
    'pinned-files/not-text': { readonly path: string }
    /** The operator's settings document is read-only or absent, so the root list cannot change. */
    'pinned-files/not-writable': { readonly path: string }
  }
}

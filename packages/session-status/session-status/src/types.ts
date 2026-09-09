/**
 * Pure types of the session-status domain: the ONE home of the `sessionStatus`
 * projection-key declaration plus the durable payload vocabulary it carries,
 * free of this package's host-side imports (cordis, zod, the service). Two
 * namespace projections serve it: `./types` for host consumers and `./client`
 * (the browser half-entry's re-export) for client aggregates, with zero
 * content duplication.
 *
 * @module @deepseek-ai/dsh-session-status/types
 */

export {}

/**
 * The shipped glyph identifiers, drawn from the ui-primitives icon set. An id
 * is a stable wire value, never a component: the client resolves the id
 * through its own allowlist so a deployment that authors a new icon id keeps
 * working, and a client that does not know an id falls back to a neutral
 * generic glyph instead of throwing.
 */
export type SessionStatusIconId =
  | 'right-up'
  | 'stop'
  | 'check'
  | 'clock'
  | 'pause'

/**
 * Colour urgency of one status glyph. Identity lives in the glyph, urgency in
 * the colour, matching the workspace row's existing phase-mark arrangement.
 */
export type SessionStatusTone = 'attention' | 'error' | 'success' | 'neutral'

/**
 * One durable declared session status. The whole value travels in the
 * `session/status` event so a later vocabulary edit cannot retroactively
 * change or break a row already logged.
 */
export interface SessionStatusValue {
  /** Stable kebab-case identity, resolved against the deployment vocabulary. */
  readonly id: string
  /** Human label shown in the row and hover card; operator-authored copy. */
  readonly label: string
  /** Glyph id the client resolves to a component. */
  readonly icon: SessionStatusIconId
  /** Colour urgency of the glyph. */
  readonly tone: SessionStatusTone
}

/** One vocabulary entry the deployment declares; the folded value is the entry. */
export interface SessionStatusVocabularyEntry extends SessionStatusValue {}

/** Deployment-owned status vocabulary, validated at plugin load. */
export interface SessionStatusConfig {
  /**
   * The allowed statuses. Ids must be non-empty and unique, every icon id must
   * be one of {@link SessionStatusIconId}, and every tone must be one of
   * {@link SessionStatusTone}; a malformed entry fails the plugin load loudly.
   */
  readonly vocabulary: readonly SessionStatusVocabularyEntry[]
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /**
     * Whole-value session status. `status: null` clears the status; otherwise
     * the event carries the complete post-change value plus an optional note.
     * Last write wins on replay, and any human-authored `user/message` clears
     * the status, so a prompt answers the hold the status described.
     */
    'session/status': { status: SessionStatusValue | null; note?: string }
  }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    /** Current declared status, or null before the first set and after a clear. */
    sessionStatus: SessionStatusValue | null
  }
  interface SessionProjectionMap {
    /** The current declared session status; see the state map for the fold. */
    sessionStatus: SessionStatusValue | null
  }
}

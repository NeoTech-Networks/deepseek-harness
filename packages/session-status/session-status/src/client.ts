/**
 * Client-namespace projection of the session-status domain: a pure re-export
 * of the package's types outlet. Client code imports ONLY the client namespace
 * (repo discipline), so `./client` projects the same single-source content
 * `./types` serves to host consumers, with zero duplication.
 *
 * @module @deepseek-ai/dsh-session-status/client
 */

export type * from './types.ts'

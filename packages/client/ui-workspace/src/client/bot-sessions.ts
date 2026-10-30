/**
 * The session ids ds-bot says are its own, as published into the page.
 *
 * The Bot Sessions group could only ever recognise a session by its Workspace
 * path, and the bots work in ordinary project folders the operator also works
 * in, so almost nothing reached the group. Only ds-bot knows which sessions it
 * owns, so it publishes the set: an array on `window.__dshBotSessions` plus a
 * `dsh-bot:sessions` event whenever it changes.
 *
 * The channel is one way and read-only, and every reader here tolerates the
 * publisher being absent, so the sidebar keeps its path-only behaviour on a
 * page with no ds-bot loaded.
 */
import { useSyncExternalStore } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Window event ds-bot fires after it rewrites {@link BOT_SESSION_GLOBAL}. */
const BOT_SESSIONS_EVENT = 'dsh-bot:sessions'

/** Set returned whenever the page has published nothing usable. */
export const EMPTY_BOT_SESSIONS: ReadonlySet<SessionId> = new Set<SessionId>()

/**
 * The page property ds-bot publishes into. Typed `unknown` on purpose: the
 * publisher is a separate bundle, so nothing here may assume its shape beyond
 * an array of strings, and a malformed value must degrade rather than throw.
 * Declared here rather than on `Window` so no other file can read it by
 * accident and start trusting a shape this module does not promise.
 */
type PublishedHost = { __dshBotSessions?: unknown }

/**
 * The window as the publisher writes it.
 * @returns the host carrying {@link PublishedHost.__dshBotSessions}.
 */
const host = (): PublishedHost => window as unknown as PublishedHost

/** Raw value the caches below were built from, so identity only changes on a real change. */
let cachedRaw: unknown
/** Set handed out for {@link cachedRaw}. */
let cachedSet: ReadonlySet<SessionId> = EMPTY_BOT_SESSIONS

/**
 * Convert whatever the page published into a set, keeping only string ids.
 * @param raw - the value of `window.__dshBotSessions`, of any shape.
 * @returns the ids, or {@link EMPTY_BOT_SESSIONS} when nothing usable was published.
 */
function toSet(raw: unknown): ReadonlySet<SessionId> {
  if (!Array.isArray(raw)) return EMPTY_BOT_SESSIONS
  const ids = raw.filter((id): id is SessionId => typeof id === 'string')
  return ids.length === 0 ? EMPTY_BOT_SESSIONS : new Set(ids)
}

/**
 * Whether two sets hold the same ids.
 * @param held - the set already cached.
 * @param next - the set just derived.
 * @returns whether they are equal, so the earlier identity can be kept.
 */
function sameIds(held: ReadonlySet<SessionId>, next: ReadonlySet<SessionId>): boolean {
  if (held.size !== next.size) return false
  for (const id of next) if (!held.has(id)) return false
  return true
}

/**
 * The ids ds-bot currently owns.
 *
 * Returns the SAME set object while the published ids are unchanged:
 * `useSyncExternalStore` compares snapshots by identity and would re-render for
 * ever if every read minted a fresh set.
 * @returns the owned session ids, or {@link EMPTY_BOT_SESSIONS} when the page published none.
 */
export function getBotSessionIds(): ReadonlySet<SessionId> {
  const raw = typeof window === 'undefined' ? undefined : host().__dshBotSessions
  if (raw === cachedRaw) return cachedSet
  const next = toSet(raw)
  cachedRaw = raw
  if (!sameIds(cachedSet, next)) cachedSet = next
  return cachedSet
}

/**
 * Run a callback whenever ds-bot republishes its owned session ids.
 * @param onChange - called after each publication.
 * @returns the unsubscribe function.
 */
export function subscribeBotSessions(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(BOT_SESSIONS_EVENT, onChange)
  return () => { window.removeEventListener(BOT_SESSIONS_EVENT, onChange) }
}

/**
 * Subscribe the calling component to ds-bot's owned session ids.
 * @returns the owned ids, re-read whenever ds-bot republishes.
 */
export function useBotSessionIds(): ReadonlySet<SessionId> {
  return useSyncExternalStore(subscribeBotSessions, getBotSessionIds, getBotSessionIds)
}

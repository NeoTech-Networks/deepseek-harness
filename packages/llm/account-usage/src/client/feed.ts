/**
 * One account-usage feed per page: a store every footer entry reads and a
 * self-scheduling poll behind it.
 *
 * The cadence is the whole design. The account's own figures move only when a
 * request is billed, so polling fast while nothing runs would spend requests
 * to learn nothing. The feed therefore polls slowly at rest, faster while a
 * session is running, and takes one extra reading shortly after a turn settles
 * — which is the moment the figure actually changes. The Host caches its own
 * answer, so a burst of refreshes costs one upstream read at most.
 */

import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { AccountUsageSnapshot } from '../types.ts'
import type { AccountUsageRemote } from './remote.ts'

/** Milliseconds between reads while no session is running. */
export const IDLE_INTERVAL_MS = 60_000

/** Milliseconds between reads while at least one session is running. */
export const BUSY_INTERVAL_MS = 20_000

/** Milliseconds after a turn settles before the confirming read. */
export const SETTLE_DELAY_MS = 1_500

/** The state before the first answer arrives. */
const INITIAL: AccountUsageSnapshot = { status: 'error' }

/** Timer knobs, replaced wholesale in tests. */
export interface AccountUsageFeedOptions {
  /** Milliseconds between reads while nothing is running. */
  readonly idleMs?: number
  /** Milliseconds between reads while something is running. */
  readonly busyMs?: number
  /** Milliseconds after a turn settles before the confirming read. */
  readonly settleMs?: number
}

/** The page-wide account-usage feed. */
export interface AccountUsageFeed {
  /** Latest snapshot; `status` says how much to trust it. */
  readonly store: SnapshotStore<AccountUsageSnapshot>
  /** Read now, unless a read is already in flight. */
  refresh(): void
  /**
   * Report one session's run state, which sets the polling cadence and
   * schedules the confirming read when a turn settles.
   * @param sessionId - the reporting session.
   * @param running - whether that session is running right now.
   */
  setRunning(sessionId: string, running: boolean): void
  /** Stop polling and release listeners. */
  dispose(): void
}

/**
 * Create the page's account-usage feed and start it.
 * @param remote - the Client Remote carrying the `accountUsage` namespace.
 * @param options - timer knobs; defaults are the shipped cadence.
 * @returns the feed, already reading.
 */
export function createAccountUsageFeed(
  remote: AccountUsageRemote,
  options: AccountUsageFeedOptions = {},
): AccountUsageFeed {
  const idleMs = options.idleMs ?? IDLE_INTERVAL_MS
  const busyMs = options.busyMs ?? BUSY_INTERVAL_MS
  const settleMs = options.settleMs ?? SETTLE_DELAY_MS
  const store = createSnapshotStore<AccountUsageSnapshot>(INITIAL)
  const running = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let inFlight = false
  let disposed = false

  // Read through a call rather than the binding: `disposed` flips from a
  // closure the analyzer cannot follow, and reading it directly would let the
  // compiler narrow it to `false` and treat every later guard as dead.
  const alive = (): boolean => !disposed

  const clear = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  const scheduleIn = (ms: number): void => {
    if (!alive()) return
    clear()
    timer = setTimeout(() => {
      timer = undefined
      void pull()
    }, ms)
  }

  const schedule = (): void => { scheduleIn(running.size > 0 ? busyMs : idleMs) }

  const pull = async (): Promise<void> => {
    if (!alive() || inFlight) return
    inFlight = true
    try {
      const result = await remote.accountUsage.read()
      // The Remote face folds carrier failures into the error branch. Either
      // way the previous snapshot stays on screen; the next tick tries again.
      if (result.ok && alive()) store.set(result.value)
    } catch (_unreachableHost) {
      // The carrier is down or the namespace is not mounted. The previous
      // snapshot stays on screen; the next tick tries again. A usage readout
      // must never surface a transport fault as an error state of its own.
    } finally {
      inFlight = false
      if (alive()) schedule()
    }
  }

  const onVisible = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    void pull()
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisible)
  }

  void pull()

  return {
    store,
    refresh: () => { void pull() },
    setRunning: (sessionId, isRunning) => {
      const was = running.size > 0
      if (isRunning) {
        running.add(sessionId)
      } else if (!running.delete(sessionId)) {
        // Not previously running: nothing settled, so no confirming read.
        return
      } else {
        scheduleIn(settleMs)
        return
      }
      if (was !== running.size > 0) schedule()
    },
    dispose: () => {
      disposed = true
      clear()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible)
      }
    },
  }
}

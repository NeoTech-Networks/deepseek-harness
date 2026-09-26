/** Open a pending plan once a Sidebar seat that belongs to its Session is on screen. */
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/**
 * Attempt the automatic open now, and again on every seat change until one succeeds.
 *
 * The seat value is read when the attempt runs, never from a render: switching
 * Sessions releases the old seat and binds the new one in separate effects, so
 * a value captured at render can name a seat that is already gone. An attempt
 * succeeds only when the mounted seat belongs to this review's Session and the
 * open itself does not throw; anything else waits for the next seat change.
 * @param mounted - the Session whose right Sidebar seat is mounted, if any.
 * @param owns - whether a mounted Session may show this review.
 * @param open - performs the open against the mounted seat; may throw without one.
 * @param onOpened - records the successful open exactly once.
 * @returns a disposer that stops waiting.
 */
export function openWhenSeated(
  mounted: ObservableSnapshot<SessionId | undefined>,
  owns: (sessionId: SessionId) => boolean,
  open: () => void,
  onOpened: () => void,
): () => void {
  let done = false
  const attempt = (): boolean => {
    if (done) return true
    const seat = mounted.getSnapshot()
    if (seat === undefined || !owns(seat)) return false
    try {
      open()
    } catch {
      // The seat left between the read and the open; the next bind retries.
      return false
    }
    done = true
    onOpened()
    return true
  }
  if (attempt()) return () => {}
  const unsubscribe = mounted.subscribe(() => {
    if (attempt()) unsubscribe()
  })
  return () => {
    done = true
    unsubscribe()
  }
}

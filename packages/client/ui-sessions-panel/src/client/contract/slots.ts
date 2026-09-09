/**
 * The sessions panel's injected business face, as its body receives it.
 *
 * One callback only: open a session by id. Everything else the body reads is a
 * global framework hook (`useSessions`, `useSessionPendingInteraction`,
 * `useWorkspaces`), so the face stays the single Host action the panel drives.
 */
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** What the body needs from its host beyond the framework shares. */
export interface SessionsPanelInjected {
  /** Open a session, switching the conversation to it. */
  open: (sessionId: SessionId) => void
}

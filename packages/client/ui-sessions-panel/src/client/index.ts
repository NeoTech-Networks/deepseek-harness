/**
 * Browser half: register `sessions` as a right-Sidebar tab type.
 *
 * The type reaches the Sidebar through its public path only: the definition
 * into `ctx.sidebarRightTabs` and the body into the keyed
 * `sidebar.right.pane.tab` seat under the definition's `id`. Nothing here
 * reaches into the Sidebar's store, panes, or sequence. The session list and
 * pending interactions arrive through the global `useSessions` /
 * `useSessionPendingInteraction` hooks, workspaces through `useWorkspaces`, and
 * the one Host action the panel drives (`open`) through its own inject face.
 * Every import from another client plugin is a type.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { SessionsPanel } from './SessionsPanel.tsx'
import { SESSIONS_ID, sessionsDefinition } from './definition.ts'
import { en, zh } from './locales.ts'
import type { SessionsPanelInjected } from './contract/slots.ts'

// Values stay package-private unless another package needs them; the plugin
// surface is `apply`, `inject`, and the types a consumer of the seat names.
export type { SessionsPanelKey } from './locales.ts'
export type { SessionsPanelInjected } from './contract/slots.ts'
export type { SessionsPanelProps } from './SessionsPanel.tsx'

/** This package's copy namespace. */
const NS = 'sessionsPanel'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The sessions panel's title, guide entry, filter, and empty-state copy. */
    sessionsPanel: import('./locales.ts').SessionsPanelKey
  }
}

/**
 * Required browser services: the Session Controller (open), the slot registry,
 * copy, and the tab-type registry.
 */
export const inject = ['sessions', 'slots', 'locale', 'sidebarRightTabs']

/**
 * Client plugin body: register the type, its dictionaries, and its body.
 * @param ctx - client root context carrying the registries, the slots, and copy.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sessions-panel: dictionaries')
  ctx.effect(() => ctx.sidebarRightTabs.register(sessionsDefinition(t)), 'ui-sessions-panel: sessions type')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    {
      name: 'sidebar.right.pane.tab',
      key: SESSIONS_ID,
      locale: NS,
      inject: (): SessionsPanelInjected => ({ open: (sessionId: SessionId) => { ctx.sessions.open(sessionId) } }),
    },
    SessionsPanel,
  )), 'ui-sessions-panel: sessions body')
}

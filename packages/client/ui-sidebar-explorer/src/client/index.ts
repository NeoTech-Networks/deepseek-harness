/**
 * Browser half: register the pinned-directory explorer and its file preview as
 * right-Sidebar tab types, and open the explorer once in every Session.
 *
 * The public two-stage path, unmodified: each type into `ctx.sidebarRightTabs`,
 * each body into the keyed `sidebar.right.pane.tab` seat under that type's `id`.
 *
 * The auto-open is the third registration and the only unusual one, and it is
 * OFF by default. "The explorer is simply there" cannot be a property of the
 * layout; it has to be an action taken once per Session. This module takes it
 * on the edge of `ctx.sidebarRight.mounted` (the Session whose right-Sidebar
 * seat is drawn), through `openTabIn`, which no-ops for a Session whose surface
 * was never mounted instead of throwing. Each Session is opened at most once,
 * so collapsing the column stays collapsed. The operator turns it on with the
 * live `autoOpen` field of the `pinned-files` entry, read once at load.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import {
  EXPLORER_ID, EXPLORER_KIND, EXPLORER_TEXT_ID, explorerDefinition, explorerTextDefinition,
} from './definition.ts'
import { explorerFace, explorerTextFace } from './face.ts'
import { ExplorerBody } from './ExplorerBody.tsx'
import { TextBody } from './TextBody.tsx'
import { en, zh } from './locales.ts'
import { createExplorerStore } from './store.ts'

export type { SidebarExplorerKey } from './locales.ts'
export type { DirLevel, ExplorerState, ExplorerTabState, LevelState, RootsState } from './store.ts'
export type { ExplorerInjected, ExplorerRemote, ExplorerTextInjected } from './face.ts'
export type { ExplorerBodyProps } from './ExplorerBody.tsx'
export type { TextBodyProps } from './TextBody.tsx'

/** This package's copy namespace. */
const NS = 'sidebarExplorer'

/** How long after a Session becomes current its surface is given to mount. */
const SEAT_GRACE_MS = 400

/**
 * Required browser services: the tab registry, the keyed seat, the navigation
 * face the auto-open uses (and its mounted Session), copy, and the Remote
 * carrier with both namespaces this package calls.
 */
export const inject = [
  'slots', 'locale', 'sidebarRightTabs', 'sidebarRight',
  'remote', 'remote.pinnedFiles', 'remote.directoryPicker',
]

/**
 * Client plugin body: register both types, their dictionaries, their bodies,
 * and the per-Session auto-open.
 * @param ctx - client root context carrying the registry, the slots, the
 *   Remote face, and the mounted-Session snapshot.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar-explorer: dictionaries')
  ctx.effect(() => ctx.sidebarRightTabs.register(explorerDefinition(t)), 'ui-sidebar-explorer: explorer type')
  ctx.effect(() => ctx.sidebarRightTabs.register(explorerTextDefinition(t)), 'ui-sidebar-explorer: preview type')

  const store = createExplorerStore()
  const explorerInject = explorerFace(ctx.remote)
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: EXPLORER_ID, locale: NS, store, inject: (_sessionId, actions) => explorerInject(actions) },
    ExplorerBody,
  )), 'ui-sidebar-explorer: explorer tab body')

  const textInject = explorerTextFace(ctx.remote)
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: EXPLORER_TEXT_ID, locale: NS, inject: () => textInject },
    TextBody,
  )), 'ui-sidebar-explorer: preview tab body')

  ctx.effect(() => armAutoOpen(ctx), 'ui-sidebar-explorer: auto-open')
}

/**
 * Open the explorer once in each Session that becomes current, while the
 * operator's `autoOpen` preference allows it.
 * @param ctx - client root context carrying the Sidebar face and its mounted Session.
 * @returns the disposer: the subscription and every pending retry.
 */
function armAutoOpen(ctx: ClientContext): () => void {
  const mounted = ctx.sidebarRight.mounted
  const opened = new Set<SessionId>()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let enabled = false
  let disposed = false

  const open = (sessionId: SessionId): void => {
    if (disposed || !enabled) return
    ctx.sidebarRight.openTabIn(sessionId, EXPLORER_KIND, { revealIfOpened: true })
  }
  const visit = (sessionId: SessionId | undefined): void => {
    if (sessionId === undefined || opened.has(sessionId)) return
    opened.add(sessionId)
    open(sessionId)
    // The surface adopts a Session's store only once its seat has rendered, and
    // `openTabIn` answers a Session it has never seen by doing nothing. One
    // late retry covers the first paint without a polling loop.
    const timer = setTimeout(() => {
      timers.delete(timer)
      open(sessionId)
    }, SEAT_GRACE_MS)
    timers.add(timer)
  }

  void ctx.remote.pinnedFiles.state().then((result) => {
    if (disposed || !result.ok) return
    enabled = result.value.autoOpen
    if (enabled) visit(mounted.getSnapshot())
  })

  let current = mounted.getSnapshot()
  const unsubscribe = mounted.subscribe(() => {
    const next = mounted.getSnapshot()
    if (next === current) return
    current = next
    visit(next)
  })

  return () => {
    disposed = true
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
    unsubscribe()
  }
}

/**
 * Browser half: register `files` as a right-Sidebar tab type.
 *
 * The public two-stage path, unmodified: the type into `ctx.sidebarRightTabs`,
 * the body into the keyed `sidebar.right.pane.tab` seat and the chip title into
 * the keyed `sidebar.right.pane.tab.title` seat, both under the type's `id`.
 *
 * The file split is this package's layering: what the type IS
 * (`definition.tsx`), what it keeps (`store.ts`), how it lists (`face.ts`), what
 * it draws (`FilesBody.tsx`, `FilesTitle.tsx`), what it says (`locales.ts`),
 * and this module, which only wires them together.
 *
 * Besides the tree, this module composes the two "open in a session" gestures
 * the tree offers: `openDirectory` adopts one directory as its own Workspace
 * and opens its Session, and `openSubDirectories` registers every immediate
 * sub-directory under one group label, opening only the first Session. Both
 * delegate to the Workspace Controller's idempotent create-by-path plus the
 * shared `uiWorkspace` navigation capability, so no session stack or duplicate
 * workspace can grow from a repeated gesture.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { IWorkspaces } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { FILES_ID, filesDefinition } from './definition.tsx'
import { createList, filesFace, type FilesOpenCapability } from './face.ts'
import { FilesBody } from './FilesBody.tsx'
import { FilesTitle } from './FilesTitle.tsx'
import { en, zh } from './locales.ts'
import { createFilesStore } from './store.ts'

export type { SidebarFilesKey } from './locales.ts'
export type { DirLevel, FilesState, FilesTabState, LevelState } from './store.ts'
export type { FilesInjected, ListWorkspaceDirectory, WorkspaceFilesListRemote } from './face.ts'
export type { FilesBodyProps } from './FilesBody.tsx'

/** This package's copy namespace. */
const NS = 'sidebarFiles'

/**
 * Required browser services: the tab registry, the keyed seat, the Remote
 * carrier and its namespace, copy, and the Workspace/Session controllers plus
 * the shared navigation capability behind the "open in a session" gestures.
 */
export const inject = [
  'slots', 'locale', 'sidebarRightTabs', 'remote', 'remote.workspaceFiles',
  'workspaces', 'sessions', 'uiWorkspace',
]

/**
 * Client plugin body: register the type, its dictionaries, its body, and its chip title.
 * @param ctx - client root context carrying the registry, the slots, the Remote
 *   face, and the Workspace / Session controllers.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.sidebarRightTabs.register(filesDefinition(t)), 'ui-sidebar-files: files type')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar-files: dictionaries')

  const workspaces: IWorkspaces = ctx.workspaces
  const sessions: ISessions = ctx.sessions
  const uiWorkspace: UiWorkspace = ctx.uiWorkspace
  const capability: FilesOpenCapability = {
    openDirectory: path => uiWorkspace.openDirectory(path),
    openSubDirectories: async (_sessionId, paths, group) => {
      let opened = 0
      for (const path of paths) {
        const workspace = await workspaces.create({ path })
        if (workspace.group === '' && group !== '') {
          await workspaces.setGroup(workspace.workspaceId, group)
        }
        if (opened === 0) {
          const childSession = await uiWorkspace.connectWorkspace(workspace.workspaceId)
          sessions.open(childSession)
        }
        opened += 1
      }
      return opened
    },
    groupFor: (sessionId) => {
      const items = workspaces.list.getSnapshot().items
      const owner = items.find(item => item.sessionIds.includes(sessionId))
      return owner === undefined ? '' : (owner.group !== '' ? owner.group : owner.title)
    },
  }

  const store = createFilesStore()
  const inject = filesFace(createList(ctx.remote), capability)
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: FILES_ID, locale: NS, store, inject },
    FilesBody,
  )), 'ui-sidebar-files: files tab body')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab.title', key: FILES_ID },
    FilesTitle,
  )), 'ui-sidebar-files: files tab title')
}

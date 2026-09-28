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
 * It also composes the two "new session" gestures a directory row offers:
 * adopt one directory as its own Workspace and open a Session there, or adopt
 * every immediate sub-directory under one group label and open a Session in
 * the first. Both go through the Workspace Controller's idempotent
 * create-by-path and the shared `uiWorkspace` navigation, so repeating a
 * gesture reuses the Workspace and its blank Session instead of stacking new
 * ones. The Workspace services are read when a gesture runs, not injected: a
 * Client composed without them keeps the tree and offers no menu.
 */
import type { ShortcutCommandId } from '@deepseek-ai/dsh-client-shortcuts/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/types'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { FILES_ID, filesDefinition } from './definition.tsx'
import { createList, createWatch, filesFace } from './face.ts'
import type { FilesOpenCapability } from './face.ts'
import { FilesBody } from './FilesBody.tsx'
import { FilesTitle } from './FilesTitle.tsx'
import { en, zh } from './locales.ts'
import { createFilesStore } from './store.ts'

export type { SidebarFilesKey } from './locales.ts'
export type { DirLevel, FilesState, FilesTabState, LevelState } from './store.ts'
export type {
  FilesInjected, FilesOpenCapability, ListWorkspaceDirectory, SubDirectoryCandidate, WorkspaceFilesListRemote,
} from './face.ts'
export type { FilesBodyProps } from './FilesBody.tsx'

/** This package's copy namespace. */
const NS = 'sidebarFiles'

/**
 * The group-label surface a Workspace Controller may carry. Upstream has none;
 * a build that adds Workspace groups exposes `setGroup` and a `group` field on
 * each Workspace, and the bulk flow then labels what it adopts.
 */
interface WorkspaceGrouping {
  readonly setGroup?: (workspaceId: WorkspaceView['workspaceId'], group: string) => Promise<unknown>
}

/**
 * A Workspace's group label, or empty when it has none or groups do not exist.
 * @param workspace - a Workspace as the controller lists it.
 * @returns its group label.
 */
function groupOf(workspace: WorkspaceView): string {
  const group: unknown = (workspace as WorkspaceView & { readonly group?: unknown }).group
  return typeof group === 'string' ? group : ''
}

/**
 * Bind the "new session" gestures to whatever Workspace services the Client composed.
 * @param ctx - client root context.
 * @returns the capability the tree's face calls.
 */
export function workspaceOpenCapability(ctx: ClientContext): FilesOpenCapability {
  const services = () => {
    const workspaces = ctx.get('workspaces')
    const uiWorkspace = ctx.get('uiWorkspace')
    if (workspaces === undefined || uiWorkspace === undefined) throw new Error('the Workspace services are not composed')
    return { workspaces, uiWorkspace }
  }
  const setGroupOf = (): WorkspaceGrouping['setGroup'] => (ctx.get('workspaces') as WorkspaceGrouping | undefined)?.setGroup
  return {
    available: () => ctx.get('workspaces') !== undefined && ctx.get('uiWorkspace') !== undefined,
    supportsGroups: () => typeof setGroupOf() === 'function',
    openDirectory: async (path) => {
      const { workspaces, uiWorkspace } = services()
      const workspace = await workspaces.create({ path })
      await uiWorkspace.openWorkspace(workspace.workspaceId)
    },
    openSubDirectories: async (paths, group) => {
      const { workspaces, uiWorkspace } = services()
      const setGroup = setGroupOf()
      let first: WorkspaceView['workspaceId'] | undefined
      let ready = 0
      for (const path of paths) {
        const workspace = await workspaces.create({ path })
        if (setGroup !== undefined && group !== '' && groupOf(workspace) === '') {
          await setGroup.call(workspaces, workspace.workspaceId, group)
        }
        first ??= workspace.workspaceId
        ready += 1
      }
      if (first !== undefined) await uiWorkspace.openWorkspace(first)
      return ready
    },
    groupFor: (sessionId) => {
      const owner = ctx.get('workspaces')?.list.getSnapshot().items.find(item => item.sessionIds.includes(sessionId))
      if (owner === undefined) return ''
      const group = groupOf(owner)
      return group !== '' ? group : owner.title
    },
  }
}

/**
 * Required browser services: the tab registry, the keyed seat, the Remote
 * carrier and its namespace, and copy.
 */
export const inject = ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight', 'remote', 'remote.workspaceFiles']

/**
 * Client plugin body: register the type, its dictionaries, its body, and its chip title.
 * @param ctx - client root context carrying the registry, the slots, and the Remote face.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.inject(['shortcuts'], (ctx) => {
    ctx.effect(() => ctx.shortcuts.register({
      id: 'workspace.files' as ShortcutCommandId, label: () => t('guide.title'), aliases: ['workspace files', 'files'],
      defaults: {
        'desktop:macos': { code: 'KeyP', modifiers: ['primary'] },
        'desktop:windows': { code: 'KeyP', modifiers: ['primary'] },
        'desktop:linux': { code: 'KeyP', modifiers: ['primary'] },
        'web:macos': { code: 'KeyP', modifiers: ['primary', 'alt'] },
        'web:windows': { code: 'KeyP', modifiers: ['primary', 'alt'] },
      },
      // Each tab plugin owns its command's availability, localized refusal, and tab kind.
      /* jscpd:ignore-start */
      regions: ['page', 'editable', 'terminal'], modals: [],
      resolve: ({ target: element }) => {
        const target = ctx.sidebarRight.commandTarget(element)
        if (target === undefined) return { status: 'blocked', reason: t('shortcut.noSession') }
        return { status: 'handled', run: () => { ctx.sidebarRight.openTabFromTarget('files', target) } }
      },
      /* jscpd:ignore-end */
    }), 'ui-sidebar-files: shortcut')
  })
  ctx.effect(() => ctx.sidebarRightTabs.register(filesDefinition(t)), 'ui-sidebar-files: files type')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar-files: dictionaries')

  const store = createFilesStore()
  const inject = filesFace(createList(ctx.remote), createWatch(ctx.remote), workspaceOpenCapability(ctx))
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: FILES_ID, locale: NS, store, inject },
    FilesBody,
  )), 'ui-sidebar-files: files tab body')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab.title', key: FILES_ID },
    FilesTitle,
  )), 'ui-sidebar-files: files tab title')
}

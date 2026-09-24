/**
 * The plugin's registrations, and their removal when the plugin goes.
 *
 * The registry is real, because "registered" means what it says a type is; the
 * slot, locale, and Remote faces are recorders, because what matters here is
 * what was handed to them — one body seat under the type's id with its store
 * and face — and that every registration is gone after dispose, which is what
 * makes a reload safe.
 */
import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { SidebarRightTabRegistry } from '@deepseek-ai/dsh-client-ui-sidebar-right/src/client/tab-registry.ts'
import { FILES_ID, FILES_KIND } from '../src/client/definition.tsx'
import { apply, inject, workspaceOpenCapability } from '../src/client/index.ts'
import { apply as hostApply } from '../src/index.ts'
import { FilesBody } from '../src/client/FilesBody.tsx'
import { FilesTitle } from '../src/client/FilesTitle.tsx'
import { en, zh } from '../src/client/locales.ts'

interface Recorded {
  name: string
  key: string
  locale: string
  store: unknown
  inject: unknown
  component: unknown
}

async function boot() {
  const ctx = new Context()
  const tabs = new SidebarRightTabRegistry(ctx)
  const registered: Recorded[] = []
  const slots = {
    inject: vi.fn((_name: string, register: () => () => void) => register()),
    register: vi.fn((options: Omit<Recorded, 'component'>, component: unknown) => {
      const entry: Recorded = { ...options, component }
      registered.push(entry)
      return () => { registered.splice(registered.indexOf(entry), 1) }
    }),
  }
  const dictionaries = new Map<string, unknown>()
  const locale = {
    // Copy is the dictionary's contract; the key stands in for the translation.
    bind: vi.fn(() => (key: string) => key),
    register: vi.fn((ns: string, dicts: unknown) => {
      dictionaries.set(ns, dicts)
      return () => { dictionaries.delete(ns) }
    }),
  }
  const workspaceFiles = { list: vi.fn() }
  ctx.provide('sidebarRightTabs', tabs as never)
  ctx.provide('slots', slots as never)
  ctx.provide('locale', locale as never)
  ctx.provide('remote', { workspaceFiles } as never)
  ctx.provide('remote.workspaceFiles', workspaceFiles as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { tabs, registered, dictionaries, fiber }
}

describe('ui-sidebar-files apply', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('registers the type, its dictionaries, and the body and title seats under the type\'s id', async () => {
    const { tabs, registered, dictionaries } = await boot()
    const definition = tabs.get(FILES_KIND)
    expect(definition?.id).toBe(FILES_ID)
    expect(definition?.priority).toBe('builtin')
    expect(definition?.title('sidebar://files')).toBe('type.label')
    expect(definition?.guide?.map(entry => [entry.order, entry.title(), entry.description?.()]))
      .toEqual([[10, 'guide.title', 'guide.description']])
    expect(dictionaries.get('sidebarFiles')).toEqual({ zh, en })
    // The seat key is the implementation's id, not the kind: an extension may
    // take the kind over, and the seat must still find this body.
    expect(registered.map(entry => [entry.name, entry.key, entry.locale, entry.component])).toEqual([
      ['sidebar.right.pane.tab', FILES_ID, 'sidebarFiles', FilesBody],
      ['sidebar.right.pane.tab.title', FILES_ID, undefined, FilesTitle],
    ])
    expect(registered[0]?.store).toBeDefined()
    expect(typeof registered[0]?.inject).toBe('function')
  })

  it('takes every registration back when the plugin is disposed', async () => {
    const { tabs, registered, dictionaries, fiber } = await boot()
    await fiber.dispose()
    expect(tabs.get(FILES_KIND)).toBeUndefined()
    expect(registered).toEqual([])
    expect(dictionaries.size).toBe(0)
  })
})

describe('workspaceOpenCapability', () => {
  interface Item { workspaceId: string; path: string; title: string; group?: string; sessionIds: string[] }
  function services(options: { grouping: boolean; items?: Item[] }) {
    const items: Item[] = options.items ?? []
    const workspaces: Record<string, unknown> = {
      list: { getSnapshot: () => ({ items }) },
      create: vi.fn(async ({ path }: { path: string }) => {
        const existing = items.find(item => item.path === path)
        if (existing !== undefined) return existing
        const created: Item = { workspaceId: `w:${path}`, path, title: path.split('/').at(-1)!, sessionIds: [], ...options.grouping ? { group: '' } : {} }
        items.push(created)
        return created
      }),
    }
    if (options.grouping) workspaces.setGroup = vi.fn(async function (this: unknown) { return this })
    const uiWorkspace = { openWorkspace: vi.fn(async () => {}) }
    return { workspaces, uiWorkspace, items }
  }

  it('is unavailable until both Workspace services are composed', () => {
    const ctx = new Context()
    const capability = workspaceOpenCapability(ctx)
    expect(capability.available()).toBe(false)
    expect(capability.supportsGroups()).toBe(false)
    expect(capability.groupFor('s-1' as never)).toBe('')
    return expect(capability.openDirectory('/w/a')).rejects.toThrow('not composed')
  })

  it('adopts one directory and opens its Workspace', async () => {
    const ctx = new Context()
    const { workspaces, uiWorkspace } = services({ grouping: false })
    ctx.provide('workspaces', workspaces as never)
    ctx.provide('uiWorkspace', uiWorkspace as never)
    const capability = workspaceOpenCapability(ctx)
    expect(capability.available()).toBe(true)
    expect(capability.supportsGroups()).toBe(false)
    await capability.openDirectory('/w/overlord')
    expect(workspaces.create).toHaveBeenCalledWith({ path: '/w/overlord' })
    expect(uiWorkspace.openWorkspace).toHaveBeenCalledWith('w:/w/overlord')
  })

  it('adopts each sub-folder, labels ungrouped ones when groups exist, and opens only the first', async () => {
    const ctx = new Context()
    const { workspaces, uiWorkspace } = services({
      grouping: true,
      items: [{ workspaceId: 'w:/w/kept', path: '/w/kept', title: 'kept', group: 'other', sessionIds: [] }],
    })
    ctx.provide('workspaces', workspaces as never)
    ctx.provide('uiWorkspace', uiWorkspace as never)
    const capability = workspaceOpenCapability(ctx)
    expect(capability.supportsGroups()).toBe(true)
    await expect(capability.openSubDirectories(['/w/a', '/w/kept', '/w/b'], 'sig')).resolves.toBe(3)
    expect(workspaces.setGroup).toHaveBeenCalledTimes(2)
    expect(workspaces.setGroup).toHaveBeenNthCalledWith(1, 'w:/w/a', 'sig')
    expect(workspaces.setGroup).toHaveBeenNthCalledWith(2, 'w:/w/b', 'sig')
    // setGroup keeps its controller receiver.
    expect(vi.mocked(workspaces.setGroup as () => unknown).mock.contexts[0]).toBe(workspaces)
    expect(uiWorkspace.openWorkspace).toHaveBeenCalledTimes(1)
    expect(uiWorkspace.openWorkspace).toHaveBeenCalledWith('w:/w/a')
  })

  it('skips labelling for an empty label or a build without groups, and opens nothing for no paths', async () => {
    const ctx = new Context()
    const { workspaces, uiWorkspace } = services({ grouping: false })
    ctx.provide('workspaces', workspaces as never)
    ctx.provide('uiWorkspace', uiWorkspace as never)
    const capability = workspaceOpenCapability(ctx)
    await expect(capability.openSubDirectories(['/w/a'], 'sig')).resolves.toBe(1)
    await expect(capability.openSubDirectories([], 'sig')).resolves.toBe(0)
    expect(uiWorkspace.openWorkspace).toHaveBeenCalledTimes(1)

    const grouped = new Context()
    const withGroups = services({ grouping: true })
    grouped.provide('workspaces', withGroups.workspaces as never)
    grouped.provide('uiWorkspace', withGroups.uiWorkspace as never)
    await workspaceOpenCapability(grouped).openSubDirectories(['/w/a'], '')
    expect(withGroups.workspaces.setGroup).not.toHaveBeenCalled()
  })

  it('prefills the owning Workspace group, else its title, else nothing', () => {
    const ctx = new Context()
    const { workspaces, uiWorkspace, items } = services({
      grouping: true,
      items: [{ workspaceId: 'w1', path: '/w/sig', title: 'sig-railway-services', group: 'sig', sessionIds: ['s-1'] }],
    })
    ctx.provide('workspaces', workspaces as never)
    ctx.provide('uiWorkspace', uiWorkspace as never)
    const capability = workspaceOpenCapability(ctx)
    expect(capability.groupFor('s-1' as never)).toBe('sig')
    items[0]!.group = ''
    expect(capability.groupFor('s-1' as never)).toBe('sig-railway-services')
    expect(capability.groupFor('s-2' as never)).toBe('')
  })
})

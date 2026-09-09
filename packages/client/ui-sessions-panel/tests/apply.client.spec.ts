/**
 * The plugin's registrations, and their removal when the plugin goes.
 *
 * The registry is real, because "registered" means what it says a type is; the
 * slot, locale, and session faces are recorders, because what matters here is
 * what was handed to them — one body seat under the type's id with an `open`
 * face — and that every registration is gone after dispose, which is what
 * makes a reload safe.
 */
import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { SidebarRightTabRegistry } from '@deepseek-ai/dsh-client-ui-sidebar-right/src/client/tab-registry.ts'
import { SESSIONS_ID, SESSIONS_KIND } from '../src/client/definition.ts'
import { apply, inject } from '../src/client/index.ts'
import { apply as hostApply } from '../src/index.ts'
import { SessionsPanel } from '../src/client/SessionsPanel.tsx'
import { en, zh } from '../src/client/locales.ts'

interface Recorded {
  name: string
  key: string
  locale: string
  inject?: () => unknown
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
  const sessions = { open: vi.fn() }
  ctx.provide('sidebarRightTabs', tabs as never)
  ctx.provide('slots', slots as never)
  ctx.provide('locale', locale as never)
  ctx.provide('sessions', sessions as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { tabs, registered, dictionaries, sessions, fiber }
}

describe('ui-sessions-panel apply', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('registers the type, its dictionaries, and the body seat under the type\'s id', async () => {
    const { tabs, registered, dictionaries } = await boot()
    const definition = tabs.get(SESSIONS_KIND)
    expect(definition?.id).toBe(SESSIONS_ID)
    expect(definition?.priority).toBe('builtin')
    expect(definition?.title('sidebar://sessions')).toBe('tab.title')
    expect(definition?.guide).toHaveLength(1)
    expect(definition?.guide?.[0]?.title()).toBe('guide.title')
    expect(definition?.guide?.[0]?.order).toBe(10)
    expect(dictionaries.get('sessionsPanel')).toEqual({ zh, en })
    // The seat key is the implementation's id, not the kind.
    expect(registered.map(entry => [entry.name, entry.key, entry.locale, entry.component])).toEqual([
      ['sidebar.right.pane.tab', SESSIONS_ID, 'sessionsPanel', SessionsPanel],
    ])
  })

  it('injects an open action that opens the session through the controller', async () => {
    const { registered, sessions } = await boot()
    const face = registered[0]?.inject?.() as { open: (id: string) => void }
    expect(typeof face.open).toBe('function')
    face.open('s-test')
    expect(sessions.open).toHaveBeenCalledWith('s-test')
  })

  it('takes every registration back when the plugin is disposed', async () => {
    const { tabs, registered, dictionaries, fiber } = await boot()
    await fiber.dispose()
    expect(tabs.get(SESSIONS_KIND)).toBeUndefined()
    expect(registered).toEqual([])
    expect(dictionaries.size).toBe(0)
  })
})

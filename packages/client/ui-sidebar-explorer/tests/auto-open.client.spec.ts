/**
 * The explorer's auto-open is off by default and, when the operator turns it
 * on, follows the Session the right-Sidebar seat is drawing
 * (`ctx.sidebarRight.mounted`), opening the explorer at most once per Session.
 */
import { Context } from '@deepseek-ai/cordis'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { explorerDefinition } from '../src/client/definition.ts'

async function mount(autoOpen: boolean) {
  const ctx = new Context()
  const mounted = createSnapshotStore<SessionId | undefined>(undefined)
  const openTabIn = vi.fn()
  ctx.provide('locale', { bind: () => (key: string) => key, register: () => () => {} } as never)
  ctx.provide('slots', { inject: () => () => {}, register: () => () => {} } as never)
  ctx.provide('sidebarRightTabs', { register: () => () => {} } as never)
  ctx.provide('sidebarRight', { openTabIn, mounted } as never)
  const remote = {
    pinnedFiles: { state: () => Promise.resolve({ ok: true, value: { roots: [], autoOpen } }) },
    directoryPicker: { pick: () => Promise.resolve({ ok: true, value: null }) },
  }
  ctx.provide('remote', remote as never)
  ctx.provide('remote.pinnedFiles', remote.pinnedFiles as never)
  ctx.provide('remote.directoryPicker', remote.directoryPicker as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  onTestFinished(async () => { await fiber.dispose() })
  await fiber.await()
  await Promise.resolve()
  return { mounted, openTabIn }
}

describe('ui-sidebar-explorer auto-open', () => {
  it('never opens the explorer while autoOpen is off (the default)', async () => {
    const { mounted, openTabIn } = await mount(false)
    mounted.set('s1' as SessionId)
    mounted.set('s2' as SessionId)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(openTabIn).not.toHaveBeenCalled()
  })

  it('opens the explorer once per mounted Session when autoOpen is on', async () => {
    vi.useFakeTimers()
    onTestFinished(() => { vi.useRealTimers() })
    const { mounted, openTabIn } = await mount(true)
    await vi.advanceTimersByTimeAsync(0)
    mounted.set('s1' as SessionId)
    mounted.set('s2' as SessionId)
    mounted.set('s1' as SessionId)
    // The immediate open plus one late retry per newly seen Session.
    await vi.advanceTimersByTimeAsync(1_000)
    const sessions = openTabIn.mock.calls.map(call => call[0] as string)
    expect(new Set(sessions)).toEqual(new Set(['s1', 's2']))
    expect(sessions.filter(id => id === 's1')).toHaveLength(2)
    expect(openTabIn.mock.calls.every(call => call[1] === 'explorer')).toBe(true)
  })
})

describe('explorer definition', () => {
  it('contributes one guide entry with a stable id', () => {
    const definition = explorerDefinition((key: string) => key)
    expect(definition.guide?.map(entry => entry.id)).toEqual(['pinned'])
  })
})

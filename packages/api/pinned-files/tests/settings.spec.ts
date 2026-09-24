/**
 * The pinned roots and the explorer preference are the plugin's own volatile
 * Config fields on the `pinned-files` profile entry. These cases pin the three
 * facts the 0.1.7 rehome depends on: the fields are volatile (so the settings
 * form and the one-time legacy settings.yaml import accept them), autoOpen
 * defaults off, and every edit goes through `settings.update` on that entry.
 */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { afterEach, describe, expect, it } from 'vitest'
import { PinnedFiles, name } from '../src/index.ts'
import type { Config } from '../src/index.ts'

const signal = (): AbortSignal => new AbortController().signal

/** A live-field stand-in with the one method the service reads. */
function live<T>(initial: T): { get: () => T; set: (value: T) => void } {
  let value = initial
  return { get: () => value, set: (next: T) => { value = next } }
}

const cleanups: Array<() => Promise<void>> = []
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function harness(options: { entry?: string; settings?: boolean } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-pinned-files-'))
  const ctx = new Context()
  const fiber = await ctx.plugin(LocalFileSystem, { cwd: root })
  const roots = live<string[]>([])
  const autoOpen = live(false)
  const updates: Array<[string, object]> = []
  if (options.settings === true) {
    ctx.provide('settings', {
      update: (ns: string, patch: object) => {
        updates.push([ns, patch])
        const next = patch as { roots?: string[]; autoOpen?: boolean }
        if (next.roots !== undefined) roots.set(next.roots)
        if (next.autoOpen !== undefined) autoOpen.set(next.autoOpen)
        return Promise.resolve()
      },
    } as never)
  }
  if (options.entry !== undefined) {
    Object.defineProperty(ctx.fiber, 'entry', { value: { options: { id: options.entry } }, configurable: true })
  }
  const config = { maxEntries: 2000, maxBytes: 1024 * 1024, roots, autoOpen } as unknown as Config
  const service = new PinnedFiles(ctx, config)
  cleanups.push(async () => {
    await fiber.dispose()
    await rm(root, { recursive: true, force: true })
  })
  return { root, service, updates }
}

describe('pinned-files Config', () => {
  it('is mounted under the entry id the legacy settings section imports into', () => {
    expect(name).toBe('pinned-files')
  })

  it('declares roots and autoOpen volatile, with autoOpen off by default', () => {
    const parsed = PinnedFiles.Config({}) as unknown as Record<string, unknown>
    const roots = parsed.roots as { get: () => string[] }
    const autoOpen = parsed.autoOpen as { get: () => boolean }
    expect(typeof roots.get).toBe('function')
    expect(typeof autoOpen.get).toBe('function')
    expect(roots.get()).toEqual([])
    expect(autoOpen.get()).toBe(false)
    // The deployment caps stay ordinary config: a settings form cannot edit them.
    expect(parsed.maxEntries).toBe(2000)
  })
})

describe('pinned-files persistence', () => {
  it('reports the live fields as state', async () => {
    const { service } = await harness()
    await expect(service.state(signal())).resolves.toEqual({ roots: [], autoOpen: false })
  })

  it('writes a pinned root and the preference into its own profile entry', async () => {
    const { root, service, updates } = await harness({ entry: 'pinned-files', settings: true })
    const state = await service.addRoot(root, signal())
    expect(state.roots.map(pinned => [pinned.path, pinned.available])).toEqual([[root.replace(/[/\\]+$/, ''), true]])
    await expect(service.setAutoOpen(true, signal())).resolves.toMatchObject({ autoOpen: true })
    expect(updates).toEqual([
      ['pinned-files', { roots: [root.replace(/[/\\]+$/, '')] }],
      ['pinned-files', { autoOpen: true }],
    ])
  })

  it('refuses an edit as not-writable when no settings service or entry exists', async () => {
    const { service } = await harness()
    const error = await service.setAutoOpen(true, signal()).catch((caught: unknown) => caught)
    expect(remoteErrorOf(error)?.code).toBe('pinned-files/not-writable')
  })
})

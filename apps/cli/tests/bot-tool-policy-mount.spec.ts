/**
 * The Bot Tool Policy bundle as an installation carries it: resolved from the dsh
 * package a host boots from, composed by the same profile load a host runs, and
 * mounted through the real Loader beside the real Claude Code hook bridge. Only the
 * shell under the bridge is replaced, so the ordering also runs where no bash exists.
 */

import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import {
  composeEntries, initProfile, loadProfileDirectory, OPTIONAL_BUNDLES, PROFILE_TEMPLATES, resolveBundleDir,
} from '@deepseek-ai/dsh-app-boot'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import { INSTALL_ANCHOR } from '../src/profile-boot.ts'

const BUNDLE = '@deepseek-ai/dsh-experimental-bot-tool-policy'
const BRIDGE = '@deepseek-ai/dsh-hooks-claude-code'
const STAGE = 'tools/pre-execute'
const SIGNAL = new AbortController().signal
const packageDirectory = fileURLToPath(new URL('../../../packages/experimental/bot-tool-policy', import.meta.url))

const roots: string[] = []
afterEach(() => {
  vi.unstubAllEnvs()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true, maxRetries: 5 })
})

function temporaryRoot(): string {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'dsh-bot-tool-policy-mount-')))
  roots.push(root)
  return root
}

function manifest(path: string): { dependencies: Record<string, string> } {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as { dependencies: Record<string, string> }
}

/** Load a Web profile selecting the bundle the way a host loads a profile on disk. */
function selectedProfile(): ReturnType<typeof composeEntries> {
  const directory = join(temporaryRoot(), 'profile')
  initProfile(directory, [...PROFILE_TEMPLATES.web!.bundles, BUNDLE])
  const profile = loadProfileDirectory('dsh', directory, INSTALL_ANCHOR)
  expect(profile.skippedBundles).toEqual([])
  const warnings: string[] = []
  const entries = composeEntries(profile.layers.map(layer => layer.patches), warning => warnings.push(warning))
  expect(warnings).toEqual([])
  return entries
}

describe('host resolution', () => {
  it('names the bundle as a runtime dependency of the package every host boots from', () => {
    expect(manifest('../package.json').dependencies[BUNDLE]).toBe('workspace:*')
    expect(manifest('../../desktop-host/package.json').dependencies['@deepseek-ai/dsh']).toBe('workspace:*')
    expect(OPTIONAL_BUNDLES).toContain(BUNDLE)
  })

  it('resolves the bundle from the installation with nothing installed in the profile', () => {
    const profile = join(temporaryRoot(), 'empty-profile')
    mkdirSync(profile)
    const directory = resolveBundleDir('dsh', BUNDLE, INSTALL_ANCHOR, profile)
    // The pnpm launcher of this test process adds `.pnpm/node_modules` to NODE_PATH, a second
    // route a host does not have, so only a hit under the anchor's own node_modules proves the link.
    expect(directory).toBe(join(dirname(INSTALL_ANCHOR), 'node_modules', BUNDLE))
    expect(realpathSync.native(directory)).toBe(realpathSync.native(packageDirectory))
    expect(realpathSync.native(dirname(INSTALL_ANCHOR))).toBe(realpathSync.native(resolve(packageDirectory, '../../../apps/cli')))
  })
})

describe('profile composition', () => {
  it('mounts one enabled Host row from a profile that selects the bundle', () => {
    const rows = selectedProfile().filter(row => row.name === BUNDLE)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'bot-tool-policy', name: BUNDLE })
    expect(rows[0]?.disabled).toBeUndefined()
  })

  it('stays out of every shipped template', () => {
    for (const template of Object.values(PROFILE_TEMPLATES)) expect(template.bundles).not.toContain(BUNDLE)
  })
})

describe('order at the tool dispatcher', () => {
  /** Mount the composed policy row after a bridge row, the harder order: `prepend` alone puts it first. */
  async function mountBesideBridge() {
    const home = temporaryRoot()
    vi.stubEnv('DSH_HOME', home)
    const granted = join(home, 'granted')
    const elsewhere = join(home, 'elsewhere')
    mkdirSync(join(home, 'bot'))
    writeFileSync(join(home, 'bot', 'tool-policy.json'), JSON.stringify({
      version: 1, secretFiles: [], secretCommandFragments: [],
      operatorRoot: { root: join(home, 'bot'), except: [] },
      everyone: [{ root: granted, kinds: ['write'] }], tiers: [], bots: {},
    }))
    writeFileSync(join(home, 'bot', 'state.json'), JSON.stringify({ bots: { r: { name: 'Scout', sessionId: 'bot-session' } }, rooms: {} }))
    const hooksPath = join(home, 'hooks.json')
    writeFileSync(hooksPath, JSON.stringify({ hooks: { PreToolUse: [{ hooks: [{ type: 'command', command: 'hook-ran' }] }] } }))

    const ran: string[] = []
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
    await ctx.plugin(AgentLoop, { agents: [] })
    ctx.provide('shell', {
      resolve: (request: { command: string }) => request,
      async execute(request: { command: string }) {
        ran.push(request.command)
        return { result: async () => ({ exitCode: 0, stdout: { text: '' }, stderr: { text: '' } }) }
      },
    })
    ctx.tools.register(defineContentToolFixture({
      name: 'write', description: 'write a file', parameters: { file_path: { type: 'string', required: true } },
      async execute() { return [{ type: 'text', text: 'written' }] },
    }))
    await ctx.plugin(Loader)
    ctx.loader.internal = {
      version: 'v2',
      import: async (specifier: string): Promise<unknown> => await import(/* @vite-ignore */ specifier),
    } as unknown as NonNullable<typeof ctx.loader.internal>

    const policyRow = selectedProfile().find(row => row.name === BUNDLE)
    if (policyRow === undefined) throw new Error('the composed profile has no policy row')
    const bridgeRow = { id: 'hooks-claude-code', name: BRIDGE, config: { configPath: hooksPath } }
    await ctx.loader.create(bridgeRow)
    await ctx.loader.await()
    await ctx.loader.create(policyRow)
    await ctx.loader.await()

    const write = (agent: Agent, path: string) => ctx.tools.execute({
      callId: ToolCallId(`mount-${path}`), name: 'write', arguments: { file_path: path }, signal: SIGNAL, agent,
    })
    return { ctx, ran, granted, elsewhere, write }
  }

  it('registers at the front of tools/pre-execute with prepend, ahead of a bridge mounted first', async () => {
    const { ctx } = await mountBesideBridge()
    try {
      const listeners = ctx.events._hooks[STAGE] ?? []
      const owners = listeners.map(listener => listener.ctx.fiber.entry?.options.id)
      expect(owners[0]).toBe('bot-tool-policy')
      expect(owners).toContain('hooks-claude-code')
      expect(listeners[0]?.prepend).toBe(true)
    } finally {
      await ctx.fiber.dispose()
    }
  })

  it('refuses a bot call before the bridge runs a hook, and passes a permitted call on to it', async () => {
    const { ctx, ran, granted, elsewhere, write } = await mountBesideBridge()
    try {
      const agent = await ctx.agentLoop.create(SessionId('bot-session'), { provider: 'mock', model: 'mock' })
      const refused = await write(agent, join(elsewhere, 'app.py'))
      expect(refused.isError).toBe(true)
      expect(refused.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')).toContain('Scout may not write to')
      expect(ran).toEqual([])

      const permitted = await write(agent, join(granted, 'app.py'))
      expect(permitted.isError).toBe(false)
      expect(ran).toEqual(['hook-ran'])
    } finally {
      await ctx.fiber.dispose()
    }
  })
})

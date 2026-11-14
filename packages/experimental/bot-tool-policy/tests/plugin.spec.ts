/**
 * The policy through real filesystem tools on real files, plus the behaviour the
 * hook's self-test does not reach: identity, fail-open, ordering and traversal.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as ToolFs from '@deepseek-ai/dsh-tool-fs'
import { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import * as BotToolPolicy from '../src/index.ts'
import { absolutePath, classifyTool, decide, parsePolicy, parseRoster } from '../src/index.ts'
import type { BotToolPolicy as Policy } from '../src/index.ts'

const SIGNAL = new AbortController().signal

interface World {
  ctx: Context
  fiber: Awaited<ReturnType<Context['plugin']>>
  home: string
  workspace: string
  exports: string
  ownRepo: string
  otherRepo: string
  operator: string
  secrets: string
  policyPath: string
  storePath: string
  warn: ReturnType<typeof vi.fn>
  bot: (name: string) => Promise<Agent>
}

let world: World | undefined
let sessionNumber = 0

function policyFor(root: string): Policy {
  return {
    version: 1,
    secretFiles: [join(root, 'bot', 'secrets.json')],
    secretCommandFragments: ['.dsh/bot/secrets.json'],
    operatorRoot: { root: join(root, 'bot'), except: [join(root, 'bot', 'workspace')] },
    everyone: [
      { root: join(root, 'bot', 'workspace'), kinds: ['write'] },
      { root: join(root, 'Exports'), kinds: ['write'] },
    ],
    tiers: [],
    bots: { 'SIG Code': [{ root: join(root, 'repos', 'sig'), kinds: ['write'] }] },
  }
}

async function setup(): Promise<World> {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'dsh-bot-tool-policy-')))
  const operator = join(home, 'bot')
  const workspace = join(operator, 'workspace')
  const exports = join(home, 'Exports')
  const ownRepo = join(home, 'repos', 'sig')
  const otherRepo = join(home, 'repos', 'abc')
  for (const dir of [workspace, exports, ownRepo, otherRepo]) mkdirSync(dir, { recursive: true })
  const secrets = join(operator, 'secrets.json')
  writeFileSync(secrets, '{"token":"never"}')
  const policyPath = join(home, 'tool-policy.json')
  writeFileSync(policyPath, JSON.stringify(policyFor(home)))
  const storePath = join(operator, 'state.json')
  const bots: Record<string, unknown> = {}
  writeFileSync(storePath, JSON.stringify({ bots, rooms: {} }))

  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(LocalFileSystem, { cwd: workspace })
  await ctx.plugin(ToolFs)
  const fiber = await ctx.plugin(BotToolPolicy, { policyPath, storePath })
  const warn = vi.fn()
  ctx.logger.warn = warn

  const bot = async (name: string): Promise<Agent> => {
    const id = `session-${++sessionNumber}`
    const agent = await ctx.agentLoop.create(SessionId(id), { provider: 'mock', model: 'mock' })
    bots[`record-${name}`] = { id: `record-${name}`, name, sessionId: id, workDir: workspace }
    writeFileSync(storePath, JSON.stringify({ bots, rooms: {} }))
    return agent
  }
  return { ctx, fiber, home, workspace, exports, ownRepo, otherRepo, operator, secrets, policyPath, storePath, warn, bot }
}

beforeEach(async () => { world = await setup() })
afterEach(async () => {
  await world?.fiber.dispose()
  if (world !== undefined) rmSync(world.home, { recursive: true, force: true, maxRetries: 5 })
  world = undefined
})

let call = 0
const execute = (ctx: Context, agent: Agent, name: string, args: unknown) =>
  ctx.tools.execute({ callId: ToolCallId(`policy-${++call}`), name, arguments: args, signal: SIGNAL, agent })
const textOf = (result: Awaited<ReturnType<typeof execute>>): string =>
  result.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')

describe('real filesystem tools', () => {
  it('refuses a bot writing into a repo it does not own, and names the bot, the path and the roots', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const target = join(w.otherRepo, 'app.py')
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'x' })
    expect(result.isError).toBe(true)
    const text = textOf(result)
    expect(text).toContain('Backlink Scout may not write to')
    expect(text).toContain(target)
    expect(text).toContain(w.workspace)
    expect(text).toContain(w.exports)
    expect(text).toContain('is a place to read and run commands in')
    expect(existsSync(target)).toBe(false)
  })

  it('lets a coding owner write inside its own repo', async () => {
    const w = world!
    const agent = await w.bot('SIG Code')
    const target = join(w.ownRepo, 'app.py')
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })
    expect(result.isError).toBe(false)
    expect(readFileSync(target, 'utf8')).toBe('ok')
  })

  it('refuses the same coding owner in another repo', async () => {
    const w = world!
    const agent = await w.bot('SIG Code')
    const target = join(w.otherRepo, 'app.py')
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'x' })
    expect(result.isError).toBe(true)
    expect(existsSync(target)).toBe(false)
  })

  it.each(['Backlink Scout', 'SIG Code'])('lets %s write its workspace and Exports', async (name) => {
    const w = world!
    const agent = await w.bot(name)
    for (const dir of [w.workspace, w.exports]) {
      const target = join(dir, `${name.replace(' ', '-')}.txt`)
      const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })
      expect(result.isError).toBe(false)
      expect(readFileSync(target, 'utf8')).toBe('ok')
    }
  })

  it('decides a write under a file by the path as spelled, when no real form exists', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const file = join(w.workspace, 'plain.txt')
    writeFileSync(file, 'x')
    const refused = await execute(w.ctx, agent, 'write', { file_path: join(w.otherRepo, 'plain.txt', 'a.txt'), content: 'x' })
    expect(textOf(refused)).toContain('may not write to')
    const reached = await execute(w.ctx, agent, 'write', { file_path: join(file, 'a.txt'), content: 'x' })
    expect(textOf(reached)).not.toContain('may not write to')
  })

  it('leaves alone a tool the policy does not name', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    w.ctx.tools.register(defineContentToolFixture({
      name: 'note', description: 'note', parameters: {},
      async execute() { return [{ type: 'text' as const, text: 'noted' }] },
    }))
    const result = await execute(w.ctx, agent, 'note', { file_path: join(w.otherRepo, 'app.py') })
    expect(result.isError).toBe(false)
  })

  it('leaves alone a call with no Agent', async () => {
    const w = world!
    w.ctx.tools.register(defineContentToolFixture({
      name: 'note', description: 'note', parameters: {},
      async execute() { return [{ type: 'text' as const, text: 'noted' }] },
    }))
    const result = await w.ctx.tools.execute({ callId: ToolCallId(`policy-${++call}`), name: 'note', arguments: {}, signal: SIGNAL })
    expect(result.isError).toBe(false)
  })

  it('resolves a relative path against the Session cwd', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const outside = await execute(w.ctx, agent, 'write', { file_path: join('..', '..', 'repos', 'abc', 'app.py'), content: 'x' })
    expect(outside.isError).toBe(true)
    expect(existsSync(join(w.otherRepo, 'app.py'))).toBe(false)
  })

  it('refuses parent traversal out of an allowed root', async () => {
    const w = world!
    const agent = await w.bot('SIG Code')
    const target = `${w.ownRepo}/../abc/app.py`
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'x' })
    expect(result.isError).toBe(true)
    expect(existsSync(join(w.otherRepo, 'app.py'))).toBe(false)
  })

  it('refuses a link inside an allowed root that leads out of it', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const link = join(w.workspace, 'out')
    symlinkSync(w.otherRepo, link, 'junction')
    const result = await execute(w.ctx, agent, 'write', { file_path: join(link, 'app.py'), content: 'x' })
    expect(result.isError).toBe(true)
    expect(existsSync(join(w.otherRepo, 'app.py'))).toBe(false)
  })

  it('refuses the bot store to a bot with a grant over it, and leaves it unchanged', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const before = readFileSync(w.storePath, 'utf8')
    const result = await execute(w.ctx, agent, 'write', { file_path: w.storePath, content: '{}' })
    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('operator-managed')
    expect(readFileSync(w.storePath, 'utf8')).toBe(before)
  })

  it('refuses the secrets file on read', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const result = await execute(w.ctx, agent, 'read', { file_path: w.secrets })
    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('operator-only')
    expect(textOf(result)).not.toContain('never')
  })

  it('lets a bot read anything else, a repo it may not write included', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const target = join(w.otherRepo, 'README.md')
    writeFileSync(target, 'hello')
    const result = await execute(w.ctx, agent, 'read', { file_path: target })
    expect(result.isError).toBe(false)
    expect(textOf(result)).toContain('hello')
  })

  it('never touches a Session that is not a bot', async () => {
    const w = world!
    const agent = await w.ctx.agentLoop.create(SessionId('operator-session'), { provider: 'mock', model: 'mock' })
    const target = join(w.otherRepo, 'app.py')
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })
    expect(result.isError).toBe(false)
    expect(readFileSync(target, 'utf8')).toBe('ok')
  })

  it('reads the policy afresh, so an edit applies to the next call', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const target = join(w.otherRepo, 'app.py')
    expect((await execute(w.ctx, agent, 'write', { file_path: target, content: 'x' })).isError).toBe(true)
    const widened = { ...policyFor(w.home), bots: { 'Backlink Scout': [{ root: w.otherRepo, kinds: ['write'] }] } }
    writeFileSync(w.policyPath, JSON.stringify(widened))
    expect((await execute(w.ctx, agent, 'write', { file_path: target, content: 'x' })).isError).toBe(false)
  })
})

describe('fail open', () => {
  const broken: readonly (readonly [string, string | undefined, RegExp])[] = [
    ['missing', undefined, /cannot be read/],
    ['empty', '', /the file is empty/],
    ['an empty object', '{}', /the file is empty/],
    ['malformed', '{not json', /not valid JSON/],
    ['the wrong version', '{"version":9}', /version must be 1/],
    ['a bad grant', '{"version":1,"secretFiles":[],"secretCommandFragments":[],"operatorRoot":{"root":"x","except":[]},"everyone":[{"root":""}],"tiers":[],"bots":{}}', /everyone must be/],
  ]

  it.each(broken)('allows the call and says so when the policy file is %s', async (_label, content, said) => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    if (content === undefined) rmSync(w.policyPath)
    else writeFileSync(w.policyPath, content)
    const target = join(w.otherRepo, 'app.py')
    const result = await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })
    expect(result.isError).toBe(false)
    expect(readFileSync(target, 'utf8')).toBe('ok')
    expect(w.warn).toHaveBeenCalledTimes(1)
    expect(String(w.warn.mock.calls[0]?.[0])).toMatch(/failing open/)
    expect(String(w.warn.mock.calls[0]?.[0])).toMatch(said)
  })

  it('says so once per fault, and again after the policy recovers and breaks', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const good = readFileSync(w.policyPath, 'utf8')
    writeFileSync(w.policyPath, '')
    await execute(w.ctx, agent, 'read', { file_path: w.storePath })
    await execute(w.ctx, agent, 'read', { file_path: w.storePath })
    expect(w.warn).toHaveBeenCalledTimes(1)
    writeFileSync(w.policyPath, good)
    await execute(w.ctx, agent, 'read', { file_path: w.storePath })
    writeFileSync(w.policyPath, '')
    await execute(w.ctx, agent, 'read', { file_path: w.storePath })
    expect(w.warn).toHaveBeenCalledTimes(2)
  })

  it('allows the call and says so when reading the policy throws', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    rmSync(w.policyPath)
    mkdirSync(w.policyPath)
    const target = join(w.otherRepo, 'app.py')
    expect((await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })).isError).toBe(false)
    expect(String(w.warn.mock.calls[0]?.[0])).toMatch(/failing open for this call/)
  })

  it('allows the call and says so when the bot store is gone', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    rmSync(w.storePath)
    const target = join(w.otherRepo, 'app.py')
    expect((await execute(w.ctx, agent, 'write', { file_path: target, content: 'ok' })).isError).toBe(false)
    expect(String(w.warn.mock.calls[0]?.[0])).toMatch(/bot store/)
  })

  it('treats an unreadable store as naming no bots', () => {
    expect(parseRoster('{not json').size).toBe(0)
    expect(parseRoster('[]').size).toBe(0)
    expect(parseRoster('{}').size).toBe(0)
    expect(parseRoster('{"bots":{"a":3},"rooms":{"r":3}}').size).toBe(0)
  })
})

describe('default locations', () => {
  it('reads both files from the DeepSeek Harness home', async () => {
    const home = realpathSync(mkdtempSync(join(tmpdir(), 'dsh-bot-tool-policy-home-')))
    vi.stubEnv('DSH_HOME', home)
    try {
      mkdirSync(join(home, 'bot'))
      writeFileSync(join(home, 'bot', 'tool-policy.json'), JSON.stringify(policyFor(home)))
      writeFileSync(join(home, 'bot', 'state.json'), JSON.stringify({ bots: { r: { name: 'Scout', sessionId: 'home-session' } } }))
      const ctx = new Context()
      await mountAgentLoopTestDependencies(ctx)
      await ctx.plugin(AgentLoop, { agents: [] })
      await ctx.plugin(LocalFileSystem, { cwd: home })
      await ctx.plugin(ToolFs)
      const fiber = await ctx.plugin(BotToolPolicy, {})
      const agent = await ctx.agentLoop.create(SessionId('home-session'), { provider: 'mock', model: 'mock' })
      const result = await execute(ctx, agent, 'write', { file_path: join(home, 'out.txt'), content: 'x' })
      expect(textOf(result)).toContain('Scout may not write to')
      await fiber.dispose()
    } finally {
      vi.unstubAllEnvs()
      rmSync(home, { recursive: true, force: true, maxRetries: 5 })
    }
  })
})

describe('real load path', () => {
  it('keeps name and inject through unwrapExports', () => {
    const loader = Object.create(Loader.prototype) as Loader
    const unwrapped = loader.unwrapExports(BotToolPolicy) as unknown as Record<string, unknown>
    expect(unwrapped.name).toBe('bot-tool-policy')
    expect(unwrapped.inject).toEqual(['agents', 'tools'])
    expect(typeof unwrapped.apply).toBe('function')
  })
})

describe('order', () => {
  it('runs ahead of a hook mounted first, so a refused call reaches no hook', async () => {
    const w = world!
    await w.fiber.dispose()
    const hook = vi.fn()
    w.ctx.on('tools/pre-execute', (_exec, next) => {
      hook()
      return next()
    })
    w.fiber = await w.ctx.plugin(BotToolPolicy, { policyPath: w.policyPath, storePath: w.storePath })
    const agent = await w.bot('Backlink Scout')
    const result = await execute(w.ctx, agent, 'write', { file_path: join(w.otherRepo, 'app.py'), content: 'x' })
    expect(result.isError).toBe(true)
    expect(hook).not.toHaveBeenCalled()
    await execute(w.ctx, agent, 'read', { file_path: w.storePath })
    expect(hook).toHaveBeenCalledTimes(1)
  })
})

describe('identity', () => {
  const store = JSON.stringify({
    bots: {
      'record-a': { id: 'record-a', name: 'Writer', sessionId: 'live-a', workDir: 'C:\\Work', segments: [{ sessionId: 'old-a' }, {}] },
      skipped: { id: 'skipped' },
    },
    rooms: {
      r1: { sessions: { 'record-a': 'group-a', nobody: 'group-x' }, segments: { 'record-a': [{ sessionId: 'old-group-a' }], nobody: [] } },
    },
  })

  it('finds a bot by its live Session, its earlier parts and its group Sessions', () => {
    const roster = parseRoster(store)
    for (const id of ['record-a', 'live-a', 'old-a', 'group-a', 'old-group-a']) {
      expect(roster.get(id)).toEqual({ name: 'Writer', workDir: 'C:\\Work' })
    }
    expect(roster.has('group-x')).toBe(false)
    expect(roster.has('skipped')).toBe(false)
  })

  it('applies to a subagent through the bot at the root of its parents', async () => {
    const w = world!
    const agent = await w.bot('Backlink Scout')
    const spawn = async (id: string, parent: Agent): Promise<Agent> => (await w.ctx.agents.create({
      sessionId: SessionId(id),
      agentOptions: { provider: 'mock', model: 'mock' },
      meta: { parentSession: parent.session.id, origin: 'subagent', delegationDepth: 1 },
    })).agent
    const child = await spawn('child-one', agent)
    const grandchild = await spawn('child-two', child)
    const target = join(w.otherRepo, 'app.py')
    expect((await execute(w.ctx, grandchild, 'write', { file_path: target, content: 'x' })).isError).toBe(true)
    expect(existsSync(target)).toBe(false)
  })
})

describe('classifying tools', () => {
  it('reads native and Claude-dialect names alike', () => {
    expect(classifyTool('Write', { file_path: 'a' })).toEqual({ kind: 'write', path: 'a' })
    expect(classifyTool('MultiEdit', { file_path: 'a' })).toEqual({ kind: 'write', path: 'a' })
    expect(classifyTool('apply_patch', { path: 'a' })).toEqual({ kind: 'write', path: 'a' })
    expect(classifyTool('NotebookEdit', { notebook_path: 'a' })).toEqual({ kind: 'write', path: 'a' })
    expect(classifyTool('read_image', { file_path: 'a' })).toEqual({ kind: 'read', path: 'a' })
    expect(classifyTool('grep', { path: 'a', pattern: 'b' })).toEqual({ kind: 'read', path: 'a' })
  })

  it('splits the editor tool by its command', () => {
    expect(classifyTool('str_replace_editor', { command: 'view', path: 'a' })).toEqual({ kind: 'read', path: 'a' })
    expect(classifyTool('str_replace_editor', { command: 'create', path: 'a' })).toEqual({ kind: 'write', path: 'a' })
  })

  it('takes every string a shell tool was given', () => {
    expect(classifyTool('terminal_send', { input: ['a', { b: 'c' }], n: 1 })).toEqual({ kind: 'shell', text: 'a\nc' })
    expect(classifyTool('bash', 'text')).toEqual({ kind: 'shell', text: 'text' })
  })

  it('leaves everything else alone', () => {
    expect(classifyTool('web_search', { query: 'a' })).toEqual({ kind: 'none' })
    expect(classifyTool('write', {})).toEqual({ kind: 'none' })
    expect(classifyTool('write', { file_path: '   ' })).toEqual({ kind: 'none' })
    expect(classifyTool('write', [])).toEqual({ kind: 'none' })
    expect(classifyTool('write', null)).toEqual({ kind: 'none' })
    expect(classifyTool('todo_write', { file_path: 'a' })).toEqual({ kind: 'none' })
  })
})

describe('deciding', () => {
  const policy = policyFor('C:\\h')
  const now = 1_000
  const write = (bot: string, path: string) => decide(policy, { bot, action: { kind: 'write', path }, spellings: [path], now })

  it('compares Windows paths without regard to case or slashes', () => {
    expect(write('SIG Code', 'c:/H/REPOS/sig/x.py').kind).toBe('allow')
    expect(write('SIG Code', 'C:\\h\\repos\\sig').kind).toBe('allow')
  })

  it('keeps POSIX paths exact', () => {
    const posixPolicy: Policy = { ...policy, secretFiles: [], operatorRoot: { root: '/h/bot', except: [] }, everyone: [], bots: { 'SIG Code': [{ root: '/h/repos/sig', kinds: ['write'] }] } }
    expect(decide(posixPolicy, { bot: 'SIG Code', action: { kind: 'write', path: '/h/repos/sig/x' }, spellings: ['/h/repos/sig/x'], now }).kind).toBe('allow')
    expect(decide(posixPolicy, { bot: 'SIG Code', action: { kind: 'write', path: '/H/repos/sig/x' }, spellings: ['/H/repos/sig/x'], now }).kind).toBe('deny')
  })

  it('takes a root that ends at the drive', () => {
    const wide: Policy = { ...policy, everyone: [{ root: 'D:\\', kinds: ['write'] }] }
    expect(decide(wide, { bot: 'X', action: { kind: 'write', path: 'D:\\a\\b' }, spellings: ['D:\\a\\b'], now }).kind).toBe('allow')
  })

  it('says none when a bot has no roots at all', () => {
    const empty: Policy = { ...policy, everyone: [] }
    const decision = decide(empty, { bot: 'X', action: { kind: 'write', path: 'C:\\h\\Exports\\a' }, spellings: ['C:\\h\\Exports\\a'], now })
    expect(decision).toEqual({ kind: 'deny', reason: 'X may not write to C:\\h\\Exports\\a. Allowed write roots for X: none.' })
  })

  it('ignores an expired grant and keeps a live one', () => {
    const dated = (until: number): Policy => ({ ...policy, bots: { X: [{ root: 'C:\\r', kinds: ['write'], until }] } })
    const call = { bot: 'X', action: { kind: 'write', path: 'C:\\r\\a' }, spellings: ['C:\\r\\a'], now } as const
    expect(decide(dated(now + 1), call).kind).toBe('allow')
    expect(decide(dated(now), call).kind).toBe('deny')
  })

  it('does not read a bot name off the object prototype', () => {
    expect(write('constructor', 'C:\\h\\repos\\sig\\x').kind).toBe('deny')
  })

  it('decides by the resolved spelling, against every spelling of a root', () => {
    const allowed = decide(policy, {
      bot: 'X', action: { kind: 'write', path: 'C:\\link\\a' }, spellings: ['C:\\link\\a', 'C:\\real\\a'], now,
    }, new Map([['C:\\h\\Exports', ['C:\\h\\Exports', 'C:\\real']]]))
    expect(allowed.kind).toBe('allow')
  })

  it('falls back to the path as written when no spelling was resolved', () => {
    const decision = decide(policy, { bot: 'X', action: { kind: 'write', path: 'C:\\h\\Exports\\a' }, spellings: [], now })
    expect(decision.kind).toBe('allow')
  })

  it('refuses the operator root when either spelling lands in it', () => {
    const decision = decide(policy, {
      bot: 'X', action: { kind: 'write', path: 'C:\\h\\Exports\\link' }, spellings: ['C:\\h\\Exports\\link', 'C:\\h\\bot\\state.json'], now,
    })
    expect(decision.kind).toBe('deny')
  })

  it('finds a secret path in any shell spelling, and only there', () => {
    const shell = (text: string) => decide(policy, { bot: 'X', action: { kind: 'shell', text }, spellings: [], now }).kind
    expect(shell('type C:\\\\Users\\\\me\\\\.DSH\\\\bot\\\\secrets.json')).toBe('deny')
    expect(shell('cat /c/Users/me/.dsh/bot/secrets.json')).toBe('deny')
    expect(shell('cat C:/h/bot/secrets.json')).toBe('deny')
    expect(shell('py -c "print(1)"')).toBe('allow')
  })

  it('has nothing to say about a call that is not a file or shell action', () => {
    expect(decide(policy, { bot: 'X', action: { kind: 'none' }, spellings: [], now })).toEqual({ kind: 'allow' })
  })
})

describe('resolving paths', () => {
  it('uses the Session cwd for a relative path', () => {
    expect(absolutePath('a\\b.txt', 'C:\\work')).toBe('C:\\work\\a\\b.txt')
    expect(absolutePath('a/b.txt', '/work')).toBe('/work/a/b.txt')
  })

  it('leaves an absolute path where it is, whatever the cwd', () => {
    expect(absolutePath('C:\\other\\x', '/work')).toBe('C:\\other\\x')
    expect(absolutePath('/other/x', 'C:\\work')).toBe('/other/x')
  })

  it('normalizes a path when no cwd applies', () => {
    expect(absolutePath('C:\\a\\..\\b', undefined)).toBe('C:\\b')
  })
})

describe('the policy file', () => {
  it('accepts the shipped example', () => {
    const text = readFileSync(resolve(import.meta.dirname, '../tool-policy.example.json'), 'utf8')
    expect(parsePolicy(text).ok).toBe(true)
  })

  it.each([
    ['a list', '[]', /not a JSON object/],
    ['no operator root', '{"version":1}', /operatorRoot/],
    ['bad secret files', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[1]}', /secretFiles/],
    ['bad fragments', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":""}', /secretCommandFragments/],
    ['bad tiers', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":[],"tiers":[{"name":1}]}', /tiers/],
    ['bad bots', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":[],"tiers":[],"bots":{"X":[{"root":"r","kinds":["read"]}]}}', /bots/],
    ['a non-list tier field', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":[],"tiers":{},"bots":{}}', /tiers/],
    ['a non-list grant field', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":{},"tiers":[],"bots":{}}', /everyone/],
    ['a dated grant with an endless date', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":[{"root":"r","kinds":["write"],"until":1e999}],"tiers":[],"bots":{}}', /everyone/],
    ['a dated grant with a bad date', '{"version":1,"operatorRoot":{"root":"r","except":[]},"secretFiles":[],"secretCommandFragments":[],"everyone":[{"root":"r","kinds":["write"],"until":"soon"}],"tiers":[],"bots":{}}', /everyone/],
  ])('reports %s', (_label, text, said) => {
    const parsed = parsePolicy(text)
    expect(parsed.ok).toBe(false)
    if (!parsed.ok) expect(parsed.problem).toMatch(said)
  })
})

/**
 * Every scenario of `bot_write_scope_guard.py --self-test`, run through the real
 * tool registry with a real Agent. Tool names are the native ones the hook bridge
 * translates from: Write to write, Edit to edit, Read to read, Bash to bash.
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import * as BotToolPolicy from '../src/index.ts'

const SIGNAL = new AbortController().signal
const EXAMPLE = resolve(import.meta.dirname, '../tool-policy.example.json')

type Case = readonly [bot: string, tool: 'write' | 'edit' | 'read' | 'bash', args: Readonly<Record<string, string>>]

const SHOULD_ALLOW: readonly Case[] = [
  ['SEO Overlord', 'write', { file_path: 'C:\\Users\\SteveDempsey\\.claude\\hooks\\x.py' }],
  ['SEO Overlord', 'write', { file_path: 'C:\\Claude\\integrations\\dsh-hook-bridge\\policy.json' }],
  ['SEO Overlord', 'write', { file_path: 'C:\\Users\\SteveDempsey\\.dsh\\bot\\workspace\\out.html' }],
  ['SIG Code', 'edit', { file_path: 'C:\\Projects\\repos\\sig-railway-services\\services\\x.py' }],
  ['SIG Code', 'write', { file_path: 'C:\\Projects\\_wt\\sig-fix\\app.py' }],
  ['Backlink Scout', 'write', { file_path: 'C:\\Users\\SteveDempsey\\.claude\\Exports\\2026-10-31_links.json' }],
  ['Backlink Scout', 'read', { file_path: 'C:\\Projects\\repos\\abc-railway-services\\README.md' }],
  ['Backlink Scout', 'bash', { command: 'py -c "print(1)"' }],
]

const SHOULD_DENY: readonly Case[] = [
  ['Backlink Scout', 'write', { file_path: 'C:\\Projects\\repos\\neotech-railway-services\\app.py' }],
  ['Backlink Scout', 'write', { file_path: 'C:\\Users\\SteveDempsey\\.claude\\settings.json' }],
  ['Backlink Scout', 'write', { file_path: 'C:\\Users\\SteveDempsey\\.dsh\\bot\\state.json' }],
  ['SIG Code', 'write', { file_path: 'C:\\Projects\\repos\\abc-railway-services\\app.py' }],
  ['SIG Code', 'write', { file_path: 'C:\\Projects\\repos\\sig-railway-services-old\\x.py' }],
  ['YouTube', 'edit', { file_path: 'C:\\Projects\\repos\\sig-railway-services\\services\\x.py' }],
  ['Backlink Scout', 'read', { file_path: 'C:\\Users\\SteveDempsey\\.dsh\\bot\\secrets.json' }],
  ['Penny', 'bash', { command: 'type C:\\Users\\SteveDempsey\\.dsh\\bot\\secrets.json' }],
]

const BOTS = ['SEO Overlord', 'SIG Code', 'Backlink Scout', 'YouTube', 'Penny'] as const
const WORK_DIRS: Readonly<Record<string, string>> = { YouTube: 'C:\\Projects\\repos\\sig-railway-services' }

let ctx: Context
let fiber: Awaited<ReturnType<Context['plugin']>>
let root: string
const agents = new Map<string, Agent>()
let stranger: Agent
const ran: string[] = []

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'dsh-bot-tool-policy-parity-'))
  ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  // The record key differs from the live Session on purpose: a hook keyed on the
  // record alone failed open on every live call.
  const store = Object.fromEntries(BOTS.map((name, index) => [`record-${index}`, {
    id: `record-${index}`,
    name,
    sessionId: `live-${index}`,
    ...WORK_DIRS[name] === undefined ? {} : { workDir: WORK_DIRS[name] },
  }]))
  const storePath = join(root, 'state.json')
  writeFileSync(storePath, JSON.stringify({ bots: store, rooms: {} }))
  const policyPath = join(root, 'tool-policy.json')
  writeFileSync(policyPath, readFileSync(EXAMPLE, 'utf8'))
  fiber = await ctx.plugin(BotToolPolicy, { policyPath, storePath })
  for (const tool of ['write', 'edit', 'read', 'bash']) {
    ctx.tools.register(defineContentToolFixture({
      name: tool, description: tool, parameters: {},
      async execute() {
        ran.push(tool)
        return [{ type: 'text' as const, text: 'ran' }]
      },
    }))
  }
  for (const [index, name] of BOTS.entries()) {
    agents.set(name, await ctx.agentLoop.create(SessionId(`live-${index}`), { provider: 'mock', model: 'mock' }))
  }
  stranger = await ctx.agentLoop.create(SessionId('not-a-bot'), { provider: 'mock', model: 'mock' })
})

afterAll(async () => {
  await fiber.dispose()
  rmSync(root, { recursive: true, force: true, maxRetries: 5 })
})

let call = 0
async function run(agent: Agent, tool: string, args: unknown) {
  ran.length = 0
  const result = await ctx.tools.execute({ callId: ToolCallId(`parity-${++call}`), name: tool, arguments: args, signal: SIGNAL, agent })
  return { result, ran: ran.length > 0 }
}

const label = ([bot, tool, args]: Case): string => `${bot} ${tool} ${Object.values(args)[0]}`

describe('bot_write_scope_guard --self-test, through the native tool path', () => {
  it.each(SHOULD_ALLOW.map(item => [label(item), item] as const))('allows %s', async (_label, item) => {
    const [bot, tool, args] = item
    const { result, ran: bodyRan } = await run(agents.get(bot)!, tool, args)
    expect(result.isError).toBe(false)
    expect(bodyRan).toBe(true)
  })

  it.each(SHOULD_DENY.map(item => [label(item), item] as const))('denies %s', async (_label, item) => {
    const [bot, tool, args] = item
    const { result, ran: bodyRan } = await run(agents.get(bot)!, tool, args)
    expect(result.isError).toBe(true)
    expect(bodyRan).toBe(false)
    const text = result.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    expect(text).toContain(bot)
  })

  it('never denies an unknown session', async () => {
    const { result, ran: bodyRan } = await run(stranger, 'write', { file_path: 'C:\\Windows\\x' })
    expect(result.isError).toBe(false)
    expect(bodyRan).toBe(true)
  })
})

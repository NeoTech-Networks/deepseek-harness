/** Per-teammate LLM route selection on `spawn_teammate`. */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SessionQueryEngine from '@deepseek-ai/dsh-session-query'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import SubagentModelSelectionConfig from '@deepseek-ai/dsh-tool-subagent/model-selection-settings'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService from '../../agent-team/src/index.ts'
import * as toolTeam from '../src/index.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []
const contexts = new Set<Context>()
let callNumber = 0

/** Session query implementation whose search faces are outside these tests. */
class TestSessionQuery extends SessionQueryEngine {
  override searchSessions(): Promise<never> {
    return Promise.reject(new Error('session search is not configured in this test'))
  }

  override searchEvents(): Promise<never> {
    return Promise.reject(new Error('event search is not configured in this test'))
  }
}

afterEach(async () => {
  for (const ctx of contexts) await ctx.fiber.dispose()
  contexts.clear()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

interface SetupOptions {
  /** Model-selection settings; omit to leave the Host setting unmounted. */
  readonly selection?: { enabled: boolean; allowedModels: { provider: string; model: string }[] }
}

async function setup(options: SetupOptions = {}) {
  const ctx = new Context()
  contexts.add(ctx)
  if (options.selection !== undefined) await ctx.plugin(SubagentModelSelectionConfig, options.selection)
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-tool-team-model-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(TeamService)
  await ctx.plugin(toolTeam)
  const leadAdapter = new MockAdapter([])
  const altAdapter = new MockAdapter([textResponse('done on alt')])
  ctx.llm.registerAdapter(['mock'], leadAdapter)
  ctx.llm.registerAdapter(['alt'], altAdapter)
  const lead = await ctx.agentLoop.create(SessionId('tool-team-model-lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, leadAdapter, altAdapter }
}

function execute(ctx: Context, agent: Agent, args: Record<string, unknown>) {
  return ctx.tools.execute({
    callId: ToolCallId(`team-model-call-${++callNumber}`),
    name: 'spawn_teammate',
    arguments: { description: 'cheap helper', prompt: 'do the thing', ...args },
    signal: SIGNAL,
    agent,
  })
}

function text(result: Awaited<ReturnType<typeof execute>>): string {
  return result.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
}

const ALLOWED = { enabled: true, allowedModels: [{ provider: 'alt', model: 'alt-model' }] }

describe('spawn_teammate model selection', () => {
  it('advertises optional provider, model, and reasoning_effort fields', async () => {
    const { ctx, lead } = await setup({ selection: ALLOWED })
    const schema = ctx.tools.schemas(lead).find(candidate => candidate.name === 'spawn_teammate')
    const properties = (schema?.parameters as { properties?: Record<string, unknown>; required?: string[] }).properties
    expect(properties).toHaveProperty('provider')
    expect(properties).toHaveProperty('model')
    expect(properties).toHaveProperty('reasoning_effort')
    expect((schema?.parameters as { required?: string[] }).required ?? []).not.toContain('model')
  })

  it('runs the teammate on the selected route and keeps reporting it once inactive', async () => {
    const { ctx, lead, leadAdapter, altAdapter } = await setup({ selection: ALLOWED })
    const spawned = await execute(ctx, lead, { name: 'cheap', provider: 'alt', model: 'alt-model' })
    expect(spawned.isError).toBe(false)
    expect(JSON.parse(text(spawned))).toMatchObject({ member: { target: 'cheap' } })
    const childId = ctx.agentTeams.listMembers(lead).find(member => member.name === 'cheap')!.id
    await vi.waitFor(() => { expect(altAdapter.requests).toHaveLength(1) }, { timeout: 5_000 })
    expect(altAdapter.requests[0]?.model).toBe('alt-model')
    // The Lead adapter only ever sees the Lead's own route (a settle notice may wake it).
    expect(leadAdapter.requests.every(request => request.model === 'mock')).toBe(true)
    await vi.waitFor(() => {
      const live = ctx.agents.get(childId)
      expect(live === undefined || live.status !== 'running').toBe(true)
    }, { timeout: 5_000 })
    const row = ctx.agentTeams.listMembers(lead).find(member => member.name === 'cheap')
    expect(row?.model).toBe('alt-model')
  })

  it('inherits the Lead route when no model is supplied', async () => {
    const { ctx, lead } = await setup({ selection: ALLOWED })
    const spawn = vi.spyOn(ctx.agentTeams, 'spawnTeammate').mockResolvedValue({
      member: { id: SessionId('x'), name: 'plain', role: 'teammate', status: 'running', diagnostics: [] },
    })
    await execute(ctx, lead, { name: 'plain' })
    expect(spawn.mock.calls[0]?.[1]).not.toHaveProperty('route')
  })

  it.each([
    ['provider without model', { provider: 'alt' }, 'must be supplied together'],
    ['model without provider', { model: 'alt-model' }, 'must be supplied together'],
    ['effort without a route', { reasoning_effort: 'high' }, 'must be supplied together'],
    ['a route outside the allowlist', { provider: 'alt', model: 'other-model' }, 'is not in the allowed subagent models'],
    ['an effort the model does not support', { provider: 'alt', model: 'alt-model', reasoning_effort: 'high' }, 'does not support reasoning effort'],
  ])('rejects %s before reserving a teammate', async (_label, args, message) => {
    const { ctx, lead } = await setup({ selection: ALLOWED })
    const result = await execute(ctx, lead, { name: 'rejected', ...args })
    expect(result.isError).toBe(true)
    expect(text(result)).toContain(message)
    expect(ctx.agentTeams.listMembers(lead).map(member => member.name)).toEqual(['lead'])
  })

  it.each([
    ['unmounted', undefined],
    ['disabled', { enabled: false, allowedModels: [{ provider: 'alt', model: 'alt-model' }] }],
  ])('rejects an explicit route when model selection is %s', async (_label, selection) => {
    const { ctx, lead } = await setup(selection === undefined ? {} : { selection })
    const result = await execute(ctx, lead, { name: 'rejected', provider: 'alt', model: 'alt-model' })
    expect(result.isError).toBe(true)
    expect(text(result)).toContain('needs subagent model selection enabled')
  })
})

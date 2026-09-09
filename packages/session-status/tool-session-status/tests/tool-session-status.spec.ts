/**
 * Drives the REAL plugin body: mounts `dsh-tool-session-status` beside the
 * session-status service on a real `ToolRuntime` and invokes the registered
 * `set_session_status` tool through `ctx.tools.execute`, with a fake parent
 * Agent carrying a real `Session`, so the append the tool makes is observable
 * on a genuine session log.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SessionStatusService from '@deepseek-ai/dsh-session-status'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'

import * as tool from '../src/index.ts'

const testToolSignal = new AbortController().signal

/** A parent Agent backed by a real Session, the shape the tool reads. */
function agentWithSession(id = 'parent-1'): Agent & { session: Session } {
  const session = Session.create(SessionId(id))
  return { id: SessionId(id), session } as unknown as Agent & { session: Session }
}

async function setup(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(SessionStatusService)
  await ctx.plugin(tool)
  return ctx
}

let callCounter = 0
function callStatus(ctx: Context, args: unknown, over: { agent?: Agent | undefined } = {}) {
  const agent = 'agent' in over ? over.agent : agentWithSession()
  return ctx.tools.execute({
    signal: testToolSignal,
    callId: ToolCallId(`call-${++callCounter}`),
    name: 'set_session_status',
    arguments: args,
    ...agent ? { agent } : {},
  })
}

function text(result: { content: { type: string; text?: string }[] }): string {
  return result.content.filter(b => b.type === 'text').map(b => b.text).join('')
}

describe('dsh-tool-session-status', () => {
  it('registers a set_session_status tool whose enum is the vocabulary plus clear', async () => {
    const ctx = await setup()
    const schema = ctx.tools.schemas().find(s => s.name === 'set_session_status')
    expect(schema).toBeDefined()
    const props = (schema!.parameters as { properties?: Record<string, { enum?: string[] }> }).properties ?? {}
    expect(props.status?.enum).toEqual([
      'waiting-production', 'stuck', 'finished', 'waiting-external', 'paused', 'clear',
    ])
  })

  it('appends a whole-value session/status event for a known id', async () => {
    const ctx = await setup()
    const agent = agentWithSession('setter')
    const result = await callStatus(ctx, { status: 'stuck', note: 'blocked on vendor' }, { agent })
    expect(result.isError).toBe(false)
    if (result.isError) throw new Error('expected set_session_status success')
    expect(text(result)).toContain('Stuck')

    const event = agent.session.snapshotEvents().findLast(e => e.type === 'session/status')
    expect(event?.type === 'session/status' && event.data.status).toEqual({
      id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error',
    })
    expect(event?.type === 'session/status' && event.data.note).toBe('blocked on vendor')
  })

  it('clears the status on the clear sentinel', async () => {
    const ctx = await setup()
    const agent = agentWithSession('clearer')
    await callStatus(ctx, { status: 'finished' }, { agent })
    const result = await callStatus(ctx, { status: 'clear' }, { agent })
    expect(result.isError).toBe(false)
    expect(text(result)).toContain('Cleared')

    const events = agent.session.snapshotEvents().filter(e => e.type === 'session/status')
    expect(events.at(-1)?.type === 'session/status' && events.at(-1)?.data.status).toBeNull()
  })

  it('rejects an unknown status before execute runs (registry arg-validation)', async () => {
    const ctx = await setup()
    const agent = agentWithSession('unknown')
    const result = await callStatus(ctx, { status: 'banana' }, { agent })
    expect(result.isError).toBe(true)
    expect(agent.session.snapshotEvents().some(e => e.type === 'session/status')).toBe(false)
  })

  it('rejects a non-agent caller', async () => {
    const ctx = await setup()
    const result = await callStatus(ctx, { status: 'finished' }, { agent: undefined })
    expect(result.isError).toBe(true)
    expect(text(result)).toContain('owning agent session')
  })

  it('presents the call with a stable title', async () => {
    const ctx = await setup()
    const def = ctx.tools.get('set_session_status')!
    expect(def.presentCall?.({ status: 'stuck' })).toEqual({
      card: 'generic', title: 'Set session status', kind: 'other', rawInput: 'stuck',
    })
    expect(def.presentCall?.({ status: 'clear' })).toEqual({
      card: 'generic', title: 'Clear status', kind: 'other', rawInput: 'clear',
    })
  })

  it('unregisters the tool when its contributing fiber is disposed (HMR-safety)', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SessionStatusService)
    const fiber = await ctx.plugin(tool)
    expect(ctx.tools.schemas().some(s => s.name === 'set_session_status')).toBe(true)
    await fiber.dispose()
    expect(ctx.tools.schemas().some(s => s.name === 'set_session_status')).toBe(false)
  })

  it('has the namespace-plugin export shape (no stray default) so the Loader keeps name/inject/apply', () => {
    expect('default' in tool).toBe(false)
    expect(tool.name).toBe('tool-session-status')
    expect(tool.inject).toEqual(['tools', 'sessionStatus'])

    const loader = Object.create(Loader.prototype) as Loader
    const unwrapped = loader.unwrapExports(tool) as Record<string, unknown>
    expect(unwrapped).toBe(tool)
    expect(unwrapped.name).toBe('tool-session-status')
    expect(unwrapped.inject).toEqual(['tools', 'sessionStatus'])
    expect(typeof unwrapped.apply).toBe('function')
  })
})

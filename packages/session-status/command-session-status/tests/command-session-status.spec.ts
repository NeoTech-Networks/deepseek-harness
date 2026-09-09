import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import type { Agent, AgentStatus } from '@deepseek-ai/dsh-agent'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SessionStatusService from '@deepseek-ai/dsh-session-status'
import { createInboxStub } from '@deepseek-ai/dsh-agent-loop-testkit'
import * as commandStatus from '@deepseek-ai/dsh-command-session-status'

function stubAgent(ctx: Context, id: string): { agent: Agent; session: Session } {
  const session = ctx.sessions.create(SessionId(id))
  const inbox = createInboxStub()
  let status: AgentStatus = 'idle'
  const agent: Agent = {
    id: session.id,
    options: {},
    session,
    inbox,
    ctx: new Context(),
    get status() { return status },
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject(input) { this.inbox.append('next-step', input) },
    cancel() { status = 'idle' },
    runMaintenance: task => task(new AbortController().signal),
    whenIdle() { return Promise.resolve() },
  }
  return { agent, session }
}

async function harness() {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(CommandRuntime)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(SessionStatusService)
  const plugin = await ctx.plugin(commandStatus)
  const { agent, session } = stubAgent(ctx, `command-status-${Math.random()}`)
  ctx.agents.register(agent)
  return { ctx, agent, session, plugin }
}

async function run(test: Awaited<ReturnType<typeof harness>>, suffix = '') {
  const execution = await test.ctx.commands.execute(
    test.agent,
    `/status${suffix}`,
    [],
    new AbortController().signal,
  )
  if (execution === undefined) throw new Error('status command was not registered')
  return execution.result
}

describe('@deepseek-ai/dsh-command-session-status registration', () => {
  it('registers one global command with Loader-safe exports and disposes it', async () => {
    const test = await harness()
    expect(commandStatus.name).toBe('command-session-status')
    expect(commandStatus.inject).toEqual(['commands', 'sessionStatus'])
    expect('default' in commandStatus).toBe(false)
    const loader = Object.create(Loader.prototype) as Loader
    expect(loader.unwrapExports(commandStatus)).toBe(commandStatus)

    expect(test.ctx.commands.list(test.agent)).toContainEqual({
      name: 'status',
      description: 'set or view the declared session status',
      input: { hint: '[<id>|clear]' },
    })

    await test.plugin.dispose()
    expect(test.ctx.commands.find(test.agent, 'status')).toBeUndefined()
  })
})

describe('/status human command', () => {
  it('shows the empty status and the available ids without mutating the session', async () => {
    const test = await harness()
    const result = await run(test)
    expect(result.kind).toBe('success')
    expect(result.text).toContain('No status is currently set.')
    expect(result.text).toContain('waiting-production, stuck, finished, waiting-external, paused | clear')
    expect(test.session.snapshotEvents().filter(e => e.type === 'session/status')).toHaveLength(0)
  })

  it('sets a known id and reports the resolved label', async () => {
    const test = await harness()
    const result = await run(test, ' stuck')
    expect(result.kind).toBe('success')
    expect(result.text).toContain('Status: Stuck')
    expect(test.ctx.sessionStatus.current(test.session)?.id).toBe('stuck')
  })

  it('clears a set status', async () => {
    const test = await harness()
    await run(test, ' finished')
    const result = await run(test, ' clear')
    expect(result.kind).toBe('success')
    expect(result.text).toContain('No status is currently set.')
    expect(test.ctx.sessionStatus.current(test.session)).toBeNull()
  })

  it('returns a rendered error for an unknown id', async () => {
    const test = await harness()
    const result = await run(test, ' banana')
    expect(result.kind).toBe('error')
    expect(result.text).toContain('unknown session status')
  })

  it('renders a non-Error failure through String()', async () => {
    const test = await harness()
    vi.spyOn(test.ctx.sessionStatus, 'set').mockImplementationOnce(() => { throw 'boom' })
    const result = await run(test, ' stuck')
    expect(result.kind).toBe('error')
    expect(result.text).toContain('boom')
  })
})

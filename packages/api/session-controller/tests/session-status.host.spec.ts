/**
 * Session Controller status delegation through the composed SessionStatusService.
 * The agent factory is the same structural stub as the rename suite: create
 * builds the session over the real SessionStore and registers an idle agent,
 * and resume never runs (every source is already attached).
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import type { Agent, AgentHandle, CreateAgentOptions } from '@deepseek-ai/dsh-agent'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'
import SessionStatusService from '@deepseek-ai/dsh-session-status'
import { createSessionTestRemote } from './test-remote.ts'

const sid = (id: string): SessionId => id as SessionId

function request<P>(payload: P): P {
  return payload
}

async function composed(withStatus = true): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(AgentRegistry)
  if (withStatus) await ctx.plugin(SessionStatusService)
  ctx.agents.setFactory({
    createAgent: (ownerCtx: Context, options: CreateAgentOptions): Promise<AgentHandle> => {
      const session = ctx.sessions.create(options.sessionId, {
        ...options.seed === undefined ? {} : { seed: [...options.seed] },
        ...options.meta === undefined ? {} : { meta: options.meta },
      })
      const agent = { id: session.id, session, status: 'idle', ctx: ownerCtx } as Agent
      ctx.agents.register(agent)
      return Promise.resolve({ agent, dispose: () => Promise.resolve() })
    },
    resume: () => Promise.reject(new Error('resume must not run: every source is attached')),
  })
  return ctx
}

function liveAgent(ctx: Context, id: string): Session {
  const session = ctx.sessions.create(sid(id), { meta: { cwd: '/proj' } })
  ctx.agents.register({ id: session.id, session, status: 'idle', ctx } as Agent)
  return session
}

const remote = (ctx: Context) => createSessionTestRemote(ctx, { defaultModelSelection: () => ({ provider: 'p', model: 'm' }), cwd: '/tmp' })

describe('sessions.setStatus', () => {
  it('sets a vocabulary id as a whole-value event and echoes the resolved status', async () => {
    const ctx = await composed()
    const source = liveAgent(ctx, 'session-status-set')

    const set = await remote(ctx).setStatus(request({ sessionId: source.id, statusId: 'stuck' }))
    expect(set.ok).toBe(true)
    if (!set.ok) return
    expect(set.value.status).toEqual({ id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error' })
    const event = source.snapshotEvents().findLast(item => item.type === 'session/status')
    expect(event?.seq).toBe(set.value.seq)
    expect(event?.type === 'session/status' && event.data.status?.id).toBe('stuck')
  })

  it('clears on a null statusId', async () => {
    const ctx = await composed()
    const source = liveAgent(ctx, 'session-status-clear')
    await remote(ctx).setStatus(request({ sessionId: source.id, statusId: 'finished' }))

    const cleared = await remote(ctx).setStatus(request({ sessionId: source.id, statusId: null }))
    expect(cleared.ok).toBe(true)
    if (!cleared.ok) return
    expect(cleared.value.status).toBeNull()
  })

  it('maps an unknown id to status-unknown, not internal', async () => {
    const ctx = await composed()
    const source = liveAgent(ctx, 'session-status-unknown')

    const response = await remote(ctx).setStatus(request({ sessionId: source.id, statusId: 'banana' }))
    expect(response.ok).toBe(false)
    if (!response.ok) {
      expect(response.error.code).toBe('session/status-unknown')
      expect(response.error.details).toEqual({ statusId: 'banana' })
    }
  })

  it('answers internal when the composition mounts no session-status service', async () => {
    const ctx = await composed(false)
    const source = liveAgent(ctx, 'session-status-missing')

    const response = await remote(ctx).setStatus(request({ sessionId: source.id, statusId: 'stuck' }))
    expect(response.ok).toBe(false)
    if (!response.ok) {
      expect(response.error.code).toBe('gateway/internal')
      expect(response.error.message).toMatch(/mounts no session-status service/)
    }
  })
})

describe('sessions.listStatuses', () => {
  it('returns the shipped vocabulary in declaration order', async () => {
    const ctx = await composed()
    const listed = await remote(ctx).listStatuses()
    expect(listed.ok).toBe(true)
    if (!listed.ok) return
    expect(listed.value.statuses.map(entry => entry.id)).toEqual([
      'waiting-production', 'stuck', 'finished', 'waiting-external', 'paused',
    ])
  })

  it('answers internal when the composition mounts no session-status service', async () => {
    const ctx = await composed(false)
    const listed = await remote(ctx).listStatuses()
    expect(listed.ok).toBe(false)
    if (!listed.ok) expect(listed.error.code).toBe('gateway/internal')
  })
})

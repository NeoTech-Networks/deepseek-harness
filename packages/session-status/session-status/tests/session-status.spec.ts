/**
 * The session-status service and vocabulary validation: `list` returns the
 * declared vocabulary in order, `set` appends a whole-value status for a known
 * id and rejects an unknown one, `clear` appends the null event, and
 * `resolveVocabulary` fails loudly on every malformed entry shape.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionStore from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import UserQuestionService from '@deepseek-ai/dsh-user-questions'
import SessionStatusService, { resolveVocabulary } from '@deepseek-ai/dsh-session-status'
import type { SessionStatusConfig } from '@deepseek-ai/dsh-session-status'

async function harness(config?: SessionStatusConfig): Promise<{ ctx: Context; session: Session }> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SystemPrompt, { personaPrefix: '' })
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(UserQuestionService)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(SessionStatusService, config)
  const session = ctx.sessions.create()
  ctx.agents.register({ id: session.id, session, status: 'idle', ctx } as Agent)
  return { ctx, session }
}

describe('resolveVocabulary', () => {
  it('returns the vocabulary detached when it is valid', () => {
    const vocabulary = [{ id: 'stuck', label: 'Stuck', icon: 'stop' as const, tone: 'error' as const }]
    expect(resolveVocabulary({ vocabulary })).toEqual(vocabulary)
  })

  it('rejects a missing or non-array vocabulary', () => {
    expect(() => resolveVocabulary({} as SessionStatusConfig)).toThrow(/array/)
    expect(() => resolveVocabulary({ vocabulary: 'x' } as unknown as SessionStatusConfig)).toThrow(/array/)
  })

  it('rejects a blank id or label', () => {
    expect(() => resolveVocabulary({ vocabulary: [{ id: ' ', label: 'x', icon: 'stop', tone: 'error' }] })).toThrow(/id/)
    expect(() => resolveVocabulary({ vocabulary: [{ id: 'x', label: '', icon: 'stop', tone: 'error' }] })).toThrow(/label/)
  })

  it('rejects a non-string id or label', () => {
    expect(() => resolveVocabulary({
      vocabulary: [{ id: 42 as never, label: 'x', icon: 'stop', tone: 'error' }],
    })).toThrow(/id/)
    expect(() => resolveVocabulary({
      vocabulary: [{ id: 'x', label: 42 as never, icon: 'stop', tone: 'error' }],
    })).toThrow(/label/)
  })

  it('rejects an unknown icon or tone', () => {
    expect(() => resolveVocabulary({
      vocabulary: [{ id: 'x', label: 'x', icon: 'banana' as never, tone: 'error' }],
    })).toThrow(/icon/)
    expect(() => resolveVocabulary({
      vocabulary: [{ id: 'x', label: 'x', icon: 'stop', tone: 'loud' as never }],
    })).toThrow(/tone/)
  })

  it('rejects a duplicate id', () => {
    expect(() => resolveVocabulary({
      vocabulary: [
        { id: 'x', label: 'one', icon: 'stop', tone: 'error' },
        { id: 'x', label: 'two', icon: 'check', tone: 'success' },
      ],
    })).toThrow(/duplicate/)
  })
})

describe('session-status service', () => {
  it('lists the shipped vocabulary in declaration order', async () => {
    const { ctx } = await harness()
    expect(ctx.sessionStatus.list().map(entry => entry.id)).toEqual([
      'waiting-production', 'stuck', 'finished', 'waiting-external', 'paused',
    ])
  })

  it('reports null current before the first set, then the set value, then null after clear', async () => {
    const { ctx, session } = await harness()
    expect(ctx.sessionStatus.current(session)).toBeNull()
    ctx.sessionStatus.set(session, 'finished')
    expect(ctx.sessionStatus.current(session)?.id).toBe('finished')
    ctx.sessionStatus.clear(session)
    expect(ctx.sessionStatus.current(session)).toBeNull()
  })

  it('rejects an unknown id instead of writing a row no client can draw', async () => {
    const { ctx, session } = await harness()
    expect(() => { ctx.sessionStatus.set(session, 'nope') }).toThrow(/unknown session status/)
    expect(ctx.sessionStatus.current(session)).toBeNull()
  })

  it('records an optional note on the durable event', async () => {
    const { ctx, session } = await harness()
    ctx.sessionStatus.set(session, 'stuck', 'blocked on vendor')
    const event = session.snapshotEvents().findLast(item => item.type === 'session/status')
    expect(event?.type === 'session/status' && event.data.note).toBe('blocked on vendor')
  })

  it('throws a current read when the projection is not registered (HMR disposal)', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt, { personaPrefix: '' })
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(UserQuestionService)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(SessionProjectionRegistry)
    const fiber = await ctx.plugin(SessionStatusService)
    const service = ctx.sessionStatus
    const session = ctx.sessions.create()
    ctx.agents.register({ id: session.id, session, status: 'idle', ctx } as Agent)

    await fiber.dispose()
    expect(() => service.current(session)).toThrow(/sessionStatus session projection/)
  })
})

/**
 * The `sessionStatus` projection provider: mounting session-status beside the
 * registry serves the current declared status with a consistent asOfSeq; before
 * any set the value is null; a composition without session-status has no
 * `sessionStatus` key; unmounting it removes the key (HMR safety). The fold also
 * proves that a human `user/message` clears the status while a plugin-sourced
 * user message leaves it untouched.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import SessionStore from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import UserQuestionService from '@deepseek-ai/dsh-user-questions'
import SessionStatusService from '@deepseek-ai/dsh-session-status'

interface Bench {
  ctx: Context
  session: Session
  values(): Record<string, unknown>
}

async function harness(withStatus: boolean): Promise<Bench> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SystemPrompt, { personaPrefix: '' })
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(UserQuestionService)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(SessionProjectionRegistry)
  if (withStatus) await ctx.plugin(SessionStatusService)
  const session = ctx.sessions.create()
  ctx.agents.register({ id: session.id, session, status: 'idle', ctx } as Agent)
  return { ctx, session, values: () => ctx.sessionProjections.snapshot(session).values }
}

/** Append one human prompt. */
function humanMessage(session: Session): void {
  session.append('user/message', createUserMessage({
    content: [{ type: 'text', text: 'hi' }],
    source: { kind: 'user' },
  }), { surfaceOp: 'append' })
}

/** Append one plugin-sourced user-role message, which must not clear a status. */
function pluginMessage(session: Session): void {
  session.append('user/message', createUserMessage({
    content: [{ type: 'text', text: 'notice' }],
    source: { kind: 'plugin', plugin: 'test', form: 'notice', summary: 'notice' },
  }), { surfaceOp: 'append' })
}

describe('sessionStatus projection provider', () => {
  it('serves null before the first session/status', async () => {
    const bench = await harness(true)
    humanMessage(bench.session)
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('serves the latest whole value after a set', async () => {
    const bench = await harness(true)
    bench.ctx.sessionStatus.set(bench.session, 'stuck', 'waiting on you')
    expect(bench.values().sessionStatus).toEqual({ id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error' })
  })

  it('clears on a later human user/message', async () => {
    const bench = await harness(true)
    bench.ctx.sessionStatus.set(bench.session, 'finished')
    expect(bench.values().sessionStatus).not.toBeNull()
    humanMessage(bench.session)
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('leaves the status untouched across a plugin-sourced user message', async () => {
    const bench = await harness(true)
    bench.ctx.sessionStatus.set(bench.session, 'waiting-production')
    pluginMessage(bench.session)
    expect(bench.values().sessionStatus).toEqual({
      id: 'waiting-production', label: 'Waiting on you: deploy to production', icon: 'right-up', tone: 'attention',
    })
  })

  it('clears on a session/status null event', async () => {
    const bench = await harness(true)
    bench.ctx.sessionStatus.set(bench.session, 'paused')
    bench.ctx.sessionStatus.clear(bench.session)
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('has no sessionStatus key when session-status is not composed', async () => {
    const bench = await harness(false)
    humanMessage(bench.session)
    expect('sessionStatus' in bench.values()).toBe(false)
  })

  it('drops the key when the session-status fiber unloads (HMR safety)', async () => {
    const bench = await harness(false)
    humanMessage(bench.session)
    const fiber = await bench.ctx.plugin(SessionStatusService)
    expect(bench.values().sessionStatus).toBeNull()
    await fiber.dispose()
    expect('sessionStatus' in bench.values()).toBe(false)
  })
})

/**
 * The `sessionStatus` projection provider: mounting session-status beside the
 * registry serves the current declared status with a consistent asOfSeq; before
 * any set the value is null; a composition without session-status has no
 * `sessionStatus` key; unmounting it removes the key (HMR safety). The fold also
 * proves that a human `user/message` clears the status while a plugin-sourced
 * user message leaves it untouched, and that a durable goal phase transition
 * declares and expires the matching status.
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
// Value-free, but NOT decorative: it merges the goal domain's `goal/change`
// event declaration so the payloads below are checked against the real
// GoalSnapshotChangeMeta shape. The fold reads that payload structurally, so
// this is the compile-time guard that an upstream shape change breaks here
// rather than silently in the sidebar.
import type {} from '@deepseek-ai/dsh-goal'
import type { GoalId, GoalPhase } from '@deepseek-ai/dsh-goal/types'

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

/** Append one durable goal mutation carrying a phase. */
function goalPhase(session: Session, phase: GoalPhase, revision = 1): void {
  session.append('goal/change', {
    kind: 'goal/change',
    version: 1,
    operation: phase === 'active' ? 'create' : phase === 'complete' ? 'complete' : phase === 'blocked' ? 'block' : 'pause',
    goal: {
      id: 'goal-test' as GoalId,
      revision,
      objective: 'ship the thing',
      phase,
      maxGoalRounds: 5,
    },
    roundsStarted: 0,
    createdAt: 1,
    updatedAt: revision,
  })
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

  it('declares the matching status on a durable goal phase transition', async () => {
    const bench = await harness(true)
    goalPhase(bench.session, 'active')
    expect(bench.values().sessionStatus).toBeNull()
    goalPhase(bench.session, 'complete', 2)
    expect(bench.values().sessionStatus).toEqual({
      id: 'finished', label: 'Finished', icon: 'check', tone: 'success',
    })
    goalPhase(bench.session, 'blocked', 3)
    expect(bench.values().sessionStatus).toEqual({ id: 'stuck', label: 'Stuck', icon: 'stop', tone: 'error' })
    goalPhase(bench.session, 'paused', 4)
    expect(bench.values().sessionStatus).toEqual({ id: 'paused', label: 'Paused', icon: 'pause', tone: 'neutral' })
  })

  it('expires a goal-declared status on the next human message', async () => {
    // The defect this fold exists to close: before it, the client derived the
    // badge from the goal projection, which never expires, so one completed
    // goal pinned a green check on the row for the rest of the session.
    const bench = await harness(true)
    goalPhase(bench.session, 'complete')
    expect(bench.values().sessionStatus).not.toBeNull()
    humanMessage(bench.session)
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('clears a goal-declared status when the goal goes active again', async () => {
    const bench = await harness(true)
    goalPhase(bench.session, 'paused')
    expect(bench.values().sessionStatus).not.toBeNull()
    goalPhase(bench.session, 'active', 2)
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('leaves a deliberately set status alone across repeated writes at one goal phase', async () => {
    const bench = await harness(true)
    goalPhase(bench.session, 'active')
    bench.ctx.sessionStatus.set(bench.session, 'waiting-production')
    goalPhase(bench.session, 'active', 2)
    expect(bench.values().sessionStatus).toEqual({
      id: 'waiting-production', label: 'Waiting on you: deploy to production', icon: 'right-up', tone: 'attention',
    })
  })

  it('declares nothing for a goal phase outside the mapping', async () => {
    const bench = await harness(true)
    bench.session.append('goal/change', {
      kind: 'goal/change',
      version: 1,
      operation: 'edit',
      goal: {
        id: 'goal-test' as GoalId,
        revision: 1,
        objective: 'ship',
        phase: 'hibernating' as GoalPhase,
        maxGoalRounds: 5,
      },
      roundsStarted: 0,
      createdAt: 1,
      updatedAt: 1,
    })
    expect(bench.values().sessionStatus).toBeNull()
  })

  it('clears on a goal clear tombstone', async () => {
    const bench = await harness(true)
    goalPhase(bench.session, 'complete')
    bench.session.append('goal/change', {
      kind: 'goal/change',
      version: 1,
      operation: 'clear',
      cleared: { id: 'goal-test' as GoalId, revision: 2 },
      clearedAt: 2,
    })
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

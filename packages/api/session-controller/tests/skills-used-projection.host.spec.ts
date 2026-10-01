/**
 * The operator-invocation projection behind the Session footer's third line.
 *
 * Three properties carry the feature and are pinned here: only the operator's
 * own two durable signals are read (a model-loaded skill and an injected
 * catalog are both invisible), an event the unit does not care about returns
 * the SAME state reference so ordinary traffic costs nothing downstream, and
 * the list is deduplicated in first-use order and bounded.
 */

import { describe, expect, it } from 'vitest'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { CommandId } from '@deepseek-ai/dsh-commands/brand'
import type {} from '@deepseek-ai/dsh-skill'
import { MAX_SKILLS_USED, skillsUsedProjection } from '../src/skills-used-projection.ts'
import type { SkillsUsed } from '../src/types.ts'

/**
 * One `skill-invocation` message: the durable record `dsh-tool-skill` writes
 * after the operator's own `/name` gesture resolved to a user-invocable skill.
 */
function invokedEvent(seq: number, name: string): SessionEvent {
  return {
    type: 'user/message',
    seq: SessionSeq(seq),
    time: seq,
    data: createUserMessage({
      content: [{ type: 'text', text: `<skill_content name="${name}"></skill_content>` }],
      source: { kind: 'skill-invocation', name, form: 'instructions' },
    }),
    surfaceOp: 'append',
  }
}

/** One operator-authored text message carrying no invocation. */
function userEvent(seq: number, text: string): SessionEvent {
  return {
    type: 'user/message',
    seq: SessionSeq(seq),
    time: seq,
    data: createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }),
    surfaceOp: 'append',
  }
}

/** One resolved slash command, which only a human-facing surface can dispatch. */
function commandEvent(seq: number, name: string): SessionEvent {
  return {
    type: 'command/run',
    seq: SessionSeq(seq),
    time: seq,
    data: { commandId: CommandId(`command-${String(seq)}`), name, source: { kind: 'user' } },
  }
}

/** One event the unit is not interested in. */
function otherEvent(seq: number): SessionEvent {
  return { type: 'turn/start', seq: SessionSeq(seq), time: seq, data: { turn: 1 } }
}

/** Fold events through the shipped unit, exactly as the registry does. */
function fold(events: readonly SessionEvent[]): SkillsUsed {
  let state: SkillsUsed = skillsUsedProjection.init()
  for (const event of events) state = skillsUsedProjection.apply(state, event)
  return state
}

describe('the operator-invocation fold', () => {
  it('starts with nothing used', () => {
    expect(skillsUsedProjection.init()).toEqual({ skills: [] })
  })

  it('returns the same state reference for every event it does not own', () => {
    const state = fold([invokedEvent(1, 'dashboard')])
    expect(skillsUsedProjection.apply(state, otherEvent(2))).toBe(state)
    expect(skillsUsedProjection.apply(state, userEvent(3, 'now run the gate check'))).toBe(state)
  })

  it('ignores a message the operator did not author', () => {
    const injected = {
      type: 'user/message',
      seq: SessionSeq(1),
      time: 1,
      data: createUserMessage({
        content: [{ type: 'text', text: 'available skills' }],
        // The model-facing catalog is a real non-operator message source.
        source: { kind: 'skill-catalog', form: 'catalog', entries: [] },
      }),
      surfaceOp: 'append',
    } as SessionEvent
    const state = fold([])
    expect(skillsUsedProjection.apply(state, injected)).toBe(state)
  })

  it('records the skill an operator gesture invoked', () => {
    expect(fold([invokedEvent(1, 'dashboard')]).skills).toEqual(['dashboard'])
  })

  it('records the command an operator ran', () => {
    expect(fold([commandEvent(1, 'plan')]).skills).toEqual(['plan'])
  })

  it('deduplicates in first-use order rather than in log order', () => {
    const state = fold([
      invokedEvent(1, 'dashboard'),
      commandEvent(2, 'plan'),
      invokedEvent(3, 'dashboard'),
      invokedEvent(4, 'code-only'),
      commandEvent(5, 'plan'),
    ])
    expect(state.skills).toEqual(['dashboard', 'plan', 'code-only'])
  })

  it('bounds the list at the earliest uses and validates as stored JSON', () => {
    const events = Array.from(
      { length: MAX_SKILLS_USED + 3 },
      (_, index) => invokedEvent(index + 1, `skill-${String(index)}`),
    )
    const state = fold(events)
    expect(state.skills).toHaveLength(MAX_SKILLS_USED)
    expect(state.skills[0]).toBe('skill-0')
    expect(state.skills.at(-1)).toBe(`skill-${String(MAX_SKILLS_USED - 1)}`)
    expect(skillsUsedProjection.stateSchema.safeParse(state).success).toBe(true)
  })

  it('keeps the wire view on the folded reference', () => {
    const state = fold([invokedEvent(1, 'dashboard')])
    expect(skillsUsedProjection.wire.view(state)).toBe(state)
  })
})

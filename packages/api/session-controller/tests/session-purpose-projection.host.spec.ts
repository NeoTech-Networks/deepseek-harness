/**
 * The Session purpose projection behind the Session footer's fourth line:
 * it folds only `session/purpose`, latest wins, and every other event keeps
 * the SAME state reference.
 */

import { describe, expect, it } from 'vitest'
import { SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-title'
import { sessionPurposeProjection } from '../src/session-purpose-projection.ts'
import type { SessionPurpose } from '../src/types.ts'

function purposeEvent(seq: number, purpose: string): SessionEvent {
  return {
    type: 'session/purpose',
    seq: SessionSeq(seq),
    time: seq,
    data: { purpose, sourceSeq: SessionSeq(0), skills: [], model: { provider: 'p', model: 'm' } },
  }
}

function otherEvent(seq: number): SessionEvent {
  return { type: 'turn/start', seq: SessionSeq(seq), time: seq, data: { turn: 1 } }
}

function fold(events: readonly SessionEvent[]): SessionPurpose {
  let state: SessionPurpose = sessionPurposeProjection.init()
  for (const event of events) state = sessionPurposeProjection.apply(state, event)
  return state
}

describe('the session purpose fold', () => {
  it('starts with no purpose', () => {
    expect(sessionPurposeProjection.init()).toEqual({ purpose: null })
  })

  it('returns the same reference for events it does not own', () => {
    const state = fold([purposeEvent(1, 'Adds a footer line.')])
    expect(sessionPurposeProjection.apply(state, otherEvent(2))).toBe(state)
    expect(sessionPurposeProjection.apply(state, purposeEvent(3, 'Adds a footer line.'))).toBe(state)
  })

  it('records the purpose and lets a later one win', () => {
    expect(fold([purposeEvent(1, 'Adds a footer line.')]).purpose).toBe('Adds a footer line.')
    expect(fold([purposeEvent(1, 'First.'), otherEvent(2), purposeEvent(3, 'Second.')]).purpose).toBe('Second.')
  })

  it('validates as stored JSON and keeps the wire view on the folded reference', () => {
    const state = fold([purposeEvent(1, 'Adds a footer line.')])
    expect(sessionPurposeProjection.stateSchema.safeParse(state).success).toBe(true)
    expect(sessionPurposeProjection.stateSchema.safeParse(fold([])).success).toBe(true)
    expect(sessionPurposeProjection.wire.view(state)).toBe(state)
  })
})

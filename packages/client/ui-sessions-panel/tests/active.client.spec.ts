import { describe, expect, it } from 'vitest'
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionPendingInteractionBase } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { deriveSessions } from '../src/client/active.ts'

const sid = (id: string) => id as SessionId

const summary = (id: string, updatedAt: number): SessionSummary => ({
  id: sid(id), displayTitle: id, running: false, blank: false, updatedAt,
})

const list = (...items: SessionSummary[]): SessionListState => ({
  ids: items.map(item => item.id),
  byId: Object.fromEntries(items.map(item => [item.id, item])),
  current: undefined,
  phase: 'ready',
  subagentsByParent: {},
  jobsBySession: {},
  currentAddress: undefined,
})

const noArchive: readonly SessionId[] = []
const noAttention: ReadonlyMap<SessionId, SessionPendingInteractionBase> = new Map()
const archived = (...ids: string[]): readonly SessionId[] => ids.map(sid)
const attention = (id: string, kind: string): ReadonlyMap<SessionId, SessionPendingInteractionBase> =>
  new Map([[sid(id), { key: `${kind}:1`, kind, sessionId: sid(id) }]])

const ids = (rows: readonly { id: SessionId }[]): string[] => rows.map(row => row.id as string)

describe('deriveSessions', () => {
  it('classifies awaiting, plan, running, and done as active and idle otherwise', () => {
    const awaiting = { ...summary('awaiting', 10), projectionValues: { plan: { active: false, pending: false } } }
    const planning = { ...summary('planning', 9), projectionValues: { plan: { active: true, pending: false } } }
    const running = { ...summary('running', 8), running: true }
    const done = { ...summary('done', 7), completed: true }
    const idle = summary('idle', 6)
    const result = deriveSessions(list(idle, done, running, planning, awaiting), noArchive, attention('awaiting', 'question'))

    expect(ids(result.active)).toEqual(['awaiting', 'planning', 'running', 'done'])
    expect(ids(result.idle)).toEqual(['idle'])
    expect(result.active.map(row => row.phase)).toEqual(['awaiting', 'planning', 'running', 'done'])
  })

  it.each(['approval', 'plan-review', 'question'] as const)(
    'maps the %s pending interaction to the awaiting phase',
    (kind) => {
      const row = summary('row', 1)
      const result = deriveSessions(list(row), noArchive, attention('row', kind))
      expect(result.active[0]).toMatchObject({ id: row.id, phase: 'awaiting' })
    },
  )

  it('ignores an unknown pending-interaction kind and falls through to idle', () => {
    const row = summary('row', 1)
    const result = deriveSessions(list(row), noArchive, attention('row', 'unknown-kind'))
    expect(result.idle[0]).toMatchObject({ id: row.id, phase: 'idle' })
  })

  it('folds running subagent descendants into their parent as the subagents phase', () => {
    const parent = summary('parent', 1)
    const subagent = { ...summary('subagent', 2), parentId: parent.id, origin: 'subagent' as const, running: true }
    const grandchild = { ...summary('grandchild', 3), parentId: subagent.id, origin: 'subagent' as const, running: true }
    const result = deriveSessions(
      { ...list(parent, subagent, grandchild), current: parent.id },
      noArchive,
      noAttention,
    )
    // Subagent rows are never listed; the parent surfaces with the running descendants folded in.
    expect(ids(result.active)).toEqual(['parent'])
    expect(result.active[0]).toMatchObject({ id: parent.id, phase: 'subagents' })
  })

  it('ignores a non-running subagent when counting descendants', () => {
    const parent = summary('parent', 1)
    const quiet = { ...summary('quiet', 2), parentId: parent.id, origin: 'subagent' as const, running: false }
    const result = deriveSessions({ ...list(parent, quiet), current: parent.id }, noArchive, noAttention)
    expect(result.active).toEqual([])
    expect(ids(result.idle)).toEqual(['parent'])
  })

  it('hides archived sessions', () => {
    const kept = summary('kept', 2)
    const gone = summary('gone', 1)
    const result = deriveSessions(list(kept, gone), archived('gone'), noAttention)
    expect(ids(result.idle)).toEqual(['kept'])
  })

  it('shows only the current blank session and marks it current', () => {
    const currentBlank = { ...summary('current-blank', 3), blank: true }
    const staleBlank = { ...summary('stale-blank', 2), blank: true }
    const real = summary('real', 1)
    const result = deriveSessions(
      { ...list(real, currentBlank, staleBlank), current: currentBlank.id },
      noArchive,
      noAttention,
    )
    // Idle rows sort by recency, so the newer current blank leads the older real session.
    expect(ids(result.idle)).toEqual(['current-blank', 'real'])
    expect(result.idle.find(row => row.id === currentBlank.id)).toMatchObject({ blank: true, title: '' })
    expect(result.idle.find(row => row.id === real.id)).toMatchObject({ blank: false, title: 'real', current: false })
  })

  it('sorts within a phase by recency and uses id as the tiebreak', () => {
    const tieB = summary('tie-b', 5)
    const tieA = summary('tie-a', 5)
    const older = summary('older', 1)
    const result = deriveSessions(list(older, tieB, tieA), noArchive, noAttention)
    expect(ids(result.idle)).toEqual(['tie-a', 'tie-b', 'older'])
  })

  it('resolves the id tiebreak in either input direction', () => {
    const descending = deriveSessions(list(summary('b', 5), summary('a', 5)), noArchive, noAttention)
    expect(ids(descending.idle)).toEqual(['a', 'b'])
    const ascending = deriveSessions(list(summary('a', 5), summary('b', 5)), noArchive, noAttention)
    expect(ids(ascending.idle)).toEqual(['a', 'b'])
  })

  it('tolerates an id whose summary has not landed yet', () => {
    const partial: SessionListState = { ...list(summary('present', 1)), ids: [sid('ghost'), sid('present')] }
    expect(ids(deriveSessions(partial, noArchive, noAttention).idle)).toEqual(['present'])
  })

  it('returns empty buckets for an empty list', () => {
    expect(deriveSessions(list(), noArchive, noAttention)).toEqual({ active: [], idle: [] })
  })
})

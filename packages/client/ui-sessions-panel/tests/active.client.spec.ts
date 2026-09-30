import { describe, expect, it } from 'vitest'
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionStatus, SessionStatusSnapshot } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { derivePhase } from '@deepseek-ai/dsh-client-ui-workspace/src/client/tree.ts'
import { deriveSessions } from '../src/client/active.ts'

const sid = (id: string) => id as SessionId

const summary = (id: string, updatedAt: number): SessionSummary => ({
  id: sid(id), displayTitle: id, running: false, blank: false, updatedAt, retainedBy: {},
})

const list = (...items: SessionSummary[]): SessionListState => ({
  ids: items.map(item => item.id),
  byId: Object.fromEntries(items.map(item => [item.id, item])),
  phase: 'ready',
  projectionsBySession: {},
})

/** The list with one Session retained by the main view (0.1.7's "current"). */
const withMain = (state: SessionListState, id: SessionId): SessionListState => ({
  ...state,
  byId: { ...state.byId, [id]: { ...state.byId[id]!, retainedBy: { mainView: 1 } } },
})

const noArchive: readonly SessionId[] = []
const noStatus: SessionStatusSnapshot = new Map()
const archived = (...ids: string[]): readonly SessionId[] => ids.map(sid)
const statusOf = (over: Partial<SessionStatus>): SessionStatus => ({
  running: undefined, pendingInteraction: undefined, completionUnread: false, ...over,
})
const attention = (id: string, kind: string): SessionStatusSnapshot =>
  new Map([[sid(id), statusOf({ pendingInteraction: { key: `${kind}:1`, kind, sessionId: sid(id) } as never })]])
const completed = (...ids: string[]): SessionStatusSnapshot =>
  new Map(ids.map(id => [sid(id), statusOf({ completionUnread: true })]))

const ids = (rows: readonly { id: SessionId }[]): string[] => rows.map(row => row.id as string)

describe('deriveSessions', () => {
  it('classifies awaiting, plan, running, and done as active and idle otherwise', () => {
    const awaiting = { ...summary('awaiting', 10), projectionValues: { plan: { active: false, pending: false } } }
    const planning = { ...summary('planning', 9), projectionValues: { plan: { active: true, pending: false } } }
    const running = { ...summary('running', 8), running: true }
    const done = summary('done', 7)
    const idle = summary('idle', 6)
    const statuses = new Map([...attention('awaiting', 'question'), ...completed('done')])
    const result = deriveSessions(list(idle, done, running, planning, awaiting), noArchive, statuses)

    expect(ids(result.active)).toEqual(['awaiting', 'planning', 'running', 'done'])
    expect(ids(result.idle)).toEqual(['idle'])
    expect(result.active.map(row => row.phase)).toEqual(['awaiting', 'planning', 'running', 'done'])
  })

  it('prefers the live running status over the list summary', () => {
    const row = summary('row', 1)
    const result = deriveSessions(list(row), noArchive, new Map([[row.id, statusOf({ running: true })]]))
    expect(result.active[0]).toMatchObject({ id: row.id, phase: 'running' })
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
    const result = deriveSessions(withMain(list(parent, subagent, grandchild), parent.id), noArchive, noStatus)
    // Subagent rows are never listed; the parent surfaces with the running descendants folded in.
    expect(ids(result.active)).toEqual(['parent'])
    expect(result.active[0]).toMatchObject({ id: parent.id, phase: 'subagents' })
  })

  it('ignores a non-running subagent when counting descendants', () => {
    const parent = summary('parent', 1)
    const quiet = { ...summary('quiet', 2), parentId: parent.id, origin: 'subagent' as const, running: false }
    const result = deriveSessions(withMain(list(parent, quiet), parent.id), noArchive, noStatus)
    expect(result.active).toEqual([])
    expect(ids(result.idle)).toEqual(['parent'])
  })

  it('hides archived sessions', () => {
    const kept = summary('kept', 2)
    const gone = summary('gone', 1)
    const result = deriveSessions(list(kept, gone), archived('gone'), noStatus)
    expect(ids(result.idle)).toEqual(['kept'])
  })

  it('shows only the current blank session and marks it current', () => {
    const currentBlank = { ...summary('current-blank', 3), blank: true }
    const staleBlank = { ...summary('stale-blank', 2), blank: true }
    const real = summary('real', 1)
    const result = deriveSessions(withMain(list(real, currentBlank, staleBlank), currentBlank.id), noArchive, noStatus)
    // Idle rows sort by recency, so the newer current blank leads the older real session.
    expect(ids(result.idle)).toEqual(['current-blank', 'real'])
    expect(result.idle.find(row => row.id === currentBlank.id)).toMatchObject({ blank: true, title: '', current: true })
    expect(result.idle.find(row => row.id === real.id)).toMatchObject({ blank: false, title: 'real', current: false })
  })

  it('sorts within a phase by recency and uses id as the tiebreak', () => {
    const tieB = summary('tie-b', 5)
    const tieA = summary('tie-a', 5)
    const older = summary('older', 1)
    const result = deriveSessions(list(older, tieB, tieA), noArchive, noStatus)
    expect(ids(result.idle)).toEqual(['tie-a', 'tie-b', 'older'])
  })

  it('resolves the id tiebreak in either input direction', () => {
    const descending = deriveSessions(list(summary('b', 5), summary('a', 5)), noArchive, noStatus)
    expect(ids(descending.idle)).toEqual(['a', 'b'])
    const ascending = deriveSessions(list(summary('a', 5), summary('b', 5)), noArchive, noStatus)
    expect(ids(ascending.idle)).toEqual(['a', 'b'])
  })

  it('tolerates an id whose summary has not landed yet', () => {
    const partial: SessionListState = { ...list(summary('present', 1)), ids: [sid('ghost'), sid('present')] }
    expect(ids(deriveSessions(partial, noArchive, noStatus).idle)).toEqual(['present'])
  })

  it('returns empty buckets for an empty list', () => {
    expect(deriveSessions(list(), noArchive, noStatus)).toEqual({ active: [], idle: [] })
  })

  // This panel re-derives phase on its own (a feature plugin must not
  // runtime-import another feature plugin's values), so nothing but a test can
  // keep the two derivations honest.
  it('agrees with the workspace sidebar on every phase', () => {
    const status = { id: 'stuck', label: 'Stuck', icon: 'blocked' as const, tone: 'error' as const }
    const cases: readonly {
      name: string
      summary: SessionSummary
      statuses: SessionStatusSnapshot
      facts: Parameters<typeof derivePhase>[0]
    }[] = [
      {
        name: 'awaiting',
        summary: summary('awaiting', 1),
        statuses: attention('awaiting', 'question'),
        facts: { pendingInteraction: 'question', running: false, runningSubagentCount: 0, completed: false },
      },
      {
        name: 'planning beats running',
        summary: { ...summary('planning', 1), running: true, projectionValues: { plan: { active: true, pending: false } } },
        statuses: noStatus,
        facts: { running: true, runningSubagentCount: 0, completed: false, planActive: true },
      },
      {
        name: 'running beats a declared status',
        summary: { ...summary('running', 1), running: true, projectionValues: { sessionStatus: status } },
        statuses: noStatus,
        facts: { running: true, runningSubagentCount: 0, completed: false, declaredStatus: status },
      },
      {
        name: 'declared beats the completion reminder',
        summary: { ...summary('declared', 1), projectionValues: { sessionStatus: status } },
        statuses: completed('declared'),
        facts: { running: false, runningSubagentCount: 0, completed: true, declaredStatus: status },
      },
      {
        name: 'done',
        summary: summary('done', 1),
        statuses: completed('done'),
        facts: { running: false, runningSubagentCount: 0, completed: true },
      },
      {
        name: 'idle',
        summary: summary('idle', 1),
        statuses: noStatus,
        facts: { running: false, runningSubagentCount: 0, completed: false },
      },
    ]

    for (const testCase of cases) {
      const result = deriveSessions(list(testCase.summary), noArchive, testCase.statuses)
      const row = [...result.active, ...result.idle][0]
      // The panel collapses the three awaiting-* phases into one; every other
      // phase name is shared verbatim.
      const expected = derivePhase(testCase.facts).replace(/^awaiting-.*$/, 'awaiting')
      expect(`${testCase.name}: ${String(row?.phase)}`).toBe(`${testCase.name}: ${expected}`)
    }
  })
})

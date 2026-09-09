// @vitest-environment jsdom
/**
 * The sessions panel's body: what the Active/All filter shows, what a row
 * carries, and what clicking one does. The framework hooks are plain stubs
 * because the component reads them as props and returns fixed snapshots; the
 * classification and ordering are covered by active.spec.ts, so here only the
 * presentation contract is asserted.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionPendingInteractionBase } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { SessionsPanel } from '../src/client/SessionsPanel.tsx'
import type { SessionsPanelProps } from '../src/client/SessionsPanel.tsx'

afterEach(cleanup)

const sid = (id: string) => id as SessionId

const summary = (id: string, updatedAt: number, extra: Partial<SessionSummary> = {}): SessionSummary => ({
  id: sid(id), displayTitle: id, running: false, blank: false, updatedAt, ...extra,
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

interface MountOptions {
  sessions?: SessionSummary[]
  current?: SessionId
  pending?: ReadonlyMap<SessionId, SessionPendingInteractionBase>
  workspaces?: { workspaceId: string; sessionIds: string[]; title: string }[]
  archived?: string[]
}

function mount(options: MountOptions = {}) {
  const sessions = options.sessions ?? []
  const state: SessionListState = { ...list(...sessions), current: options.current }
  const open = vi.fn<(id: SessionId) => void>()
  const props = {
    useSessions: (selector: (s: SessionListState) => unknown) => selector(state),
    useSessionPendingInteraction: (selector: (s: ReadonlyMap<SessionId, SessionPendingInteractionBase>) => unknown) =>
      selector(options.pending ?? new Map()),
    useWorkspaces: (selector: (s: unknown) => unknown) => selector({
      items: (options.workspaces ?? []).map(ws => ({
        workspaceId: ws.workspaceId,
        sessionIds: ws.sessionIds.map(sid),
        title: ws.title,
        path: `/projects/${ws.title.toLowerCase()}`,
        group: '',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })),
      archivedSessionIds: (options.archived ?? []).map(sid),
    }),
    open,
    // Copy is the dictionary's contract; the key stands in for the translation.
    t: (key: string) => key,
  } as unknown as SessionsPanelProps
  const view = render(<SessionsPanel {...props} />)
  const rows = (): string[] =>
    [...view.container.querySelectorAll('[data-sessions-panel-row]')].map(node => node.getAttribute('data-sessions-panel-row') ?? '')
  return { view, open, rows }
}

describe('SessionsPanel', () => {
  it('shows only active rows by default, active first', () => {
    const idle = summary('idle', 100)
    const running = { ...summary('running', 200), running: true }
    const { view, rows } = mount({ sessions: [idle, running] })

    expect(rows()).toEqual(['running'])
    expect(view.queryByText('idle')).toBeNull()
  })

  it('toggles to All and back to Active', () => {
    const idle = summary('idle', 100)
    const running = { ...summary('running', 200), running: true }
    const { view, rows } = mount({ sessions: [idle, running] })

    fireEvent.click(view.getByText('filter.all'))
    expect(rows()).toEqual(['running', 'idle'])
    expect(view.getByText('idle')).not.toBeNull()
    fireEvent.click(view.getByText('filter.active'))
    expect(rows()).toEqual(['running'])
  })

  it('opens a session when its row is clicked', () => {
    const running = { ...summary('running', 200), running: true }
    const { view, open } = mount({ sessions: [running] })

    fireEvent.click(view.getByText('running'))
    expect(open).toHaveBeenCalledWith(sid('running'))
  })

  it('renders the active empty state when nothing is active', () => {
    const idle = summary('idle', 100)
    const { view } = mount({ sessions: [idle] })
    expect(view.getByText('empty.active')).not.toBeNull()
  })

  it('renders the all empty state when there are no sessions', () => {
    const { view } = mount({})
    fireEvent.click(view.getByText('filter.all'))
    expect(view.getByText('empty.none')).not.toBeNull()
  })

  it('labels a row with its workspace and marks the current session', () => {
    const running = { ...summary('running', 200), running: true }
    const { view } = mount({
      sessions: [running],
      current: running.id,
      workspaces: [{ workspaceId: 'ws-1', sessionIds: ['running'], title: 'Alpha' }],
    })
    expect(view.getByText('Alpha')).not.toBeNull()
    const row = view.container.querySelector('[data-sessions-panel-row="running"]')
    expect(row?.getAttribute('aria-current')).toBe('true')
  })

  it('keeps the first workspace label when a session is claimed twice', () => {
    const running = { ...summary('running', 200), running: true }
    const { view } = mount({
      sessions: [running],
      workspaces: [
        { workspaceId: 'ws-1', sessionIds: ['running'], title: 'Alpha' },
        { workspaceId: 'ws-2', sessionIds: ['running'], title: 'Beta' },
      ],
    })
    expect(view.getByText('Alpha')).not.toBeNull()
    expect(view.queryByText('Beta')).toBeNull()
  })

  it('draws the right state dot for each phase and none for idle', () => {
    const now = Date.now()
    const awaiting = summary('awaiting', now - 5 * 60_000)
    const planning = { ...summary('planning', now - 4 * 60_000), projectionValues: { plan: { active: true, pending: false } } }
    const running = { ...summary('running', now), running: true }
    const parent = summary('parent', now - 3 * 60_000)
    const subagent = { ...summary('subagent', now - 2 * 60_000), parentId: parent.id, origin: 'subagent' as const, running: true }
    const done = { ...summary('done', now - 60_000), completed: true }
    const idle = summary('idle', now - 120 * 60_000)
    const pending: ReadonlyMap<SessionId, SessionPendingInteractionBase> = new Map([[
      awaiting.id, { key: 'q:1', kind: 'question', sessionId: awaiting.id },
    ]])
    const { view } = mount({
      sessions: [idle, done, subagent, parent, running, planning, awaiting],
      pending,
    })

    expect(view.container.querySelectorAll('[data-state="warning"]')).toHaveLength(2)
    expect(view.container.querySelectorAll('[data-state="ongoing"]')).toHaveLength(2)
    expect(view.container.querySelectorAll('[data-state="done"]')).toHaveLength(1)

    // The idle row renders no dot until it is shown under All.
    fireEvent.click(view.getByText('filter.all'))
    const idleRow = view.container.querySelector('[data-sessions-panel-row="idle"]')
    expect(idleRow?.querySelector('[data-state]')).toBeNull()
  })

  it('shows a relative time and a localized New Session label for the blank row', () => {
    const now = Date.now()
    const blank = { ...summary('current-blank', now), blank: true }
    const old = summary('old', now - 3_600_000)
    const { view } = mount({ sessions: [old, blank], current: blank.id })
    // The blank row is the current session and renders the New Session label.
    fireEvent.click(view.getByText('filter.all'))
    expect(view.getByText('session.new')).not.toBeNull()
    expect(view.getByText('time.hours')).not.toBeNull()
  })
})

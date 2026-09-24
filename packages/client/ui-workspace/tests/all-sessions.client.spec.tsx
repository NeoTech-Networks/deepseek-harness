// @vitest-environment jsdom
import type { GlobalStandardProps } from '@deepseek-ai/dsh-client-ui-slots'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { bindSnapshotSelector, makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type {
  WorkspaceId, WorkspaceSnapshot, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionStatusSnapshot } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import type { AllSessionsProps } from '../src/client/contract/slots.ts'
import { createAllSessionsStore } from '../src/client/stores.ts'
import { AllSessionsSection } from '../src/client/rows/AllSessions.tsx'
import { zh } from '../src/client/locales.ts'

// Every fixture carries the hooks the framework merges into GlobalStandardProps.
const useResource = (() => ({ status: 'none' as const, value: undefined, failure: undefined, reload: () => {} })) as GlobalStandardProps['useResource']
const usePanelInfo: GlobalStandardProps['usePanelInfo'] = selector => selector({ activePanelId: null })

afterEach(cleanup)
beforeEach(() => { localStorage.clear() })

// The seat's key domain is workspace ∪ common; the stub mirrors the real
// lookup chain (namespace, then common vocabulary, then the key).
const t: AllSessionsProps['t'] = makeTranslate(zh, commonZh)

const sid = (id: string) => id as SessionId
const wid = (id: string) => id as WorkspaceId
const summary = (id: string, updatedAt: number, overrides: Partial<SessionSummary> = {}): SessionSummary => ({
  id: sid(id), displayTitle: id, running: false, blank: false, updatedAt, ...overrides,
  retainedBy: overrides.retainedBy ?? {},
})
const sessionState = (items: readonly SessionSummary[], overrides: Partial<SessionListState> = {}): SessionListState => ({
  ids: items.map(item => item.id),
  byId: Object.fromEntries(items.map(item => [item.id, item])),
  phase: 'ready',
  projectionsBySession: {},
  ...overrides,
})
const workspace = (id: string, sessionIds: string[], title = id): WorkspaceView => ({
  workspaceId: wid(id), path: `/projects/${id}`, title,
  sessionIds: sessionIds.map(sid), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
})
const workspaceState = (
  items: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[] = [],
  pinnedSessionIds: readonly SessionId[] = [],
): WorkspaceSnapshot => ({ items, archivedSessionIds, pinnedSessionIds, state: 'idle', phase: 'ready', error: null })
const noStatus: SessionStatusSnapshot = new Map()
function hook<T>(snapshot: T) {
  return function select<S>(selector: (state: T) => S): S { return selector(snapshot) }
}

function mount(overrides: Partial<AllSessionsProps> = {}) {
  const store = createAllSessionsStore().create()
  const props: AllSessionsProps = {
    wide: true,
    expandSidebar: vi.fn(),
    useSessions: hook(sessionState([])),
    useSessionStatus: hook(noStatus),
    useSessionRetainInfo: () => undefined,
    usePanelInfo, useResource,
    useWorkspaces: hook(workspaceState([])),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    open: vi.fn(),
    t,
    ...overrides,
  }
  const view = render(<AllSessionsSection {...props} />)
  return { view, props, store }
}

describe('AllSessionsSection', () => {
  it('lists every unarchived session newest-first with its Workspace label', () => {
    const owned = summary('owned', 20)
    const loose = summary('loose-title', 10, { cwd: '/projects/loose' })
    mount({
      useSessions: hook(sessionState([owned, loose])),
      useWorkspaces: hook(workspaceState([workspace('alpha', ['owned'], 'Alpha')])),
    })
    const rows = screen.getAllByRole('treeitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.textContent).toContain('owned')
    expect(rows[0]!.textContent).toContain('Alpha')
    expect(rows[1]!.textContent).toContain('loose-title')
    expect(rows[1]!.textContent).toContain('loose')
  })

  it('hides archived sessions', () => {
    const kept = summary('kept', 2)
    const gone = summary('gone', 1)
    mount({
      useSessions: hook(sessionState([kept, gone])),
      useWorkspaces: hook(workspaceState([], [gone.id])),
    })
    const rows = screen.getAllByRole('treeitem')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.textContent).toContain('kept')
  })

  it('opens the session on click', () => {
    const open = vi.fn()
    const one = summary('one', 1)
    mount({ useSessions: hook(sessionState([one])), open })
    fireEvent.click(screen.getByRole('treeitem'))
    expect(open).toHaveBeenCalledWith(one.id)
  })

  it('collapses and expands through the header toggle', () => {
    mount({ useSessions: hook(sessionState([summary('one', 1)])) })
    const toggle = screen.getByRole('button', { name: '展开或收起全部会话' })
    expect(screen.getByRole('tree')).toBeTruthy()
    fireEvent.click(toggle)
    expect(screen.queryByRole('tree')).toBeNull()
    fireEvent.click(toggle)
    expect(screen.getByRole('tree')).toBeTruthy()
  })

  it('shows the empty state when there are no sessions', () => {
    mount({ useSessions: hook(sessionState([])) })
    expect(screen.getByText('暂无会话')).toBeTruthy()
  })

  it('renders nothing on the collapsed rail', () => {
    const b = mount({ wide: false, useSessions: hook(sessionState([summary('one', 1)])) })
    expect(b.view.container.textContent).toBe('')
  })

  it('survives a rail/wide round trip without changing its hook count', () => {
    const b = mount({ wide: false, useSessions: hook(sessionState([summary('one', 1)])) })
    b.view.rerender(<AllSessionsSection {...b.props} wide />)
    expect(screen.getByRole('treeitem').textContent).toContain('one')
    b.view.rerender(<AllSessionsSection {...b.props} wide={false} />)
    expect(b.view.container.querySelector('[data-all-sessions-error]')).toBeNull()
    expect(b.view.container.textContent).toBe('')
  })

  it('leads with pinned sessions', () => {
    mount({
      useSessions: hook(sessionState([summary('newest', 3), summary('pinned', 1)])),
      useWorkspaces: hook(workspaceState([], [], [sid('pinned')])),
    })
    expect(screen.getAllByRole('treeitem').map(row => row.dataset.allSessionsRow)).toEqual(['pinned', 'newest'])
  })

  it('keeps a crashing section visible, and lets one retry recover it', () => {
    const sessions = sessionState([summary('one', 1)])
    let broken = true
    const useSessions: AllSessionsProps['useSessions'] = (selector) => {
      if (broken) throw new Error('transient vanish')
      return selector(sessions)
    }
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      mount({ useSessions })

      // The failure is visible, with its reason, instead of the shared slot
      // boundary's empty div and a console line nobody sees.
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('本栏未能绘制。')
      expect(alert.textContent).toContain('transient vanish')
      expect(screen.queryByRole('tree')).toBeNull()

      // One retry re-reads the current snapshot, so a transient cause recovers
      // without an app restart.
      broken = false
      fireEvent.click(screen.getByRole('button', { name: '重试' }))
      expect(screen.getByRole('tree')).toBeTruthy()
      expect(screen.getByRole('treeitem').textContent).toContain('one')
    } finally {
      quiet.mockRestore()
    }
  })
})

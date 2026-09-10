// @vitest-environment jsdom
import type { GlobalStandardProps } from '@deepseek-ai/dsh-client-ui-slots'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { bindSnapshotSelector, makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type {
  WorkspaceId, WorkspaceSnapshot, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionPendingInteractionSnapshot } from '@deepseek-ai/dsh-client-ui-session/client'
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
})
const sessionState = (items: readonly SessionSummary[], overrides: Partial<SessionListState> = {}): SessionListState => ({
  ids: items.map(item => item.id),
  byId: Object.fromEntries(items.map(item => [item.id, item])),
  current: undefined,
  phase: 'ready',
  subagentsByParent: {}, jobsBySession: {},
  currentAddress: undefined,
  ...overrides,
})
const workspace = (id: string, sessionIds: string[], title = id): WorkspaceView => ({
  workspaceId: wid(id), path: `/projects/${id}`, title, group: '',
  sessionIds: sessionIds.map(sid), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
})
const workspaceState = (
  items: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[] = [],
): WorkspaceSnapshot => ({ items, archivedSessionIds, state: 'idle', phase: 'ready', error: null })
const noPendingInteraction: SessionPendingInteractionSnapshot = new Map()
function hook<T>(snapshot: T) {
  return function select<S>(selector: (state: T) => S): S { return selector(snapshot) }
}

function mount(overrides: Partial<AllSessionsProps> = {}) {
  const store = createAllSessionsStore().create()
  const props: AllSessionsProps = {
    wide: true,
    expandSidebar: vi.fn(),
    useSessions: hook(sessionState([])),
    useSessionPendingInteraction: hook(noPendingInteraction),
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
})

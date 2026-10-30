// @vitest-environment jsdom
import type { GlobalStandardProps } from '@deepseek-ai/dsh-client-ui-slots'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { allowAllAccess, bindSnapshotSelector, makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
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
  id: sid(id), title: id, displayTitle: id, running: false, blank: false, updatedAt, ...overrides,
  retainedBy: overrides.retainedBy ?? {},
})
const sessionState = (items: readonly SessionSummary[], overrides: Partial<SessionListState> = {}): SessionListState => ({
  ids: items.map(item => item.id),
  byId: Object.fromEntries(items.map(item => [item.id, item])),
  phase: 'ready',
  projectionsBySession: {},
  ...overrides,
})
const workspace = (id: string, sessionIds: string[], title = id, path = `/projects/${id}`): WorkspaceView => ({
  workspaceId: wid(id), path, title,
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
    ...allowAllAccess,
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

// ds-bot's Workspace: its directory is the durable identity, its title the
// fallback. The fixture spells the path with backslashes because that is what
// the Host reports on Windows.
const BOT_PATH = 'C:\\Users\\SteveDempsey\\.dsh\\bot\\workspace'
const botWorkspace = (sessionIds: string[], title = 'DS Bot'): WorkspaceView =>
  workspace('bot', sessionIds, title, BOT_PATH)
const BOT_TOGGLE = '展开或收起机器人会话'
const BOT_GROUP = '机器人会话'

const rowIds = (tree: HTMLElement): (string | undefined)[] =>
  [...tree.querySelectorAll(':scope > [data-all-sessions-row]')].map(row => (row as HTMLElement).dataset.allSessionsRow)

describe('AllSessionsSection Bot Sessions group', () => {
  it('moves bot Workspace sessions out of the flat list and into the group', () => {
    mount({
      useSessions: hook(sessionState([summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([botWorkspace(['bot-one'])])),
    })
    fireEvent.click(screen.getByRole('button', { name: BOT_TOGGLE }))

    const trees = screen.getAllByRole('tree')
    expect(trees).toHaveLength(2)
    // Nothing sits directly in the section's own list any more.
    expect(rowIds(trees[0]!)).toEqual([])
    // The row is inside the nested tree, not the section's flat one.
    expect(rowIds(screen.getByRole('tree', { name: BOT_GROUP }))).toEqual(['bot-one'])
  })

  it('is folded by default and reveals its rows on click', () => {
    mount({
      useSessions: hook(sessionState([summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([botWorkspace(['bot-one'])])),
    })
    const toggle = screen.getByRole('button', { name: BOT_TOGGLE })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getAllByRole('tree')).toHaveLength(1)
    expect(screen.queryByRole('treeitem')).toBeNull()

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('tree')).toHaveLength(2)
    expect(screen.getAllByRole('treeitem')).toHaveLength(1)

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getAllByRole('tree')).toHaveLength(1)
  })

  it('leaves an ordinary Workspace session in the flat list, unaffected', () => {
    mount({
      useSessions: hook(sessionState([summary('plain', 9), summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([
        workspace('alpha', ['plain'], 'Alpha'),
        botWorkspace(['bot-one']),
      ])),
    })
    const outer = screen.getByRole('tree', { name: '全部会话' })
    expect(rowIds(outer)).toEqual(['plain'])
  })

  it('renders no group at all when no session lives in the bot Workspace', () => {
    mount({
      useSessions: hook(sessionState([summary('plain', 9)])),
      useWorkspaces: hook(workspaceState([workspace('alpha', ['plain'], 'Alpha')])),
    })
    expect(screen.queryByRole('button', { name: BOT_TOGGLE })).toBeNull()
    expect(screen.queryByText(BOT_GROUP)).toBeNull()
    expect(screen.getAllByRole('tree')).toHaveLength(1)
  })

  it('puts a session added to the bot Workspace into the group on the next render', () => {
    const first = mount({
      useSessions: hook(sessionState([summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([botWorkspace(['bot-one'])])),
    })
    fireEvent.click(screen.getByRole('button', { name: BOT_TOGGLE }))
    expect(rowIds(screen.getByRole('tree', { name: BOT_GROUP }))).toEqual(['bot-one'])

    // A new bot chat: nothing tagged, nothing cached, nothing moved. The group
    // is derived from the same live snapshot, so the next one carries it.
    first.view.rerender(
      <AllSessionsSection
        {...first.props}
        useSessions={hook(sessionState([summary('bot-two', 99), summary('bot-one', 5)]))}
        useWorkspaces={hook(workspaceState([botWorkspace(['bot-two', 'bot-one'])]))}
      />,
    )
    expect(rowIds(screen.getByRole('tree', { name: BOT_GROUP }))).toEqual(['bot-two', 'bot-one'])
  })

  it('renders nothing on the collapsed rail, group included', () => {
    const b = mount({
      wide: false,
      useSessions: hook(sessionState([summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([botWorkspace(['bot-one'])])),
    })
    expect(b.view.container.textContent).toBe('')
    expect(screen.queryByRole('button', { name: BOT_TOGGLE })).toBeNull()
  })
})

// The bots work in ordinary project folders the operator also works in, so the
// folder cannot say who owns a session. ds-bot publishes the ids instead.
const BOT_EVENT = 'dsh-bot:sessions'
// The spec's own view of the channel: the publisher is a separate bundle, so
// the page reads it as `unknown` and the shell tolerates any shape.
const global2 = window as unknown as { __dshBotSessions?: unknown }
const publish = (ids: string[]): void => {
  global2.__dshBotSessions = ids
  window.dispatchEvent(new CustomEvent(BOT_EVENT))
}

describe('AllSessionsSection ids published by ds-bot', () => {
  beforeEach(() => { delete global2.__dshBotSessions })

  it('leaves a normal Workspace session in the flat list and grows no group', () => {
    mount({
      useSessions: hook(sessionState([summary('igor', 9)])),
      useWorkspaces: hook(workspaceState([workspace('playbooks', ['igor'], 'Playbooks')])),
    })
    expect(rowIds(screen.getByRole('tree', { name: '全部会话' }))).toEqual(['igor'])
    expect(screen.queryByRole('button', { name: BOT_TOGGLE })).toBeNull()
  })

  it('moves a published session into the group when the event fires', () => {
    mount({
      useSessions: hook(sessionState([summary('igor', 9), summary('mine', 8)])),
      useWorkspaces: hook(workspaceState([
        workspace('playbooks', ['igor'], 'Playbooks'),
        workspace('alpha', ['mine'], 'Alpha'),
      ])),
    })
    expect(rowIds(screen.getByRole('tree', { name: '全部会话' }))).toEqual(['igor', 'mine'])

    act(() => { publish(['igor']) })

    expect(rowIds(screen.getByRole('tree', { name: '全部会话' }))).toEqual(['mine'])
    fireEvent.click(screen.getByRole('button', { name: BOT_TOGGLE }))
    expect(rowIds(screen.getByRole('tree', { name: BOT_GROUP }))).toEqual(['igor'])
  })

  it('keeps the Workspace rule when ds-bot publishes an empty list', () => {
    mount({
      useSessions: hook(sessionState([summary('bot-one', 5)])),
      useWorkspaces: hook(workspaceState([botWorkspace(['bot-one'])])),
    })
    act(() => { publish([]) })

    fireEvent.click(screen.getByRole('button', { name: BOT_TOGGLE }))
    expect(rowIds(screen.getByRole('tree', { name: BOT_GROUP }))).toEqual(['bot-one'])
  })
})

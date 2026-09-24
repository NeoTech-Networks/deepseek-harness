// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { AccountUsageSnapshot } from '../src/types.ts'
import type { AccountUsageFeed } from '../src/client/feed.ts'
import { createAccountUsageFeed } from '../src/client/feed.ts'
import { AccountUsageLine, type AccountUsageLineProps, formatSpend } from '../src/client/AccountUsageLine.tsx'
import { en, zh } from '../src/client/locales.ts'

/** The seat's translate stub: this package's dictionary, then the key itself. */
const t = ((key: string, params?: Record<string, unknown>) => {
  const template = (en as Record<string, string>)[key] ?? key
  return params === undefined
    ? template
    : template.replace(/\{(\w+)\}/g, (match, name: string) => name in params ? String(params[name]) : match)
}) as AccountUsageLineProps['t']

const LIVE: AccountUsageSnapshot = {
  status: 'live',
  at: Date.parse('2026-09-08T20:42:00Z'),
  fiveHour: { percent: 3, resetsAt: '2026-09-09T01:20:00Z' },
  sevenDay: { percent: 16, resetsAt: '2026-09-13T09:00:00Z' },
  scoped: [{ label: 'Fable', percent: 7, active: true }],
  extraUsage: { usedMinor: 11094, currency: 'USD', exponent: 2, limitMinor: null },
}

/** A feed double over a fixed snapshot. */
function feedOf(snapshot: AccountUsageSnapshot): AccountUsageFeed & { running: string[] } {
  const store = createSnapshotStore<AccountUsageSnapshot>(snapshot)
  const running: string[] = []
  return {
    store,
    running,
    refresh: () => { /* the double never polls */ },
    setRunning: (sessionId, isRunning) => { running.push(`${sessionId}:${String(isRunning)}`) },
    dispose: () => { /* nothing to release */ },
  }
}

/** Render the dock entry with the standard props it actually reads. */
function renderLine(snapshot: AccountUsageSnapshot, running = false) {
  const feed = feedOf(snapshot)
  const props = {
    feed,
    t,
    sessionId: 'session-1',
    useSession: (select: (s: { running: boolean }) => unknown) => select({ running }),
  } as unknown as AccountUsageLineProps
  return { feed, ...render(<AccountUsageLine {...props} />) }
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('the dock reading', () => {
  it('shows both windows', () => {
    renderLine(LIVE)

    expect(screen.getByRole('button').textContent).toContain('5h 3%')
    expect(screen.getByRole('button').textContent).toContain('Week 16%')
  })

  it('renders nothing where the deployment has no subscription grant', () => {
    const { container } = renderLine({ status: 'unsupported' })

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing before any figure has been read', () => {
    const { container } = renderLine({ status: 'error' })

    expect(container.firstChild).toBeNull()
  })

  it('opens a panel carrying the reset instants and the spend, and closes on Escape', async () => {
    renderLine(LIVE)

    fireEvent.click(screen.getByRole('button'))

    const panel = screen.getByRole('dialog')
    expect(panel.textContent).toContain('5-hour window')
    expect(panel.textContent).toContain('resets')
    expect(panel.textContent).toContain('Fable, weekly')
    expect(panel.textContent).toContain(formatSpend(LIVE.extraUsage!))

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('explains a stale reading in the panel', () => {
    renderLine({ ...LIVE, status: 'stale' })

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('dialog').textContent).toContain(en['panel.stale'])
  })

  it('reports the session run state to the feed', () => {
    const { feed } = renderLine(LIVE, true)

    expect(feed.running).toContain('session-1:true')
  })

  it('names both figures in the accessible label', () => {
    renderLine(LIVE)

    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Account usage: 5-hour 3%, weekly 16%')
  })
})

describe('dictionaries', () => {
  it('carries an English entry for every key', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })
})

describe('the page feed', () => {
  it('publishes the first answer and polls again on the idle cadence', async () => {
    vi.useFakeTimers()
    const read = vi.fn(async () => ({ ok: true as const, value: LIVE }))
    const feed = createAccountUsageFeed({ accountUsage: { read } }, { idleMs: 1_000, busyMs: 100, settleMs: 10 })

    await vi.advanceTimersByTimeAsync(0)
    expect(feed.store.getSnapshot().status).toBe('live')
    expect(read).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1_000)
    expect(read).toHaveBeenCalledTimes(2)
    feed.dispose()
  })

  it('keeps the previous figures when a read fails', async () => {
    vi.useFakeTimers()
    let fail = false
    const read = vi.fn(async () => {
      if (fail) throw new Error('carrier down')
      return { ok: true as const, value: LIVE }
    })
    const feed = createAccountUsageFeed({ accountUsage: { read } }, { idleMs: 1_000, busyMs: 100, settleMs: 10 })

    await vi.advanceTimersByTimeAsync(0)
    fail = true
    await vi.advanceTimersByTimeAsync(1_000)

    expect(feed.store.getSnapshot()).toEqual(LIVE)
    feed.dispose()
  })

  it('takes a confirming read shortly after a turn settles', async () => {
    vi.useFakeTimers()
    const read = vi.fn(async () => ({ ok: true as const, value: LIVE }))
    const feed = createAccountUsageFeed({ accountUsage: { read } }, { idleMs: 10_000, busyMs: 5_000, settleMs: 50 })

    await vi.advanceTimersByTimeAsync(0)
    feed.setRunning('session-1', true)
    feed.setRunning('session-1', false)
    await vi.advanceTimersByTimeAsync(60)

    expect(read).toHaveBeenCalledTimes(2)
    feed.dispose()
  })

  it('stops polling once disposed', async () => {
    vi.useFakeTimers()
    const read = vi.fn(async () => ({ ok: true as const, value: LIVE }))
    const feed = createAccountUsageFeed({ accountUsage: { read } }, { idleMs: 100, busyMs: 50, settleMs: 10 })

    await vi.advanceTimersByTimeAsync(0)
    feed.dispose()
    await vi.advanceTimersByTimeAsync(1_000)

    expect(read).toHaveBeenCalledTimes(1)
  })
})

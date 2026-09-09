// @vitest-environment jsdom
/**
 * The body against a scripted listing.
 *
 * What is asserted is the reader's contract: the root lists itself on mount,
 * rows come out directories-first, a directory click asks for exactly that
 * level, a file click opens exactly that session-scoped `file:` address through
 * the owner, an `other` entry is shown but not clickable, the tree says when it
 * was cut or could not be read, and reload asks again for the expanded levels
 * only. The two pure helpers the rows are built from are checked on their own.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { makeTranslate, RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import { fileAddressFor } from '@deepseek-ai/dsh-util-workspace-path'
import { failureLine, orderEntries } from '../src/client/FilesBody.tsx'
import type { DirLevel } from '../src/client/store.ts'
import { zh } from '../src/client/locales.ts'
import { mountBody, ROOT, SESSION, TAB } from './mount.client.tsx'

const ROOT_LEVEL: DirLevel = {
  entries: [
    { name: 'README.md', type: 'file', size: 12 },
    { name: 'src', type: 'directory' },
    { name: '.env', type: 'file', size: 2 },
    { name: 'pipe', type: 'other' },
  ],
  truncated: false,
}

afterEach(() => { cleanup() })

/** Row labels in document order. */
function names(root: HTMLElement): string[] {
  return [...root.querySelectorAll('[data-files-entry]')].map(li => li.getAttribute('data-files-path')!)
}

describe('FilesBody', () => {
  it('says so when the session has no workspace directory, and asks for nothing', () => {
    const { view, script } = mountBody(null)
    expect(view.container.querySelector('[data-files-state="no-workspace"]')?.textContent).toBe(zh.noWorkspace)
    expect(script.list).not.toHaveBeenCalled()
  })

  it('lists the root on mount, heads it with its path split at the last segment, and draws directories first with dotfiles kept', async () => {
    const { view, script } = mountBody()
    expect(script.list).toHaveBeenCalledWith(SESSION, ROOT, expect.any(AbortSignal))
    expect(view.container.querySelector('[data-files-row="loading"]')).not.toBeNull()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    expect(view.container.querySelector('[data-files-state="tree"]')?.getAttribute('data-files-root')).toBe(ROOT)
    const path = view.container.querySelector('[data-files-path]')
    expect(path?.getAttribute('title')).toBe(ROOT)
    expect([...path?.querySelectorAll('span > span') ?? []].map(span => span.textContent)).toEqual(['/work/', 'app'])
    expect(names(view.container)).toEqual([`${ROOT}/src`, `${ROOT}/.env`, `${ROOT}/pipe`, `${ROOT}/README.md`])
    const envIcon = view.container.querySelector(`[data-files-path="${ROOT}/.env"] svg`)?.innerHTML
    const readmeIcon = view.container.querySelector(`[data-files-path="${ROOT}/README.md"] svg`)?.innerHTML
    expect(envIcon).not.toBe(readmeIcon)
  })

  it('heads a separator-only root by the root itself, since it has no final segment', async () => {
    const { view, script } = mountBody('/')
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const path = view.container.querySelector('[data-files-path]')
    expect([...path?.querySelectorAll('span > span') ?? []].map(span => span.textContent)).toEqual(['/'])
    expect(names(view.container)).toEqual(['/src', '/.env', '/pipe', '/README.md'])
  })

  it('marks the root path clipped while its text is wider than its box, re-reading on resize', async () => {
    class FakeResizeObserver implements ResizeObserver {
      static latest: FakeResizeObserver | undefined
      readonly observe = vi.fn()
      readonly unobserve = vi.fn()
      readonly disconnect = vi.fn()
      constructor(private readonly callback: ResizeObserverCallback) {
        FakeResizeObserver.latest = this
      }

      fire(): void {
        this.callback([], this)
      }
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    let boxWidth = 300
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => boxWidth })
    try {
      const { view, script } = mountBody()
      await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
      const path = view.container.querySelector<HTMLElement>('[data-files-path]')
      const text = path?.firstElementChild
      expect(path?.hasAttribute('data-files-path-clipped')).toBe(false)
      const observer = FakeResizeObserver.latest
      if (observer === undefined) throw new Error('expected the path to observe its size')
      expect(observer.observe).toHaveBeenCalledWith(path)
      expect(observer.observe).toHaveBeenCalledWith(text)

      boxWidth = 120
      act(() => { observer.fire() })
      expect(path?.hasAttribute('data-files-path-clipped')).toBe(true)

      boxWidth = 300
      act(() => { observer.fire() })
      expect(path?.hasAttribute('data-files-path-clipped')).toBe(false)
      view.unmount()
      expect(observer.disconnect).toHaveBeenCalledTimes(1)
    } finally {
      vi.unstubAllGlobals()
      for (const [name, descriptor] of [['offsetWidth', offsetWidth], ['clientWidth', clientWidth]] as const) {
        if (descriptor === undefined) Reflect.deleteProperty(HTMLElement.prototype, name)
        else Object.defineProperty(HTMLElement.prototype, name, descriptor)
      }
    }
  })

  it('a directory click lists that level once and marks it expanded; a second click collapses without asking again', async () => {
    const { view, script } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.click(dir) })
    expect(script.list).toHaveBeenLastCalledWith(SESSION, `${ROOT}/src`, expect.any(AbortSignal))
    expect(dir.getAttribute('aria-expanded')).toBe('true')
    await act(() => script.settle({ ok: true, value: { entries: [{ name: 'a.ts', type: 'file' }], truncated: false } }))
    expect(names(view.container)).toContain(`${ROOT}/src/a.ts`)
    act(() => { fireEvent.click(dir) })
    expect(dir.getAttribute('aria-expanded')).toBe('false')
    expect(names(view.container)).not.toContain(`${ROOT}/src/a.ts`)
    act(() => { fireEvent.click(dir) })
    expect(names(view.container)).toContain(`${ROOT}/src/a.ts`)
    expect(script.list).toHaveBeenCalledTimes(2)
  })

  it('a file click opens its session-scoped file: address through the owner; an other entry offers no button', async () => {
    const { view, script, tabActions } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    fireEvent.click(view.container.querySelector(`[data-files-path="${ROOT}/README.md"] > button`)!)
    // Every row sits under the tree's root, so the address is the path relative to it.
    expect(tabActions.openResource).toHaveBeenCalledWith(fileAddressFor(SESSION, ROOT, `${ROOT}/README.md`))
    expect(tabActions.openResource).toHaveBeenCalledWith('dsh-resource://file/session/s-test/README.md')
    const other = view.container.querySelector(`[data-files-path="${ROOT}/pipe"]`)!
    expect(other.querySelector('button')).toBeNull()
    expect(other.querySelector('[aria-disabled="true"]')?.getAttribute('title')).toBe(zh['entry.other'])
  })

  it('marks a cut listing and an empty one', async () => {
    const { view, script } = mountBody()
    await act(() => script.settle({ ok: true, value: { entries: [{ name: 'd', type: 'directory' }], truncated: true } }))
    expect(view.container.querySelector('[data-files-row="truncated"]')?.textContent).toBe(zh.truncated)
    act(() => { fireEvent.click(view.container.querySelector(`[data-files-path="${ROOT}/d"] > button`)!) })
    await act(() => script.settle({ ok: true, value: { entries: [], truncated: false } }))
    expect(view.container.querySelector('[data-files-row="empty"]')?.textContent).toBe(zh.empty)
  })

  it('shows a failed level under its directory with the failure code', async () => {
    const { view, script } = mountBody()
    await act(() => script.settle({
      ok: false,
      error: new RemoteError('workspace-file/not-found', 'gone', { path: ROOT }),
    }))
    const failed = view.container.querySelector('[data-files-row="failed"]')
    expect(failed?.getAttribute('data-files-code')).toBe('workspace-file/not-found')
    expect(failed?.textContent).toBe(zh['error.notFound'])
  })

  it('reload resets every level and lists the expanded ones again', async () => {
    const { view, script, controller, instance } = mountBody()
    const child = `${ROOT}/src`
    const collapsed = `${ROOT}/docs`
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    act(() => { fireEvent.click(view.container.querySelector(`[data-files-path="${child}"] > button`)!) })
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    // A level listed earlier and since collapsed is dropped, not re-fetched.
    act(() => { instance.actions.loaded(TAB, collapsed, ROOT_LEVEL) })
    script.list.mockClear()

    act(() => { fireEvent.click(view.container.querySelector('[data-files-reload]')!) })
    expect(script.list.mock.calls.map(call => call[1])).toEqual([ROOT, child])
    expect(script.list).toHaveBeenCalledWith(SESSION, ROOT, controller.signal)
    const state = instance.getSnapshot().byTab[TAB]!
    expect(state.expanded).toEqual([ROOT, child])
    expect(state.levels).toEqual({ [ROOT]: { kind: 'loading' }, [child]: { kind: 'loading' } })
    expect(view.container.querySelector('[data-files-reload]')?.getAttribute('aria-label')).toBe(zh.reload)
  })

  it('an aborted record is forgotten and not seeded again while the body is still mounted', async () => {
    const { view, script, controller, instance } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    act(() => { controller.abort() })
    expect(instance.getSnapshot().byTab[TAB]).toBeUndefined()
    expect(view.container.querySelector('[data-files-state="tree"]')).toBeNull()
    expect(script.list).toHaveBeenCalledTimes(1)
  })
})

describe('open-in-session gestures', () => {
  it('right-clicking a directory opens a menu whose "New session here" adopts that directory', async () => {
    const { view, script, cap } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir, { clientX: 40, clientY: 20 }) })

    const entry = await waitFor(() => view.getByRole('menuitem', { name: zh['menu.newSessionHere'] }))
    act(() => { fireEvent.click(entry) })
    expect(cap.openDirectory).toHaveBeenCalledWith(`${ROOT}/src`)
    expect(cap.openSubDirectories).not.toHaveBeenCalled()
  })

  it('bulk flow reports an empty folder, a failed listing, and a failed open', async () => {
    const { view, script } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir, { clientX: 40, clientY: 20 }) })
    const entry = await waitFor(() => view.getByRole('menuitem', { name: zh['menu.newSessionEach'] }))
    act(() => { fireEvent.click(entry) })

    // Empty folder: no rows, no enabled Open.
    await act(() => script.settle({ ok: true, value: { entries: [], truncated: false } }))
    let dialog = await waitFor(() => view.getByRole('dialog'))
    expect(dialog.textContent).toContain(zh['bulk.none'])
    expect((view.getByRole('button', { name: zh['bulk.open'] }) as HTMLButtonElement).disabled).toBe(true)
    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.cancel'] })) })

    // A failed listing surfaces its message.
    act(() => { fireEvent.contextMenu(dir, { clientX: 40, clientY: 20 }) })
    const entry2 = await waitFor(() => view.getByRole('menuitem', { name: zh['menu.newSessionEach'] }))
    act(() => { fireEvent.click(entry2) })
    await act(() => script.settle({ ok: false, error: new RemoteError('workspace-file/not-found', 'gone', { path: `${ROOT}/src` }) }))
    await waitFor(() => {
      expect(view.container.querySelector('[data-files-bulk-error]')?.textContent).toBe('gone')
    })

    // A failed bulk open surfaces its message too.
    const { view: view2, script: script2, cap } = mountBody()
    await act(() => script2.settle({ ok: true, value: ROOT_LEVEL }))
    const dir2 = view2.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir2, { clientX: 40, clientY: 20 }) })
    const entry3 = await waitFor(() => view2.getByRole('menuitem', { name: zh['menu.newSessionEach'] }))
    act(() => { fireEvent.click(entry3) })
    await act(() => script2.settle({ ok: true, value: { entries: [{ name: 'overlord', type: 'directory' }], truncated: false } }))
    dialog = await waitFor(() => view2.getByRole('dialog'))
    cap.openSubDirectories.mockRejectedValueOnce(new Error('open blew up'))
    act(() => { fireEvent.click(view2.getByRole('button', { name: zh['bulk.open'] })) })
    await waitFor(() => {
      expect(view2.container.querySelector('[data-files-bulk-error]')?.textContent).toBe('open blew up')
    })
  })

  it('deselecting a sub-folder narrows the bulk open to the remaining paths', async () => {
    const { view, script, cap } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir, { clientX: 40, clientY: 20 }) })
    const entry = await waitFor(() => view.getByRole('menuitem', { name: zh['menu.newSessionEach'] }))
    act(() => { fireEvent.click(entry) })
    await act(() => script.settle({
      ok: true,
      value: {
        entries: [
          { name: 'overlord', type: 'directory' },
          { name: 'service-pages', type: 'directory' },
        ],
        truncated: false,
      },
    }))
    const dialog = await waitFor(() => view.getByRole('dialog'))
    // Deselect the second candidate by clicking its row.
    const rows = [...dialog.querySelectorAll<HTMLButtonElement>('button')]
      .filter(button => button.querySelector('input[type="checkbox"]'))
    act(() => { fireEvent.click(rows[2]!) })
    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.open'] })) })
    await waitFor(() => {
      expect(cap.openSubDirectories).toHaveBeenCalledWith(SESSION, [`${ROOT}/src/overlord`], 'sig-railway-services')
    })
  })

  it('bulk flow lists directories only, excludes dot-directories, and opens each selected path under the inherited group', async () => {
    const { view, script, cap } = mountBody()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir, { clientX: 40, clientY: 20 }) })
    const entry = await waitFor(() => view.getByRole('menuitem', { name: zh['menu.newSessionEach'] }))
    act(() => { fireEvent.click(entry) })

    // The bulk dialog lists the directory's own children, so the tree's root
    // listing settled first and this call is the second outstanding listing.
    await act(() => script.settle({
      ok: true,
      value: {
        entries: [
          { name: 'overlord', type: 'directory' },
          { name: 'service-pages', type: 'directory' },
          { name: '.git', type: 'directory' },
          { name: 'README.md', type: 'file' },
        ],
        truncated: false,
      },
    }))

    const dialog = await waitFor(() => view.getByRole('dialog'))
    const checkboxes = dialog.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    // Select-all checkbox plus the two directories; the dot-directory and the file are absent.
    expect(checkboxes).toHaveLength(3)
    const labels = [...dialog.querySelectorAll('[data-files-path], button')].map(node => node.textContent ?? '')
    expect(labels.some(label => label.includes('.git'))).toBe(false)

    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.open'] })) })
    await waitFor(() => {
      expect(cap.openSubDirectories).toHaveBeenCalledWith(
        SESSION,
        [`${ROOT}/src/overlord`, `${ROOT}/src/service-pages`],
        'sig-railway-services',
      )
    })
  })
})

describe('orderEntries', () => {
  it('puts directories first and orders each group by name, numbers included', () => {
    const ordered = orderEntries([
      { name: 'file10.txt', type: 'file' },
      { name: 'zeta', type: 'directory' },
      { name: 'file2.txt', type: 'file' },
      { name: '.env', type: 'file' },
      { name: 'Alpha', type: 'directory' },
      { name: 'sock', type: 'other' },
    ])
    expect(ordered.map(entry => entry.name)).toEqual(['Alpha', 'zeta', '.env', 'file2.txt', 'file10.txt', 'sock'])
  })

  it('leaves the endpoint\'s array untouched', () => {
    const entries = [{ name: 'b', type: 'file' as const }, { name: 'a', type: 'file' as const }]
    orderEntries(entries)
    expect(entries.map(entry => entry.name)).toEqual(['b', 'a'])
  })
})

describe('failureLine', () => {
  const t = makeTranslate(zh)

  it('names each directory failure', () => {
    expect(failureLine(t, new RemoteError('workspace-file/not-found', 'x', { path: 'p' }))).toBe(zh['error.notFound'])
    expect(failureLine(t, new RemoteError('workspace-file/outside-workspace', 'x', { path: 'p' })))
      .toBe(zh['error.outsideWorkspace'])
    expect(failureLine(t, new RemoteError('workspace-file/not-directory', 'x', { path: 'p', kind: 'file' })))
      .toBe(zh['error.notDirectory'])
  })

  it('carries an unclassified failure\'s own message', () => {
    const failure = { code: 'remote/transport', message: 'socket closed' } as unknown as RemoteFailure
    expect(failureLine(t, failure)).toBe('读取失败：socket closed')
  })
})

// @vitest-environment jsdom
/** File-tree presentation over controlled directory watches and deferred listings. */
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
    expect(script.list).not.toHaveBeenCalled()
    await act(() => script.watches.ready(ROOT))
    expect(script.list).toHaveBeenCalledWith(SESSION, ROOT, expect.any(AbortSignal))
    expect(view.container.querySelector('[data-files-row="loading"]')).not.toBeNull()
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    expect(view.container.querySelector('[data-files-state="tree"]')?.getAttribute('data-files-root')).toBe(ROOT)
    const path = view.container.querySelector('[data-files-path]')
    expect(path?.getAttribute('title')).toBe(ROOT)
    expect([...path?.firstElementChild?.children ?? []].map(span => span.textContent)).toEqual(['/work/', 'app'])
    expect(names(view.container)).toEqual([`${ROOT}/src`, `${ROOT}/.env`, `${ROOT}/pipe`, `${ROOT}/README.md`])
    const envIcon = view.container.querySelector(`[data-files-path="${ROOT}/.env"] svg`)?.innerHTML
    const readmeIcon = view.container.querySelector(`[data-files-path="${ROOT}/README.md"] svg`)?.innerHTML
    expect(envIcon).not.toBe(readmeIcon)
  })

  it('heads a separator-only root by the root itself, since it has no final segment', async () => {
    const { view, script } = mountBody('/')
    await act(() => script.watches.ready('/'))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const path = view.container.querySelector('[data-files-path]')
    expect([...path?.firstElementChild?.children ?? []].map(span => span.textContent)).toEqual(['/'])
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
      await act(() => script.watches.ready(ROOT))
      await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
      const path = view.container.querySelector<HTMLElement>('[data-files-path]')
      const text = path?.firstElementChild
      expect(path?.hasAttribute('data-path-clipped')).toBe(false)
      const observer = FakeResizeObserver.latest
      if (observer === undefined) throw new Error('expected the path to observe its size')
      expect(observer.observe).toHaveBeenCalledWith(path)
      expect(observer.observe).toHaveBeenCalledWith(text)

      boxWidth = 120
      act(() => { observer.fire() })
      expect(path?.hasAttribute('data-path-clipped')).toBe(true)

      boxWidth = 300
      act(() => { observer.fire() })
      expect(path?.hasAttribute('data-path-clipped')).toBe(false)
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

  it('reopening a directory shows its cache and replaces it after the new subscription is ready', async () => {
    const { view, script } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.click(dir) })
    expect(script.list).toHaveBeenCalledTimes(1)
    const childStream = await act(() => script.watches.ready(`${ROOT}/src`))
    expect(script.list).toHaveBeenLastCalledWith(SESSION, `${ROOT}/src`, expect.any(AbortSignal))
    expect(dir.getAttribute('aria-expanded')).toBe('true')
    await act(() => script.settle({ ok: true, value: { entries: [{ name: 'a.ts', type: 'file' }], truncated: false } }))
    expect(names(view.container)).toContain(`${ROOT}/src/a.ts`)
    act(() => { fireEvent.click(dir) })
    expect(childStream.signal.aborted).toBe(true)
    await childStream.released.promise
    expect(dir.getAttribute('aria-expanded')).toBe('false')
    expect(names(view.container)).not.toContain(`${ROOT}/src/a.ts`)
    act(() => { fireEvent.click(dir) })
    expect(names(view.container)).toContain(`${ROOT}/src/a.ts`)
    expect(script.list).toHaveBeenCalledTimes(2)
    await act(() => script.watches.ready(`${ROOT}/src`, 1))
    expect(script.list).toHaveBeenCalledTimes(3)
    expect(names(view.container)).toContain(`${ROOT}/src/a.ts`)
    await act(() => script.settle({ ok: true, value: { entries: [{ name: 'b.ts', type: 'file' }], truncated: false } }))
    expect(names(view.container)).toContain(`${ROOT}/src/b.ts`)
    expect(names(view.container)).not.toContain(`${ROOT}/src/a.ts`)
  })

  it('a file click opens its session-scoped file: address through the owner; an other entry offers no button', async () => {
    const { view, script, tabActions } = mountBody()
    await act(() => script.watches.ready(ROOT))
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
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: { entries: [{ name: 'd', type: 'directory' }], truncated: true } }))
    expect(view.container.querySelector('[data-files-row="truncated"]')?.textContent).toBe(zh.truncated)
    act(() => { fireEvent.click(view.container.querySelector(`[data-files-path="${ROOT}/d"] > button`)!) })
    await act(() => script.watches.ready(`${ROOT}/d`))
    await act(() => script.settle({ ok: true, value: { entries: [], truncated: false } }))
    expect(view.container.querySelector('[data-files-row="empty"]')?.textContent).toBe(zh.empty)
  })

  it('shows a failed level under its directory with the failure code', async () => {
    const { view, script } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({
      ok: false,
      error: new RemoteError('workspace-file/not-found', 'gone', { path: ROOT }),
    }))
    const failed = view.container.querySelector('[data-files-row="failed"]')
    expect(failed?.getAttribute('data-files-code')).toBe('workspace-file/not-found')
    expect(failed?.textContent).toBe(zh['error.notFound'])
  })

  it('shows a refresh failure beside the existing directory rows and clears it on retry', async () => {
    const { view, script } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const rows = names(view.container)
    const reload = view.getByRole('button', { name: zh.reload })
    act(() => { fireEvent.click(reload) })
    await act(() => script.settle({
      ok: false, error: new RemoteError('workspace-file/not-found', 'gone', { path: ROOT }),
    }))
    expect(view.container.querySelector('[data-files-row="failed"]')?.textContent).toBe(zh['error.notFound'])
    expect(names(view.container)).toEqual(rows)
    act(() => { fireEvent.click(reload) })
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    expect(view.container.querySelector('[data-files-row="failed"]')).toBeNull()
    expect(names(view.container)).toEqual(rows)
  })

  it('reload refreshes expanded nodes without clearing cached rows or the scroll position', async () => {
    const { view, script, instance } = mountBody()
    const child = `${ROOT}/src`
    const collapsed = `${ROOT}/docs`
    const rootStream = await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    act(() => { fireEvent.click(view.container.querySelector(`[data-files-path="${child}"] > button`)!) })
    await act(() => script.watches.ready(child))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    act(() => { instance.actions.loaded(TAB, collapsed, ROOT_LEVEL) })
    const cached = instance.getSnapshot().byTab[TAB]!
    const childRow = view.container.querySelector(`[data-files-path="${child}"]`)
    const body = view.container.querySelector('[data-files-body]')!
    fireEvent.scroll(body, { target: { scrollTop: 120 } })

    act(() => { fireEvent.click(view.container.querySelector('[data-files-reload]')!) })
    expect(script.list.mock.calls.slice(2).map(call => call[1])).toEqual([ROOT])
    expect(script.list).toHaveBeenLastCalledWith(SESSION, ROOT, rootStream.signal)
    expect(instance.getSnapshot().byTab[TAB]!.levels).toEqual(cached.levels)
    expect(view.container.querySelector('[data-files-row="loading"]')).toBeNull()
    await act(async () => {
      await script.settle({ ok: true, value: ROOT_LEVEL })
      await script.waitForList(3)
    })
    expect(script.list.mock.calls.slice(2).map(call => call[1])).toEqual([ROOT, child])
    expect(instance.getSnapshot().byTab[TAB]!.levels).toEqual(cached.levels)
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    expect(view.container.querySelector(`[data-files-path="${child}"]`)).toBe(childRow)
    expect(body.scrollTop).toBe(120)
    expect(instance.getSnapshot().byTab[TAB]!.expanded).toEqual([ROOT, child])
    expect(script.watches.opened.map(stream => stream.path)).toEqual([ROOT, child])
    expect(view.container.querySelector('[data-files-reload]')?.getAttribute('aria-label')).toBe(zh.reload)
  })

  it('keeps the automatic control hidden and enabled by default, with manual reload independent of its setting', async () => {
    const { view, script, instance } = mountBody()
    const stream = await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const automatic = view.container.querySelector('[data-files-auto-refresh]')!
    expect(automatic.closest('span[hidden]')).not.toBeNull()
    expect(automatic.getAttribute('aria-pressed')).toBe('true')
    expect(view.queryByRole('button', { name: zh.autoRefresh })).toBeNull()
    expect(view.getByRole('button', { name: zh.reload })).toBeDefined()
    act(() => { fireEvent.click(automatic) })
    expect(automatic.getAttribute('aria-pressed')).toBe('false')
    await act(() => stream.deliver('change'))
    expect(script.list).toHaveBeenCalledTimes(1)
    act(() => { fireEvent.click(view.getByRole('button', { name: zh.reload })) })
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    expect(script.list).toHaveBeenCalledTimes(2)
    expect(instance.getSnapshot().byTab[TAB]!.autoRefresh).toBe(false)
    expect(automatic.getAttribute('aria-pressed')).toBe('false')
  })

  it('captures the body scroll offset on unmount and restores it when a tab switch remounts the tree', async () => {
    const { view, script, instance, remount } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    const body = view.container.querySelector('[data-files-body]')!
    fireEvent.scroll(body, { target: { scrollTop: 120 } })
    // Scrolling writes nothing yet: the store hears the offset once, on unmount.
    expect(instance.getSnapshot().byTab[TAB]!.scrollTop).toBe(0)
    view.unmount()
    expect(instance.getSnapshot().byTab[TAB]!.scrollTop).toBe(120)
    const back = remount()
    expect(back.container.querySelector('[data-files-body]')!.scrollTop).toBe(120)
  })

  it('a scroll before the owner aborts is not written to a forgotten bucket', async () => {
    const { view, script, controller, instance } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    fireEvent.scroll(view.container.querySelector('[data-files-body]')!, { target: { scrollTop: 80 } })
    act(() => { controller.abort() })
    view.unmount()
    expect(instance.getSnapshot().byTab[TAB]).toBeUndefined()
  })

  it('an aborted record is forgotten and not seeded again while the body is still mounted', async () => {
    const { view, script, controller, instance } = mountBody()
    await act(() => script.watches.ready(ROOT))
    await act(() => script.settle({ ok: true, value: ROOT_LEVEL }))
    act(() => { controller.abort() })
    expect(instance.getSnapshot().byTab[TAB]).toBeUndefined()
    expect(view.container.querySelector('[data-files-state="tree"]')).toBeNull()
    expect(script.list).toHaveBeenCalledTimes(1)
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

describe('new-session gestures', () => {
  const SUB_LEVEL: DirLevel = {
    entries: [
      { name: 'service-pages', type: 'directory' },
      { name: 'overlord', type: 'directory' },
      { name: '.git', type: 'directory' },
      { name: 'README.md', type: 'file', size: 1 },
    ],
    truncated: false,
  }

  async function mounted() {
    const hands = mountBody()
    await act(() => hands.script.watches.ready(ROOT))
    await act(() => hands.script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = hands.view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    return { ...hands, dir }
  }

  async function pick(view: ReturnType<typeof mountBody>['view'], target: Element, label: string): Promise<void> {
    act(() => { fireEvent.contextMenu(target, { clientX: 40, clientY: 20 }) })
    const entry = await waitFor(() => view.getByRole('menuitem', { name: label }))
    act(() => { fireEvent.click(entry) })
  }

  it('"New session here" on a directory row adopts that directory', async () => {
    const { view, dir, cap } = await mounted()
    await pick(view, dir, zh['menu.newSessionHere'])
    expect(cap.openDirectory).toHaveBeenCalledWith(`${ROOT}/src`)
    expect(cap.openSubDirectories).not.toHaveBeenCalled()
  })

  it('the root header offers the same menu for the workspace root', async () => {
    const { view, cap } = await mounted()
    const header = view.container.querySelector('[data-files-path]')!.parentElement!
    await pick(view, header, zh['menu.newSessionHere'])
    expect(cap.openDirectory).toHaveBeenCalledWith(ROOT)
  })

  it('offers no menu when the Workspace services are not composed', async () => {
    const hands = mountBody()
    hands.cap.available.mockReturnValue(false)
    await act(() => hands.script.watches.ready(ROOT))
    await act(() => hands.script.settle({ ok: true, value: ROOT_LEVEL }))
    const dir = hands.view.container.querySelector(`[data-files-path="${ROOT}/src"] > button`)!
    act(() => { fireEvent.contextMenu(dir, { clientX: 1, clientY: 1 }) })
    expect(hands.view.queryByRole('menuitem')).toBeNull()
  })

  it('the bulk flow lists sub-folders only, all ticked, and opens them under the inherited group', async () => {
    const { view, dir, cap, script } = await mounted()
    await pick(view, dir, zh['menu.newSessionEach'])
    expect(script.outstanding()).toEqual([`${ROOT}/src`])
    await act(() => script.settle({ ok: true, value: SUB_LEVEL }))
    const dialog = await waitFor(() => view.getByRole('dialog'))
    const rows = [...dialog.querySelectorAll('[data-files-bulk-path]')].map(row => row.getAttribute('data-files-bulk-path'))
    expect(rows).toEqual([`${ROOT}/src/overlord`, `${ROOT}/src/service-pages`])
    expect((dialog.querySelector('input:not([type])') as HTMLInputElement).value).toBe('sig-railway-services')
    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.open'] })) })
    await waitFor(() => {
      expect(cap.openSubDirectories).toHaveBeenCalledWith([`${ROOT}/src/overlord`, `${ROOT}/src/service-pages`], 'sig-railway-services')
    })
    await waitFor(() => { expect(view.queryByRole('dialog')).toBeNull() })
    expect(view.container.querySelector('[data-files-bulk-outcome]')?.textContent).toBe('已就绪 2 个工作区。')
  })

  it('deselecting narrows the open, select-all toggles, and a build without groups sends no label', async () => {
    const { view, dir, cap, script } = await mounted()
    cap.supportsGroups.mockReturnValue(false)
    await pick(view, dir, zh['menu.newSessionEach'])
    await act(() => script.settle({ ok: true, value: SUB_LEVEL }))
    const dialog = await waitFor(() => view.getByRole('dialog'))
    expect(dialog.querySelector('input:not([type])')).toBeNull()
    const open = view.getByRole('button', { name: zh['bulk.open'] }) as HTMLButtonElement
    const all = dialog.querySelector('[data-files-bulk-all]')!
    act(() => { fireEvent.click(all) })
    expect(open.disabled).toBe(true)
    act(() => { fireEvent.click(all) })
    expect(open.disabled).toBe(false)
    act(() => { fireEvent.click(dialog.querySelector(`[data-files-bulk-path="${ROOT}/src/service-pages"]`)!) })
    act(() => { fireEvent.click(open) })
    await waitFor(() => {
      expect(cap.openSubDirectories).toHaveBeenCalledWith([`${ROOT}/src/overlord`], '')
    })
  })

  it('reports an empty folder, a failed listing, and a failed open', async () => {
    const { view, dir, cap, script } = await mounted()
    await pick(view, dir, zh['menu.newSessionEach'])
    await act(() => script.settle({ ok: true, value: { entries: [], truncated: false } }))
    const dialog = await waitFor(() => view.getByRole('dialog'))
    expect(dialog.textContent).toContain(zh['bulk.none'])
    expect((view.getByRole('button', { name: zh['bulk.open'] }) as HTMLButtonElement).disabled).toBe(true)
    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.cancel'] })) })
    await waitFor(() => { expect(view.queryByRole('dialog')).toBeNull() })

    await pick(view, dir, zh['menu.newSessionEach'])
    await act(() => script.settle({ ok: false, error: new RemoteError('workspace-file/not-found', 'gone', { path: `${ROOT}/src` }) }))
    await waitFor(() => { expect(view.container.querySelector('[data-files-bulk-outcome]')?.textContent).toBe('gone') })

    await pick(view, dir, zh['menu.newSessionEach'])
    await act(() => script.settle({ ok: true, value: SUB_LEVEL }))
    await waitFor(() => view.getByRole('dialog'))
    cap.openSubDirectories.mockRejectedValueOnce(new Error('open blew up'))
    act(() => { fireEvent.click(view.getByRole('button', { name: zh['bulk.open'] })) })
    await waitFor(() => { expect(view.container.querySelector('[data-files-bulk-outcome]')?.textContent).toBe('open blew up') })
    expect(view.getByRole('dialog')).toBeTruthy()
  })
})

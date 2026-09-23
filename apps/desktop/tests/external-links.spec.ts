import { describe, expect, it, vi } from 'vitest'
import { externalLinkTarget, routeExternalLinks, type ExternalLinkContents } from '../src/external-links.ts'

function harness() {
  let openHandler: ((details: { url: string }) => { action: 'deny' }) | undefined
  let navigate: ((event: { preventDefault(): void }, url: string) => void) | undefined
  const contents: ExternalLinkContents = {
    setWindowOpenHandler: (handler) => { openHandler = handler },
    on: (_event, listener) => { navigate = listener },
  }
  const openExternal = vi.fn(() => Promise.resolve())
  routeExternalLinks(contents, 'dsh-app:', openExternal)
  return { openExternal, open: (url: string) => openHandler!({ url }), navigate: (url: string) => {
    const preventDefault = vi.fn()
    navigate!({ preventDefault }, url)
    return preventDefault
  } }
}

describe('external link routing', () => {
  it('opens a target=_blank web link in the default browser and never a child window', () => {
    const h = harness()
    expect(h.open('https://ops.neotech.biz/gbl')).toEqual({ action: 'deny' })
    expect(h.openExternal).toHaveBeenCalledWith('https://ops.neotech.biz/gbl')
  })

  it('opens a plain in-page web link in the browser and keeps the window on the app', () => {
    const h = harness()
    const prevented = h.navigate('http://example.com/x')
    expect(prevented).toHaveBeenCalledOnce()
    expect(h.openExternal).toHaveBeenCalledWith('http://example.com/x')
  })

  it('lets app-scheme navigation through untouched', () => {
    const h = harness()
    const prevented = h.navigate('dsh-app://app/index.html')
    expect(prevented).not.toHaveBeenCalled()
    expect(h.openExternal).not.toHaveBeenCalled()
  })

  it('drops unsafe or malformed targets', () => {
    const h = harness()
    for (const url of ['file:///C:/Windows/system32/calc.exe', 'javascript:alert(1)', 'not a url']) {
      h.open(url)
      expect(h.navigate(url)).toHaveBeenCalledOnce()
    }
    expect(h.openExternal).not.toHaveBeenCalled()
  })

  it('allows mailto', () => {
    expect(externalLinkTarget('mailto:steve@neotechnetworks.com')).toBe('mailto:steve@neotechnetworks.com')
  })
})

/**
 * Hand web links clicked inside a Desktop window to the operator's default browser.
 *
 * EXTERNAL_LINKS_DEFAULT_BROWSER (NeoTech fork, 2026-09-23). Upstream denied every
 * `window.open` / `target="_blank"` request and cancelled every navigation off the
 * app scheme, and did nothing else, so a link in the session footer or in a
 * message was a dead click. The window still never navigates away and never opens
 * a child window; only the URL is passed to the OS, and only for schemes that are
 * safe to hand to a browser or mail client.
 */

/** Schemes the operating system may open. Anything else (file:, javascript:, custom) stays dead. */
const EXTERNAL_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:'])

/**
 * Decide whether a clicked URL should be opened in the default browser.
 * @param url - the target URL Electron reported.
 * @returns the normalized URL to open, or undefined to drop it.
 */
export function externalLinkTarget(url: string): string | undefined {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }
  return EXTERNAL_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined
}

/** The Electron `webContents` surface this module wires. */
export interface ExternalLinkContents {
  setWindowOpenHandler(handler: (details: { url: string }) => { action: 'deny' }): void
  on(event: 'will-navigate', listener: (event: { preventDefault(): void }, url: string) => void): unknown
}

/**
 * Keep the window on the app scheme and route web links to the browser.
 * @param contents - the window's webContents.
 * @param appScheme - the owned scheme including the colon, for example `dsh-app:`.
 * @param openExternal - Electron `shell.openExternal`.
 */
export function routeExternalLinks(
  contents: ExternalLinkContents,
  appScheme: string,
  openExternal: (url: string) => Promise<void>,
): void {
  const open = (url: string): void => {
    const target = externalLinkTarget(url)
    if (target !== undefined) void openExternal(target).catch(() => undefined)
  }
  contents.setWindowOpenHandler(({ url }) => {
    open(url)
    return { action: 'deny' }
  })
  contents.on('will-navigate', (event, url) => {
    let protocol: string | undefined
    try {
      protocol = new URL(url).protocol
    } catch {
      protocol = undefined
    }
    if (protocol === appScheme) return
    event.preventDefault()
    open(url)
  })
}

/**
 * What the pinned-file preview draws: one file's text, read whole.
 *
 * The tab is opened by kind rather than by address, so every file the explorer
 * opens reuses one preview tab per pane and arrives as a navigation parameter.
 * That is why the body keys its read on `navigation.revision` as well as the
 * path: re-opening the same file is a deliberate "read it again" gesture.
 *
 * State is component-local rather than a Slot store: the preview holds one
 * file, re-reading it costs one call, and a store bucketed by tab would
 * outlive nothing worth keeping.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PinnedFileText } from '@deepseek-ai/dsh-api-pinned-files/types'
import type { ExplorerTextInjected } from './face.ts'
import { failureLine } from './ExplorerBody.tsx'
import type {} from './locales.ts'
import css from './ExplorerBody.module.css'

/** The three shares the framework composes for this seat. */
export type TextBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & ExplorerTextInjected
  & PropsLocale<'sidebarExplorer'>

/** What the preview is doing right now. */
type ReadState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly file: PinnedFileText }
  | { readonly kind: 'failed'; readonly line: string }

/**
 * The path this navigation carried, if it carried one.
 * @param params - the tab's navigation parameters, whatever opened it.
 * @returns the absolute path, or `undefined` for a tab nobody opened with one.
 */
function pathOf(params: unknown): string | undefined {
  if (typeof params !== 'object' || params === null || !('path' in params)) return undefined
  const path: unknown = (params).path
  return typeof path === 'string' && path !== '' ? path : undefined
}

/**
 * The pinned-file preview tab's body.
 * @param props - the composed slot shares.
 * @returns the preview.
 */
export function TextBody({ useTabInfo, read, t }: TextBodyProps): ReactNode {
  const { tab } = useTabInfo()
  const { signal, navigation } = tab
  const path = pathOf(navigation.params)
  const revision = navigation.revision
  const [state, setState] = useState<ReadState>({ kind: 'idle' })

  useEffect(() => {
    if (path === undefined || signal.aborted) return
    let current = true
    setState({ kind: 'loading' })
    void read(path, signal).then((result) => {
      if (!current || signal.aborted) return
      setState(result.ok
        ? { kind: 'ready', file: result.value }
        : { kind: 'failed', line: failureLine(t, result.error) })
    })
    return () => { current = false }
  }, [path, revision, signal, read, t])

  if (path === undefined) return <div className={css.note}>{t('text.empty')}</div>
  return (
    <div className={css.body} data-preview-state={state.kind}>
      <div className={css.previewPath} title={path}>{path}</div>
      {state.kind === 'loading' ? <div className={css.note}>{t('text.loading')}</div> : null}
      {state.kind === 'failed' ? <div className={css.failure}>{state.line}</div> : null}
      {state.kind === 'ready' ? <pre className={css.preview}>{state.file.text}</pre> : null}
    </div>
  )
}

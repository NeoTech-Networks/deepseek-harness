/**
 * Stage one of this package's registrations: what the two tab types ARE.
 *
 * Both are pages, not viewers: neither claims a resource address. The explorer
 * is offered on the guide page and is what the auto-open wiring opens; the
 * preview is opened only by the explorer, by kind with a `path` parameter, so
 * one preview tab per pane is reused as the operator clicks around rather than
 * a tab accumulating per file.
 */
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type {} from './locales.ts'
import { DocumentFileIcon, IconFolderClose16 } from '@deepseek-ai/dsh-client-ui-primitives'

/** The pinned-directory tree's kind. */
export const EXPLORER_KIND = 'explorer'

/** The pinned-file preview's kind. */
export const EXPLORER_TEXT_KIND = 'pinnedText'

/** The tree implementation's identity, and the key its body registers under. */
export const EXPLORER_ID = '@deepseek-ai/dsh-client-ui-sidebar-explorer'

/** The preview implementation's identity, and the key its body registers under. */
export const EXPLORER_TEXT_ID = '@deepseek-ai/dsh-client-ui-sidebar-explorer#text'

declare module '@deepseek-ai/dsh-client-ui-sidebar-right/client' {
  interface SidebarRightTabParamsMap {
    /** Which file the preview shows; absolute, as the Host reported it. */
    pinnedText: { readonly path: string }
  }
}

/**
 * The explorer type's registry definition.
 * @param t - namespace-bound translate, read fresh on every label call.
 * @returns the definition to register.
 */
export function explorerDefinition(t: TranslateNS<'sidebarExplorer'>): SidebarRightTabDefinition {
  return {
    id: EXPLORER_ID,
    kind: EXPLORER_KIND,
    priority: 'builtin',
    title: () => t('type.label'),
    guide: [{
      order: 5,
      title: () => t('guide.title'),
      description: () => t('guide.description'),
      icon: IconFolderClose16,
    }],
  }
}

/**
 * The preview type's registry definition. It contributes no guide entry: a
 * preview with nothing to preview is not a place the operator should be able
 * to land from the guide.
 * @param t - namespace-bound translate, read fresh on every label call.
 * @returns the definition to register.
 */
export function explorerTextDefinition(t: TranslateNS<'sidebarExplorer'>): SidebarRightTabDefinition {
  return {
    id: EXPLORER_TEXT_ID,
    kind: EXPLORER_TEXT_KIND,
    priority: 'builtin',
    title: () => t('text.label'),
  }
}

/** The icon the preview's rows use, re-exported so the body names one import site. */
export { DocumentFileIcon }

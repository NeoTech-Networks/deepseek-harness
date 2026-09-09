/**
 * Stage one of this package's registration: what the `sessions` tab type IS.
 *
 * A page type, exactly like the guide: it recognizes no resource address and is
 * opened by kind. `builtin` is the ordinary band for a type shipped with the
 * product. It contributes one guide entry so the panel is reachable from the
 * guide page's doorway (the strip's add control opens the guide, which lists it).
 */
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import { IconListPenOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'

/** The tab kind this package owns. */
export const SESSIONS_KIND = 'sessions'

/** This implementation's identity in the tab system: the key its body registers under. */
export const SESSIONS_ID = '@deepseek-ai/dsh-client-ui-sessions-panel'

/**
 * The sessions type's registry definition.
 * @param t - namespace-bound translate, read fresh on every title call.
 * @returns the definition to register.
 */
export function sessionsDefinition(t: TranslateNS<'sessionsPanel'>): SidebarRightTabDefinition {
  return {
    id: SESSIONS_ID,
    kind: SESSIONS_KIND,
    priority: 'builtin',
    title: () => t('tab.title'),
    guide: [{
      order: 10,
      title: () => t('guide.title'),
      icon: IconListPenOutline16,
    }],
  }
}

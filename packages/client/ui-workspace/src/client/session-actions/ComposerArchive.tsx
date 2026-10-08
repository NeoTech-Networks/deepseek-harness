/**
 * The composer's Archive button (fork): an entry of ui-conversation's
 * `conversation.composer.meter.trailing`, beside the context meter and the
 * Save button. It archives the Session the composer belongs to through the
 * same guarded path as the Ctrl+Shift+A chord, so the undo notice, the
 * stop-and-archive confirmation, and the refusals all come with it.
 */
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComposerArchiveProps } from '../contract/slots.ts'
import css from './ComposerArchive.module.css'

/**
 * The Archive button; disabled once the Session is archived.
 * @param props - the Session owner share, the archive share, and the locale seat.
 * @returns the button.
 */
export function ComposerArchiveButton({ sessionId, useArchived, archiveSession, t }: ComposerArchiveProps) {
  const archived = useArchived(set => set.has(sessionId))
  return (
    <Tooltip label={t('composer.archive.tooltip')} side="top" delayMs={500} disabled={archived}>
      <button
        type="button"
        className={css.action}
        aria-label={t('menu.archiveSession')}
        disabled={archived}
        onClick={() => { archiveSession(sessionId) }}
      >
        {t('composer.archive')}
      </button>
    </Tooltip>
  )
}

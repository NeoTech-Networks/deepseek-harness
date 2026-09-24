/**
 * The declared-status actions (fork): two `sidebar.workspaces.session.menu.item`
 * rows — "Set status…" raises the status request, "Clear status" clears the
 * row's declared status and shows only while one is in force — and the
 * `shell.overlay` dialog that answers the request with the deployment's
 * vocabulary. The operator picks from the same vocabulary the
 * `set_session_status` tool offers the model.
 */
import { useEffect, useState } from 'react'
import type { SessionStatusValue } from '@deepseek-ai/dsh-session-status/client'
import { Button, IconCloseCircleFillRegular, IconPauseOutlineRegular, MenuItemButton, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  SessionMenuItemProps, SessionStatusDialogInjected, SessionStatusDialogProps, SessionStatusMenuInjected, SessionStatusTarget,
} from '../contract/slots.ts'
import css from './SessionStatus.module.css'

/**
 * Menu row (order 350): ask for the status dialog for this row.
 * @param props - owner share, menu open state, and the status share.
 * @returns the row.
 */
export function SetSessionStatusMenuItem({
  sessionId, displayTitle, useMenuOpenState, requestSessionStatus, t,
}: SessionMenuItemProps<SessionStatusMenuInjected>) {
  const [, setMenuOpen] = useMenuOpenState()
  return (
    <MenuItemButton
      icon={<IconPauseOutlineRegular />}
      onSelect={() => {
        setMenuOpen(false)
        requestSessionStatus(sessionId, displayTitle)
      }}
    >
      {t('menu.setStatus')}
    </MenuItemButton>
  )
}

/**
 * Menu row (order 360): clear the declared status; absent while none is in force.
 * @param props - owner share, menu open state, the Session list hook, and the status share.
 * @returns the row, or null.
 */
export function ClearSessionStatusMenuItem({
  sessionId, useMenuOpenState, useSessions, clearSessionStatus, t,
}: SessionMenuItemProps<SessionStatusMenuInjected>) {
  const [, setMenuOpen] = useMenuOpenState()
  const declared = useSessions(state => state.byId[sessionId]?.projectionValues?.sessionStatus ?? null)
  if (declared === null) return null
  return (
    <MenuItemButton
      icon={<IconCloseCircleFillRegular />}
      onSelect={() => {
        setMenuOpen(false)
        clearSessionStatus(sessionId)
      }}
    >
      {t('menu.clearStatus')}
    </MenuItemButton>
  )
}

/**
 * The `shell.overlay` entry: nothing while no status is requested, otherwise
 * one dialog per request (keyed by the Session).
 * @param props - the request hook, its settlement, the Host hops, and the locale seat.
 * @returns the open dialog, or null.
 */
export function SessionStatusDialog({
  useStatusRequest, settleSessionStatus, setSessionStatus, listSessionStatuses, t,
}: SessionStatusDialogProps) {
  const request = useStatusRequest(pending => pending)
  if (request === null) return null
  return (
    <StatusForm
      key={request.sessionId}
      request={request}
      setSessionStatus={setSessionStatus}
      listSessionStatuses={listSessionStatuses}
      onSettle={settleSessionStatus}
      t={t}
    />
  )
}

/** One request's dialog: the vocabulary loads on mount; in-flight and error state die with it. */
function StatusForm({ request, setSessionStatus, listSessionStatuses, onSettle, t }: {
  request: SessionStatusTarget
  setSessionStatus: SessionStatusDialogInjected['setSessionStatus']
  listSessionStatuses: SessionStatusDialogInjected['listSessionStatuses']
  onSettle: () => void
  t: SessionStatusDialogProps['t']
}) {
  const [vocabulary, setVocabulary] = useState<readonly SessionStatusValue[] | null>(null)
  const [setting, setSetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    listSessionStatuses(request.sessionId).then((statuses) => {
      if (live) setVocabulary(statuses)
    }).catch((reason: unknown) => {
      if (live) setError(reason instanceof Error ? reason.message : String(reason))
    })
    return () => { live = false }
  }, [listSessionStatuses, request.sessionId])
  const close = () => {
    if (setting) return
    onSettle()
  }
  const commit = (statusId: string | null) => {
    if (setting) return
    setSetting(true)
    setError(null)
    setSessionStatus(request.sessionId, statusId).then(() => {
      setSetting(false)
      onSettle()
    }).catch((reason: unknown) => {
      setSetting(false)
      setError(reason instanceof Error ? reason.message : String(reason))
    })
  }
  return (
    <Modal
      open
      onClose={close}
      closeLabel={t('close')}
      title={t('status.title')}
      description={request.displayTitle}
      footer={(
        <Button variant="outline" disabled={setting} onClick={() => { commit(null) }}>{t('status.clear')}</Button>
      )}
    >
      {error !== null && <div className={css.statusError} role="alert">{error}</div>}
      {vocabulary === null && error === null && (
        <div className={css.statusLoading} role="status">{t('status.loading')}</div>
      )}
      {vocabulary !== null && (
        <div className={css.statusList} role="list" data-session-status-options="">
          {vocabulary.map(status => (
            <button
              key={status.id}
              type="button"
              role="listitem"
              className={css.statusOption}
              data-status-id={status.id}
              disabled={setting}
              onClick={() => { commit(status.id) }}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

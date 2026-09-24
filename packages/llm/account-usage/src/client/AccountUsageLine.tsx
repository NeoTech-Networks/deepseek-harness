/**
 * The account-limits reading on the composer dock strip: two short groups
 * ("5h 3% · Week 16%") and a click-open panel carrying the reset instants,
 * any scoped weekly window, the month's extra-usage spend, and why the
 * figures are what they are.
 *
 * It renders nothing at all when the deployment has no subscription grant, so
 * an install signed in to some other provider is untouched. It also renders
 * nothing before the first successful read: an empty strip reads better than a
 * placeholder that looks like a real figure.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import clsx from 'clsx'
import { useDismissOnOutsidePointer } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the ui-conversation SlotMap merge (the composer dock cell).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the session-scope standard props (useSession, sessionId).
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { AccountUsageSnapshot, ExtraUsage, UsageWindow } from '../types.ts'
import type { AccountUsageFeed } from './feed.ts'
import css from './AccountUsageLine.module.css'

/** Percent at or above which the reading takes the warning tone. */
export const WARN_PERCENT = 80

/** Percent at or above which the reading takes the critical tone. */
export const CRITICAL_PERCENT = 95

/** Hours ahead within which a reset instant is shown as a bare clock time. */
const SAME_DAY_HOURS = 20

/** Standard dock props plus the page-wide feed this entry reads. */
export type AccountUsageLineProps =
  PropsRuntime<'conversation.composer.dock'>
  & PropsLocale<'accountUsage'>
  & {
    /** The page's shared feed; one poll serves every mounted entry. */
    readonly feed: AccountUsageFeed
  }

/**
 * Bind the page's feed to a dock entry component.
 *
 * The slot registry hands an entry only the standard props, so the feed is
 * closed over here rather than threaded through a slot inject face the
 * composer dock cell does not declare.
 * @param feed - the page's shared feed.
 * @returns the component to register on the dock.
 */
export function accountUsageEntry(feed: AccountUsageFeed) {
  return function AccountUsageDockEntry(props: Omit<AccountUsageLineProps, 'feed'>) {
    return <AccountUsageLine {...props} feed={feed} />
  }
}

/**
 * Format one reset instant for display.
 * @param iso - the instant as the account reported it.
 * @returns a clock time for something resetting today, a weekday and time
 * further out, or undefined when there is nothing usable to show.
 */
export function formatReset(iso: string | undefined): string | undefined {
  if (iso === undefined) return undefined
  const at = new Date(iso)
  const time = at.getTime()
  if (Number.isNaN(time)) return undefined
  const soon = time - Date.now() < SAME_DAY_HOURS * 60 * 60 * 1000
  return at.toLocaleString(undefined, soon
    ? { hour: 'numeric', minute: '2-digit' }
    : { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

/**
 * Format the month's extra-usage spend in its own currency.
 * @param extra - the spend figures.
 * @returns a localized currency string.
 */
export function formatSpend(extra: ExtraUsage): string {
  const amount = extra.usedMinor / 10 ** extra.exponent
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: extra.currency }).format(amount)
  } catch (_unknownCurrency) {
    // A currency code Intl does not know still has a readable number.
    return amount.toFixed(extra.exponent)
  }
}

/**
 * The tone one reading takes, from the fuller of its two windows.
 * @param windows - the windows present on the snapshot.
 * @returns the severity class name, or undefined at normal occupancy.
 */
function toneOf(windows: readonly (UsageWindow | undefined)[]): string | undefined {
  let peak = 0
  for (const window of windows) {
    if (window !== undefined && window.percent > peak) peak = window.percent
  }
  if (peak >= CRITICAL_PERCENT) return css.critical
  if (peak >= WARN_PERCENT) return css.warn
  return undefined
}

/**
 * Render the account-limits reading.
 * @param props - the dock's standard props, the locale seat, and the feed.
 * @returns the reading and, while open, its panel; nothing when there is no
 * subscription account or no figure yet.
 */
export function AccountUsageLine({ feed, sessionId, useSession, t }: AccountUsageLineProps) {
  const usage: AccountUsageSnapshot = useSyncExternalStore(
    fn => feed.store.subscribe(fn),
    () => feed.store.getSnapshot(),
  )
  const running = useSession(s => s.running)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)

  // The feed polls faster while a turn runs and takes one confirming read
  // after it settles, which is when the account's own figure moves.
  useEffect(() => {
    feed.setRunning(sessionId, running)
    return () => { feed.setRunning(sessionId, false) }
  }, [feed, sessionId, running])

  // Outside-pointer dismissal is the house primitive; Escape is the one extra
  // key this surface answers.
  useDismissOnOutsidePointer(rootRef, open, setOpen)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open])

  const { fiveHour, sevenDay } = usage
  if (usage.status === 'unsupported') return null
  if (fiveHour === undefined && sevenDay === undefined) return null

  const groups: string[] = []
  if (fiveHour !== undefined) groups.push(t('line.fiveHour', { percent: fiveHour.percent }))
  if (sevenDay !== undefined) groups.push(t('line.week', { percent: sevenDay.percent }))
  const aria = t('line.aria', {
    fiveHour: fiveHour === undefined ? t('line.unknown') : `${fiveHour.percent}%`,
    week: sevenDay === undefined ? t('line.unknown') : `${sevenDay.percent}%`,
  })
  const note = usage.status === 'stale'
    ? t('panel.stale')
    : usage.status === 'unauthorized'
      ? t('panel.unauthorized')
      : usage.status === 'error' ? t('panel.error') : undefined
  const scoped = (usage.scoped ?? []).filter(window => window.active || window.percent > 0)

  return (
    <div className={css.root}>
      <span ref={rootRef} className={css.anchor}>
        <button
          type="button"
          className={clsx(css.trigger, toneOf([fiveHour, sevenDay]))}
          aria-label={aria}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => { setOpen(!open) }}
        >
          {groups.map((group, index) => (
            <span key={group}>
              {index > 0 ? <span className={css.sep} aria-hidden>·</span> : null}
              {group}
            </span>
          ))}
          {note === undefined ? null : <span className={css.staleDot} aria-hidden>*</span>}
        </button>
        {open && (
          <div className={css.panel} role="dialog" aria-label={t('panel.title')}>
            <div className={css.title}>{t('panel.title')}</div>
            <dl className={css.rows}>
              {fiveHour === undefined ? null : (
                <div className={css.row}>
                  <dt>
                    {t('panel.fiveHour')}
                    {formatReset(fiveHour.resetsAt) === undefined ? null : (
                      <span className={css.resets}>
                        {t('panel.resets', { when: formatReset(fiveHour.resetsAt) ?? '' })}
                      </span>
                    )}
                  </dt>
                  <dd>{`${fiveHour.percent}%`}</dd>
                </div>
              )}
              {sevenDay === undefined ? null : (
                <div className={css.row}>
                  <dt>
                    {t('panel.week')}
                    {formatReset(sevenDay.resetsAt) === undefined ? null : (
                      <span className={css.resets}>
                        {t('panel.resets', { when: formatReset(sevenDay.resetsAt) ?? '' })}
                      </span>
                    )}
                  </dt>
                  <dd>{`${sevenDay.percent}%`}</dd>
                </div>
              )}
              {scoped.map(window => (
                <div key={window.label} className={css.row}>
                  <dt>{t('panel.scoped', { label: window.label })}</dt>
                  <dd>{`${window.percent}%`}</dd>
                </div>
              ))}
            </dl>
            {usage.extraUsage === undefined ? null : (
              <div className={css.footnote}>
                {t('panel.credits', { amount: formatSpend(usage.extraUsage) })}
              </div>
            )}
            <div className={css.footnote}>
              {t('panel.asOf', {
                time: usage.at === undefined
                  ? t('panel.never')
                  : new Date(usage.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
              })}
            </div>
            {note === undefined ? null : <div className={css.note}>{note}</div>}
          </div>
        )}
      </span>
    </div>
  )
}

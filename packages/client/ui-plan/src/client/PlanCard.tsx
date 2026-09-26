/** Persistent transcript cards and pending-review sidebar navigation. */
import { useEffect } from 'react'
import { FileTypeIcon, IconChevronRightOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SubmittedPlan } from './plan.ts'
import type {} from './plan-definition.ts'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolCallId } from '@deepseek-ai/dsh-llm/brand'
import type {} from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { createPlanReviewStore } from './review-store.ts'
import css from './PlanPreview.module.css'

/** Session-bound navigation for logged plans. */
export interface PlanOpenInjected {
  /** Open or focus the exact submitted plan. */
  openPlan: (callId: ToolCallId) => void
}

/** Turn-keyed submitted plans and Session-bound navigation. */
export interface PlanCardsInjected extends PlanOpenInjected {
  keyedHooks: {
    /** Resolve only this Turn's submitted plans, in invocation order. */
    plans: (turn: string) => ObservableSnapshot<readonly SubmittedPlan[]>
  }
}

/** Session-bound preview navigation for one pending review. */
export interface PlanReviewOpenInjected {
  /** Open the logged plan, or the request's temporary document when no invocation exists. */
  openReview: (review: PropsRuntime<'conversation.plan-review.actions'>['review'], requestKey: string) => void
  /**
   * Open the review once a Sidebar seat belonging to its Session is mounted,
   * reading the seat live and retrying on every seat change until it succeeds.
   * @returns a disposer that stops waiting.
   */
  autoOpen: (review: PropsRuntime<'conversation.plan-review.actions'>['review'], requestKey: string, onOpened: () => void) => () => void
}

/**
 * Render the completed Turn's submitted plans in invocation order.
 * @param props - Logged plan, localized copy, and Session-bound navigation.
 * @returns keyboard-accessible plan cards, or null for a Turn without plans.
 */
export function PlanCards({ turn, usePlans, openPlan, t }: PropsRuntime<'conversation.chat.turnTail'> & InjectFace<PlanCardsInjected> & PropsLocale<'plan'>) {
  const plans = usePlans(String(turn.turn))
  if (plans === undefined || plans.length === 0) return null
  return (
    <div className={css.cards} data-plan-artifacts>
      {plans.map(plan => <button key={plan.callId} type="button" className={css.card} data-plan-card={plan.callId}
        aria-label={t('preview.openNamed', { title: plan.title })}
        onClick={() => { openPlan(plan.callId) }}>
        <span className={css.cardIcon}><FileTypeIcon kind="markdown" size={20} /></span>
        <span className={css.cardDetails}>
          <span className={css.cardTitle}>{plan.title}</span>
          <span className={css.cardDescription}>{t('preview.document')}</span>
        </span>
        <span className={css.cardOpen}>{t('preview.action')}</span>
      </button>)}
    </div>
  )
}

/**
 * Open each pending plan automatically and retain a manual opener without answering it.
 *
 * The automatic open waits for a mounted Sidebar seat of this review's Session.
 * The seat is read when the open runs, not at render: a Session switch
 * releases the old seat and binds the new one in separate effects, so a
 * render-time reading can name a seat that has already gone. Until a matching
 * seat accepts the open, the review keeps waiting and is not marked opened.
 * @param props - Review identity, Session store, localized copy, and navigation.
 * @returns an opener for either logged or temporary plan text.
 */
export function PlanReviewOpen({ review, requestKey, openReview, autoOpen, t, useStore, actions }: PropsRuntime<'conversation.plan-review.actions'> & InjectFace<PlanReviewOpenInjected> & PropsLocale<'plan'> & PropsStore<ReturnType<typeof createPlanReviewStore>>) {
  const identity = review.callId === undefined ? `review:${requestKey}` : `call:${review.callId}`
  const opened = useStore(state => state.opened[identity] === true)
  useEffect(
    () => opened ? undefined : autoOpen(review, requestKey, () => { actions.markOpened(identity) }),
    [identity, opened, autoOpen, review, requestKey, actions],
  )
  return <button type="button" className={css.reviewLink} title={t('preview.open')} aria-label={t('preview.open')}
    onClick={() => { openReview(review, requestKey) }}>{t('preview.full')}<IconChevronRightOutlineRegular size={14} /></button>
}

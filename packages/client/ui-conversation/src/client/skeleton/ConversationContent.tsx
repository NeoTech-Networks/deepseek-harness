import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import clsx from 'clsx'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import { workspaceDisplayTitle } from '@deepseek-ai/dsh-api-workspace-controller/default-workspace'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ConversationContentProps, ConversationViewsProps, InputZone } from '../contract/slots.ts'
import { HeroShell, WorkspaceChip, workspaceLabel } from './EmptyHero.tsx'
import css from './ConversationRoot.module.css'

/**
 * The hero workspace picker's state: whether its dropdown is open and the pick
 * still waiting for its blank Session. It lives outside the component because
 * the body is rebuilt for every Session it shows, and the picked folder's
 * blank Session lands seconds after the pick: component state would close the
 * open dropdown and drop the pick exactly then.
 */
export interface HeroPickerState {
  /** The workspace dropdown is open. */
  readonly open: boolean
  /** The picked Workspace whose blank Session has not become current yet. */
  readonly pending: WorkspaceId | undefined
  /** The last ready Workspace list that did not contain `pending`, so one list is counted once. */
  readonly missedIn: readonly unknown[] | undefined
}

const HERO_PICKER_INITIAL: HeroPickerState = { open: false, pending: undefined, missedIn: undefined }

/** The main occurrence's picker, shared across its per-Session rebuilds. */
const MAIN_HERO_PICKER: SnapshotStore<HeroPickerState> = createSnapshotStore(HERO_PICKER_INITIAL)

/** Return the main occurrence's picker to closed with no pick (test isolation). */
export function resetHeroPicker(): void {
  MAIN_HERO_PICKER.set(HERO_PICKER_INITIAL)
}

/**
 * The picker store for one occurrence: the main one survives rebuilds; an
 * embedded one keeps its own, as component state did.
 * @param variant - the occurrence variant.
 * @returns the store and its current state.
 */
function useHeroPicker(variant: ConversationContentProps['variant']): [HeroPickerState, SnapshotStore<HeroPickerState>] {
  const store = useMemo(
    () => variant === 'main' ? MAIN_HERO_PICKER : createSnapshotStore(HERO_PICKER_INITIAL),
    [variant],
  )
  const subscribe = useCallback((notify: () => void) => store.subscribe(notify), [store])
  const getSnapshot = useCallback(() => store.getSnapshot(), [store])
  const state = useSyncExternalStore(subscribe, getSnapshot)
  return [state, store]
}

function ConversationSessionView({ renderSlot }: ConversationViewsProps) {
  return renderSlot('conversation.session', {})
}

function NoConversationWidthControls() {
  return null
}

/**
 * Render the shared Conversation body and its occurrence-selected local Components.
 * @param props - Factory input, standard Session sources, and Conversation seats.
 * @returns the Conversation view, Composer, and optional width controls.
 */
export function ConversationContent(props: ConversationContentProps) {
  const {
    sessionId, phase, hero, useSession, useSessions, useSessionStatus,
    useWorkspaces, useInput, useComposerBlock, useProjection, renderSlot, renderSlotChain,
    selectWorkspace, t, useFactorySlot,
  } = props
  const session = useSession(snapshot => snapshot)
  const Views = useFactorySlot('views', ConversationSessionView)
  const WidthControls = useFactorySlot('widthControls', NoConversationWidthControls)
  const [body, setBody] = useState<HTMLDivElement | null>(null)
  const pendingInteraction = useSessionStatus(snapshot =>
    sessionId === undefined ? undefined : snapshot.get(sessionId)?.pendingInteraction)
  const inputState = useInput(s => s)
  const cwd = useSessions(s => sessionId === undefined ? undefined : s.byId[sessionId]?.cwd)
  const summaryDashboardUrl = useSessions(s => sessionId === undefined ? undefined : s.byId[sessionId]?.dashboardUrl)
  const summaryDesignProject = useSessions(s => sessionId === undefined ? undefined : s.byId[sessionId]?.designProject)
  // The live half: the host publishes the `workspaceLinks` projection as the
  // Session's own messages name a dashboard, so the footer follows the Session
  // without waiting for a Session-list pull. The summary row stays as the
  // fallback for a Session whose projection store has not been seeded yet.
  const projected = useProjection('workspaceLinks')
  const dashboardUrl = projected?.dashboardUrl ?? summaryDashboardUrl
  const designProject = projected?.designProject ?? summaryDesignProject
  // The third line: the skills and commands the operator typed in this Session,
  // folded host-side from the Session's own log. There is no list-row fallback
  // for it, because a row the Session list carries has no use for the answer.
  const skillsUsed = useProjection('skillsUsed')
  const skills = skillsUsed?.skills ?? []
  // The fourth line: one sentence saying what the Session is for, written once
  // host-side at the Session's start and folded from its `session/purpose` event.
  const sessionPurpose = useProjection('sessionPurpose')
  const purpose = sessionPurpose?.purpose ?? null
  const workspaces = useWorkspaces(s => s)
  // A plugin this package cannot import (ui-model-selection) says this session cannot
  // send; its reason is already localized by whoever raised it.
  const composerBlock = useComposerBlock(block => block)

  const [picker, pickerStore] = useHeroPicker(props.variant)
  const pickerOpen = picker.open
  const pendingWorkspaceId = picker.pending
  const setPickerOpen = useCallback((next: boolean | ((open: boolean) => boolean)): void => {
    const current = pickerStore.getSnapshot()
    const open = typeof next === 'function' ? next(current.open) : next
    if (open !== current.open) pickerStore.set({ ...current, open })
  }, [pickerStore])
  const setPendingWorkspaceId = useCallback((
    next: WorkspaceId | undefined | ((current: WorkspaceId | undefined) => WorkspaceId | undefined),
  ): void => {
    const current = pickerStore.getSnapshot()
    const pending = typeof next === 'function' ? next(current.pending) : next
    if (pending !== current.pending) pickerStore.set({ ...current, pending, missedIn: undefined })
  }, [pickerStore])
  const pickerAnchor = useRef<HTMLButtonElement>(null)
  // The dropdown belongs to the hero row: a Session that leaves the hero (its
  // first message went out) takes it down, so a later hero never opens on its own.
  useEffect(() => {
    if (!hero) setPickerOpen(false)
  }, [hero, setPickerOpen])

  // Publishes the two live measurements floating View chrome reads off the
  // scroll body: the seat's height as --dsh-composer-height, so controls clear
  // the composer as it grows, and the scrollport's own height as
  // --dsh-conversation-viewport-height, so a control can sit in the band the
  // seat leaves visible. Callback ref, not an effect; stable identity prevents
  // observer churn while the first blank session fills the resident body
  // outlet.
  const seatObserver = useRef<ResizeObserver | null>(null)
  const seatResizeRef = useCallback((seat: HTMLDivElement | null): void => {
    seatObserver.current?.disconnect()
    seatObserver.current = null
    const scroller = seat?.parentElement ?? null
    if (seat === null || scroller === null) return
    seatObserver.current = new ResizeObserver(() => {
      scroller.style.setProperty('--dsh-composer-height', `${seat.offsetHeight}px`)
      scroller.style.setProperty(
        '--dsh-conversation-viewport-height',
        `${scroller.clientHeight}px`,
      )
    })
    seatObserver.current.observe(seat)
    seatObserver.current.observe(scroller)
  }, [])

  const sessionWorkspace = sessionId === undefined
    ? undefined
    : workspaces.items.find(workspace => workspace.sessionIds.includes(sessionId))
  const pendingWorkspace = workspaces.items.find(
    workspace => workspace.workspaceId === pendingWorkspaceId,
  )

  // Clear the pending pick once the session lands in it, or once the picked
  // workspace is missing from two different ready lists (deleted from the
  // sidebar). One list is not enough: a reconnect baseline can arrive between
  // two complete lists, and a single miss would drop a pick that still exists.
  const workspaceItems = workspaces.items
  useEffect(() => {
    if (pendingWorkspaceId === undefined) return
    if (sessionWorkspace?.workspaceId === pendingWorkspaceId) {
      setPendingWorkspaceId(undefined)
      return
    }
    const current = pickerStore.getSnapshot()
    if (pendingWorkspace !== undefined) {
      if (current.missedIn !== undefined) pickerStore.set({ ...current, missedIn: undefined })
      return
    }
    if (workspaces.phase !== 'ready') return
    if (current.missedIn === workspaceItems) return
    if (current.missedIn === undefined) {
      pickerStore.set({ ...current, missedIn: workspaceItems })
      return
    }
    setPendingWorkspaceId(undefined)
  }, [
    pendingWorkspaceId, sessionWorkspace?.workspaceId, workspaces.phase, pendingWorkspace,
    workspaceItems, pickerStore, setPendingWorkspaceId,
  ])

  const zone: InputZone | undefined =
    session === undefined || inputState === undefined ? undefined : { session, input: inputState }

  // The chip is a selector; label resolution walks the flow top-down:
  //   1. a just-picked workspace (pending) → its title;
  //   2. cold start, no session yet → placeholder ("Choose workspace");
  //   3. the blank session's workspace is in the list → its title;
  //   4. list still loading → cwd folder name bridges so the title does not
  //      flash on refresh (empty cwd → placeholder);
  //   5. list ready but no owning workspace (deleted from the sidebar) →
  //      placeholder, never the deleted folder's name via cwd.
  // A title still automatic reads in the reader's language, matching the
  // sidebar row the same Workspace has there.
  const storedChipTitle = pendingWorkspace?.title
    ?? (sessionId === undefined
      ? undefined
      : sessionWorkspace?.title
        ?? (workspaces.phase === 'ready' || cwd === undefined || cwd === ''
          ? undefined
          : workspaceLabel(cwd)))
  const chipTitle = storedChipTitle === undefined
    ? undefined
    : workspaceDisplayTitle(storedChipTitle, t('workspace.defaultName'))

  const heroWorkspaceRow = (
    <div className={css.heroWorkspaceRow}>
      <WorkspaceChip
        buttonRef={pickerAnchor}
        label={chipTitle}
        menuOpen={pickerOpen}
        onClick={() => { setPickerOpen(open => !open) }}
        t={t}
      />
      {renderSlot('conversation.hero.workspace', {
        open: pickerOpen,
        anchorRef: pickerAnchor,
        selectedId: pendingWorkspaceId ?? sessionWorkspace?.workspaceId,
        onPick: (workspaceId) => {
          setPickerOpen(false)
          setPendingWorkspaceId(workspaceId)
          void selectWorkspace(workspaceId).catch(() => {
            setPendingWorkspaceId(current => current === workspaceId ? undefined : current)
          })
        },
        onClose: () => { setPickerOpen(false) },
      })}
      {renderSlot('conversation.hero.agentPreset', {})}
      {sessionId === undefined ? null : <div className={css.heroOptions}>{renderSlot('conversation.hero.options', {})}</div>}
    </div>
  )

  // The placeholder chip ("Choose workspace") and the Workspace-trigger input travel
  // together: no workspace picked yet (cold start, no session at all), or a
  // blank session whose workspace vanished (deleted from the sidebar). The
  // bar is ONE session-maybe slot rendered unconditionally — inert is a prop,
  // not a different tree, so the textarea DOM survives the transition.
  const inert = sessionId === undefined || (hero && chipTitle === undefined)
  // A raised block is the same inert posture with the blocker's own reason:
  // one disabled textarea, never a second tree. The no-workspace state wins
  // when both hold — picking a workspace is the earlier prerequisite.
  const blocked = !inert && composerBlock !== undefined
  const inputBar = renderSlot('conversation.composer.bar', {
    variant: hero ? 'hero' : 'composer',
    ...(inert
      ? {
        disabled: true,
        placeholder: t('placeholder.workspace'),
        workspacePickerOpen: pickerOpen,
        onRequestWorkspace: () => { setPickerOpen(true) },
      }
      : blocked
        // `blocked`, not `disabled`: the bar refuses input either way, but a
        // block keeps the model seat live because choosing a model is how the
        // user clears it.
        ? { blocked: composerBlock, placeholder: composerBlock.reason }
        : hero ? { placeholder: t('placeholder.hero') } : {}),
  })

  // The footer earns its space only when it names something. A workspace that
  // belongs to no dashboard is not a finding, so nothing renders rather than
  // bare labels. The two link rows stay a PAIR: when either resolves, both
  // render, as before. The invocation row stands alone, so a Session that used
  // a skill but belongs to no dashboard still gets its line. Only the main
  // occurrence carries it: an embedded Conversation is not the operator's open
  // Session.
  const hasWorkspaceLinks = dashboardUrl !== undefined || designProject !== undefined
  const hasSkillsUsed = skills.length > 0
  const hasPurpose = purpose !== null
  const showSessionFooter = !hero && props.variant === 'main'
    && (hasWorkspaceLinks || hasSkillsUsed || hasPurpose)

  const composerBar = (
    <div className={clsx(css.composerStack, hero && css.composerHero)}>
      {hero && <HeroShell t={t} renderSlot={renderSlot} />}
      {hero && heroWorkspaceRow}
      {zone !== undefined && renderSlot('conversation.input.dock', zone)}
      {inputBar}
      {showSessionFooter && (
        <div className={css.sessionFooter} data-session-footer="">
          {hasWorkspaceLinks && (
            <>
              <div className={css.sessionFooterLine} data-session-footer-line="dashboard">
                <span className={css.sessionFooterLabel}>{t('footer.dashboard')}</span>
                {dashboardUrl !== undefined && (
                  <a
                    className={css.sessionFooterValue}
                    href={dashboardUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {dashboardUrl}
                  </a>
                )}
              </div>
              <div className={css.sessionFooterLine} data-session-footer-line="design-project">
                <span className={css.sessionFooterLabel}>{t('footer.designProject')}</span>
                {designProject !== undefined && (
                  <span className={css.sessionFooterValue}>{designProject}</span>
                )}
              </div>
            </>
          )}
          {hasSkillsUsed && (
            <div className={css.sessionFooterLine} data-session-footer-line="skills-used">
              <span className={css.sessionFooterLabel}>{t('footer.skillsUsed')}</span>
              <span className={css.sessionFooterValue}>{skills.join(', ')}</span>
            </div>
          )}
          {hasPurpose && (
            <div className={css.sessionFooterLine} data-session-footer-line="purpose">
              <span className={css.sessionFooterLabel}>{t('footer.purpose')}</span>
              <span className={css.sessionFooterText}>{purpose}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const composer = renderSlotChain(
    'conversation.composer',
    { sessionId, session, pendingInteraction },
    { fallback: composerBar, fallbackOnly: sessionId === undefined, overlay: true },
  )

  // Sticky wraps the whole chain output (fallback + elected overlay), not
  // only `.composerStack`: overlay:true renders those as siblings, and sticky
  // on the fallback alone would leave a business-owned takeover at the content
  // end off-screen when the user is not pinned to the floor.
  const composerSeat = (
    <div ref={seatResizeRef} className={css.composerSeat} data-composer-seat="" data-conversation-region="composer">
      {composer}
    </div>
  )

  return (
    <div
      ref={setBody}
      className={clsx(css.body, props.variant === 'embedded' && css.embeddedBody)}
      data-conversation-content=""
      data-conversation-session={sessionId}
      data-conversation-region="chat"
      data-content-phase={phase}
    >
      <div className={css.scrollBody} data-conversation-scroll="">
        {sessionId === undefined ? null : <Views />}
        {composerSeat}
      </div>
      <WidthControls container={body} phase={phase} />
    </div>
  )
}

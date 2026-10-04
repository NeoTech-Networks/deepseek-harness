/**
 * The one-sentence session purpose: a single auxiliary model call, made once
 * per root Session as soon as its first agent-loop request is dispatched,
 * that says in plain English what the Session is for. The answer is appended
 * as the log-only `session/purpose` event and shown in the Session footer.
 *
 * It rides the `llm/stream` waterfall exactly like automatic titles do, which
 * gives it the main request's exact route and makes a Session resumed after
 * an install pick up its purpose on its next request. The hook always hands
 * the main request straight on; generation is deferred and never delays it.
 *
 * The input is the first human prompt as typed (including any leading
 * `/skill` gesture) plus the skill and command names the operator has
 * invoked so far. Auto-loaded context blocks are stripped, and a long prompt
 * keeps its head and its tail, because orientation text sits at the start of
 * a message and the actual request sits at its end.
 */

import type { Context } from '@deepseek-ai/cordis'
import { BlockAssembler, createUserMessage, isAgentLoopRequest } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, Message } from '@deepseek-ai/dsh-llm'
import type { Session, SessionEvent, SessionSeq } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-title'
import type { SessionTitleModelIdentity } from '@deepseek-ai/dsh-session-title'
import { deadline } from '@deepseek-ai/dsh-timeout'
import { deepFreeze } from '@deepseek-ai/dsh-util-values'
import { finishError } from './finish.ts'

/** Validated model-call policy the purpose call shares with title generation. */
export interface SessionPurposeCallConfig {
  readonly timeoutMs: number
  readonly provider?: string
  readonly model?: string
}

/** Failed generation attempts allowed per Session per process lifetime. */
export const SESSION_PURPOSE_MAX_ATTEMPTS = 3
/** Output-token cap for one sentence. */
const MAX_OUTPUT_TOKENS = 160
/** Byte cap on the stored sentence. */
const MAX_PURPOSE_BYTES = 300
/** Prompt bytes kept before truncation applies. */
const MAX_PROMPT_BYTES = 6144
/** Bytes kept from the start of an over-long prompt. */
const HEAD_BYTES = 1024
/** Bytes kept from the end of an over-long prompt. */
const TAIL_BYTES = 5120
/** Skill names forwarded to the model. */
const MAX_SKILLS = 16

const SYSTEM_PROMPT = [
  'You write the one-line purpose shown under an AI coding-assistant session.',
  'From the supplied JSON (the operator\'s first request and any skills or commands they invoked), write exactly one plain-English sentence of at most 30 words saying what this session is doing.',
  'Start with a present-tense verb, for example "Adds", "Fixes", "Audits". Name the concrete task and the system it touches. If a skill or command is named, say what it is being used for.',
  'Ignore auto-loaded orientation, reminders, work-history, rules and policy text; describe only what the operator asked for.',
  'Return only the sentence: no quotes, no prefix, no Markdown, no code, no dashes.',
].join('\n')

interface PurposeWork {
  inFlight: boolean
  attempts: number
  done: boolean
}

/**
 * Normalize one model answer into a single display sentence.
 * @param text - raw model text.
 * @returns the cleaned sentence, or an empty string when nothing usable remains.
 */
export function normalizeSessionPurpose(text: string): string {
  let value = text
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/[\u2013\u2014]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
  value = value.replace(/^purpose\s*:\s*/i, '')
  value = value.replace(/^["'`\u201c\u2018]+|["'`\u201d\u2019]+$/g, '').trim()
  value = value.replace(/\s+,/g, ',').replace(/,\s*,/g, ',')
  if (Buffer.byteLength(value, 'utf8') <= MAX_PURPOSE_BYTES) return value
  let cut = value
  while (Buffer.byteLength(cut, 'utf8') > MAX_PURPOSE_BYTES - 3) {
    const space = cut.lastIndexOf(' ')
    cut = space > 0 ? cut.slice(0, space) : cut.slice(0, -1)
  }
  return `${cut.replace(/[\s,;:.]+$/, '')}...`
}

/** Concatenated text blocks of one message's content. */
function textOf(content: readonly { readonly type: string }[]): string {
  const parts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && 'text' in block && typeof block.text === 'string') parts.push(block.text)
  }
  return parts.join('\n')
}

/** Drop auto-loaded context wrappers that say nothing about the operator's request. */
function stripContextBlocks(text: string): string {
  return text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, ' ').trim()
}

/** Keep the head and tail of an over-long prompt, on UTF-8 boundaries. */
function boundPrompt(text: string): string {
  const bytes = Buffer.from(text, 'utf8')
  if (bytes.length <= MAX_PROMPT_BYTES) return text
  const head = bytes.subarray(0, HEAD_BYTES).toString('utf8').replace(/\uFFFD+$/, '')
  const tail = bytes.subarray(bytes.length - TAIL_BYTES).toString('utf8').replace(/^\uFFFD+/, '')
  return `${head} [...] ${tail}`
}

/** Name of an operator skill invocation or command run, if this event records one. */
function invokedNameOf(event: SessionEvent): string | undefined {
  if (event.type === 'user/message') {
    const source: { readonly kind: string } = event.data.source
    if (source.kind !== 'skill-invocation') return undefined
    return 'name' in source && typeof source.name === 'string' && source.name !== '' ? source.name : undefined
  }
  const type: string = event.type
  if (type !== 'command/run') return undefined
  const data: unknown = event.data
  if (data === null || typeof data !== 'object' || !('name' in data)) return undefined
  return typeof data.name === 'string' && data.name !== '' ? data.name : undefined
}

/** What one Session's log says about its purpose so far. */
interface PurposeInput {
  readonly existing: boolean
  readonly first?: { readonly seq: SessionSeq; readonly text: string }
  readonly skills: readonly string[]
}

/** Read the first human prompt, invoked names, and any existing purpose. */
function purposeInputOf(session: Session): PurposeInput {
  let first: { seq: SessionSeq; text: string } | undefined
  const skills: string[] = []
  // oxlint-disable-next-line typescript/no-deprecated -- Existing Session history read; migration deferred.
  for (const event of session.snapshotEvents()) {
    if (event.type === 'session/purpose') return { existing: true, skills }
    if (first === undefined && event.type === 'user/message' && event.data.source.kind === 'user') {
      const text = stripContextBlocks(textOf(event.data.content))
      if (text.length > 0) first = { seq: event.seq, text }
    }
    const name = invokedNameOf(event)
    if (name !== undefined && !skills.includes(name) && skills.length < MAX_SKILLS) skills.push(name)
  }
  return { existing: false, ...first === undefined ? {} : { first }, skills }
}

/**
 * Install the purpose generator.
 * @param ctx - context exposing the LLM and Session services.
 * @param config - validated title-call policy (deadline and optional route pair).
 */
export function installSessionPurposeGenerator(ctx: Context, config: SessionPurposeCallConfig): void {
  const work = new WeakMap<Session, PurposeWork>()
  const lifetime = new AbortController()
  ctx.effect(() => () => {
    lifetime.abort(new Error('session purpose generator disposed'))
  }, 'sessionPurpose.lifetime')

  const generate = async (session: Session, state: PurposeWork, route: SessionTitleModelIdentity): Promise<void> => {
    const input = purposeInputOf(session)
    if (input.existing) {
      state.done = true
      return
    }
    if (input.first === undefined) return
    const messages: Message[] = [createUserMessage({
      content: [{
        type: 'text',
        text: `Write the session purpose from this JSON:\n${JSON.stringify({
          request: boundPrompt(input.first.text),
          skills: input.skills,
        })}`,
      }],
      source: { kind: 'dsh-session-title-llm' },
    })]
    using callDeadline = deadline(lifetime.signal, config.timeoutMs, 'SESSION_PURPOSE_TIMEOUT')
    const options: GenerateOptions = deepFreeze({
      provider: route.provider,
      model: route.model,
      messages,
      system: SYSTEM_PROMPT,
      maxTokens: MAX_OUTPUT_TOKENS,
      sessionId: session.id,
      purpose: 'session-title',
      signal: callDeadline.signal,
    })
    const assembler = new BlockAssembler()
    for await (const chunk of ctx.llm.stream(options)) {
      callDeadline.signal.throwIfAborted()
      assembler.push(chunk)
    }
    callDeadline.signal.throwIfAborted()
    const terminal = finishError(assembler.finish)
    if (terminal !== undefined) throw terminal
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type === 'tool-call')) {
      throw new Error('session-purpose: output must contain text only')
    }
    const purpose = normalizeSessionPurpose(textOf(blocks))
    if (purpose.length === 0) throw new Error('session-purpose: model produced no text')
    if (ctx.sessions.get(session.id) !== session || purposeInputOf(session).existing) {
      state.done = true
      return
    }
    session.append('session/purpose', {
      purpose,
      sourceSeq: input.first.seq,
      skills: [...input.skills],
      model: { ...route },
    })
    state.done = true
  }

  ctx.on('llm/stream', (options, next) => {
    if (lifetime.signal.aborted || options.sessionId === undefined || !isAgentLoopRequest(options)) return next()
    const session = ctx.sessions.get(options.sessionId)
    if (session === undefined || session.header.parentSession !== undefined) return next()
    let state = work.get(session)
    if (state === undefined) {
      state = { inFlight: false, attempts: 0, done: false }
      work.set(session, state)
    }
    if (state.done || state.inFlight || state.attempts >= SESSION_PURPOSE_MAX_ATTEMPTS) return next()
    const current = state
    const route: SessionTitleModelIdentity = config.provider !== undefined && config.model !== undefined
      ? { provider: config.provider, model: config.model }
      : { provider: options.provider, model: options.model }
    current.inFlight = true
    void Promise.resolve()
      .then(() => generate(session, current, route))
      .catch((error: unknown) => {
        current.attempts += 1
        if (lifetime.signal.aborted) return
        ctx.logger.warn(`session "${session.id}": purpose generation failed: ${String(error)}`)
      })
      .finally(() => {
        current.inFlight = false
      })
    return next()
  }, { global: true, prepend: true })
}

/**
 * Automatic image description for text-only model sessions.
 *
 * A text-only model (DeepSeek V4 Pro or Flash) cannot accept image input. When
 * the user attaches an image to such a session, this Host service describes the
 * image with an image-capable vision model and returns model-facing text, so
 * the main model can act on the image content instead of only seeing an
 * "image omitted" placeholder.
 *
 * The behavior is gated by the `subagent-model-selection` user setting (the
 * "Allow agents to choose models for subagents" toggle): it is active only when
 * that preference is enabled and names at least one candidate route, and the
 * vision route is the first allowed image-capable route (falling back to the
 * configured `visionRoute`).
 * @module @deepseek-ai/dsh-vision-routing
 */

import type { Context } from '@deepseek-ai/cordis'
import { Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, FinishReason, GenerateOptions, LlmRuntime, Message } from '@deepseek-ai/dsh-llm'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { deadline, MAX_TIMER_DELAY_MS } from '@deepseek-ai/dsh-timeout'
import { deepFreeze } from '@deepseek-ai/dsh-util-values'
import type {} from '@deepseek-ai/dsh-tool-subagent/model-selection-settings'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Automatic image-description bridge for text-only model sessions. */
    visionRouting: VisionRouting
  }
}

/** Plugin identity used by the loader. */
export const name = 'vision-routing'

/** Exact provider/model route the vision model runs on. */
export interface VisionRoute {
  /** Provider route key the vision model is served by. */
  readonly provider: string
  /** Exact model id on that provider. */
  readonly model: string
}

/** Plugin configuration. Every field is optional; defaults point at the shipped vision model. */
export interface Config {
  /** Exact vision-model route. Defaults to DeepSeek V4 Flash Vision Exp. */
  visionRoute?: VisionRoute
  /** Instruction sent with the images. Defaults to the stable describe rubric. */
  prompt?: string
  /** Output-token cap for one description. Defaults to 4096. */
  maxTokens?: number
  /** End-to-end deadline for one description. Defaults to 60 seconds. */
  timeoutMs?: number
}

/** Timeout reason code for an automatic vision description call. */
export const VISION_DESCRIBE_TIMEOUT_CODE = 'VISION_DESCRIBE_TIMEOUT'

const DEFAULT_ROUTE: VisionRoute = { provider: 'deepseek-official', model: 'deepseek-flash' }
const DEFAULT_MAX_TOKENS = 4096
const DEFAULT_TIMEOUT_MS = 60_000

/** Stable describe-image instruction sent to the vision model. */
const DEFAULT_PROMPT = [
  'Describe the attached image(s) in detail so a text-only model can act on them.',
  'Report any visible text, diagrams, UI elements, tables, numbers, and spatial layout.',
  'Refer to each image as "Image N" in attachment order. Be complete and concrete.',
].join(' ')

/**
 * Failure raised when no usable vision route exists or one description call fails.
 * The caller (prompt admission) treats this as recoverable: it keeps the send and
 * appends a short note instead of rejecting the message.
 */
export class VisionDescriptionError extends Error {
  /** Stable machine-routing code. */
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'VisionDescriptionError'
    this.code = code
  }
}

/** Structural read of the `subagent-model-selection` preference. */
interface SubagentModelSelectionPreference {
  enabled: boolean
  allowedModels: readonly { provider: string; model: string }[]
}

/** Translate a terminal finish reason into an auxiliary-call failure. */
function finishError(finish: FinishReason): Error | undefined {
  switch (finish.kind) {
    case 'stop':
      return undefined
    case 'error':
    case 'aborted': {
      const error = new Error(finish.failure.message) as Error & { code?: string }
      error.code = finish.failure.code
      return error
    }
    case 'max-tokens':
      return new Error('vision-routing: description reached its output token cap')
    case 'tool-calls':
      return new Error('vision-routing: vision model unexpectedly requested a tool')
    default:
      return new Error(`vision-routing: unsupported finish reason "${String((finish as { kind?: unknown }).kind)}"`)
  }
}

/**
 * The automatic image-description service, registered as `ctx.visionRouting`.
 */
export class VisionRouting extends Service {
  static Config: z<Config> = z.object({
    visionRoute: z.object({
      provider: z.string(),
      model: z.string(),
    }),
    prompt: z.string(),
    maxTokens: z.number().step(1).min(1).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_TOKENS),
    timeoutMs: z.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_TIMEOUT_MS),
  })

  private readonly fallbackRoute: VisionRoute
  private readonly prompt: string
  private readonly maxTokens: number
  private readonly timeoutMs: number

  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'visionRouting')
    this.fallbackRoute = resolveVisionRoute(config.visionRoute)
    this.prompt = config.prompt ?? DEFAULT_PROMPT
    this.maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    assertPositiveInteger(this.maxTokens, 'maxTokens')
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > MAX_TIMER_DELAY_MS) {
      throw new Error(`vision-routing: timeoutMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`)
    }
  }

  /**
   * Whether automatic image description is switched on: the subagent-model-selection
   * preference is enabled and names at least one candidate route. A misconfigured
   * preference (enabled but no image-capable route) still reports true here; the
   * route resolution in {@link describe} owns the precise capability check.
   * @returns true when describe() may run; false keeps the caller's current behavior.
   */
  enabled(): boolean {
    const preference = this.preference()
    return preference !== undefined && preference.enabled && preference.allowedModels.length > 0
  }

  /**
   * Describe one ordered image batch with the vision model.
   * @param refs - durable image references, in attachment order.
   * @param signal - optional cancellation fused into the internal deadline.
   * @returns the model-facing description text; empty when `refs` is empty.
   * @throws VisionDescriptionError when no image-capable route exists or the call fails.
   */
  async describe(refs: readonly ImageAttachmentRef[], signal?: AbortSignal): Promise<string> {
    if (refs.length === 0) return ''
    const llm = this.ctx.get('llm')
    if (llm === undefined) {
      throw new VisionDescriptionError('vision-routing: the llm service is unavailable', 'LLM_UNAVAILABLE')
    }
    const route = await this.resolveRoute(llm, signal)
    const content: ContentBlock[] = [
      ...refs.map((ref): ContentBlock => ({ type: 'image', attachment: ref })),
      { type: 'text', text: this.prompt },
    ]
    const messages: Message[] = [createUserMessage({
      source: { kind: 'plugin', plugin: 'dsh-vision-routing' },
      content,
    })]
    using callDeadline = deadline(signal, this.timeoutMs, VISION_DESCRIBE_TIMEOUT_CODE)
    const options: GenerateOptions = deepFreeze({
      provider: route.provider,
      model: route.model,
      messages,
      maxTokens: this.maxTokens,
      signal: callDeadline.signal,
    })
    const assembler = new BlockAssembler()
    for await (const chunk of llm.stream(options)) {
      callDeadline.signal.throwIfAborted()
      assembler.push(chunk)
    }
    callDeadline.signal.throwIfAborted()
    const terminal = finishError(assembler.finish)
    if (terminal !== undefined) {
      const code = (terminal as Error & { code?: string }).code ?? 'VISION_DESCRIBE_FAILED'
      throw new VisionDescriptionError(terminal.message, code)
    }
    const blocks = assembler.blocks()
    return blocks
      .filter((block): block is Extract<(typeof blocks)[number], { type: 'text' }> => block.type === 'text')
      .map(block => block.text)
      .join(' ')
  }

  /** Read the gating preference through its Host service, when composed. */
  private preference(): SubagentModelSelectionPreference | undefined {
    const settings = this.ctx.get('subagentModelSelection') as
      { current(): SubagentModelSelectionPreference } | undefined
    return settings?.current()
  }

  /** Resolve the exact image-capable route to describe with, or throw. */
  private async resolveRoute(llm: LlmRuntime, signal?: AbortSignal): Promise<VisionRoute> {
    const preference = this.preference()
    if (preference !== undefined && preference.enabled) {
      for (const candidate of preference.allowedModels) {
        const info = await llm.resolveModelInfo(candidate.provider, candidate.model, signal)
        if (info.inputModalities !== undefined && info.inputModalities.includes('image')) {
          return { provider: candidate.provider, model: candidate.model }
        }
      }
    }
    const info = await llm.resolveModelInfo(this.fallbackRoute.provider, this.fallbackRoute.model, signal)
    if (info.inputModalities === undefined || !info.inputModalities.includes('image')) {
      throw new VisionDescriptionError(
        `vision-routing: route "${this.fallbackRoute.provider}/${this.fallbackRoute.model}" does not accept image input`,
        'NO_IMAGE_CAPABLE_ROUTE',
      )
    }
    return this.fallbackRoute
  }
}

/** Validate a positive integer limit at direct construction. */
function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`vision-routing: ${field} must be a positive integer`)
  }
}

/** Validate an optional vision route, or return the default. */
function resolveVisionRoute(route: VisionRoute | undefined): VisionRoute {
  const provider = route?.provider
  const model = route?.model
  // Schemastery materializes an absent nested object as two undefined fields.
  if (provider === undefined && model === undefined) return DEFAULT_ROUTE
  if (typeof provider !== 'string' || provider.length === 0
    || typeof model !== 'string' || model.length === 0) {
    throw new Error('vision-routing: visionRoute requires non-empty provider and model')
  }
  return { provider, model }
}

export default VisionRouting

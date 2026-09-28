/**
 * Tool-schema route fallback: when a request would go out on the flash route
 * carrying tool schemas whose combined `function.parameters` byte size exceeds
 * the configured limit, the request goes out on the pro route instead. No
 * schema is ever truncated, shrunk or re-serialized, and the decision is taken
 * on the `agent/request` waterfall, before the loop assembles and logs its
 * request header, so the durable `request/header` and `request/context` events
 * name the route that actually ran.
 *
 * The waterfall returns the call configuration, so returning a replacement is
 * the whole mechanism. It is registered `prepend`, which puts it in front of
 * every other listener (including the operator's model-selection middleware)
 * and therefore makes it read the route the request would really use.
 *
 * Configuration semantics live in this package's README; the design record is
 * the Agent Note.
 *
 * @module @deepseek-ai/dsh-llm-route-fallback
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { LlmCallConfig } from '@deepseek-ai/dsh-llm'
// Type-only: loads the `agent/request` declaration this plugin listens on.
import type {} from '@deepseek-ai/dsh-agent'
import { planRouteFallback } from './measure.ts'
import type { ResolvedConfig } from './types.ts'

export type { ResolvedConfig, RouteFacts, RouteFallbackOutcome } from './types.ts'
export { planRouteFallback, toolParameterBytes } from './measure.ts'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'llm-route-fallback'

/**
 * Plugin configuration. Every field is optional and defaulted; a value that
 * cannot be honored fails plugin load rather than silently disabling the guard
 * (see {@link resolveConfig}).
 */
export interface Config {
  /** Master switch. `false` leaves every request exactly as the agent declared it. */
  enabled?: boolean
  /** Provider route the fallback applies to; requests on any other provider are untouched. */
  provider?: string
  /**
   * Models the fallback moves a request OFF. A list, not one id, because a
   * provider can serve the same underlying model under a current id and a
   * legacy alias, and a request pinned to either must still be protected.
   */
  from?: string[]
  /** Model the fallback moves a qualifying request ONTO. */
  to?: string
  /** Combined UTF-8 byte size of the tools' `function.parameters` above which the route moves. */
  limitBytes?: number
}

/**
 * Models the fallback moves a request off by default.
 *
 * `deepseek-flash` is the live id. `deepseek-v4-flash` is the legacy name the
 * provider still accepts for the same underlying model and bills at the Flash
 * price (`https://api-docs.deepseek.com/`, read 2026-09-11), so a request
 * pinned to the old id is protected by the same guard.
 */
const DEFAULT_FROM: readonly string[] = ['deepseek-flash', 'deepseek-v4-flash']

/** The route the fallback moves a qualifying request onto. */
const DEFAULT_TO = 'deepseek-v4-pro'

/** The provider route the fallback applies to. */
const DEFAULT_PROVIDER = 'deepseek-official'

/** Combined parameter-byte threshold, the requirement's stated budget. */
const DEFAULT_LIMIT_BYTES = 3000

/** Schemastery validation for {@link Config}; every field is defaulted. */
export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true),
  provider: z.string().default(DEFAULT_PROVIDER),
  from: z.array(z.string()).default([...DEFAULT_FROM]),
  to: z.string().default(DEFAULT_TO),
  limitBytes: z.number().default(DEFAULT_LIMIT_BYTES),
})

/**
 * Validate and default the plugin configuration, failing plugin load on a
 * value that cannot be honored rather than disabling the guard in silence.
 *
 * A missing field takes its documented default; a field that is present but
 * unusable (empty, duplicated, non-integer) throws. That split is what lets
 * `apply(ctx)` run with no config at all while an explicit `from: []` is still
 * an error rather than a silent fall-back to the default routes.
 *
 * The one cross-field rule: `to` must not also be a `from` route. A
 * configuration that moves a request onto a route it moves requests off would
 * either do nothing or oscillate, and neither is worth discovering from a log.
 *
 * @param config - raw plugin configuration.
 * @returns the resolved configuration.
 * @throws {Error} when a field is empty, duplicated, non-integer, or `to` is also a `from` route.
 */
export function resolveConfig(config: Config = {}): ResolvedConfig {
  const provider = config.provider === undefined ? DEFAULT_PROVIDER : config.provider.trim()
  if (provider === '') throw new Error('llm-route-fallback: `provider` must be a non-empty string')
  const to = config.to === undefined ? DEFAULT_TO : config.to.trim()
  if (to === '') throw new Error('llm-route-fallback: `to` must be a non-empty model id')
  const raw = config.from === undefined ? [...DEFAULT_FROM] : config.from
  if (raw.length === 0) {
    throw new Error('llm-route-fallback: `from` must list at least one model id to move off')
  }
  const from: string[] = []
  for (const value of raw) {
    const model = typeof value === 'string' ? value.trim() : ''
    if (model === '') throw new Error('llm-route-fallback: `from` must not contain an empty model id')
    if (from.includes(model)) {
      throw new Error(`llm-route-fallback: \`from\` lists ${model} twice`)
    }
    from.push(model)
  }
  if (from.includes(to)) {
    throw new Error(`llm-route-fallback: \`to\` (${to}) must not also be a \`from\` route`)
  }
  const limitBytes = config.limitBytes === undefined ? DEFAULT_LIMIT_BYTES : config.limitBytes
  if (!Number.isSafeInteger(limitBytes) || limitBytes <= 0) {
    throw new Error('llm-route-fallback: `limitBytes` must be a positive safe integer')
  }
  return { enabled: config.enabled !== false, provider, from, to, limitBytes }
}

/**
 * Install the fallback: one `agent/request` listener that reads the resolved
 * call configuration, measures the step's assembled tool schemas, and returns
 * the configured route when those schemas exceed the limit.
 *
 * @param ctx - plugin context; the listener is disposed with it.
 * @param config - raw plugin configuration.
 * @throws {Error} when {@link resolveConfig} rejects the configuration.
 */
export function apply(ctx: Context, config: Config = {}): void {
  const resolved = resolveConfig(config)
  ctx.effect(() => ctx.on('agent/request', async (payload, next): Promise<LlmCallConfig> => {
    const current = await next()
    const outcome = planRouteFallback({
      provider: current.provider,
      model: current.model,
      tools: payload.tools,
    }, resolved)
    if (outcome.kind === 'kept') return current
    // The loop logs the header AFTER this waterfall returns, so this line and
    // the logged route agree; the log line adds the measurement the header
    // does not carry.
    ctx.logger.info(
      'llm-route-fallback: %s -> %s for %d tool parameter bytes over the %d byte limit',
      outcome.from, outcome.to, outcome.toolBytes, outcome.limitBytes,
    )
    return { ...current, model: outcome.to }
  }, { prepend: true }), 'llm-route-fallback: agent/request policy')
}

/**
 * The pure half of the tool-schema route fallback: one measurement and one
 * decision, free of cordis so a test can drive them directly.
 *
 * The measurement is the combined UTF-8 byte size of the tools'
 * `function.parameters` JSON schemas, which is the exact quantity the wire
 * eventually carries: the DeepSeek adapter maps `tool.parameters` straight into
 * `WireTool.function.parameters` with no transformation in between
 * (`packages/llm/llm-deepseek/src/serialize.ts`). Nothing here truncates,
 * rewrites or re-serializes a schema; the guard's whole point is that no such
 * step exists.
 *
 * @module @deepseek-ai/dsh-llm-route-fallback/measure
 */

import type { ToolSchema } from '@deepseek-ai/dsh-llm'
import type { ResolvedConfig, RouteFacts, RouteFallbackOutcome } from './types.ts'

/**
 * Combined UTF-8 byte size of one request's tool parameter schemas.
 *
 * Each tool contributes `Buffer.byteLength(JSON.stringify(tool.parameters))`,
 * matching the requirement this guard implements ("the combined byte size of
 * the `function.parameters` across all tools"). `ToolSchema.parameters` is a
 * JSON Schema object by contract, so every tool contributes a string.
 *
 * @param tools - the step's assembled tool schemas.
 * @returns the combined byte size, `0` for no tools.
 */
export function toolParameterBytes(tools: readonly ToolSchema[]): number {
  let total = 0
  for (const tool of tools) {
    total += Buffer.byteLength(JSON.stringify(tool.parameters), 'utf8')
  }
  return total
}

/**
 * Decide whether one request keeps its declared route or moves to the
 * configured one.
 *
 * The gates are ordered cheapest-first, and each one that fails is named, so a
 * caller can distinguish "the guard is off" from "this provider is not ours"
 * from "the schemas fit". The byte comparison is exclusive: a request whose
 * parameters measure exactly `limitBytes` is under the limit by definition and
 * keeps its route.
 *
 * @param facts - the resolved route and the assembled tool schemas.
 * @param config - the validated plugin configuration.
 * @returns `moved` with the measured bytes, or `kept` with the first failing gate.
 */
export function planRouteFallback(
  facts: RouteFacts,
  config: ResolvedConfig,
): RouteFallbackOutcome {
  if (!config.enabled) return { kind: 'kept', reason: 'disabled' }
  if (facts.provider !== config.provider) return { kind: 'kept', reason: 'provider' }
  if (!config.from.includes(facts.model)) return { kind: 'kept', reason: 'route' }
  if (facts.tools.length === 0) return { kind: 'kept', reason: 'tools' }
  const toolBytes = toolParameterBytes(facts.tools)
  if (toolBytes <= config.limitBytes) return { kind: 'kept', reason: 'under-limit' }
  return {
    kind: 'moved',
    from: facts.model,
    to: config.to,
    toolBytes,
    limitBytes: config.limitBytes,
  }
}

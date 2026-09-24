/**
 * Decision vocabulary and resolved configuration for the tool-schema route
 * fallback. The plugin's own `Config` shape lives in the entry beside its
 * schemastery schema; the measurement and the decision live in `measure.ts`.
 *
 * @module @deepseek-ai/dsh-llm-route-fallback/types
 */

import type { ToolSchema } from '@deepseek-ai/dsh-llm'

/** Config after validation and defaulting; every field is present. */
export interface ResolvedConfig {
  /** Master switch, resolved. */
  readonly enabled: boolean
  /** Provider route the fallback applies to. */
  readonly provider: string
  /** Models the fallback moves a request off. */
  readonly from: readonly string[]
  /** Model the fallback moves a qualifying request onto. */
  readonly to: string
  /** Combined parameter-byte threshold, exclusive. */
  readonly limitBytes: number
}

/** The request facts the decision reads: the resolved route and the tools it would send. */
export interface RouteFacts {
  /** Provider route the request would go out on. */
  readonly provider: string
  /** Model id the request would go out on. */
  readonly model: string
  /** Tool schemas the step assembled, exactly as the wire will carry their parameters. */
  readonly tools: readonly ToolSchema[]
}

/**
 * Why a request kept the route it declared, or which route it moved to.
 *
 * A `kept` outcome always names the first gate that failed, so a test and a
 * log line can both say "the limit was not reached" rather than "nothing
 * happened".
 */
export type RouteFallbackOutcome =
  | {
    /** The request keeps its declared route. */
    readonly kind: 'kept'
    /** The first gate that kept it. */
    readonly reason: 'disabled' | 'provider' | 'route' | 'tools' | 'under-limit'
  }
  | {
    /** The request moves to the configured route. */
    readonly kind: 'moved'
    /** The model the agent declared. */
    readonly from: string
    /** The model the request is moved onto. */
    readonly to: string
    /** Combined UTF-8 bytes of the tools' `function.parameters`. */
    readonly toolBytes: number
    /** The threshold those bytes exceeded. */
    readonly limitBytes: number
  }

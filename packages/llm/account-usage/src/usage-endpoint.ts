/**
 * The one place this package speaks to the subscription account's usage
 * report: the request, the tolerant parse, and the mapping into wire types.
 *
 * The report is an undocumented endpoint that a subscription client is
 * expected to poll, so the schema here is deliberately permissive. Every
 * sibling window the account may add is nullable, unknown keys are ignored,
 * and a shape this parse cannot read degrades to a failed read rather than a
 * throw — the caller then keeps the previous figures and says so. That is the
 * whole containment strategy for a contract nobody else owns.
 *
 * @module @deepseek-ai/dsh-account-usage/usage-endpoint
 */

import { z } from 'zod'
import type { AccountUsageSnapshot, ExtraUsage, ScopedUsageWindow, UsageWindow } from './types.ts'

/** Default usage report for a Claude subscription grant. */
export const ANTHROPIC_USAGE_ENDPOINT = 'https://api.anthropic.com/api/oauth/usage'

/** Beta opt-in the subscription grant's own endpoints require. */
export const ANTHROPIC_OAUTH_BETA = 'oauth-2025-04-20'

/** One window object as the report carries it; every member may be absent or null. */
const windowSchema = z.object({
  utilization: z.number().nullish(),
  resets_at: z.string().nullish(),
}).loose()

/** One row of the report's flat limit list, which is where scoped windows appear. */
const limitSchema = z.object({
  kind: z.string().nullish(),
  group: z.string().nullish(),
  percent: z.number().nullish(),
  resets_at: z.string().nullish(),
  is_active: z.boolean().nullish(),
  scope: z.object({
    model: z.object({ display_name: z.string().nullish() }).loose().nullish(),
  }).loose().nullish(),
}).loose()

/** Pay-as-you-go block; present whether or not the account ever enabled it. */
const spendSchema = z.object({
  used: z.object({
    amount_minor: z.number().nullish(),
    currency: z.string().nullish(),
    exponent: z.number().nullish(),
  }).loose().nullish(),
  limit: z.number().nullish(),
  enabled: z.boolean().nullish(),
}).loose()

/**
 * The whole report, as loosely as it can be read while still being useful.
 * Only `five_hour` and `seven_day` carry the two headline windows; everything
 * else is optional enrichment.
 */
export const usageReportSchema = z.object({
  five_hour: windowSchema.nullish(),
  seven_day: windowSchema.nullish(),
  limits: z.array(limitSchema).nullish(),
  spend: spendSchema.nullish(),
}).loose()

/** The report as this package reads it. */
export type UsageReport = z.infer<typeof usageReportSchema>

/** What one read of the account's report produced. */
export type UsageFetchOutcome =
  | {
    /** The account answered and the report parsed. */
    readonly kind: 'ok'
    /** The windows the report carried, ready to be dressed with a status. */
    readonly reading: Omit<AccountUsageSnapshot, 'status' | 'at'>
  }
  | {
    /** The account refused the grant; re-authorizing is the only fix. */
    readonly kind: 'unauthorized'
  }
  | {
    /** The read failed for a reason a later attempt may not hit. */
    readonly kind: 'failed'
    /** Short diagnostic, for logs only; never shown as product copy. */
    readonly reason: string
  }

/** What one read of the account's report needs. */
export interface UsageFetchOptions {
  /** Full URL of the usage report. */
  readonly endpoint: string
  /** Beta opt-in header value sent with the request. */
  readonly beta: string
  /** The subscription grant's current access token. */
  readonly token: string
  /** Milliseconds before the read is abandoned. */
  readonly timeoutMs: number
  /** Caller cancellation, combined with the timeout. */
  readonly signal?: AbortSignal
  /** Injected for tests; defaults to the global `fetch`. */
  readonly fetchImpl?: typeof globalThis.fetch
}

/**
 * Clamp a reported utilization to a whole percent.
 * @param value - utilization as the report carries it, possibly absent.
 * @returns the percent, or undefined when the report carried none.
 */
function percentOf(value: number | null | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Read one headline window out of the report.
 * @param value - the window object, possibly absent.
 * @returns the window, or undefined when it carries no usable percent.
 */
function windowOf(value: z.infer<typeof windowSchema> | null | undefined): UsageWindow | undefined {
  if (value === null || value === undefined) return undefined
  const percent = percentOf(value.utilization)
  if (percent === undefined) return undefined
  const resetsAt = value.resets_at
  return {
    percent,
    ...typeof resetsAt === 'string' ? { resetsAt } : {},
  }
}

/**
 * Read the scoped weekly windows out of the report's flat limit list.
 * @param limits - the limit rows, possibly absent.
 * @returns every scoped row that carries a label and a percent.
 */
function scopedOf(limits: UsageReport['limits']): readonly ScopedUsageWindow[] {
  const rows: ScopedUsageWindow[] = []
  for (const limit of limits ?? []) {
    if (limit.kind !== 'weekly_scoped') continue
    const percent = percentOf(limit.percent)
    const label = limit.scope?.model?.display_name
    if (percent === undefined || typeof label !== 'string' || label === '') continue
    const resetsAt = limit.resets_at
    rows.push({
      label,
      percent,
      active: limit.is_active === true,
      ...typeof resetsAt === 'string' ? { resetsAt } : {},
    })
  }
  return rows
}

/**
 * Read the pay-as-you-go block out of the report.
 * @param spend - the spend block, possibly absent.
 * @returns the spend figures, or undefined when the account reports none.
 */
function extraUsageOf(spend: UsageReport['spend']): ExtraUsage | undefined {
  const used = spend?.used
  if (used === null || used === undefined) return undefined
  const usedMinor = used.amount_minor
  if (typeof usedMinor !== 'number' || !Number.isFinite(usedMinor)) return undefined
  return {
    usedMinor: Math.max(0, Math.round(usedMinor)),
    currency: typeof used.currency === 'string' ? used.currency : 'USD',
    exponent: typeof used.exponent === 'number' ? used.exponent : 2,
    limitMinor: typeof spend?.limit === 'number' ? Math.round(spend.limit) : null,
  }
}

/**
 * Turn one parsed report into the windows a snapshot carries.
 * @param report - the parsed report.
 * @returns the reading, with absent members for anything the report omitted.
 */
export function readingOf(report: UsageReport): Omit<AccountUsageSnapshot, 'status' | 'at'> {
  const fiveHour = windowOf(report.five_hour)
  const sevenDay = windowOf(report.seven_day)
  const scoped = scopedOf(report.limits)
  const extraUsage = extraUsageOf(report.spend)
  return {
    ...fiveHour === undefined ? {} : { fiveHour },
    ...sevenDay === undefined ? {} : { sevenDay },
    ...scoped.length === 0 ? {} : { scoped },
    ...extraUsage === undefined ? {} : { extraUsage },
  }
}

/**
 * Read the account's usage report once.
 *
 * Never throws for a transport or contract fault: every failure comes back as
 * an outcome so the caller can keep showing the previous figures.
 * @param options - endpoint, grant, and cancellation.
 * @returns what the read produced.
 */
export async function fetchAccountUsage(options: UsageFetchOptions): Promise<UsageFetchOutcome> {
  const call = options.fetchImpl ?? globalThis.fetch
  const timeout = AbortSignal.timeout(options.timeoutMs)
  const signal = options.signal === undefined ? timeout : AbortSignal.any([options.signal, timeout])
  let response: Response
  try {
    response = await call(options.endpoint, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${options.token}`,
        'anthropic-beta': options.beta,
        accept: 'application/json',
      },
      signal,
    })
  } catch (error: unknown) {
    return { kind: 'failed', reason: error instanceof Error ? error.name : 'network' }
  }
  if (response.status === 401 || response.status === 403) return { kind: 'unauthorized' }
  if (!response.ok) return { kind: 'failed', reason: `http ${response.status}` }
  let body: unknown
  try {
    body = await response.json()
  } catch (_undecodable) {
    // A body that is not JSON is the same class of fault as a shape this
    // parse cannot read: the figures stay as they were.
    return { kind: 'failed', reason: 'body' }
  }
  const parsed = usageReportSchema.safeParse(body)
  if (!parsed.success) return { kind: 'failed', reason: 'schema' }
  return { kind: 'ok', reading: readingOf(parsed.data) }
}

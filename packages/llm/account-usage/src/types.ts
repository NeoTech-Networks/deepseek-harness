/**
 * Wire types of the `accountUsage` Remote namespace. Types only: generated
 * Remote clients consume this module without Host runtime code.
 *
 * Everything here is derived from a subscription account's own usage report.
 * No credential material has a slot to ride in: the Host reads the stored
 * grant, and only percentages, reset instants and a spend figure cross the
 * wire.
 *
 * @module @deepseek-ai/dsh-account-usage/types
 */

/** One rate-limit window's occupancy as the account reports it. */
export interface UsageWindow {
  /** Whole percent of the window consumed, 0 to 100. */
  readonly percent: number
  /** ISO 8601 instant the window resets; absent when the account reports none. */
  readonly resetsAt?: string
}

/** One window that applies to part of the account rather than all of it. */
export interface ScopedUsageWindow extends UsageWindow {
  /** Display name of what the window is scoped to, such as a model family. */
  readonly label: string
  /** Whether the account currently counts usage against this window. */
  readonly active: boolean
}

/** Pay-as-you-go spend beyond the plan's included usage. */
export interface ExtraUsage {
  /** Spend so far in the currency's minor units. */
  readonly usedMinor: number
  /** ISO 4217 currency code. */
  readonly currency: string
  /** Decimal places between the minor unit and the major unit. */
  readonly exponent: number
  /** Cap in minor units, or `null` when the account reports no cap. */
  readonly limitMinor: number | null
}

/**
 * Why a snapshot holds the figures it holds.
 *
 * `live`: the figures were read from the account within this snapshot's `at`.
 * `stale`: the stored grant is expired, so the account could not be asked; any
 * figures present are the last ones that were read.
 * `unauthorized`: the account refused the stored grant.
 * `error`: the read failed for any other reason (offline, timeout, throttled).
 * `unsupported`: no subscription grant is stored, so this deployment has no
 * subscription windows to report at all.
 */
export type AccountUsageStatus = 'live' | 'stale' | 'unauthorized' | 'error' | 'unsupported'

/** One reading of the signed-in subscription account's usage windows. */
export interface AccountUsageSnapshot {
  /** Why the snapshot holds the figures it holds. */
  readonly status: AccountUsageStatus
  /** Epoch milliseconds the figures were read; absent when none were ever read. */
  readonly at?: number
  /** The rolling short window, the one that resets several times a day. */
  readonly fiveHour?: UsageWindow
  /** The weekly window covering every model. */
  readonly sevenDay?: UsageWindow
  /** Weekly windows scoped to part of the account; empty when none are reported. */
  readonly scoped?: readonly ScopedUsageWindow[]
  /** Pay-as-you-go spend, when the account enables it. */
  readonly extraUsage?: ExtraUsage
}

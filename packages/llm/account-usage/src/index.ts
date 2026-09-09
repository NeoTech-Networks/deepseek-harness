/**
 * Subscription-account usage service, exposed as the `accountUsage` Remote
 * namespace: how much of the account's rolling and weekly limits the operator
 * has consumed, so a client surface can show it beside the session.
 *
 * Three properties define this service:
 *
 * 1. **The grant never leaves the Host.** The stored credential record is read
 *    here and used here; the wire carries percentages, reset instants and a
 *    spend figure, and {@link AccountUsageSnapshot} has no slot a token could
 *    ride in.
 * 2. **It never refreshes the grant.** An expired access token reports `stale`
 *    and waits, because the adapter that owns the token refreshes it on its
 *    next model call, and a second refresher racing that one can revoke a
 *    token an in-flight request is still using.
 * 3. **It never fails loudly.** Every transport, authorization and contract
 *    fault becomes a status on the snapshot, keeping the last figures that
 *    were read. A usage readout that throws is worse than one that says it is
 *    out of date.
 *
 * One cache entry and one in-flight read are shared by every caller, so a
 * second window costs no extra upstream request.
 *
 * @module @deepseek-ai/dsh-account-usage
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { z as zod } from 'zod'
import { credentialKey } from '@deepseek-ai/dsh-credentials'
import type { CredentialKey } from '@deepseek-ai/dsh-credentials'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { AccountUsageSnapshot } from './types.ts'
import {
  ANTHROPIC_OAUTH_BETA,
  ANTHROPIC_USAGE_ENDPOINT,
  fetchAccountUsage,
} from './usage-endpoint.ts'

export type * from './types.ts'
export {
  ANTHROPIC_OAUTH_BETA,
  ANTHROPIC_USAGE_ENDPOINT,
  fetchAccountUsage,
  readingOf,
  usageReportSchema,
} from './usage-endpoint.ts'
export type { UsageFetchOptions, UsageFetchOutcome, UsageReport } from './usage-endpoint.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host owner of the `accountUsage` Remote namespace. */
    accountUsage: AccountUsage
  }
}

/** Where the account's usage report lives and how hard this service may ask. */
export interface Config {
  /** Full URL of the usage report. */
  readonly endpoint: string
  /** Beta opt-in header value sent with the request. */
  readonly beta: string
  /** Registered name of the plugin owning the credential record. */
  readonly credentialScope: string
  /** That plugin's own addressing unit for the record, its provider route key. */
  readonly credentialId: string
  /** Milliseconds one answer stays good for; every caller shares it. */
  readonly cacheMs: number
  /** Milliseconds before one read of the report is abandoned. */
  readonly timeoutMs: number
}

/**
 * The stored grant, as much of it as this service reads. The owning adapter
 * writes the rest and keeps owning it; the two fields below are the only ones
 * a usage read needs, so anything else in the payload is ignored rather than
 * validated.
 */
const grantSchema = zod.object({
  type: zod.literal('oauth'),
  access: zod.string().min(1),
  expires: zod.number(),
}).loose()

/** Host Remote service reporting the signed-in subscription account's usage. */
export class AccountUsage extends TypertRemoteService {
  static inject = ['typert']

  static Config: z<Config> = z.object({
    endpoint: z.string().default(ANTHROPIC_USAGE_ENDPOINT),
    beta: z.string().default(ANTHROPIC_OAUTH_BETA),
    credentialScope: z.string().default('llm-pi-ai'),
    credentialId: z.string().default('anthropic'),
    cacheMs: z.number().step(1).min(0).default(10_000),
    timeoutMs: z.number().step(1).min(1).default(10_000),
  })

  /** Address of the credential record this service reads. */
  private readonly key: CredentialKey

  /** The answer every caller shares until it ages out. */
  private cached: AccountUsageSnapshot | undefined

  /** Epoch milliseconds {@link cached} was produced. */
  private cachedAt = 0

  /** The last figures actually read from the account, kept across failures. */
  private lastReading: Omit<AccountUsageSnapshot, 'status' | 'at'> | undefined

  /** Epoch milliseconds {@link lastReading} was read. */
  private lastReadingAt: number | undefined

  /** The read in progress, so concurrent callers share one request. */
  private inFlight: Promise<AccountUsageSnapshot> | undefined

  /**
   * @param ctx - Host context where a credential provider may be mounted.
   * @param config - report location and read policy.
   */
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'accountUsage')
    this.key = credentialKey(config.credentialScope, config.credentialId)
  }

  /**
   * Report how much of the subscription account's limits are consumed.
   *
   * Cheap to call repeatedly: the answer is cached for the configured window
   * and concurrent callers share one upstream read.
   * @returns the current snapshot, whatever state the account read is in.
   */
  @Remote
  async read(): Promise<AccountUsageSnapshot> {
    const now = Date.now()
    if (this.cached !== undefined && now - this.cachedAt < this.config.cacheMs) return this.cached
    this.inFlight ??= this.load()
      .then((snapshot) => {
        this.cached = snapshot
        this.cachedAt = Date.now()
        return snapshot
      })
      .finally(() => { this.inFlight = undefined })
    return await this.inFlight
  }

  /**
   * Dress the last figures read with a degraded status.
   * @param status - why the current read produced nothing better.
   * @returns the snapshot to serve.
   */
  private degraded(status: AccountUsageSnapshot['status']): AccountUsageSnapshot {
    return {
      status,
      ...this.lastReadingAt === undefined ? {} : { at: this.lastReadingAt },
      ...this.lastReading ?? {},
    }
  }

  /**
   * Read the account once, without the cache.
   *
   * The caller's cancellation is deliberately not forwarded: one read is
   * shared by every caller and already capped by its own timeout, so one
   * caller walking away must not abort the answer the others are waiting for.
   * @returns the snapshot for this read.
   */
  private async load(): Promise<AccountUsageSnapshot> {
    const credentials = this.ctx.get('credentials')
    if (credentials === undefined) return { status: 'unsupported' }
    const record = await credentials.readRecord(this.key)
    if (record === undefined || record.kind !== 'grant') return { status: 'unsupported' }
    const grant = grantSchema.safeParse(record.payload)
    // A record whose payload this service cannot read belongs to an adapter
    // that authenticates some other way: not an error, just nothing to report.
    if (!grant.success) return { status: 'unsupported' }
    if (grant.data.expires <= Date.now()) return this.degraded('stale')

    const outcome = await fetchAccountUsage({
      endpoint: this.config.endpoint,
      beta: this.config.beta,
      token: grant.data.access,
      timeoutMs: this.config.timeoutMs,
    })
    if (outcome.kind === 'unauthorized') return this.degraded('unauthorized')
    if (outcome.kind === 'failed') return this.degraded('error')
    const at = Date.now()
    this.lastReading = outcome.reading
    this.lastReadingAt = at
    return { status: 'live', at, ...outcome.reading }
  }
}

export default AccountUsage

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import { credentialKey } from '@deepseek-ai/dsh-credentials'
import { AccountUsage, type Config } from '../src/index.ts'
import { fetchAccountUsage, readingOf, usageReportSchema } from '../src/usage-endpoint.ts'

const ENDPOINT = 'https://account.test/usage'
const TOKEN = 'sk-ant-oat01-test-token-value'
const KEY = credentialKey('llm-pi-ai', 'anthropic')

const CONFIG: Config = {
  endpoint: ENDPOINT,
  beta: 'oauth-2025-04-20',
  credentialScope: 'llm-pi-ai',
  credentialId: 'anthropic',
  cacheMs: 10_000,
  timeoutMs: 1_000,
}

/**
 * The report shape observed from a live subscription account, with neutral
 * figures. Every sibling window the account may also report is present as
 * `null`, which is what the tolerant parse has to survive.
 */
const REPORT = {
  five_hour: { utilization: 3, resets_at: '2026-09-09T01:20:00.223884+00:00', limit_dollars: null },
  seven_day: { utilization: 16.4, resets_at: '2026-09-13T09:00:00.223911+00:00', limit_dollars: null },
  seven_day_opus: null,
  seven_day_omelette: null,
  nimbus_quill: { utilization: 0, resets_at: null },
  extra_usage: { is_enabled: true, monthly_limit: null, used_credits: 2500 },
  limits: [
    { kind: 'session', group: 'session', percent: 3, severity: 'normal', is_active: false, scope: null },
    { kind: 'weekly_all', group: 'weekly', percent: 16, severity: 'normal', is_active: true, scope: null },
    {
      kind: 'weekly_scoped',
      group: 'weekly',
      percent: 7,
      severity: 'normal',
      is_active: true,
      resets_at: '2026-09-13T09:00:00+00:00',
      scope: { model: { id: null, display_name: 'Fable' }, surface: null },
    },
  ],
  spend: { used: { amount_minor: 2500, currency: 'USD', exponent: 2 }, limit: null, enabled: true },
  member_dashboard_available: false,
}

const dirs: string[] = []

/** A context whose credential records live in a throwaway file. */
async function stored(): Promise<Context> {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-account-usage-'))
  dirs.push(dir)
  const ctx = new Context()
  await ctx.plugin(LocalCredentialProvider, { path: join(dir, '.credentials.yaml'), watch: false })
  return ctx
}

/** Store a grant payload of this service's shape. */
async function grant(ctx: Context, expires: number, access = TOKEN): Promise<void> {
  await ctx.credentials.modifyRecord(KEY, () =>
    Promise.resolve({ kind: 'grant', payload: { type: 'oauth', access, refresh: 'r', expires } }))
}

/** Stub the global fetch with a scripted response and record its calls. */
function scriptFetch(handler: (input: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: { url: string; init: RequestInit }[] = []
  const impl = vi.fn(async (input: unknown, init: unknown) => {
    const url = String(input)
    const options = (init ?? {}) as RequestInit
    calls.push({ url, init: options })
    return await handler(url, options)
  })
  vi.stubGlobal('fetch', impl)
  return { calls, impl }
}

/** A JSON response with the given status. */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

afterEach(async () => {
  vi.unstubAllGlobals()
  await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('usage report parsing', () => {
  it('reads both headline windows, the scoped window, and the spend', () => {
    const reading = readingOf(usageReportSchema.parse(REPORT))

    expect(reading.fiveHour).toEqual({ percent: 3, resetsAt: '2026-09-09T01:20:00.223884+00:00' })
    expect(reading.sevenDay).toEqual({ percent: 16, resetsAt: '2026-09-13T09:00:00.223911+00:00' })
    expect(reading.scoped).toEqual([
      { label: 'Fable', percent: 7, active: true, resetsAt: '2026-09-13T09:00:00+00:00' },
    ])
    expect(reading.extraUsage).toEqual({ usedMinor: 2500, currency: 'USD', exponent: 2, limitMinor: null })
  })

  it('survives a report carrying only nulls', () => {
    const reading = readingOf(usageReportSchema.parse({ five_hour: null, seven_day: null, limits: null, spend: null }))

    expect(reading).toEqual({})
  })

  it('clamps a utilization outside the percent range', () => {
    const reading = readingOf(usageReportSchema.parse({ five_hour: { utilization: 140 }, seven_day: { utilization: -3 } }))

    expect(reading.fiveHour?.percent).toBe(100)
    expect(reading.sevenDay?.percent).toBe(0)
  })
})

describe('one read of the account report', () => {
  it('sends the grant as a bearer token with the beta opt-in', async () => {
    const { calls } = scriptFetch(() => json(REPORT))

    const outcome = await fetchAccountUsage({
      endpoint: ENDPOINT, beta: 'oauth-2025-04-20', token: TOKEN, timeoutMs: 1_000,
    })

    expect(outcome.kind).toBe('ok')
    expect(calls[0]?.url).toBe(ENDPOINT)
    const headers = calls[0]?.init.headers as Record<string, string>
    expect(headers.authorization).toBe(`Bearer ${TOKEN}`)
    expect(headers['anthropic-beta']).toBe('oauth-2025-04-20')
  })

  it('reports a refused grant as unauthorized', async () => {
    scriptFetch(() => json({ error: 'nope' }, 401))

    await expect(fetchAccountUsage({ endpoint: ENDPOINT, beta: 'b', token: TOKEN, timeoutMs: 1_000 }))
      .resolves.toEqual({ kind: 'unauthorized' })
  })

  it('reports a server fault as a failure rather than throwing', async () => {
    scriptFetch(() => json({}, 503))

    await expect(fetchAccountUsage({ endpoint: ENDPOINT, beta: 'b', token: TOKEN, timeoutMs: 1_000 }))
      .resolves.toEqual({ kind: 'failed', reason: 'http 503' })
  })

  it('reports an undecodable body as a failure', async () => {
    scriptFetch(() => new Response('<html>maintenance</html>', { status: 200 }))

    const outcome = await fetchAccountUsage({ endpoint: ENDPOINT, beta: 'b', token: TOKEN, timeoutMs: 1_000 })

    expect(outcome).toEqual({ kind: 'failed', reason: 'body' })
  })

  it('reports a network fault as a failure', async () => {
    scriptFetch(() => { throw new TypeError('offline') })

    const outcome = await fetchAccountUsage({ endpoint: ENDPOINT, beta: 'b', token: TOKEN, timeoutMs: 1_000 })

    expect(outcome.kind).toBe('failed')
  })
})

describe('the accountUsage service', () => {
  it('reports unsupported with no record stored', async () => {
    const ctx = await stored()
    const service = new AccountUsage(ctx, CONFIG)

    await expect(service.read()).resolves.toEqual({ status: 'unsupported' })
  })

  it('reports unsupported for a record that is not an oauth grant', async () => {
    const ctx = await stored()
    await ctx.credentials.modifyRecord(KEY, () => Promise.resolve({ kind: 'api-key', key: 'sk-live' }))
    const service = new AccountUsage(ctx, CONFIG)

    await expect(service.read()).resolves.toEqual({ status: 'unsupported' })
  })

  it('reports stale without asking the account when the grant has expired', async () => {
    const ctx = await stored()
    await grant(ctx, Date.now() - 1_000)
    const { impl } = scriptFetch(() => json(REPORT))
    const service = new AccountUsage(ctx, CONFIG)

    await expect(service.read()).resolves.toEqual({ status: 'stale' })
    expect(impl).not.toHaveBeenCalled()
  })

  it('reports the account figures and carries no credential material', async () => {
    const ctx = await stored()
    await grant(ctx, Date.now() + 3_600_000)
    scriptFetch(() => json(REPORT))
    const service = new AccountUsage(ctx, CONFIG)

    const snapshot = await service.read()

    expect(snapshot.status).toBe('live')
    expect(snapshot.fiveHour?.percent).toBe(3)
    expect(snapshot.sevenDay?.percent).toBe(16)
    expect(typeof snapshot.at).toBe('number')
    expect(JSON.stringify(snapshot)).not.toContain(TOKEN)
  })

  it('serves several callers from one upstream read', async () => {
    const ctx = await stored()
    await grant(ctx, Date.now() + 3_600_000)
    const { impl } = scriptFetch(() => json(REPORT))
    const service = new AccountUsage(ctx, CONFIG)

    const [first, second] = await Promise.all([service.read(), service.read()])
    const third = await service.read()

    expect(impl).toHaveBeenCalledTimes(1)
    expect(first).toEqual(second)
    expect(third.status).toBe('live')
  })

  it('keeps the last figures when the account later refuses the grant', async () => {
    const ctx = await stored()
    await grant(ctx, Date.now() + 3_600_000)
    let refuse = false
    scriptFetch(() => refuse ? json({}, 403) : json(REPORT))
    const service = new AccountUsage(ctx, { ...CONFIG, cacheMs: 0 })

    await service.read()
    refuse = true
    const snapshot = await service.read()

    expect(snapshot.status).toBe('unauthorized')
    expect(snapshot.fiveHour?.percent).toBe(3)
  })

  it('keeps the last figures when the read fails', async () => {
    const ctx = await stored()
    await grant(ctx, Date.now() + 3_600_000)
    let broken = false
    scriptFetch(() => {
      if (broken) throw new TypeError('offline')
      return json(REPORT)
    })
    const service = new AccountUsage(ctx, { ...CONFIG, cacheMs: 0 })

    await service.read()
    broken = true
    const snapshot = await service.read()

    expect(snapshot.status).toBe('error')
    expect(snapshot.sevenDay?.percent).toBe(16)
  })
})

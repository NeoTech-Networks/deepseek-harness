import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import * as RouteFallback from '@deepseek-ai/dsh-llm-route-fallback'
import type { Config } from '@deepseek-ai/dsh-llm-route-fallback'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'

/**
 * Loop-level suite for the route fallback: the decision has to reach the durable
 * request header, not just the returned configuration, because the header is
 * what the session log and every reconstruction read. One arm proves the move,
 * one proves the untouched route, and one proves the decision survives a
 * downstream listener that pins the declared model (the operator's model
 * selection middleware is exactly that shape).
 */

const FLASH = 'mock-flash'
const PRO = 'mock-pro'

/**
 * Register `count` tools whose projected parameter schemas are large enough to
 * clear any small test limit; eight of them also clear the shipped 3,000-byte
 * default.
 * @param ctx - the booted context's tool registry.
 * @param count - how many described tools to register.
 */
function registerTools(ctx: Context, count: number): void {
  for (let index = 0; index < count; index += 1) {
    const properties: Record<string, { type: 'string'; description: string }> = {}
    for (let field = 0; field < 5; field += 1) {
      properties[`field_${field}_${index}`] = {
        type: 'string',
        description: `Field ${field} of probe tool ${index}. ${'x'.repeat(80)}`,
      }
    }
    ctx.tools.register(defineContentToolFixture({
      name: `probe_${index}`,
      description: `Probe tool ${index}.`,
      parameters: properties,
      async execute() { return [{ type: 'text', text: 'ok' }] },
    }))
  }
}

/**
 * Boot the core spine + the guard and register described tools.
 * @param config - plugin configuration for the guard; omitted mounts it with no
 * config at all, which is the loader's own defaulting path.
 * @param count - how many described tools to register.
 * @returns the booted context.
 */
async function harness(config?: Config, count = 1): Promise<Context> {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  if (config === undefined) await ctx.plugin(RouteFallback)
  else await ctx.plugin(RouteFallback, config)
  registerTools(ctx, count)
  return ctx
}

/** Resolve once the agent settles idle. */
function waitForIdle(ctx: Context, agent: Agent): Promise<void> {
  return new Promise((resolve) => {
    const dispose = ctx.on('agent/status', ({ agent: subject, status }) => {
      if (subject !== agent || status !== 'idle') return
      dispose()
      resolve()
    })
  })
}

/** What one settled prompt left in the durable request header. */
interface LoggedRequest {
  /** The model the header names. */
  readonly model: string | undefined
  /** Combined parameter bytes of the tool schemas the header carries. */
  readonly toolBytes: number
}

/**
 * Register one adapter, run one prompt through a fresh agent, and report what
 * the durable request header recorded. The adapter is registered here and only
 * here: one provider cannot be registered twice in one context.
 * @param ctx - the booted context.
 * @param provider - the provider route the agent is created on.
 * @param model - the model the agent is created on.
 * @returns the logged route and the logged tool parameter bytes.
 */
async function loggedRequest(ctx: Context, provider = 'mock', model = FLASH): Promise<LoggedRequest> {
  const adapter = new MockAdapter([textResponse('done')])
  ctx.llm.registerAdapter([provider], adapter)
  const agent = await ctx.agentLoop.create(SessionId('route-fallback'), { provider, model })
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'go' }], source: { kind: 'user' } }))
  await waitForIdle(ctx, agent)
  const header = agent.session.requestHeader()
  return {
    model: header?.config.model,
    toolBytes: RouteFallback.toolParameterBytes(header?.tools ?? []),
  }
}

describe('agent/request route fallback', () => {
  it('moves an oversized tool set onto the pro route in the logged header', async () => {
    const ctx = await harness({ provider: 'mock', from: [FLASH], to: PRO, limitBytes: 200 }, 8)
    await expect(loggedRequest(ctx)).resolves.toMatchObject({ model: PRO })
  })

  it('leaves a request whose schemas fit exactly as the agent declared it', async () => {
    const ctx = await harness({ provider: 'mock', from: [FLASH], to: PRO, limitBytes: 200_000 }, 8)
    await expect(loggedRequest(ctx)).resolves.toMatchObject({ model: FLASH })
  })

  it('wins over a downstream listener that pins the declared model', async () => {
    const ctx = await harness({ provider: 'mock', from: [FLASH], to: PRO, limitBytes: 200 }, 8)
    // Registered after the guard and without prepend, so it runs inside it: the
    // shape of the model-selection middleware this decision has to survive.
    ctx.on('agent/request', async (_payload, next) => ({ ...await next(), model: FLASH }))
    await expect(loggedRequest(ctx)).resolves.toMatchObject({ model: PRO })
  })

  it('is inert when disabled', async () => {
    const ctx = await harness({ enabled: false, provider: 'mock', from: [FLASH], to: PRO, limitBytes: 200 }, 8)
    await expect(loggedRequest(ctx)).resolves.toMatchObject({ model: FLASH })
  })

  it('mounts with no configuration at all and leaves another provider alone', async () => {
    const ctx = await harness(undefined, 8)
    await expect(loggedRequest(ctx)).resolves.toMatchObject({ model: FLASH })
  })

  it('moves the live flash route onto the live pro route under the shipped defaults', async () => {
    const ctx = await harness(undefined, 40)
    const live = await loggedRequest(ctx, 'deepseek-official', 'deepseek-v4-flash')
    // The pre-condition first: a fixture that drifts under the shipped 3,000-byte
    // limit must fail here rather than pass for the wrong reason.
    expect(live.toolBytes).toBeGreaterThan(3000)
    expect(live.model).toBe('deepseek-v4-pro')
  })

  it('moves the current flash route id too, and never a route already on the pro model', async () => {
    const live = await harness(undefined, 40)
    const current = await loggedRequest(live, 'deepseek-official', 'deepseek-flash')
    expect(current.toolBytes).toBeGreaterThan(3000)
    expect(current.model).toBe('deepseek-v4-pro')
    const pro = await harness(undefined, 40)
    await expect(loggedRequest(pro, 'deepseek-official', 'deepseek-v4-pro'))
      .resolves.toMatchObject({ model: 'deepseek-v4-pro' })
  })
})

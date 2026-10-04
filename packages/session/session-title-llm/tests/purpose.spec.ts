import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import LlmRuntime, { createUserMessage, LlmAdapter, markAgentLoopRequest } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import {
  normalizeSessionPurpose,
  registerSessionPurposeGenerator,
  SESSION_PURPOSE_MAX_ATTEMPTS,
} from '@deepseek-ai/dsh-session-title-llm'

const CONFIG = {
  targetWords: 5,
  targetCjkCharacters: 10,
  maxInputBytes: 4_096,
  maxOutputTokens: 64,
  timeoutMs: 1_000,
} as const

function textScript(text: string): StreamChunk[] {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

const OK = textScript('  "Adds a Purpose line to the session footer."  ')
const FAIL: StreamChunk[] = [{ type: 'finish', reason: { kind: 'error', failure: { message: 'boom', code: 'SERVER' } } }]

/** Scripted adapter: the main route answers nothing, auxiliary calls follow the script queue. */
class ScriptedAdapter extends LlmAdapter {
  readonly auxiliary: GenerateOptions[] = []
  constructor(private readonly scripts: StreamChunk[][]) {
    super()
  }

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    if (options.purpose !== 'session-title') {
      yield * textScript('main answer')
      return
    }
    this.auxiliary.push(options)
    yield * (this.scripts.shift() ?? OK)
  }
}

let nextId = 0

async function setup(scripts: StreamChunk[][] = []): Promise<{ ctx: Context; adapter: ScriptedAdapter }> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(LlmRuntime)
  const adapter = new ScriptedAdapter(scripts)
  ctx.llm.registerAdapter(['route'], adapter)
  registerSessionPurposeGenerator(ctx, CONFIG)
  return { ctx, adapter }
}

function session(ctx: Context, prompt = 'please add a purpose line', parent?: SessionId): Session {
  const created = ctx.sessions.create(SessionId(`purpose-${++nextId}`), parent === undefined ? undefined : { meta: { parentSession: parent } })
  created.append('user/message', createUserMessage({
    content: [{ type: 'text', text: prompt }],
    source: { kind: 'user' },
  }), { surfaceOp: 'append' })
  return created
}

async function mainRequest(ctx: Context, target: Session, mark = true): Promise<void> {
  const options: GenerateOptions = {
    provider: 'route',
    model: 'main-model',
    messages: [createUserMessage({ content: [{ type: 'text', text: 'hi' }], source: { kind: 'user' } })],
    sessionId: target.id,
  }
  for await (const _chunk of ctx.llm.stream(mark ? markAgentLoopRequest(options) : options)) { /* drain */ }
}

async function settle(): Promise<void> {
  for (let index = 0; index < 20; index++) await new Promise(resolve => setTimeout(resolve, 0))
}

function purposes(target: Session) {
  return target.snapshotEvents().filter(event => event.type === 'session/purpose')
}

describe('session purpose generator', () => {
  it('appends one normalized sentence after the first agent-loop request', async () => {
    const { ctx, adapter } = await setup()
    const target = session(ctx)
    await mainRequest(ctx, target)
    await settle()
    const events = purposes(target)
    expect(events).toHaveLength(1)
    expect(events[0]?.data).toEqual({
      purpose: 'Adds a Purpose line to the session footer.',
      sourceSeq: target.snapshotEvents()[0]?.seq,
      skills: [],
      model: { provider: 'route', model: 'main-model' },
    })
    expect(adapter.auxiliary[0]).toMatchObject({ provider: 'route', model: 'main-model', maxTokens: 64, purpose: 'session-title' })
  })

  it('forwards operator skill invocations and command runs', async () => {
    const { ctx, adapter } = await setup()
    const target = session(ctx, '/dashboard check the footer')
    target.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'skill body' }],
      source: { kind: 'skill-invocation', name: 'dashboard', form: 'instructions' } as never,
    }), { surfaceOp: 'append' })
    await mainRequest(ctx, target)
    await settle()
    expect(purposes(target)[0]?.data.skills).toEqual(['dashboard'])
    const prompt = adapter.auxiliary[0]?.messages[0]?.content[0]
    expect(prompt?.type === 'text' && prompt.text).toContain('"skills":["dashboard"]')
    expect(prompt?.type === 'text' && prompt.text).toContain('/dashboard check the footer')
  })

  it('generates once per session', async () => {
    const { ctx, adapter } = await setup()
    const target = session(ctx)
    await mainRequest(ctx, target)
    await settle()
    await mainRequest(ctx, target)
    await settle()
    expect(purposes(target)).toHaveLength(1)
    expect(adapter.auxiliary).toHaveLength(1)
  })

  it('never generates for a subagent session or a non-loop request', async () => {
    const { ctx, adapter } = await setup()
    const child = session(ctx, 'child work', SessionId('parent'))
    await mainRequest(ctx, child)
    const plain = session(ctx)
    await mainRequest(ctx, plain, false)
    await settle()
    expect(purposes(child)).toHaveLength(0)
    expect(purposes(plain)).toHaveLength(0)
    expect(adapter.auxiliary).toHaveLength(0)
  })

  it('retries a failure on the next request and stops after the attempt cap', async () => {
    const { ctx, adapter } = await setup(Array.from({ length: SESSION_PURPOSE_MAX_ATTEMPTS }, () => FAIL))
    const target = session(ctx)
    for (let index = 0; index < SESSION_PURPOSE_MAX_ATTEMPTS + 2; index++) {
      await mainRequest(ctx, target)
      await settle()
    }
    expect(adapter.auxiliary).toHaveLength(SESSION_PURPOSE_MAX_ATTEMPTS)
    expect(purposes(target)).toHaveLength(0)

    const recovering = await setup([FAIL])
    const second = session(recovering.ctx)
    await mainRequest(recovering.ctx, second)
    await settle()
    expect(purposes(second)).toHaveLength(0)
    await mainRequest(recovering.ctx, second)
    await settle()
    expect(purposes(second)).toHaveLength(1)
  })

  it('keeps the head and tail of a long prompt and strips reminder blocks', async () => {
    const { ctx, adapter } = await setup()
    const prompt = `ORIENTATION ${'x'.repeat(20_000)} <system-reminder>secret rules</system-reminder> REAL REQUEST AT END`
    const target = session(ctx, prompt)
    await mainRequest(ctx, target)
    await settle()
    const text = adapter.auxiliary[0]?.messages[0]?.content[0]
    const framed = text?.type === 'text' ? text.text : ''
    expect(framed).toContain('ORIENTATION')
    expect(framed).toContain('REAL REQUEST AT END')
    expect(framed).toContain('[...]')
    expect(framed).not.toContain('secret rules')
    expect(Buffer.byteLength(framed, 'utf8')).toBeLessThan(7_000)
  })

  it('never blocks the main request on generation', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    await ctx.plugin(LlmRuntime)
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    class GatedAdapter extends LlmAdapter {
      override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
        if (options.purpose === 'session-title') await gate
        yield * OK
      }
    }
    ctx.llm.registerAdapter(['route'], new GatedAdapter())
    registerSessionPurposeGenerator(ctx, CONFIG)
    const target = session(ctx)
    await mainRequest(ctx, target)
    expect(purposes(target)).toHaveLength(0)
    release()
    await settle()
    expect(purposes(target)).toHaveLength(1)
  })
})

describe('normalizeSessionPurpose', () => {
  it('strips quotes, prefixes and dashes, and caps the byte length', () => {
    expect(normalizeSessionPurpose('Purpose: "Fixes the footer \u2014 fast."')).toBe('Fixes the footer, fast.')
    expect(normalizeSessionPurpose('Adds A\u2013B\nsupport')).toBe('Adds A, B support')
    expect(normalizeSessionPurpose('   ')).toBe('')
    expect(normalizeSessionPurpose('Adds one two three four five six seven eight nine ten eleven twelve'))
      .toBe('Adds one two three four five six seven eight nine')
    expect(normalizeSessionPurpose('Fixes the footer, then the sidebar, then the title bar too'))
      .toBe('Fixes the footer, then the sidebar, then the title bar')
  })
})

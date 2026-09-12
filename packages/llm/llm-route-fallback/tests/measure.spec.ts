import { describe, expect, it } from 'vitest'
import type { ToolSchema } from '@deepseek-ai/dsh-llm'
import { planRouteFallback, toolParameterBytes } from '../src/measure.ts'
import { resolveConfig } from '../src/index.ts'

/**
 * Pure behavior suite for the tool-schema route fallback: the byte measurement
 * (UTF-8, not code units), the exclusive boundary, every gate that can keep a
 * request, and the fail-loud configuration contract.
 */

/** One tool schema whose parameters carry the given object. */
function tool(name: string, parameters: Record<string, unknown>): ToolSchema {
  return { name, description: 'probe', parameters }
}

const FLASH = 'mock-flash'
const PRO = 'mock-pro'

/** A configuration pinned to the fixture route pair. */
function config(overrides: Partial<Parameters<typeof resolveConfig>[0]> = {}) {
  return resolveConfig({ provider: 'mock', from: [FLASH], to: PRO, ...overrides })
}

describe('toolParameterBytes', () => {
  it('measures nothing for no tools', () => {
    expect(toolParameterBytes([])).toBe(0)
  })

  it('sums every tool and matches the exact JSON the wire carries', () => {
    const parameters = { command: { type: 'string', description: 'run it' } }
    const tools = [tool('a', parameters), tool('b', {})]
    expect(toolParameterBytes(tools))
      .toBe(Buffer.byteLength(JSON.stringify(parameters), 'utf8') + Buffer.byteLength('{}', 'utf8'))
  })

  it('counts UTF-8 bytes, not code units', () => {
    const parameters = { note: 'héllo ★' }
    const json = JSON.stringify(parameters)
    expect(toolParameterBytes([tool('a', parameters)])).toBe(Buffer.byteLength(json, 'utf8'))
    expect(toolParameterBytes([tool('a', parameters)])).toBeGreaterThan(json.length)
  })
})

describe('planRouteFallback gates', () => {
  const tools = [tool('a', { command: { type: 'string' } })]

  it('keeps the declared route when the guard is disabled', () => {
    expect(planRouteFallback({ provider: 'mock', model: FLASH, tools }, config({ enabled: false })))
      .toEqual({ kind: 'kept', reason: 'disabled' })
  })

  it('keeps a request on another provider', () => {
    expect(planRouteFallback({ provider: 'other', model: FLASH, tools }, config()))
      .toEqual({ kind: 'kept', reason: 'provider' })
  })

  it('keeps a request already on a route the fallback does not move off', () => {
    expect(planRouteFallback({ provider: 'mock', model: PRO, tools }, config()))
      .toEqual({ kind: 'kept', reason: 'route' })
  })

  it('keeps a request with no tools at all', () => {
    expect(planRouteFallback({ provider: 'mock', model: FLASH, tools: [] }, config({ limitBytes: 1 })))
      .toEqual({ kind: 'kept', reason: 'tools' })
  })

  it('keeps a request whose parameters measure exactly the limit', () => {
    const bytes = toolParameterBytes(tools)
    expect(planRouteFallback({ provider: 'mock', model: FLASH, tools }, config({ limitBytes: bytes })))
      .toEqual({ kind: 'kept', reason: 'under-limit' })
  })

  it('moves a request one byte over the limit and reports the measurement', () => {
    const bytes = toolParameterBytes(tools)
    expect(planRouteFallback({ provider: 'mock', model: FLASH, tools }, config({ limitBytes: bytes - 1 })))
      .toEqual({ kind: 'moved', from: FLASH, to: PRO, toolBytes: bytes, limitBytes: bytes - 1 })
  })

  it('moves a request pinned to the legacy flash id', () => {
    const legacy = resolveConfig({})
    expect(legacy.from).toContain('deepseek-v4-flash')
    expect(planRouteFallback(
      { provider: 'deepseek-official', model: 'deepseek-v4-flash', tools: [tool('a', { x: 'y'.repeat(4000) })] },
      legacy,
    )).toMatchObject({ kind: 'moved', from: 'deepseek-v4-flash', to: 'deepseek-v4-pro' })
  })
})

describe('resolveConfig', () => {
  it('defaults every field, including the live and legacy flash routes', () => {
    expect(resolveConfig({})).toEqual({
      enabled: true,
      provider: 'deepseek-official',
      from: ['deepseek-flash', 'deepseek-v4-flash'],
      to: 'deepseek-v4-pro',
      limitBytes: 3000,
    })
  })

  it('treats only an explicit false as disabled', () => {
    expect(resolveConfig({ enabled: false }).enabled).toBe(false)
    expect(resolveConfig({ enabled: true }).enabled).toBe(true)
  })

  it.each([
    ['an empty provider', { provider: '  ' }],
    ['an empty destination', { to: '' }],
    ['no source routes', { from: [] }],
    ['a blank source route', { from: ['ok', ' '] }],
    ['a non-string source route', { from: [1 as unknown as string] }],
    ['a duplicated source route', { from: [FLASH, FLASH] }],
    ['a destination that is also a source', { from: [FLASH], to: FLASH }],
    ['a zero limit', { limitBytes: 0 }],
    ['a fractional limit', { limitBytes: 12.5 }],
    ['a negative limit', { limitBytes: -1 }],
  ])('rejects %s', (_label, overrides) => {
    expect(() => resolveConfig(overrides as Parameters<typeof resolveConfig>[0])).toThrow(/llm-route-fallback/)
  })
})

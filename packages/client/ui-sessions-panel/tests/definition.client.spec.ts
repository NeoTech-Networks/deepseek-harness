/**
 * What the `sessions` type is: a builtin page type with one guide entry.
 */
import { describe, expect, it } from 'vitest'
import { SESSIONS_ID, SESSIONS_KIND, sessionsDefinition } from '../src/client/definition.ts'

const t = (key: string): string => key

describe('sessionsDefinition', () => {
  it('is the builtin sessions page type, titled and reached through its guide entry', () => {
    const definition = sessionsDefinition(t)
    expect(definition.id).toBe(SESSIONS_ID)
    expect(definition.kind).toBe(SESSIONS_KIND)
    expect(definition.priority).toBe('builtin')
    expect(definition.patterns).toBeUndefined()
    expect(definition.title('sidebar://sessions')).toBe('tab.title')
    expect(definition.guide).toHaveLength(1)
    expect(definition.guide?.[0]).toMatchObject({
      order: 10,
      title: expect.any(Function),
      description: expect.any(Function),
      icon: expect.any(Function),
    })
    expect(definition.guide?.[0]?.title()).toBe('guide.title')
    expect(definition.guide?.[0]?.description()).toBe('guide.description')
  })
})

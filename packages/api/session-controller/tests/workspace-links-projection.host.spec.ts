/**
 * The workspace-links projection: the MAP-FREE fold of the dashboard a
 * Session's operator messages name, and the map-aware view the Session footer
 * renders live.
 *
 * Two properties carry the feature and are pinned here: a message that names no
 * dashboard returns the SAME state reference (so ordinary chatter costs nothing
 * downstream), and the view keeps its reference when the resolved answer has not
 * moved (the projection contract forbids republishing an unchanged value).
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import {
  MAX_RETAINED_CANDIDATES, resolveProjectedLinks, workspaceLinksProjection,
} from '../src/workspace-links-projection.ts'
import type { WorkspaceLinksProjectionState } from '../src/types.ts'

const PRIMARY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\youtube-creator'
const DESIGN_KEY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\cfo'
const VERCEL_KEY = 'C:\\Projects\\general\\Vercel'
const URL = 'https://ops.theseoitguy.net/youtube-creator'
const CFO_URL = 'https://ops.theseoitguy.net/cfo'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'dsh-workspace-links-projection-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write one map file into the profile directory under test. */
function writeMap(name: string, value: unknown): void {
  writeFileSync(join(root, name), JSON.stringify(value), 'utf8')
}

/** One operator-authored text message, in the envelope the log stores. */
function userEvent(seq: number, text: string): SessionEvent {
  return {
    type: 'user/message',
    seq: SessionSeq(seq),
    time: seq,
    data: createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }),
    surfaceOp: 'append',
  }
}

/** One event the unit is not interested in. */
function otherEvent(seq: number): SessionEvent {
  return { type: 'turn/start', seq: SessionSeq(seq), time: seq, data: { turn: 1 } }
}

/** Fold messages through the shipped unit, exactly as the registry does. */
function fold(messages: readonly SessionEvent[]): WorkspaceLinksProjectionState {
  let state: WorkspaceLinksProjectionState = workspaceLinksProjection.init(
    { cwd: VERCEL_KEY } as SessionHeader,
  )
  for (const event of messages) state = workspaceLinksProjection.apply(state, event)
  return state
}

describe('the workspace-links fold', () => {
  it('starts from the immutable workspace directory and no candidates', () => {
    expect(workspaceLinksProjection.init({ cwd: PRIMARY } as SessionHeader))
      .toEqual({ cwd: PRIMARY, candidates: [] })
    expect(workspaceLinksProjection.init({} as SessionHeader))
      .toEqual({ cwd: '', candidates: [] })
  })

  it('returns the same state reference for an irrelevant event or a message naming nothing', () => {
    const state = fold([userEvent(1, `publish ${URL}`)])
    expect(workspaceLinksProjection.apply(state, otherEvent(2))).toBe(state)
    expect(workspaceLinksProjection.apply(state, userEvent(3, 'now run the gate check'))).toBe(state)
    expect(workspaceLinksProjection.apply(state, userEvent(4, '   '))).toBe(state)
  })

  it('refuses a plugin-authored message, which is not the operator speaking', () => {
    const state = fold([])
    const event = {
      type: 'user/message',
      seq: SessionSeq(1),
      time: 1,
      data: createUserMessage({
        content: [{ type: 'text', text: URL }],
        source: { kind: 'plugin', plugin: 'test' },
      }),
      surfaceOp: 'append',
    } as SessionEvent
    expect(workspaceLinksProjection.apply(state, event)).toBe(state)
  })

  it('retains candidate-bearing messages oldest first and validates as stored JSON', () => {
    const state = fold([userEvent(1, `publish ${URL}`), userEvent(2, 'and report'), userEvent(3, '/dashboard cfo')])
    expect(state.candidates.map(candidate => candidate.seq)).toEqual([1, 3])
    expect(state.candidates[0]?.urls).toEqual([URL])
    expect(state.candidates[1]?.target).toBe('cfo')
    expect(workspaceLinksProjection.stateSchema.safeParse(state).success).toBe(true)
  })

  it('bounds the ring, keeping the newest mentions', () => {
    const messages = Array.from(
      { length: MAX_RETAINED_CANDIDATES + 2 },
      (_, index) => userEvent(index + 1, `/dashboard key-${String(index)}`),
    )
    const state = fold(messages)
    expect(state.candidates).toHaveLength(MAX_RETAINED_CANDIDATES)
    expect(state.candidates[0]?.seq).toBe(3)
    expect(state.candidates.at(-1)?.seq).toBe(MAX_RETAINED_CANDIDATES + 2)
  })
})

describe('the workspace-links view', () => {
  beforeEach(() => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL, [DESIGN_KEY]: CFO_URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube', [DESIGN_KEY]: 'NeoTech Monthly Billing' })
  })

  it('resolves the newest dashboard the Session named', () => {
    const early = fold([userEvent(1, `publish ${URL}`)])
    const moved = fold([userEvent(1, `publish ${URL}`), userEvent(2, '/dashboard cfo')])
    expect(resolveProjectedLinks(early, root)).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(resolveProjectedLinks(moved, root))
      .toEqual({ dashboardUrl: CFO_URL, designProject: 'NeoTech Monthly Billing' })
  })

  it('fills a footer whose first message named no dashboard', () => {
    expect(resolveProjectedLinks(fold([userEvent(1, 'review the boards')]), root)).toEqual({})
    expect(resolveProjectedLinks(
      fold([userEvent(1, 'review the boards'), userEvent(2, `publish ${URL}`)]),
      root,
    )).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
  })

  it('lets the workspace directory decide over every message', () => {
    const state = fold([userEvent(1, '/dashboard cfo')])
    expect(resolveProjectedLinks({ ...state, cwd: PRIMARY }, root))
      .toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
  })

  it('keeps its reference when the resolved answer has not moved', () => {
    const one = fold([userEvent(1, `publish ${URL}`)])
    const two = fold([userEvent(1, `publish ${URL}`), userEvent(2, 'and run the gate check')])
    expect(resolveProjectedLinks(two, root)).toBe(resolveProjectedLinks(one, root))
  })

  it('serves nothing, rather than failing, when the maps are unreadable', () => {
    writeMap('dashboard-links.json', '{ not json')
    writeMap('design-links.json', '{ not json')
    expect(resolveProjectedLinks(fold([userEvent(1, `publish ${URL}`)]), root)).toEqual({})
  })
})

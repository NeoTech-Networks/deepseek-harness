/**
 * Workspace association resolution for the Session footer.
 *
 * The two map files are read from one profile directory. Two signals answer
 * "which dashboard is this Session about": the workspace directory, matched by
 * directory ancestry (and by the trailing `packages/dashboards/src/<key>` form
 * that makes a vercel-services WORKTREE resolve), and, failing that, the operator
 * message that most recently names a dashboard by address or by
 * `/dashboard <target>`. The newest naming message wins, so a Session that moves
 * from one dashboard to another follows it.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  linkCandidatesOf, loadWorkspaceLinks, resolveCandidates, resolveSessionLinks,
  resolveWorkspaceIntent, resolveWorkspaceLinks,
} from '../src/workspace-links.ts'

const PRIMARY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\youtube-creator'
const DESIGN_KEY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\cfo'
const PRODUCER = 'C:\\Projects\\repos\\sig-railway-services\\services\\youtube-creator'
const VERCEL_KEY = 'C:\\Projects\\general\\Vercel'
const URL = 'https://ops.theseoitguy.net/youtube-creator'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'dsh-workspace-links-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write one map file into the profile directory under test. */
function writeMap(name: string, value: unknown): void {
  writeFileSync(join(root, name), typeof value === 'string' ? value : JSON.stringify(value), 'utf8')
}

/** Load the fixture maps and resolve one workspace against them. */
function resolve(cwd: string | undefined) {
  return resolveWorkspaceLinks(cwd, loadWorkspaceLinks(root).byDirectory)
}

/** Load the fixture maps and resolve one oldest operator message against them. */
function intent(text: string | undefined) {
  return resolveWorkspaceIntent(text, loadWorkspaceLinks(root))
}

/** Fold operator messages the way the projection does, then resolve the Session. */
function sessionLinks(cwd: string | undefined, texts: readonly string[]) {
  return resolveSessionLinks(
    cwd,
    texts.map((text, index) => linkCandidatesOf(index, text)),
    loadWorkspaceLinks(root),
  )
}

describe('workspace associations for the Session footer', () => {
  it('resolves the dashboard URL and the design project name from the mapped folder', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube' })
    expect(resolve(PRIMARY)).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
  })

  it('inherits the association into a subfolder of the mapped workspace', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube' })
    expect(resolve(`${PRIMARY}\\.design`).dashboardUrl).toBe(URL)
  })

  it('resolves a worktree of the mapped dashboard from its trailing folder path', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube' })
    const worktree = 'C:/Projects/_wt/dash-youtube-creator-nosessio/packages/dashboards/src/youtube-creator'
    expect(resolve(worktree)).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(resolve(`${worktree}/src`).designProject).toBe('YouTube')
  })

  it('ignores a lookalike path that names no mapped dashboard', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    const lookalike = 'C:/Projects/scratch/packages/dashboards/src/some-other-key'
    expect(resolve(lookalike)).toEqual({})
  })

  it('returns nothing for an unmapped workspace or no workspace at all', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    expect(resolve(VERCEL_KEY)).toEqual({})
    expect(resolve(undefined)).toEqual({})
    expect(resolve('')).toEqual({})
  })

  it('keeps the dashboard value when the design map is absent', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    expect(resolve(PRIMARY)).toEqual({ dashboardUrl: URL })
  })

  it('serves the design value from a malformed dashboard map that cannot be parsed', () => {
    writeMap('dashboard-links.json', '{ not json')
    writeMap('design-links.json', { [DESIGN_KEY]: 'NeoTech Monthly Billing' })
    expect(resolve(DESIGN_KEY)).toEqual({ designProject: 'NeoTech Monthly Billing' })
  })

  it('drops non-string, empty and non-object map entries instead of serving them', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: 7, 'C:\\empty': '' })
    writeMap('design-links.json', [1, 2])
    expect(resolve(PRIMARY)).toEqual({})
    expect(resolve('C:\\empty')).toEqual({})
  })

  it('matches through Windows separators and case differences', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    const cwd = 'c:/Projects/REPOS/vercel-services/packages/dashboards/src/youtube-creator'
    expect(resolve(cwd).dashboardUrl).toBe(URL)
  })
})

describe('Session intent for the Session footer', () => {
  beforeEach(() => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL, [PRODUCER]: URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube' })
  })

  it('indexes the dashboard key of a page-source folder, and no producer folder', () => {
    const links = loadWorkspaceLinks(root)
    expect(links.byKey.get('youtube-creator')).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(links.byKey.size).toBe(1)
    expect(links.hosts).toEqual(new Set([
      'ops.theseoitguy.net', 'railway.neotech.biz', 'railway.theseoitguy.net',
    ]))
  })

  it('resolves the estate address whose route is not the dashboard key', () => {
    // 17 of the 66 mapped page sources route somewhere else: this is
    // gbl-content-dashboard at /gbl-overlord, and every content-roadmap-* key.
    const route = 'https://ops.theseoitguy.net/gbl-overlord'
    writeMap('dashboard-links.json', { [PRIMARY]: route })
    writeMap('design-links.json', { [PRIMARY]: 'GBL Content' })
    const links = loadWorkspaceLinks(root)
    expect(links.byAddress.get('ops.theseoitguy.net/gbl-overlord')).toEqual({
      dashboardUrl: route, designProject: 'GBL Content',
    })
    expect(intent(`/dashboard ${route}`)).toEqual({ dashboardUrl: route, designProject: 'GBL Content' })
    expect(intent(`why is ${route} broken?`).dashboardUrl).toBe(route)
    expect(intent(`${route}#studio`).dashboardUrl).toBe(route)
    expect(intent(`${route}/`).dashboardUrl).toBe(route)
  })

  it('accepts a legacy front-door host for a known key, and no other host', () => {
    expect(intent('https://railway.neotech.biz/youtube-creator'))
      .toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(intent('https://railway.theseoitguy.net/youtube-creator').dashboardUrl).toBe(URL)
    expect(intent('https://railway.theseoitguy.net/not-a-dashboard')).toEqual({})
    // The exact-address lookup is keyed by host, so a legacy host cannot borrow
    // a mapped route either.
    expect(intent('https://railway.theseoitguy.net/nothing-here')).toEqual({})
  })

  it('resolves a dashboard address typed as the oldest operator message', () => {
    expect(intent(`/dashboard ${URL}`)).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(intent(`/dashboard ${URL} should have fresh audit data`).dashboardUrl).toBe(URL)
  })

  it('resolves the bare dashboard key the command names', () => {
    expect(intent('/dashboard youtube-creator')).toEqual({
      dashboardUrl: URL, designProject: 'YouTube',
    })
    expect(intent('**/dashboard** `youtube-creator`')).toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
  })

  it('accepts a pasted address that is not behind the command', () => {
    expect(intent(`Why is ${URL} showing an old count?`).dashboardUrl).toBe(URL)
  })

  it('ignores a /dashboard mode, a flag, and an unknown key', () => {
    expect(intent('/dashboard orient')).toEqual({})
    expect(intent('/dashboard design youtube-creator')).toEqual({})
    expect(intent('/dashboard --sig youtube-creator')).toEqual({})
    expect(intent('/dashboard not-a-dashboard')).toEqual({})
  })

  it('ignores a lookalike address whose host the maps do not use', () => {
    expect(intent('https://theseoitguy.com/youtube-creator is slow')).toEqual({})
  })

  it('returns nothing without a message', () => {
    expect(intent(undefined)).toEqual({})
    expect(intent('')).toEqual({})
    expect(intent('Fix the double-encoding defect')).toEqual({})
  })

  it('lets the workspace decide, and the message only when the workspace names nothing', () => {
    const cfoUrl = 'https://ops.theseoitguy.net/cfo'
    writeMap('dashboard-links.json', { [PRIMARY]: URL, [DESIGN_KEY]: cfoUrl })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube', [DESIGN_KEY]: 'NeoTech Monthly Billing' })
    expect(sessionLinks(PRIMARY, ['/dashboard cfo']).dashboardUrl).toBe(URL)
    expect(sessionLinks(VERCEL_KEY, [`/dashboard ${URL}`]))
      .toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(sessionLinks(VERCEL_KEY, ['Fix the double-encoding defect'])).toEqual({})
  })

  it('follows the NEWEST dashboard-naming message, not the first one', () => {
    const cfoUrl = 'https://ops.theseoitguy.net/cfo'
    writeMap('dashboard-links.json', { [PRIMARY]: URL, [DESIGN_KEY]: cfoUrl })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube', [DESIGN_KEY]: 'NeoTech Monthly Billing' })
    expect(sessionLinks(VERCEL_KEY, ['/dashboard youtube-creator', 'now the cfo board']).dashboardUrl)
      .toBe(URL)
    expect(sessionLinks(VERCEL_KEY, ['/dashboard youtube-creator', '/dashboard cfo']))
      .toEqual({ dashboardUrl: cfoUrl, designProject: 'NeoTech Monthly Billing' })
    expect(sessionLinks(VERCEL_KEY, [`${URL} first`, `now ${cfoUrl}`]).dashboardUrl).toBe(cfoUrl)
  })

  it('fills a footer whose first message named no dashboard', () => {
    expect(sessionLinks(VERCEL_KEY, ['review the boards', `publish ${URL}`]))
      .toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(sessionLinks(VERCEL_KEY, ['review the boards', 'any bugs to fix?'])).toEqual({})
  })

  it('keeps an older dashboard when the newer messages name none', () => {
    expect(sessionLinks(VERCEL_KEY, [`publish ${URL}`, 'now run the gate check', 'and report'])
      .dashboardUrl).toBe(URL)
    expect(sessionLinks(VERCEL_KEY, [`publish ${URL}`, 'https://example.com/nothing-here']).dashboardUrl)
      .toBe(URL)
  })

  it('ignores a lookalike address in the newest message and keeps the older answer', () => {
    expect(sessionLinks(VERCEL_KEY, [`publish ${URL}`, 'https://theseoitguy.com/youtube-creator'])
      .dashboardUrl).toBe(URL)
  })

  it('re-reads a regenerated map without a restart', () => {
    expect(resolveWorkspaceIntent('/dashboard youtube-creator', loadWorkspaceLinks(root)).dashboardUrl)
      .toBe(URL)
    const moved = 'https://ops.theseoitguy.net/youtube-creator-moved'
    writeMap('dashboard-links.json', { [PRIMARY]: URL, [PRODUCER]: URL, [VERCEL_KEY]: moved })
    expect(resolveWorkspaceIntent('/dashboard youtube-creator', loadWorkspaceLinks(root)).dashboardUrl)
      .toBe(URL)
    expect(resolveWorkspaceLinks(VERCEL_KEY, loadWorkspaceLinks(root).byDirectory).dashboardUrl)
      .toBe(moved)
  })
})

describe('candidate extraction for the workspace-links projection', () => {
  it('extracts the addresses and the command target without consulting a map', () => {
    const candidates = linkCandidatesOf(7, `see ${URL} and /dashboard cfo for the rest`)
    expect(candidates.seq).toBe(7)
    expect(candidates.urls).toEqual([URL])
    expect(candidates.target).toBe('cfo')
  })

  it('is empty for a message that names nothing, and drops a mode target', () => {
    expect(linkCandidatesOf(1, 'run the gate check')).toEqual({ seq: 1, urls: [], target: null })
    expect(linkCandidatesOf(1, '/dashboard design youtube-creator')).toEqual({
      seq: 1, urls: [], target: null,
    })
  })

  it('trims sentence punctuation, caps the count and drops an over-long address', () => {
    const long = `https://ops.theseoitguy.net/${'a'.repeat(300)}`
    const candidates = linkCandidatesOf(1, `${URL}. ${long} https://ops.theseoitguy.net/cfo, ${URL}/extra`)
    expect(candidates.urls).toEqual([URL, 'https://ops.theseoitguy.net/cfo', `${URL}/extra`])
  })

  it('classifies a candidate set against the maps, refusing a lookalike host', () => {
    writeMap('dashboard-links.json', { [PRIMARY]: URL })
    writeMap('design-links.json', { [PRIMARY]: 'YouTube' })
    const links = loadWorkspaceLinks(root)
    expect(resolveCandidates(linkCandidatesOf(1, URL), links)).toEqual({
      dashboardUrl: URL, designProject: 'YouTube',
    })
    expect(resolveCandidates(linkCandidatesOf(1, 'https://theseoitguy.com/youtube-creator'), links))
      .toEqual({})
  })
})

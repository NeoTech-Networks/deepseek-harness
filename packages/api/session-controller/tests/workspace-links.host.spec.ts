/**
 * Workspace association resolution for the Session footer.
 *
 * The two map files are read from one profile directory. Two signals answer
 * "which dashboard is this Session about": the workspace directory, matched by
 * directory ancestry (and by the trailing `packages/dashboards/src/<key>` form
 * that makes a vercel-services WORKTREE resolve), and, failing that, the
 * Session's oldest operator message when it names a dashboard by address or by
 * `/dashboard <target>`.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  loadWorkspaceLinks, resolveSessionLinks, resolveWorkspaceIntent, resolveWorkspaceLinks,
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
    expect(links.hosts).toEqual(new Set(['ops.theseoitguy.net']))
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
    const links = loadWorkspaceLinks(root)
    expect(resolveSessionLinks(PRIMARY, '/dashboard cfo', links).dashboardUrl).toBe(URL)
    expect(resolveSessionLinks(VERCEL_KEY, `/dashboard ${URL}`, links))
      .toEqual({ dashboardUrl: URL, designProject: 'YouTube' })
    expect(resolveSessionLinks(VERCEL_KEY, 'Fix the double-encoding defect', links)).toEqual({})
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

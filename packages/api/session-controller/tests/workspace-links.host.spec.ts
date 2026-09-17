/**
 * Workspace association resolution for the Session footer.
 *
 * Both map files are read from one profile directory and matched by directory
 * ancestry, so the footer is a pure function of the Session's immutable header
 * cwd. The trailing `packages/dashboards/src/<key>` form is the part that makes
 * a vercel-services WORKTREE resolve, where the mapped absolute prefix of the
 * primary checkout does not apply.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadWorkspaceLinks, resolveWorkspaceLinks } from '../src/workspace-links.ts'

const PRIMARY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\youtube-creator'
const DESIGN_KEY = 'C:\\Projects\\repos\\vercel-services\\packages\\dashboards\\src\\cfo'
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
  return resolveWorkspaceLinks(cwd, loadWorkspaceLinks(root))
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
    expect(resolve('C:\\Projects\\general\\DS harness')).toEqual({})
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

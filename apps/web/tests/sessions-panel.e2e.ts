// Keyless assembled-browser coverage for the Sessions tab in the right Sidebar:
// the shipped roster row, the real plugin graph, and one Chromium. The panel is
// reached through the guide's own doorway, so this scenario proves the type is
// in the product's composition, not just registered in a unit harness.
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, onTestFailed } from 'vitest'
import { createMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { launchWebScaffold, watchConsole, type WebScaffold } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage, saveFailureShot } from './support.ts'

describe('web e2e: sessions panel', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let page: Page
  let tripwire: ReturnType<typeof watchConsole>

  beforeAll(async () => {
    scaffold = await launchWebScaffold()
    browser = await chromium.launch()
    page = await newEnglishPage(browser)
    tripwire = watchConsole(page)
    await page.goto(scaffold.authenticatedUrl, { waitUntil: 'load' })
    await page.waitForSelector('[class*="frame"]', { timeout: 30_000 })
    await connectFreshWorkspace(page, scaffold.workspaceCwd)
    // A settled session is what the panel lists; seed one turn through the real
    // append path so the list projection carries the session's title.
    const agent = scaffold.ctx.agents.list()[0]
    if (agent === undefined) throw new Error('connected workspace did not create an Agent')
    agent.session.append('turn/start', { turn: 1 })
    agent.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'Show my sessions.' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    agent.session.append('step/start', { turn: 1, step: 1 })
    agent.session.append('assistant/message', {
      stream: [],
      turn: 1,
      step: 1,
      message: createMessage({
        role: 'assistant',
        content: [{ type: 'text', text: 'Ready.' }],
        source: { kind: 'model', provider: 'fixture', model: 'fixture' },
      }),
    }, { surfaceOp: 'append' })
    agent.session.append('step/end', { turn: 1, step: 1 })
    agent.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    await scaffold.ctx.sessions.flush(agent.session)
    await page.getByText('Ready.').waitFor({ timeout: 10_000 })
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
    await scaffold?.close()
  })

  it('opens the Sessions tab from the guide and lists the settled session under All', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-sessions-panel'))
    const column = page.locator('[data-rightbar-col]')
    await page.locator('[data-sidebar-right-expand]').waitFor({ timeout: 15_000 })
    await page.locator('[data-sidebar-right-expand]').click()
    await column.locator('[data-sidebar-right-open]').waitFor({ timeout: 10_000 })

    // The guide lists the sessions type's entry box; picking it opens the panel
    // in the guide's own place.
    await column.locator('[data-sidebar-right-guide-entry="sessions"]').waitFor({ timeout: 10_000 })
    await column.locator('[data-sidebar-right-guide-entry="sessions"]').click()

    // The panel body renders with the Active/All filter. The seeded session is
    // idle, so Active shows no rows and All lists the settled session by title.
    await column.locator('[data-sessions-panel]').waitFor({ timeout: 10_000 })
    expect(await column.locator('[data-sessions-panel-filter="active"]').count()).toBe(1)
    expect(await column.locator('[data-sessions-panel-filter="all"]').count()).toBe(1)
    expect(await column.locator('[data-sessions-panel-row]').count()).toBe(0)

    await column.locator('[data-sessions-panel-filter="all"]').click()
    const row = column.locator('[data-sessions-panel-row]').filter({ hasText: 'Show my sessions.' })
    await row.waitFor({ timeout: 10_000 })
    expect(await row.count()).toBe(1)

    expect(tripwire.pageErrors).toEqual([])
    expect(tripwire.warnings).toEqual([])
  }, 60_000)
})

/**
 * Per-bot tool policy at the tool dispatcher. The listener sits at the front of
 * `tools/pre-execute`, the stage the Claude Code and Codex hook bridges also
 * use, so it holds however the Session was started and whichever hooks are
 * mounted. It reads a side file and the DS Bot store and writes neither.
 * @module @deepseek-ai/dsh-experimental-bot-tool-policy
 */

import { readFile, stat } from 'node:fs/promises'
import { isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { canonicalizeWatchPath, dshHomePath } from '@deepseek-ai/dsh-home-paths'
import type { PreToolDecision, ToolExecution } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-working-directory'
import { absolutePath, classifyTool, decide, policyRoots } from './decide.ts'
import type { PolicyDecision } from './decide.ts'
import { parsePolicy } from './policy.ts'
import type { ParsedPolicy } from './policy.ts'
import { parseRoster } from './roster.ts'
import type { BotIdentity } from './roster.ts'

export { parsePolicy } from './policy.ts'
export type { BotToolPolicy, ParsedPolicy, PolicyGrant, PolicyOperatorRoot, PolicyTier } from './policy.ts'
export { parseRoster } from './roster.ts'
export type { BotIdentity } from './roster.ts'
export { absolutePath, classifyTool, decide, policyRoots } from './decide.ts'
export type { PolicyAction, PolicyCall, PolicyDecision } from './decide.ts'

/** Cordis plugin name. */
export const name = 'bot-tool-policy'
/** Services required to intercept tool calls, walk live parent Sessions, and resolve paths as the tools do. */
export const inject = ['agents', 'tools', 'workingDirectory']

/** Locations of the two files the policy reads. */
export interface Config {
  /** Side file holding the policy. Defaults to `bot/tool-policy.json` under the DeepSeek Harness home. */
  readonly policyPath?: string
  /** DS Bot store mapping Sessions to bots. Defaults to `bot/state.json` under the DeepSeek Harness home. */
  readonly storePath?: string
}

/** Loader schema for the plugin. */
export const Config: z<Config> = z.object({
  policyPath: z.string(),
  storePath: z.string(),
})

/** Longest parent chain walked from a subagent to the bot at its root. */
const MAX_PARENT_DEPTH = 16

/** One file re-read only when its size or modification time moves. */
class WatchedFile<T> {
  private stamp: string | undefined
  private value: T | undefined

  constructor(
    private readonly path: string,
    private readonly parse: (text: string) => T | Promise<T>,
    private readonly absent: (reason: string) => T,
  ) {}

  /** @returns the parsed file, or the absent value when it cannot be read. */
  async read(): Promise<T> {
    let stamp: string
    try {
      const info = await stat(this.path)
      stamp = `${info.mtimeMs}:${info.size}`
    } catch (error: unknown) {
      this.stamp = undefined
      return this.absent(`the file cannot be read (${String(error)})`)
    }
    if (stamp !== this.stamp || this.value === undefined) {
      this.value = await this.parse(await readFile(this.path, 'utf8'))
      this.stamp = stamp
    }
    return this.value
  }
}

/** A policy with each of its roots spelled as the file system resolves it. */
type LoadedPolicy = Exclude<ParsedPolicy, { ok: true }> | (Extract<ParsedPolicy, { ok: true }> & {
  readonly rootSpellings: ReadonlyMap<string, readonly string[]>
})

/** The deepest existing form of a path, or the path itself where it cannot be resolved here. */
async function realSpelling(path: string): Promise<string> {
  if (!isAbsolute(path)) return path
  try {
    return await canonicalizeWatchPath(path)
  } catch {
    return path
  }
}

/** Spell every root both as written and as resolved, so a junctioned root still matches. */
async function loadPolicy(text: string): Promise<LoadedPolicy> {
  const parsed = parsePolicy(text)
  if (!parsed.ok) return parsed
  const entries = await Promise.all(policyRoots(parsed.policy).map(
    async (root): Promise<[string, readonly string[]]> => [root, [root, await realSpelling(root)]],
  ))
  return { ...parsed, rootSpellings: new Map(entries) }
}

/**
 * Mount the policy. Any fault fails open and is logged once per distinct fault,
 * because a broken guard must never stop the bot team.
 * @param ctx - the plugin context.
 * @param config - optional file locations.
 */
export function apply(ctx: Context, config: Config): void {
  const policyPath = config.policyPath ?? dshHomePath('bot', 'tool-policy.json')
  const storePath = config.storePath ?? dshHomePath('bot', 'state.json')
  const policyFile = new WatchedFile<LoadedPolicy>(policyPath, loadPolicy, problem => ({ ok: false, problem }))
  const storeFile = new WatchedFile<ReadonlyMap<string, BotIdentity> | string>(storePath, parseRoster, problem => problem)

  let reported: string | undefined
  /** Log one fault once. `undefined` records a healthy read, so the next fault reports again. */
  const report = (state: string | undefined): void => {
    if (state !== undefined && state !== reported) ctx.logger.warn(state)
    reported = state
  }

  /** The bot a call speaks for: its own Session, else the bot at the root of its parents. */
  const callerOf = (agent: Agent, roster: ReadonlyMap<string, BotIdentity>): BotIdentity | undefined => {
    const own = roster.get(agent.session.id)
    if (own !== undefined) return own
    let parent = agent.session.header.parentSession
    for (let depth = 0; parent !== undefined && depth < MAX_PARENT_DEPTH; depth += 1) {
      const bot = roster.get(parent)
      if (bot !== undefined) return bot
      parent = ctx.agents.get(parent)?.session.header.parentSession
    }
    return undefined
  }

  const evaluate = async (exec: ToolExecution): Promise<PolicyDecision> => {
    const { agent } = exec
    if (agent === undefined) return { kind: 'allow' }
    const roster = await storeFile.read()
    if (typeof roster === 'string') {
      report(`bot-tool-policy: failing open, no tool call is checked: the bot store ${storePath}: ${roster}`)
      return { kind: 'allow' }
    }
    const bot = callerOf(agent, roster)
    if (bot === undefined) return { kind: 'allow' }
    const loaded = await policyFile.read()
    if (!loaded.ok) {
      report(`bot-tool-policy: failing open, no bot tool call is checked: the policy file ${policyPath}: ${loaded.problem}`)
      return { kind: 'allow' }
    }
    report(undefined)
    const action = classifyTool(exec.name, exec.arguments)
    if (action.kind === 'none') return { kind: 'allow' }
    // The same directory the filesystem tools resolve against. The header keeps
    // the original directory only, so a relative path after a directory change
    // would be checked somewhere other than where the tool writes.
    const spelled = action.kind === 'shell'
      ? undefined
      : absolutePath(action.path, await ctx.workingDirectory.ensure(agent, exec.signal))
    return decide(loaded.policy, {
      bot: bot.name,
      ...bot.workDir === undefined ? {} : { workDir: bot.workDir },
      action,
      spellings: spelled === undefined ? [] : [spelled, await realSpelling(spelled)],
      now: Date.now(),
    }, loaded.rootSpellings)
  }

  ctx.on('tools/pre-execute', async (exec, next): Promise<PreToolDecision> => {
    let decision: PolicyDecision
    try {
      decision = await evaluate(exec)
    } catch (error: unknown) {
      report(`bot-tool-policy: failing open for this call: ${String(error)}`)
      return next()
    }
    return decision.kind === 'deny' ? decision : next()
  }, { prepend: true })
}

/**
 * The per-bot rule: writes are denied unless a grant reaches the path, the
 * operator root is written by no bot, and a secret file is reached by no tool.
 * Reads are otherwise free. Shell text is searched for secret paths only: shell
 * writes are not parsed, because a mis-parsed command would block real work.
 * @module @deepseek-ai/dsh-experimental-bot-tool-policy/decide
 */

import { posix, win32 } from 'node:path'
import type { BotToolPolicy, PolicyGrant } from './policy.ts'

/** Outcome of one check. A denial carries the text the model receives. */
export type PolicyDecision = { readonly kind: 'allow' } | { readonly kind: 'deny'; readonly reason: string }

/** What a tool call does, as the policy reads it. */
export type PolicyAction =
  | { readonly kind: 'read'; readonly path: string }
  | { readonly kind: 'write'; readonly path: string }
  | { readonly kind: 'shell'; readonly text: string }
  | { readonly kind: 'none' }

/** One call to check. */
export interface PolicyCall {
  /** Display name of the calling bot. */
  readonly bot: string
  /** The bot's working folder, quoted in a refusal. */
  readonly workDir?: string
  /** What the call does. */
  readonly action: PolicyAction
  /** The target as spelled, then as the file system resolves it. The last entry decides a write. */
  readonly spellings: readonly string[]
  /** Clock reading that expires grants, in epoch milliseconds. */
  readonly now: number
}

const WRITE_TOOLS: ReadonlySet<string> = new Set(['write', 'edit', 'multiedit', 'notebookedit', 'apply_patch'])
const READ_TOOLS: ReadonlySet<string> = new Set(['read', 'read_image', 'grep', 'glob'])
const SHELL_TOOLS: ReadonlySet<string> = new Set(['bash', 'shell', 'pwsh', 'powershell', 'terminal_open', 'terminal_send'])
const EDITOR_TOOL = 'str_replace_editor'
const PATH_KEYS = ['file_path', 'path', 'notebook_path', 'target_file'] as const

const WINDOWS_PATH = /^(?:[a-z]:[\\/]|\\\\)/i

const flavour = (path: string): typeof win32 => WINDOWS_PATH.test(path) ? win32 : posix

/** Compare form: normalized, no trailing separator, and case-folded for a Windows path. */
function compareForm(path: string): string {
  const paths = flavour(path)
  const normal = paths.normalize(path)
  const trimmed = normal.length > paths.parse(normal).root.length ? normal.replace(/[\\/]+$/, '') : normal
  return paths === win32 ? trimmed.toLowerCase() : trimmed
}

/** Prefix test on whole path segments, so `repos/abc` never matches `repos/abc-old`. */
function isUnder(path: string, root: string): boolean {
  const target = compareForm(path)
  const base = compareForm(root)
  const separator = flavour(root).sep
  return target === base || target.startsWith(base.endsWith(separator) ? base : base + separator)
}

function firstPath(args: Readonly<Record<string, unknown>>): string | undefined {
  for (const key of PATH_KEYS) {
    const value = args[key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }
  return undefined
}

function allStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(allStrings)
  return typeof value === 'object' && value !== null ? Object.values(value).flatMap(allStrings) : []
}

/**
 * Read what one tool call does. A tool the policy does not name reads as `none`.
 * @param tool - the tool name as dispatched.
 * @param args - the parsed tool arguments.
 * @returns the action to check.
 */
export function classifyTool(tool: string, args: unknown): PolicyAction {
  const name = tool.trim().toLowerCase()
  if (SHELL_TOOLS.has(name)) return { kind: 'shell', text: allStrings(args).join('\n') }
  if (typeof args !== 'object' || args === null || Array.isArray(args)) return { kind: 'none' }
  const fields = args as Readonly<Record<string, unknown>>
  const path = firstPath(fields)
  if (path === undefined) return { kind: 'none' }
  if (name === EDITOR_TOOL) return { kind: fields.command === 'view' ? 'read' : 'write', path }
  if (WRITE_TOOLS.has(name)) return { kind: 'write', path }
  return READ_TOOLS.has(name) ? { kind: 'read', path } : { kind: 'none' }
}

/**
 * Resolve a tool path the way the filesystem tools do, against the Session cwd.
 * @param path - the path as the model wrote it.
 * @param cwd - the Session working directory.
 * @returns the absolute path.
 */
export function absolutePath(path: string, cwd: string | undefined): string {
  const paths = flavour(cwd !== undefined && !WINDOWS_PATH.test(path) && !path.startsWith('/') ? cwd : path)
  return cwd === undefined ? paths.normalize(path) : paths.resolve(cwd, path)
}

const allGrants = (policy: BotToolPolicy): readonly PolicyGrant[] => [
  ...policy.everyone,
  ...policy.tiers.flatMap(tier => tier.grants),
  ...Object.values(policy.bots).flat(),
]

/**
 * List every root a grant names.
 * @param policy - the validated policy.
 * @returns each granted root once.
 */
export function policyRoots(policy: BotToolPolicy): readonly string[] {
  return [...new Set(allGrants(policy).map(grant => grant.root))]
}

function writeRoots(policy: BotToolPolicy, bot: string, now: number): readonly string[] {
  const granted = [
    ...policy.everyone,
    ...policy.tiers.filter(tier => tier.bots.includes(bot)).flatMap(tier => tier.grants),
    ...new Map(Object.entries(policy.bots)).get(bot) ?? [],
  ]
  const live = granted.filter(grant => grant.kinds.includes('write') && (grant.until === undefined || grant.until > now))
  return [...new Set(live.map(grant => grant.root))]
}

/** Fold a command to forward slashes and lower case, so any spelling of a path matches. */
const foldShell = (text: string): string => text.replace(/[\\/]+/g, '/').toLowerCase()

/**
 * Check one call against the policy.
 * @param policy - the validated policy.
 * @param call - the call and its target spellings.
 * @param rootSpellings - further spellings of a granted root, keyed by the root.
 * @returns allow, or a denial naming the bot, the path and its allowed roots.
 */
export function decide(
  policy: BotToolPolicy,
  call: PolicyCall,
  rootSpellings: ReadonlyMap<string, readonly string[]> = new Map(),
): PolicyDecision {
  const { action, bot } = call
  if (action.kind === 'none') return { kind: 'allow' }
  const roots = writeRoots(policy, bot, call.now)
  const allowedLine = `Allowed write roots for ${bot}: ${roots.join(', ') || 'none'}.`
  if (action.kind === 'shell') {
    const text = foldShell(action.text)
    const fragments = [...policy.secretCommandFragments, ...policy.secretFiles]
    const named = fragments.find(fragment => text.includes(foldShell(fragment)))
    if (named === undefined) return { kind: 'allow' }
    return { kind: 'deny', reason: `${bot}: that command names the bot secrets file ${named}, which is operator-only. ${allowedLine}` }
  }

  const secret = call.spellings.some(path => policy.secretFiles.some(file => isUnder(path, file)))
  if (secret) return { kind: 'deny', reason: `${bot}: the bot secrets file ${action.path} is operator-only. ${allowedLine}` }
  if (action.kind === 'read') return { kind: 'allow' }

  const { operatorRoot } = policy
  const operatorOnly = call.spellings.some(path => isUnder(path, operatorRoot.root)
    && !operatorRoot.except.some(open => isUnder(path, open)))
  if (operatorOnly) {
    return { kind: 'deny', reason: `${bot}: ${action.path} is in the bot store, which is operator-managed. Write inside your workspace instead. ${allowedLine}` }
  }

  const target = call.spellings.at(-1) ?? action.path
  if (roots.some(root => (rootSpellings.get(root) ?? [root]).some(spelling => isUnder(target, spelling)))) return { kind: 'allow' }
  const folder = call.workDir === undefined ? '' : ` Its working folder ${call.workDir} is a place to read and run commands in, not a write grant.`
  return { kind: 'deny', reason: `${bot} may not write to ${action.path}. ${allowedLine}${folder}` }
}

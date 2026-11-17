/**
 * The side-file policy read at every bot tool call. A grant keeps the fields of
 * a DS Bot `browserGrants` entry: what it reaches, which kinds of action, and an
 * optional expiry in epoch milliseconds, resolved when the call is made.
 * @module @deepseek-ai/dsh-experimental-bot-tool-policy/policy
 */

const POLICY_VERSION = 1

/** One write allowance for a path prefix. */
export interface PolicyGrant {
  /** Absolute directory or file the grant reaches. */
  readonly root: string
  /** Action kinds allowed under {@link root}. `write` is the only kind. */
  readonly kinds: readonly 'write'[]
  /** Epoch milliseconds after which the grant is ignored. */
  readonly until?: number
}

/** A named set of bots sharing the same grants. */
export interface PolicyTier {
  /** Label for the set; it has no effect on decisions. */
  readonly name: string
  /** Bot display names, matched exactly. */
  readonly bots: readonly string[]
  /** Grants every named bot receives. */
  readonly grants: readonly PolicyGrant[]
}

/** The directory no bot writes, minus the folders that remain ordinary roots. */
export interface PolicyOperatorRoot {
  /** Absolute directory holding the operator-managed bot store. */
  readonly root: string
  /** Absolute subfolders the operator rule does not cover. */
  readonly except: readonly string[]
}

/** The validated side file. */
export interface BotToolPolicy {
  /** File-format version. */
  readonly version: 1
  /** Absolute files no bot reads, by any tool. */
  readonly secretFiles: readonly string[]
  /** Slash-separated path text refused anywhere in a shell command. */
  readonly secretCommandFragments: readonly string[]
  /** The operator-managed directory. */
  readonly operatorRoot: PolicyOperatorRoot
  /** Grants every bot receives. */
  readonly everyone: readonly PolicyGrant[]
  /** Grants shared by named sets of bots. */
  readonly tiers: readonly PolicyTier[]
  /** Grants for one bot, keyed by display name. */
  readonly bots: Readonly<Record<string, readonly PolicyGrant[]>>
}

/** Outcome of reading the side file. Failure carries the text the operator is shown. */
export type ParsedPolicy =
  | { readonly ok: true; readonly policy: BotToolPolicy }
  | { readonly ok: false; readonly problem: string }

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined

const strings = (value: unknown): readonly string[] | undefined =>
  Array.isArray(value) && value.every(item => typeof item === 'string' && item !== '')
    ? value as string[]
    : undefined

function grants(value: unknown): readonly PolicyGrant[] | undefined {
  if (!Array.isArray(value)) return undefined
  const valid = value.every((item: unknown) => {
    const grant = record(item)
    return grant !== undefined
      && typeof grant.root === 'string' && grant.root !== ''
      && Array.isArray(grant.kinds) && grant.kinds.length > 0 && grant.kinds.every(kind => kind === 'write')
      && (grant.until === undefined || (typeof grant.until === 'number' && Number.isFinite(grant.until)))
  })
  return valid ? value as PolicyGrant[] : undefined
}

function tiers(value: unknown): readonly PolicyTier[] | undefined {
  if (!Array.isArray(value)) return undefined
  const valid = value.every((item: unknown) => {
    const tier = record(item)
    return tier !== undefined && typeof tier.name === 'string'
      && strings(tier.bots) !== undefined && grants(tier.grants) !== undefined
  })
  return valid ? value as PolicyTier[] : undefined
}

/**
 * Validate side-file text. Nothing here throws: a missing or broken file must
 * reach the plugin as a reported problem, because the plugin then fails open.
 * @param text - the file contents.
 * @returns the policy, or a plain-English problem.
 */
export function parsePolicy(text: string): ParsedPolicy {
  if (text.trim() === '') return { ok: false, problem: 'the file is empty' }
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (error: unknown) {
    return { ok: false, problem: `the file is not valid JSON (${String(error)})` }
  }
  const root = record(value)
  if (root === undefined) return { ok: false, problem: 'the file is not a JSON object' }
  if (Object.keys(root).length === 0) return { ok: false, problem: 'the file is empty' }
  if (root.version !== POLICY_VERSION) return { ok: false, problem: `version must be ${POLICY_VERSION}` }
  const operatorRoot = record(root.operatorRoot)
  if (operatorRoot === undefined || typeof operatorRoot.root !== 'string' || operatorRoot.root === ''
    || strings(operatorRoot.except) === undefined) {
    return { ok: false, problem: 'operatorRoot must name a root and an except list' }
  }
  if (strings(root.secretFiles) === undefined) return { ok: false, problem: 'secretFiles must be a list of paths' }
  if (strings(root.secretCommandFragments) === undefined) {
    return { ok: false, problem: 'secretCommandFragments must be a list of path text' }
  }
  if (grants(root.everyone) === undefined) return { ok: false, problem: 'everyone must be a list of grants' }
  if (tiers(root.tiers) === undefined) return { ok: false, problem: 'tiers must be a list of tiers' }
  const bots = record(root.bots)
  if (bots === undefined || !Object.values(bots).every(entry => grants(entry) !== undefined)) {
    return { ok: false, problem: 'bots must map each bot name to a list of grants' }
  }
  return { ok: true, policy: value as BotToolPolicy }
}

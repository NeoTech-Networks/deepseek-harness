/**
 * Read-only index of the DS Bot store: every Session id that speaks for a bot.
 * A record's key is its stable id, not the Session it runs in. The store carries
 * the live Session in `sessionId`, earlier parts in `segments`, and a member's
 * group Sessions under each room, and a tool call can arrive from any of them.
 * @module @deepseek-ai/dsh-experimental-bot-tool-policy/roster
 */

/** The bot a Session speaks for. */
export interface BotIdentity {
  /** Display name, which policy entries match exactly. */
  readonly name: string
  /** The bot's working folder, quoted in refusals. */
  readonly workDir?: string
}

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined

const segmentSessions = (value: unknown): readonly string[] => Array.isArray(value)
  ? value.flatMap((segment: unknown) => {
    const id = record(segment)?.sessionId
    return typeof id === 'string' && id !== '' ? [id] : []
  })
  : []

/**
 * Index store text by Session id. A store that cannot be parsed yields an empty
 * index, so every Session reads as a non-bot Session and is left alone.
 * @param text - contents of the bot store.
 * @returns the bot behind each Session id the store names.
 */
export function parseRoster(text: string): ReadonlyMap<string, BotIdentity> {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return new Map()
  }
  const roster = new Map<string, BotIdentity>()
  const root = record(value)
  const byKey = new Map<string, BotIdentity>()
  for (const [key, item] of Object.entries(record(root?.bots) ?? {})) {
    const bot = record(item)
    if (bot === undefined || typeof bot.name !== 'string' || bot.name === '') continue
    const identity: BotIdentity = {
      name: bot.name,
      ...typeof bot.workDir === 'string' && bot.workDir !== '' ? { workDir: bot.workDir } : {},
    }
    byKey.set(key, identity)
    roster.set(key, identity)
    if (typeof bot.sessionId === 'string' && bot.sessionId !== '') roster.set(bot.sessionId, identity)
    for (const id of segmentSessions(bot.segments)) roster.set(id, identity)
  }
  for (const item of Object.values(record(root?.rooms) ?? {})) {
    const room = record(item)
    for (const [key, id] of Object.entries(record(room?.sessions) ?? {})) {
      const identity = byKey.get(key)
      if (identity !== undefined && typeof id === 'string' && id !== '') roster.set(id, identity)
    }
    for (const [key, segments] of Object.entries(record(room?.segments) ?? {})) {
      const identity = byKey.get(key)
      if (identity !== undefined) for (const id of segmentSessions(segments)) roster.set(id, identity)
    }
  }
  return roster
}

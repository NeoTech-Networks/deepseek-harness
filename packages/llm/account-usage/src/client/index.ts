/**
 * Account-usage plugin, browser half: ONE page-wide feed over
 * `remote.accountUsage`, and ONE entry on the composer dock strip that reads
 * it.
 *
 * The entry is registered beside the session stats row rather than replacing
 * it, so the two facts stay in separate homes: the stats row is about this
 * conversation, this reading is about the account behind every conversation.
 * The feed is page-wide for the same reason — opening a second conversation
 * must not double the polling of an account-level figure.
 *
 * @module @deepseek-ai/dsh-account-usage/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: the Remote carrier face and the generated namespace merge.
import type {} from '@deepseek-ai/dsh-api-gateway/client'
// Type-only: the composer dock cell this plugin occupies.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: the slot registry's Context merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: the session-scope standard props the entry receives.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { accountUsageEntry } from './AccountUsageLine.tsx'
import { createAccountUsageFeed } from './feed.ts'
import { en, zh } from './locales.ts'

export { createAccountUsageFeed } from './feed.ts'
export type { AccountUsageFeed, AccountUsageFeedOptions } from './feed.ts'
export {
  AccountUsageLine, CRITICAL_PERCENT, WARN_PERCENT, accountUsageEntry, formatReset, formatSpend,
} from './AccountUsageLine.tsx'
export type { AccountUsageLineProps } from './AccountUsageLine.tsx'
export type { AccountUsageKey } from './locales.ts'
export type * from '../types.ts'

/** Dictionary namespace owned by this plugin. */
const NS = 'accountUsage'

/** Required browser services: the slot registry, locale, and the Remote namespace. */
export const inject = ['locale', 'slots', 'remote', 'remote.accountUsage']

/**
 * Client plugin body: register the dictionaries, start the page's feed, and
 * seat the reading on the composer dock strip.
 * @param ctx - client root context carrying `locale`, `slots`, and the Remote face.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'account-usage: dictionaries')

  const feed = createAccountUsageFeed(ctx.remote)
  ctx.effect(() => () => { feed.dispose() }, 'account-usage: feed')

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'account-usage',
    order: 10,
    locale: NS,
  }, accountUsageEntry(feed)))
}

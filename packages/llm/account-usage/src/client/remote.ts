/**
 * The slice of the Client Remote this package calls: the generated
 * `accountUsage` method by name, so the feed is testable against a scripted
 * face instead of a live carrier.
 */
// Merges the generated `accountUsage` namespace into the Remote face.
import type {} from '@deepseek-ai/dsh-account-usage/remote'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'

/** The `accountUsage` namespace methods this package calls. */
export type AccountUsageNamespace = Pick<ClientRemote['accountUsage'], 'read'>

/** The Client Remote as this package sees it. */
export interface AccountUsageRemote {
  /** The `accountUsage` namespace. */
  readonly accountUsage: AccountUsageNamespace
}

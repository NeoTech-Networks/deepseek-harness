# Account usage

English | [中文](account-usage.zh.md)

How much of a subscription account's own rate limits the operator has already consumed, owned by [`@deepseek-ai/dsh-account-usage`](../../packages/llm/account-usage). A provider that authorizes by subscription grant rather than by API key meters a rolling short window and a weekly window, and neither is visible in a session, so the first sign of exhaustion is normally a refusal mid-turn. The service reads the stored grant, asks the account for its own figures, and answers with percentages and reset instants; the package's browser half seats them on the composer dock strip.

Sources: [`packages/llm/account-usage/src/index.ts`](../../packages/llm/account-usage/src/index.ts), [`packages/llm/account-usage/src/usage-endpoint.ts`](../../packages/llm/account-usage/src/usage-endpoint.ts)

## What crosses the wire

The grant never leaves the Host: the credential record is read and used in the same call, and the answer has no member a token could ride in. What crosses is two whole percentages, their reset instants, any weekly window scoped to part of the account, and the month's pay-as-you-go spend.

## Degraded answers

Nothing here fails loudly. An expired grant answers `stale` and waits for the adapter that owns it to refresh it during its next model call, because a second refresher racing that one can revoke a token an in-flight request is still using. A refusal answers `unauthorized`, any other fault answers `error`, and both carry the last figures that were actually read. A deployment with no subscription grant answers `unsupported`, which is what makes the browser surface render nothing.

## Cost

One cache entry and one in-flight read are shared by every caller, so several open windows cost one upstream request per cache window.

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxaccountusage--accountusage"></a>

### `ctx.accountUsage` — `AccountUsage`

Host Remote service reporting the signed-in subscription account's usage.

```ts cordis-catalog
/**
 * Report how much of the subscription account's limits are consumed.
 *
 * Cheap to call repeatedly: the answer is cached for the configured window
 * and concurrent callers share one upstream read.
 * @returns the current snapshot, whatever state the account read is in.
 */
@Remote async read(): Promise<AccountUsageSnapshot>
```

Source: [`packages/llm/account-usage/src/index.ts`](../../packages/llm/account-usage/src/index.ts)
<!-- END GENERATED cordis-surface -->

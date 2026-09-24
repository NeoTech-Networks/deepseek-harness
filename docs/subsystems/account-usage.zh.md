# 账号用量

[English](account-usage.md) | 中文

订阅账号自身的限流窗口已经被消耗了多少，由 [`@deepseek-ai/dsh-account-usage`](../../packages/llm/account-usage) 拥有。以订阅授权（而非 API key）鉴权的服务商会计量一个滚动短窗口和一个每周窗口，这两个数字在会话里都看不到，因此用尽额度的第一个信号通常是回合进行到一半被拒绝。本服务读取已保存的授权凭证，向账号索取它自己的数字，并以百分比和重置时间作答；本包的浏览器侧把它们放在输入框下方的信息条上。

来源：[`packages/llm/account-usage/src/index.ts`](../../packages/llm/account-usage/src/index.ts)、[`packages/llm/account-usage/src/usage-endpoint.ts`](../../packages/llm/account-usage/src/usage-endpoint.ts)

## 跨越 wire 的内容

凭证绝不离开 Host：凭证记录在同一次调用中被读取并使用，答案中没有任何可以携带令牌的成员。跨越 wire 的是两个整数百分比、它们的重置时间、按范围划分的每周窗口，以及本月的按量付费支出。

## 降级的答案

这里没有任何东西会抛错。过期的凭证回答 `stale` 并等待拥有它的适配器在下一次模型调用时刷新它，因为第二个刷新者与之竞争可能作废某个仍在进行中的请求正在使用的令牌。被拒绝回答 `unauthorized`，其他任何故障回答 `error`，两者都携带最后一次真正读到的数字。没有订阅授权的部署回答 `unsupported`，这正是浏览器界面不渲染任何内容的原因。

## 开销

一个缓存条目和一个进行中的读取由所有调用者共享，因此多个打开的窗口在每个缓存窗口内只产生一次上游请求。

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.zh.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

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

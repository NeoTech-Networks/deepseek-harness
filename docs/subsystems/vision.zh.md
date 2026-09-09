# Vision

[English](vision.md) | 中文

为纯文本模型会话提供自动图像描述，由 [`@deepseek-ai/dsh-vision-routing`](../../packages/vision/vision-routing) 拥有。纯文本模型（`deepseek-v4-pro` 或 `deepseek-v4-flash`）无法接受图像输入，否则提示接纳会拒绝该消息。该服务用可接受图像的视觉模型描述所附图像并返回文本，接纳会把该文本作为同一用户消息中的额外文本块追加。

Sources: [`packages/vision/vision-routing/src/index.ts`](../../packages/vision/vision-routing/src/index.ts)

## Gating

除非 `subagent-model-selection` 用户设置（「允许 Agent 为 Subagent 选择模型」开关）已启用且至少命名一个候选路由，否则该服务处于不活跃状态。视觉路由是第一个其模型声明 `image` 输入的被允许路由；若都不符合，则回退到配置的 `visionRoute`（`deepseek-official` / `deepseek-v4-flash-vision-exp`）。开关关闭时，纯文本选择保持现有的「Model does not support image input」拒绝。

## Describe call

`describe(refs, signal?)` 构建一条用户消息，携带按顺序排列的图像引用和描述要点，流式经过视觉路由，并返回拼接后的文本。终止错误、中止或达到最大 token 的完成会抛出 `VisionDescriptionError`，提示接纳将其视为可恢复：消息仍会发送，并附带简短的「description unavailable」说明。

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.zh.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxvisionrouting--visionrouting"></a>

### `ctx.visionRouting` — `VisionRouting`

The automatic image-description service, registered as `ctx.visionRouting`.

```ts cordis-catalog
/**
 * Whether automatic image description is switched on: the subagent-model-selection
 * preference is enabled and names at least one candidate route. A misconfigured
 * preference (enabled but no image-capable route) still reports true here; the
 * route resolution in {@link describe} owns the precise capability check.
 * @returns true when describe() may run; false keeps the caller's current behavior.
 */
enabled(): boolean

/**
 * Describe one ordered image batch with the vision model.
 * @param refs - durable image references, in attachment order.
 * @param signal - optional cancellation fused into the internal deadline.
 * @returns the model-facing description text; empty when `refs` is empty.
 * @throws VisionDescriptionError when no image-capable route exists or the call fails.
 */
async describe(refs: readonly ImageAttachmentRef[], signal?: AbortSignal): Promise<string>
```

Types: [ImageAttachmentRef](attachment.zh.md)

Source: [`packages/vision/vision-routing/src/index.ts`](../../packages/vision/vision-routing/src/index.ts)
<!-- END GENERATED cordis-surface -->

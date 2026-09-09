# Vision

English | [中文](vision.zh.md)

Automatic image description for text-only model sessions, owned by [`@deepseek-ai/dsh-vision-routing`](../../packages/vision/vision-routing). A text-only model (`deepseek-v4-pro` or `deepseek-v4-flash`) cannot accept image input; prompt admission would otherwise reject the message. The service describes the attached image with an image-capable vision model and returns text, which admission appends as an extra block in the same user message.

Sources: [`packages/vision/vision-routing/src/index.ts`](../../packages/vision/vision-routing/src/index.ts)

## Gating

The service is inert unless the `subagent-model-selection` user setting (the "Allow agents to choose models for subagents" toggle) is enabled and names at least one candidate route. The vision route is the first allowed route whose model declares `image` input; when none qualifies, it falls back to the configured `visionRoute` (`deepseek-official` / `deepseek-v4-flash-vision-exp`). A text-only selection with the gate off keeps the existing "Model does not support image input" rejection.

## Describe call

`describe(refs, signal?)` builds one user message carrying the ordered image references plus the describe rubric, streams it through the vision route, and returns the assembled text. A terminal error, aborted, or max-token finish raises `VisionDescriptionError`, which prompt admission treats as recoverable: the message is still sent with a short "description unavailable" note.

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

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

Types: [ImageAttachmentRef](attachment.md)

Source: [`packages/vision/vision-routing/src/index.ts`](../../packages/vision/vision-routing/src/index.ts)
<!-- END GENERATED cordis-surface -->

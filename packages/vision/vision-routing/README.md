---
description: "Automatic image description for text-only model sessions: prompt admission describes attached images through an image-capable route instead of refusing them; for operators who escalate to a text-only model such as deepseek-v4-pro."
kind: "package-reference"
---

# @deepseek-ai/dsh-vision-routing

English | [中文](README.zh.md)

## Summary

Lets a session running a text-only model, such as `deepseek-v4-pro`, accept attached images. Prompt admission sends the images to an image-capable route (`deepseek-flash` by default) and replaces them with that model's written description, so the conversation continues instead of failing with "Model does not support image input". It stays inert until the subagent model-selection preference is enabled with at least one route. The cost is one extra model call per image-bearing prompt, and the text-only model only ever sees the description.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount one Host row next to `subagent-model-selection-settings`; the shipped web-app bundle already does.

```yaml
- id: vision-routing
  name: '@deepseek-ai/dsh-vision-routing'
```

### When it acts

Only when three things hold: the prompt carries an image, the session's selected model declares no `image` input, and the `subagent-model-selection` preference is enabled and names at least one route. The vision route is the first allowed route whose model declares `image` input; when none qualifies it falls back to `visionRoute`. With the preference off, a text-only selection keeps the upstream refusal. An image-capable selection never reaches this package.

### Configuration

All fields are optional.

| Field | Default | Meaning |
| --- | --- | --- |
| `visionRoute.provider` | `deepseek-official` | Vision-model provider |
| `visionRoute.model` | `deepseek-flash` | Vision-model id |
| `prompt` | describe rubric | Instruction sent with the images |
| `maxTokens` | `4096` | Output-token cap for one description |
| `timeoutMs` | `60000` | End-to-end deadline for one description |

The generated [configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-vision-routing) is the exhaustive source for every accepted field.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals, click to expand</summary>

The plugin registers `ctx.visionRouting` with two methods. `enabled()` reports whether the gate is on. `describe(refs, signal?)` sends one ordered image batch plus the describe rubric to the resolved route and returns the text, or throws `VisionDescriptionError` when no image-capable route exists or the call fails.

The consumer is prompt admission in `dsh-api-session-controller`: inside its `hasImage` check, a text-only selection with an enabled service no longer throws. After attachments are admitted, every image block is removed and one text block is appended, `[Attached image description (vision model): ...]`, or `[Attached image description unavailable: <reason>]` when describing failed, so a failure keeps the send instead of rejecting it.

The describe request carries its own message-source kind, `vision-routing`, declared on `MessageSourceMap` and qualified with `@persistenceAttribution`. The request is never written to a Session log; the recorded prompt keeps the `user` kind.

</details>

-----

<a id="model-experience"></a>
## Model Experience

### Image described for a text-only model

#### What the model sees

The user message the text-only model receives holds the prompt text followed by one appended block; the original image blocks are gone.

##### Described image

```markdown
[Attached image description (vision model): <description of Image 1..N>]
```

##### Description failed

```markdown
[Attached image description unavailable: <reason>]
```

#### Token effect

Each image-bearing prompt adds one description, bounded by `maxTokens` on the vision call, in place of image input the model could not read.

#### KV Cache effect

Append-only; the description is part of the new user message and does not invalidate existing KV Cache entries.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Gate borrowed from subagent routing.** The switch is the subagent model-selection preference rather than a setting of its own, so enabling one enables the other.
- **One description per prompt.** All images in a prompt are described together; the text-only model cannot ask a follow-up question about an image.
- **No streaming feedback.** The prompt waits for the description before it is queued, up to `timeoutMs`.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers, click to expand</summary>

The design record is the [vision routing Agent Note](../../../.agents/notes/implemented/feature/2026-09-08-vision-routing.md). The persistence acknowledgement for the new source kind is [2026-09-24-vision-routing-source](../../../docs/persistence-changes/2026-09-24-vision-routing-source.md).

</details>

**Runtime invariant:** No companion is published. This Host service owns no durable event stream or mutable runtime data of its own: it resolves the gating preference and the exact vision route per call, and the description it returns is persisted by prompt admission as part of the user message.

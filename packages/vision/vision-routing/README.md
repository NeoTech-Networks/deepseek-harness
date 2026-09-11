# @deepseek-ai/dsh-vision-routing

English | [中文](README.zh.md)

Automatic image description for text-only model sessions.

## What it does

A text-only model (`deepseek-v4-pro`) cannot accept image
input. When the user attaches an image to such a session, prompt admission would
otherwise reject the message ("Model does not support image input"). This Host
plugin instead describes the attached image with an image-capable vision model
(`deepseek-flash` by default) and returns model-facing text, so the
main model can act on the image content.

## Gating

The plugin is inert unless the `subagent-model-selection` user setting (the
"Allow agents to choose models for subagents" toggle) is enabled and names at
least one candidate route. The vision route is the first allowed route whose
model declares `image` input; when none qualifies it falls back to the configured
`visionRoute`. This reuses the operator's existing sub-agent model authorization,
so there is no separate settings card.

## Configuration

All fields are optional.

| Field | Default | Meaning |
| --- | --- | --- |
| `visionRoute.provider` | `deepseek-official` | Vision-model provider |
| `visionRoute.model` | `deepseek-flash` | Vision-model id |
| `prompt` | describe rubric | Instruction sent with the images |
| `maxTokens` | 4096 | Output-token cap for one description |
| `timeoutMs` | 60000 | End-to-end deadline for one description |

## Service

The plugin registers `ctx.visionRouting`:

- `enabled()` returns whether automatic description is switched on.
- `describe(refs, signal?)` runs the vision model over one ordered image batch
  and returns the description text, or throws `VisionDescriptionError` when no
  image-capable route exists or the call fails.

Prompt admission treats a `VisionDescriptionError` as recoverable: the message is
still sent with a short "description unavailable" note instead of being rejected.

## Runtime invariant

No companion is published. This Host service owns no durable event stream or
mutable runtime data of its own: it resolves the gating preference and the exact
vision route per call, and the description it returns is persisted by prompt
admission as part of the user message rather than in a package-local stream.

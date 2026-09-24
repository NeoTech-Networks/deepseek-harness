# Agent Note: Automatic image description for text-only models

Status: implemented

English | [中文](2026-09-08-vision-routing.zh.md)

## Problem

A text-only model (`deepseek-v4-pro` or `deepseek-v4-flash`) cannot accept image input. Prompt admission rejected an image-bearing message with "Model does not support image input", so the user had to switch the session to the vision model just to read an attached screenshot, then switch back.

## Decision

A new Host plugin `@deepseek-ai/dsh-vision-routing` registers `ctx.visionRouting` with `enabled()` and `describe(refs, signal?)`. Prompt admission now, for a text-only selection, admits the images durably and then appends the vision model's description as an extra text block in the same user message, instead of rejecting it. The description is logged as part of the user message, so it is model-visible and reconstructable; the image block stays in the message so read-back and export keep working.

The behavior is gated by the existing `subagent-model-selection` user setting (the "Allow agents to choose models for subagents" toggle). It is active only when that preference is enabled and names at least one candidate route. The vision route is the first allowed route whose model declares `image` input, falling back to the configured `visionRoute` (`deepseek-official` / `deepseek-v4-flash-vision-exp`). A failed describe call appends a short "description unavailable" note instead of rejecting the send, and a text-only selection with the gate off keeps the current rejection.

## Alternatives considered

**A dedicated settings card.** A separate toggle would duplicate the sub-agent model authorization the operator already set, and would add settings surface for a behavior that is naturally "the vision model is an allowed sub-agent".

**A sub-agent run per image.** A full sub-agent loop is heavier than one vision-model call and risks recursion; the description is a single describe-image call, not a delegated coding task.

**A new session event for the description.** The description is already persisted as a user-message text block, so a dedicated event type and projection would add session-format surface without new capability.

## Consequences

Each attached image on a text-only session costs one vision-model call at send time. Prompt admission for those sessions is slower by that call. The image block remains in the message, so the text-only dispatch still emits the `[image omitted...]` placeholder beside the description text block; both reach the model.

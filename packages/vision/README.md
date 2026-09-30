---
description: "The vision group map: automatic image description for text-only model sessions, for users and maintainers navigating the group."
kind: "package-group"
---

# packages/vision

English | [中文](README.zh.md)

## Summary

The vision group gives a text-only model session borrowed eyes. When the user attaches an image to a session whose model cannot accept image input, the group's Host service describes the image with an image-capable vision model and returns model-facing text, so prompt admission can hand the main model a description instead of rejecting the image. The behavior is gated by the `subagent-model-selection` user setting, reusing the operator's existing sub-agent model authorization rather than a new settings card.

## Table of Contents

- [Packages](#packages)
- [Related documentation](#related-documentation)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`vision-routing`](vision-routing/README.md) | Resolves the gating preference and vision route, runs the describe call | `ctx.visionRouting` |

-----

<a id="related-documentation"></a>
## Related documentation

- [Vision subsystem](../../docs/subsystems/vision.md): the gating preference, route resolution, and the describe call contract.

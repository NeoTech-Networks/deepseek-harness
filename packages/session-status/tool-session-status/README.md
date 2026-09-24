---
description: "The model-facing set_session_status tool over the DeepSeek Harness session-status domain, for users and maintainers choosing, configuring, or debugging the tool."
kind: "package-reference"
---

# @deepseek-ai/dsh-tool-session-status

English | [中文](README.zh.md)

## Summary

`dsh-tool-session-status` gives the model one tool, `set_session_status`, that appends a whole-value `session/status` event to the calling agent's session. The status enum is built from the live session-status vocabulary plus a `clear` sentinel, so a model cannot invent an id the deployment does not declare. The status clears automatically on the operator's next prompt.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)

-----

<a id="use-this-package"></a>
## Use this package

Mount it beside `@deepseek-ai/dsh-session-status`, which provides the vocabulary and the `sessionStatus` service the tool injects. There is no configuration: the vocabulary lives in the sibling domain package.

### What each call does

A call with a vocabulary id appends the whole status value and returns the resolved `{ id, label, icon, tone }`. A call with `clear` appends the null event. A call without an owning agent session is rejected. The tool is present and identical on every provider route, because it is a harness tool rather than a model behaviour.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

The plugin is a namespace plugin (`name` / `inject` / `apply`, no default export) that injects `['tools', 'sessionStatus']` and registers `set_session_status` with the enum read from `ctx.sessionStatus.list()`. The tool's `execute` delegates to `ctx.sessionStatus.set` / `clear`, so the vocabulary validation and the durable append stay in the domain package. See [src/index.ts](src/index.ts).

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.md): the sibling group page and its package table.
- [Generated tool catalog](../../../docs/tool-catalog.md#deepseek-aidsh-tool-session-status): the `set_session_status` schema the model receives.

-----

<a id="model-experience"></a>
## Model Experience

### Tool schema

#### What the model sees

The model sees the generated [`set_session_status` schema](../../../docs/tool-catalog.md#deepseek-aidsh-tool-session-status): a required `status` string whose enum is the live vocabulary plus `clear`, and an optional `note` string. The description names the shipped statuses and the clear-on-prompt rule.

#### Token effect

Fixed schema cost on every request where the tool is visible; the enum is stable for a given vocabulary.

#### KV Cache effect

Prefix-stable while the definition and vocabulary are unchanged.

### Tool-call history and result

#### What the model sees

A successful call returns `{ status }`, either the resolved `{ id, label, icon, tone }` or `null` after `clear`. A call without an owning agent session, or with an id outside the enum, is rejected.

#### Token effect

The call arguments and the small structured result remain until compaction.

#### KV Cache effect

Append-only; newly visible content follows the reusable request prefix.

## Runtime invariant

No companion is published. The tool delegates vocabulary validation and the durable append to the session-status domain and registers one stateless tool, so there is no independent observation for a runtime companion to compare against.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Clears on any human prompt** — the status does not survive the operator's next message by design; there is no sticky mode.
- **Enum is vocabulary-bound** — a deployment that changes its vocabulary mid-session leaves a previously logged status's id outside the new enum, but the logged value stays intact.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

None.

</details>

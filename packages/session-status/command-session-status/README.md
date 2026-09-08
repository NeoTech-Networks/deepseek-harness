---
description: "The human-facing /status slash command over the DeepSeek Harness session-status domain, for users and maintainers choosing, configuring, or debugging the command."
kind: "package-reference"
---

# @deepseek-ai/dsh-command-session-status

English | [中文](README.zh.md)

## Summary

`dsh-command-session-status` registers the human `/status` command: bare `/status` reports the current status and the legal next ids, `/status <id>` sets one, and `/status clear` clears it. An unknown id is a rendered error, never a thrown failure.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)

-----

<a id="use-this-package"></a>
## Use this package

Mount it beside `@deepseek-ai/dsh-session-status` and a command registry. There is no configuration.

### What each command does

`/status` shows the current status plus `Available: <ids> | clear`. `/status stuck` appends the whole `stuck` status. `/status clear` appends the null event. `/status banana` returns a rendered error naming the unknown id.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

The plugin is a namespace plugin (`name` / `inject` / `apply`, no default export) that injects `['commands', 'sessionStatus']` and registers a `status` command. Its handler resolves the id through `ctx.sessionStatus` and returns a `CommandResult`; it never throws for an unknown id. See [src/index.ts](src/index.ts).

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.md): the sibling group page and its package table.

-----

<a id="model-experience"></a>
## Model Experience

### Human `/status` control

#### What the model sees

The slash input, mutation, and direct status output are absent from model requests. The domain records the mutation as a `session/status` event; no presentation text is logged.

#### Token effect

Reading status, setting or clearing it, or receiving a direct command error adds no model tokens.

#### KV Cache effect

Command discovery, mutations, and direct output do not affect the cache.

## Runtime invariant

No companion is published. The command delegates vocabulary validation and the durable append to the session-status domain and registers one stateless command, so there is no independent observation for a runtime companion to compare against.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Plain-text interaction only** — the generic command registry has no modal picker; `/status` is the portable set/clear surface.
- **Clears on any human prompt** — the status does not survive the operator's next message by design.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

None.

</details>

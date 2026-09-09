---
description: "The durable declared session status (waiting to deploy, stuck, finished) over the DeepSeek Harness session log: the session/status event, the sessionStatus projection, and the resolving service, for users and maintainers choosing, configuring, or debugging session status."
kind: "package-reference"
---

# @deepseek-ai/dsh-session-status

English | [中文](README.zh.md)

## Summary

`dsh-session-status` gives a session a durable, model-independent status that the sidebar can show at a glance. The agent or the operator declares a status such as `waiting-production`, `stuck`, or `finished`, and the value rides the session log so it survives reload, resume, and fork. A human prompt clears it, because the prompt answers whatever the status was holding for. The status is whole-value log state: the event carries the complete label, icon and tone, so editing the vocabulary later cannot change a row already logged.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Use this package when a session must show a declared status on its sidebar row without reading model text. Mount it wherever the sibling tool or command packages, or a controller route, must resolve and append statuses.

### When to choose it

Choose it when the status vocabulary is small, operator-authored, and whole-value. The domain records status and clears it on human input, and does nothing else: it never guesses a status from turn outcomes, and it never expires a status on its own.

### Minimal configuration

`vocabulary` is optional with the shipped default. Every entry is `{ id, label, icon, tone }`; `id` is kebab-case and unique, `icon` is one of `right-up`, `stop`, `check`, `clock`, or `pause`, and `tone` is one of `attention`, `error`, `success`, or `neutral`.

```yaml
- name: '@deepseek-ai/dsh-session-status'
  config:
    vocabulary:
      - { id: waiting-production, label: 'Waiting on you: deploy to production', icon: right-up, tone: attention }
      - { id: stuck, label: Stuck, icon: stop, tone: error }
      - { id: finished, label: Finished, icon: check, tone: success }
      - { id: waiting-external, label: 'Waiting on someone else', icon: clock, tone: attention }
      - { id: paused, label: Paused, icon: pause, tone: neutral }
```

| Field | Default | Meaning |
|---|---|---|
| `vocabulary` | the five shipped statuses | The allowed statuses; ids must be unique, and every icon and tone must be in its allowlist |

### What each operation does

`set(session, id, note?)` appends a `session/status` event carrying the whole vocabulary entry; an id outside the vocabulary is rejected with an error rather than silently dropped. `clear(session)` appends the null event. `list()` returns the vocabulary in declaration order, and `current(session)` reads the folded projection for a session. Any human-authored `user/message` clears the status.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

### Design commitments

- **Whole-value, log-backed state.** The `session/status` event carries the complete `{ id, label, icon, tone }` so a later vocabulary edit cannot retroactively rewrite a logged row. Durability, replay, resume and fork all reconstruct from the log.
- **The human prompt is the clear signal.** The fold clears on any `user/message` whose source is `user`, because a prompt answers the hold the status described. Plugin, tool, model, and goal-sourced user messages never clear it.
- **Deployment vocabulary, validated loud.** The vocabulary is a plugin `Config` field, not a hardcoded table, and a malformed entry fails the plugin load.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry: vocabulary validation, the `sessionStatus` projection unit, and the resolving `SessionStatusService` |
| [`src/types.ts`](src/types.ts) | The one home of the `sessionStatus` projection-key declaration and its payload types |
| [`src/fold.ts`](src/fold.ts) | The pure event fold, free of cordis and zod, for direct unit coverage |
| [`src/client.ts`](src/client.ts) | Client-namespace re-export of the types outlet |

### Session projection

When `ctx.sessionProjections` is mounted, this package registers the `sessionStatus` unit. The key merges into `SessionProjectionMap` here, and carriers serve the value on the history tail page and the `session/projection` push frame, so a cold sidebar row reads the status without the session being opened.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.md): the sibling group page and its package table.
- [Session status subsystem](../../../docs/subsystems/session-status.md): the `session/status` event, `sessionStatus` projection, and the status vocabulary types.
- [Generated configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-session-status): every accepted config field and its source declaration.
- [session-status Agent Note](../../../.agents/notes/proposed/feature/2026-09-07-session-status.md): the design record.

-----

<a id="model-experience"></a>
## Model Experience

None, as the status service registers no tool or prompt and the sessionStatus projection serves client-facing read models of already-logged session state.

#### KV Cache effect

None; the projection never assembles or sends a provider request.

## Runtime invariant

No companion is published. The vocabulary is validated at plugin load and the status id at the `set` boundary, and the `sessionStatus` projection folds the whole-value event, so there is no independent mutable relationship for a runtime companion to cross-check.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Declared only, never guessed.** The domain does not derive a status from turn outcomes, timers, or model text; a session that never declares a status shows none.
- **Clears on any human prompt.** A status does not survive the next human message by design; there is no "sticky until acknowledged" mode.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

The goal-phase fallback (a `blocked` goal mapping to `stuck`, a `complete` goal to `finished`) is deliberately implemented in the client row derivation, not here: the goal projection is its own domain and the mapping is presentation-only.

</details>

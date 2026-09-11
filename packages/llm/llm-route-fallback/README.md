---
description: "Tool-schema route fallback: moves a request from the flash route onto the pro route when its assembled tool schemas exceed a byte limit, instead of shrinking or truncating a schema, for users and maintainers configuring or debugging the plugin."
kind: "package-reference"
---

# @deepseek-ai/dsh-llm-route-fallback

English | [中文](README.zh.md)

## Summary

This package keeps a large tool schema out of the flash route. It measures the combined UTF-8 byte size of a step's assembled `tools[].function.parameters`, and when that measurement exceeds a configured limit on a configured route, it returns the pro route for that request instead. Nothing is truncated, rewritten, or re-serialized, and the decision is taken before the loop logs its request header, so the durable `request/header` and `request/context` events name the route that actually ran.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount this plugin beside an agent loop and a DeepSeek adapter when a request that asks for many or large tool schemas must not be sent to the cheap route. Mounting it is the whole installation: it reads no service, stores nothing, and adds no tool, command, prompt section, or session event.

### When to choose it

Choose it when an oversized tool schema is a failure you want handled by changing route rather than by changing the schema. Do not choose it when the cheaper route is a hard requirement for cost reasons: the guard deliberately spends more per call to keep the full schema. Do not expect it to protect every provider either: it acts on one configured provider route pair, and a request on any other provider is untouched.

### Configuration

Mount it with configuration when the defaults do not match the deployment:

```yaml
- name: '@deepseek-ai/dsh-llm-route-fallback'
  config:
    enabled: true
    provider: deepseek-official
    from: [deepseek-flash, deepseek-v4-flash]
    to: deepseek-v4-pro
    limitBytes: 3000
```

| Field | Default | Meaning |
|---|---|---|
| `enabled` | `true` | Master switch; `false` leaves every request exactly as the agent declared it |
| `provider` | `deepseek-official` | The only provider route the fallback acts on |
| `from` | `[deepseek-flash, deepseek-v4-flash]` | Models the fallback moves a request off. A list, so the live id and a legacy alias are both protected |
| `to` | `deepseek-v4-pro` | Model the fallback moves a qualifying request onto |
| `limitBytes` | `3000` | Combined UTF-8 byte size of the tools' `function.parameters` above which the route moves; the comparison is exclusive |

A missing field takes its default. A field that is present but unusable fails plugin load loudly: an empty `provider` or `to`, an empty or duplicated `from`, a `limitBytes` that is not a positive integer, or a `to` that also appears in `from`. The generated [configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-llm-route-fallback) documents every accepted value.

### What you get

With the defaults, a step whose tool schemas total more than 3,000 bytes and whose agent asked for `deepseek-flash` (or the legacy `deepseek-v4-flash`) is sent to `deepseek-v4-pro` instead. The session log then shows `deepseek-v4-pro` for that step even though the model picker still shows the route the operator chose, because the header records the route that really ran. The model sees the same tools, the same prompt, and the same schema bytes; only the route changed.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

This section explains where the decision is taken and why that placement is load-bearing; the observable behavior is fully covered in [Use this package](#use-this-package).

### Design commitments

- **A route change, never a schema change.** The guard adds no truncation, no summarization, and no re-serialization of a schema. The only thing it can alter is the model id a request goes out on.
- **The decision precedes the record.** The agent loop assembles the system prompt and the tool schemas in its pre-step, then resolves its call configuration through the `agent/request` waterfall, and only afterwards logs the canonical `request/header` and any `request/context` change. The waterfall therefore decides the route the log will record, which is what makes a silent fallback impossible.
- **Prepend, so the resolved route is the input.** The listener is registered `prepend`, which runs it in front of every other `agent/request` listener, including the model-selection middleware that applies the operator's chosen model. The guard reads the route the request would really use and returns its own only when that route qualifies.
- **Pure decision, thin plugin.** The measurement and the decision are pure functions over `(resolved route, assembled tools, configuration)`; the plugin only wires them to the event and writes one log line.

### The gates, in order

A request keeps its declared route at the first gate it fails, and the outcome names that gate: `disabled` (the master switch is off), `provider` (another provider), `route` (a model the fallback does not move off), `tools` (the step assembled none), `under-limit` (the measurement did not exceed the limit). Only when every gate passes does the request move, and the outcome then carries the measured bytes and the threshold so a log line or a test can quote both.

### Measurement

`toolParameterBytes` sums `Buffer.byteLength(JSON.stringify(tool.parameters), 'utf8')` over the tools, which is the exact quantity the DeepSeek adapter maps into `WireTool.function.parameters` with no transformation between assembly and the wire. `ToolSchema.parameters` is a JSON Schema object by contract, so every tool contributes a string.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry: `Config` schema, fail-loud resolution, the `agent/request` listener |
| [`src/measure.ts`](src/measure.ts) | The pure measurement (`toolParameterBytes`) and decision (`planRouteFallback`) |
| [`src/types.ts`](src/types.ts) | `Config`, its resolved form, the request facts, and the outcome vocabulary |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the plugin's own contract is not enough. They move from the waterfall it listens on to the streaming layer and the model routes it chooses between.

- [LLM streaming subsystem](../../../docs/subsystems/llm-streaming.md): the adapter registry, the call configuration, and the streaming dispatch the route selects.
- [llm group map](../README.md): the sibling adapter, retry, metering, and usage packages.
- [Generated configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-llm-route-fallback): every accepted config field and its source declaration.

-----

<a id="model-experience"></a>
## Model Experience

None, as the plugin changes only which model answers and registers no prompt section, tool schema, or message.

#### KV Cache effect

A moved request changes `model`, which is part of the cache prefix identity, so that request cannot reuse the inherited prefix and pays a cache write; its messages, system prompt, and tool schemas are otherwise sent unchanged, and the decision is reevaluated per request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

These limits define when the fallback is a poor fit. They are current package constraints and open decisions, not a task backlog.

- **The threshold is a configured requirement, not a measured provider limit.** The provider's Chat Completions reference documents no size limit for `tools[].function.parameters`, and a live probe of 4,734 parameter bytes was accepted on both current routes (see the Dev Note). The default of 3,000 bytes is the deployment's chosen budget.
- **The running app does not surface the move.** The log tells the truth about the route; the model picker still shows the route the operator chose, so a human comparing the two sees a difference with no in-app explanation.
- **Cost moves the wrong way.** A qualifying request uses the more expensive model by design.
- **One provider route pair.** A deployment serving the same models under another provider id is not covered by the default configuration.
- **The destination route is not validated at load.** A `to` id the provider does not serve fails at dispatch as a terminal request error rather than at plugin load, because route registration is asynchronous.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

This Dev Note is working context for maintainers. Shipped behavior, limits, and accepted rationale live in the sections above, the package code, and the linked Agent Note.

The design record is [the route fallback Agent Note](../../../.agents/notes/implemented/feature/2026-09-11-llm-route-fallback.md). It records the two candidate gateways this work could have targeted, the live evidence that ruled one out, and the Phase 1 probe result that the failure this guard protects against did not reproduce.

</details>

**Runtime invariant:** No companion is published. The plugin owns one `agent/request` listener whose only effect is the call configuration it returns, and that decision is a pure function of the resolved route, the step's assembled tool schemas, and the plugin's own validated configuration, so there is no independent mutable relationship for a companion to cross-check.

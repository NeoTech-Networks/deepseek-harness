# Agent Note: Tool-schema route fallback

Status: implemented

English | [中文](2026-09-11-llm-route-fallback.zh.md)

## Problem

A deployment wanted a request carrying large tool schemas to stop using the cheap flash route: the requirement was that when the combined `function.parameters` byte size of a request's tools exceeds 3000 on `deepseek-v4-flash`, the gateway must fail over to `deepseek-v4-pro` rather than truncating a schema, and the failover must be recorded rather than silent.

Two things had to be settled before anything could be built. First, which of the two live systems is "the gateway": the harness's own DeepSeek layer (which carries tool schemas) or the fleet's Railway `Agents` service (which has a flash/pro pair and a failover ladder, but whose `GenerateRequest` carries no tools at all, so the requirement cannot apply to it without first adding tool support to its API). Second, whether the failure the guard protects against is real: a live probe on 2026-09-11 sent 4734 parameter bytes to `deepseek-flash`, `deepseek-v4-flash`, and `deepseek-v4-pro`, streaming and non-streaming, and every arm returned HTTP 200, while the provider's Chat Completions reference documents no size limit on `tools[].function.parameters`.

## Decision

The harness's DeepSeek layer is the target, and the guard is a new plugin, `@deepseek-ai/dsh-llm-route-fallback`, listening on the `agent/request` waterfall with `prepend`. It measures the combined UTF-8 bytes of the step's assembled tool parameters and, when they exceed a configured limit on a configured route, returns the configured `to` model for that request. It never truncates, rewrites, or re-serializes a schema.

The placement is the load-bearing part. The loop assembles the tools in its pre-step, resolves the call configuration through `agent/request`, and only then logs `request/header` and any `request/context` change, so a decision taken here is a decision the durable log records. To make that possible the waterfall payload gained the assembled `tools`, which also means the operator's model-selection middleware (a later, non-prepended listener) resolves before the guard decides and cannot undo it.

## Alternatives considered

**Put the guard in the fleet's `Agents` service.** It already has the flash/pro pair and a rung ladder, but its request has no tool schemas, so the requirement's subject does not exist there.

**Put the guard in the DeepSeek adapter, or in an `llm/stream` wrapper.** Both work mechanically and keep the loop untouched, but both decide after the loop has logged its header, so the log would name the requested model while the wire used another. That breaks the reconstruction contract that every conversation request is a pure function of the log, which is a worse outcome than the small core change this design needed.

**Truncate or summarize the schema.** Rejected as the behaviour the requirement explicitly rules out.

## Consequences

The `agent/request` payload carries `tools` for every dispatcher, so the four test sites that dispatch the waterfall directly now pass `tools: []`. The route the log records can differ from the route the model picker shows, which is stated as a limitation rather than papered over. A moved request cannot reuse the inherited cache prefix. The default threshold and the two route ids are config, not code: `deepseek-flash` and its legacy alias `deepseek-v4-flash` are both `from` routes, because the provider still serves the old id for the same underlying model at the Flash price.

---
description: "The right Sidebar's Sessions tab type for the dsh web client: a cross-workspace session list with active sessions first, an Active/All filter, and click-to-open."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sessions-panel

English | [中文](README.zh.md)

## Summary

The right Sidebar's Sessions tab: one list of every session across every workspace, active sessions first. It re-derives the "active vs idle" classification on its own from the session list and pending interactions, so a running session or one waiting for the operator is visible without hunting through the left sidebar's workspace folders. The Active/All filter defaults to active-only. Clicking a row opens that session. The left sidebar keeps its workspace grouping unchanged.

## Table of Contents

- [What it registers](#what-it-registers)
- [How it derives rows](#how-it-derives-rows)
- [Navigation](#navigation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="what-it-registers"></a>
## What it registers

- **The type** — `ctx.sidebarRightTabs.register(...)` with id `@deepseek-ai/dsh-client-ui-sessions-panel` (this implementation's identity, and the key its body registers under), kind `sessions`, band `builtin`. A page type: it recognizes no resource address and is opened by kind. It contributes one guide entry so the panel is reachable from the guide page's doorway.
- **The body** — the keyed `sidebar.right.pane.tab` seat under the type's id. A fixed Active/All filter header sits over one scrolling list of rows, each a status dot, the session title, its workspace label, and a relative time. The body owns only its filter as local state; every fact it reads arrives through global framework hooks (`useSessions`, `useSessionPendingInteraction`, `useWorkspaces`) and the single injected `open` action.

<a id="how-it-derives-rows"></a>
## How it derives rows

`deriveSessions` (in `active.ts`) is a pure function over the session list snapshot, the archive set, and pending interactions. Visibility mirrors the left sidebar: subagent rows are folded into their parents (never listed), archived rows are hidden, and only the selected blank row shows. A session is active when it has a pending interaction (approval, plan-review, or question), plan mode is active, it is running, running subagent descendants exist, or it is finished-but-unopened. Active rows lead in phase-precedence order (awaiting-* first, then plan, running, subagents, done), then recency; idle rows trail by recency. The running-subagent count uses the same small lineage walk the UI Workspace domain performs, re-expressed here so this panel owns its own projection.

Copy comes from the `sessionsPanel` locale namespace.

<a id="navigation"></a>
## Navigation

Clicking a row calls the injected `open(sessionId)`, which routes to `ctx.sessions.open`. The panel is session-scoped like every other right-Sidebar tab: it lives in whichever session opened it, and opening another session from it moves the conversation focus without copying the tab into the destination session.

<a id="model-experience"></a>
## Model Experience

None, as the panel is a browser-only viewer that registers no tool, prompt section, or session event.

#### KV Cache effect

No direct effect; what the operator reads here never enters a model request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>
- **Session-scoped panel.** Opening the tab in one session does not install it in another. It works as a launcher anchored to a main session; jumping from it does not carry the tab along.
- **Own phase projection.** The classifier mirrors the left sidebar's precedence but is not byte-identical to it, by design (a feature plugin must not import another feature plugin's runtime values).

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The panel's only runtime state is component-local filter state; it writes no session or workspace state.

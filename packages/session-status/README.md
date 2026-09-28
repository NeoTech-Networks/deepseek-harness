---
description: "The session-status group map: durable declared session statuses (waiting to deploy, stuck, finished), with a model tool and a human command, for users and maintainers navigating the group."
kind: "package-group"
---

# packages/session-status

English | [中文](README.zh.md)

## Summary

The session-status group gives a session a durable, model-independent status that the sidebar can show at a glance. The service keeps the status vocabulary and the `session/status` event durable, the model tool lets the agent declare a status without reading model text, and the `/status` command gives the human direct control. The status rides the session log, so it survives reload, resume, and fork, and a human prompt clears it. Only the shipped statuses are current unless a deployment authors its own vocabulary.

## Table of Contents

- [Packages](#packages)
- [Related documentation](#related-documentation)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`session-status`](session-status/README.md) | The vocabulary, `session/status` event, `sessionStatus` projection, and resolving service | `ctx.sessionStatus` |
| [`tool-session-status`](tool-session-status/README.md) | Model tool `set_session_status` | registers on `ctx.tools` |
| [`command-session-status`](command-session-status/README.md) | Human `/status` command in UI command planes | registers on `ctx.commands` |

-----

<a id="related-documentation"></a>
## Related documentation

- [Session status subsystem](../../docs/subsystems/session-status.md): the `session/status` event, `sessionStatus` projection, and the status vocabulary types.
- [Generated configuration catalog](../../docs/config-catalog.md#deepseek-aidsh-session-status): the accepted vocabulary field of the service.
- [Generated tool catalog](../../docs/tool-catalog.md#deepseek-aidsh-tool-session-status): the `set_session_status` schema the model receives.
- [session-status Agent Note](../../.agents/notes/proposed/feature/2026-09-07-session-status.md): the design record.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

The goal-phase fallback (a `blocked` goal maps to `stuck`, a `complete` goal to `finished`) lives in the client row derivation, not here, because the goal projection is its own domain and the mapping is presentation-only.

</details>

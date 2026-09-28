---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-24-session-status-event

English | [中文](2026-09-24-session-status-event.zh.md)

## Summary

Adds the log-only `session/status` event, which records a declared session status as its whole value (id, label, icon, tone) plus an optional note, or `null` when the status is cleared.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-24-session-status-event
baseline: false
changes:
  - root: "event:session/status"
    previous: null
    after: "6a93613293f3a7fa7bb0ccbe8c5403133c00a133eed8a7263e92085924a87fe8"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

A new root in the same Session format version. Existing logs contain no such event and stay valid; readers that predate it refuse a log carrying it, as every required-on-read event does. The event is appended only by the session-status plugin, on behalf of the `set_session_status` tool, the `/status` command and the controller route, and the `sessionStatus` projection is its only consumer. Carrying the whole value means a later vocabulary edit cannot change or break a status already logged.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/session-status: 38 tests passed across the event, projection, tool and command packages; `pnpm run verify-persistence-changes` passes after the record is generated.

<a id="dev-note"></a>
## Dev Note

None.

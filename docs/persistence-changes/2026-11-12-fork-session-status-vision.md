---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-11-12-fork-session-status-vision

English | [中文](2026-11-12-fork-session-status-vision.zh.md)

## Summary

This record re-acknowledges, on the 0.2.2-rc.2 history, the fork changes first recorded as `2026-09-24-session-status-event` and `2026-09-24-vision-routing-source`, whose snapshots predate the node-graph snapshot format; it also carries the fork's log-only `session/purpose` event. Adds the log-only `session/status` event, which records a declared session status as its whole value (id, label, icon, tone) plus an optional note, or `null` when the status is cleared. The `vision-routing` plugin adds an explicitly qualified attribution kind, `vision-routing`, to the user-message source slot. The change is an additive attribution kind, so the decision is `same-version`.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-11-12-fork-session-status-vision
baseline: false
changes:
  - root: "event:agent/inbox/spliced"
    previous: "2026-10-27-retry-control-input"
    after: "5630fe422a4b423cbe27dc68f2ea99d23e20fbcced8d29b8a13df203b34c3757"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-27-retry-control-input"
    after: "35df2540dcb94437d08850d37fa4c635e57cccb4494cd1c9861d3dd02c25b264"
    decision: same-version
  - root: "event:session/purpose"
    previous: null
    after: "46cfdb8083cf88f5b76acf1aedb5aaed74dc8b9c4063e006f00403b42c23bb9c"
    decision: same-version
  - root: "event:session/status"
    previous: null
    after: "6a93613293f3a7fa7bb0ccbe8c5403133c00a133eed8a7263e92085924a87fe8"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-27-retry-control-input"
    after: "7cbf336e43eb66e1f2e23fd67409d6ecac4ec068750e59933411699ea7ad6ff1"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-27-retry-control-input"
    after: "e1a4bd90fd19d67b134537c820070c87b627a5fce2b7befc4b01abf19234c304"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

A new root in the same Session format version. Existing logs contain no such event and stay valid; readers that predate it refuse a log carrying it, as every required-on-read event does. The event is appended only by the session-status plugin, on behalf of the `set_session_status` tool, the `/status` command and the controller route, and the `sessionStatus` projection is its only consumer. Carrying the whole value means a later vocabulary edit cannot change or break a status already logged.

Existing records are unchanged: no stored message uses the new kind. The plugin attaches it only to the describe request it sends to an image-capable model, and that request is never written to a Session log; the prompt the Session records keeps the `user` kind and carries the description as text. If a record with the kind ever appears, the kind is qualified with `@persistenceAttribution`, so readers without the producer preserve its content and metadata, and it imposes no validation, replay, or authority requirement.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/session-status: 38 tests passed across the event, projection, tool and command packages; `pnpm run verify-persistence-changes` passes after the record is generated.

`pnpm run verify-persistence-changes` and `pnpm run verify-persistence-catalog` pass after the record is generated. `packages/vision/vision-routing/tests/index.spec.ts` covers the describe call, and `packages/api/session-controller/tests/session-models.host.spec.ts` covers the admission path that replaces image blocks with the description.

<a id="dev-note"></a>
## Dev Note

None.

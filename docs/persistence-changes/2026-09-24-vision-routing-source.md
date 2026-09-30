---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-24-vision-routing-source

English | [中文](2026-09-24-vision-routing-source.zh.md)

## Summary

The `vision-routing` plugin adds an explicitly qualified attribution kind, `vision-routing`, to the user-message source slot. The change is an additive attribution kind, so the decision is `same-version`.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-24-vision-routing-source
baseline: false
changes:
  - root: "event:agent/inbox/spliced"
    previous: "2026-09-21-user-question-reply"
    after: "28cdb31a64154d70062d750383097dce0012cf28493b5a09b0eb3a9bf196c5e9"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-09-21-user-question-reply"
    after: "64e38f337622492beb69d8bbb9e44758e3bd253533cd1e384811bef150a5dcd9"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-09-21-user-question-reply"
    after: "bf784428f054089d29623cca3cfff14467c47472373056c711020b886055b089"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-09-21-user-question-reply"
    after: "43b3a0d3f69890698c198be8cdabd3cf0b5cda83e11bef44b8991c2601bc424b"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Existing records are unchanged: no stored message uses the new kind. The plugin attaches it only to the describe request it sends to an image-capable model, and that request is never written to a Session log; the prompt the Session records keeps the `user` kind and carries the description as text. If a record with the kind ever appears, the kind is qualified with `@persistenceAttribution`, so readers without the producer preserve its content and metadata, and it imposes no validation, replay, or authority requirement.

<a id="verification"></a>
## Verification

`pnpm run verify-persistence-changes` and `pnpm run verify-persistence-catalog` pass after the record is generated. `packages/vision/vision-routing/tests/index.spec.ts` covers the describe call, and `packages/api/session-controller/tests/session-models.host.spec.ts` covers the admission path that replaces image blocks with the description.

<a id="dev-note"></a>
## Dev Note

None.

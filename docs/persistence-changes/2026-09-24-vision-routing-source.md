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
    previous: "2026-09-16-session-format-v4"
    after: "2c427893bd2fd456f8d36192fef27f323fb87a5adfb16ca596bbef78c03e1ef3"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-09-16-session-format-v4"
    after: "6688eec046172058114006480d09013615fae6642f20717b937d40085f075bff"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-09-16-session-format-v4"
    after: "a5ba581c90efdc56f5bac570a3d1e10dbc37e0d62140872bee7dccd2892eb827"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-09-16-session-format-v4"
    after: "979c9c0a6269c688999599bdf6f33f58b8005eb6a2d03397b56a48ef9f1c92b9"
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

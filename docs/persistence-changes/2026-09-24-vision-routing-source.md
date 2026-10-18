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
    previous: "2026-10-13-user-rpc-principal"
    after: "81da0eae559d5adda8302b0efadfcdde0262ad828bc0d9acbf0aa57dc46fda37"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-13-user-rpc-principal"
    after: "180f3eb1f465d6bade8b1f83a27f859c76ab4a91846fa8c89f18c1d186d4181d"
    decision: same-version
  - root: "event:session/purpose"
    previous: null
    after: "46cfdb8083cf88f5b76acf1aedb5aaed74dc8b9c4063e006f00403b42c23bb9c"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-13-user-rpc-principal"
    after: "dc12155491371ac6639c975c2a256a75c67b2ea09d54b180c170169718364520"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-13-user-rpc-principal"
    after: "562cfb33482ebaa016b9c9f53739282568797789433260cedad0ebb5c5b4cb4c"
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

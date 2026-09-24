---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-24-team-member-model

English | [中文](2026-09-24-team-member-model.zh.md)

## Summary

Adds an optional `model` field to the `team/member` snapshot. It records the LLM model id the Team Lead selected for a teammate through `spawn_teammate`, so the roster keeps reporting that model after the teammate goes inactive.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-24-team-member-model
baseline: false
changes:
  - root: "event:team/member"
    previous: "2026-09-11-initial"
    after: "0bff5e9256cf33b10e27a092105d23885a2f68bbe449ed1a68df551d449d619b"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

An optional property in the same Session format version. Existing logs never carry it and replay unchanged, and a teammate created without an explicit route still omits it. A reader that predates the field rejects a `team/member` record that carries it, because the snapshot schema is strict; only Agent Teams sessions created on this build are affected, and Agent Teams is an experimental package excluded from official releases.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/experimental/agent-team/tests packages/experimental/tool-agent-team/tests: 6 files and 118 tests passed, including the new teammate-model spec, which runs a teammate on a second mock provider and reads the recorded model back from the roster after the teammate settles.

<a id="dev-note"></a>
## Dev Note

None.

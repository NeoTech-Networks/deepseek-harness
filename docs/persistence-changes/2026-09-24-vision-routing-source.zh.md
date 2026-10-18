---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-24-vision-routing-source

[English](2026-09-24-vision-routing-source.md) | 中文

## 概述

`vision-routing` 插件向用户消息来源槽位新增一个显式限定的归属 kind：`vision-routing`。这是新增的归属 kind，因此决定为 `same-version`。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

现有记录不变：没有已存储的消息使用这个新 kind。插件只把它附加在发往支持图像模型的 describe 请求上，而该请求从不写入 Session 日志；Session 记录的提示保持 `user` kind，并以文本携带描述。若日后出现带此 kind 的记录，由于它以 `@persistenceAttribution` 限定，缺少该生产者的读取方会保留其内容与元数据，且它不施加任何校验、重放或权限要求。

<a id="verification"></a>
## 验证

生成记录后，`pnpm run verify-persistence-changes` 与 `pnpm run verify-persistence-catalog` 通过。`packages/vision/vision-routing/tests/index.spec.ts` 覆盖 describe 调用，`packages/api/session-controller/tests/session-models.host.spec.ts` 覆盖以描述替换图像块的准入路径。

<a id="dev-note"></a>
## 开发备注

无。

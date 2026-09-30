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
## 兼容性

现有记录不变：没有已存储的消息使用这个新 kind。插件只把它附加在发往支持图像模型的 describe 请求上，而该请求从不写入 Session 日志；Session 记录的提示保持 `user` kind，并以文本携带描述。若日后出现带此 kind 的记录，由于它以 `@persistenceAttribution` 限定，缺少该生产者的读取方会保留其内容与元数据，且它不施加任何校验、重放或权限要求。

<a id="verification"></a>
## 验证

生成记录后，`pnpm run verify-persistence-changes` 与 `pnpm run verify-persistence-catalog` 通过。`packages/vision/vision-routing/tests/index.spec.ts` 覆盖 describe 调用，`packages/api/session-controller/tests/session-models.host.spec.ts` 覆盖以描述替换图像块的准入路径。

<a id="dev-note"></a>
## 开发备注

无。

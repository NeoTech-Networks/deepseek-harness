---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-24-team-member-model

[English](2026-09-24-team-member-model.md) | 中文

## 概述

为 `team/member` 快照新增可选字段 `model`。它记录团队负责人通过 `spawn_teammate` 为队友选定的 LLM 模型 id，使队友转为非活动后名册仍能报告该模型。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

同一会话格式版本内新增的可选属性。现有日志从不包含该字段，重放不受影响；未显式指定路由而创建的队友仍然省略该字段。由于快照模式是严格的，早于该字段的读取方会拒绝携带它的 `team/member` 记录；只有在此构建上创建的 Agent Teams 会话受影响，而 Agent Teams 是被排除在正式发布之外的实验性包。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/experimental/agent-team/tests packages/experimental/tool-agent-team/tests：6 个文件共 118 个测试通过，其中包括新的 teammate-model 用例，它让队友在第二个模拟提供方上运行，并在队友结束后从名册读回记录的模型。

<a id="dev-note"></a>
## 开发备注

无。

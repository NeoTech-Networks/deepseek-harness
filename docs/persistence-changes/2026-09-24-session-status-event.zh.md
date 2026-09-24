---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-24-session-status-event

[English](2026-09-24-session-status-event.md) | 中文

## 概述

新增仅写日志的 `session/status` 事件，以整值（id、label、icon、tone）加可选 note 记录已声明的会话状态，清除状态时记录 `null`。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

同一 Session 格式版本中的新 root。现有日志不含该事件并保持有效；早于它的读取方会拒绝携带它的日志，所有读取时必需的事件都是如此。该事件只由 session-status 插件代表 `set_session_status` 工具、`/status` 命令和控制器路由追加，`sessionStatus` 投影是它唯一的消费方。携带整值意味着之后的词表修改无法改变或破坏已记录的状态。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/session-status：事件、投影、工具与命令各包共 38 个测试通过；生成记录后 `pnpm run verify-persistence-changes` 通过。

<a id="dev-note"></a>
## 开发备注

无。

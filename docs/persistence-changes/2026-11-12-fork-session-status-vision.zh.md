---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-11-12-fork-session-status-vision

[English](2026-11-12-fork-session-status-vision.md) | 中文

## 概述

本记录在 0.2.2-rc.2 的历史上重新确认分支此前记录为 `2026-09-24-session-status-event` 与 `2026-09-24-vision-routing-source` 的变更，二者的快照早于节点图快照格式；同时包含分支仅写入日志的 `session/purpose` 事件。新增仅写日志的 `session/status` 事件，以整值（id、label、icon、tone）加可选 note 记录已声明的会话状态，清除状态时记录 `null`。`vision-routing` 插件向用户消息来源槽位新增一个显式限定的归属 kind：`vision-routing`。这是新增的归属 kind，因此决定为 `same-version`。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

同一 Session 格式版本中的新 root。现有日志不含该事件并保持有效；早于它的读取方会拒绝携带它的日志，所有读取时必需的事件都是如此。该事件只由 session-status 插件代表 `set_session_status` 工具、`/status` 命令和控制器路由追加，`sessionStatus` 投影是它唯一的消费方。携带整值意味着之后的词表修改无法改变或破坏已记录的状态。

现有记录不变：没有已存储的消息使用这个新 kind。插件只把它附加在发往支持图像模型的 describe 请求上，而该请求从不写入 Session 日志；Session 记录的提示保持 `user` kind，并以文本携带描述。若日后出现带此 kind 的记录，由于它以 `@persistenceAttribution` 限定，缺少该生产者的读取方会保留其内容与元数据，且它不施加任何校验、重放或权限要求。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/session-status：事件、投影、工具与命令各包共 38 个测试通过；生成记录后 `pnpm run verify-persistence-changes` 通过。

生成记录后，`pnpm run verify-persistence-changes` 与 `pnpm run verify-persistence-catalog` 通过。`packages/vision/vision-routing/tests/index.spec.ts` 覆盖 describe 调用，`packages/api/session-controller/tests/session-models.host.spec.ts` 覆盖以描述替换图像块的准入路径。

<a id="dev-note"></a>
## 开发备注

无。

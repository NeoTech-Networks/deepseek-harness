---
description: "面向纯文本模型会话的自动图像描述：提示准入通过支持图像的路由描述附加图像，而不是拒绝它们；适用于升级到 deepseek-v4-pro 等纯文本模型的操作者。"
kind: "package-reference"
---

# @deepseek-ai/dsh-vision-routing

[English](README.md) | 中文

## 概述

让运行纯文本模型（如 `deepseek-v4-pro`）的会话也能接收附加图像。提示准入把图像发送到支持图像的路由（默认 `deepseek-flash`），并用该模型写出的描述替换图像，使对话继续，而不是以「Model does not support image input」失败。在 subagent 模型选择偏好启用且至少命名一个路由之前，它保持不活跃。代价是每个带图像的提示多一次模型调用，而纯文本模型只会看到描述。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [Model Experience](#model-experience)
- [已知限制与未尽事项](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

在 `subagent-model-selection-settings` 旁挂载一行 Host 条目；随附的 web-app bundle 已经这样做。

```yaml
- id: vision-routing
  name: '@deepseek-ai/dsh-vision-routing'
```

### 何时生效

仅当三点同时成立：提示携带图像；会话所选模型未声明 `image` 输入；`subagent-model-selection` 偏好已启用且至少命名一个路由。视觉路由是第一个其模型声明 `image` 输入的被允许路由；若都不符合，则回退到 `visionRoute`。偏好关闭时，纯文本选择保持上游的拒绝。支持图像的选择永远不会进入本包。

### 配置

所有字段均可选。

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `visionRoute.provider` | `deepseek-official` | 视觉模型提供方 |
| `visionRoute.model` | `deepseek-flash` | 视觉模型 id |
| `prompt` | describe 细则 | 随图像发送的指令 |
| `maxTokens` | `4096` | 单次描述的输出 token 上限 |
| `timeoutMs` | `60000` | 单次描述的端到端截止时间 |

生成的[配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-vision-routing)是所有可接受字段的完整来源。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部细节，点击展开</summary>

插件注册带两个方法的 `ctx.visionRouting`。`enabled()` 报告开关是否打开。`describe(refs, signal?)` 把一批有序图像连同 describe 细则发送到解析出的路由并返回文本；没有支持图像的路由或调用失败时抛出 `VisionDescriptionError`。

使用方是 `dsh-api-session-controller` 中的提示准入：在其 `hasImage` 检查内，服务已启用时纯文本选择不再抛出错误。附件准入后，所有图像块被移除，并追加一个文本块 `[Attached image description (vision model): ...]`；描述失败时则为 `[Attached image description unavailable: <reason>]`，因此失败会保留发送而不是拒绝。

describe 请求带有自己的消息来源 kind `vision-routing`，声明在 `MessageSourceMap` 上并以 `@persistenceAttribution` 限定。该请求从不写入 Session 日志；记录下的提示保持 `user` kind。

</details>

-----

<a id="model-experience"></a>
## Model Experience

### Image described for a text-only model

#### What the model sees

纯文本模型收到的用户消息包含提示文本以及追加的一个块；原始图像块已被移除。

##### Described image

```markdown
[Attached image description (vision model): <description of Image 1..N>]
```

##### Description failed

```markdown
[Attached image description unavailable: <reason>]
```

#### Token effect

每个带图像的提示增加一段描述，其长度受视觉调用的 `maxTokens` 限制，用来替代模型无法读取的图像输入。

#### KV Cache effect

仅追加；描述属于新的用户消息，不会使已有的 KV Cache 条目失效。

## 已知限制与未尽事项

<a id="known-limitations-and-deferred-work"></a>

- **开关借用 subagent 路由。** 开关是 subagent 模型选择偏好而不是独立设置，因此启用其一即启用另一个。
- **每个提示一次描述。** 一个提示中的所有图像一起描述；纯文本模型无法就某张图像追问。
- **没有流式反馈。** 提示在排队前要等待描述完成，最多 `timeoutMs`。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>面向维护者的工作上下文，点击展开</summary>

设计记录见[视觉路由 Agent Note](../../../.agents/notes/implemented/feature/2026-09-08-vision-routing.zh.md)。新来源 kind 的持久化确认记录见 [2026-09-24-vision-routing-source](../../../docs/persistence-changes/2026-09-24-vision-routing-source.zh.md)。

</details>

**Runtime invariant:** No companion is published. This Host service owns no durable event stream or mutable runtime data of its own: it resolves the gating preference and the exact vision route per call, and the description it returns is persisted by prompt admission as part of the user message.

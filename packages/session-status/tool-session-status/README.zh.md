---
description: "DeepSeek Harness session-status 域上的模型工具 set_session_status，供选择、配置或调试该工具的用户与维护者参考。"
kind: "package-reference"
---

# @deepseek-ai/dsh-tool-session-status

[English](README.md) | 中文

## 概述

`dsh-tool-session-status` 为模型提供一个工具 `set_session_status`，它向调用智能体的会话追加整值 `session/status` 事件。状态枚举由实时 session-status 词表加上 `clear` 哨兵构成，因此模型无法编造部署未声明的 id。状态会在操作者下一条提示时自动清除。

## 目录

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)

-----

<a id="use-this-package"></a>
## Use this package

与 `@deepseek-ai/dsh-session-status` 一起挂载，后者提供词表和该工具注入的 `sessionStatus` 服务。无需配置：词表在兄弟域包中。

### What each call does

带词表 id 的调用追加整个状态值并返回解析后的 `{ id, label, icon, tone }`。带 `clear` 的调用追加空事件。没有所属智能体会话的调用会被拒绝。该工具是固定工具而非模型行为，因此在每条 provider 路由上表现一致。

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

该插件是命名空间插件（`name` / `inject` / `apply`，无默认导出），注入 `['tools', 'sessionStatus']`，并用从 `ctx.sessionStatus.list()` 读取的枚举注册 `set_session_status`。工具的 `execute` 委托给 `ctx.sessionStatus.set` / `clear`，因此词表校验和持久化追加保留在域包中。见 [src/index.ts](src/index.ts)。

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.zh.md): 兄弟分组页及其包表。
- [Generated tool catalog](../../../docs/tool-catalog.zh.md#deepseek-aidsh-tool-session-status): 模型收到的 `set_session_status` schema。

-----

<a id="model-experience"></a>
## Model Experience

### Tool schema

#### What the model sees

模型看到生成的 [`set_session_status` schema](../../../docs/tool-catalog.zh.md#deepseek-aidsh-tool-session-status)：必填的 `status` 字符串（枚举为实时词表加上 `clear`）和可选的 `note` 字符串。描述写明内置状态与随提示清除的规则。

#### Token effect

在工具可见的每个请求上产生固定 schema 开销；对给定词表而言枚举稳定。

#### KV Cache effect

在定义和词表不变时前缀稳定。

### Tool-call history and result

#### What the model sees

成功调用返回 `{ status }`，要么是解析后的 `{ id, label, icon, tone }`，要么在 `clear` 后为 `null`。没有所属智能体会话或 id 在枚举之外的调用会被拒绝。

#### Token effect

调用参数和小型结构化结果保留到压缩前。

#### KV Cache effect

仅追加；新可见内容跟随可复用请求前缀。

-----

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- **任何人工提示都会清除** — 状态按设计不会在操作者下一条消息之后保留；没有保持模式。
- **枚举受词表约束** — 会话中途改词表的部署会让先前记录状态的 id 落在新枚举之外，但已记录的值保持完整。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>Working context for maintainers: click to expand</summary>

None.

</details>

---
description: "DeepSeek Harness 会话日志上的持久化已声明会话状态（等待部署、卡住、已完成）：session/status 事件、sessionStatus 投影和解析服务，供选择、配置或调试会话状态的用户与维护者参考。"
kind: "package-reference"
---

# @deepseek-ai/dsh-session-status

[English](README.md) | 中文

## 概述

`dsh-session-status` 为会话提供一个持久化、与模型无关的状态，让侧边栏一眼就能看到。智能体或操作者声明一个状态（如 `waiting-production`、`stuck`、`finished`），该值写入会话日志，因此在重载、恢复和分叉后仍然存在。任何人工提示都会清除该状态，因为提示回答了状态所等待的事情。状态是整值日志状态：事件携带完整的标签、图标和色调，因此之后编辑词表不会改变已经记录的某一行。

## 目录

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

当会话需要在侧边栏行上显示一个已声明状态、而无需读取模型文本时使用本包。在兄弟工具包、命令包或控制器路由需要解析并追加状态时挂载它。

### When to choose it

当状态词表较小、由操作者编写、且为整值时选择本包。该域只记录状态并在人工输入时清除它，不做其他事情：它从不根据回合结果猜测状态，也从不自行让状态过期。

### Minimal configuration

`vocabulary` 可选，带有内置默认值。每个条目为 `{ id, label, icon, tone }`；`id` 为短横线命名且唯一，`icon` 为 `right-up`、`stop`、`check`、`clock`、`pause` 之一，`tone` 为 `attention`、`error`、`success`、`neutral` 之一。

```yaml
- name: '@deepseek-ai/dsh-session-status'
  config:
    vocabulary:
      - { id: waiting-production, label: 'Waiting on you: deploy to production', icon: right-up, tone: attention }
      - { id: stuck, label: Stuck, icon: stop, tone: error }
      - { id: finished, label: Finished, icon: check, tone: success }
      - { id: waiting-external, label: 'Waiting on someone else', icon: clock, tone: attention }
      - { id: paused, label: Paused, icon: pause, tone: neutral }
```

| Field | Default | Meaning |
|---|---|---|
| `vocabulary` | 五个内置状态 | 允许的状态；id 必须唯一，每个 icon 和 tone 都必须在各自允许列表中 |

### What each operation does

`set(session, id, note?)` 追加一个携带整个词表条目的 `session/status` 事件；词表之外的 id 会以错误拒绝而不是静默丢弃。`clear(session)` 追加空事件。`list()` 按声明顺序返回词表，`current(session)` 读取某个会话的折叠投影。任何人工来源的 `user/message` 都会清除状态。

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

### Design commitments

- **整值、日志支撑的状态。** `session/status` 事件携带完整的 `{ id, label, icon, tone }`，因此之后的词表编辑无法重写已经记录的某一行。持久化、重放、恢复和分叉都从日志重建。
- **人工提示即清除信号。** 折叠在 source 为 `user` 的任何 `user/message` 上清除，因为提示回答了状态所等待的事情。plugin、tool、model 和 goal 来源的用户消息从不清除它。
- **部署词表，大声校验。** 词表是插件 `Config` 字段而非硬编码表，畸形条目会导致插件加载失败。

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | 插件入口：词表校验、`sessionStatus` 投影单元、解析用的 `SessionStatusService` |
| [`src/types.ts`](src/types.ts) | `sessionStatus` 投影键声明及其载荷类型的唯一出处 |
| [`src/fold.ts`](src/fold.ts) | 纯事件折叠，不依赖 cordis 和 zod，便于直接单元覆盖 |
| [`src/client.ts`](src/client.ts) | types 出口的客户端命名空间再导出 |

### Session projection

当挂载 `ctx.sessionProjections` 时，本包注册 `sessionStatus` 单元。该键在此并入 `SessionProjectionMap`，载体在历史尾页和 `session/projection` 推送帧上提供该值，因此冷侧边栏行无需打开会话即可读取状态。

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.zh.md): 兄弟分组页及其包表。
- [Session status subsystem](../../../docs/subsystems/session-status.zh.md): `session/status` 事件、`sessionStatus` 投影与状态词表类型。
- [Generated configuration catalog](../../../docs/config-catalog.zh.md#deepseek-aidsh-session-status): 每个接受的配置字段及其来源声明。
- [session-status Agent Note](../../../.agents/notes/proposed/feature/2026-09-07-session-status.zh.md): 设计记录。

-----

<a id="model-experience"></a>
## Model Experience

无：状态服务不注册工具或提示词，`sessionStatus` 投影只是对已记录会话状态的客户端读取模型。

#### KV Cache effect

无；该投影从不组装或发送 provider 请求。

-----

## Runtime invariant

不发布伴随件。词表在插件加载时校验、状态 id 在 `set` 边界校验，`sessionStatus` 投影折叠整值事件，因此没有独立可变关系需要运行时伴随件交叉检查。

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- **只声明，不猜测。** 该域不会根据回合结果、计时器或模型文本推导状态；从不声明状态的会话不显示任何状态。
- **任何人工提示都会清除。** 状态按设计不会在下一个人类消息之后保留；没有“在确认前保持”的模式。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>Working context for maintainers: click to expand</summary>

目标阶段回退（`blocked` 目标映射到 `stuck`，`complete` 目标映射到 `finished`）刻意在客户端行推导中实现，而非这里：goal 投影是它自己的域，映射仅用于展示。

</details>

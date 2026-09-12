---
description: "工具 schema 的路由回退：当一步组装出的工具 schema 超出字节上限时，把请求从 flash 路由改到 pro 路由，而不是缩小或截断任何 schema。面向需要配置或排查该插件的用户与维护者。"
kind: "package-reference"
---

# @deepseek-ai/dsh-llm-route-fallback

[English](README.md) | 中文

## Summary

本包让过大的工具 schema 离开 flash 路由。它测量一步组装出的 `tools[].function.parameters` 的 UTF-8 字节总和，当该测量值在某个配置路由上超过配置上限时，为这一次请求返回 pro 路由。任何内容都不会被截断、改写或重新序列化，而且决定发生在循环写入请求头之前，因此持久的 `request/header` 与 `request/context` 事件记录的是真正被使用的路由。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办](#known-limitations-and-deferred-work)
- [维护者笔记](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

把本插件与 agent 循环和一个 DeepSeek 适配器一起挂载，即可让包含大量或大型工具 schema 的请求不再被送往便宜的路由。挂载本身就是全部安装步骤：它不读取任何服务、不存储任何状态，也不增加工具、命令、提示词段落或会话事件。

### 何时选择它

当"过大的工具 schema"是你希望用改路由而不是改 schema 来处理的问题时，选择它。当便宜路由是成本上的硬性要求时不要选择它：本守卫刻意用更高的单次成本换取完整 schema。也不要指望它保护所有 provider：它只作用于一个配置好的 provider 路由对，其他 provider 的请求不受影响。

### 配置

当默认值与部署不匹配时，带配置挂载：

```yaml
- name: '@deepseek-ai/dsh-llm-route-fallback'
  config:
    enabled: true
    provider: deepseek-official
    from: [deepseek-flash, deepseek-v4-flash]
    to: deepseek-v4-pro
    limitBytes: 3000
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 总开关；`false` 让每个请求完全保持 agent 声明的路由 |
| `provider` | `deepseek-official` | 回退唯一作用的 provider 路由 |
| `from` | `[deepseek-flash, deepseek-v4-flash]` | 回退要把请求移走的路由模型。使用列表，因此当前 id 与旧版别名都受保护 |
| `to` | `deepseek-v4-pro` | 回退把符合条件的请求移到其上的模型 |
| `limitBytes` | `3000` | 工具 `function.parameters` 的 UTF-8 字节总和超过该值即改路由；比较是严格大于 |

缺失的字段取默认值。存在但不可用的字段让插件加载失败并报错：空的 `provider` 或 `to`、空的或重复的 `from`、不是正整数的 `limitBytes`，或者同时出现在 `from` 里的 `to`。生成的[配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-llm-route-fallback)记录了全部可接受取值。

### 你会得到什么

在默认配置下，一步的工具 schema 合计超过 3000 字节、且其 agent 请求的是 `deepseek-flash`（或旧版 `deepseek-v4-flash`）时，该请求改发到 `deepseek-v4-pro`。会话日志随后会为这一步显示 `deepseek-v4-pro`，即使模型选择器仍显示操作者选定的路由，因为请求头记录的是真正被使用的路由。模型看到的工具、提示词与 schema 字节完全相同，只有路由变了。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部细节：点击展开</summary>

本节说明决定在哪里做出，以及为什么这个位置是关键；可观察行为已由[使用本包](#use-this-package)完整覆盖。

### 设计承诺

- **只改路由，绝不改 schema。** 本守卫不增加截断、摘要或对 schema 的重新序列化。它唯一能改的是请求发出的模型 id。
- **决定先于记录。** agent 循环在前置步骤里组装系统提示词与工具 schema，随后通过 `agent/request` waterfall 解析其调用配置，最后才写规范的 `request/header` 以及任何 `request/context` 变更。因此 waterfall 决定的就是日志将记录的路由，这正是"悄悄回退"不可能发生的原因。
- **prepend，让解析后的路由成为输入。** 监听器以 `prepend` 注册，因而排在所有其他 `agent/request` 监听器之前，包括应用操作者所选模型的模型选择中间件。守卫读取请求真正会使用的路由，只在该路由符合条件时返回自己的路由。
- **纯决定，薄插件。** 测量与决定是对（解析后的路由、组装出的工具、配置）的纯函数；插件只负责把它们接到事件上并写一行日志。

### 依次检查的关口

请求在第一个未通过的关口保留其声明路由，结果会指出该关口：`disabled`（总开关关闭）、`provider`（其他 provider）、`route`（回退不移走的路由模型）、`tools`（该步没有工具）、`under-limit`（测量值未超上限）。只有全部关口通过才移动，此时结果会带上测量字节数与阈值，便于日志或测试同时引用两者。

### 测量

`toolParameterBytes` 对所有工具累加 `Buffer.byteLength(JSON.stringify(tool.parameters), 'utf8')`，这正是 DeepSeek 适配器映射进 `WireTool.function.parameters` 的同一个量，从组装到上线之间没有任何变换。`ToolSchema.parameters` 按契约就是 JSON Schema 对象，因此每个工具都贡献一个字符串。

### 源码地图

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 插件入口：`Config` schema、加载即失败的解析、`agent/request` 监听器 |
| [`src/measure.ts`](src/measure.ts) | 纯测量（`toolParameterBytes`）与决定（`planRouteFallback`） |
| [`src/types.ts`](src/types.ts) | `Config`、其解析形态、请求事实与结果词汇 |

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

当包级契约不够用时阅读这些页面。它们从插件监听的那条 waterfall 延伸到流式层与它所选择的路由。

- [LLM 流式子系统](../../../docs/subsystems/llm-streaming.zh.md)：适配器注册表、调用配置，以及按路由分派的流式路径。
- [llm 分组地图](../README.zh.md)：同组的适配器、重试、计量与用量包。
- [生成的配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-llm-route-fallback)：全部可接受配置字段及其来源声明。

-----

<a id="model-experience"></a>
## 模型体验

无，因为本插件只改变由哪个模型作答，并且不注册任何提示词段落、工具 schema 或消息。

#### KV Cache 影响

被移动的请求改变了 `model`，而它是缓存前缀身份的一部分，因此该请求无法复用继承的前缀并需要写入缓存；除此之外它的消息、系统提示词与工具 schema 都原样发送，且决定按请求重新评估。

## 已知限制与待办

<a id="known-limitations-and-deferred-work"></a>

这些限制说明本回退在什么情况下不合适。它们是当前的包约束与未决事项，不是任务清单。

- **阈值是配置要求，不是测得的上游限制。** provider 的 Chat Completions 参考没有为 `tools[].function.parameters` 记录任何大小上限，实测 4734 参数字节在两个当前路由上都被接受（见维护者笔记）。3000 字节的默认值是本部署选定的预算。
- **运行中的应用不会显示这次移动。** 日志如实记录了路由；模型选择器仍显示操作者选定的路由，因此人眼比对时会看到差异，而应用内没有解释。
- **成本朝相反方向移动。** 符合条件的请求按设计使用更贵的模型。
- **只覆盖一个 provider 路由对。** 以其他 provider id 提供相同模型的部署不在默认配置覆盖范围内。
- **目标路由不在加载时校验。** `to` 指向 provider 不提供的 id 时，会在分派时以终止性请求错误失败，而不是在插件加载时失败，因为路由注册是异步的。

<a id="dev-note"></a>
### 维护者笔记

<details>
<summary>维护者工作上下文：点击展开</summary>

本维护者笔记是工作上下文。已发布行为、限制与已接受的取舍写在上方各节、包代码以及所链接的 Agent Note 中。

设计记录见[路由回退 Agent Note](../../../.agents/notes/implemented/feature/2026-09-11-llm-route-fallback.zh.md)。它记录了两处候选网关、排除其一的实测证据，以及"本守卫所防范的故障并未复现"的 Phase 1 探测结果。

</details>

**运行时不变式：** 不发布 companion。本插件只拥有一个 `agent/request` 监听器，其唯一效果是它返回的调用配置，而该决定是解析后的路由、该步组装出的工具 schema 与插件自身已校验配置的纯函数，因此不存在可供 companion 交叉校验的独立可变关系。

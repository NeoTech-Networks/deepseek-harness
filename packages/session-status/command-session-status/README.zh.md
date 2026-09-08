---
description: "DeepSeek Harness session-status 域上的人工 /status 命令，供选择、配置或调试该命令的用户与维护者参考。"
kind: "package-reference"
---

# @deepseek-ai/dsh-command-session-status

[English](README.md) | 中文

## 概述

`dsh-command-session-status` 注册人工 `/status` 命令：裸 `/status` 报告当前状态和合法的下一个 id，`/status <id>` 设置一个，`/status clear` 清除它。未知 id 是渲染错误，绝不会抛异常失败。

## 目录

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)

-----

<a id="use-this-package"></a>
## Use this package

与 `@deepseek-ai/dsh-session-status` 和命令注册表一起挂载。无需配置。

### What each command does

`/status` 显示当前状态以及 `Available: <ids> | clear`。`/status stuck` 追加整个 `stuck` 状态。`/status clear` 追加空事件。`/status banana` 返回指名未知 id 的渲染错误。

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

该插件是命名空间插件（`name` / `inject` / `apply`，无默认导出），注入 `['commands', 'sessionStatus']` 并注册 `status` 命令。其处理器通过 `ctx.sessionStatus` 解析 id 并返回 `CommandResult`；对未知 id 绝不抛出。见 [src/index.ts](src/index.ts)。

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [session-status group map](../README.zh.md): 兄弟分组页及其包表。

-----

<a id="model-experience"></a>
## Model Experience

### Human `/status` control

#### What the model sees

斜杠输入、变更与直接状态输出都不进入模型请求。域把变更记录为 `session/status` 事件；展示文本不会被记录。

#### Token effect

读取状态、设置或清除、或收到直接命令错误都不会增加模型 token。

#### KV Cache effect

命令发现、变更与直接输出不影响缓存。

-----

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- **仅纯文本交互** — 通用命令注册表没有模态选择器；`/status` 是可移植的设置/清除界面。
- **任何人工提示都会清除** — 状态按设计不会在操作者下一条消息之后保留。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>Working context for maintainers: click to expand</summary>

None.

</details>

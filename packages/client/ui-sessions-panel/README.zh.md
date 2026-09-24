---
description: "dsh Web 客户端右侧 Sidebar 的 Sessions tab 类型：跨工作区的会话列表，进行中的排在最前，带 Active/All 过滤器，点击即可打开。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sessions-panel

[English](README.md) | 中文

## 概述

右侧 Sidebar 的 Sessions tab：跨每个工作区、一个列表列全部会话，进行中的排在最前。它自己从会话列表与待处理交互重新推导「进行中 / 空闲」的分类，因此正在运行或等待操作者的会话，无需在左侧边栏的工作区文件夹里翻找就能看见。Active/All 过滤器默认只显示进行中。点击一行打开那个会话。左侧边栏的工作区分组保持不变。

## 目录

- [注册了什么](#what-it-registers)
- [怎么推导行](#how-it-derives-rows)
- [导航](#navigation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="what-it-registers"></a>
## 注册了什么

- **类型** —— `ctx.sidebarRightTabs.register(...)`，id 为 `@deepseek-ai/dsh-client-ui-sessions-panel`（这个实现在 tab 系统里的唯一键，也是其体注册所用的 key），kind `sessions`，档位 `builtin`。一个页面类型：不认领任何资源地址，按 kind 打开。它贡献一个 guide 入口，于是面板能从 guide 页的门户进入。
- **体** —— keyed 坑位 `sidebar.right.pane.tab`，键为类型的 id。固定的 Active/All 过滤器头在单个滚动列表之上，每一行是状态点、会话标题、工作区标签与相对时间。体只把自己的过滤器当本地状态持有；它读到的每个事实都来自全局框架 hook（`useSessions`、`useSessionPendingInteraction`、`useWorkspaces`）与唯一注入的 `open` 动作。

<a id="how-it-derives-rows"></a>
## 怎么推导行

`deriveSessions`（在 `active.ts`）是对会话列表快照、归档集与待处理交互的纯函数。可见性与左侧边栏一致：子代理行折入其父（从不列出），已归档行隐藏，只显示选中的 blank 行。会话在有待处理交互（approval、plan-review 或 question）、plan mode 开启、正在运行、存在运行中的子代理后代、或已完成但未打开时为进行中。进行中的行按相位优先级（先 awaiting-*，再 plan、running、subagents、done）排在最前，其后按最近度；空闲的行按最近度排在后面。运行中的子代理计数使用 UI Workspace 域所做的同一个小型谱系遍历，在此重新表达，让这个面板拥有自己的投影。

文案来自 `sessionsPanel` locale 命名空间。

<a id="navigation"></a>
## 导航

点击一行调用注入的 `open(sessionId)`，路由到 `ctx.sessions.open`。面板与其它右侧 Sidebar tab 一样是会话作用域：它住在打开它的那个会话里，从它打开另一个会话只是移动对话焦点，不会把 tab 复制进目标会话。

<a id="model-experience"></a>
## 模型体验

无，因为面板是纯浏览器侧的查看器，不注册工具、提示词段或会话事件。

#### KV Cache 影响

无直接影响；操作者在这里读到的东西永不进入模型请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>
- **会话作用域面板。** 在一个会话里打开 tab 不会装进另一个会话。它作为一个锚定在主会话上的启动器使用；从它跳转不会把 tab 带过去。
- **自有相位投影。** 分类器镜像左侧边栏的优先级，但按设计并非与之逐字节一致（功能插件不得运行时导入另一功能插件的值）。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>

**运行时不变量：** 不发布 companion。面板唯一的运行时状态是组件本地的过滤器状态；它不写任何会话或工作区状态。

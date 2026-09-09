---
description: "右侧栏的固定目录资源管理器：操作者在 Host 上任意位置的根目录，按层惰性列出，自带文件预览与每个 Session 一次的自动打开。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sidebar-explorer

[English](README.md) | 中文

## 概述

右侧栏的第二个导航器：一棵覆盖操作者固定目录的树，无论它们在 Host 的什么位置，都通过 `pinnedFiles` Remote 命名空间按层列出。它在每个 Session 和每个 Workspace 中都是同一棵树，因为它的根目录是 Host 状态，而不是某个 Session 的工作目录。它还附带第二个 tab 类型，一个纯文本预览，因为固定的文件通常位于 Session 工作区之外，而随产品发布的 `text` 查看器拒绝在那里读取。

## 目录

- [它注册了什么](#what-it-registers)
- [这棵树](#the-tree)
- [自动打开](#auto-open)
- [Model Experience](#model-experience)
- [已知限制与未尽事项](#known-limitations-and-deferred-work)
- [开发者备注](#dev-note)

-----

<a id="what-it-registers"></a>
## 它注册了什么

- **资源管理器类型** — kind `explorer`，id `@deepseek-ai/dsh-client-ui-sidebar-explorer`，band `builtin`，无 patterns，一条 order 为 5 的 guide 条目。
- **预览类型** — kind `pinnedText`，id `…#text`，band `builtin`，没有 guide 条目：一个没有内容可预览的预览页，不该成为从 guide 落地的地方。它接受 `path` 导航参数，声明合并进 `SidebarRightTabParamsMap`。
- **两个 body** — keyed 的 `sidebar.right.pane.tab` 座位，各自挂在自己的 id 下。
- **自动打开** — 一个对 Session 列表的订阅。

`src/client/` 下的源文件：`definition.ts`（两个类型）、`store.ts`（树保存什么）、`face.ts`（如何调用 Host）、`ExplorerBody.tsx`（树）、`TextBody.tsx`（预览）、`locales.ts`（文案）、`index.ts`（接线）。

<a id="the-tree"></a>
## 这棵树

每个根目录是一行可折叠的标题行；它下面的每一层都以 Host 报告的绝对路径为键，因此客户端从不自己拼接路径片段。行的顺序是目录优先，然后按自然的、不区分大小写的名称排序；点开头的条目与其他条目一视同仁，既不是文件也不是目录的条目会置灰且不可点击。被端点条目上限截断的层会以一条标记结尾；空层会明说；失败的层按 `pinned-files/*` 代码显示一行说明。

点击文件会在同一个 pane 中打开 `pinnedText` tab。由于该 tab 是按 kind 而不是按地址打开的，每个 pane 只会复用一个预览 tab，而每次点击都作为一次新的导航到达，revision 递增。

控件包括标题栏中的刷新、每个根目录旁的取消固定，以及底部的一行添加：一个路径输入框、一个 **浏览…** 按钮（当组合出来的 picker 具备原生对话框时打开 Host 自己的文件夹选择器），以及 **添加**。输入框是永远可用的兜底，因此无法打开原生对话框的部署只会失去那个按钮，别的都不受影响。

状态存放在类型自己的 store 中，按 tab id 分桶，根目录清单由 Session 内所有资源管理器 tab 共享。owner 的 `signal` 结束一个桶：abort 后该 tab 被遗忘，之后才落定的列目录结果不会写入任何东西。

<a id="auto-open"></a>
## 自动打开

侧栏不跨重载保存布局，并且在 Session 的 surface 挂载之前不绘制任何东西，因此「资源管理器就在那里」无法成为布局的属性。本包把它当作一个动作来做：在 Session 列表的 `current` 边沿调用 `openTabIn(sessionId, 'explorer')`，每个 Session 一次，并带一次延迟重试以覆盖 surface 的首次绘制。打开内容会展开该列，这正是每个 Session 最多只访问一次的原因：把它折叠起来，它就保持折叠。在设置文档的 `pinned-files` 下设置 `autoOpen: false` 可关闭该行为；该值在加载时读取一次。

<a id="model-experience"></a>
## Model Experience

None, as this package draws a directory tree in the browser and registers nothing model-facing.

#### KV Cache effect

None; directory listings and file reads travel over the Remote and assemble no model request.

## 已知限制与未尽事项

<a id="known-limitations-and-deferred-work"></a>

- **只列不改。** 没有搜索、过滤、拖放、重命名、右键菜单、当前文件高亮或文件系统监听；某一层只有通过刷新才会变化。
- **根目录不能排序或重命名。** 根目录的标签就是它的 basename，顺序就是添加顺序；要改任何一个都得编辑设置文档。
- **预览是纯文本。** 没有语法高亮、没有分页、没有图片，超过 Host 字节上限的文件会被拒绝而不是显示一部分。
- **`autoOpen` 只读取一次。** 在设置文档里改它要到下次加载才生效，这一点与根目录不同，根目录每次刷新都会重新读取。

<a id="dev-note"></a>
### 开发者备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>

**Runtime invariant:** No companion is published. The tree's only runtime state is one Slot store per Session, written by the bodies that own it and forgotten on each tab's abort signal; there is no second observation of it to compare against.

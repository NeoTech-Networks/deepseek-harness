# Agent 笔记：会话面板

状态：已实现

[English](2026-09-08-sessions-panel.md) | 中文

## 问题

左侧边栏按工作区分组，并把每组折叠到五行，因此运行中、等待操作者、或持有运行中子代理的会话，一旦落在靠下的工作区里就一眼看不见。操作者只能逐个展开工作区才能找到真正打开的会话。右侧 Sidebar 的[停靠基础设施](2026-09-04-right-sidebar-docking-infrastructure.md)已经带有一个 tab 类型注册表和页面类型模板及 guide 入口门户，但还没有一个已交付的类型回答「不论工作区，给我看所有进行中的会话」。

## 决策

新客户端包 `@deepseek-ai/dsh-client-ui-sessions-panel` 注册一个 `sessions` tab 类型及其体，沿用 `ui-sidebar-textpreview` 建立的外部类型模板。类型是页面类型：`{ id: '@deepseek-ai/dsh-client-ui-sessions-panel', kind: 'sessions', priority: 'builtin', title, guide: [{ order: 10, title, description, icon: IconListPenOutline16 }] }`。它不认领任何地址；guide 的入口框以 `replaceTab: true` 按 kind 打开它，与文件树使用同一个门户。

体是固定的 Active/All 过滤器头加一个滚动列表。它通过全局 `useSessions` / `useSessionPendingInteraction` hook 读取会话列表与待处理交互，通过 `useWorkspaces` 读取工作区，并通过自己的 inject face 只驱动一个 Host 动作 `open`（`ctx.sessions.open`）。过滤器是组件本地状态，默认 **Active**。

`active.ts` 里的 `deriveSessions` 是纯推导，特意重新表达而不是从 `ui-workspace` 导入（功能插件不得运行时导入另一功能插件的值）。可见性与左侧边栏一致：子代理行折入其父、已归档行隐藏、只显示选中的 blank 行。会话在有待处理交互（approval、plan-review、question）、plan mode 开启、正在运行、存在运行中的子代理后代、或已完成但未打开时为进行中。进行中的行按相位优先级（先 awaiting，再 plan、running、subagents、done）排在最前，其后按最近度；空闲的行按最近度排在后面。运行中的子代理计数使用 UI Workspace 域所做的同一个小型谱系遍历，在此重新表达，让面板拥有自己的投影。

每行显示一个相位状态点（awaiting/planning 为 warning，running/subagents 为 ongoing，done 为 finished）、标题、所属工作区标签与相对时间；点击它打开那个会话。文案是 `sessionsPanel` locale 命名空间，en 与 zh。

## 考虑过的替代方案

**左侧边栏的扁平列表。** 工作区浏览器已经带有一个「分组方式：单列表」的扁平模式；它跨工作区列出每个会话，但不隔离进行中的，而且它住在与对话抢空间的左列。不作为答案，因为它不能把「打开」的会话提到最前。

**左侧边栏里的只显示进行中的过滤器。** 拒绝：它把工作区浏览器已有的两种分组模式与第三个轴缠在一起，而面板的目的是一个持久、始终可用的、在对话旁的视图。

**从 `ui-workspace` 导入 `derivePhase`。** 被导出规则拒绝：功能插件不得运行时导入另一功能插件的值。分类器很小，重新表达，符合 UI Subagent 与 UI Workspace 域各自投影自己视图的既有先例。

**根作用域面板。** 拒绝：`sidebar.right.pane.tab` 坑位是会话作用域，根作用域 tab 需要新的坑位。面板作为一个锚定在主会话上的启动器工作；从它打开会话只是移动对话焦点。

## 后果

- 正在工作或等待操作者的会话无需展开工作区文件夹即可看见：Sessions tab 跨工作区把进行中的会话排在最前，All 过滤器在下面露出空闲历史。
- 面板是会话作用域，所以在一个会话里打开 tab 不会装进另一个会话。这一点是明说的，不是隐藏的。
- 相位分类器镜像左侧边栏但并非逐字节一致；两者可能漂移，这是导出规则被接受的代价。

## 测试

`tests/active.client.spec.ts` 覆盖分类、排序、id 平局在两个方向上的处理、子代理谱系折叠、归档与 blank 可见性、空输入。`tests/sessions-panel.client.spec.tsx` 覆盖 Active/All 过滤器、点击打开、空状态、工作区标签、首个标签优先、相位状态点与相对时间。`tests/apply.client.spec.ts` 与 `tests/definition.client.spec.ts` 覆盖注册、inject face 与拆除。所有源文件达到每文件 100% 覆盖，且完整客户端聚合 typecheck 与 `verify-client-packages` 通过。

## 延期

- 「跟随会话」的小改进：点击一行时也把 Sessions tab 打开进目标会话。
- 一个直接打开 Sessions tab 的专用工具栏按钮或键盘快捷键，替代两次点击的 guide 门户。

## 相关

- [Right Sidebar 停靠基础设施](2026-09-04-right-sidebar-docking-infrastructure.md) - 面板与窗格。
- [Sidebar tab 类型与导航](../architecture/2026-09-05-sidebar-tab-types-and-navigation.md) - 注册表、档位与 `openTab`。
- [Sidebar 文本预览与文件树](2026-09-05-sidebar-text-preview-and-file-tree.md) - 本包沿用的外部类型模板。

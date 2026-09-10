# Agent Note: 侧边栏 All Sessions 区段

Status: implemented

[English](2026-09-10-sidebar-all-sessions.md) | 中文

## Problem

侧边栏把会话嵌套在工作区文件夹下，而工作区又位于命名分组之下。要找到某个会话，必须先知道它属于哪个工作区并展开对应分组；完全不属于任何工作区的会话很容易被忽略。

## Decision

新增一个 `sidebar.allSessions` 插槽，由 ui-sidebar 声明、由 ui-workspace 填充，在工作区浏览区上方渲染一个可折叠的 "All Sessions" 区段。展开后按最近更新顺序列出所有未归档会话；每一行显示实时状态标记、会话标题，以及所属工作区标题（未分组会话显示其 cwd 的 basename）。点击某行会通过 `uiWorkspace.openSession` 打开该会话，与浏览区行使用同一条导航路径。折叠标记存放在新的 `dsh.workspace.allSessions.v1` store 中，默认展开。该区段仅宽栏显示：折叠的窄栏保留自己的图标。

## Alternatives considered

**复用现有的 "单列表" 扁平模式。** 它已经列出所有会话，但会替换工作区树而不是位于其上方，且其行缺少工作区标签，无法一眼看出会话位于何处。

**渲染在工作区浏览区的滚动区域内。** 只保留一条滚动条，但会把快捷导航列表耦合到浏览区的搜索和视图选项状态，而该区段不应共享这些状态。

## Consequences

外壳按顺序渲染两个区段插槽，all-sessions 位于 workspaces 之上。推导复用了扁平列表的 `sessionVisible` 和 `sessionNode`，因此归档、空白和子代理过滤保持一致。新增的 store、推导、组件、locale、外壳顺序和注册测试覆盖了该区段。

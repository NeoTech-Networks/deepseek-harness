# Agent Note: 侧边栏中的持久化会话状态图标

Status: proposed

[English](2026-09-07-session-status.md) | 中文

## Problem

侧边栏行已经为每个会话推导一个阶段，并为颜色无法区分的情况绘制四个字形（等待审批、等待计划审阅、等待回答、plan mode），但它没有操作者实际需要分类的状态词表：等待部署短语的会话、卡在操作者身上的会话、已完成的会话，以及自身回合已结束但子代理仍在运行的会话。前三者在整个 harness 中都没有表示，第四者与会话自身工作使用同一个动画点。

已废弃分支 `feat/session-phase-shortcuts` 上的早期功能笔记曾把这一需求描述为持久化操作者指定阶段的“阶段 2”。该阶段在此落地，但有一处重命名：已声明的值叫 **status** 而非 phase，因为 `SessionPhase` 已经在 `ui-workspace/tree.ts` 中命名了推导出的行状态。

## Proposal

一个已声明的、与模型无关的状态，带两条写入路径和一个免费回退。

- **持久化状态。** `@deepseek-ai/dsh-session-status` 拥有整值 `session/status` 事件、`sessionStatus` 投影、经校验的词表和解析服务。事件携带完整的 `{ id, label, icon, tone }`，因此之后的词表编辑无法回头改变已记录的行。任何人工来源的 `user/message` 都会清除状态，因为提示回答了状态所等待的事情。
- **两条写入路径。** `@deepseek-ai/dsh-tool-session-status` 给模型 `set_session_status`，`@deepseek-ai/dsh-command-session-status` 给人类 `/status`。Session Controller 增加 `setStatus` 和 `listStatuses` 远程方法，使行菜单能给操作者提供与工具给模型相同的词表。工具和命令是 harness 插件，因此在每条模型后端上行为一致。
- **免费 goal 回退。** 行推导把 `blocked` 目标映射到 `stuck`、`complete` 目标映射到 `finished`、`paused` 目标映射到 `paused`，因此通过目标工具管理目标的会话无需第二次声明即可点亮图标。
- **优先级。** 已声明状态位于三个阻塞操作者的阶段之下，位于 plan mode 和活动之上。过期的“finished”标签绝不会隐藏等待操作者的会话，而且新提示反正会清除该标签。
- **子代理字形。** `subagents` 有自己的字形，因此动画点现在精确表示“本会话正在工作”，而非“本会话或其下属”。

内置词表为 `waiting-production`（attention，`right-up`）、`stuck`（error，`stop`）、`finished`（success，`check`）、`waiting-external`（attention，`clock`）、`paused`（neutral，`pause`），取自现有 74 个 `ui-primitives` 字形。

## Alternatives considered

- **根据回合结果推导状态。** 拒绝：操作者明确要求 `stuck` 只在会话自己声明时触发，绝不根据失败请求。
- **只保留一个点、仅用颜色编码阶段。** 拒绝：三个阻塞操作者的阶段仍无法区分，而且给 10px 的点加更多颜色比加字形退化得更快。
- **把状态存在客户端 localStorage。** 拒绝：无法在第二个浏览器存活，不会出现在冷行上，也不会随会话分叉。

## Acceptance criteria

混合会话的侧边栏一眼可读，每个状态一行，字形与色调正确；每行仍向屏幕阅读器和悬停卡报告每个实时状态；状态在重载、恢复和分叉后仍然存在；新提示清除它；未知 id 是渲染错误而非崩溃。

## Risks

- **已声明状态会取代运行点。** 标记为 `finished` 而子代理仍在运行的会话显示标签而非活动。有意为之，悬停卡仍列出运行中的后代。
- **从不调用工具的模型。** 该行与今天完全一致；goal 回退和行菜单是两条修正路径。
- **投影缓存未热之前的冷行。** 该行与今天一致。不可见且自愈。

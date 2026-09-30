---
description: "session-status 分组图：持久化已声明会话状态（等待部署、卡住、已完成），附带一个模型工具和一个人工命令，供用户与维护者浏览本分组。"
kind: "package-group"
---

# packages/session-status

[English](README.md) | 中文

## 概述

session-status 分组为会话提供一个持久化、与模型无关的状态，让侧边栏一眼就能看到。服务保存状态词表和 `session/status` 事件，模型工具让智能体在不读取模型文本的情况下声明状态，`/status` 命令给人类直接控制。状态写入会话日志，因此在重载、恢复和分叉后仍然存在，人工提示会清除它。除非部署自建词表，否则只有内置状态生效。

## 目录

- [Packages](#packages)
- [Related documentation](#related-documentation)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`session-status`](session-status/README.zh.md) | 词表、`session/status` 事件、`sessionStatus` 投影和解析服务 | `ctx.sessionStatus` |
| [`tool-session-status`](tool-session-status/README.zh.md) | 模型工具 `set_session_status` | 注册在 `ctx.tools` |
| [`command-session-status`](command-session-status/README.zh.md) | UI 命令平面中的人工 `/status` 命令 | 注册在 `ctx.commands` |

-----

<a id="related-documentation"></a>
## Related documentation

- [Session status subsystem](../../docs/subsystems/session-status.zh.md): `session/status` 事件、`sessionStatus` 投影与状态词表类型。
- [Generated configuration catalog](../../docs/config-catalog.zh.md#deepseek-aidsh-session-status): 服务接受的词表字段。
- [Generated tool catalog](../../docs/tool-catalog.zh.md#deepseek-aidsh-tool-session-status): 模型收到的 `set_session_status` schema。
- [session-status Agent Note](../../.agents/notes/proposed/feature/2026-09-07-session-status.zh.md): 设计记录。

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers: click to expand</summary>

目标阶段回退（`blocked` 目标映射到 `stuck`，`complete` 目标映射到 `finished`）在客户端行推导中实现，而非这里，因为 goal 投影是它自己的域，映射仅用于展示。

</details>

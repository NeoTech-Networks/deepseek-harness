---
description: "用工具调度器处的独立策略文件限制每个 DS Bot 的写入范围，先于所有 hook 执行，适用于运行 Bot 团队的部署。"
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-bot-tool-policy

[English](README.md) | 中文

## 概述

`dsh-experimental-bot-tool-policy` 为 DS Bot 团队中的每个 Bot 设定各自的写入范围。否则 Bot 会继承操作者整台机器的权限，而它的职责只写在指令里。本插件在任何 hook 运行之前检查每次文件和 shell 调用：除非有授权覆盖目标路径，否则拒绝写入；任何 Bot 都不能写入 Bot 存储；任何工具都不能读取 Bot 密钥文件。规则保存在独立文件中，因此无需改动 Bot 记录即可查看、比较和回退。本包为实验性质：不进入官方发布，也不提供稳定性承诺。

## 目录

- [使用本包](#use-this-package)
- [了解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与后续工作](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## 使用本包

在运行 DS Bot 的 profile 中挂载：

```yaml
# per-bot tool policy, read from the DeepSeek Harness home
- name: '@deepseek-ai/dsh-experimental-bot-tool-policy'
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `policyPath` | DeepSeek Harness 主目录下的 `bot/tool-policy.json` | 保存规则的独立文件 |
| `storePath` | DeepSeek Harness 主目录下的 `bot/state.json` | DS Bot 存储，只读取以把 Session 对应到 Bot，绝不写入 |

把 [`tool-policy.example.json`](tool-policy.example.json) 复制到 `policyPath` 后再编辑。修改对下一次工具调用立即生效，无需重启。

### 独立策略文件

| 字段 | 含义 |
|---|---|
| `version` | 固定为 `1` |
| `secretFiles` | 任何 Bot 都不能用任何工具读取的绝对路径文件 |
| `secretCommandFragments` | 出现在 shell 命令任意位置即被拒绝的路径文本，使用正斜杠书写 |
| `operatorRoot` | `root` 是任何 Bot 都不能写入的目录，`except` 是不受其约束的子目录 |
| `everyone` | 所有 Bot 都获得的授权 |
| `tiers` | 共享授权的具名 Bot 集合 |
| `bots` | 单个 Bot 的授权，以显示名称为键 |

授权沿用 DS Bot `browserGrants` 条目的字段：`root` 是覆盖的路径，`kinds` 为 `["write"]`，可选的 `until` 以毫秒时间戳表示到期时间。

### Bot 能做什么

Bot 可以读取除密钥文件外的任何路径，也可以运行任何未提及密钥文件的 shell 命令。它只能写入授予它的根路径之下。未知 Session 和非 Bot Session 永远不受检查。子代理按其父 Session 链顶端的 Bot 检查。

### 失败时的表现

被拒绝的调用向模型返回一条错误，其中写明 Bot、路径和允许的根路径。当策略文件缺失、为空或格式错误，或 Bot 存储无法读取时，所有调用都会放行，并记录一条警告说明策略处于放行状态及其原因。损坏的策略绝不能让团队停摆，因此日志中的警告是保护失效的唯一提示。

-----

<a id="understand-the-implementation"></a>
## 了解实现

<details>
<summary>实现细节：点击展开</summary>

### 源码地图

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 插件入口：`tools/pre-execute` 监听器、文件缓存、调用方查找、放行报告 |
| [`src/decide.ts`](src/decide.ts) | 工具分类与允许或拒绝的判定 |
| [`src/policy.ts`](src/policy.ts) | 独立文件的类型与校验 |
| [`src/roster.ts`](src/roster.ts) | 基于 Bot 存储的只读 Session 索引 |

未发布运行时不变量伴生模块；本策略插件不拥有事件历史或持久状态，只把两个文件作为输入读取。

### 顺序

监听器以 `prepend: true` 注册在 `tools/pre-execute` 上，因为 Claude Code 和 Codex 的 hook 桥接使用同一阶段。被拒绝的调用不会到达任何 hook。权限审批和工具主体在其后运行。

### 身份

Bot 的存储键是它的记录 id。在 Bot 切换到新分段之前，这个 id 同时也是活跃 Session；切换后记录才会带上 `sessionId`。索引覆盖键、`sessionId`、`segments` 中的早期分段，以及每个群聊的成员 Session，因此来自其中任何一个的调用都能解析到该 Bot。

### 路径

相对路径与文件系统工具一样，按 Session 的 `cwd` 解析。每个目标都会按书写形式和文件系统解析后的形式分别检查，因此允许根路径内指向外部的链接会被拒绝。前缀比较按完整路径段进行，Windows 路径忽略大小写。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [原生 Bot 工具策略 Agent Note](../../../.agents/notes/implemented/feature/2026-10-31-native-bot-tool-policy.zh.md) 记录了策略为何位于调度器并读取独立文件。
- [实验性包规则](../AGENTS.md) 说明放置与转正要求。

-----

<a id="model-experience"></a>
## 模型体验

### 拒绝

#### 模型看到的内容

被拒绝的调用返回一条错误工具结果，例如 `Backlink Scout may not write to C:\repos\abc\app.py. Allowed write roots for Backlink Scout: C:\bot\workspace, C:\exports.` 本插件不向系统提示词或工具 schema 添加任何内容。

#### Token 影响

只有被拒绝的调用才会增加 token，即错误结果的文本。允许的调用不增加。

#### KV Cache 影响

无。本插件不改变任何可复用前缀；拒绝结果与其他工具结果一样追加在其后。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与后续工作

- **实验性原型，不提供稳定性承诺**：本包为私有包，不进入官方发布，孵化期间其约定可随时变化。
- **不检查 shell 写入**：只在 shell 命令中搜索密钥路径，因为误解析命令会阻塞正常工作。Bot 仍可通过 shell 写入其账户能写的任何位置，运行时拼接出的密钥路径也不会被发现。
- **失败时放行**：策略文件缺失或损坏会解除保护，只留下一条日志警告。
- **子代理依赖活跃的父 Session 解析**：父 Session 已不在内存且不在存储中的子代理，会被视为非 Bot Session。

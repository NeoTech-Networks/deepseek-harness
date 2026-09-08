---
description: "操作者固定的目录，以及针对它们的无限制列目录与读文件：右侧栏资源管理器背后的 pinnedFiles Remote 命名空间。"
kind: "package-reference"
---

# @deepseek-ai/dsh-api-pinned-files

[English](README.md) | 中文

## 概述

本服务保存操作者在 Host 机器上固定的目录清单，并在这些目录中列目录、读文件。清单存放在 `pinned-files` 设置命名空间，也就是 `$DSH_HOME/settings.yaml` 的一节：重启后依然存在，在每个 Session 和每个 Workspace 中都相同，也可以手工编辑。这里没有任何东西按 Session 作用域，这正是重点；按 Session 作用域的文件服务已经存在，即 [`dsh-api-workspace-files`](../workspace-files/README.md)。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [Model Experience](#model-experience)
- [已知限制与未尽事项](#known-limitations-and-deferred-work)
- [开发者备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

只需挂载一行；它所需的设置 provider 已经在 base bundle 中。

```yaml
- id: pinned-files
  name: '@deepseek-ai/dsh-api-pinned-files'
```

浏览器端在 `inject` 中声明 `remote` 与 `remote.pinnedFiles` 后，调用 `ctx.remote.pinnedFiles` 上的方法：

| 方法 | 返回 |
|---|---|
| `state()` | 每个固定根目录及其标签、当前是否可访问，以及 `autoOpen` 偏好 |
| `addRoot(path)` | 固定一个绝对路径目录并返回新状态；重复固定不会改变任何东西，也不会失败 |
| `removeRoot(path)` | 取消固定并返回新状态；未固定的路径保持原样 |
| `setAutoOpen(flag)` | 记录资源管理器是否在每个 Session 中自动打开 |
| `list(path)` | 一个目录的直接子项，每项带自己的绝对路径，受 `maxEntries` 限制 |
| `read(path)` | 一个普通文件的完整解码文本，超过 `maxBytes` 则拒绝 |

失败一律是带 `pinned-files/*` 代码的 `RemoteError`：`not-found`、`not-directory`、`not-absolute`、`unreadable`、`not-writable`、`not-regular-file`、`too-large`、`not-text`。

### 设置片段

```yaml
pinned-files:
  roots:
    - C:/Projects/repos
    - C:/Claude/skills
  autoOpen: false
```

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部细节 — 点击展开</summary>

通过 `ctx.fs` 的读取在设计上不受限制：沙箱后端只围栏写入与编辑。因此 `workspace-files` 自己加了一道包含性校验，而本服务刻意不加。取代那道校验的是「授权来自作者」：一个路径之所以可达，是因为操作者亲手把它输入或选入了自己的设置文档，没有任何模型能选择它。

有四条规则代替工作区围栏。路径在任何文件系统调用之前必须是绝对路径，因此不会相对于 Host 进程的 cwd（在 Windows 上还有当前驱动器）解析。只列目录，也只允许固定目录。条目上限与字节上限都是经过校验的 Config，超过字节上限的文件是被拒绝而不是被截断。每种失败都是一个 `RemoteError`。

文件是整读而非分页。固定的文件是拿来在窄栏里扫一眼的；分页是阅读界面的问题，而 Agent 正在处理的文件的阅读界面是 `workspace-files`，它已经有分页了。

</details>

-----

<a id="model-experience"></a>
## Model Experience

None, as this service answers browser calls about the operator's own directories and registers no tool, prompt section, or session event.

#### KV Cache effect

None; directory listings and file reads travel over the Remote and assemble no model request.

## 已知限制与未尽事项

<a id="known-limitations-and-deferred-work"></a>

- **没有工作区围栏。** 任何能访问 `/api` 的浏览器都可以列出并读取 Host 账户能访问的任何位置。挡在前面的是 Connection 的 `trustedHosts` 边界，因此放宽该边界的部署必须先就这一行做出决定。
- **只在根目录之下列目录。** 每一层不会重新校验祖先关系，因此已经知道路径的调用方无需固定任何东西即可列出它；根目录清单是便利清单，不是授权清单。
- **不监听变化。** 只有调用方再次询问时，某一层才会更新。
- **整文件读取。** 没有分页、没有字节窗口、没有二进制预览：超过上限的文件直接被拒绝。

<a id="dev-note"></a>
### 开发者备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>

**Runtime invariant:** No companion is published. The root list has exactly one home, the settings document, and every write goes through the registered scope, so there is no second observation of it to compare against.

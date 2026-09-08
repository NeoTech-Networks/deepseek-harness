---
description: "Operator-pinned directories and unconfined listings and reads for them: the pinnedFiles Remote namespace behind the right Sidebar's explorer."
kind: "package-reference"
---

# @deepseek-ai/dsh-api-pinned-files

English | [中文](README.zh.md)

## Summary

This service holds the list of directories the operator pinned on the Host machine, and lists and reads inside them. The list lives in the `pinned-files` settings namespace, so it is one section of `$DSH_HOME/settings.yaml`: it survives restarts, is the same in every Session and every Workspace, and can be edited by hand. Nothing here is scoped to a Session, which is the whole point; a Session-scoped file service already exists and is [`dsh-api-workspace-files`](../workspace-files/README.md).

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount one row; the settings provider it needs is already in the base bundle.

```yaml
- id: pinned-files
  name: '@deepseek-ai/dsh-api-pinned-files'
```

The browser then calls five methods on `ctx.remote.pinnedFiles`, having injected `remote` and `remote.pinnedFiles`:

| Method | Answers |
|---|---|
| `state()` | every pinned root with its label and whether it is reachable right now, plus the `autoOpen` preference |
| `addRoot(path)` | pins one absolute directory and answers the new state; pinning one already pinned changes nothing and fails nothing |
| `removeRoot(path)` | unpins one directory and answers the new state; a path that is not pinned is left alone |
| `setAutoOpen(flag)` | records whether the explorer opens itself in every Session |
| `list(path)` | one directory's direct children, each with its own absolute path, bounded by `maxEntries` |
| `read(path)` | one regular file's whole decoded text, refused above `maxBytes` |

Failures are `RemoteError` with a `pinned-files/*` code: `not-found`, `not-directory`, `not-absolute`, `unreadable`, `not-writable`, `not-regular-file`, `too-large`, `not-text`.

### The settings section

```yaml
pinned-files:
  roots:
    - C:/Projects/repos
    - C:/Claude/skills
  autoOpen: true
```

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

Reads through `ctx.fs` are unconfined by design: the sandboxing backend fences writes and edits only. `workspace-files` therefore adds its own containment gate, and this service deliberately does not. What replaces that gate is authorship: a path only becomes reachable because the operator typed or picked it into their own settings document, and no model chooses one.

Four rules stand in for the workspace fence. A path must be absolute before any filesystem call, so nothing resolves against the Host process cwd or, on Windows, its current drive. Only directories are listed and only directories may be pinned. The entry and byte caps are validated Config, and a file above the byte cap is refused with its size rather than shortened. Every failure is one `RemoteError` per reason.

A file is read whole rather than paged. A pinned file is opened to be glanced at in a narrow column; paging is a reading surface's problem, and the reading surface for a file an Agent is working on is `workspace-files`, which already has it.

</details>

-----

<a id="model-experience"></a>
## Model Experience

None, as this service answers browser calls about the operator's own directories and registers no tool, prompt section, or session event.

#### KV Cache effect

None; directory listings and file reads travel over the Remote and assemble no model request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **No workspace fence.** Any browser that can reach `/api` can list and read anywhere the Host account can. The Connection's `trustedHosts` boundary is what stands in front of it, so a deployment that widens that boundary must decide about this row first.
- **Listing only below a root.** Ancestry is not re-checked per level, so a caller that already knows a path can list it without pinning anything; the roots are a convenience list, not an authorization list.
- **No watching.** A level changes only when the caller asks again.
- **Whole-file reads.** No paging, no byte windows, no binary preview: a file past the cap is refused outright.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The root list has exactly one home, the settings document, and every write goes through the registered scope, so there is no second observation of it to compare against.

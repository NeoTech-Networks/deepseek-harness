---
description: "Limit what each DS Bot may write, from a side file checked at the tool dispatcher ahead of every hook, for deployments running a bot team."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-bot-tool-policy

English | [中文](README.zh.md)

## Summary

`dsh-experimental-bot-tool-policy` gives each bot on a DS Bot team its own write limits. A bot otherwise inherits the operator's whole machine, and its role lives only in its instructions. This plugin checks each file and shell call before any hook runs: a write is refused unless a grant covers the path, the bot store is written by no bot, and the bot secrets file is reached by no tool. Rules live in a side file, so they can be read, compared, and reverted without touching the bot records. It is experimental: excluded from official releases, with no stability promise.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Mount it in a profile that runs DS Bot:

```yaml
# per-bot tool policy, read from the DeepSeek Harness home
- name: '@deepseek-ai/dsh-experimental-bot-tool-policy'
```

| Field | Default | Meaning |
|---|---|---|
| `policyPath` | `bot/tool-policy.json` under the DeepSeek Harness home | The side file holding the rules |
| `storePath` | `bot/state.json` under the DeepSeek Harness home | The DS Bot store, read to map a Session to its bot and never written |

Copy [`tool-policy.example.json`](tool-policy.example.json) to `policyPath` and edit it. An edit applies to the next tool call, with no restart.

### The side file

| Field | Meaning |
|---|---|
| `version` | Always `1` |
| `secretFiles` | Absolute files no bot reads with any tool |
| `secretCommandFragments` | Path text refused anywhere in a shell command, written with forward slashes |
| `operatorRoot` | `root`, the directory no bot writes, and `except`, the subfolders it does not cover |
| `everyone` | Grants every bot receives |
| `tiers` | Named sets of bots with shared grants |
| `bots` | Grants for one bot, keyed by its display name |

A grant has the fields of a DS Bot `browserGrants` entry: `root` is the path it reaches, `kinds` is `["write"]`, and an optional `until` in epoch milliseconds expires it.

### What a bot can do

A bot may read any path except a secret file, and may run any shell command that does not name one. It may write only under a root granted to it. An unknown or non-bot Session is never checked. A subagent is checked as the bot at the root of its parent Sessions.

### What failure looks like

A refused call returns an error to the model that names the bot, the path, and its allowed roots. When the policy file is missing, empty, or malformed, or the bot store cannot be read, every call is allowed and one warning says the policy is failing open and why. A broken policy must never stop the team, so a warning in the log is the only sign the protection is off.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals: click to expand</summary>

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry: `tools/pre-execute` listener, file caching, caller lookup, fail-open reporting |
| [`src/decide.ts`](src/decide.ts) | Tool classification and the allow or deny decision |
| [`src/policy.ts`](src/policy.ts) | Side-file types and validation |
| [`src/roster.ts`](src/roster.ts) | Read-only Session index over the bot store |

No runtime invariant companion is published; this policy plugin owns no event history and no durable state, and reads its two files as input.

### Order

The listener registers on `tools/pre-execute` with `prepend: true`, because the Claude Code and Codex hook bridges use the same stage. A refused call reaches no hook. Permission approval and tool bodies run later still.

### Identity

The store key of a bot is its record id. That id is also the live Session until the bot moves to a fresh part, when the record gains `sessionId`. The index covers the key, `sessionId`, earlier parts in `segments`, and each room's member Sessions, so a call from any of them resolves to the bot.

### Paths

A relative path resolves against the Session `cwd`, as the filesystem tools do. Each target is checked as spelled and as the file system resolves it, so a link inside an allowed root that leads outside is refused. Prefix tests use whole path segments and fold case for Windows paths.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Native bot tool policy Agent Note](../../../.agents/notes/implemented/feature/2026-10-31-native-bot-tool-policy.md) records why the policy sits at the dispatcher and reads a side file.
- [Experimental package rules](../AGENTS.md) cover placement and promotion.

-----

<a id="model-experience"></a>
## Model Experience

### Refusals

#### What the model sees

A refused call returns one error tool result, for example `Backlink Scout may not write to C:\repos\abc\app.py. Allowed write roots for Backlink Scout: C:\bot\workspace, C:\exports.` The plugin adds nothing to the system prompt or the tool schemas.

#### Token effect

Only a refused call adds tokens: the text of its error result. An allowed call adds none.

#### KV Cache effect

None. The plugin changes no reusable prefix; a refusal appends after it like any other tool result.

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- **Experimental prototype with no stability promise**: the package is private, excluded from official releases, and its contracts change freely while it incubates.
- **Shell writes are not checked**: a shell command is searched for secret paths only, because a mis-parsed command would block real work. A bot can still write anywhere its account can through a shell, and a command that builds a secret path at run time is not seen.
- **Fails open**: a missing or broken policy file removes the protection and leaves only a log warning.
- **A subagent resolves through live parents**: a subagent whose parent Session is no longer loaded and is not in the store reads as a non-bot Session.

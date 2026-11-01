# Agent Note: Native per-bot tool policy

Status: implemented

English | [中文](2026-10-31-native-bot-tool-policy.zh.md)

## Problem

A DS Bot inherits the operator's full file access. The file sandbox policy is one setting for a Session, and a bot's role lives only in its instructions. The only limit on a SIG content bot writing into another business's repository was a PreToolUse hook, which runs outside the harness and only for Sessions the hook bridge translates. That hook also read the bot store by record key alone on its first live test, so it failed open on every live call.

## Decision

`@deepseek-ai/dsh-experimental-bot-tool-policy` checks calls at `tools/pre-execute`, registered with `prepend: true`, because the Claude Code and Codex hook bridges use that same stage. It holds whichever hooks are mounted, and a refused call reaches none of them.

The rules are the hook's rules: writes are denied unless a grant reaches the path, one operator root is written by no bot, a secret file is refused on read and when named in a shell command, and a non-bot Session is never checked.

The policy is a side file. It is not migrated into bot records, because a migration rewrites the operator's live store. A side file is reversible, comparable, and testable without touching state. The plugin reads the store and writes neither file. A grant keeps the fields of a DS Bot `browserGrants` entry and is resolved when the call is made.

A bot's Sessions are indexed by record key, `sessionId`, earlier parts, and room member Sessions. In the store this note was written against, 22 of 31 bots had no `sessionId` because the key was still the live Session, and rooms held 27 member Sessions the hook never indexed. A subagent is checked as the bot at the root of its parent Sessions, so spawning one does not lift the limits.

A missing, empty, or malformed policy file allows the call and logs one warning. A broken guard must not stop the team, and a guard that cannot read its policy has no rule to apply.

## Alternatives considered

**Keep the hook.** It runs only for translated Sessions, and it depends on a subprocess for every call.

**Add fields to bot records.** Rejected for the reason above: the store is the operator's to change, and a policy file can be reverted alone.

**Register at `tools/execute`.** That stage runs after every hook, so hooks would see calls the policy refuses.

**Parse shell writes.** A mis-parsed command blocks real work, and a false denial costs more than this gap. The gap is documented in the package README.

**Fail closed.** A faulty policy file would stop every bot at once.

## Consequences

A bot can still write through a shell. The protection is off, with only a log warning, whenever the policy file is broken. The package is experimental, so a deployment must mount it and supply the policy file itself, and the hook stays in place until a deployment has done so and the same acceptance suite has passed there.

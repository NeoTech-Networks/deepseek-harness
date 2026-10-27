# NEXT_SESSION_PROMPT (one current pointer)

0.2.1-rc.4 is INSTALLED (2026-10-27 19:12) and read back: `DisplayVersion` 0.2.1-rc.4
with one uninstall row, 43 of 43 features on the installed asar, the `listable`
guard present in that asar, settings all `same`, `HARDLINK OK (final)`, and the
hook bridge re-pinned at exactly 0.2.1-rc.4 with the app restarted after it
(process 19:14:08 > plugin 19:13:55). It is an npm-only release with no upstream
tag, so it was backported, and the backport is proved by the built
`mcp-client/lib/index.js` being byte-identical to the published rc.4 artifact.
Branch `update/v0.2.1-rc.4` in `C:\d214` and tag `dsh-v0.2.1-rc.4-fork` are pushed.

Next, in this order:

1. Start one NEW session in the app and send any prompt, then read its log for
   `hook/result` at `exitCode 0` on UserPromptSubmit, PreToolUse, PostToolUse and
   Stop plus a SessionStart card (`node C:\Projects\temp\read_session_hooks.mjs
   "<session file v4 zstd>" "2026-10-27T19:14"`). Nothing has run a turn since the
   restart, so this is the one arm still open.
2. One real MCP call from that session, and the mode picker read on screen
   (Developer tools may be needed to see the chip).
3. Then the older visual items: press the composer buttons in a scratch session
   (OPEN_ISSUES 12), photograph the lower workspace-picker headings (14), and
   diagnose the four all-sessions spec failures (13).

The `ds-harness-update` skill is v7 (four identical copies on disk) and still
uncommitted in the shared `C:\Claude` checkout (OPEN_ISSUES 4 and 19).

Session log: `C:\Projects\logs\2026-10-27\dsh-rc4-backport\`.

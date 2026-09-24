# Next session prompt

Continue deepseek-harness. The desktop app runs **0.1.7-rc.2**, installed 2026-09-24 from
`C:\d172`, branch `update/v0.1.7-rc.2` (HEAD `9befa83826`, pushed with tag `dsh-v0.1.7-rc.2`).
The next update REPLAYS the stack from `update/v0.1.7-rc.2` onto the new tag (skill
`ds-harness-update`, Step 4). Read CURRENT_STATE and VERIFICATION_RESULTS 2026-09-24 first.

## Open verification (OPEN_ISSUES 44)

rc.2: PreToolUse/PostToolUse and a real MCP call not yet seen on rc.2; mode picker not seen on
screen (it shows only with Developer tools on). Also still open: OPEN_ISSUES 38 (footer and
Ctrl+Shift+A on screen), 42 (`dsh_update_check.py` reads the removed seed file), 37 (the
skill edit in `C:\Claude` to land through a worktree PR).

## Rules that still hold

- Never run `state_file_cap.py --repo` or `state_file_reconcile.py --apply` on this repo.
- Never run the installer from inside the app.

Runbook: `C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` (ledger 56 to 62).

# Next session prompt

Continue deepseek-harness. The desktop app runs **0.1.7-rc.1**, installed and verified
2026-09-24 (branch `update/v0.1.7-rc.1`, HEAD `e3bed68e71`, build worktree `C:\d17`).
Nothing is pending an install. Read CURRENT_STATE and VERIFICATION_RESULTS 2026-09-24 first.

## Open work, in priority order

1. **Land the `C:\Claude` changes (OPEN_ISSUES 37).** The shared checkout is about 80
   commits behind and holds other sessions' uncommitted work. The `ds-harness-update`
   skill rewrite for 0.1.7 sits there uncommitted: commit it through a worktree PR,
   with `skill_version.py ds-harness-update --bump`. Do not commit in the shared checkout.
2. **Repoint `dsh_update_check.py` (OPEN_ISSUES 42)**: it reads the removed seed file and
   says `installed NOT FOUND`. Read the uninstall key instead.
3. **See the two unseen features (OPEN_ISSUES 38)**: the Session footer on a dashboard
   Session, and Ctrl+Shift+A on a throwaway session. OPEN_ISSUES 36(b) and 36(c) are
   satisfied by the 2026-09-24 verification; archive item 36 when 38 closes.
4. **Upstream `dsh-v0.1.7-rc.2` exists (2026-09-24).** Not taken. If the operator wants it:
   run the `ds-harness-update` skill (now written for 0.1.7), worktree at a SHORT root such
   as `C:\d172`, `CI=true`, `.env.windows`, `package:desktop:win:x64:unsigned`, and
   re-derive the operator's mode (OPEN_ISSUES 39).
5. **Housekeeping, not before about 2026-10-01**: remove the 0.1.5 leftovers in `~\.dsh`
   (OPEN_ISSUES 40) and prune the old `C:\Projects\worktrees\dsh-*` trees (OPEN_ISSUES 41).

## Rules that still hold

- Never run `state_file_cap.py --repo` or `state_file_reconcile.py --apply` on this repo
  (skill ledger 21). Push state commits BY SHA from a healthy worktree with `CI=true`.
- Never run the installer from inside the app.

Evidence: `C:\Projects\logs\2026-09-24\dsh-017-port\`. Runbook:
`C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` (section 3A, ledger 42 to 55).

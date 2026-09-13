# Next session prompt

Continue deepseek-harness. A rebuilt `0.1.5-rc.2` installer is packaged and
WAITING ON THE OPERATOR: `finish-install.ps1` force-closes the app, so the
session that built it cannot run it.

## Just built (2026-09-13), not installed yet

Branch `update/v0.1.5-rc.2` now carries two commits:

- `5512545eac` merges PR #21 (`feat/ui-session-footer`). The PREVIOUS install
  had been packaged from this line WITHOUT it, which is why the workspace
  session count and the session footer were missing (13/15 markers).
- `e39f7bf01e` adds four fixes: the whole question card scrolls (one
  scrollport over title, detail and options), `ask_user_question` gains the
  optional `detail` markdown field plus the at-most-two-sentences rule, the
  All Sessions section shows its crash reason and a Retry, and a
  `param(...)`-led pwsh command is wrapped so the UTF-8 preamble cannot break
  it. The `pwsh` tool description now teaches single-quoted patterns, naming
  the shape behind 107 logged `ParserError` failures.

Installer: `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2\apps\desktop\.desktop-build\targets\win-x64\artifacts\deepseek-harness-0.1.5-rc.2-win-x64.exe`,
194,784,998 bytes, 2026-09-13 11:08.

## What is left

- (operator) install it, then fill the skill's Step 7 table. `finish-install.ps1`
  now enforces settings retention (`471e72742e`): it refuses to install without a
  fresh snapshot, restores while the app is closed, and repairs any post-setup
  drift by itself, ending on `REPAIRED` or `STILL DRIFTED`.
- After install: `py C:\Claude\bin\dsh_local_features_check.py` must read 18/18
  (15 original plus `question-card-scroll`, `all-sessions-recovery`,
  `pwsh-param-led`).
- EYEBALL three things nothing has ever looked at: the workspace session-count
  badge, the session footer (summary plus dashboard link), and a long question
  card scrolling from its first line to its last option with the buttons pinned.
- All Sessions root cause is STILL OPEN (OPEN_ISSUES item 27-update). The
  recovery row now puts the crash message on screen; get that message, then
  write the failing test at the named seam before changing anything.
- Step 8 housekeeping: playbook version-history table, error ledger, CHANGES.md
  for this build.

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master`. The RC line is
`update/v0.1.5-rc.2` in worktree `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`,
HEAD `e39f7bf01e`, clean and equal to origin. Evidence for this build lives in
`C:\Projects\logs\2026-09-13\dsh-ui-fixes\`.

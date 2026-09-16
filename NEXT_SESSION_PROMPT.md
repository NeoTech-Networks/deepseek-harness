# Next session prompt

Continue deepseek-harness. TWO changes are BUILT, PACKAGED AND ON THE RELEASE
LINE, and NEITHER IS INSTALLED (2026-09-16). Nothing else is waiting on anyone.

## The one job, and it needs the installer run first

One installer carries both changes. The installer force-closes the app, and the
app hosts the session that built it, so the session that wrote this file is gone
by the time you read it. Steve was handed this line to run in a NEW PowerShell
window:

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-archive-shortcut\finish-install.ps1"
```

Repeat it if he has not run it yet. Once he confirms, in this order, keeping the
evidence:

1. `py C:\Claude\bin\dsh_local_features_check.py` reads 20 of 20, exit 0.
2. `~\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-client-ui-workspace\lib\client.js`
   carries `ARCHIVE_CHORD_LATCH_MS` and `sectionShowsWorkspaces`.
3. The `web boot:` line (launch with `ELECTRON_ENABLE_LOGGING=1`, stderr
   redirected) names no entry that failed to activate.
4. Ctrl+Shift+A with the All Sessions list open, then with the workspace tree
   open: the session leaves both and the window shows the New Session view. Then
   once with no session open: a banner, and nothing archived.
5. EYEBALL the sidebar, which is the only arm tests cannot cover: a named group
   header shows a triangle beside the group name, clicking it folds and unfolds
   its Workspaces, and the choice survives an app restart.
6. Read `archivedSessionIds` back out of `~\.dsh\storages\workspace.json` after a
   real archive press.

## What shipped on 2026-09-15 and 2026-09-16

Worktree `C:\Projects\worktrees\dsh-archive-shortcut`, branch
`feat/archive-session-shortcut`, both commits fast-forward merged into
`update/v0.1.5-rc.2` and pushed (both refs read back at `e7b9f7ef6d` from the
remote):

- `1e78c99f4f` Ctrl+Shift+A archives the Session the window is showing, with the
  listener on the always-mounted sidebar browsing region rather than the composer.
- `e7b9f7ef6d` a named Workspace group folds from its own header, with the choice
  persisted. The folded map was added without a persist-key bump on purpose; see
  the 2026-09-16 section of `CURRENT_STATE.md` before touching that store.

Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,914,731 bytes,
2026-09-16 00:19:52. Both markers were read back out of the packaged seed's
ui-workspace `.tgz` before handover. Registry is now 20 features.

## Still open, unchanged

- OPEN_ISSUES 27: the All Sessions rail defect (the section disappears after a
  collapse and expand, and returns only on restart). NOT touched by this work.
- OPEN_ISSUES 29: `deepseek-flash` stalls intermittently; the 25s first-payload
  bound and the retry policy are live.
- OPEN_ISSUES 28: the session footer, the workspace count badge and a long
  question card have still never been eyeballed on screen.
- PRE-EXISTING GATE FAILURE, found 2026-09-15: `verify-client-ui-i18n` exits 1 on
  two hard-coded strings in
  `packages/client/ui-sidebar-explorer/src/client/definition.ts`. Untouched by
  these changes and present on the committed base. Decide whether to fix it or to
  record it as intended.
- Step 8 housekeeping: the 2026-09-15 pass is written (version-history row, error
  ledger 37, CHANGES page). The 2026-09-13 gaps (question-card scroll, pwsh wrap,
  All Sessions recovery) are still owed.
- Not taken up: upstream `dsh-v0.1.6-alpha.1` (2026-09-15). The installed app and
  the local stack are both on `0.1.5-rc.2`, deliberately.

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master` (this file and the other
state files are committed there). The RC line lives in
`C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`, which still carries five
MODIFIED state files left by an earlier session; they are stale copies of the
OPEN_ISSUES-16 kind. Do not commit or publish them, and compare against
`git show origin/master:<file>` before touching any state file in a worktree.

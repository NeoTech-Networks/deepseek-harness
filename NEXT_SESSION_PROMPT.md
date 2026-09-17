# Next session prompt

Continue deepseek-harness. The session footer change is BUILT, TESTED, MERGED and
PACKAGED. The installer is waiting for the operator, and the running app has NOT
been verified.

## The one thing waiting on Steve

Run this in a NEW PowerShell window (Win+R, `powershell`), then choose "Run anyway"
if SmartScreen prompts on the unsigned installer:

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-update-v0.1.5-rc.2\finish-install.ps1"
```

It closes the app, installs silently, clears the stale profile, relaunches, and
prints `SETUP COMPLETE. Running <version>`. It is never run from inside a session:
it force-closes the app that hosts the session. Expect about four minutes with no
window before that line appears; do not re-run it because it looks stuck.

Artifact: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,884,537 bytes,
2026-09-17 01:20:22, built in `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`.

## What to verify after he confirms (all of it is required)

1. `py C:\Claude\bin\dsh_local_features_check.py` reads 21 of 21 markers. The new
   row is `session-footer-design-project` (marker `data-session-footer-line`).
2. The RUNNING profile's `~\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-client-ui-conversation\lib\client.js`
   carries `data-session-footer-line` and no `sessionFooterSummary`.
3. The newest `~\.dsh\desktop\logs\provision-*.log` ends `staged health check passed`,
   `staging profile activated as 0.1.5-rc.2`, `applyRelease finished`.
4. The VISIBLE half, which no read can do: open a Session whose workspace is a
   dashboard folder (for example
   `C:\Projects\repos\vercel-services\packages\dashboards\src\youtube-creator`, or any
   vercel-services worktree of it) and confirm it shows
   `Dashboard: https://ops.theseoitguy.net/youtube-creator` and
   `Design Project: YouTube`; then open one in an ordinary folder and confirm both
   labels are present with empty values and that the grey session summary is GONE.

## What shipped, for the record

- `4980d90f54` host resolver (`packages/api/session-controller/src/workspace-links.ts`,
  wired through `list.ts`, `types.ts`, the client summary and the lineage entry).
- `e15a4fc5f4` the two footer rows, the CSS, the locale pair, and the tests.
- Both fast-forward merged into `update/v0.1.5-rc.2`, both refs read back at
  `e15a4fc5f4`.
- Maps: `~\.dsh\dashboard-links.json` (66 entries) and `~\.dsh\design-links.json`
  (62 entries, every name read from Claude Design). The generator is
  `C:\Claude\bin\dsh_dashboard_links.py`; `list_projects` alone is not enough
  (20 plus 9 projects, no pagination), so it closes the rest with `get_project`.
- The feature registry is now 21 rows.

## Still open elsewhere, unchanged

- OPEN_ISSUES 28: the footer was never eyeballed. This change rebuilds that footer,
  so the item should be closed by the check above or re-stated against the new shape.
- OPEN_ISSUES 27: the All Sessions rail defect. NOT touched.
- PRE-EXISTING GATE FAILURE: `verify-client-ui-i18n` exits 1 on two hard-coded
  strings in `packages/client/ui-sidebar-explorer/src/client/definition.ts`
  (`pinnedText` and the text id). Confirmed identical on `1a77e844ad`.
  Decide whether to fix it or record it as intended.
- PRE-EXISTING TEST FAILURE: `packages/api/session-controller/tests/media-references.host.spec.ts`
  fails on `symlink EPERM` with Developer Mode off, on both lines.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`. The installed app and the local stack
  stay on `0.1.5-rc.2` deliberately.

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master` (the state files live there).
The release line is in `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`, which still
carries five MODIFIED state files left by an earlier session; they are stale copies
of the OPEN_ISSUES-16 kind. Do not commit or publish them, and compare against
`git show origin/master:<file>` before touching any state file in a worktree.
`C:\Projects\worktrees\dsh-footer-links` is this change's feature worktree;
`feat/session-footer-links` is merged and can be deleted when convenient.

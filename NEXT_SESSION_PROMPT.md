# Next session prompt

Continue deepseek-harness. The Session-footer intent fix is BUILT, TESTED, MERGED,
PACKAGED and PUSHED. **The installer is NOT installed yet.**

## First: the install (operator action, one pasted line)

Open a NEW PowerShell window (Win+R, `powershell`) and paste:

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-footer-intent\finish-install.ps1"
```

It force-closes the app, installs silently, clears the stale profile, relaunches and
waits for first-run setup (about four minutes with NO window) before printing
`SETUP COMPLETE. Running 0.1.5-rc.2`. It cannot be run from inside a Session, and it
must not be run a second time because the app "looks stuck".

## Then verify, in this order

1. `py C:\Claude\bin\dsh_local_features_check.py` reads "all 22 local features are
   present in the running build", exit 0, including `session-footer-intent`.
2. Read the RUNNING profile:
   `~\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-api-session-controller\lib\index.js`
   carries `resolveSessionLinks` and `resolveWorkspaceIntent`, and
   `...\dsh-client-ui-conversation\lib\client.js` carries `hasWorkspaceLinks` and
   `data-session-footer`.
3. The newest `~\.dsh\desktop\logs\provision-*.log` ends `staged health check passed`,
   `staging profile activated as 0.1.5-rc.2`, `applyRelease finished`.
4. `Get-Process "DeepSeek Harness"` reports four or more processes, started after the
   install.
5. THE VISUAL ONE, owed since 2026-09-13. Open a Session created in
   `C:\Projects\general\Vercel` whose first message is `/dashboard <key>` or a pasted
   dashboard address. Expected under the message box:
   `Dashboard: https://<front door>/<key>` as a link, and `Design Project: <name>`.
   Then open a Session whose workspace maps to no dashboard: the footer must not render
   at all. Capture the window DPI-aware (without `SetProcessDPIAware` the capture
   silently grabs only the top-left corner of the window) into
   `C:\Projects\logs\<today>\dsh-footer-intent\` and read the PNG back.
6. `py C:\Claude\bin\dsh_dashboard_links.py --check` exits 0 with "both maps match the
   live estate".

## What shipped, for the record

- `43500cd452` `fix(session-footer): resolve the dashboard a Session names, and hide an
  empty footer`. Files: `packages/api/session-controller/src/workspace-links.ts`,
  `packages/api/session-controller/src/list.ts`, their spec, and
  `packages/client/ui-conversation/src/client/skeleton/ConversationRoot.tsx` (with its
  spec).
- Fast-forward merged into `update/v0.1.5-rc.2`; both refs pushed to the fork
  (`e15a4fc5f4..43500cd452 update/v0.1.5-rc.2`, plus the new
  `fix/session-footer-intent`).
- Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,931,936 bytes,
  2026-09-17 19:16:27, built in `C:\Projects\worktrees\dsh-footer-intent`. Markers were
  read out of the packaged seed `.tgz` archives before handover, not out of the source.
- Feature registry 22 rows: `session-footer-intent`, marker `resolveSessionLinks`.
- `C:\Claude\bin\dsh_dashboard_links.py` gained `--check` (config repo `4e9b97ff`).
- Evidence: `C:\Projects\logs\2026-09-17\dsh-footer-intent\` (`resolver_count.py` and its
  output, `map-check.txt`).

## Known limits of the fix (not faults, do not re-report them)

- A Session whose first message never names a dashboard still shows no footer.
- A cold Session resolves by folder alone, because the list path never opens a cold
  Session log. The footer renders under the open Session, which is live.
- A Session that changes its dashboard target later keeps its first answer.

## Still open elsewhere, unchanged

- Pre-existing i18n gate failure: two hard-coded strings in `ui-sidebar-explorer`.
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with
  Developer Mode off.
- OPEN_ISSUES 27 (All Sessions rail) is untouched, and item 28's photograph is now
  reachable.
- The estate checkout `C:\Projects\repos\vercel-services` is 38 commits behind
  `origin/main`. The maps are current today, but a dashboard added to `main` would be
  invisible to the generator until that checkout is updated.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master`.
- `C:\Projects\worktrees\dsh-footer-intent` is this session's worktree; its branch is
  merged into the release line and pushed.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` and STILL
  carries five uncommitted state files from an earlier session; do not commit or
  publish them.
- `C:\Projects\worktrees\dsh-footer-links` (`feat/session-footer-links`) is merged and
  can be deleted when convenient.

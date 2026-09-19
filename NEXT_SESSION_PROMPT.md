# Next session prompt

Continue deepseek-harness. ONE change is BUILT, PACKAGED and on the release line, and
NOT installed: the Session footer now follows the dashboard a Session names, live, with
the newest mention winning. Code, gates and the packaged seed are proven; the running
build and the visible footer are not.

## The one thing left (one install, then one capture)

The install force-closes the app that hosts the session that built it, so the operator
runs it from a NEW PowerShell window (SmartScreen: "Run anyway"):

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-footer-live\finish-install.ps1"
```

It prints `SETUP COMPLETE. Running 0.1.5-rc.2` when first-run setup (about four
minutes, no window) has finished. Do not re-run it because the app "looks stuck".

Then, in this order:

1. Read the three markers out of the RUNNING profile
   (`~\.dsh\profiles\desktop\node_modules\@deepseek-ai\`):
   `dsh-api-session-controller\lib\index.js` must carry `workspaceLinks` and `byAddress`;
   `dsh-client-ui-conversation\lib\client.js` must carry `workspaceLinks`.
2. `py C:\Claude\bin\dsh_local_features_check.py` must exit 0 with 25 of 25 features.
   Take boot proof from the newest `~\.dsh\desktop\logs\provision-*.log` (it must end
   `staged health check passed`, `staging profile activated as 0.1.5-rc.2`,
   `applyRelease finished`) plus four or more live processes.
3. THE PHOTOGRAPH NOBODY HAS EVER TAKEN. Open a Session in the Vercel workspace whose
   own messages name a dashboard (any of the 52 resolving Sessions; one is
   `session-30675526-1e86-4ffa-b430-a700c01409c5`), then
   `pwsh -File C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`
   (without `SetProcessDPIAware` the capture silently grabs only the top-left corner),
   crop the composer band (`crop_png.ps1` beside it) and read the PNG back. Expected
   under the message box: `Dashboard: <full url>` as a link and `Design Project: <name>`.
   This closes OPEN_ISSUES 28 and 32.

## What shipped, for the record

- `d9e83fca02` `fix(session-footer): follow the dashboard a Session names, live and
  newest-first`, on `fix/session-footer-live-intent`, fast-forward merged into
  `update/v0.1.5-rc.2`; both refs pushed and read back at `d9e83fca02`.
- Ten files: `packages/api/session-controller/src/workspace-links.ts`,
  `workspace-links-projection.ts` (new), `types.ts`, `list.ts`, `index.ts`,
  `packages/api/session-controller/tsconfig.host.json`, the two host specs,
  `packages/client/ui-conversation/src/client/skeleton/ConversationRoot.tsx` and its spec.
- The projection `workspaceLinks` folds the addresses and `/dashboard` targets each
  operator message carries (map-free, newest last, 8 retained), and its wire view
  resolves them against the live maps at read time, so a regenerated map needs no
  restart. `resolveSessionLinks` reads NEWEST FIRST; an address resolves exactly as the
  maps record it first (`byAddress`, `host + path`), then by host-plus-key; the two
  legacy `railway.*` names are accepted as hosts. The list path reads the
  already-materialized value only, so it still never folds history. The footer reads
  `useProjection('workspaceLinks')` and keeps the list row as its fallback.
- Measured over the 321 real Vercel Session logs: old rule 51, new rule 52, lost 0.
  Evidence `C:\Projects\logs\2026-09-19-dsh-footer-live-intent\` (`EVIDENCE.md`,
  `intent-proof.ts/.txt`, `intent-gap.ts/.txt`).
- Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,952,772 bytes,
  2026-09-19 18:24:52, built in `C:\Projects\worktrees\dsh-footer-live`. Markers were
  read out of the packaged seed `.tgz` archives before handover. The first packaging
  attempt died on the documented `EPERM` renaming `artifacts\win-unpacked.tmp`; clearing
  the stale folder and rerunning exited 0.
- Feature registry 25 rows: `session-footer-live-intent` (marker `workspaceLinks`,
  `dsh-api-session-controller`), `session-footer-live-read` (marker `workspaceLinks`,
  `dsh-client-ui-conversation`), and `session-footer-intent` reworded to "newest mention
  first".

## Known limits of the fix (not faults, do not re-report them)

- A Session whose messages never name a dashboard as an ADDRESS or a `/dashboard
  <target>` still shows no footer: 268 of the 321 Vercel Session logs are in that class,
  45 of them ordinary operator Sessions. 14 of those name a dashboard only as a bare
  word (`cfo`, `morgan`, `core30`, ...) and are deliberately NOT matched, because
  several dashboard keys are also ordinary words or a colleague's name; the safe variant
  (a backticked or quoted key) would gain exactly ONE root Session. A fourth form,
  `packages/dashboards/src/<key>` written as a PATH inside a worker prompt, is also not
  read.
- A COLD Session row still resolves by workspace directory alone, because the list path
  never opens a cold Session log. The footer renders under the OPEN Session, where the
  projection arrives with the follow-opening baseline.
- The workspace directory still outranks every message, so a Session inside a mapped
  dashboard folder reports that folder's dashboard even if it names another.

## Still open elsewhere, unchanged

- Pre-existing gate findings, all reproduced on the untouched release line:
  `verify-export-jsdoc` 1 (`session-status`), `verify-client-ui-i18n` 2
  (`ui-sidebar-explorer`), `test:docs` 9 passed / 7 failed.
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with
  Developer Mode off.
- OPEN_ISSUES 27 (All Sessions rail) is untouched.
- The estate checkout `C:\Projects\repos\vercel-services` is behind `origin/main`. The
  maps were current on 2026-09-17, but a dashboard added to `main` is invisible to the
  generator until that checkout is updated.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master`.
- `C:\Projects\worktrees\dsh-footer-live` is this session's worktree
  (`fix/session-footer-live-intent`), and it holds the installer and `finish-install.ps1`
  the install line above uses. Do not delete it until the install is verified.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` and STILL
  carries five uncommitted state files from an earlier session; do not commit or
  publish them.
- `C:\Projects\worktrees\dsh-footer-intent` and `C:\Projects\worktrees\dsh-footer-links`
  are merged and can be deleted when convenient.

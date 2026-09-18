

## 2026-09-18 - the install was run: both changes are in the RUNNING build, and the sidebar was SEEN sorted

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed build | the 23:52 artifact | `DeepSeek Harness.exe` 244,440,576 bytes, written 2026-09-17 23:52:40; `resources\seed\desktop-release.json` version `0.1.5-rc.2` | VERIFIED |
| Provision log | the three closing lines | `provision-2026-09-18T13-58-39-011Z.log`: `pnpm install exited with 0`, `staged health check passed` 14:04:39Z, `staging profile activated as 0.1.5-rc.2`, `applyRelease finished` | VERIFIED |
| Processes | 4 or more after the install | 4 processes, started 09:58:36 to 10:04:45 | VERIFIED |
| Running profile carries the footer fix | both markers | `dsh-api-session-controller\lib\index.js` `resolveSessionLinks` (2, 09:58:52); `dsh-client-ui-conversation\lib\client.js` `hasWorkspaceLinks` (2, 10:00:14) | VERIFIED |
| Running profile carries the folder sort | marker | `dsh-client-ui-workspace\lib\client.js` `byWorkspaceName` (3, 09:59:05) | VERIFIED |
| Feature registry | 23 of 23 | `dsh_local_features_check.py` exit 0, "all 23 local features are present in the running build", including `session-footer-intent` and `workspace-folder-sort` | VERIFIED |
| Sidebar folder order SEEN | A to Z under each group | PrintWindow capture at 2984x1760 with a sidebar crop: under the expanded SIG group the folders read Agents, backlinks, blog-articles, client-reporting, content-planner, Google Business, onboarding, service-pages. Evidence: `C:\Projects\logs\2026-09-18\dsh-footer-intent\sidebar-band.png` | VERIFIED |
| Footer hides when nothing resolves SEEN | no footer rows | The open Session (`C:\Projects\general`, first message names no dashboard) shows the message box, toolbar and stats line with NO `Dashboard:` or `Design Project:` rows, where the old build drew both labels empty. Evidence: `composer-band.png` | VERIFIED |
| Shipped resolver against the LIVE maps | resolves and refuses | `resolveSessionLinks` imported from the repo source: Vercel workspace plus `/dashboard https://ops.theseoitguy.net/keywords` -> keywords URL plus `Keywords`; `services\youtube-creator` -> youtube-creator URL plus `YouTube`; the unmapped Session -> `{}`; `https://theseoitguy.com/youtube-creator` -> `{}`. Evidence: `resolve_live.txt` | VERIFIED |
| Populated footer SEEN on screen | url and design name | PENDING: every Session on screen at capture time mapped to nothing. One click on a resolving Session (`Dashboard Design ...` in All Sessions, or any Vercel Session) and one more capture closes it | UNVERIFIED |

## 2026-09-17 - the sidebar's folders sort by name: built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-workspace suite | pass | 216 passed of 216 (was 215): the order inside a named group and in the ungrouped section, and a folder added afterwards slotting into place. The case that pinned Host Workspace order was updated, because it asserted exactly the behaviour the operator asked to change | VERIFIED |
| typecheck | exit 0 | `pnpm run typecheck` exit 0 | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts | VERIFIED |
| oxlint on the changed files | 0 errors | `tree.ts` and `tree.client.spec.ts`: 0 warnings, 0 errors | VERIFIED |
| Built bundle carries the change | present | `packages/client/ui-workspace/lib/client.js` carries `byWorkspaceName` (3), applied to the named buckets and to the ungrouped section | VERIFIED |
| Release line | carries the commit | `a21af3a222` on `fix/session-footer-intent` and on `update/v0.1.5-rc.2`; both pushed and read back (`43500cd452..a21af3a222`) | VERIFIED |
| Seed proof before handover | marker inside the packaged seed | `deepseek-ai-dsh-client-ui-workspace-0.1.5-rc.2.tgz -> package/lib/client.js`: `byWorkspaceName` (3) | VERIFIED |
| Installer | exit 0 | 194,901,646 bytes, 2026-09-17 23:52:45, superseding the 19:16 build so ONE install carries both changes | VERIFIED |
| Folder order seen on screen | A to Z inside every group | PENDING: waits on the install | UNVERIFIED |

## 2026-09-17 - the footer resolves the dashboard a Session names: built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| Root cause confirmed live | the Vercel workspace maps to nothing | 28 workspaces and 341 listed Sessions read from `~\.dsh\storages\workspace.json`; 67 resolve, and `C:\Projects\general\Vercel` (77 listed, 307 recorded) resolves none | VERIFIED |
| The fallback signal exists | the oldest operator message is on disk | `~\.dsh\storages\session_projcache\sessions\9566aecf-....json` -> `titleInput.val.first.text` = `/dashboard https://ops.theseoitguy.net/keywords` (host-only projection, stateVersion 3) | VERIFIED |
| Resolver unit suite | pass | `packages/api/session-controller/tests/workspace-links.host.spec.ts`: 18 cases pass (folder, subfolder, worktree tail, lookalike path, unmapped, missing and malformed maps, key inversion, no producer key, address intent, `/dashboard <key>`, modes refused, unknown host refused, workspace decides first, map reload) | VERIFIED |
| Footer component suite | pass | `packages/client/ui-conversation/tests/skeleton.client.spec.tsx`: 27 pass, including "renders no footer at all for a workspace with no dashboard and no design project" | VERIFIED |
| Touched package suites | pass | 70 files, 1175 passed, 1 skipped, 1 FAILED: `media-references.host.spec.ts` symlink `EPERM`, reproduced with the same test name and error on the base commit `e15a4fc5f4` in `dsh-footer-links` | VERIFIED (failure pre-existing) |
| typecheck | exit 0 | `pnpm run typecheck` exit 0 | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts | VERIFIED |
| oxlint on the changed paths | 0 errors | 0 warnings, 0 errors on the 5 changed files. The base commit's `ConversationRoot.tsx` reported 1 error (`no-unnecessary-condition` on `sessionId !== undefined`, already narrowed by `!hero`); it is fixed in the changed line | VERIFIED |
| i18n gate | no new findings | exits 1 on the 2 known `ui-sidebar-explorer/src/client/definition.ts` strings; zero findings in the changed files | VERIFIED (failure pre-existing) |
| Resolution after the fix | more Sessions resolve | over the real stores: 761 recorded Sessions 85 -> 132, the 341 listed Sessions 67 -> 106, the Vercel folder 0 -> 29 of 77. Harness: `C:\Projects\logs\2026-09-17\dsh-footer-intent\resolver_count.py` | VERIFIED |
| Map check | exit 0 with the checkout note | `dsh_dashboard_links.py --check`: estate 89 dashboard and 83 design entries, stored 89 and 83, "both maps match the live estate"; the checkout is 38 commits behind origin/main and none of the 7 changed contracts touches a mapped field | VERIFIED |
| Release line | carries the commit | `43500cd452` on `fix/session-footer-intent` and on `update/v0.1.5-rc.2`; both refs pushed to the fork, `e15a4fc5f4..43500cd452 update/v0.1.5-rc.2` reported by the push | VERIFIED |
| Seed proof before handover | markers inside the packaged seed | `deepseek-ai-dsh-api-session-controller-0.1.5-rc.2.tgz -> package/lib/index.js`: `resolveSessionLinks` (2), `resolveWorkspaceIntent` (2), `titleInput` (1), `dashboard-links.json` (2); `deepseek-ai-dsh-client-ui-conversation-0.1.5-rc.2.tgz -> package/lib/client.js`: `hasWorkspaceLinks` (2), `data-session-footer` (3) | VERIFIED |
| Installer | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,931,936 bytes, 2026-09-17 19:16:27, `win-x64-release.json` version `0.1.5-rc.2` | VERIFIED |
| Install and the running build | markers in the RUNNING profile | PENDING: the operator has not run the installer yet. This is the resume point | UNVERIFIED |
| Footer seen on screen | the two labelled lines | PENDING, and it has never been done. A Vercel-workspace Session that starts with `/dashboard <key>` is the case to capture | UNVERIFIED |


## 2026-09-17 - the two-line session footer: built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| Resolver unit suite | pass | `packages/api/session-controller/tests/workspace-links.host.spec.ts`: 10 cases pass (exact folder, subfolder, worktree tail, lookalike key, unmapped, missing design file, malformed dashboard file, non-string values, separators and case) | VERIFIED |
| Footer component suite | pass | `packages/client/ui-conversation/tests/skeleton.client.spec.tsx`: 5 new cases pass (both values, both labels empty, one half only, no footer in the hero, exact English labels) | VERIFIED |
| Touched package suites | pass | 70 files, 1166 passed, 1 skipped, 1 FAILED: `media-references.host.spec.ts` symlink `EPERM`, reproduced identically on `1a77e844ad`, the known no-symlink-privilege environment | VERIFIED (failure pre-existing) |
| typecheck | exit 0 | `pnpm run typecheck` exit 0 after `src/workspace-links.ts` was added to the package `tsconfig.host.json` `files` list, which the first run named as the missing entry | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts | VERIFIED |
| i18n gate | exit 0 | exits 1 on two `ui-sidebar-explorer/src/client/definition.ts` strings; identical output on `1a77e844ad`, and zero findings in the changed files | VERIFIED (failure pre-existing) |
| Built bundles carry the change | present | `lib/index.js` reads `dashboard-links.json` and `design-links.json`; `lib/client.js` carries `data-session-footer-line` (2) and no `sessionFooterSummary` (0) | VERIFIED |
| Maps regenerated | both written | `~\.dsh\dashboard-links.json` 89 entries (66 dashboard folders + 23 unambiguous producer service folders); `~\.dsh\design-links.json` 83 entries; 51 names read from Claude Design across both accounts, 0 fell back to a contract title | VERIFIED |
| Producer service mapping | resolves, and skips the ambiguous | live resolver over the real maps: `services\youtube-creator` and a folder inside it resolve to the URL and `YouTube`; `services\content-planner` (17 dashboards behind it) resolves to nothing, as designed; 10 ambiguous services named in the generator's output | VERIFIED |
| Release line | carries the commits | `feat/session-footer-links` and `update/v0.1.5-rc.2` both read back from the fork at `e15a4fc5f4` | VERIFIED |
| Seed proof before handover | markers inside the packaged seed | conversation `.tgz`: `data-session-footer-line` (2), `sessionFooterSummary` (0); session-controller `.tgz`: both map filenames | VERIFIED |
| Installer | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,884,537 bytes, 2026-09-17 01:20:22 | VERIFIED |
| Running app after the install | 21 of 21 markers | `dsh_local_features_check.py`: "all 21 local features are present in the running build", exit 0; profile client.js (01:48:52) marker 2 and old class 0; profile host bundle reads `design-links.json`; provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished`; 4 processes from 01:43:54; release file `0.1.5-rc.2` | VERIFIED |
| Footer seen on screen | two labelled lines | PARTIAL: the app window was captured but it was on the NEW SESSION screen, where no footer renders by design (correct), and no current workspace points at a mapped folder. Evidence: `C:\Projects\logs\2026-09-17\dsh-session-footer-lines\` | UNVERIFIED |

## 2026-09-16 - the 00:39 installer was run: 20 of 20 markers in the RUNNING build

| Check | Expected | Result | Status |
|---|---|---|---|
| Installer ran | app reinstalled and relaunched | app exe 2026-09-16 00:39:00 (artifact 00:39:04); processes started 01:11:32, 01:11:34, 01:13:53, 01:14:18 | VERIFIED |
| Seed integrity | verified | provision log `seed integrity verified` | VERIFIED |
| Profile re-extracted | fresh | profile ui-workspace files 01:11:47 to 01:12:51 | VERIFIED |
| Provision finished | health check then activation | `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished`, no failed entry | VERIFIED |
| Local feature markers | 20 of 20 | `dsh_local_features_check.py`: "all 20 local features are present in the running build", exit 0 | VERIFIED |
| The three changes in the RUNNING code | present | profile `dsh-client-ui-workspace\lib\client.js`: `ARCHIVE_CHORD_LATCH_MS` (2), `sectionShowsWorkspaces` (5), `font-size:13px;font-weight:600;line-height:18px` (1) | VERIFIED |
| Group label is 13px, not 11px | 13 on this rule | the only `font-size:11px` left in that bundle is `.countBadge`, a different element | VERIFIED |
| Ctrl+Shift+A pressed live | row leaves both views | NOT DONE: needs the operator's hands | UNVERIFIED |
| Header folded, 13px seen, fold remembered after a restart | on screen | NOT DONE: needs the operator's eyes | UNVERIFIED |
| Add/Remove Programs | one entry | TWO rows for this one install (`7260a3eb-...` and `7808434f-...`), same version, same uninstaller path; the known app-id mismatch | UNVERIFIED |

## 2026-09-16 - group header text 11px to 13px: the default for every group

| Check | Expected | Result | Status |
|---|---|---|---|
| Touched package suite | pass | ui-workspace 11 files, 215 passed; no test asserted the old size, so none changed | VERIFIED |
| Rule in the built bundle | 13px on the shared class | `packages/client/ui-workspace/lib/client.js` carries `...groupHeader{...font-size:13px;font-weight:600;line-height:18px...}` | VERIFIED |
| Rule in the packaged seed | 13px, markers intact | ui-workspace `.tgz` extracted from `win-unpacked`: the same rule, plus `ARCHIVE_CHORD_LATCH_MS` (2), `sectionShowsWorkspaces` (5), `group.toggle` (3) | VERIFIED |
| Installer rebuilt | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,906,904 bytes, 2026-09-16 00:39:04, superseding the 00:19 build so one install carries all three changes | VERIFIED |
| First packaging attempt | exit 0 | FAILED inside `package-target.ts`; the immediate rerun succeeded. Cause UNKNOWN (that run's output was tail-truncated); the documented `win-unpacked.tmp` EPERM transient fits | UNVERIFIED |
| Release line | carries the commit | `update/v0.1.5-rc.2` and `feat/archive-session-shortcut` both read back at `1a77e844ad` from the remote | VERIFIED |
| On-screen size | 13px on every group | NOT DONE: nothing has looked at the rendered sidebar | UNVERIFIED |

## 2026-09-16 - named Workspace group fold: built, and the installer rebuilt to carry both changes

| Check | Expected | Result | Status |
|---|---|---|---|
| New fold tests | pass | 4 new cases in `workspace-browser.client.spec.tsx`: fold from the header, remember the choice, start folded from a remembered choice, and mount on a view state that predates the field | VERIFIED |
| Touched package suite | pass | ui-workspace 11 files, 215 passed (was 211 before this change) | VERIFIED |
| typecheck | exit 0 | `pnpm run typecheck` exit 0; run again inside both pre-push hooks (17.9s and 44.7s) | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts recorded | VERIFIED |
| Markers in the built lib | present | `packages/client/ui-workspace/lib/client.js` carries `sectionShowsWorkspaces` (5), `groupChevronOpen` (3), `group.toggle` (3), and still `ARCHIVE_CHORD_LATCH_MS` (2) | VERIFIED |
| Translation pair | consistent | re-recorded with `--write`, then checked on the named pair: consistent, exit 0 | VERIFIED |
| Feature registry | 20 rows | parsed; new row `workspace-group-fold` -> `dsh-client-ui-workspace` / `lib/client.js` / `sectionShowsWorkspaces` | VERIFIED |
| Installer rebuilt | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,914,731 bytes, 2026-09-16 00:19:52, superseding the 194,945,456-byte 19:05 build so one install carries both changes | VERIFIED |
| Both changes inside the packaged seed | present | ui-workspace `.tgz` extracted from `win-unpacked`: `ARCHIVE_CHORD_LATCH_MS` (2), `sectionShowsWorkspaces` (5), `group.toggle` (3) | VERIFIED |
| Release line | carries both commits | `update/v0.1.5-rc.2` and `feat/archive-session-shortcut` both read back at `e7b9f7ef6d` from the remote | VERIFIED |
| Folded state survives a restart | persisted | the fold writes `sectionExpansion` into `dsh.workspace.view.v5`, and a mount on a stored `{ SIG: false }` starts folded | VERIFIED (jsdom) |
| On-screen look of the header | chevron and hover correct | NOT DONE: nothing has looked at the rendered sidebar | UNVERIFIED |
| Installed and used live | 20/20 markers, group folds | NOT DONE: install pending | UNVERIFIED |

## 2026-09-15 - Ctrl+Shift+A archive chord: built and packaged, install pending

| Check | Expected | Result | Status |
|---|---|---|---|
| New chord tests | pass | 10 new cases in `workspace-browser.client.spec.tsx`; 62 passed in that file | VERIFIED |
| Touched package suite | pass | ui-workspace 11 files, 211 passed | VERIFIED |
| typecheck | exit 0 | `pnpm run typecheck` exit 0; the pre-push hook ran it again in 31.7s | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts recorded | VERIFIED |
| Marker in the built lib | present | `packages/client/ui-workspace/lib/client.js` carries `ARCHIVE_CHORD_LATCH_MS` and the two locale keys | VERIFIED |
| Translation pair | consistent | re-recorded with `--write`, then checked on the named pair: consistent, exit 0 | VERIFIED |
| Feature registry | 19 rows | parsed; new row `archive-session-shortcut` -> `dsh-client-ui-workspace` / `lib/client.js` / `ARCHIVE_CHORD_LATCH_MS` | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,945,456 bytes, 2026-09-15 19:05:34 | VERIFIED |
| Change inside the packaged seed | present | extracted the ui-workspace `.tgz` out of `win-unpacked`: `package/lib/client.js` carries `ARCHIVE_CHORD_LATCH_MS` (2) and `nothingToArchive` (3) | VERIFIED |
| First packaging attempt | exit 0 | NOT A CODE FAULT: `tar (child): Cannot connect to C: resolve failed` from Git's GNU tar reading an absolute Windows path as `host:path`; prepending `C:\Windows\System32` (bsdtar) fixed it (ledger 37) | VERIFIED |
| Installed and pressed live | 19/19 markers, row disappears | NOT DONE: install pending, and the installer force-closes this session | UNVERIFIED |
| `verify-client-ui-i18n` | exit 0 | exit 1 on two hard-coded strings in `dsh-client-ui-sidebar-explorer`, a file untouched by this change | PRE-EXISTING |

## 2026-09-14 - stream-stall fix: built, installed, and proven against the live broken route

| Check | Expected | Result | Status |
|---|---|---|---|
| Provider fault reproduced | flash stalls, pro does not | flash: HTTP 200 then 0 bytes in 45s, twice; streaming gave 98 bytes in 90s, all `: keep-alive`. pro: full completion, twice | VERIFIED |
| Historical scope | which turns died and when | 14 `STREAM_CLOSED` turn deaths, all 2026-09-14, all `deepseek-flash`, 5 sessions, 0 on any earlier day (535 session logs decoded) | VERIFIED |
| Request shape ruled out | unchanged across good and bad days | 112 tools, ~68.8 KB tool parameters on 2026-09-10 through 2026-09-14 alike | VERIFIED |
| New unit tests | pass | 8 passed in `first-payload.spec.ts`, including the no-unhandled-rejection guard | VERIFIED |
| New wire test | retries instead of hanging | `keepalive_stall` recovers in 345ms with idle timeout set to 30s, so comments provably no longer count | VERIFIED |
| Touched suites | pass | 536 passed across llm-deepseek, llm-retry, llm-mock-server | VERIFIED |
| Typecheck | exit 0 | `pnpm run typecheck` exit 0 | VERIFIED |
| Lint, changed paths | clean | oxlint 0 warnings 0 errors on the 4 changed source/test dirs | VERIFIED |
| Pre-existing failures separated | not caused here | `plugin-package-inventory-deepseek` fails identically on the untouched `update/v0.1.5-rc.2` worktree; `llm-pi-ai` idle test passes in isolation (parallel-load flake) | VERIFIED |
| Config gates | pass | `verify-cordis-config` 142 files passed; config catalog regenerated and up to date; both translation pairs re-recorded | VERIFIED |
| Fix inside the installer payload | present | extracted `deepseek-ai-dsh-llm-deepseek-0.1.5-rc.2.tgz` from `win-unpacked`, found the new code in `package/lib/index.js` | VERIFIED |
| Installed build is the new one | matches | app exe 2026-09-14 16:49:20 (artifact 16:49:24); 4 processes from 16:57:58; provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| Fix in the RUNNING profile | present | `~\.dsh\profiles\desktop\...\dsh-llm-deepseek\lib\index.js` (16:58:28) carries `boundFirstPayload`, the gated comment callback (`if (sawPayload) onActivity()`), and the new config field | VERIFIED |
| Retry policy shipped | present | installed `dsh-base\cordis.patch.yml` carries `retryPolicy`, `maxRetries: 3`, `STREAM_CLOSED` | VERIFIED |
| LIVE: stalled route is bounded and retried | fails fast, retries | real `deepseek-flash`, 20s bound, 1 retry: 41.1s total, `llm/retry` `TIMEOUT`, ended "DeepSeek accepted the request and sent no stream payload within 20000ms". Before the fix the same fault took ~15 minutes, no retry, `STREAM_CLOSED` | VERIFIED |
| LIVE: healthy route unaffected | completes, no retries | same probe on `deepseek-v4-pro`: completed in 13.6s with zero retries | VERIFIED |

## 2026-09-13 - four DSH app fixes: tests, build, package (install pending)

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-user-questions tests | pass | 53 passed, including the whole-question scrollport case | VERIFIED |
| tool-ask-user tests | pass | 11 passed, including `detail` pass-through and the description rule | VERIFIED |
| pwsh-local tests | pass | 47 passed; 1 pre-existing EPERM symlink failure (no symlink privilege, environmental) | VERIFIED |
| tool-pwsh tests | pass | 61 passed | VERIFIED |
| ui-workspace + ui-renderer tests | pass | 310 passed, including the crash/retry recovery case | VERIFIED |
| typecheck | exit 0 | `pnpm run typecheck` exit 0; the pre-push hook ran it again in 24.8s | VERIFIED |
| lint, changed sources | clean | oxlint 0 warnings 0 errors on the 6 changed files | VERIFIED |
| tool catalog | up to date | `verify-tool-catalog` up to date; the zh pair updated and re-recorded | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,784,998 bytes, 11:08:32 | VERIFIED |
| PR #21 landed | merged | GitHub reports MERGED, merge commit `5512545eac` | VERIFIED |
| Built bundles carry every change | all markers present | `SINGLE-quoted`, `param(...)` wrap, `at most two sentences`, `headingInBody`, `data-all-sessions-error`, `data-session-count`, `commandText` all found in `lib/` | VERIFIED |
| Running build carries all changes | 18/18 markers | NOT DONE: install pending | UNVERIFIED |
| All Sessions root cause | named | NOT CAPTURED: the recovery row ships; the crash message is now on screen | UNVERIFIED |

## 2026-09-12 - llm-route-fallback disabled, verified

| Check | Expected | Result | Status |
|---|---|---|---|
| Change in running code | `enabled: false` | running profile's `dsh-base/cordis.patch.yml` reads `enabled: false` (was `true`) | VERIFIED |
| Boot after reinstall | applyRelease finished | provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| Post-fix request stays on flash | model = `deepseek-flash` | this session's 5th `request/header` (23:20:53Z) is `deepseek-flash`; the four before the install were `deepseek-v4-pro` | VERIFIED |
| Processes running | 4+ | 4 `DeepSeek Harness` processes | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe` 194,826,890 bytes | VERIFIED |

## 2026-09-12 - session footer + workspace UI shipped and installed

| Check | Expected | Result | Status |
|---|---|---|---|
| All local features in running build | 15/15 | `dsh_local_features_check.py` -> all 15 present incl `workspace-unarchived-count`, `session-footer`, `llm-route-fallback` | VERIFIED |
| Boot after reinstall | applyRelease finished | newest provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| ui-workspace tests | pass | 85 passed (46 tree + 39 rows incl count-badge test) | VERIFIED |
| session-controller + ui-conversation tests | pass | 455 passed | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe` 194,791,959 bytes | VERIFIED |
| Footer visual rendering (summary + dashboard link) | renders under message box | not eyeballed | UNVERIFIED |

## 2026-09-11 - version trap fix: archived branch, trunk checkout, reconciled state

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed version | 0.1.5-rc.2 | exe FileVersion `0.1.5-rc.2`, registry `DisplayVersion` `0.1.5-rc.2`, installed seed and active profile `desktop-release.json` both `0.1.5-rc.2` | VERIFIED |
| Newest upstream release | newest tag | `dsh-v0.1.5-rc.2` (2026-09-10) | VERIFIED |
| Nothing newer available | up to date | `dsh_update_check.py` -> `VERDICT: UP TO DATE` | VERIFIED |
| Parked branch pushed | durable copy | `origin/fix/account-usage-remote-mount` = `d77def1b70` | VERIFIED |
| Uncommitted delta preserved | patch outside the repo | `2026-09-11_dsh-primary-checkout-uncommitted-delta.patch`, 47,852 bytes, `git apply --numstat` names the 12 files | VERIFIED |
| Delta was a duplicate, not lost work | already shipped | same 12 files are commit `55c15a6af4` on `update/v0.1.5-rc.2`; `rightbarBySession` x7 on the branch and x6 in the RUNNING profile client.js | VERIFIED |
| Compiled artifacts removed | 484 files, compiled only | `git clean -fdn -- packages vendor` printed 484 entries, 0 non-compiled; a clean sibling worktree (`dsh-update-v0.1.5-rc.2`) carries none of them, and `npm run build:lib:host` exits 0 afterwards with no tracked file touched | VERIFIED |
| Primary checkout on trunk | branch master, clean | `## master...origin/master`, `git status --porcelain` empty, HEAD `5d2e7b087b` | VERIFIED |
| State files reconciled | rc.2 section on origin/master, nothing dropped | `CURRENT_STATE.md` 43 to 46 sections, archive 26 to 29, all five files identical disk vs `origin/master` | VERIFIED |
| rc.2 record on origin/master | present | `git show origin/master:CURRENT_STATE.md` carries `2026-09-11 - 0.1.5-rc.2 INSTALLED` | VERIFIED |
| Worktrees intact | 18 entries, same branches | 18 listed, one per expected branch, primary now `[master]` | VERIFIED |
| Version answer documented | README Version section | `C:\Projects\general\DS harness\README.md` rewritten with the version, the check command and the warning | VERIFIED |
| Windows console flashing item | carry check | the hide-consoles fix `7fab040065` is in the `update/v0.1.5-rc.2` stack, so the remote-only OPEN_ISSUES line is obsolete rather than lost | VERIFIED |
| Pre-push `typecheck` hook on `master` | runs | CANNOT RUN: `pnpm run typecheck` first does a deps-status install whose postinstall (`install-lefthook.mjs`) refuses to replace Steve's global `core.hooksPath`, so the typecheck never starts. This markdown-only state commit was therefore pushed with `--no-verify`, per the OPEN_ISSUES item 22 precedent. `DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1` was deliberately NOT set | ENVIRONMENTAL, not a code fault |

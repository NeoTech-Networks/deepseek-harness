## 2026-09-24 - 0.1.7-rc.1 installed and verified live

| Check | Result | Evidence |
|---|---|---|
| installer | 314,354,720 bytes, sha256 `74de6ccff16bb17188dc2446dbb6c8c5385aac84c5c7f585d3d4a7e8c91bd901`; packaged self-test passed (DOCX, XLSX, PPTX to PDF, skill CLI) | `C:\Projects\logs\2026-09-24\dsh-017-port\installer-hash.txt`, `package6.log` |
| finish-install.ps1 | `SETUP COMPLETE. Running 0.1.7-rc.1`, `FINISH EXIT 0` | `C:\Projects\logs\2026-09-24\dsh-017-port\finish-install-run.log` |
| uninstall rows | exactly 1, `7808434f-469e-5eba-848e-edf64d3b94ce`, `DisplayVersion 0.1.7-rc.1` | HKCU uninstall key read 2026-09-24 |
| processes | 5 | `Get-Process "DeepSeek Harness"` 2026-09-24 |
| local features in the running code | 34 of 34, read from the installed `app.asar` | `dsh_local_features_check.py` 2026-09-24 |
| settings migration | 7 of 7 sections IMPORTED; home patch MATCHES; vault switched to the 0.1.7 manifest | finish-install log |
| AGENTS.md hardlink | OK before and after (2 links, one file id) | finish-install log |
| sessions answer | Claude Opus 5.5 (operator's test) and headless `deepseek-flash` both answered | operator test; `live-headless-out.txt` |
| MCP servers | 7 of 7 answered a real call (composio_platform after one transient fetch failure; playwright listed) | live session 2026-09-24 |
| hook bridge | 14 of 14 invocations exit 0 (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop) | live session log 2026-09-24 |
| on screen | mode, All Sessions, stage-mark spinner, ABC group header with fold, A to Z folders, count badge, usage percentages | `C:\Projects\logs\2026-09-24\dsh-017-port\app-0.1.7.png` |
| NOT VERIFIED | Session footer (folder on screen maps to no dashboard); Ctrl+Shift+A (not pressed, archives a real session) | OPEN_ISSUES 38 |

## 2026-09-24 - 0.1.7-rc.1 port gates (build tree, not installed)

| Check | Result | Evidence |
|---|---|---|
| clean tag baseline build | exit 0; plan-mode 87/87; fs-local 147 pass / 13 symlink fails | `C:\Projects\logs\2026-09-24\dsh-017-port\baseline-*.log` |
| merged tree typecheck / build / lint | 0 / 0 / 0 errors over 4831 files | `C:\Projects\logs\2026-09-24\dsh-017-port\merge-gates.md` |
| vitest, 20 touched package dirs | 6844 pass, 31 fail (all environmental, itemised) | `C:\Projects\logs\2026-09-24\dsh-017-port\vitest.log`, `vitest-desktop-serial.log` |
| markers in built libs | 29 of 29 | `C:\Projects\logs\2026-09-24\dsh-017-port\merge-gates.md` marker table |
| settings import, web profile, throwaway home | 7 of 7 sections IMPORTED, no entry failed to activate | migrator `verify --profile web` exit 0 |
| MCP on 0.1.7, throwaway home | 11 servers listed tools; memory_search 2 hits | headless run 2026-09-24 |
| hook bridge on 0.1.7 | 5 of 5 events delivered, bridge exit 0 each | probe log, `C:\Projects\logs\2026-09-24\dsh-017-port\hooks-placement.md` |
| finish-install.ps1 -WhatIf | refuses with no installer (exit 2); full 8-step plan with one (exit 0); live lock refused, stale lock cleared | this session |
| packaging | NOT RUN: vswhere ENOENT, no MSVC toolchain | `C:\Projects\logs\2026-09-24\dsh-017-port\package.log` |



## 2026-09-20 - the footer live-intent change, re-verified live in the running build

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed build | the 0.1.5-rc.2 stage-marks build | `resources\seed\desktop-release.json` version `0.1.5-rc.2`; four `DeepSeek Harness` processes running | VERIFIED |
| The footer change is in the RUNNING code | the projection key in both bundles | `dsh-api-session-controller\lib\index.js` carries `workspaceLinks` (10 matches); `dsh-client-ui-conversation\lib\client.js` carries it (1) | VERIFIED |
| The running registry actually FOLDS it | the key registered for a live Session | this Session's projection-cache row lists `workspaceLinks` beside `title`, `sessionStatus`, `modelSelection` and the rest: `~\.dsh\storages\session_projcache\sessions\session-d1fe2a05-1d71-434f-98ea-e80b07188da0.json` | VERIFIED |
| Populated footer SEEN | two labelled rows under the message box | photographed by the 2026-09-20 sessions: `Dashboard: https://ops.theseoitguy.net/backlinks` and `Design Project: Backlinks`, the exact route the `byAddress` fix was built for. Evidence `C:\Projects\logs\2026-09-20\dsh-settings-retention\` | VERIFIED |
| Stage glyphs render and animate | a moving mark on a running row | five visible `All Sessions` rows draw the WORKING glyph and animate: 408, 423, 424 and 374 pixels differ between two frames 600ms apart inside a 72x40 glyph box, against 0 of 2880 in two static control regions measured in the SAME frame pair. Evidence `C:\Projects\logs\2026-09-20\dsh-stage-marks\` | VERIFIED |
| Hook bridge fires | a new `emitted-context` file after the install | newest is `s.json`, 2026-09-19 18:21:55, which PREDATES the 2026-09-20 install; this Session predates the `standard-hooks` preset, so its prompts cannot prove it | UNVERIFIED |

## 2026-09-20 - the sidebar stage marks SEEN in the running app, against a pre-install control

| Check | Expected | Result | Status |
|---|---|---|---|
| A running session draws the new mark in the sidebar | two arcs plus a centre dot, not a bare dot | `app-window-running.png` at 6x (`zoom-sidebar-marks.png`): every running row in All Sessions draws the Working mark | VERIFIED |
| The mark carries the running colour | the ongoing blue, not the old amber | The marks render in `--dsw-static-deepseek-450` blue through the `data-active` rule, read off the capture | VERIFIED |
| The loop is actually running | arcs at a different angle per frame | Three captures about two minutes apart put the arcs at a different rotation on every row each time | VERIFIED |
| It is the build and not the state alone | the same rows unmarked before the install | The pre-install capture of the same band (`preinstall-sidebar-band.png`, from `dsh-settings-retention\app-window-3.png`) shows those rows with NO mark, one of them on the old amber `right-up` glyph | VERIFIED |
| Six simultaneous running marks are genuine | six Sessions writing at once | SIX distinct `session_projcache` files written 14:22:10 to 14:25:29; the next capture shows the list membership already changing | VERIFIED |
| The populated footer, in the same capture | url and design name | `Dashboard: https://portal.theseoitguy.net/core30` and `Design Project: Core 30` visible under the composer | VERIFIED |
| Hook bridge firing after the install | a new emitted-context marker | Still no DSH prompt taken since the install from the app; newest marker 2026-09-19 18:21:55 | UNVERIFIED |

## 2026-09-20 - the stage-marks build installed and proven in the running app; footer photographed

| Check | Expected | Result | Status |
|---|---|---|---|
| Install runs to completion | exit 0 | `finish-install.ps1` printed `SETUP COMPLETE. Running 0.1.5-rc.2`, `SCRIPT-EXIT=0` | VERIFIED |
| Installer artifact | unchanged | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,849,563 bytes, sha256 `eaa8964f3e44928cb4e6cf1ac0724630f9a07e7ae39c501ad658f4e08cc5267c` | VERIFIED |
| Seed integrity | clean | `expected 272, actual 272` / `extra 0, missing 0, mismatch 0` / `PASS: seed integrity clean` | VERIFIED |
| Local features in the running build | 27 of 27 | `all 27 local features are present in the running build`, exit 0 (was 24 of 27 before the install) | VERIFIED |
| Vault after install | 20 files, all same | `verify: 20 files, all same`, exit 0 (script's own check said the same) | VERIFIED |
| Independent fingerprint | empty diff vs pre-install | `diff fingerprint-pre.txt fingerprint-post-install.txt` printed NOTHING; 21 files hashed, 0 missing | VERIFIED |
| Hardlink identity | two paths, one file id | `fsutil hardlink list` names BOTH; both `queryfileid` return `0x000000000000000000050000007ad594`; script printed `HARDLINK OK (final)` | VERIFIED |
| Provision log milestones | all four | `seed integrity verified` / `staged health check passed` (17:35:45.379Z) / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| Processes after install | 4 or more, all post-install | 4 `DeepSeek Harness` processes started 13:30:43, 13:30:46, 13:35:24, 13:35:51 | VERIFIED |
| New markers in the RUNNING profile | present | `dsh-client-ui-workspace\lib\client.js` `dsw-stage-arc-spin` (3); `dsh-session-status\lib\index.js` `deploying` (3); `dsh-client-ui-sessions-panel\lib\client.js` `IconStageWorkingOutline24` (1) | VERIFIED |
| Populated Session footer | url and design name | SEEN in `composer-band-3.png`: `Dashboard: https://ops.theseoitguy.net/backlinks` and `Design Project: Backlinks` | VERIFIED |
| Model picker | both DeepSeek ids | `settings.yaml` deepseek `models` lists `deepseek-flash` and `deepseek-v4-pro`; picker on screen reads `DeepSeek-V41-Flash High` | VERIFIED |
| Permission preset | danger-full-access | `permission: defaultPreset: danger-full-access` | VERIFIED |
| Post-install vault snapshot | recorded and pushed | `snapshot: 20 files, 0 changed ... commit a4675b9`, `push: main published to origin` | VERIFIED |
| MCP servers answer a read | one each | `claude-memory-bridge` 2 hits; `composio` github active as `neotechnet`; `composio_platform` gsc connections listed; `claude_design` 20 projects; `playwright` responded | VERIFIED |
| Six MCP rows declared in the preset | 6 | `claude-memory-bridge`, `composio`, `composio_platform`, `claude_design`, `claude_design_team_account`, `playwright` all present in `agent.cordis.yml` | VERIFIED |
| Hook bridge FIRING post-install | new marker | NOT OBTAINED: no DSH Session started or took a prompt since the install, so the newest `emitted-context/<session>.json` is still 2026-09-19 18:21:55 | UNVERIFIED |
| `claude_design_team_account` read | one cheap read | CANNOT RUN from a Claude Code session; it mounts only in the app | UNVERIFIED |
| Sidebar stage marks photographed | spinner/waiting/plan marks | NOT OBTAINED: no Session was in a running, waiting or plan state during any capture, so those marks were not on screen to photograph | UNVERIFIED |
| `dsh_update_check.py` verdict on a prerelease | should not say UPDATE AVAILABLE | live run's last line is `VERDICT: UPDATE AVAILABLE dsh-v0.1.6-alpha.2` against `installed 0.1.5-rc.2`, with all six listed releases marked `pre`. Recorded as playbook error ledger row 41 | BROKEN (pre-existing) |

## 2026-09-20 - 0.1.6 blocked by upstream deletion; vault widened to 20 files and the hardlink guard proven

| Check | Expected | Result | Status |
|---|---|---|---|
| 0.1.6 desktop provisioning layer | present | `seed-store.ts` and `provision-log.ts` ABSENT at `dsh-v0.1.6-alpha.2`; 12 files under `apps/desktop/` gone | VERIFIED |
| 0.1.6 provision milestones | present | all four return 0 files on the tag; `verifySeedIntegrity` and `integrity.json` NOT FOUND | VERIFIED |
| Is the deletion a dropped commit? | local stack never touched it | `git log dsh-v0.1.5-rc.2..42db6c8038 -- apps/desktop/src/seed-store.ts` is EMPTY | VERIFIED |
| 0.1.6 packages the fork uses | present | `session-status/*`, `ui-sessions-panel`, `vision/routing`, `llm/account-usage`, `api/pinned-files`, `ui-sidebar-explorer`, `e2b/*` and more all ABSENT; `derivePhase` NOT FOUND | VERIFIED |
| Vault widened | 20 files | `snapshot: 20 files, 2 changed (2 added, 0 updated, 0 removed) commit 4d83d54` | VERIFIED |
| Vault verify | exit 0 over 20 | `verify: 20 files, all same` | VERIFIED |
| Vault pushed | on `main` at origin | `1d5ddc3..4d83d54 wt/session-4560821c-4ca -> main`, then `.gitignore` `4d83d54..0c6bde2` | VERIFIED |
| Hardlink guard committed | on the release line | `42db6c8038` on `update/v0.1.5-rc.2`; `grep -c "HARDLINK OK"` = 1 | VERIFIED |
| Hardlink guard behaviour | 4 modes correct | live -> `HARDLINK OK ... 2 links, id 0x...7ad594`; severed -> `REFUSING TO RUN`, exit 2; missing -> re-linked then OK; missing-both -> warn only | VERIFIED |
| Hardlink identity by file id | shortname must NOT false-fail | `HARDLINK OK (shortname-test)` through `C:\Users\STEVED~1\...`; the first version compared path strings and DID false-fail | VERIFIED |
| Install script parses | no syntax errors | `PARSE OK` on `dsh-stage-icons\finish-install.ps1` | VERIFIED |
| Three missing features in the packaged seed | all present | `workspaceLinks` 1, `dsw-stage-arc-spin` 3, `deploying` 12, read out of the `.tgz` archives | VERIFIED |
| Stage-icons carries the guard | at least 1 | `fe3a1a3c14..42db6c8038` fast-forward, `grep -c "HARDLINK OK"` = 1, tree clean | VERIFIED |
| Pre-install fingerprint | 21 files, 0 missing | `fingerprint: 21 files hashed, 0 missing`, `hardlink: 2 link(s), same_file=yes` | VERIFIED |
| Rollback installer on disk | untouched | `dsh-footer-intent\...\deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,901,646 bytes | VERIFIED |
| App rollback dir | present, pending absent | `~\.dsh\desktop\rollback` exists (empty); `pending.json` No such file | VERIFIED |
| The install itself | not run | exe still 244,440,576 bytes at 2026-09-17 23:52; newest provision log 2026-09-19T14-38-53Z; processes started 9/19 | UNVERIFIED |
| 0.1.6 reachable at all | - | 8 of 53 commits replayed before the structural stop | BLOCKED |

## 2026-09-20 - the session stage marks: live, built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| The row mark follows the live state, not the ending | one mark that moves twice in a turn | New row cases pass: a running session with a declared hold draws `[data-phase="running"]` and NO tone element, and the same session once quiet draws `[data-tone="error"]` with no running phase | VERIFIED |
| Every "doing something" phase draws a glyph | no bare dot left for a live state | `PHASE_GLYPHS` covers awaiting-approval, awaiting-plan-review, awaiting-answer, planning, running and subagents; the done dot and the idle dot are the only dots left, asserted in `rows.client.spec.tsx` | VERIFIED |
| The eight glyphs are the design's, and complete at rest | every defining stroke present with motion off | The icon spec renders all eight and asserts each `data-part` exists and no element sits at zero opacity; the standalone render shows all eight shapes, the single plan check and the hourglass without its base line (`C:\Projects\logs\2026-09-20\dsh-stage-icons\shot_1100.png`, `zoom-14px-paused.png`) | VERIFIED |
| The declared vocabulary points at the marks and `failed` exists | six statuses, new icon ids | `session-status.spec.ts` reads the shipped list in order with `deploying`, `blocked`, `saved`, `blocked`, `pause`, `failed`; the tool enum and the `/status` command text carry all six; the client fixture matches | VERIFIED |
| A legacy icon id still draws | old stored statuses survive replay | The allowlist only grew and the five legacy ids map to the nearest new mark, so `right-up`/`stop`/`check`/`clock`/`pause` all still resolve; the unknown-id fallback case still passes | VERIFIED |
| Touched suites | green | 252 passed across 11 files: `ui-primitives` (98), `ui-workspace` rows (40) and tree, `ui-sessions-panel` (10), the three `session-status` packages | VERIFIED |
| Typecheck, build, lint | exit 0, 0 new findings | `pnpm run typecheck` exit 0; `pnpm run build` exit 0, "recorded 240 client artifact(s)"; oxlint 0 warnings 0 errors on the staged set. Two pre-existing `no-unnecessary-condition` findings remain on lines this diff does not touch | VERIFIED |
| Pre-existing gate findings unchanged | identical to the base commit | `verify-client-ui-i18n` 2 (`ui-sidebar-explorer`), oxlint repo-wide 52 errors, `verify-module-graph` and `verify-doc-graphs` stale (the base commit already lacks `pkg_session_status` in its committed graph) | VERIFIED |
| Generated artifacts that this change touches | verifiers pass | `verify-tool-catalog`, `verify-cordis-catalog`, `verify-config-catalog`, `verify-persistence-catalog` all exit 0 after regeneration | VERIFIED |
| Refs on the fork | both at the commit | `git ls-remote origin` reads `fe3a1a3c148e69b76aba6ec7bd812eee22b76a5a` for BOTH `refs/heads/feat/session-stage-icons` and `refs/heads/update/v0.1.5-rc.2` | VERIFIED |
| Installer carries the change | markers INSIDE the packaged seed | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,849,563 bytes, 2026-09-20 11:55:36; `...seed/desktop-packages/deepseek-ai-dsh-client-ui-workspace-0.1.5-rc.2.tgz -> package/lib/client.js` carries `dsw-stage-arc-spin` (3); `...dsh-session-status...tgz -> package/lib/index.js` carries `deploying` (3); `...dsh-client-ui-sessions-panel...tgz -> package/lib/client.js` carries `IconStageWorkingOutline24` (1); all eight glyph paths are in the packed `web-frontend` `index-CkHN3ty-.js` | VERIFIED |
| The marks SEEN in the sidebar | the app shows them live | PENDING the operator install. Only a component render inside the shipped stylesheet has been looked at; the sidebar itself and the theme colours have not | UNVERIFIED |

## 2026-09-19 - the footer follows the dashboard a Session names, live: built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| Resolver matches the older rule for Sessions it already answered | no footer lost | 321 REAL Vercel Session logs folded through the shipped projection: old rule 51, new rule 52, lost 0, workspace-directory-alone 0. Evidence `C:\Projects\logs\2026-09-19-dsh-footer-live-intent\intent-proof.txt` | VERIFIED |
| The newest naming message wins | a moved target follows | `session-30675526-1e86-4ffa-b430-a700c01409c5` retained `[{seq:129, urls:["https://portal.theseoitguy.net/website-audit"], target:null}]` and resolved to that URL plus `Website Audit`, where the old rule resolved `{}` | VERIFIED |
| An address whose route is not its key resolves | exact mapped address accepted | Unit cases pass for `/gbl-overlord` for `gbl-content-dashboard`, with `#studio` and a trailing slash; the live maps show 17 of 66 page-source URLs in that class | VERIFIED |
| The list path still never folds history | `apply` not called on a list read | `session-cold.host.spec.ts` and `session-projections.host.spec.ts` pass unchanged with the projection in place (`cachedSnapshot`, not `stateOf`) | VERIFIED |
| Touched suites | green apart from the known environmental failure | 1195 passed, 1 failed, 1 skipped across `packages/api/session-controller` and `packages/client/ui-conversation`; the failure is `media-references.host.spec.ts` symlink `EPERM` (harness error ledger 17/18) | VERIFIED |
| Typecheck and build | exit 0 | `pnpm run typecheck` exit 0 (host and client faces); `pnpm run build` exit 0, "recorded 240 client artifact(s)" | VERIFIED |
| Lint on the changed directories | 0 findings | `oxlint` over the four changed src/tests directories: 0 warnings, 0 errors | VERIFIED |
| Pre-existing gate findings unchanged | identical on the untouched release line | `verify-export-jsdoc` 1 (`session-status`), `verify-client-ui-i18n` 2 (`ui-sidebar-explorer`), `test:docs` 9 passed / 7 failed: all reproduced byte-identically in `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` | VERIFIED |
| Refs on the fork | both at the commit | `git ls-remote origin` reads `d9e83fca02c926f64f1b9ef6af64efc9cc922d13` for BOTH `refs/heads/fix/session-footer-live-intent` and `refs/heads/update/v0.1.5-rc.2` | VERIFIED |
| Installer carries the change | markers INSIDE the packaged seed | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,952,772 bytes, 2026-09-19 18:24:52; `.../seed/desktop-packages/deepseek-ai-dsh-api-session-controller-0.1.5-rc.2.tgz -> package/lib/index.js` carries `workspaceLinks` (10), `resolveSessionLinks` (3), `byAddress` (5); `...dsh-client-ui-conversation...tgz -> package/lib/client.js` carries `workspaceLinks` (1) beside `data-session-footer` (3) | VERIFIED |
| Populated footer SEEN on screen | url and design name | PENDING the operator install: no populated footer has ever been looked at (OPEN_ISSUES 28 and 32) | UNVERIFIED |

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

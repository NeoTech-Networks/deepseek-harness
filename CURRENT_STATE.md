

## 2026-09-20 - the sidebar row draws the session's live stage: the dsh icons set, built, tested and packaged

- OPERATOR REQUEST, and it framed the work: "update the icons that I use for active sessions and make sure the states are matched perfectly. icons should change when the state changes in the session not when it's done". Design source live in Claude Design, project `dsh icons` (`a3cc06af-8c31-4b18-a8d4-a263381a3364`), page `Session Stage Icons.dc.html`. THE PAGE HAD MOVED BETWEEN PLANNING AND IMPLEMENTATION (etag `1789855882691753` to `1789856748216881`): it now carries EIGHT glyphs, not seven, because a generic `stage.working` spinner was added and Blocked, Failed, Saved and Deploying were redrawn, so the extract was re-read from the live page before any code was written. Frozen copy: `C:\Projects\logs\2026-09-20\dsh-stage-icons\design-extract.md`.
- WHAT WAS WRONG: `derivePhase` in `packages/client/ui-workspace/src/client/tree.ts` already ranked live facts above a declared hold, so the reactivity was wired; the gap was that only five phases drew a glyph and `running`, the state a session is in for most of its life, fell through to a bare animated dot. The marks that distinguish states were therefore only seen once something declared a status at the end of a run.
- WHAT CHANGED, commit `fe3a1a3c14`, 23 files, 615 insertions and 107 deletions. (1) Eight stroke glyphs added to `packages/client/ui-primitives/src/icons/index.tsx` at the design's 14px working size, viewBox 24, stroke 2.2, default size 14, with the icon-set assertion moved 75 to 83. (2) `PHASE_GLYPHS` now covers `awaiting-approval`, `awaiting-plan-review`, `awaiting-answer`, `planning`, `running` and `subagents`; `running` draws the Working mark and `liveGlyph` marks it live, with the wrapper pulse cancelled for it so two loops never share one 14px mark. `done` and `idle` keep their dots, and `subagents` keeps its agent mark because the design covers eight stages and delegation is none of them. (3) `STATUS_ICONS` now carries nine ids: the four new ones (`deploying`, `blocked`, `saved`, `failed`) plus the five legacy ids, which stay valid and map to the nearest new mark because an icon id rides a stored `session/status` event and the allowlist only grows. (4) `DEFAULT_VOCABULARY` points at the new marks and gains `failed`, so the Failed mark is reachable from the row menu and the `set_session_status` tool. (5) The glyphs carry NO inline animation and no inline style: each animatable element names itself with `data-part` and `Rows.module.css` owns the keyframes and the transform origins, which is what lets one rule stop all of them for `prefers-reduced-motion` and keeps every glyph's resting frame complete. (6) The 14px reduction the design specifies below 16px is honoured in CSS: one plan check on the middle row and no base line on the hourglass. (7) The second session list is wired too: `SessionsPanel.tsx` draws the same marks at 12px.
- GATES, all this session: 252 tests passed across 11 files in `ui-primitives`, `ui-workspace`, `ui-sessions-panel` and the three `session-status` packages (the icon spec 98 and the row spec 40, both including new cases for the resting frame and for the slot handing over from live work to a declared hold); `pnpm run typecheck` exit 0; `pnpm run build` exit 0 with "recorded 240 client artifact(s)"; oxlint 0 warnings 0 errors on the staged set. Two pre-existing `typescript(no-unnecessary-condition)` findings remain in `Rows.tsx` and `SessionsPanel.tsx` on the `?? UNKNOWN_STATUS_ICON` lines, which this diff does not touch and which cannot be removed without breaking the tested unknown-id fallback. `verify-client-ui-i18n` still reports the same two `ui-sidebar-explorer` strings as before.
- GENERATED ARTIFACTS: regenerating the four that this change touches made them current and their `--check` verifiers pass (`verify-tool-catalog`, `verify-cordis-catalog`, `verify-config-catalog`, `verify-persistence-catalog`). `docs/module-graph*` and `docs/event-producer-consumer.md` were deliberately REVERTED: they were already stale on the base commit (the committed module graph at `d9e83fca02` does not name `pkg_session_status`, which exists in that tree) and their diffs carry only other sessions' drift, so leaving them alone keeps this commit honest and leaves those two gates exactly as they were found.
- VISUAL PROOF, since the desktop app cannot start a second instance while the installed one runs: a standalone page rendering the REAL components out of the built package inside the REAL `Rows.module.css`, screenshotted headlessly (`stage-marks.html`, `shot_1100.png`, and `zoom-14px-paused.png` at 5x). It shows all eight marks, the single plan check and the hourglass without its base line. It does NOT prove the theme colours, because `var(--dsw-alias-state-*)` lives in the app's global theme and not in that stylesheet, and it does not prove the sidebar integration; both need the install.
- INSTALLER, built with `DSH_DESKTOP_APP_ID=com.deepseek.harness`, `DSH_DESKTOP_ALLOW_UNSIGNED=1`, `DOWNLOAD_TEST_ORIGIN=https://download.neotech.biz` from PowerShell: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,849,563 bytes, 2026-09-20 11:55:36, worktree `C:\Projects\worktrees\dsh-stage-icons`. Markers proven INSIDE the packaged seed before handover: `.../seed/desktop-packages/deepseek-ai-dsh-client-ui-workspace-0.1.5-rc.2.tgz -> package/lib/client.js` carries `dsw-stage-arc-spin` (3), `...deepseek-ai-dsh-session-status...tgz -> package/lib/index.js` carries `deploying` (3), `...deepseek-ai-dsh-client-ui-sessions-panel...tgz -> package/lib/client.js` carries `IconStageWorkingOutline24` (1), and all eight glyph path signatures are in the packed web frontend `index-CkHN3ty-.js`.
- REFS: `feat/session-stage-icons` and `update/v0.1.5-rc.2` were fast-forward merged and both read back from the fork at `fe3a1a3c148e69b76aba6ec7bd812eee22b76a5a`. Feature registry 27 rows: `session-stage-marks` (marker `dsw-stage-arc-spin`, `dsh-client-ui-workspace`) and `session-status-failed` (marker `deploying`, `dsh-session-status`); both markers verified ABSENT from the running build and present in the packaged one.
- INSTALL PENDING, and this installer SUPERSEDES the footer-only build of 2026-09-19 18:24:52: it is cut from the same release line and carries the footer work plus the stage marks, so one install covers both. What is owed afterwards is one install and then TWO captures: the populated session footer nobody has ever photographed (OPEN_ISSUES 28 and 33) and the sidebar marks on screen (OPEN_ISSUES 5).

## 2026-09-19 - the footer follows the dashboard a Session names, LIVE, and one installer carries it

- OPERATOR REPORT, and it framed the session: "the footer where it shows the dashboard and the design project is hidden when I do anything in the vercel directory ... fix that so it displays the dashboard URL since I'm always publishing to a dash". Confirmed by question during planning: the NEWEST dashboard a Session names wins, superseding the "a Session that changes its target keeps its first answer" limit recorded 2026-09-17.
- TWO DEFECTS, both measured. (1) THE FOOTER COULD NOT MOVE WHILE A SESSION RAN: it rendered the Session-list row, and a row's links were computed once, at a list pull (`list.ts`; the client pulls the list on boot and on reconnect only), so a Session started in the app kept an empty row forever. (2) THE MESSAGE RULE READ THE OLDEST MESSAGE AND TWO FORMS ONLY, and an address had to end in a known dashboard KEY. Live maps: 17 of the 66 mapped page-source URLs route somewhere whose last segment is NOT their key (`gbl-content-dashboard` is served at `/gbl-overlord`, every `content-roadmap-*` key lives under `/content-roadmap/<client>`, `backlinks-profile` at `/backlinks`), so pasting the estate's own address resolved nothing.
- WHAT CHANGED: `workspaceLinks`, a client-visible Session projection. The fold is MAP-FREE (the addresses and `/dashboard` targets each operator message carries, at most 8 candidate-bearing messages retained, and a message with no candidate returns the SAME state reference), and the wire view resolves it against the live maps at read time, so a regenerated map needs no restart. `resolveSessionLinks` reads the candidates NEWEST FIRST. An address now resolves EXACTLY as the maps record it first (`byAddress`, keyed `host + path`), which is what recovers the routes above, then by the host-plus-key rule; `railway.neotech.biz` and `railway.theseoitguy.net` are accepted as hosts, still requiring a known key. The list path reads the projection's ALREADY-MATERIALIZED value only (`cachedSnapshot`), so it still never folds history and the `session-cold` / `session-projections` listing contracts are unchanged. The client footer reads `useProjection('workspaceLinks')` and keeps the list row as its fallback.
- THE DELIVERY HALF IS WHAT SHOWS, and it needed no new channel: the host already broadcasts a `projection` frame when a wire value changes (`control.ts` lines 26-33) and the client seeds its projection store from the follow-opening baseline, so the footer appears and moves while the operator works, with no list pull and no restart.
- MEASURED over the REAL logs, not fixtures: 321 stored Sessions in `~\.dsh\sessions\--C-Projects-general-Vercel--`, folded through the shipped projection. Resolved by the old rule 51, by the new rule 52, LOST 0; the workspace directory alone resolved 0. Evidence `C:\Projects\logs\2026-09-19-dsh-footer-live-intent\` (`EVIDENCE.md`, `intent-proof.ts/.txt`, `intent-gap.ts/.txt`). THE GAP IS RECORDED, NOT HIDDEN: 268 Sessions still resolve nothing, 45 of them ordinary operator Sessions; 14 of those name a dashboard only as a BARE WORD (`cfo`, `morgan`, `core30`, ...) and were deliberately NOT matched, because several dashboard keys are also ordinary words or a colleague's name, and the safe variant (a backticked or quoted key) would gain exactly ONE root Session.
- GATES, all from the worktree: both touched suites 1195 passed / 1 failed (the known environmental `media-references` symlink `EPERM`), `pnpm run typecheck` exit 0, `pnpm run build` exit 0 with 240 client artifacts, oxlint 0 on the four changed directories, and `verify-export-jsdoc` (1 pre-existing `session-status` violation) plus `verify-client-ui-i18n` (2 pre-existing `ui-sidebar-explorer` strings) plus `test:docs` (9 passed, 7 failed) all reproduced BYTE-IDENTICALLY on the untouched release worktree.
- COMMIT `d9e83fca02` on `fix/session-footer-live-intent`, fast-forward merged into `update/v0.1.5-rc.2` in the release worktree (its five modified state files left untouched), both refs pushed and read back at `d9e83fca02`. Ten files: `workspace-links.ts`, `workspace-links-projection.ts` (new), `types.ts`, `list.ts`, `index.ts`, `packages/api/session-controller/tsconfig.host.json`, both specs, `ConversationRoot.tsx` and its spec. NEW TRAP FOR THE LEDGER: a source file reachable from the ROOT host program but missing from the PACKAGE project's `files` list made `tsc -b` emit `workspace-links.d.ts/.d.ts.map/.js/.js.map` INTO `src/`; adding it to the package tsconfig stopped it and the four strays were deleted.
- INSTALLER: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,952,772 bytes, 2026-09-19 18:24:52, worktree `C:\Projects\worktrees\dsh-footer-live`. The FIRST packaging attempt died on the documented `EPERM` renaming `artifacts\win-unpacked.tmp`; the stale folder was cleared and the retry exited 0. Markers proven INSIDE the packaged seed archives before handover: `deepseek-ai-dsh-api-session-controller-0.1.5-rc.2.tgz -> package/lib/index.js` carries `workspaceLinks` (10), `resolveSessionLinks` (3), `byAddress` (5); `deepseek-ai-dsh-client-ui-conversation-0.1.5-rc.2.tgz -> package/lib/client.js` carries `workspaceLinks` (1) beside `data-session-footer` (3).
- FEATURE REGISTRY now 25 rows: `session-footer-live-intent` (marker `workspaceLinks`, `dsh-api-session-controller`) and `session-footer-live-read` (marker `workspaceLinks`, `dsh-client-ui-conversation`), and the `session-footer-intent` row now reads "newest mention first".
- INSTALL PENDING, and it is the next action: Steve runs `finish-install.ps1` from `C:\Projects\worktrees\dsh-footer-live` in a fresh PowerShell window. Then read the three markers out of the RUNNING profile and PHOTOGRAPH the populated footer, which is still the one thing nobody has ever done (OPEN_ISSUES 28 and 32).

## 2026-09-18 - the install was run: both changes are in the running build, and the sidebar was SEEN sorted

- INSTALL DONE (operator ran `finish-install.ps1`; install at 09:58, first-run setup finished 10:04). Live reads, all this session: the installed exe is 244,440,576 bytes written 2026-09-17 23:52:40, which is the 23:52 build; `resources\seed\desktop-release.json` reads `0.1.5-rc.2`; the newest provision log `provision-2026-09-18T13-58-39-011Z.log` runs `pnpm install exited with 0`, `staged health check passed` (14:04:39Z), `staging profile activated as 0.1.5-rc.2`, `applyRelease finished`; four `DeepSeek Harness` processes started 09:58:36 to 10:04:45.
- THE RUNNING PROFILE CARRIES BOTH CHANGES, read out of the extracted profile rather than out of the repo: `dsh-api-session-controller\lib\index.js` has `resolveSessionLinks` (2, written 09:58:52); `dsh-client-ui-conversation\lib\client.js` has `hasWorkspaceLinks` (2, 10:00:14); `dsh-client-ui-workspace\lib\client.js` has `byWorkspaceName` (3, 09:59:05). `dsh_local_features_check.py` reads "all 23 local features are present in the running build", exit 0, including `session-footer-intent` and `workspace-folder-sort`.
- THE SIDEBAR WAS LOOKED AT, which the previous session could not do: a DPI-aware PrintWindow capture of the app window (`C:\Projects\logs\2026-09-18\dsh-footer-intent\app-window.png`, 2984x1760, with `sidebar-band.png` and `composer-band.png` cropped out of it) shows the folders under the expanded SIG group reading Agents, backlinks, blog-articles, client-reporting, content-planner, Google Business, onboarding, service-pages, which is case-insensitive A to Z. The sort is confirmed on screen, not only in a test.
- THE FOOTER'S NEW QUIET BEHAVIOUR WAS ALSO LOOKED AT: the Session open in the window is `C:\Projects\general` with the first message "review sessions using new dashboard pull skill today. any bugs to fix?", which names no dashboard and maps to none, and the composer band shows the message box, the toolbar and the stats line with NO footer under them. Under the old build that area carried a bare `Dashboard:` and `Design Project:`.
- THE SHIPPED RESOLVER, RUN AGAINST THE LIVE MAPS (not a re-implementation): `pnpm exec tsx` over `resolveSessionLinks` from `packages/api/session-controller/src/workspace-links.ts` with the real `~\.dsh` maps gives `C:\Projects\general\Vercel` plus `/dashboard https://ops.theseoitguy.net/keywords` -> `{"dashboardUrl":"https://ops.theseoitguy.net/keywords","designProject":"Keywords"}`; `services\youtube-creator` -> the youtube-creator URL plus `YouTube`; the unmapped Session above -> `{}`; `https://theseoitguy.com/youtube-creator` -> `{}`, so the lookalike is still refused. Harness: `resolve_live.ts` and `resolve_live.txt` in the same evidence folder.
- STILL OWED, AND IT IS ONE CLICK: a photograph of a POPULATED footer. Every Session the window was showing maps to nothing, so the positive case has not been seen with eyes yet. Open any Session whose workspace resolves (the `Dashboard Design ...` row in All Sessions is one, or any Vercel Session), and the footer should read `Dashboard: <url>` and `Design Project: <name>`.

## 2026-09-17 - the sidebar's folders sort by name, and ONE installer now carries both changes

- OPERATOR REQUEST, added to the same uninstalled build: "folders inside workspace in alphabet order. new folders or folders removed auto sort reminder folders". Confirmed by question before any code was written: the FOLDERS under each group sort A to Z, and nothing extra was wanted (no reminder line, nothing to press). The sessions inside a folder keep their Manual or Last-updated order.
- WHAT WAS WRONG: the named group HEADERS already sorted A to Z (2026-09-08), but the folder rows under them came out in the order the app held them, so adding or removing a folder left the list unsorted.
- WHAT CHANGED: `sectionize` in `packages/client/ui-workspace/src/client/tree.ts` sorts Workspace rows by the name the row shows, inside named groups and in the ungrouped section. One collator does it (`Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })`), the same natural case-insensitive ordering the right sidebar's file explorer already uses for its rows, and the group headers now use it too so both levels order identically. A title the operator cleared falls back to the path instead of sorting to the top; equal names keep Host order because `Array.sort` is stable; loose sessions are untouched.
- ONE EXISTING TEST ASSERTED THE OLD BEHAVIOUR, which is exactly what the operator asked to change: `tree.client.spec.ts` "keeps Host Workspace and sessionIds order" now pins the session order and the sorted folder order, and a new case proves the order inside a group and in the ungrouped section, including a folder added afterwards. `packages/client/ui-workspace` reads 216 passed (was 215), `pnpm run typecheck` 0, `pnpm run build` 0 with 240 client artifacts, oxlint 0 on both changed files.
- COMMIT `a21af3a222`, fast-forward merged into `update/v0.1.5-rc.2`, both refs pushed and read back from the fork (`43500cd452..a21af3a222`).
- FEATURE REGISTRY 23 rows: `workspace-folder-sort`, marker `byWorkspaceName`, package `dsh-client-ui-workspace`.
- INSTALLER REBUILT, AND THIS ONE SUPERSEDES THE 19:16 BUILD: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,901,646 bytes, 2026-09-17 23:52:45, same worktree `C:\Projects\worktrees\dsh-footer-intent`. All markers proven INSIDE the packaged seed archives before handover: `byWorkspaceName` (3) in `deepseek-ai-dsh-client-ui-workspace`, `resolveSessionLinks` (2) in `deepseek-ai-dsh-api-session-controller`, `hasWorkspaceLinks` (2) in `deepseek-ai-dsh-client-ui-conversation`.
- INSTALL PENDING, unchanged and still the next action: one line from a fresh PowerShell window, because it force-closes the app hosting a Session. The checklist in NEXT_SESSION_PROMPT.md now includes the folder order.

## 2026-09-17 - the footer resolves the dashboard a Session names, and the maps reload themselves

- OPERATOR REPORT, and it framed the whole session: "the footer has dashboard URL and design project and it only seems to work some of the time, it does not work when it is in the Vercel directory". Measured and confirmed rather than taken on trust: the resolver read the Session's workspace directory and nothing else, and `C:\Projects\general\Vercel` (the workspace the dashboard skill declares is where every dashboard change runs from, 307 recorded Sessions) maps to no dashboard by construction. Simulated against the real maps and the real stores: 85 of 761 recorded Sessions resolved, and 67 of the 341 Sessions the app lists.
- ROOT CAUSE: `list.ts` passed `header.cwd` into `workspaceLinksField`, and `matches()` in `workspace-links.ts` accepts only a mapped folder, a folder inside it, or a trailing `packages/dashboards/src/<key>`. A Vercel Session hits none of them, so both labels rendered with no value.
- THE MISSING SIGNAL WAS ALREADY ON DISK: the host-only `titleInput` projection (`dsh-session-title`, stateVersion 3) already folds the OLDEST eligible operator message at O(1). For the keywords Session it reads `/dashboard https://ops.theseoitguy.net/keywords` (`~\.dsh\storages\session_projcache\sessions\9566aecf-....json`). The resolver consults it ONLY when the workspace names no dashboard, so no footer that already resolved can move.
- WHAT IT MATCHES: a key lookup inverted from the two maps (66 dashboard keys, 6 front-door hosts, NO new file) as either a `/dashboard <target>` target or a front-door address. An address counts only when BOTH its host is a known front door and its last path segment is a known key, so `theseoitguy.com/youtube-creator` cannot claim a dashboard. The `/dashboard` modes (orient, explain, new, design, remove) match nothing.
- MEASURED AFTER: 132 of 761 recorded Sessions, and 106 of the 341 the app lists; the Vercel folder goes 0 to 29 of 77. Harness: `C:\Projects\logs\2026-09-17\dsh-footer-intent\resolver_count.py` plus its output beside it. The known limit is recorded there too: a Session whose first message never names a dashboard still shows no footer, and a cold Session still resolves by folder alone.
- MAPS RELOAD: the module-level memo is replaced by an mtime-and-size test over both files, so a regenerated map no longer needs an app restart.
- THE FOOTER HIDES WHEN NOTHING RESOLVES (operator decision, asked and answered during planning): a visible footer now always means a real dashboard was found. This supersedes the tenth pass, which kept two empty labels.
- ONE PRE-EXISTING LINT ERROR FIXED IN THE LINE ALREADY BEING CHANGED: `sessionId !== undefined` after `!hero` is redundant because `!hero` already narrows it, and the type-aware lint reported it on the base commit `e15a4fc5f4` as well.
- COMMIT `43500cd452` on `fix/session-footer-intent`, fast-forward merged into `update/v0.1.5-rc.2` in the release worktree (whose five uncommitted state files were left untouched), and BOTH refs pushed and read back from the fork. Worktree `C:\Projects\worktrees\dsh-footer-intent`, cut from `e15a4fc5f4`.
- GATES: 18 resolver cases pass, 27 client footer cases pass, both touched package suites 1175 passed of 1177 (the failure is the environmental symlink `EPERM` in `media-references.host.spec.ts`, reproduced identically on the base commit), `pnpm run typecheck` 0, `pnpm run build` 0 with 240 client artifacts, oxlint 0 on the changed paths, and the i18n gate at its 2 pre-existing `ui-sidebar-explorer` findings with zero in the changed files.
- INSTALLER: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,931,936 bytes, 2026-09-17 19:16:27, packaged from `dsh-footer-intent`, with all four new markers proven INSIDE the packaged seed archives (`resolveSessionLinks` and `titleInput` in `deepseek-ai-dsh-api-session-controller`, `hasWorkspaceLinks` and `data-session-footer` in `deepseek-ai-dsh-client-ui-conversation`). The Node runtime zip was reused from the rc.2 worktree with its SHA256 checked against the sums file first.
- FEATURE REGISTRY 22 rows: `session-footer-intent`, marker `resolveSessionLinks`, package `dsh-api-session-controller`.
- MAP GENERATOR: `C:\Claude\bin\dsh_dashboard_links.py` gained `--check` and a mapped-field-aware freshness test. It reports the estate checkout 38 commits behind origin/main with 7 changed contracts and NO mapped field among them, and exits 0 (the maps match the estate). Committed in the config repo as `4e9b97ff`.
- INSTALL PENDING, and it is the next action: Steve runs `finish-install.ps1` from the new worktree in a fresh PowerShell window. It force-closes the app, so it cannot be run from inside a Session. Then verify against the running profile and PHOTOGRAPH the footer of an open Session, which is the one thing nobody has ever done (item 28).

## 2026-09-17 - the session footer lists the dashboard and the design project, and one installer carries it

- CHANGE (operator request): the footer under the message box now carries TWO labelled lines for an open Session, `Dashboard: <full url>` and `Design Project: <name>`. Both rows render for every Session, each with its label alone when the workspace has no association. The grey session-summary line that used to own that footer is REMOVED by instruction, and the dashboard value is now the whole address (still a link) instead of the word "Dashboard".
- COMMITS: `4980d90f54` (api-session-controller: the resolver plus tests) and `e15a4fc5f4` (ui-conversation: the two rows, the locale pair, the tests) on `feat/session-footer-links`, fast-forward merged into `update/v0.1.5-rc.2`. Both refs read back from the fork at `e15a4fc5f4`.
- TWO MAPS, NOT ONE: `~\.dsh\dashboard-links.json` had to keep its flat `{folder: url}` shape because an older build reads it, so the design names went to a SECOND flat file, `~\.dsh\design-links.json`, written in the same run of `C:\Claude\bin\dsh_dashboard_links.py`. Either file can be missing; the host reads them independently.
- WHAT THE DESIGN LISTING ACTUALLY GIVES YOU (live reads): `list_projects` answers 20 projects on the primary account and 9 on `team_account`, takes no limit and no cursor (both schemas read live, `properties: {}`), and therefore covers 29 of the 46 distinct design project ids the contracts name. `get_project` by id resolves the rest, and with it every one of the 62 design links carries a real Claude Design name: `cfo` -> `NeoTech Monthly Billing`, `youtube-creator` -> `YouTube`, `all-postgres-databases` -> `Database View`. ZERO fell back to the contract title.
- RESOLUTION ALSO MATCHES A WORKTREE, and that is the part that makes it useful: dashboard work runs in vercel-services worktrees (about 200 of them under `C:\Projects\_wt\...`), where the mapped absolute path of the primary checkout does not apply. `packages/api/session-controller/src/workspace-links.ts` matches the mapped directory or its trailing `packages/dashboards/src/<key>`, case-insensitively and separator-insensitively.
- THE OLD MAP WAS STALE, AND THAT WAS THE FIRST FINDING: the previous `dashboard-links.json` held 67 entries. The estate independently yields exactly 66 live + react keys with a live route (counted from the contracts in the same run), so the regenerated file matches the estate and the 67th entry was a leftover.
- GATES: the two touched package suites read 1166 passed of 1168, and the single failure is the known no-symlink-privilege `media-references` case, reproduced unchanged on `1a77e844ad`. `pnpm run typecheck` exit 0. `pnpm run build` exit 0 with 240 client artifacts. The pre-push hook typecheck passed on both pushes. `verify-client-ui-i18n` still exits 1 on the two pre-existing `ui-sidebar-explorer` strings, byte-identical on `1a77e844ad`.
- INSTALLER BUILT AND PROVEN AT THE SEED LEVEL: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,884,537 bytes, 2026-09-17 01:20:22, worktree `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`. Out of the packaged seed: `deepseek-ai-dsh-client-ui-conversation-0.1.5-rc.2.tgz -> package/lib/client.js` carries `data-session-footer-line` (2) and NO `sessionFooterSummary` (0), and `deepseek-ai-dsh-api-session-controller-0.1.5-rc.2.tgz -> package/lib/index.js` reads both map files.
- FEATURE REGISTRY: 21 rows now. The `session-footer` row's wording was corrected (it described the old summary line) and `session-footer-design-project` was added with marker `data-session-footer-line`.
- PRODUCER SERVICE FOLDERS ADDED (operator, same session): a Session opened in the SERVICE that publishes a dashboard is touching that dashboard, and the contract names the service, so `...\sig-railway-services\services\youtube-creator` now resolves as well. 23 folders went into both maps and the totals are 89 dashboard links and 83 design links. The old "one repo hosts many dashboards" objection was right about the REPO and wrong about the SERVICE: 10 services really are ambiguous (`content-planner` alone publishes 17 dashboards) and are skipped by name, while 24 keys are unambiguous. Both numbers are printed by the generator on every run. NOTE: the host memoizes the map on first use, so a map change needs an app RESTART; no rebuild and no reinstall.
- INSTALL DONE AND VERIFIED AT THE CODE LEVEL (operator ran `finish-install.ps1`; install finished 01:49). Evidence, all read after the restart: `dsh_local_features_check.py` reads "all 21 local features are present in the running build", exit 0, including `session-footer` and `session-footer-design-project`; the running profile's `dsh-client-ui-conversation\lib\client.js` (written 01:48:52) carries `data-session-footer-line` (2) and NO `sessionFooterSummary` (0); the profile's `dsh-api-session-controller\lib\index.js` reads `design-links.json` (2); the provision log `~\.dsh\desktop\logs\provision-2026-09-17T05-43-57-676Z.log` ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished`; four app processes started 01:43:54 to 01:49:16; the installed release file reads `0.1.5-rc.2`.
- THE MAPS RESOLVE LIVE, against the real files rather than fixtures: `pnpm exec tsx` over the resolver source and the real `~\.dsh` maps resolves the youtube-creator page folder, a vercel-services WORKTREE of it, and `services\youtube-creator` to `https://ops.theseoitguy.net/youtube-creator` plus `YouTube`; `services\content-planner` resolves to nothing, as designed.
- STILL OWED, AND IT NEEDS EYES: nobody has yet photographed the footer of an OPEN Session. A window capture of the running app was taken, but the app was sitting on the NEW SESSION (hero) screen, where the footer correctly does not render, and none of the operator's current workspaces points at a mapped folder. The capture set is `C:\Projects\logs\2026-09-17\dsh-session-footer-lines\`.

## 2026-09-16 - the install finished: 20 of 20 markers, all three changes in the running code

- INSTALLED AND VERIFIED at 01:11 to 01:14. Evidence: the installed exe reads 2026-09-16 00:39:00 against the 00:39:04 artifact; four processes started 01:11:32, 01:11:34, 01:13:53 and 01:14:18; the provision log `~\.dsh\desktop\logs\provision-2026-09-16T05-11-34-481Z.log` runs `seed integrity verified` then `staged health check passed` then `staging profile activated as 0.1.5-rc.2` then `applyRelease finished`; the freshly extracted profile's ui-workspace files read 01:11:47 to 01:12:51.
- `py C:\Claude\bin\dsh_local_features_check.py` reads "all 20 local features are present in the running build", exit 0, so BOTH new markers landed: `archive-session-shortcut` and `workspace-group-fold`.
- The RUNNING profile's `dsh-client-ui-workspace\lib\client.js` carries `ARCHIVE_CHORD_LATCH_MS` (2), `sectionShowsWorkspaces` (5) and the group rule `font-size:13px;font-weight:600;line-height:18px` (1). The only `font-size:11px` left in that bundle is `.countBadge`, a different element, so the group label really is 13px.
- STILL OWED, AND IT NEEDS HANDS OR EYES, NOT READS: Ctrl+Shift+A pressed from the All Sessions list and from the workspace tree; the group header folded and unfolded with its 13px label seen on screen; and one app restart to prove the fold is remembered. The mechanical half of the install is proved; the visible half is not.
- NEW FINDING, cosmetic, NOT TOUCHED: Add/Remove Programs carries TWO entries for this one install, `7260a3eb-fb49-5c0a-a594-ea7b31e1d959` and `7808434f-469e-5eba-848e-edf64d3b94ce`, both at 0.1.5-rc.2 and both pointing at the same `Uninstall DeepSeek Harness.exe /currentuser`. This is the app-id mismatch recorded on 2026-09-10: the build uses `DSH_DESKTOP_APP_ID=com.neotechnetworks.deepseek-harness` per the skill, while the install line predates it. The same duplicate was cleaned once before (2026-09-09, exported to `~\.claude\Exports` then deleted). Left alone here because it is a registry change and both rows remove the same install; the durable fix is to settle on ONE app id in the skill and the builds.

## 2026-09-16 - the group header is 13px, the default for every group

- REQUEST (operator, same day as the fold): the group label text two points larger, ALL groups, as the built-in default. `.groupHeader` in `WorkspaceBrowser.module.css` is now `font-size: 13px` with `line-height: 18px` (was 11px/16px). It is the single class every named group header shares, so every group gets it and there is no per-group or opt-in size.
- COMMIT `1a77e844ad` on `feat/archive-session-shortcut` and on `update/v0.1.5-rc.2` (both read back from the remote). Nothing asserted the old size, so no test changed; the ui-workspace suite still reads 215 passed.
- INSTALLER REBUILT AGAIN, SUPERSEDING the 00:19 build: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,906,904 bytes, 2026-09-16 00:39:04, same worktree. The rule was read back out of BOTH the built bundle and the packaged seed before handover: `...groupHeader{...font-size:13px;font-weight:600;line-height:18px...}`.
- ONE TRANSIENT PACKAGING FAILURE, CAUSE UNKNOWN: the first attempt after this change failed inside `package-target.ts`, and the immediate rerun succeeded with exit 0. The documented `EPERM` renaming `win-unpacked.tmp` (antivirus holding the extracted electron.exe) is the best fit, but the failure text was lost because that run's output was tail-truncated, so this is reported as transient rather than diagnosed.
- STILL INSTALL PENDING. ONE installer now carries all three changes: the Ctrl+Shift+A chord, the foldable named group header, and this size.

## 2026-09-16 - a named Workspace group folds from its own header, and the choice is remembered

- FEATURE: `e7b9f7ef6d` on `feat/archive-session-shortcut` and on `update/v0.1.5-rc.2` (both read back from the remote at `e7b9f7ef6d`). The sidebar's NAMED Workspace groups (the label set through `Set group…`) now fold as a whole: the group header is a button with a triangle beside the name, and its open or closed state is remembered across restarts.
- WHY IT WAS MISSING: that header was a plain `<div>` with no control at all. The per-WORKSPACE fold already existed (folder glyph, chevron, `groupExpansion`), which is a different axis, so the sidebar now has two nested folds: named group, then Workspace, then the zero-or-five Session limit inside a Workspace.
- PERSISTENCE, AND THE DELIBERATE DEVIATION FROM THE VERSIONED KEY: `sectionExpansion` was added to the browser view store WITHOUT bumping `dsh.workspace.view.v5`. Persistence is whole-value (`attachPersistence` does `setState(JSON.parse(raw))` with no merge), so a blob written before this field existed has no map at all. Every reader tolerates that: `sectionShowsWorkspaces` treats an absent map or a missing key as "never folded", and `setSectionExpanded` creates the map on the first write. Bumping to v6 is the house migration and was REJECTED because it would also discard the operator's manual session ordering, grouping mode and per-Workspace folds, which is real data loss for a field that costs one tolerant read.
- GATES: 215 ui-workspace tests (4 new fold cases, one of which mounts on a view state that predates the field), `pnpm run typecheck` exit 0, `pnpm run build` exit 0, README pair re-recorded and verified consistent, feature registry now 20 rows (`workspace-group-fold`, marker `sectionShowsWorkspaces`).
- INSTALLER REBUILT, SUPERSEDING the 2026-09-15 19:05 build: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,914,731 bytes, 2026-09-16 00:19:52, same worktree `C:\Projects\worktrees\dsh-archive-shortcut`. It carries BOTH changes. Proven inside the packaged seed before handover: `deepseek-ai-dsh-client-ui-workspace-0.1.5-rc.2.tgz -> package/lib/client.js` carries `ARCHIVE_CHORD_LATCH_MS` (2), `sectionShowsWorkspaces` (5) and `group.toggle` (3).
- STILL INSTALL PENDING, and the VISUAL pass is unproven: the chevron rotation and the hover background are copied from the All Sessions header, which is known good, but nothing has looked at the rendered sidebar. The operator's eyes are the proof.

## 2026-09-15 - Ctrl+Shift+A archives the session you are looking at

- FEATURE: `feat/archive-session-shortcut` (`1e78c99f4f`, pushed to the fork) adds the third operator chord. Ctrl+Shift+A archives the Session the window is showing, which is the row menu's Archive item on the keyboard.
- WHY THE BROWSING REGION AND NOT THE COMPOSER: the listener rides `WorkspaceBrowser`, which stays mounted in every sidebar state (wide and rail) and every main-column state. The composer does not: `ui-layout` `AppFrame` renders the `main` slot keyed by `activePanelId ?? 'conversation'`, so a global panel replaces the conversation and unmounts the composer. A composer-hosted chord would die exactly while the operator is browsing, which is the silence that cost hours on 2026-09-11 (ledger 35). One window listener therefore answers from the All Sessions list, the workspace tree, the search box and the conversation alike.
- TARGET RULE: only the current Session, and only while the row menu would have offered Archive for it. A blank New Session row carries no verbs until its first prompt, so "no Session" and "not started yet" are the same refusal: a banner (`archive.nothingToArchive`), nothing archived, and the latch NOT armed, because a refusal is not an action.
- FAILURE VOICE: a rejected archive keeps the row menu's `console.warn('session archive rejected:', reason)` and adds `archive.failed` through the `Toast` primitive, since the key leaves no menu open to explain itself.
- MECHANICS: window `keydown`; Ctrl+Shift required, Alt and Meta rejected; `repeat` ignored; `code === 'KeyA'` first with `key` as the fallback for keyboards and KVM paths that deliver no scan code; 300ms module-scope latch (`ARCHIVE_CHORD_LATCH_MS`) armed only on the acting path, mirroring the composer chords.
- GATES: ui-workspace 11 files and 211 tests pass (10 new chord cases), `pnpm run typecheck` exit 0 locally and again in the pre-push hook (31.7s), `pnpm run build` exit 0 with 240 client artifacts, the README pair re-recorded and verified consistent.
- INSTALLER: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,945,456 bytes, 2026-09-15 19:05:34, worktree `C:\Projects\worktrees\dsh-archive-shortcut`. Proven INSIDE the packaged seed before handover: `deepseek-ai-dsh-client-ui-workspace-0.1.5-rc.2.tgz -> package/lib/client.js` carries `ARCHIVE_CHORD_LATCH_MS` (2 occurrences) and `nothingToArchive` (3).
- PACKAGING TRAP, NEW (ledger 37): the first attempt died in `tar -tzf C:\...\*.tgz` with `tar (child): Cannot connect to C: resolve failed`, because this session's PATH resolved `tar` to Git's GNU tar at `C:\Program Files\Git\usr\bin\tar.exe`, which reads `C:\...` as `host:path`. Prepending `C:\Windows\System32` (bsdtar 3.8.8) fixed it, with no repo change.
- INSTALL PENDING, and the installer force-closes the app that hosts the session that built it. Next session: `dsh_local_features_check.py` must read 19 of 19, the marker must be read back out of the RUNNING profile's `dsh-client-ui-workspace\lib\client.js`, the `web boot:` line must name no entry that failed to activate, and the key must be pressed from the All Sessions list and from the workspace tree.
- NOT TOUCHED: the All Sessions rail defect (OPEN_ISSUES 27) is unrelated and still open. This change adds no unarchive control; archiving remains one-way, recovered only by editing `archivedSessionIds` in `~\.dsh\storages\workspace.json` with the app closed.
- PRE-EXISTING, NOT CAUSED HERE: `verify-client-ui-i18n` exits 1 on two hard-coded strings in `packages/client/ui-sidebar-explorer/src/client/definition.ts` (`pinnedText` and the text id). The file is unmodified on this line.

## 2026-09-14 - a keep-alive stall no longer costs fifteen minutes and a dead turn

- SYMPTOM: "This turn failed SSE stream ended without [DONE]". A decode of all 535 saved session logs found 14 `STREAM_CLOSED` turn deaths, every one dated 2026-09-14, every one on `deepseek-official / deepseek-flash`, across 5 sessions, and ZERO on any earlier day. Each burned about fifteen minutes and recorded exactly one chunk: the finish error. No content ever arrived.
- ROOT CAUSE, provider side: `deepseek-flash` is not starting inference at all. An 8-token "hi" with no tools returns HTTP 200 and then 98 bytes in 90 seconds, all of them `: keep-alive`, zero data payloads. `deepseek-v4-pro` on the same key answers in about a second. Confirmed four times between 16:20 and 16:50. DeepSeek trace id `47725ea260636ad4556acd718262e2b1`.
- ROOT CAUSE, our side (two defects, both fixed): `adapter.ts` passed the idle watchdog's `pulse()` to `parseSse` as its COMMENT callback, so every keep-alive rearmed the 300s stall timer and the watchdog could never fire; and `STREAM_CLOSED` is the one transport-class code `retry-policy.ts` excludes by default, so the turn died rather than retrying (the same scan shows 603 TRANSPORT and 373 TIMEOUT failures absorbed silently that week).
- The DeepSeek playbook already documented the provider behaviour (`AGENT.md` hard rule 6: keep-alive comments while inference has not started, connection closed at ten minutes, "your parser must tolerate both"). The harness was not tolerating it.
- FIX, branch `fix/deepseek-stream-stall` (`4929fed9fe`, `3fdc254989`), pushed to the fork: new `streamFirstPayloadTimeoutMs` (default 120000, `0` disables) bounds send-to-first-payload only; a comment no longer rearms the idle watchdog BEFORE the first payload and counts exactly as before after it; expiry is `TIMEOUT`, already retryable. The bundle patch now gives the DeepSeek route its own `retryPolicy`: `maxRetries: 3` and the full six-code list including `STREAM_CLOSED` (the list REPLACES the defaults, so it is spelled out).
- Mock server gained a `keepalive_stall` behavior so the shape is reproducible offline.
- WHY IT SURFACED NOW: the 2026-09-13 install carries `1e89100c7f`, which disabled `llm-route-fallback`. That plugin had been diverting every flash request over 3000 tool-parameter bytes to `deepseek-v4-pro`, and the real catalog is 69029 bytes, so it diverted all of them. Disabling it put traffic back on flash on the day DeepSeek's flash route went bad. The harness change did not cause the fault; it removed an accidental shield.
- Installed and verified the same day. Evidence: `C:\Projects\exports\2026-09-14-dsh-sse-stall\`.
- CORRECTION, SAME DAY, 17:35: the line above saying `deepseek-flash` "is not starting inference at all" was WRONG. The route is INTERMITTENTLY stalling, not down, and every probe in the 16:20-17:16 window happened to land on a stall. Steve pushed back that it had been working; he was right. Measured after: 20 single-shot probes across 5 request variants mostly answered in 0.5-1.2s, six full-sized streaming requests (112 tools, 156 KB) all completed with first payload 797-1336 ms and zero keep-alive comments, a context sweep to 250k tokens gave 1526-2330 ms, and 8 real agent turns completed 8 of 8 in 863-1244 ms with no retry needed. The fix is unaffected and is worth MORE against a flaky route than a dead one, because retrying actually recovers. What changed is the tuning: `streamFirstPayloadTimeoutMs` went from a cautious 120000 to a measured 25000 (about ten times the slowest honest first token of 2.33s), in `~\.dsh\settings.yaml` for immediate hot-reload and in the source default for a clean install. `retryPolicy` is now in the settings file as well as the bundle patch so the section cannot shadow it. METHOD NOTE worth keeping: "the provider is down" needs a RATE, not a repetition.
- MERGED the same day: `fix/deepseek-stream-stall` fast-forwarded into `update/v0.1.5-rc.2` (`471e72742e` to `3fdc254989`) and pushed, with the pre-push typecheck green in 53s. Both refs read back equal from the remote, and the release line's `adapter.ts` and `cordis.patch.yml` carry the fix. The five modified state files sitting in the rc.2 worktree were left untouched by the fast-forward, deliberately: they are stale copies of the item-16 kind.

## 2026-09-13 - four app fixes built: question scroll, All Sessions recovery, param-led pwsh, PR #21 landed

- Merged PR #21 (`feat/ui-session-footer`) into `update/v0.1.5-rc.2` as `5512545eac`. The last install had been packaged from that line WITHOUT it, which is exactly why `workspace-unarchived-count` and `session-footer` read MISSING at 13/15.
- Four fixes built on top as `e39f7bf01e`, pushed to `update/v0.1.5-rc.2`:
  - the whole question card (title, detail, options) now rides ONE scrollport, with the action row and the footer pinned, so a long question can no longer push its choices out of view;
  - `ask_user_question` gained the optional `detail` markdown field and the at-most-two-sentences-per-paragraph rule;
  - a section-scoped error boundary in `AllSessionsSection` shows the crash reason plus one retry, instead of the shared slot boundary's silent empty div that needed an app restart;
  - `pwsh-local` wraps a `param(...)`-led command in a script block, so the UTF-8 encoding preamble can no longer turn `param` into an unknown command.
- The recurring PowerShell failure is NAMED: 107 of 2,195 failing pwsh calls since 2026-08-01 are the same `ParserError: Variable reference is not valid. '$' was not followed by a valid variable name character`, caused by a regex such as `^\$script:` inside a DOUBLE-quoted `-Pattern`. The `pwsh` tool description now teaches single-quoted patterns.
- Installer built: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,784,998 bytes, 2026-09-13 11:08. NOT INSTALLED: the operator runs `finish-install.ps1`, which force-closes the app hosting the session that built it.
- Feature markers added to `C:\Claude\bin\dsh_local_features.json`: `question-card-scroll` (`headingInBody`), `all-sessions-recovery` (`data-all-sessions-error`), `pwsh-param-led` (`commandText`).
- Evidence and the two read-only scan scripts live in `C:\Projects\logs\2026-09-13\dsh-ui-fixes\` (`EVIDENCE.md`, `scan-pwsh-errors.mjs`, `dump-parser-errors.mjs`, `pwsh-error-scan.txt`, `parser-error-dump.txt`).
- SETTINGS RETENTION, found broken and fixed the same day: the config vault (`C:\Projects\repos\dsh-config`) was AHEAD 4 / BEHIND 1 against its origin, so nothing had published since 2026-09-11 while every scheduled snapshot printed a failure nobody reads. Reconciled and published (`origin/main` `70b2552`), and `push_vault` in `C:\Claude\bin\dsh_config_vault.py` now fetches and replays the local snapshots on top of `origin/<branch>` so a diverged remote heals itself.
- `finish-install.ps1` now GUARANTEES retention instead of reporting drift: the pre-install snapshot is a hard gate (no fresh copy, no install), a verify+restore runs while the app is closed before the first launch, and after first-run setup a drift is repaired by closing the app, restoring every protected file, relaunching and re-verifying. Commit `471e72742e` on `update/v0.1.5-rc.2`. Isolated end-to-end proof (temp home, temp vault, bare remote) in `C:\Projects\logs\2026-09-13\dsh-settings-retention\`.
- NOTE: `471e72742e` changes the helper script only, NOT the installer, so the packaged `deepseek-harness-0.1.5-rc.2-win-x64.exe` (194,784,998 bytes) is still current; the operator re-runs the same `finish-install.ps1` command and gets the retention guarantee.

## 2026-09-12 - llm-route-fallback disabled: sessions were silently running on pro

- The `llm-route-fallback` plugin merged earlier today was moving EVERY request from `deepseek-flash` to `deepseek-v4-pro`: its `limitBytes` (3000) sits below the real tool-catalog size, so the "tools assembled" gate never kept a request. Every new session started on flash and flipped to pro on its first request.
- Fixed by setting `enabled: false` in `packages/bundle/base/cordis.patch.yml` on `feat/llm-route-fallback` (commit `9f8261490a`), then rebuilding and reinstalling.
- Verified live: the running profile's `dsh-base/cordis.patch.yml` reads `enabled: false`, and this session's request headers show four pre-fix requests on `deepseek-v4-pro` followed by the first post-install request on `deepseek-flash` (23:20:53Z, 18s after `applyRelease finished`).
- Installer: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,826,890 bytes.
- Landed on the release line the same day: replayed as `1e89100c7f` on top of the PR #20 squash-merge (`ba3644927a`) and pushed to `update/v0.1.5-rc.2`.

## 2026-09-12 - session footer, workspace indent/count, route fallback shipped

- Installed 0.1.5-rc.2 with all 15 local features verified (`dsh_local_features_check.py`).
- Merged PR #20 (llm-route-fallback) into `update/v0.1.5-rc.2`.
- New UI on `feat/ui-session-footer` (PR #21): sessions indented under workspace folders; workspaces coloured + counted when they have unarchived sessions; a session footer under the message box (summary plus the associated dashboard URL, shown only when the workspace maps to a dashboard in `~/.dsh/dashboard-links.json`, 67 entries, regenerated by `dsh_dashboard_links.py`).
- Commits `ed2298f345` and `86ed07586b`; installer 194,791,959 bytes built 20:56.
- Feature markers added: `workspace-unarchived-count`, `session-footer`.



## 2026-09-10 - Composer shortcut moved off Alt to Ctrl+Shift; installer built, install pending

The Alt+P / Alt+S composer shortcuts were replaced with Ctrl+Shift+P /
Ctrl+Shift+S. The 2026-09-09 keyup fix made the shortcut fire, but the Alt
KEYDOWN still woke the native Windows menu bar, whose first item is "Desktop
Plugins…", so Alt+P popped that window open. Ctrl+Shift is delivered to the
renderer on keydown, so the menu bar is left alone.

- Commit `8ce3ffe9ac` on branch `fix/composer-shortcut-modifier` (based on
  update/v0.1.5-rc.1), pushed to origin.
- InputBar.tsx chord + 5 tests in input-bar.client.spec.tsx; also updated
  C:\Claude\bin\dsh_local_features.json (3 shortcut entries).
- Proven: 93/93 input-bar tests, build exit 0, package exit 0 (after seeding
  the cached Node 24.17.0 runtime from another worktree because nodejs.org
  timed out). Fix confirmed in the packaged seed (keydown + Ctrl+Shift, no
  Alt keyup).
- Installer: apps/desktop/.desktop-build/targets/win-x64/artifacts/
  deepseek-harness-0.1.5-rc.1-win-x64.exe (185.7 MB).
- NOT installed yet (operator runs finish-install.ps1). Two new findings for
  the playbook: (1) packaging needs the Node runtime and nodejs.org can time
  out, seed the download cache; (2) the installer was built with
  DSH_DESKTOP_APP_ID=com.neotechnetworks.deepseek-harness (per the skill), but
  the live 0.1.5-rc.1 install uses com.deepseek.harness (uninstall key
  7808434f-...); that mismatch will register a second uninstall entry.

## 2026-09-09 - Right sidebar per-session width: ported, built, installed, verified

The per-session panel-width fix (written 2026-09-09 but left uncommitted on the
pre-0.1.5 line, branch fix/account-usage-remote-mount) is now LIVE in the
running app. It was ported onto update/v0.1.5-alpha.2, resolving the
0.1.3-to-0.1.5 store-shape conflicts (the single global `rightbar` became
`layoutInfo.rightbarBySession`, keyed by session id), committed bf27396cf6,
pushed, built, packaged (194,643,720 bytes), and installed by Steve at 19:13
via a new INSTALL.cmd double-click wrapper (added because the pasted one-liner
was failing silently again). The running profile's
`dsh-client-ui-layout/lib/client.js` carries `rightbarBySession` (6 occurrences)
and the old single `rightbar` value is gone. Install-log: seed integrity
271/271 PASS, profile cleared, relaunched, dsh-config-vault 18 files all same.
What is left is Steve's visual pass: resize the right sidebar in one session,
switch to a second, and confirm the widths are independent.
## 2026-09-09 - Alt+S / Alt+P: DONE, installed and confirmed working in the app

0.1.5-alpha.2 installed at 14:29, profile re-extracted at 14:34. The keyup
binding was read back out of the RUNNING profile, `dsh_local_features_check.py`
reported 10 of 10 present (exit 0), `dsh_config_vault.py verify` reported 18
files all same (exit 0) with a post-install snapshot of 0 changed, and Steve
pressed Alt+S in the installed app and reported it worked. The section below is
the record of how it was found and fixed.

## 2026-09-09 - The Alt+S / Alt+P shortcuts: root cause found, fixed, packaged, install pending

The shortcuts never worked in the desktop app, and the update did not break
them. The code was in the installed 0.1.5-alpha.1 build the whole time.

**Root cause: Electron on Windows never delivers the KEYDOWN of an Alt+letter
chord to the renderer.** Only `Alt` arrives as a keydown; the letter arrives
solely as a `keyup` carrying `altKey`. Measured with a stripped-down Electron
window built from the packaged runtime and real `SendInput` scan-code
keystrokes. `before-input-event` in the main process sees the same keyUp-only
pair, a hidden `Alt+S` menu accelerator never fires, and removing the
application menu changes nothing. A browser delivers both events, which is why
93 unit tests and a real headless Chromium run both passed against the broken
binding.

**Fix** (commit `aca41e5f7b` on `update/v0.1.5-alpha.2`): bind to `keyup`, toast
instead of refusing in silence when the composer is locked or mid-admission, and
send the canonical lowercase `deploy to production`. Rebuilt and repackaged as
`deepseek-harness-0.1.5-alpha.2-win-x64.exe` (194,655,398 bytes); the fix is
confirmed inside the packaged seed archive. **Install is operator gated and has
not happened yet**, so the running app is still 0.1.5-alpha.1.

**Two survival guards now exist**, and they cover different halves:

- `C:\Claude\bin\dsh_config_vault.py` with the vault at
  `C:\Projects\repos\dsh-config` (local git, no remote) protects the operator's
  `~/.dsh` configuration: `settings.yaml`, the `.agent-presets` preset that
  mounts the desktop MCP servers, `cordis.patch.yml`, `AGENTS.md` and the 13
  slash-command skill wrappers. 18 files. `.credentials.yaml` is denied by the
  manifest and proven never to have entered the history. A hidden daily task
  snapshots at 09:00.
- `C:\Claude\bin\dsh_local_features_check.py` covers what a settings backup
  cannot: it reads the EXTRACTED profile and reports any of the 10 local fork
  features an update dropped. A dropped feature leaves a perfectly healthy app.

`finish-install.ps1` now snapshots before it installs, verifies after, and
prints the feature-check command.




## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=f3c0c51c-4349-4551-bc87-d545bb0f0dc7 at=2026-09-17T06:04:46.632616+00:00
-->
## Last save-state (2026-09-17T06:04:46.632616+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `f3c0c51c-4349-4551-bc87-d545bb0f0dc7`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-5a755741-1457-452c-b5dd-c3c61af1b18a

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=f37650c8-6b34-48cf-9494-775af97db5b1 at=2026-09-09T16:43:42.809531+00:00
-->
## Last save-state (2026-09-09T16:43:42.809531+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `f37650c8-6b34-48cf-9494-775af97db5b1`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-c7aa133d-166b-4416-9f6e-6d4f76ca3e93

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=8f0a49c1-6187-4582-9bd1-d8700eea3158 at=2026-09-09T17:49:01.394307+00:00
-->
## Last save-state (2026-09-09T17:49:01.394307+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `8f0a49c1-6187-4582-9bd1-d8700eea3158`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-1c7a1a4a-b736-4790-9770-d82530ff0656

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=632cd4ea-2b2c-4ff4-a4a1-757d88fb75dc at=2026-09-11T15:40:40.315533+00:00
-->
## Last save-state (2026-09-11T15:40:40.315533+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `632cd4ea-2b2c-4ff4-a4a1-757d88fb75dc`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-f9bd88ea-2024-41da-beec-95d06c47ccaf

<!-- claude-memory-actor:end -->

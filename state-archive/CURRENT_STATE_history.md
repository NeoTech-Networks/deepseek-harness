# CURRENT_STATE - archived history

Auto-archived by state_file_cap.py when CURRENT_STATE.md exceeded 32 KB. Newest-first. On-demand only; not read at session start.

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

## Last save-state (2026-09-09T23:35:44.128791+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `a463cfd2-49e3-4da7-b34c-e0db2cd09616`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-58e0688c-a243-41d8-9833-8412029663cc

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

## 2026-09-08 - Live Claude Max usage readout in the composer footer

- New package `packages/llm/account-usage` (`@deepseek-ai/dsh-account-usage`), both faces: a Host `TypertRemoteService` (`ctx.accountUsage.read()`) and a browser dock entry seated on `conversation.composer.dock` beside the stats line.
- Host half reads the stored `llm-pi-ai/anthropic` OAuth grant through `ctx.credentials`, calls `GET https://api.anthropic.com/api/oauth/usage` with `anthropic-beta: oauth-2025-04-20`, and answers a snapshot of whole percentages plus reset instants. It never refreshes the token (that would race pi-ai); an expired grant answers `stale`. No token member exists on the wire type.
- Degraded answers keep the last figures: `stale`, `unauthorized` (401/403), `error` (any other fault), `unsupported` (no grant at all, which renders nothing, so a DeepSeek-only install is untouched).
- Browser half polls every 60s idle / 20s while a turn runs, plus one confirming read 1.5s after a turn settles and one on tab focus. Reads "5h N% - Week N%" with a click-open panel carrying reset times, any scoped weekly window, the month's extra-usage spend, and the degraded note.
- Wired into `packages/bundle/web-app` (dependency + `cordis.patch.yml` entry), new subsystem page `docs/subsystems/account-usage.md` (+ zh + pairing), catalogs regenerated.
- Verified: 27/27 package tests (15 host, 12 client), repo typecheck exit 0, `pnpm build` exit 0, and a live read-back where the service answered 5h 20% / week 20% / 11094 minor units of extra usage in the same second a raw call to the endpoint returned utilization 20 / 20 / used_credits 11094.
- Also repaired to get the tree green: an untracked prior-session package (`ui-sessions-panel`) had a test named without the `.client` suffix (host aggregate then compiled client sources), two strict-null test faults, and an apps/web e2e missing from the host include list; `vision-routing` config fields had no JSDoc.
- Committed `d14e69cfa9` on `feat/open-session-in-subfolder` (47 files). No deploy (local desktop app, not a Railway repo).
- Windows installer rebuilt (181.9 MB, unsigned, packaged with `DSH_DESKTOP_APP_ID=com.deepseek.harness` and `DOWNLOAD_TEST_ORIGIN=https://download.neotech.biz`), installed at 19:10, app relaunched 19:59 with the package present in `~/.dsh/profiles/desktop` and the dock entry in the running web-app patch. Only the on-screen look is still unproven.

## 2026-09-08 - Stopped console windows flashing on subprocess spawn

- Root cause: `@deepseek-ai/dsh-win32-process` `spawnCurrentTokenJobProcess` called `CreateProcessW` with `CREATE_SUSPENDED | CREATE_UNICODE_ENVIRONMENT` and no `CREATE_NO_WINDOW`, so every console-subsystem tool subprocess (pwsh, cmd, node) got a fresh visible console window. Third distinct cause of this symptom on this machine; the earlier two (Playwright MCP `--extension` crash loop, dashboard sweep dispatcher) were confirmed still fixed.
- Fix: added `CREATE_NO_WINDOW` (0x08000000) to the flags in `packages/subprocess/win32-process/src/abi.ts` + `process.ts`. Recompiled `lib/types` via tsc and patched the bundle and the running profile copy (`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-win32-process/lib/index.js`) to the folded value 0x08000404.
- Committed `83f763c555` on `feat/open-session-in-subfolder` (2 files). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Composed session-status triggers into the presets (icons now reachable)

- Root cause of the session status icons never firing: `web-app/cordis.patch.yml` disables `command-session-status` (/status) and `tool-session-status` (set_session_status) at the host plane, but unlike their goal siblings they were never re-added to a preset, so neither the operator nor the model could declare a status.
- Added `command-session-status` + `tool-session-status` to the standard, cordis, and ptc presets (mirroring command-goal / tool-goal) in packages/preset/agent-presets/presets/{standard,cordis,ptc}/agent.cordis.yml.
- Added two checks: locked the full 5-status vocabulary (id/label/icon/tone) in packages/session-status/session-status/tests/session-status.spec.ts, and a shipped-preset completeness test (the two rows composed and not disabled) in packages/preset/agent-presets/tests/shipped-root.spec.ts.
- Verified 93/93 targeted tests across 4 suites (session-status 11, shipped-root 6, tree 40, rows 36).
- No deploy (local desktop app). Config-only (YAML), takes effect on app relaunch via launch-desktop.vbs. Live smoke still user-gated.

## 2026-09-08 - Dropped the [image omitted] placeholder next to vision descriptions

- Prompt admission in `packages/api/session-controller/src/commands.ts` now REPLACES the raw image blocks with the vision model's description text for a text-only model, instead of appending the description beside the "[image omitted ...]" placeholder. Commit `c1a9951d60` pushed to the fork on `feat/open-session-in-subfolder`.
- Added an assertion to `session-models.host.spec.ts` that no `image` block survives admission; 15/15 tests pass, host typecheck exit 0.
- Rebuilt `dsh-api-session-controller` and copied its `lib` into the installed profile so the change is live on the next app relaunch.
- End-to-end verified live (operator reloaded the app): attaching an image to a DeepSeek Pro session now yields ONLY `[Attached image description (vision model): ...]` with no `[image omitted ...]` placeholder. The vision model reads the screenshot accurately.
- No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Fixed $home collision in finish-install.ps1 and installed vision-routing

- Fixed the reinstall script `finish-install.ps1` aborting at line 33: `$home = ...` collided with PowerShell's read-only automatic `$HOME` (variable names are case-insensitive). Renamed the local to `$dshHome` (4 occurrences). Script re-parses clean; no reserved-name assignment remains.
- Re-ran `finish-install.ps1` elevated (UAC) to pick up the vision-routing package in the installed desktop app. Log at `C:\Projects\logs\2026-09-08-finish-install\finish-install-run.log` shows installing..., installer exit code 0, profile cleared, relaunched, done.
- Verified the app relaunched with vision-routing live: 4 "DeepSeek Harness" processes (main window visible and Responding, title "Use DeepSeek Pro for images"); package present in both `~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-vision-routing` and `resources/seed/desktop-packages/deepseek-ai-dsh-vision-routing-0.1.3-alpha.2.tgz`.
- `finish-install.ps1` is untracked in the checkout (local helper). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Animated plan-mode icon and finished icon after save-state

- Animated the plan-mode sidebar icon while the session runs: `SessionStatusDots` (packages/client/ui-workspace/src/client/rows/Rows.tsx) now takes a `running` flag and sets `data-active="true"` on the planning glyph only when `phase === 'planning' && running`; `Rows.module.css` adds a 1.6s opacity pulse keyframe, disabled under `prefers-reduced-motion`. New test in rows.client.spec.tsx.

- Added a "Finished" icon after /save-state: the session-status domain already renders the `finished` status (green check) via `declaredStatusOf` plus the `session/status` event; the missing trigger was that /save-state never declared it. Appended a "Declare the session finished" delta to `C:\Claude\skills\dsh_command_bridge.json` (deltas.save-state) and regenerated `~/.dsh/skills/save-state.md` so save-state calls `set_session_status(status: "finished")`, fallback `/status finished`.

- Verified: ui-workspace suite 173/173 (10 files); client typecheck exit 0; full `pnpm build` exit 0; the scoped pulse rule and keyframe are present in the built `ui-workspace/lib/client.js`.

- Found a gap in the finished-icon trigger: `set_session_status` (tool-session-status) is not in the agent tool catalog this session (not composed in the standard preset agent plane), so the save-state "declare finished" step cannot run from the agent; the operator fallback is a manual `/status finished`.

- No deploy (local desktop app, not a Railway repo). Changes are uncommitted in the checkout.

## 2026-09-08 - Workspace group headers: darker blue + alphabetical sort

- Recolored the workspace group section headers from gray (`--dsw-alias-label-tertiary`) to the DeepSeek brand darker blue (`--dsw-static-deepseek-600`, with `--dsw-static-deepseek-400` for dark theme) in `packages/client/ui-workspace/src/client/rows/WorkspaceBrowser.module.css`.

- Made named group sections sort alphabetically in `packages/client/ui-workspace/src/client/tree.ts` (`sectionize` sorts the group labels with `localeCompare`), so a newly added group slots into A-to-Z order automatically.

- Added a test in `packages/client/ui-workspace/tests/tree.client.spec.ts`; the ui-workspace tree suite passes 40/40.

- Committed `f562c0a27f` (feat: sort) and `1116f9b306` (style: color) on `feat/open-session-in-subfolder`; pushed both to the `neotech` fork (NeoTech-Networks/deepseek-harness).

## 2026-09-08 - Composer shortcuts and right sidebar hidden by default

- Added Alt+S (fills the composer with /save-state and submits) and Alt+P (fills with the deploy phrase and submits) as a renderer-level window keydown listener in `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx`, plus 4 tests in input-bar.client.spec.tsx.

- Made the right sidebar hidden by default for new sessions: flipped the `pinned-files` settings schema `autoOpen` default from true to false in `packages/api/pinned-files/src/index.ts` (the pinned-directory explorer was auto-opening and expanding the column on every new session).

- Diagnosed why the changes were not live in the installed app: it serves client/host bundles from the extracted profile `~/.dsh/profiles/desktop/node_modules/...`, which predated the change. Patched the stale bundles in place and set `autoOpen: false` explicitly in `~/.dsh/settings.yaml`.

- Committed the 5 files as `88a2289cc3` and pushed to the `neotech` fork (NeoTech-Networks/deepseek-harness), branch `feat/open-session-in-subfolder`.

- Verified: host + client typecheck exit 0; 79/79 input-bar tests; full `pnpm build` exit 0 (236 client artifacts). Live desktop smoke test of both changes is still user-gated (user last reported the sidebar still auto-opening).

## 2026-09-08 - Vision-routing auto image description, plus four pre-existing gate fixes

- New `@deepseek-ai/dsh-vision-routing` package (`packages/vision/vision-routing/`): a text-only model session (DeepSeek Pro or Flash) with an attached image now admits the image and appends the vision model's description as a text block instead of rejecting with "Model does not support image input". Gated by the existing `subagent-model-selection` setting; a failed describe call appends a "description unavailable" note. Admission changed in `packages/api/session-controller/src/commands.ts`; plugin wired into the `web-app` bundle.

- Fixed the four pre-existing gate failures so doc-sync/CI is green: verify-cordis-config (git symlink pointers resolve under `core.symlinks=false` via `scripts/cordis-config-files.ts`), verify-package-invariants (session-status README companion sentences), verify-export-jsdoc (`baseNameOf` in ui-sidebar-explorer), and gen-cordis-catalog (pinned-files types in LINK_MAP, vision SERVICE_PAGE, sidebar-right cordis-surface markers). Translation-pairing fallout re-recorded for the vision group, session-status, and pinned-files.

- Live desktop smoke test of the auto-vision path is still pending (user-gated GUI).

## 2026-09-08 - Windows installer built, installed, session creation fixed

- Built an unsigned Windows installer (182 MB) via an opt-in `DSH_DESKTOP_ALLOW_UNSIGNED=1` flag (commit fdb44376aa), plus two build fixes: build under PowerShell (GNU tar in Git Bash chokes on `C:` paths) and skip the POSIX-only `fs-ext` native compile on win32 (`project-manager.ts` platform-conditional + `lease.ts` lazy-load).

- Installed to `%LOCALAPPDATA%\Programs\DeepSeek Harness\` (Start Menu entry + desktop shortcut). First launch extracted the seed into `~/.dsh`; profile `desktop` at version 0.1.3-alpha.2; app renders the product UI and reads the real `~/.dsh`.

- Fixed the "New Session does nothing" bug: the default `standard-hooks` user preset (`~/.dsh/.agent-presets/standard-hooks/agent.cordis.yml`) hardcoded a `cordis:include` path to the SOURCE repo, so every plugin import failed "Cannot find package". Repointed it at the installed profile's `standard` preset; New Session works (user confirmed).

- Commits: 1340b92f40 (feature work) + fdb44376aa (unsigned + fs-ext) on `feat/open-session-in-subfolder`, 2 ahead of `neotech`, push held.

## 2026-09-08 - Dependency gate fix and full renderer rebuild

- Fixed the two `verify-package-dependencies` violations left by the uncommitted session-status work: added `@deepseek-ai/dsh-session-status` (workspace:^) to `packages/client/connection/package.json` devDependencies and `@deepseek-ai/dsh-goal` (workspace:^) to `packages/client/ui-workspace/package.json` devDependencies, and refreshed `pnpm-lock.yaml`. The gate now exits 0 (61 packages match policy).

- Ran the full `pnpm build` (exit 0), regenerating the stale web renderer `apps/web/dist` and `.dsh-build/client-build-environment.json` (sha256 a93c618c..., commit 9a30a55, dirty=true). This fixes the desktop launch crash ("missed the module table"): `dockkit` is now in the seed table.

- Smoke-tested the desktop app via `start:desktop`: the renderer reached the startup prompt with no "missed the module table" error, so the launch crash is fixed. But session creation now fails with a SEPARATE error: the default preset "standard-hooks" fails to mount ("Cannot find package") for roughly twenty built-in host plugins (persona, agent-instructions, tool-fs, tool-goal, plan-mode, compaction, subagent tools, workflow-worker-thread, and others) listed in the standard preset's agent.cordis.yml but not declared as dependencies of @deepseek-ai/dsh-agent-presets.

- Uncommitted (no push; origin is upstream deepseek-ai with no write access). Nothing deployed.

## 2026-09-08 - Quit confirmation on the desktop shell

- Added a native close confirmation to the Electron main window in `apps/desktop/src/main.ts`: the window `close` event is intercepted, a "Quit DeepSeek Harness?" dialog is shown (Quit / Cancel, Cancel default), and the app only quits on confirm. Menu Quit and the updater restart path are not double-prompted; the Desktop Plugins window is unaffected.

- Added en + zh message strings in `apps/desktop/src/locale.ts`.

- Rebuilt the desktop shell (`pnpm --filter @deepseek-ai/dsh-desktop run build`, exit 0) and verified the compiled `apps/desktop/lib/main.js` contains the handler and strings.

- Not smoke-tested live: the change activates on next launch (a relaunch would end the running session).

## 2026-09-08 - Open a session directly in a sub-directory from the Files tab

- Added two gestures to the right-sidebar Files tree: right-click a folder for "New session here" (adopts the folder as its own workspace and opens or reuses its session, filed under the parent's group label), and "New session in each sub-folder..." (registers every immediate sub-directory under one group, opening a session only in the first).

- New `UiWorkspaceService.openDirectory(path, group)` capability reuses create-by-path + setGroup + connectWorkspace, so a repeated gesture reuses the blank session instead of stacking.

- ui-sidebar-files wired to `ctx.workspaces` / `ctx.sessions` / `ctx.uiWorkspace`; en + zh copy; package.json + tsconfig updated.

- Committed `9a30a554e8` on branch `feat/open-session-in-subfolder`; pushed that branch and local `master` (`67ceb5406a`) to a new org fork `NeoTech-Networks/deepseek-harness` (`neotech` remote).

## 2026-09-08 - Plan mode defaults on for every new session (model-agnostic)

- Added `defaultActive?: boolean` to `@deepseek-ai/dsh-plan-mode` (`packages/plan/plan-mode/src/index.ts`): `resolveConfig` validates and defaults it, and a new `pinInitialPlanMode` appends `plan/mode { active: true }` at session creation (a `session/created` listener plus a one-time sweep of existing sessions), skipping subagents (`header.origin === 'subagent'`) and any session that already carries a `plan/mode` event, so forks and resumes keep their state.
- Set `defaultActive: true` on all four plan-mode mounts: the standard/ptc/cordis agent presets and the base bundle (CLI/headless). The web-app bundle only disables the base mount, so it needed no change.
- Plan mode is model-agnostic: the `plan:policy` section is injected into every model request's system prompt regardless of provider/model, so the default covers Claude, Kimi, DeepSeek and GLM.
- Verified: 93/93 plan-mode tests (4 files); `tsc -b packages/plan/plan-mode/tsconfig.json` clean; `pnpm build:lib:host` exit 0.
- Made it live without a full repackage: synced the rebuilt `@deepseek-ai/dsh-plan-mode/lib/` and the three preset YAMLs into `~/.dsh/profiles/desktop/node_modules/`; user restarted and confirmed "Appears to work".
- Docs updated: README.md/.zh.md + README.i18n.yaml, docs/config-catalog.md/.zh.md. Committed on `feat/open-session-in-subfolder` (bundled into the bulk `feat(vision)` commit, whose message does not name plan mode) and pushed to the `NeoTech-Networks` fork.

## 2026-09-08 - Repointed origin to the NeoTech fork, state auto-commit fixed

`origin` was the upstream deepseek-ai repo, so every state push failed 403.
Repointed to NeoTech-Networks/deepseek-harness (upstream kept as `upstream`),
set `gh repo set-default`, and tracked the untracked state files. State now
lands on the fork (PRs #2 and #3 merged).

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=321e7af0-b0ab-4a0b-9a4c-de8eea784e39 at=2026-09-09T03:50:14.915068+00:00
-->
## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

## 2026-09-07 - Session status icons in the sidebar

- Added a durable, model-independent declared session status. New `packages/session-status/` group: domain (`session/status` event, `sessionStatus` projection, validated vocabulary, `ctx.sessionStatus`), `tool-session-status` (`set_session_status`), `command-session-status` (`/status`).

- Session Controller: `setStatus` + `listStatuses` remotes with client bindings and fixtures.

- Sidebar (`ui-workspace`): `declared` row phase (precedence awaiting-* > declared > planning > running > subagents > done > idle), goal-phase fallback (blocked→stuck, complete→finished, paused→paused), distinct subagent glyph, status glyph + tone, row-menu "Set status…" / "Clear status".

- Bundle composition: base + web-app patches, packages in base/package.json; confirmed via `dsh --profile headless --dump-default-config`.

- Docs: package/group READMEs, `docs/subsystems/session-status.md`, agent note triple, generator manifests.

- Verified: typecheck clean; lint clean on new packages; 209 targeted tests; 100% coverage on session-status; doc-sync 32/33 (one failure is a pre-existing Windows symlink EPERM).

- Open: uncommitted on the repo (no upstream push access to deepseek-ai); live desktop smoke test pending (user-gated).

## 2026-09-07 - Workspace grouping implemented and committed

- Implemented workspace grouping end-to-end: `group` field on the workspace domain record, `setGroup` in the API controller + typert wire codec, two-level group/workspace/sessions tree in the sidebar, and a "Set group…" dialog on the workspace row menu.

- Verified: host + client tsc typecheck clean; typert host + client bundles built; 257 tests pass (2 failures are pre-existing symlink EPERM under the Windows sandbox, not this change).

- Committed: `67ceb5406a` on local `master`, rebased cleanly onto `c389f96bf3`.

- Open: `git push` denied (neotechnet has no access to the deepseek-ai org; no fork exists). Either fork to a chosen account and push, or keep the change local. Visual smoke test of the grouped sidebar still pending.

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=a463cfd2-49e3-4da7-b34c-e0db2cd09616 at=2026-09-09T23:35:44.128791+00:00
-->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=deddfeae-e84e-445b-84c5-f1a7c670cea5 at=2026-09-10T16:40:13.537019+00:00
-->
## Last save-state (2026-09-11T14:32:31.035934+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `4e5d3c40-3d3e-4fb0-ab06-3fa1f582fc3e`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-3ee23e44-26b5-406d-afb8-6877a8a9dbb9

<!-- claude-memory-actor:end -->

## 2026-09-09 - Sessions panel shipped (right-sidebar session overview)

Built the ui-sessions-panel feature package: a right-sidebar Sessions tab that lists every open session regardless of workspace, Active-only by default (running, subagent, awaiting-input and planning first) with an All toggle for idle history. About 20 files under packages/client/ui-sessions-panel, 39 tests at 100% coverage, and an independent phase classifier re-implemented so the plugin never imports another feature plugin at runtime. Wired into the web-app bundle, the cordis patch, the tsconfig client references and the web-app package deps; added the sessions-panel tsconfig path alias, closing the sessions-panel half of OPEN_ISSUES item 9. Also fixed apps/desktop/scripts/prepare-runtime.ts to extract the node runtime with system tar (extract-zip produced an empty extraction on this host) and bumped finish-install.ps1 to 0.1.5-alpha.1. The feature shipped and installed in the 0.1.5-alpha.1 update; Steve confirmed everything runs successfully.
## 2026-09-09 - DSH daily review: state-file loss fixed at source, corruption attributed, model gaps closed

Audited all 52 DSH sessions from 2026-09-08 by decompressing the multi-frame zstd
session logs: 6,202 tool calls, 160 failures (2.58%), Opus 2.48% vs DeepSeek 2.75%.
New reusable tool `C:\Claude\bin\dsh_session_audit.mjs` reproduces the whole audit in
one command and is the regression check for everything below.

- **Three of my own first-pass conclusions were wrong and were corrected before any fix
  shipped.** Win32 1175 is "unable to remove the file to be replaced" (target held open),
  not a replacement-move fault. The tool-argument corruption is NOT a harness bug. Kimi
  and GLM authenticate fine.
- **State-file loss, root cause found and fixed at source.** `memory_save_state_actor.py`
  wrote state files with a plain `Path.write_text` (truncate-in-place) at four sites, and
  on a transient read failure overwrote the whole file with just the marker block. Now
  atomic (temp + fsync + os.replace, bounded retry) and the read-failure branch skips
  instead of destroying. Verified with a four-arm concurrency test: the old method showed
  a reader an incomplete file on 1,621 of 3,854 reads (42%); the new one 0 of 4,329, with
  the file always complete afterwards.
- **Harness hardened against any other non-atomic writer** (commit `92e043bf4d`):
  publication now retries and falls back to rename (9 lost writes on 2026-09-08), and
  read/edit confirm with a second read before declaring a file binary (4 false verdicts on
  a file containing no NUL byte). 6 new tests; fs-local failures unchanged at the 13
  pre-existing POSIX-on-Windows ones.
- **Argument corruption ATTRIBUTED, and it is provider-side.** `assistant/message` already
  records the raw provider stream. In all three damaged calls the damage is in the model's
  own FIRST JSON delta (`{"plan": "and#`), before any harness code. The accumulator is
  exonerated and was deliberately left alone. Three other plan rejections were the harness
  validator being too strict, now fixed.
- **`exit_plan_mode` accepts plans it used to reject** (blockquote or blank lines before the
  H1, which the local plan format itself mandates). It rejected this session's own plan
  twice. 94/94 plan-mode tests.
- **State files reconciled across three repos** with `C:\Claude\bin\state_file_reconcile.py`;
  the real worker now reports 0 needing attention for all three. 431 rows and 26 sections of
  lost history recovered into C:/Claude alone.
- **Every allowed subagent model probed live.** Eight answer; `glm-5.3-highspeed` is refused
  by Z.ai for lack of entitlement and was removed from `allowedModels`.
- `~/.dsh/AGENTS.md` now gives the memory tools their full `mcp__claude-memory-bridge__`
  names (DeepSeek called the short name and failed three times).
- Built and synced `dsh-fs-local` and `dsh-plan-mode` into `~/.dsh/profiles/desktop`. **That
  sync did NOT hold, see the post-relaunch check below.**
- **POST-RELAUNCH CHECK (Steve restarted the app): the two harness fixes are NOT live.** The
  desktop app runs published `0.1.5-alpha.1`; this checkout is `0.1.3-alpha.2`.
  `pnpm run start:desktop` re-provisions `~/.dsh/profiles/desktop` from 0.1.5 on every
  launch, which overwrote the libs synced into it earlier in the session. Read directly from
  the running build afterwards: `fs-local` still has `if (!isENOENT(error)) throw error;` at
  lines 165 and 184 plus 3 unguarded "binary file" sites, and `plan-mode` line 270 still has
  the old `/^#\s+\S/` test. The sync-into-the-profile technique therefore does not survive a
  restart, and any earlier session that claimed a fix was live on that basis needs
  re-checking the same way. New OPEN_ISSUES item 0; next session ports both onto the 0.1.5
  line at `C:/Projects/worktrees/dsh-update-v015` and ships a real installer.
- **The bridge speed-up IS live, and was measured on PRODUCTION traffic** after the change
  rather than on a bench: PreToolUse 1,832ms to 1,176ms (36% faster, n=114), PostToolUse
  1,520 to 1,042, UserPromptSubmit 3,048 to 2,247, Stop 5,007 to 3,252. The bridge is plain
  Python re-read on every invocation, so it needed no relaunch.
- **Hook tax cut, and its SHAPE fixed.** Four causes in the bridge, all measured, none of
  them the hook scripts: pool width below the fan-out; `shell=True` spawning `cmd.exe` per
  hook (553ms to 214ms over 22 cold starts); the transcript projection re-decompressing the
  whole session log every call; and `session_route` doing that same full decompress a second
  time to read two strings (0.671s of a 1.002s run). Cost used to GROW with session length;
  it is now 461ms on a 100KB log and 483ms on a 2.78MB log, effectively flat, down from a
  median 1,113ms. Commits `56969c4b` and `09fce83d` in `C:\Claude`.
- Final verification sweep, all green: the atomic-writer concurrency test (4 arms, the
  control arm still proving it can fail), the incremental-decode test (byte-identical to a
  full rebuild), fs-local 142 passed with the 13 pre-existing POSIX-on-Windows failures
  unchanged, plan-mode 94/94, bridge 69 passed with its one pre-existing policy-listing
  failure, 9 allowed models with `glm-5.3-highspeed` gone, the full MCP memory tool names
  present, and the save-state worker reporting "0 needing attention" for all three repos.

## 2026-09-09 - Desktop hung on the boot screen: accountUsage was never mounted on the Client

- ROOT CAUSE. `packages/api/remotes/src/client/index.ts` is a HAND-WRITTEN selection list, not a generated catalog. A `remote.<ns>` service exists only because that file `$mount`s the package's generated contribution (`packages/api/gateway/src/client/index.ts:660` builds the key `remote.<ns>`, `:348` constructs the service inside `createNamespace`). The account-usage commit d14e69cfa9 added the Host service and the browser consumer but never added the mount, so `remote.accountUsage` could not come into existence, the client entry parked on its `inject` forever, and `packages/client/web/src/boot.ts:150` reported `web boot: 1 entry did not activate` and never called `mountApp()`. The window sat on the loading screen.
- The two generated catalogs (`tool-cordis/src/api-catalog.ts:85`, `cordis-client-runner/src/client/slot-catalog.ts:504`) both knew about accountUsage and both shipped it. Neither can mount anything. There is no generated mount registry.
- FIX, 5 lines across 2 files: value import of `@deepseek-ai/dsh-account-usage/remote`, the declaration-merge re-export, the entry in the `$mount` array, and the devDependency. Committed in isolation as b99e942c0b on `fix/account-usage-remote-mount-only`, parented directly on d14e69cfa9.
- The desktop app keeps NO log file. The only channel that named the fault was the renderer console, reached by launching the exe with stderr redirected and `ELECTRON_ENABLE_LOGGING=1`. `DSH_DESKTOP_DIAGNOSTIC_FILE` wrote nothing because the Electron main process never threw; the failure was entirely in the browser half.
- Interim unblock that worked and was then removed: a `- id: account-usage` / `disabled: true` row in `~/.dsh/profiles/desktop/cordis.patch.yml`. The reinstall clears the profile, so it is gone; it was only ever an unblock.
- Rebuilt (`pnpm run build` then `pnpm run package:desktop:win:x64`), reinstalled through `finish-install.ps1`, profile re-extracted with 246 packages. Installer 190,744,191 bytes at 21:03.
- Packaging needed two env vars that live nowhere in the repo, `DSH_DESKTOP_APP_ID` and `DOWNLOAD_TEST_ORIGIN`, recovered from an older session transcript. It also failed twice on a transient EPERM renaming `win-unpacked.tmp`, which is an antivirus lock and not a code fault.
- CONCURRENCY HAZARD, confirmed live. Sessions restored inside the desktop app resumed autonomous builds in the SAME primary checkout, stomping the packed tarball directory mid-run (count observed climbing 100 to 126 with no build of this session's running) and breaking two packaging attempts. One of those sessions also committed this session's staged files into an unrelated wip commit on this session's branch. The app had to be closed to finish. This is the One Worktree Per Session rule failing in practice.
- Git left tidy: `fix/account-usage-remote-mount-only` = the isolated fix; `fix/account-usage-remote-mount` = the wip rebased on top of it (78d5d95934, tree identical to the pre-rebase commit so no file moved); `backup/wip-pre-rebase-87607362` = the pre-rebase copy. Nothing merged to master, nothing pushed.

## Last save-state (2026-09-09T03:50:14.915068+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `321e7af0-b0ab-4a0b-9a4c-de8eea784e39`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-6d11ab26-811b-4500-899f-621252ea2c9a

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

## Last save-state (2026-09-09T23:35:44.128791+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `a463cfd2-49e3-4da7-b34c-e0db2cd09616`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-58e0688c-a243-41d8-9833-8412029663cc

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

## 2026-09-08 - Live Claude Max usage readout in the composer footer

- New package `packages/llm/account-usage` (`@deepseek-ai/dsh-account-usage`), both faces: a Host `TypertRemoteService` (`ctx.accountUsage.read()`) and a browser dock entry seated on `conversation.composer.dock` beside the stats line.
- Host half reads the stored `llm-pi-ai/anthropic` OAuth grant through `ctx.credentials`, calls `GET https://api.anthropic.com/api/oauth/usage` with `anthropic-beta: oauth-2025-04-20`, and answers a snapshot of whole percentages plus reset instants. It never refreshes the token (that would race pi-ai); an expired grant answers `stale`. No token member exists on the wire type.
- Degraded answers keep the last figures: `stale`, `unauthorized` (401/403), `error` (any other fault), `unsupported` (no grant at all, which renders nothing, so a DeepSeek-only install is untouched).
- Browser half polls every 60s idle / 20s while a turn runs, plus one confirming read 1.5s after a turn settles and one on tab focus. Reads "5h N% - Week N%" with a click-open panel carrying reset times, any scoped weekly window, the month's extra-usage spend, and the degraded note.
- Wired into `packages/bundle/web-app` (dependency + `cordis.patch.yml` entry), new subsystem page `docs/subsystems/account-usage.md` (+ zh + pairing), catalogs regenerated.
- Verified: 27/27 package tests (15 host, 12 client), repo typecheck exit 0, `pnpm build` exit 0, and a live read-back where the service answered 5h 20% / week 20% / 11094 minor units of extra usage in the same second a raw call to the endpoint returned utilization 20 / 20 / used_credits 11094.
- Also repaired to get the tree green: an untracked prior-session package (`ui-sessions-panel`) had a test named without the `.client` suffix (host aggregate then compiled client sources), two strict-null test faults, and an apps/web e2e missing from the host include list; `vision-routing` config fields had no JSDoc.
- Committed `d14e69cfa9` on `feat/open-session-in-subfolder` (47 files). No deploy (local desktop app, not a Railway repo).
- Windows installer rebuilt (181.9 MB, unsigned, packaged with `DSH_DESKTOP_APP_ID=com.deepseek.harness` and `DOWNLOAD_TEST_ORIGIN=https://download.neotech.biz`), installed at 19:10, app relaunched 19:59 with the package present in `~/.dsh/profiles/desktop` and the dock entry in the running web-app patch. Only the on-screen look is still unproven.

## 2026-09-08 - Stopped console windows flashing on subprocess spawn

- Root cause: `@deepseek-ai/dsh-win32-process` `spawnCurrentTokenJobProcess` called `CreateProcessW` with `CREATE_SUSPENDED | CREATE_UNICODE_ENVIRONMENT` and no `CREATE_NO_WINDOW`, so every console-subsystem tool subprocess (pwsh, cmd, node) got a fresh visible console window. Third distinct cause of this symptom on this machine; the earlier two (Playwright MCP `--extension` crash loop, dashboard sweep dispatcher) were confirmed still fixed.
- Fix: added `CREATE_NO_WINDOW` (0x08000000) to the flags in `packages/subprocess/win32-process/src/abi.ts` + `process.ts`. Recompiled `lib/types` via tsc and patched the bundle and the running profile copy (`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-win32-process/lib/index.js`) to the folded value 0x08000404.
- Committed `83f763c555` on `feat/open-session-in-subfolder` (2 files). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Composed session-status triggers into the presets (icons now reachable)

- Root cause of the session status icons never firing: `web-app/cordis.patch.yml` disables `command-session-status` (/status) and `tool-session-status` (set_session_status) at the host plane, but unlike their goal siblings they were never re-added to a preset, so neither the operator nor the model could declare a status.
- Added `command-session-status` + `tool-session-status` to the standard, cordis, and ptc presets (mirroring command-goal / tool-goal) in packages/preset/agent-presets/presets/{standard,cordis,ptc}/agent.cordis.yml.
- Added two checks: locked the full 5-status vocabulary (id/label/icon/tone) in packages/session-status/session-status/tests/session-status.spec.ts, and a shipped-preset completeness test (the two rows composed and not disabled) in packages/preset/agent-presets/tests/shipped-root.spec.ts.
- Verified 93/93 targeted tests across 4 suites (session-status 11, shipped-root 6, tree 40, rows 36).
- No deploy (local desktop app). Config-only (YAML), takes effect on app relaunch via launch-desktop.vbs. Live smoke still user-gated.

## 2026-09-08 - Dropped the [image omitted] placeholder next to vision descriptions

- Prompt admission in `packages/api/session-controller/src/commands.ts` now REPLACES the raw image blocks with the vision model's description text for a text-only model, instead of appending the description beside the "[image omitted ...]" placeholder. Commit `c1a9951d60` pushed to the fork on `feat/open-session-in-subfolder`.
- Added an assertion to `session-models.host.spec.ts` that no `image` block survives admission; 15/15 tests pass, host typecheck exit 0.
- Rebuilt `dsh-api-session-controller` and copied its `lib` into the installed profile so the change is live on the next app relaunch.
- End-to-end verified live (operator reloaded the app): attaching an image to a DeepSeek Pro session now yields ONLY `[Attached image description (vision model): ...]` with no `[image omitted ...]` placeholder. The vision model reads the screenshot accurately.
- No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Fixed $home collision in finish-install.ps1 and installed vision-routing

- Fixed the reinstall script `finish-install.ps1` aborting at line 33: `$home = ...` collided with PowerShell's read-only automatic `$HOME` (variable names are case-insensitive). Renamed the local to `$dshHome` (4 occurrences). Script re-parses clean; no reserved-name assignment remains.
- Re-ran `finish-install.ps1` elevated (UAC) to pick up the vision-routing package in the installed desktop app. Log at `C:\Projects\logs\2026-09-08-finish-install\finish-install-run.log` shows installing..., installer exit code 0, profile cleared, relaunched, done.
- Verified the app relaunched with vision-routing live: 4 "DeepSeek Harness" processes (main window visible and Responding, title "Use DeepSeek Pro for images"); package present in both `~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-vision-routing` and `resources/seed/desktop-packages/deepseek-ai-dsh-vision-routing-0.1.3-alpha.2.tgz`.
- `finish-install.ps1` is untracked in the checkout (local helper). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Animated plan-mode icon and finished icon after save-state

- Animated the plan-mode sidebar icon while the session runs: `SessionStatusDots` (packages/client/ui-workspace/src/client/rows/Rows.tsx) now takes a `running` flag and sets `data-active="true"` on the planning glyph only when `phase === 'planning' && running`; `Rows.module.css` adds a 1.6s opacity pulse keyframe, disabled under `prefers-reduced-motion`. New test in rows.client.spec.tsx.

- Added a "Finished" icon after /save-state: the session-status domain already renders the `finished` status (green check) via `declaredStatusOf` plus the `session/status` event; the missing trigger was that /save-state never declared it. Appended a "Declare the session finished" delta to `C:\Claude\skills\dsh_command_bridge.json` (deltas.save-state) and regenerated `~/.dsh/skills/save-state.md` so save-state calls `set_session_status(status: "finished")`, fallback `/status finished`.

- Verified: ui-workspace suite 173/173 (10 files); client typecheck exit 0; full `pnpm build` exit 0; the scoped pulse rule and keyframe are present in the built `ui-workspace/lib/client.js`.

- Found a gap in the finished-icon trigger: `set_session_status` (tool-session-status) is not in the agent tool catalog this session (not composed in the standard preset agent plane), so the save-state "declare finished" step cannot run from the agent; the operator fallback is a manual `/status finished`.

- No deploy (local desktop app, not a Railway repo). Changes are uncommitted in the checkout.

## 2026-09-08 - Workspace group headers: darker blue + alphabetical sort

- Recolored the workspace group section headers from gray (`--dsw-alias-label-tertiary`) to the DeepSeek brand darker blue (`--dsw-static-deepseek-600`, with `--dsw-static-deepseek-400` for dark theme) in `packages/client/ui-workspace/src/client/rows/WorkspaceBrowser.module.css`.

- Made named group sections sort alphabetically in `packages/client/ui-workspace/src/client/tree.ts` (`sectionize` sorts the group labels with `localeCompare`), so a newly added group slots into A-to-Z order automatically.

- Added a test in `packages/client/ui-workspace/tests/tree.client.spec.ts`; the ui-workspace tree suite passes 40/40.

- Committed `f562c0a27f` (feat: sort) and `1116f9b306` (style: color) on `feat/open-session-in-subfolder`; pushed both to the `neotech` fork (NeoTech-Networks/deepseek-harness).

## 2026-09-08 - Composer shortcuts and right sidebar hidden by default

- Added Alt+S (fills the composer with /save-state and submits) and Alt+P (fills with the deploy phrase and submits) as a renderer-level window keydown listener in `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx`, plus 4 tests in input-bar.client.spec.tsx.

- Made the right sidebar hidden by default for new sessions: flipped the `pinned-files` settings schema `autoOpen` default from true to false in `packages/api/pinned-files/src/index.ts` (the pinned-directory explorer was auto-opening and expanding the column on every new session).

- Diagnosed why the changes were not live in the installed app: it serves client/host bundles from the extracted profile `~/.dsh/profiles/desktop/node_modules/...`, which predated the change. Patched the stale bundles in place and set `autoOpen: false` explicitly in `~/.dsh/settings.yaml`.

- Committed the 5 files as `88a2289cc3` and pushed to the `neotech` fork (NeoTech-Networks/deepseek-harness), branch `feat/open-session-in-subfolder`.

- Verified: host + client typecheck exit 0; 79/79 input-bar tests; full `pnpm build` exit 0 (236 client artifacts). Live desktop smoke test of both changes is still user-gated (user last reported the sidebar still auto-opening).

## 2026-09-08 - Vision-routing auto image description, plus four pre-existing gate fixes

- New `@deepseek-ai/dsh-vision-routing` package (`packages/vision/vision-routing/`): a text-only model session (DeepSeek Pro or Flash) with an attached image now admits the image and appends the vision model's description as a text block instead of rejecting with "Model does not support image input". Gated by the existing `subagent-model-selection` setting; a failed describe call appends a "description unavailable" note. Admission changed in `packages/api/session-controller/src/commands.ts`; plugin wired into the `web-app` bundle.

- Fixed the four pre-existing gate failures so doc-sync/CI is green: verify-cordis-config (git symlink pointers resolve under `core.symlinks=false` via `scripts/cordis-config-files.ts`), verify-package-invariants (session-status README companion sentences), verify-export-jsdoc (`baseNameOf` in ui-sidebar-explorer), and gen-cordis-catalog (pinned-files types in LINK_MAP, vision SERVICE_PAGE, sidebar-right cordis-surface markers). Translation-pairing fallout re-recorded for the vision group, session-status, and pinned-files.

- Live desktop smoke test of the auto-vision path is still pending (user-gated GUI).

## 2026-09-08 - Windows installer built, installed, session creation fixed

- Built an unsigned Windows installer (182 MB) via an opt-in `DSH_DESKTOP_ALLOW_UNSIGNED=1` flag (commit fdb44376aa), plus two build fixes: build under PowerShell (GNU tar in Git Bash chokes on `C:` paths) and skip the POSIX-only `fs-ext` native compile on win32 (`project-manager.ts` platform-conditional + `lease.ts` lazy-load).

- Installed to `%LOCALAPPDATA%\Programs\DeepSeek Harness\` (Start Menu entry + desktop shortcut). First launch extracted the seed into `~/.dsh`; profile `desktop` at version 0.1.3-alpha.2; app renders the product UI and reads the real `~/.dsh`.

- Fixed the "New Session does nothing" bug: the default `standard-hooks` user preset (`~/.dsh/.agent-presets/standard-hooks/agent.cordis.yml`) hardcoded a `cordis:include` path to the SOURCE repo, so every plugin import failed "Cannot find package". Repointed it at the installed profile's `standard` preset; New Session works (user confirmed).

- Commits: 1340b92f40 (feature work) + fdb44376aa (unsigned + fs-ext) on `feat/open-session-in-subfolder`, 2 ahead of `neotech`, push held.

## 2026-09-08 - Dependency gate fix and full renderer rebuild

- Fixed the two `verify-package-dependencies` violations left by the uncommitted session-status work: added `@deepseek-ai/dsh-session-status` (workspace:^) to `packages/client/connection/package.json` devDependencies and `@deepseek-ai/dsh-goal` (workspace:^) to `packages/client/ui-workspace/package.json` devDependencies, and refreshed `pnpm-lock.yaml`. The gate now exits 0 (61 packages match policy).

- Ran the full `pnpm build` (exit 0), regenerating the stale web renderer `apps/web/dist` and `.dsh-build/client-build-environment.json` (sha256 a93c618c..., commit 9a30a55, dirty=true). This fixes the desktop launch crash ("missed the module table"): `dockkit` is now in the seed table.

- Smoke-tested the desktop app via `start:desktop`: the renderer reached the startup prompt with no "missed the module table" error, so the launch crash is fixed. But session creation now fails with a SEPARATE error: the default preset "standard-hooks" fails to mount ("Cannot find package") for roughly twenty built-in host plugins (persona, agent-instructions, tool-fs, tool-goal, plan-mode, compaction, subagent tools, workflow-worker-thread, and others) listed in the standard preset's agent.cordis.yml but not declared as dependencies of @deepseek-ai/dsh-agent-presets.

- Uncommitted (no push; origin is upstream deepseek-ai with no write access). Nothing deployed.

## 2026-09-08 - Quit confirmation on the desktop shell

- Added a native close confirmation to the Electron main window in `apps/desktop/src/main.ts`: the window `close` event is intercepted, a "Quit DeepSeek Harness?" dialog is shown (Quit / Cancel, Cancel default), and the app only quits on confirm. Menu Quit and the updater restart path are not double-prompted; the Desktop Plugins window is unaffected.

- Added en + zh message strings in `apps/desktop/src/locale.ts`.

- Rebuilt the desktop shell (`pnpm --filter @deepseek-ai/dsh-desktop run build`, exit 0) and verified the compiled `apps/desktop/lib/main.js` contains the handler and strings.

- Not smoke-tested live: the change activates on next launch (a relaunch would end the running session).

## 2026-09-08 - Open a session directly in a sub-directory from the Files tab

- Added two gestures to the right-sidebar Files tree: right-click a folder for "New session here" (adopts the folder as its own workspace and opens or reuses its session, filed under the parent's group label), and "New session in each sub-folder..." (registers every immediate sub-directory under one group, opening a session only in the first).

- New `UiWorkspaceService.openDirectory(path, group)` capability reuses create-by-path + setGroup + connectWorkspace, so a repeated gesture reuses the blank session instead of stacking.

- ui-sidebar-files wired to `ctx.workspaces` / `ctx.sessions` / `ctx.uiWorkspace`; en + zh copy; package.json + tsconfig updated.

- Committed `9a30a554e8` on branch `feat/open-session-in-subfolder`; pushed that branch and local `master` (`67ceb5406a`) to a new org fork `NeoTech-Networks/deepseek-harness` (`neotech` remote).

## 2026-09-08 - Plan mode defaults on for every new session (model-agnostic)

- Added `defaultActive?: boolean` to `@deepseek-ai/dsh-plan-mode` (`packages/plan/plan-mode/src/index.ts`): `resolveConfig` validates and defaults it, and a new `pinInitialPlanMode` appends `plan/mode { active: true }` at session creation (a `session/created` listener plus a one-time sweep of existing sessions), skipping subagents (`header.origin === 'subagent'`) and any session that already carries a `plan/mode` event, so forks and resumes keep their state.
- Set `defaultActive: true` on all four plan-mode mounts: the standard/ptc/cordis agent presets and the base bundle (CLI/headless). The web-app bundle only disables the base mount, so it needed no change.
- Plan mode is model-agnostic: the `plan:policy` section is injected into every model request's system prompt regardless of provider/model, so the default covers Claude, Kimi, DeepSeek and GLM.
- Verified: 93/93 plan-mode tests (4 files); `tsc -b packages/plan/plan-mode/tsconfig.json` clean; `pnpm build:lib:host` exit 0.
- Made it live without a full repackage: synced the rebuilt `@deepseek-ai/dsh-plan-mode/lib/` and the three preset YAMLs into `~/.dsh/profiles/desktop/node_modules/`; user restarted and confirmed "Appears to work".
- Docs updated: README.md/.zh.md + README.i18n.yaml, docs/config-catalog.md/.zh.md. Committed on `feat/open-session-in-subfolder` (bundled into the bulk `feat(vision)` commit, whose message does not name plan mode) and pushed to the `NeoTech-Networks` fork.

## 2026-09-08 - Repointed origin to the NeoTech fork, state auto-commit fixed

`origin` was the upstream deepseek-ai repo, so every state push failed 403.
Repointed to NeoTech-Networks/deepseek-harness (upstream kept as `upstream`),
set `gh repo set-default`, and tracked the untracked state files. State now
lands on the fork (PRs #2 and #3 merged).

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=321e7af0-b0ab-4a0b-9a4c-de8eea784e39 at=2026-09-09T03:50:14.915068+00:00
-->
## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

## 2026-09-07 - Session status icons in the sidebar

- Added a durable, model-independent declared session status. New `packages/session-status/` group: domain (`session/status` event, `sessionStatus` projection, validated vocabulary, `ctx.sessionStatus`), `tool-session-status` (`set_session_status`), `command-session-status` (`/status`).

- Session Controller: `setStatus` + `listStatuses` remotes with client bindings and fixtures.

- Sidebar (`ui-workspace`): `declared` row phase (precedence awaiting-* > declared > planning > running > subagents > done > idle), goal-phase fallback (blocked→stuck, complete→finished, paused→paused), distinct subagent glyph, status glyph + tone, row-menu "Set status…" / "Clear status".

- Bundle composition: base + web-app patches, packages in base/package.json; confirmed via `dsh --profile headless --dump-default-config`.

- Docs: package/group READMEs, `docs/subsystems/session-status.md`, agent note triple, generator manifests.

- Verified: typecheck clean; lint clean on new packages; 209 targeted tests; 100% coverage on session-status; doc-sync 32/33 (one failure is a pre-existing Windows symlink EPERM).

- Open: uncommitted on the repo (no upstream push access to deepseek-ai); live desktop smoke test pending (user-gated).

## 2026-09-07 - Workspace grouping implemented and committed

- Implemented workspace grouping end-to-end: `group` field on the workspace domain record, `setGroup` in the API controller + typert wire codec, two-level group/workspace/sessions tree in the sidebar, and a "Set group…" dialog on the workspace row menu.

- Verified: host + client tsc typecheck clean; typert host + client bundles built; 257 tests pass (2 failures are pre-existing symlink EPERM under the Windows sandbox, not this change).

- Committed: `67ceb5406a` on local `master`, rebased cleanly onto `c389f96bf3`.

- Open: `git push` denied (neotechnet has no access to the deepseek-ai org; no fork exists). Either fork to a chosen account and push, or keep the change local. Visual smoke test of the grouped sidebar still pending.

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=a463cfd2-49e3-4da7-b34c-e0db2cd09616 at=2026-09-09T23:35:44.128791+00:00
-->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=deddfeae-e84e-445b-84c5-f1a7c670cea5 at=2026-09-10T16:40:13.537019+00:00
-->

## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

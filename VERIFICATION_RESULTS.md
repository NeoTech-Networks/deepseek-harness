# VERIFICATION_RESULTS (capped newest-first log)

## 2026-10-31 - Workspaces fold and one account button, built and installed

- VERIFIED tests: `ui-workspace` 13 files, 527 passed, including 3 new fold specs (opens by default and folds on a press, remembers the fold across a remount, still shows search results while folded). `verify-client-ui-i18n` 1,096 source files clean; oxlint exit 0 on the touched files; the pre-push typecheck hook passed in 87.6 s with `CI=true`.
- VERIFIED the fresh-worktree `tsc -b` errors were NOT this change: `pnpm run typecheck:contracts-ready` in `C:\Projects\worktrees\dsh-workspaces-collapse` reported 24 errors, all `packages/test-support/remote-mock` and all about a generated `TypertRemoteNamespaceMap` with no `settings`/`session` namespaces, which a worktree that has never run codegen does not have. The same command in `C:\d216` (a built tree) is clean, and `pnpm run build` there passes the client compiler and the client aggregate check.
- VERIFIED build: `pnpm run build` 9 passed, 0 failed, 0 skipped in 110.08 s (native addon, host compiler, host aggregate check, Host bundle, Desktop bundle, client compiler, Client bundle, Web build, client aggregate check). `stage-build.ps1` then ran every packaging stage to exit 0, ending `smoke-packaged-runtime.ts --unsigned` (46 s) and `windows-package`.
- VERIFIED the code reached the artifact: `section.workspaces.toggle` x3, `sectionToggle` x15, `setSectionCollapsed` x2 and `Toggle Workspaces` x1 inside the packaged `app.asar` (205,217,352 bytes) and again inside the INSTALLED one.
- VERIFIED installed: uninstall key `7808434f-469e-5eba-848e-edf64d3b94ce` reads 0.2.1-rc.5, exactly one Harness uninstall row, installer exit 0, settings `24 files, all same`, `[settings] every one of your settings survived the install.`, `app is up`.
- VERIFIED the fold works on a real press in the running app: a UI Automation click on the header took the workspace group headers from 5 to 0 (buttons 65 to 58) and a second click restored them (58 to 65); `ExpandCollapseState` reads `Expanded` then `Collapsed`; keyboard SPACE/ENTER does the same. Vision read of the header crop: `The text is "Workspaces". Yes, there is a small solid triangle to the left of the text, and it points downward.`
- VERIFIED exactly one account button, in every census: 1 before the fold, 1 folded, 1 restored, 1 after the install and restart. The plugin patch reads 10 of 10 in the running profile and `uiNow.accountSeated` appears twice in the installed `client.js`.
- VERIFIED the fold persists to disk: `Select-String` over `%APPDATA%\@deepseek-ai\dsh-desktop\Local Storage\leveldb\*` finds the view blob written twice, `"archivedFilter":"default","collapsed":false` then the same with `"collapsed":true`.
- VERIFIED the shared rules file after the install's own refusal: both paths report file id `0x00000000000000000004000000bc1cc4`, `fsutil hardlink list` names both, and the content hash is unchanged (`CB489493F90B9817`, 50,014 bytes).
- UNVERIFIED: the fold surviving an app restart. Nothing has observed the read-back after a restart; the store's persist and the remount spec cover the path, not the live round trip.

## 2026-10-30 - Bot Sessions group: built, packaged, installed, read back

- VERIFIED tests move the right way: `all-sessions.client.spec.tsx` was `4 failed | 5 passed (9)` on the untouched tree and `4 failed | 11 passed (15)` after, with the SAME four failing names both times (`lists every unarchived session newest-first`, `hides archived sessions`, `survives a rail/wide round trip`, `keeps a crashing section visible`). Six new cases, no new failure. Logs in `C:\Projects\logs\2026-10-30-dsh-bot-sessions\` (`baseline-all-sessions.log`, `after-all-sessions.log`). `tree.client.spec.ts` and `sidebar-root.client.spec.tsx` all pass.
- VERIFIED the gates: `pnpm run build` 9 of 9 (107.81 s), `pnpm run typecheck` 5 of 5 (309.75 s), oxlint on the seven changed files exit 0, `verify-client-ui-i18n` clean over 1095 client sources.
- VERIFIED the slot catalog does not move: `gen-client-catalog --check` reports it stale, and it reports the SAME staleness with this change stashed, so it is pre-existing (OPEN_ISSUES 25), not caused here.
- VERIFIED the packaged build: `dsh_local_features_check.py --asar ...\win-unpacked\resources\app.asar` reads 47 of 47 including `bot-sessions-group`; marker `allSessions.botSessions` found 4 times inside that asar; packaged smoke `smoke-packaged-runtime.ts --unsigned` exit 0 in 77.8 s.
- VERIFIED the install: uninstall key `7808434f-...` reads `0.2.1-rc.5` with one row, the app was closed and relaunched 07:20, and `dsh_local_features_check.py` with no arguments (so it reads the INSTALLED asar) reads 47 of 47.
- VERIFIED on screen: a captured crop shows the `Bot Sessions` heading directly under an ordinary row (`Build Wix pages...` / `blog-articles`) with indented bot rows beneath it; UI Automation by CONTAINMENT, not position, reports the All Sessions tree holding 14 rows, 6 ordinary then 8 bot, with no `DS Bot` among the ordinary six. A flat position scan gives a wrong count here because the workspace browser beneath is also full of `DS Bot` rows.
- VERIFIED the fold control: `ExpandCollapsePattern` reads `Collapsed` and `Expand()` moves it to `Expanded`. `Collapse()` did not take while the window was minimised, so the fold-back is not proven.
- RECONCILED the count: the bot Workspace holds 10 sessions, 1 is archived (hidden by the pre-existing default filter), 1 is a blank provisional (hidden unless selected) = the 8 shown.
- NOT VERIFIED: a brand-new bot chat joining the group live (OPEN_ISSUES 26).

## 2026-10-30 - Bot Sessions publishes the ids it owns

- VERIFIED build: `pnpm run build` 9 of 9 gates in `C:\d216` (host compiler 268.83 s, host aggregate 171.03 s, client compiler 141.10 s, client aggregate 82.90 s, Client bundle 27.84 s).
- VERIFIED package: `state=ok` at 13:59:44; the packaged smoke `tsx scripts/smoke-packaged-runtime.ts --unsigned` exited 0 in 66 s with `fatalObserved:false` and `timedOut:false`; `windows-package success:true`. Artifact `deepseek-harness-0.2.1-rc.5-win-x64-unsigned.exe`, 290,477,124 bytes, sha256 `806E1BDC7CF2366E40C908EBAE9DB557AD23E57D6C7A13548A1BD71B2FB0AAAC`. Version deliberately not bumped.
- VERIFIED the new code shipped: `__dshBotSessions` four times and `dsh-bot:sessions` twice in `packages/client/ui-workspace/lib/client.js`, in the packaged `dsh\node_modules\@deepseek-ai\dsh-client-ui-workspace\lib\client.js`, and in both the packaged and the INSTALLED `app.asar` (205,209,761 bytes).
- VERIFIED tests and gates: `ui-workspace` 13 files, 524 passed; `pnpm run typecheck` 5 of 5; oxlint clean on the five touched files; the pre-commit lefthook passed on the commit.
- VERIFIED the plugin patch survived the install: `ds_bot_combined_sidebar_patch.py --check` reads 9 of 9 on the installed `client.js`, and `node --check` exits 0.
- VERIFIED live over CDP after the install: 7 ids published; 5 rows outside the group with NONE of them published; 6 inside with all of them published; `leakedIntoOuterList` empty and `publishedButNotInGroup` empty. The seventh id is a DS Bot bot identifier rather than a session and appears nowhere in the page.
- VERIFIED the degrade path: deleting the global and firing the event moved 3 rows back to the main list and left the rest under the folder rule, so the list falls back instead of emptying. The published set was then restored and re-read at 7 published, 5 outside, 6 inside.
- VERIFIED by eye as well, on `sidebar-crop.png` read with DeepSeek vision: `All Sessions` expanded holding `Build Wix pages fro...` labelled `blog-articles`, and `Bot Sessions` expanded holding `Igor` labelled `session-sessio...` and `YouTube` labelled `sig-railway-ser...`. The OS window capture was stale (PrintWindow) and disagreed, so the renderer pixels over CDP were the evidence used.
- VERIFIED the running build: `dsh_local_features_check.py` on the installed app reads 48 of 48, including `bot-sessions-published`; `DisplayVersion` 0.2.1-rc.5; the app was then relaunched without the debugging port.

## 2026-10-29 - Combined ds-bot sidebar, caption launchers, plain sessions

- VERIFIED tests: `ui-sidebar` 74 passed (incl. 4 new combined-sidebar specs; 5 snapshots updated for the seat rename); `ui-workspace` + pickers pass except 4 `all-sessions` and 1 `desktop-picker` failures that reproduce identically with the change stashed.
- VERIFIED build: `pnpm run build` 9 of 9 gates (incl. client aggregate check); package exit 0; installer 16:18:55; `finish-install.ps1` SETUP COMPLETE, settings 20 `same`, HARDLINK OK.
- VERIFIED running build: `dsh_local_features_check.py` 46 of 46 incl. new rows `combined-sidebar` and `combined-sidebar-sessions-seat`.
- VERIFIED on screen (PrintWindow capture `C:\Projects\logs\2026-10-29\dsh-combined-sidebar\window-v3.png`): caption row reads Application, Edit, Plugins, Automation tasks, More; New Session button labelled; Bots section above All Sessions.
- VERIFIED headless against the live host (`probe\new-session-from-ordinary.png`): an ordinary session renders without `.bt-head` and with the composer dock; New Session from it stays on the hero 6 s+ with the workspace picker visible (was redirected to Chief at 400 ms before the ds-bot patch).
- FAILED then FIXED in-session: the first build registered the browser twice; the second seat had no `renderSlot` and the page rendered blank (`renderSlot is not a function`). Replaced by the single-registration design before the next install.
## 2026-10-29 - 0.2.1-rc.5 install (from the installer's own log, then re-checked live)

- VERIFIED the dry run: `finish-install.ps1 -WhatIf` exit 0, named `deepseek-harness-0.2.1-rc.5-win-x64-unsigned.exe`, mode `reinstall on the current line`, wrote nothing under `~\.dsh`. `Test-RunningInsideHarness` did not fire: `DSH_SESSION_ID` was empty and the ancestry read this session was `pwsh, cmd, claude.exe, pwsh, Code.exe, Code.exe, explorer.exe`.
- VERIFIED the install from its log: pre-install snapshot `20 files, 0 changed` commit `0a2f70d` pushed to origin; `installer exit code: 0`; `installed 0.2.1-rc.5 (1 DeepSeek Harness uninstall row(s))`; post-install `verify: 20 files, all same`; `app is up`; `[settings] every one of your settings survived the install.`; `HARDLINK OK (final)` 2 links, one file id `0x00000000000000000001000001116b38`; `SETUP COMPLETE. Running 0.2.1-rc.5`.
- VERIFIED the running code, not the log: `dsh_local_features_check.py` read the INSTALLED `resources\app.asar` and returned `all 46 local features are present in the running build`, exit 0, across 46 named checks.
- VERIFIED the preset loss live, not from the log: `Select-String` over `C:\Users\SteveDempsey\.dsh\cordis.patch.yml` returns 0 hits for `brainstorm` and the only `preset-` row id is `preset-standard-hooks`; the same search over `cordis.patch.yml.pre-0.2.1` hits 4 times, including `- id: preset-brainstorm-hooks` at line 431.
- VERIFIED the rollback floor: `C:\Projects\exports\2026-10-29-dsh-0.2.1-rc.5\deepseek-harness-0.2.1-rc.5-win-x64-unsigned.exe` is 290,479,007 bytes and its SHA256 equals the build tree's (`67A05098DA3BE13D2D9B07F5B36A9C7D49CC40126DCD8536B5DC8005125FFD10`).
- NOT VERIFIED, and not claimed: hook firing in a session created AFTER the 18:02 restart, one real MCP call, the mode picker on screen, and the composer buttons. Same unproven arms rc.4 left (OPEN_ISSUES 18), now owed to rc.5 as item 26.
- VERIFIED build: `pnpm run build` 9 passed, 0 failed, 0 skipped in 110.08 s. `stage-build.ps1` then ran every packaging stage to exit 0, ending `smoke-packaged-runtime.ts --unsigned` (46 s) and `windows-package`.
- VERIFIED the code reached the artifact: `section.workspaces.toggle` x3, `sectionToggle` x15, `setSectionCollapsed` x2 and `Toggle Workspaces` x1 inside the packaged `app.asar` (205,217,352 bytes) and again inside the INSTALLED one.
- VERIFIED installed: uninstall key `7808434f-469e-5eba-848e-edf64d3b94ce` reads 0.2.1-rc.5, exactly one Harness uninstall row, installer exit 0, settings `24 files, all same`, `[settings] every one of your settings survived the install.`, `app is up`.
- VERIFIED the fold works on a real press in the running app: a UI Automation click on the header took the workspace group headers from 5 to 0 (buttons 65 to 58) and a second click restored them (58 to 65); `ExpandCollapseState` reads `Expanded` then `Collapsed`; keyboard SPACE/ENTER does the same. Vision read of the header crop: `The text is "Workspaces". Yes, there is a small solid triangle to the left of the text, and it points downward.`
- VERIFIED exactly one account button, in every census: 1 before the fold, 1 folded, 1 restored, 1 after the install and restart.
- VERIFIED the fold persists to disk: `Select-String` over `%APPDATA%\@deepseek-ai\dsh-desktop\Local Storage\leveldb\*` finds the view blob written twice, `"archivedFilter":"default","collapsed":false` then the same with `"collapsed":true`.
- VERIFIED the shared rules file after the install's own refusal: both paths report file id `0x00000000000000000004000000bc1cc4`, `fsutil hardlink list` names both, and the content hash is unchanged (`CB489493F90B9817`, 50,014 bytes).
- LATER RE-MEASURED 2026-10-31 18:14 after a concurrent session added five bot-tile hunks to the same patcher: `ds_bot_combined_sidebar_patch.py --check` now reads 15 of 15 with `one account button` last, and the live window still shows exactly one Account button and one `Toggle Workspaces`.
- UNVERIFIED: the fold surviving an app restart. Nothing has observed the read-back after a restart; the store's persist and the remount spec cover the path, not the live round trip.

## 2026-10-28 - New Session workspace dropdown reset fix

- VERIFIED the cause live (`record.json`): body remount `wd4y4 -> kme6u` and `aria-expanded true -> false` at 53.6 s, the instant `dsh.sessions.current` switched to the picked folder's blank session, 7.2 s after the pick. With no input the chip held for 45 s.
- VERIFIED tests: `ui-conversation` 50 files, 852 passed, including two new specs (state survives a body rebuild; a pick survives one list that lacks it and drops after a second). `tsc -b tsconfig.client.json` exit 0; oxlint clean on the touched files. `ui-workspace` all-sessions 4 failures reproduce identically with the change stashed (pre-existing, OPEN_ISSUES 13).
- VERIFIED build and package: `pnpm run build` 9 of 9; package exit 0; marker `ui-conversation: hero picker state` in the packaged asar; `dsh_local_features_check.py --asar` 44 of 44.
- VERIFIED installed and live: `dsh_local_features_check.py` on the running build 44 of 44 including `picker-reset-fix`; the recorder on the new GUI (`verify.json`) picked `abc-outreach`, the blank session landed at 28.3 s with NO body remount and the dropdown stayed open, chip unchanged to 146 s.

## 2026-10-27 - 0.2.1-rc.4 backport (built and proven; install NOT run)

- VERIFIED the release is npm-only: `npm view @deepseek-ai/dsh time` has 0.2.1-rc.4 at `2026-10-26T15:28:13.431Z`; `git ls-remote --tags upstream` has no rc.4; the releases API's newest entry is `dsh-v0.2.1-rc.3`; `master` still reads `0.2.1-rc.3`.
- VERIFIED what it contains: both versions of `dsh-mcp-client` and `dsh-mcp-resources` downloaded with `npm pack` and diffed. Only `lib/index.js` (one guard) and three README files in each package differ.
- VERIFIED the backport: the BUILT `packages/mcp/mcp-client/lib/index.js` is byte-identical to the published rc.4 `lib/index.js` (35,189 bytes, `diff -q` clean), and the extracted copy from the packaged `win-unpacked\resources\app.asar` is identical after CRLF normalisation.
- VERIFIED the spec has teeth: without the guard it fails with `Client.listResources() called but server does not advertise resources capability - returning empty list`; with it, 6 of 6 in `protocol.spec.ts` pass.
- VERIFIED build gates: `release:verify --family dsh` 353 members, 0 unordered peers; `pnpm run typecheck` exit 0; `mcp-client` + `mcp-resources` 146 passed, 1 failed (`negotiation-lifecycle` "no child could be spawned"), and that same test fails identically on the untouched rc.3 tree in `C:\d213`; seven catalog verifiers exit 0; `pnpm run build` 9 passed 0 failed in 74.6 s.
- VERIFIED packaged build: guard present in `win-unpacked\resources\app.asar`; `dsh_local_features_check.py --asar` reads 43 of 43; installer 290,670,337 bytes, sha256 `361898423A8BC96582BB1D2D5FE094C89B1B98DF850FA88F5B53BCC2E97F0DA8`, copied to the exports folder and re-hashed there.
- VERIFIED SessionStart chain: 17 hooks, 0 non-zero exits, 9.0 s serial, slowest `work_recall_card.py` 4.17 s (its own budget).
- VERIFIED the pre-install dry run: `finish-install.ps1 -WhatIf` exits 0, names `deepseek-harness-0.2.1-rc.4-win-x64-unsigned.exe`, writes nothing, and `Test-RunningInsideHarness` did not fire (ancestry `pwsh, cmd, claude.exe, pwsh, Code.exe, explorer.exe`).
- VERIFIED the checker fix: `dsh_update_check.py --self-test` passes 8 version comparisons and 6 verdicts; live, against the still-installed rc.3, it answers `NPM AHEAD, NO SOURCE TAG 0.2.1-rc.4 (next)` where it previously answered `UP TO DATE`.
- NOT VERIFIED at that point, and not claimed then: the install itself, `DisplayVersion 0.2.1-rc.4`, the installed asar, hook firing in a new session, MCP calls, the mode picker and the hardlink. SUPERSEDED the same evening by the INSTALLED section below.

## 2026-10-27 - 0.2.1-rc.4 INSTALLED and read back

- VERIFIED version: `finish-install.ps1` printed `installed 0.2.1-rc.4 (1 DeepSeek Harness uninstall row(s))` and `SETUP COMPLETE. Running 0.2.1-rc.4`, with no `STILL DRIFTED`. An independent registry read afterwards returns `DisplayVersion 0.2.1-rc.4` and exactly one DeepSeek Harness uninstall row.
- VERIFIED settings: `verify: 20 files, all same` and `every one of your settings survived the install`; preset `up to date; nothing to change` (pinned 34 rows = shipped 34).
- VERIFIED hardlink: `HARDLINK OK (final): AGENTS.md and .claude\CLAUDE.md are one file, 2 links, id 0x00000000000000000001000001116b38`.
- VERIFIED the RUNNING code carries the fix: `dsh_local_features_check.py` reads 43 of 43 from the INSTALLED asar, and `asar_guard_check.cjs` on the installed `app.asar` reports `const listable guard: true` with `empty pages on the false branch: true`.
- VERIFIED the hook-bridge pin and the load order: `~\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-hooks-claude-code\package.json` reads `0.2.1-rc.4` with mtime 19:13:55, and the earliest DeepSeek Harness process started 19:14:08 after the restart (5 processes alive).
- VERIFIED the checker in both directions: before the install, against rc.3, it answered `NPM AHEAD, NO SOURCE TAG 0.2.1-rc.4 (next)`; after it answers `UP TO DATE` with `npm newest 0.2.1-rc.4 (tag next)` and no "newer than installed" mark. `--self-test` passes 8 comparisons and 6 verdicts.
- NOT VERIFIED: hook firing in a session created AFTER the restart (the restored `cipp_gateway` session holds 386 hook events, all predating it, and its last event is an app-level `agent/inbox/spliced` at 19:14:35), one real MCP call per server, and the mode picker seen on screen. The loopback-listener arm is unusable on this machine because every loopback listener reports owner PID 0.

## 2026-10-24 - 0.2.1-rc.3 install

- VERIFIED version: `DisplayVersion 0.2.1-rc.3`, exactly one uninstall row; `dsh_update_check.py` VERDICT: UP TO DATE.
- VERIFIED features: `dsh_local_features_check.py` 43 of 43 on the packaged asar and again on the installed asar.
- VERIFIED build gates: build 9 of 9 PASS, typecheck exit 0, pre-push typecheck PASS. Conflicted packages' tests: 4815 passed; failures are the known symlink EPERM and the four all-sessions failures (item 13); six 5 s timeouts under load passed when rerun alone (263 passed, 1 EPERM).
- VERIFIED settings: finish-install `every one of your settings survived the install` (20 files, all same), preset pinned 34 rows = shipped 34.
- VERIFIED host: `dsh web` on port 61031 accepted a connection (the socket table reports owner PID 0 on this machine, so that arm cannot be used).
- VERIFIED hooks: new Flash session `session-97f5f46e...` and new Pro session `session-9ba390fe...` each logged UserPromptSubmit, PreToolUse, PostToolUse and Stop at exitCode 0, and each has a SessionStart emitted-context card.
- VERIFIED models: the live `/models` lists `deepseek-flash` and `deepseek-v4-pro`; both appear in the model menu and both answered a tool-using turn (`2026-10-24T11:06:35`, `2026-10-24T11:07:48`).
- VERIFIED MCP: 10 of 10 mounted servers answered a read-only call (composio on a retry after a transient `fetch failed`). Screaming Frog is not mounted because its local app was not running.
- SEEN on screen (headless against the live host): mode picker "Standard + Claude Code hooks"; More menu with Browse other plugins and Create your plugin; New Session draft kept after switching away and back (probe text cleared afterwards); composer Save / Archive / Production buttons; footer Skills Used and Purpose lines.
- VERIFIED hardlink: `fsutil hardlink list` names both paths, both file ids `0x...01116b38`.

## 2026-10-18 - 0.2.1-rc.2 post-upgrade review (hooks, plan mode, worktree guard)

| Check | Expected | Result | Status |
|---|---|---|---|
| Hook bridge package in profile | both at 0.2.1-rc.2 | package.json and both node_modules copies read `0.2.1-rc.2` | VERIFIED |
| Hooks fire after restart | non-zero `hook/result`, exit 0 | session f4db5a32: 341 PreToolUse, 340 PostToolUse, 23 UserPromptSubmit, Stop 5 pass + 1 block | VERIFIED |
| Deny path | worktree guard refuses a primary-checkout Write | refused 10:10, with the `working_directory` hint | VERIFIED |
| Plan dismissal is a decline | `{approved:false}` and 0.2.1 text not read as approval | `test_plan_handoff_dsh.py` 17 passed | VERIFIED |
| Guard and bridge suites | green | 134 passed (guard + backend capability), 106 passed (bridge) | VERIFIED |
| Skill copies | three equal hashes, v5 | all `D7DF0900...`; `skill_version.py` "both copies agree" | VERIFIED |

## 2026-10-18 - Claude route and hook bridge after the 0.2.1-rc.2 install

| Check | Expected | Result | Status |
|---|---|---|---|
| Anthropic hosts resolve | 3 hosts | api.anthropic.com, claude.ai, console.anthropic.com all 160.79.104.10 (DoH, status 0) | VERIFIED |
| Anthropic TCP 443 | connects | 20 of 20 over 60 s, 13 to 46 ms; Cloudflare 20 of 20; DeepSeek 8 of 8 | VERIFIED |
| Stored OAuth token valid | HTTP 200 | `GET /v1/models` 200 in 0.33 s, 14 models, expires 2026-10-18T20:04:52Z | VERIFIED |
| Endpoint reaches Anthropic | any HTTP answer | `POST /v1/messages` HTTP 429 in 0.30 s (rate limited, request understood) | VERIFIED |
| A turn completes | `kind: completed` | `turn/end` `{"kind":"completed"}`, 0 retries, `claude-opus-5-5` | VERIFIED |
| Tool call ran | tool/result present | `pwsh` echo, tool/call seq 26, tool/result seq 33, PreToolUse and PostToolUse each exit 0 | VERIFIED |
| Hooks fire after restart | exit 0 per point | UserPromptSubmit 1, PreToolUse 1, PostToolUse 1, Stop 1, all exit 0 | VERIFIED for those four points |
| SessionStart | fires | not logged as `hook/result` (OPEN_ISSUES 16, reconfirmed over 13 records), but its emitted-context card for the test session was written 09:21:25 carrying the railway orientation block | VERIFIED by card, not by log |
| Bridge loaded, not just installed | process start earlier than plugin mtime | plugins written 08:19:14, processes started 08:04:20 before restart; 09:06:46 after | VERIFIED |
| Not a regression of the upgrade | model setting unchanged | `anthropic / claude-opus-5-5` identical to the 2026-10-07 backup | VERIFIED |
| NordVPN change was the fix | a change was made | NO change made: tunnel last transitioned 07:31:32 and the path cleared on its own | NOT APPLICABLE, recorded as intermittent |

## 2026-10-16 - Workspace picker groups, installed 0.2.0-rc.2 build

| Check | Expected | Result | Status |
|---|---|---|---|
| Version installed | 0.2.0-rc.2, one uninstall row | `DisplayVersion 0.2.0-rc.2`, exactly 1 DeepSeek Harness row | VERIFIED |
| Running code is the built code | installed asar equals packaged | both `B3664A7D...FA47`, 124,015,031 bytes | VERIFIED |
| The feature is in the running code | `workspace-picker-groups` present | "all 43 local features are present in the running build", exit 0 | VERIFIED |
| App serving | port 19387 answers | answers 401 (serving, wants its own token); 5 processes started 18:38 | VERIFIED |
| Settings survived install | vault verify clean | 20 files all same, before and after; AGENTS.md hardlink intact | VERIFIED |
| Hooks fire after install | exit 0 per point | PreToolUse 315, PostToolUse 315, UserPromptSubmit 14, Stop 3, all exit 0, zero non-zero | VERIFIED for those four points |
| SessionStart | exit 0 | never recorded as `hook/result` in any of 551 logs; context card injected for a promptless post-install session | NOT APPLICABLE as written, see OPEN_ISSUES 16 |
| Dropdown shows headings on screen | headings + order seen | `picker-open-crop.png` transcribes `ABC` / `Clients` / `General` headings with folders under each | VERIFIED for the top three headings |
| Lower headings photographed | all headings seen | list is taller than the screen; `NeoTech` and below not read | UNVERIFIED, OPEN_ISSUES 14 |
| Delete drops it from the dropdown | live observation | Phase 3 spec only, not seen live | UNVERIFIED |

Evidence folder: `C:\Projects\logs\2026-10-16-dsh-020-rc2-picker\` (`VERIFICATION.md`
carries the full write-up and the case-sensitivity caveat: the vision reader
called the order "not alphabetical" by applying ASCII case rules, while the
picker uses the sidebar's `Intl.Collator` with `sensitivity: 'base'`, so
`new-leads` before `Rolland Work Orders` is correct).

## 2026-10-08 - Composer Save, Archive and Production buttons

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-conversation specs | pass | 573/573, input-bar 117/117 after Production | VERIFIED |
| ui-workspace apply spec | pass | 21/21 incl. composer Archive case | VERIFIED |
| ui-workspace all-sessions spec | pass | 4 fail, identical with changes stashed (pre-existing) | UNVERIFIED |
| Typecheck, oxlint, verify-client-catalog | exit 0 | all 0 | VERIFIED |
| Packaged asar features | all present | 42/42 | VERIFIED |
| Installed app features | all present | 42/42, app.asar 2026-10-08 07:40:02 | VERIFIED |
| Buttons on screen | visible | headless GUI capture 401, blank | UNVERIFIED |



## 2026-10-04 - Purpose line plain-text and ten-word fix

| Check | Expected | Result | Status |
|---|---|---|---|
| Specs | pass | title-llm, session-title, projection 5/5, skeleton all green | VERIFIED |
| Typecheck, lint, catalogs, pairing, build | exit 0 | all 0 | VERIFIED |
| Installed asar == built | identical sha256 | `3EC115DC...9193` both | VERIFIED |
| Stored value cut to ten words | 10 words | projection cache ver 2: "Adds a Purpose line beneath the skills-used section of every" | VERIFIED |
| Line on screen, plain text | grey, not link coloured | window capture app-window-purpose-v2.png | VERIFIED |
## 2026-10-04 - Session footer Purpose line

| Check | Expected | Result | Status |
|---|---|---|---|
| Generator spec | pass | 8/8 (`purpose.spec.ts`) | VERIFIED |
| Title specs unchanged | pass | title-llm 12/12, both plugin suites green | VERIFIED |
| Projection + footer specs | pass | 4/4, skeleton 40/40 | VERIFIED |
| Typecheck, lint, catalogs, README gates | exit 0 | all 0 | VERIFIED |
| Build, package | exit 0 | build 0; package 0 on retry | VERIFIED |
| Installed asar == built | identical sha256 | `3DDD8EEC...F3A6` both | VERIFIED |
| Features in running app | 39 of 39 | 39 of 39 | VERIFIED |
| Event really written | a `session/purpose` line | seq 967 in session-4b658795 log, quoted in CURRENT_STATE | VERIFIED |
| Line seen on screen | visible | window was on a new-session screen; headless GUI 401 | UNVERIFIED |
## 2026-10-04 - DSH quickstart audit and documentation fix

| Check | Expected | Result | Status |
|---|---|---|---|
| Which release the live page is | identify the snapshot | live text matches the `dsh-v0.2.0-rc.1` and `dsh-v0.2.0-rc.2` docs word for word; `public-deployments.md` 404 live | VERIFIED |
| First-use workspace behaviour | an empty install auto-creates and selects | `navigation.ts` empty-registry branch plus `apps/web/tests/default-workspace.e2e.ts` assertions, at both tags | VERIFIED |
| Ship date of that behaviour | before the published snapshot | commit `4d2e420ef8`, 2026-09-20, present in `dsh-v0.1.7-rc.2` and later | VERIFIED |
| UI strings used in the new text | exist in the shipped locales | `workspace.defaultName` "Default workspace", `menu.addWorkspace` "Add workspace…", `hero.chooseWorkspace`, `onboardingTitle`/`onboardingLater` | VERIFIED |
| Translation pair | in sync after the edit | `verify-translation-pairing` 860 pairs consistent, record re-recorded with `--write` | VERIFIED |
| Markdown gates | exit 0 | `verify-md-wrap` 1732 files; `verify-md-links` 1708 files; `verify-doc-budgets` 8 docs; `verify-concrete-terms` clean | VERIFIED |
| Documentation build | exit 0 | `docs:build` 41.8 s; `verify-doc-site-fragments` 4980 fragments | VERIFIED |
| Rendered pages | new text visible, no console errors | headless `browser_verify` PASS on `/en/guide/quickstart.html` and `/guide/quickstart.html`; screenshots in `C:\Projects\logs\browser-verify-20261003-212618\` and `-212630\` | VERIFIED |
| Aggregate `doc-sync` with `CI=true` | run the CI-equivalent set | 41 of 42 gates pass; the one failure is a Windows `EPERM` on `symlink` inside `scripts/project-doc-site.spec.ts`, unrelated to the diff | VERIFIED |
| Branch on origin | ref present at the same commit | `7e9001c272f4210ee9adb94a3ef7012e6bf59c0a` at `refs/heads/docs/quickstart-first-use-workspace` | VERIFIED |
| Nothing else changed | only the three doc files | `git diff --name-only upstream/master` names exactly them; `git status` clean; `website/.dist` and `website/.generated` stay untracked | VERIFIED |
| Live page unchanged by us | still the old wording | live `.md` re-fetched this session, unchanged | VERIFIED |
| The upstream post | posted | nothing posted; the draft is waiting on Steve | UNVERIFIED |

## 2026-10-01 - Session footer "Skills Used" line

| Check | Expected | Result | Status |
|---|---|---|---|
| Host fold spec | all pass | `skills-used-projection.host.spec.ts` 8/8 | VERIFIED |
| Client footer spec | all pass, old footer cases untouched | `skeleton.client.spec.tsx` 36/36 | VERIFIED |
| Typecheck, lint, catalogs, i18n | exit 0 | host + client tsc 0; oxlint 0 errors; verify-cordis-catalog, verify-client-catalog, verify-client-ui-i18n pass | VERIFIED |
| Build | exit 0 | `pnpm run build` 0, 353 client artifacts | VERIFIED |
| Package + smoke | exit 0 | run `2026-10-01T19-15-09.777Z-5WuXRp` exit 0, runtime:smoke and smoke-packaged-runtime pass | VERIFIED |
| Markers in packaged asar | 37 of 37 | `dsh_local_features_check.py --asar` all 37 present | VERIFIED |
| Installed asar == built | identical | sha256 `06614FF2A27E...13C5` both | VERIFIED |
| One uninstall row, app up | 1 row, port 19387 | `7808434f-...` 0.2.0-rc.2; 19387 answers; processes from 17:33:21 | VERIFIED |
| Projection folding live | non-empty for a Session that typed a skill | cache row `["dashboard-design-sync","save-state"]` | VERIFIED |
| Populated row on screen | `Skills Used:` visible | not yet captured; the open Session used none, so correctly no footer (`app-window-after-install.png`) | UNVERIFIED |

## 2026-09-30 - DSH 0.2.0-rc.2 replay, build, package, install

| Check | Expected | Result | Status |
|---|---|---|---|
| Merge base is exactly the previous tag | `dsh-v0.2.0-rc.1` | `4878cdabd8` on both sides | VERIFIED |
| Replay conflicts | resolve by rule | 23 conflicted of the 390 stack-touched files | VERIFIED |
| Blob completeness, fork-only files | all identical bar the intended | **330 of 332** identical; exceptions `auto-open.ts` (deleted) and `ui-plan/index.ts` (reverted), both intended | VERIFIED |
| Blob-check sanity control | loop can see a difference | `ui-plan/src/client/PlanCard.tsx` reported as differing before the run | VERIFIED |
| `pnpm install` in the worktree (CI=true) | exit 0 | exit 0, log store 1393 packages | VERIFIED |
| `pnpm run build` | exit 0 | exit 0, 8m26s first run and 3m35s incremental after the regeneration | VERIFIED |
| Full gate sweep | compare against the 10-of-29 baseline | **29 of 32 pass**; 3 fail, all accounted for | VERIFIED |
| `verify-client-ui-i18n` | exit 0 after the rename | exit 0, 958 Client UI source files | VERIFIED |
| `verify-persistence-changes` | exit 0 after the re-parent | 63 roots match 11 history records | VERIFIED |
| `verify-translation-pairing` | exit 0 after re-recording | 1178 pairs, all consistent | VERIFIED |
| `verify-type-equiv` | 1:1 with manifest | 476 blocks, 476 paired derivatives | VERIFIED |
| `verify-cordis-config` is upstream's | prove by blob | fixture `apps/cli/tests/profiles/acp/cordis.yml` byte-identical to `dsh-v0.2.0-rc.2` | VERIFIED |
| `verify-client-domain-graph` is upstream's | prove by blob | 39 of 40 offenders byte-identical to the tag; the 40th differs with no import line touched | VERIFIED |
| Packaging, first attempt | exit 0 | FAILED: `runtime:lockfile` `pnpm exited with 2147483651` despite the file-redirect remedy | VERIFIED (corrected the remedy) |
| Packaging, real-console retry | exit 0 | exit 0, `runtime:lockfile` through `windows-package` all success | VERIFIED |
| Packaged smoke test | pass | passed (DOCX, XLSX, PPTX to PDF, skill CLI) | VERIFIED |
| Features in the PACKAGED asar | 35 of 35 | 35 of 35 | VERIFIED |
| Artifact identity | record size and hash | 288,350,678 bytes, sha256 `2F4AC466...05E4` | VERIFIED |
| Artifact copied out of the build tree | present | `C:\Projects\exports\2026-09-30-dsh-020-rc2\` | VERIFIED |
| SessionStart hook chain | under budget | 12 hooks, 9.6 s serial; slowest `work_recall_card.py` 4.45 s at its 4.0 s budget, and the bridge fans out in parallel | VERIFIED |
| Installed version | 0.2.0-rc.2, one uninstall row | `DisplayVersion 0.2.0-rc.2`, exactly one row `7808434f-...` | VERIFIED |
| Installed asar equals the built one | byte-identical | 127,016,675 bytes, sha256 `6EACBC93...DE8B` on both | VERIFIED |
| Features in the RUNNING code | 35 of 35 | 35 of 35 | VERIFIED |
| Plan-review supersede in the running code | upstream's, ours gone | `openWhenSeated` 0, `sidebarMounted` 3, `onToggleMode` 4 | VERIFIED |
| App is up | port answers, new processes | port 19387 answers, 7 processes started 04:55:49 to 05:01:03 | VERIFIED |
| Settings retained | identical to pre-install | home patch 20,093 and profile patch 5,541 bytes, both unchanged | VERIFIED |
| Hooks fire | all exit 0 | **443 of 443** `hook/result` events exit 0; this session PreToolUse 222, PostToolUse 221, UserPromptSubmit 3, Stop 1 | VERIFIED |
| SessionStart fires | bridge record exists | `emitted-context/session-c112bdab-....json` written 05:00:47 for this session | VERIFIED |
| MCP servers mount | a real call answers | `memory_search` on claude-memory-bridge returned 3 hits | VERIFIED |
| Existing session logs load | readable | 1,161 session files on disk, newest 6 all read cleanly | VERIFIED |
| AGENTS.md hardlink | two names, one file | two names, identical hashes | VERIFIED |
| The DeepSeek route survived pi-ai 0.87.1 | route resolves | this session runs on `deepseek-flash` | VERIFIED |
| Mode picker SEEN on screen | visible selection | file read only (`selectedDefault: standard-hooks`) | UNVERIFIED |
| Model menu SEEN in the UI | visible | not inspected visually | UNVERIFIED |
| Plan review auto-opens on screen | visible | not seen; needs a real plan finishing while another session is on screen | UNVERIFIED |

## 2026-09-28 - DSH 0.2.0-rc.1 replay, build, install

| Check | Expected | Result | Status |
|---|---|---|---|
| Clean-tag baseline `pnpm run build` (untouched `dsh-v0.2.0-rc.1`) | exit 0 | exit 0, 347 client artifacts | VERIFIED |
| Clean-tag `fs-local` baseline | matches ledger 17 | 13 failed / 147 passed / 4 skipped (164) | VERIFIED (environmental) |
| Clean-tag 6 static gates | recorded baseline | only `verify-cordis-config` fails upstream; other 5 pass | VERIFIED |
| Replay conflicts | resolve by rule | 9 files conflicted of 380; generated took HEAD, the rest union | VERIFIED |
| **No fork change dropped** | all present | **316/316 fork-only files byte-identical to the fork; 160/160 added files present** | VERIFIED |
| Plan-review fix carried | present | `41ef7921d7`; `openWhenSeated` 2, `sidebarMounted` 0 | VERIFIED |
| Install tooling rode across | 4 files | `finish-install.ps1`, `dsh-017-migrate.py`, `dsh-017-restore-mode.py`, vault manifest all present | VERIFIED |
| Fork packages bumped | 9 at 0.2.0-rc.1 | 9 bumped, 0 remaining at 0.1.7-rc.2 | VERIFIED |
| Generators | all exit 0 | 16/16 exit 0 | VERIFIED |
| `pnpm install --frozen-lockfile` | agrees | exit 0, "Already up to date" | VERIFIED |
| Translation pairing | consistent | 1171 pairs consistent (1154 on 0.1.7-rc.2) | VERIFIED |
| `verify-type-equiv` | pass | 470/470, 470 paired derivatives | VERIFIED (fixed this session) |
| `verify-doc-budgets` | pass | 992 words vs 994 ceiling | VERIFIED (fixed this session) |
| `verify-module-graph`, `verify-tsconfig-paths`, `verify-cordis-catalog`, `verify-cordis-api` | pass | exit 0 | VERIFIED |
| `verify-client-ui-i18n` | unchanged from baseline | 2 hard-coded strings in ui-sidebar-explorer | VERIFIED (pre-existing, OPEN_ISSUES 3) |
| `verify-repository-references` | unchanged from baseline | commit hashes in PORT-0.1.7-FEATURE-MAP.md | VERIFIED (pre-existing, OPEN_ISSUES 3) |
| `verify-cordis-config` | fail on the clean tag too | fails identically upstream; not ours | VERIFIED (upstream) |
| Build on the merged tree | exit 0 | exit 0, 353 client artifacts | VERIFIED |
| Client typecheck (pre-push hook) | exit 0 | passed in 32.59 s | VERIFIED |
| Package unsigned win-x64 | exit 0 + smoke | exit 0, DOCX/XLSX/PPTX smoke passed, 287,621,301 bytes | VERIFIED |
| Artifact sha256 | recorded | `CD77B230DE4BCCAC8E7A14F6ED4C3625DFC31B2B94B9D4F60ADEC1A2548C885A` | VERIFIED |
| Features in the PACKAGED asar | 35 of 35 | 35 of 35, exit 0 | VERIFIED |
| Feature markers in the RUNNING code | 35 of 35 | 35 of 35 against the installed asar | VERIFIED |
| **Installed asar IS the built asar** | same SHA-256 | `91AC29A3...D2D0` both | VERIFIED |
| Uninstall rows | exactly one | one, `7808434f-...`, `DisplayVersion 0.2.0-rc.1` | VERIFIED |
| App up | port + processes | port 19387 answers; 6 processes started 17:10:37-17:11:00 | VERIFIED |
| Settings survived the install | 19 files same | 19 same before AND after, no REPAIRED, no STILL DRIFTED | VERIFIED |
| AGENTS.md hardlink | 2 links, 1 id | `HARDLINK OK (final)` | VERIFIED |
| Hooks fire | exit 0 each | UserPromptSubmit 2/2, PreToolUse 8/8, PostToolUse 8/8, Stop 2/2, all exit 0 | VERIFIED |
| SessionStart fires | exit 0 | no `hook/result` row exists for this point in ANY of 95 sessions; proven instead by the bridge's emitted-context carrying the railway orientation card at 17:11 | VERIFIED (by bridge record) |
| SessionStart hook chain timing | under a few seconds | NOT MEASURABLE from logs; ledger-28 budget fix (`RECEIPTS_BUDGET_S = 4.0`) confirmed intact | UNVERIFIED |
| MCP servers mount | each answers | rows present in the home patch; no real call made | UNVERIFIED |
| Operator's mode | shown in the picker | `selectedDefault: standard-hooks` read from the profile patch, not seen on screen | UNVERIFIED |
| A session works | answers | a real turn completed post-install with all hooks exit 0, but in a session RESUMED from 2026-09-25, not a new one | PARTIAL |
| On-screen: review opens after switching back to its session | opens without a click | still not observed (carried from 2026-09-26) | UNVERIFIED |

## 2026-09-26 - plan review auto-open fix

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-plan + ui-sidebar-right + ui-user-questions suites | pass | 24 files, 364 tests passed | VERIFIED |
| ui-plan suite after lint fix | pass | 56 tests passed | VERIFIED |
| Client typecheck (`typecheck:contracts-ready`) | exit 0 | exit 0 | VERIFIED |
| oxlint ui-plan | 0 errors | 0 warnings, 0 errors | VERIFIED |
| Translation pairing | consistent | 1154 pairs consistent | VERIFIED |
| Other static gates (cordis-config, client-ui-i18n, type-equiv, repository-references, module-graph, doc-site) | unchanged from baseline | same failures on untouched C:\d172; none name ui-plan | VERIFIED (pre-existing) |
| Build | exit 0 | exit 0 | VERIFIED |
| Package unsigned win-x64 | exit 0 + smoke | exit 0, runtime smoke passed, 287,433,586 bytes | VERIFIED |
| Fix in packaged ui-plan bundle | autoOpen present, sidebarMounted gone | 4 / 0 | VERIFIED |
| Installed app.asar equals built | same SHA-256 | 6C8EF3EC... both; old rc.2 2ADE60C0... | VERIFIED |
| Installed archive content | autoOpen present, sidebarMounted gone | 75 / 0 | VERIFIED |
| On-screen: review opens after switching back to its session | opens without a click | not yet observed | UNVERIFIED |

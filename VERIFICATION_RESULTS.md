# VERIFICATION_RESULTS (capped newest-first log)

## 2026-11-22 - Harness 0.2.2-rc.5 and DS Bot 0.3.10

- VERIFIED version: uninstall key `7808434f-...` reads `0.2.2-rc.5`, one row; installed `app.asar` dated 2026-11-19 18:30.
- VERIFIED features: `dsh_local_features_check.py` on the installed asar, 47 of 48; the absent row is `team-teammate-model` (absent since rc.3).
- VERIFIED no dropped commits: subject-list diff `dsh-v0.2.2-rc.3..update/v0.2.2-rc.3` vs `dsh-v0.2.2-rc.5..update/v0.2.2-rc.5` printed nothing.
- VERIFIED hardlink: `~\.dsh\AGENTS.md` and `~\.claude\CLAUDE.md` share file id `0x...170000000a94a4`; `fsutil hardlink list` names both.
- VERIFIED DS Bot install: `node_modules/ds-bot/package.json` 0.3.10; all 30 patched files byte-identical to the merge worktree; lockfile `patch_hash=74505a56...`; lockfile diff is only the ds-bot and five plugin rows. `card-gate.log` wrote `gate-loaded` at 21:06:09 (local module running).
- VERIFIED patch: `git apply --check` clean on a fresh `npm pack ds-bot@0.3.10`; applied copy byte-identical to the merge for all 30 files.
- VERIFIED hooks live: Igor session `befe7f5e` after the restart logged `hook/result` exit 0 for UserPromptSubmit (21:10:26, 21:13:05), Stop (21:13:01), PreToolUse and PostToolUse (21:13:40, 21:13:48, around a `pwsh` tool call). SessionStart card `emitted-context/session-befe7f5e-....json` exists.
- VERIFIED a Bot turn end to end: Igor turn 113 completed at 21:13:01 after one Kimi OAuth-refresh timeout retry.
- TESTS: merge suite 3984 tests, 3896 pass, 8 fail, 80 skipped; clean v0.3.10 baseline 3845 tests, 11 fail. New-vs-baseline: symlink EPERM (environmental) and one load-timing flake (passes alone 3 of 3). 0.3.10 origin-only reply tests skipped with the fan-out reason.
- NOT A REGRESSION: four `connector ... upstream POST HTTP 400` warnings (context7, github, vercel, deepwiki) appear before and after the restart.
- SEEN BY STEVE, not this session: sidebar, a bot chat and the Settings screen.
- UNPROVEN: a real Telegram card on 0.3.10; per-bot tool count on a live request.

## 2026-11-17 - DS Bot 0.3.8

- VERIFIED method: patch rebuilt from `33b96332` equals the live 0.3.6 patch byte for byte (sha256 `bbd42f41...`).
- VERIFIED tests: merged tree 2982 pass, 3 fail, 32 skipped; the 3 failures (link build, connectors-gateway, phone) also fail on a clean v0.3.8 worktree. Lint: no errors. `build-client.mjs --check` current.
- VERIFIED install: `node_modules/ds-bot` version 0.3.8; all 30 patched files byte-identical to the merged source; `mcpOffFor` present; 9 `[2026-11-17 local]` markers; lockfile changed only the ds-bot rows plus `semver`/`undici`.
- VERIFIED live: card gate reloaded 08:20:55; SEO Overlord turn completed 08:24:19 and handed work to YouTube, which answered; Railway Health request 202 tools (970 without the cut); no new parts; 0 new diagnostics errors.
- CODE-READ only: Telegram typed-answer button (`typedButton`, `typeable`) and `cardLayout` in the installed `im/index.js`; combined sidebar (`bt-tile-grid`) in the installed `client.js`; `updateCheck: false` still in the profile.
- NOT SEEN: reading pill, sidebar and a bot chat on screen (Steve to glance). Flaky once under full-suite load: `queued deliveries are kept whole, not cut at fifty` (passes alone).

## 2026-11-17 - DS Bot restart bundle (#25, #26, #27, image cap)

- VERIFIED installed code: lockfile `patch_hash` reads `bbd42f41...` on all three lines; `node_modules/ds-bot` has `flushHeld` (6 hits, #26), `WAIT_CEILING_MS` (2, #27), `forceReply: chat.kind === 'group'` (#25) and `mcpOffFor`; the patch reverse-applies cleanly; `client.js` byte-identical to the pre-bundle build (`8127d8ca...`).
- VERIFIED restart and load: every Harness process started 07:21:10 or later; DS Bot wrote state at 07:21:33 with 58 Bots and 10 rooms (same as before).
- VERIFIED Bots answer: Railway Health and Eye In The Sky wrote model replies after the restart; 5 `hook/result` events, all exit 0.
- NOT A REGRESSION: four `connector ... upstream POST HTTP 400` warnings at start (github, vercel, deepwiki, context7) appear at every start since 2026-11-12.
- SEEN BY STEVE, not by this session: no reply bar in a Telegram direct Bot chat (#25), and card order (#26).
- UNPROVEN: the 8000 px cap live. The test message to Igor (800x12000 image) never reached any Bot twice (no session record, not in state or queue). Setting is written and parses; the plugin reads it at start (source `attachment-local/src/index.ts:185`).
- UNPROVEN: #27 on a live handoff (needs a handoff whose reply arrives); covered by its 5 new tests only.
- RETIRED GATE: `ds_bot_combined_sidebar_patch.py --check` reports DRIFTED on this and the previous build alike; it has not been a gate since 2026-11-11.

## 2026-11-14 - 0.2.2-rc.3 and DS Bot 0.3.6, what was proved and what was not

- VERIFIED install: one uninstall row `7808434f-...` DisplayVersion `0.2.2-rc.3`; installer exit 0; 25 of 25 vault files same; preset check "up to date".
- VERIFIED running code: installed `app.asar` sha256 `85502d7d...9035` equals the packaged one; `dsh_local_features_check.py` 47 of 48 (`team-teammate-model` absent, unchanged since rc.1).
- VERIFIED gates: build 10 of 10, typecheck 5 of 5; packaged smoke passed on the second run (first run: pnpm smoke spawn timeout after its ok line).
- VERIFIED hooks after the restart, from session logs: UserPromptSubmit, PreToolUse, PostToolUse and Stop `hook/result` all exit 0; 7 SessionStart cards written after 09:26. SessionStart chain 17 hooks, all exit 0, 10.25 s serial.
- VERIFIED MCP: a `composio_vendors` shared Postgres call answered `successful: true` (the bot's query returned no rows).
- VERIFIED DS Bot 0.3.6: `node_modules/ds-bot` reads 0.3.6, patch applied (not in pnpm's unused list), a bot session answered 5 assistant messages; its request carried only allowed `composio_vendors` groups, none of the MONDAY, NINJAONE or NANOBANANA prefixes, so `mcpOffFor` holds.
- SEEN ON SCREEN (operator, 2026-11-14): the mode picker reads "Standard + Claude Code hooks" and the combined sidebar is intact with DS Bot 0.3.6.
- NOT SEEN ON SCREEN: the chat import (optional package, not in any bundle).

## 2026-11-05 - Bot team restore and 0.2.2-rc.1, what was proved and what was not

- VERIFIED the bot team is back, from disk: destination `state.json` re-parsed
  to 39 bots, 7 rooms, 600 exchanges, revision 8312, and its sha256 equals
  `C:\tmp\state.json`. `memory\reviewed.json` 7,506 bytes, 134 entries.
- VERIFIED the install: uninstall key `7808434f-...` reads DisplayVersion
  `0.2.2-rc.1` with exactly ONE row.
- VERIFIED the running code carries the fork: `dsh_local_features_check.py`
  against the installed `app.asar` (236,226,230 bytes) reads 47 of 48. The
  missing one is `workspace-picker-groups`, dropped deliberately.
- VERIFIED the settings survived: the install log reads `verify: 24 files, all
  same` and `[settings] every one of your settings survived the install.`
- VERIFIED the hook bridge is LOADED, not merely installed: the three bridge
  packages are pinned at `0.2.2-rc.1`, plugin mtime 11:44:46, earliest app
  process 11:45:09, so the process started after the plugin landed.
- VERIFIED the hardlink is whole: both paths share one file id and
  `fsutil hardlink list` names `\Users\SteveDempsey\.claude\CLAUDE.md` and
  `\Users\SteveDempsey\.dsh\AGENTS.md`, 50,363 bytes each.
- VERIFIED the bot team is on screen, by UI Automation: the sidebar tree lists
  Igor, SEO Overlord, ABC Overlord, Clients Overlord, NeoTech Overlord,
  Composio, Sundack Code, SIG Code, Jetway PayComm Code, Google Business,
  NeoTech Code, Cabana Code and the rest of the roster.
- VERIFIED the ds-bot sidebar patch still applies: TeamSidebar, LeftColumn and
  SIDEBAR_CSS all present in the patched client.
- NOT VERIFIED, and not claimed: the composer Save / Production row on 0.2.2.
  It is absent from the accessibility tree, and the built guard is
  `variant === 'composer' && !activity && input && sessionId`, so it hides while
  an activity strip is showing. The session open during the check was mid-turn.
  This needs one look at an IDLE session.
- NOT VERIFIED, and not claimed: four `hook/result` exit 0 entries on a
  tool-using turn after the install. The app was reopened onto an existing
  session, so no turn was taken.
- MEASURED, not a claim: 38 bridged sessions started in 5 minutes from the
  SIG Growth and SIG Content rooms, while `exchanges` stayed at 600 and
  `revision` stayed at 8352.

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

## 2026-10-31 - sidebar height sharing and Main Bot tiles

| Check | Expected | Result | Status |
|---|---|---|---|
| Build gates | 9 of 9 | `9 passed, 0 failed, 0 skipped in 64.33s` | VERIFIED |
| Packaged smoke | all stages true | `runtime:smoke True`, `smoke-packaged-runtime.ts` completed, `state=ok` | VERIFIED |
| CSS in the built bundle | new rules present | `pluginSectionOpen{flex:auto;min-height:96px}`, `pluginBody{...flex:auto;min-height:0;overflow:hidden}`, `rootOpen .list{...max-height:none}`, browser `_root{flex:auto}` | VERIFIED |
| CSS in the shipped asar | same rules | `pluginSectionOpen` x4, `rootOpen` x5 | VERIFIED |
| Install | clean, settings kept | `24 files, all same`; every setting survived; `app is up` | VERIFIED |
| Hardlink | one file, two names | `HARDLINK OK (final)` id `0x...bc1cc4`; `fsutil hardlink list` names both paths | VERIFIED |
| ds-bot patch after install | 15 of 15 | `APPLIED (15 of 15 changes)` | VERIFIED |
| pnpm patch survives reinstall | 14 hunks | `grep -c '^@@'` = 14; revert backup present and byte-identical to npm tarball | VERIFIED |
| Local features | all present | `all 48 local features are present in the running build` | VERIFIED |
| Hook layer | all OK | settings 70 groups, bridge all 7 events, plugin rc.5, bad merge refused | VERIFIED |
| No dead strip | gap ~0 | bot list bottom 1173, All Sessions header top 1206, gap 33 physical px (16 CSS px) | VERIFIED |
| Blank run in the sidebar | no large void | longest run anywhere 65 physical px | VERIFIED |
| Two Main Bot tiles | side by side | both `top=482`; lefts 66 and 318; height 248 each | VERIFIED |
| Side-by-side, seen | two tiles one row | vision on a cropped capture: two tiles, one row, Igor / Chief Of Staff and SEO Overlord / Marketing Chief | VERIFIED |
| Tests | suites green | 21 files, 608 tests passed on the merged tree | VERIFIED |
| Open Workspaces shrinks Bots | Bots height drops | not exercised: the fold button exposes no actionable UIA pattern and pressing it another way raises the window | UNVERIFIED |
| Fold survives a restart | stays folded | not exercised this session (the install restart preserved the restored layout, but no fold-toggle cycle was run) | UNVERIFIED |

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

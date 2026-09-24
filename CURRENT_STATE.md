

## 2026-09-24 - DSH 0.1.7-rc.2 installed

- WHAT SHIPPED: a same-architecture stack REPLAY onto upstream `dsh-v0.1.7-rc.2` (released 2026-09-24T14:10Z, merge `477b4f4205`; rc.1 to rc.2 is 346 commits, 3429 files). The 49 non-merge commits of `dsh-v0.1.7-rc.1..update/v0.1.7-rc.1` were cherry-picked one by one (14 conflicted; the 3 port merges skipped and their plain-union resolutions re-applied by hand); subject lists 49 to 49, no difference. Added on top: `7986ba8138` (9 fork-only packages bumped to 0.1.7-rc.2), `61e0d2d679` (shortcut, quit and group-row fixes), `7d2c7d589e` (catalogs regenerated, translation pairs re-recorded), `9befa83826` (the Lead picks a model for each teammate, cherry-picked from `1cdca77e6d` on `feat/team-teammate-model`). Build worktree `C:\d172`, branch `update/v0.1.7-rc.2`, HEAD `9befa83826`, pushed with tag `dsh-v0.1.7-rc.2` and read back.
- BEHAVIOUR-CHANGING RESOLUTIONS: the DeepSeek `retryPolicy` (STREAM_CLOSED retry, maxRetries 3) now sits on the `@deepseek-ai/dsh-llm-deepseek-api-key` entry (id `llm-deepseek`) after upstream split the plugin, and `streamFirstPayloadTimeoutMs` rides the shared `deepSeekConfigFields`; Ctrl+Shift+A is upstream's own `session.archive` shortcut and the fork's latch, refuse-aloud and archive-failed notice wrap it (fork listener removed, it would archive twice); the fork's always-ask quit prompt is kept and upstream's task-aware warning follows it when work runs; stage marks render in upstream's `sidebar.session.row.leading` slot; the `ask_user_question` description follows upstream's dropped sentence; every fork `*.i18n.yaml` record re-recorded in rc.2's per-heading format (upstream `e7def469e1`), 1154 pairs consistent.
- GATES: host and client typecheck 0; 1717 tests in 52 files (conflict-touched packages) and 119 (agent-team) pass; doc-sync 40 passed, 2 failed, both baseline (doc-site symlink EPERM, and commit hashes in `PORT-0.1.7-FEATURE-MAP.md`). rc.2's `standard.patch.yml` is byte-identical to rc.1's, so the operator's mode needed no re-derive.
- PACKAGING: first run killed by Claude Code for low system memory (4.7 GB free of 31.4); the retry failed `prepare:runtime` "fetch failed" and was fixed by seeding `apps\desktop\.desktop-build\downloads` from `C:\d17`. Packaged smoke passed (DOCX, XLSX, PPTX to PDF). Installer `deepseek-harness-0.1.7-rc.2-win-x64-unsigned.exe`, 287,442,652 bytes, sha256 `B72681920DBF70B6AD434D49873C56DA0748D2BE4D7D2AF1416DE406BDD8AF5C`. The first rc.2 build read 34 of 35 features (the teammate-model marker landed mid-update); the rebuild with `9befa83826` reads 35 of 35. SessionStart hook chain 4.38 s wall, all exit 0.
- INSTALLED 2026-09-24 from a Claude Code session at the operator's explicit request (parent chain pwsh, claude.exe, VS Code; not inside the app). `-WhatIf` clean. First real run: installer exit code 2, script refused, rc.1 left intact. Second run immediately after: all 19 vault files `same`, "every one of your settings survived", `HARDLINK OK`, `SETUP COMPLETE. Running 0.1.7-rc.2`.
- VERIFIED: one uninstall row `7808434f-469e-5eba-848e-edf64d3b94ce`, `DisplayVersion 0.1.7-rc.2`; 5 processes started 18:53:14; port 19387 answers; `dsh_local_features_check.py` 35 of 35 against the installed `app.asar`; `selectedDefault: standard-hooks` present; new session `session-211cdbee` (18:57) answered, UserPromptSubmit exit 0 (1058 ms) and Stop exit 0 (3522 ms), 10 MCP servers exposed. NOT YET PROVEN: PreToolUse and PostToolUse and a real MCP call on rc.2; the mode picker not seen on screen (since upstream `a44534e274` it shows only with Developer tools on). OPEN_ISSUES 44.
- UNCHANGED: `dsh_update_check.py` still reads the removed seed file (OPEN_ISSUES 42). Playbook refreshed (playbooks `main` `da8b7762aa`); the `ds-harness-update` skill gained ledger rows 37 to 43 in `C:\Claude` (not committed there, loader copy synced).

## 2026-09-24 - 0.1.7-rc.1 INSTALLED AND VERIFIED in the running app

- WHAT SHIPPED: the 0.1.7-rc.1 port (branch `update/v0.1.7-rc.1`, HEAD `e3bed68e71`, pushed). The build worktree moved from `C:\Projects\worktrees\dsh-update-0.1.7-rc.1` to `C:\d17`, because the packaged LibreOffice smoke fails when the build path is too deep (the Windows 260-character limit). Packaging needed Visual Studio 2022 Build Tools (C++ workload) plus a Windows SDK, installed from the current `https://aka.ms/vs/17/release/vs_BuildTools.exe` bootstrapper after winget's catalogued one failed with 5008. Installer `deepseek-harness-0.1.7-rc.1-win-x64-unsigned.exe`, 314,354,720 bytes, sha256 `74de6ccff16bb17188dc2446dbb6c8c5385aac84c5c7f585d3d4a7e8c91bd901`, packaged with the self-test passing (DOCX, XLSX, PPTX to PDF and the skill CLI).
- INSTALLED 2026-09-24 about 13:35 by the operator with `powershell -ExecutionPolicy Bypass -File C:\d17\finish-install.ps1`: `SETUP COMPLETE. Running 0.1.7-rc.1`, exit 0. One uninstall row (`7808434f-469e-5eba-848e-edf64d3b94ce`, `DisplayVersion 0.1.7-rc.1`), 5 processes, the one-time settings migration 7 of 7 sections `IMPORTED` with the home patch `MATCHES`, `AGENTS.md` hardlink OK, and `dsh_local_features_check.py` 34 of 34 read from the installed `app.asar`. Log: `C:\Projects\logs\2026-09-24\dsh-017-port\finish-install-run.log`.
- VERIFIED IN THE RUNNING APP: the operator's session on Claude Opus 5.5 and a headless session on `deepseek-flash` both answered; all 7 MCP servers answered a real call (claude-memory-bridge, claude_design, claude_design_team_account, composio, composio_platform after one transient fetch failure, qbo_sig, playwright listed); 14 of 14 hook invocations exited 0 across SessionStart, UserPromptSubmit, PreToolUse, PostToolUse and Stop. Screenshot `C:\Projects\logs\2026-09-24\dsh-017-port\app-0.1.7.png` shows the "Standard + Claude Code hooks" mode, All Sessions, a stage-mark spinner, the ABC group header with its fold, A to Z folders, the count badge and the usage percentages. This also satisfies OPEN_ISSUES 36(b) (hook bridge firing proof) and 36(c) (`claude_design_team_account` called).
- NOT YET SEEN ON SCREEN: the Session footer (the folder on screen maps to no dashboard) and Ctrl+Shift+A (not pressed, because it archives a real session). OPEN_ISSUES 38.
- FIXED AFTER THE INSTALL, outside the app: 0.1.7 AWAITS SessionStart hooks, and `~\.claude\hooks\work_recall_card.py` took about 60s (427 git calls over 71 receipts), freezing every new session; it now has a 4s budget on that line (backup `_backup-2026-09-24-work_recall_card.py`). Hook commands run with NO session, so the home patch overrides `sandbox-policy` and `approval` together (danger-full-access + never). The operator's mode was restored as a preset row copied from the shipped `standard` list (`C:\d17\dsh-017-restore-mode.py`) and selected via `agent-preset-registry.selectedDefault`; the instruction budget in that mode is 131072 because the 48 KB global `AGENTS.md` was silently dropped in `sig-railway-services`.
- FOUND AT CLOSE-OUT: `dsh_update_check.py` reads the removed `resources\seed\desktop-release.json`, so it prints `installed NOT FOUND`; upstream published `dsh-v0.1.7-rc.2` the same day (not taken). Playbook `DeepSeek Harness` refreshed (playbooks `main`), and the `ds-harness-update` skill rewritten for the 0.1.7 line (not yet committed in `C:\Claude`).

## 2026-09-24 - 0.1.7-rc.1 port: every mod and setting carried, built and gated; packaging blocked on a missing MSVC toolchain

- WHAT THIS IS: the plan "Upgrade DeepSeek Harness from 0.1.5-rc.2 to 0.1.7-rc.1, carrying every setting and mod". Branch `update/v0.1.7-rc.1` on the fork, worktree `C:\Projects\worktrees\dsh-update-0.1.7-rc.1`, HEAD `0c78ccfcef`, pushed. The running app is STILL 0.1.5-rc.2 and was never touched.
- PORTED (not rebased: upstream deleted the layers, see item 35): all 29 tracked features plus four the registry never tracked (plan mode default-active, the quit confirmation, the Files-tab new-session gestures, edit-self-observe). Three port branches (`port/017-conv`, `port/017-side`, `port/017-llm`) merged; typecheck 0, build 0, lint 0, doc-sync 41/42 (the one fail is the doc-site symlink), translation pairing 1120/1120. Vitest over the touched packages: 6844 pass, 31 fail, every one environmental (21 symlink EPERM, 8 desktop 5s timeouts that pass run serially 169/169, one load flake, two harness-environment quirks). All 29 markers found in the built libs. Detail: `C:\Projects\logs\2026-09-24\dsh-017-port\merge-gates.md`.
- SETTINGS MIGRATION (0.1.7 no longer reads `.agent-presets`, imports `settings.yaml` once and renames it, and reads the home `cordis.patch.yml` in the desktop app): `dsh-017-migrate.py` + a rebuilt `finish-install.ps1`. Proven on throwaway homes with the merged build: the web profile imports 7 of 7 settings sections with no entry failing to activate; all 11 MCP servers mount and `memory_search` answers; SessionStart, UserPromptSubmit, PreToolUse, PostToolUse and Stop reach the hook bridge, each exiting 0. Two 0.1.7 traps found and fixed on the way: hook commands run with NO Session so they hit the base sandbox default (every bridge hook exited 1), and widening only that sandbox half made the permission service match no preset and refuse to activate. The home patch now overrides both halves (= the operator's own danger-full-access preset) and the migration refuses to do it for any narrower default.
- DATA SAFETY: 407 of 866 session logs carry the fork's `session/status` events, which 0.1.7's v3->v4 migrator refuses; 32 workspace records carry `group`, which 0.1.7's schema strips. Both are carried in the port. The hook bridge now reads `session.v4` (claude-cowork-config PR #320, merged `60b0ebcf`; 958 v2/v3 sessions byte-identical).
- BLOCKED: `pnpm run package:desktop:win:x64:unsigned` stops at the toolchain preflight, `vswhere.exe` ENOENT. 0.1.7's installer compiles an NSIS UI helper with MSVC `cl`, and this machine has no Visual Studio Build Tools and no Windows SDK. Needs an elevated install by the operator. See NEXT_SESSION_PROMPT.



## 2026-09-20 - the footer live-intent session, closed out: the change is live, and every claim was re-read from the running build

- WHAT THIS SESSION WAS: the 2026-09-19 footer live-intent change (`workspaceLinks`, newest-first, exact-address), its installer, and the plan's last two phases. The plan is COMPLETE: installed and verified live, with the populated footer photographed. That install and photograph are the 2026-09-20 sessions' work and are recorded under `C:\Projects\logs\2026-09-20\dsh-settings-retention\`; the narrative and the 51 -> 52 measurement stay in this session's own 2026-09-19 section below, which nothing here supersedes.
- RE-VERIFIED LIVE THIS SESSION, from the running build rather than from a record: `resources\seed\desktop-release.json` reads `0.1.5-rc.2`; four app processes are up; the running profile's `dsh-api-session-controller\lib\index.js` carries `workspaceLinks` (10) and `dsh-client-ui-conversation\lib\client.js` carries it (1); and THIS Session's own projection-cache row lists `workspaceLinks` among the units the running registry folds (`~\.dsh\storages\session_projcache\sessions\session-d1fe2a05-1d71-434f-98ea-e80b07188da0.json`), which is the live proof that the projection is registered and folding rather than merely compiled in.
- THE STAGE-MARK CAPTURE ITEM 36 LEFT OPEN WAS CLOSED BY ANOTHER SESSION, and this one agrees with it. This session captured the same state independently and measured the same thing: the five visible `All Sessions` rows draw the WORKING glyph and animate (408, 423, 424 and 374 pixels differing between two frames 600ms apart, against 0 of 2880 in two static control regions), evidence in `C:\Projects\logs\2026-09-20\dsh-stage-marks\`. The 2026-09-20 `dsh-stage-icons` session photographed it first and its records are the authority. OPEN_ISSUES 36(a) is therefore stale; 36(b) and 36(c) are not.
- ARCHIVED IN THIS SAVE: OPEN_ISSUES items 28, 32 and 33 came OUT of the list into `state-archive\OPEN_ISSUES_resolved.md`, because the footer they track is live in the installed build and has been photographed.
- STILL OPEN, unchanged: the hook-bridge firing proof (36b) needs a Session STARTED after the 2026-09-20 install, because this Session predates the `standard-hooks` preset and its own prompts cannot fire the bridge (checked this session: the newest `emitted-context` file is still `s.json`, 2026-09-19 18:21:55); `claude_design_team_account` (36c) mounts only in the app; and the icon set still has no artwork for the eight extensions that fall to the plain grey code glyph.
- TOOLING NOTE: this file is over the ~32 KB ceiling and the capper was deliberately NOT run against it, per the harness error ledger rows 21 and 22 (the cap and the reconcile both rewrite this repo's state files even on a no-op dry run, and these files have been damaged four times). Archive the oldest sections by hand instead.

## 2026-09-20 - the sidebar stage marks are PHOTOGRAPHED in the running app: the last visual gap on item 34 is closed

- THE ONE THING ITEM 36 LEFT OPEN FOR THE STAGE MARKS IS DONE. The 2026-09-20 evening session could not get the marks on screen because no Session was in a running, waiting or plan state during any of its captures; this session is mid-turn while it looks, so the running state was on screen for the whole capture. Window capture via `C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`, cropped with `crop_png.ps1` beside it and with this session's `upscale_crop.ps1` for the 6x zoom. Evidence: `C:\Projects\logs\2026-09-20\dsh-stage-icons\` (`app-window-running.png`, `app-window-running-2.png`, `app-window-running-3.png`, `sidebar-band.png`, `sidebar-band-3.png`, `zoom-sidebar-marks.png`, `zoom-sidebar-marks-frame2.png`, `preinstall-sidebar-band.png`).
- WHAT THE CAPTURE SHOWS, read back with my own eyes rather than through the vision sidecar that defeated the previous attempt: every running row in the All Sessions list draws the NEW Working mark (two arcs plus a centre dot) in the ongoing blue, not the old bare dot and not the old `right-up` arrow. Three captures over about two minutes put the arcs at a DIFFERENT ROTATION on every row each time, so the loop is genuinely running rather than a static frame. The same capture also shows the populated footer (`Dashboard: https://portal.theseoitguy.net/core30`, `Design Project: Core 30`), independently confirming item 36's footer claim.
- THE CONTROL THAT MAKES IT A PROOF RATHER THAN A SIGHTING: the pre-install capture of the SAME list at `C:\Projects\logs\2026-09-20\dsh-settings-retention\app-window-3.png` (taken before the install) shows those same rows with NO mark at all, and one of them carrying the OLD amber `right-up` declared-status glyph. Re-cropped here as `preinstall-sidebar-band.png`, it is the same band, the same rows and the same window geometry, so the difference on screen is the build.
- "SIX ROWS RUNNING AT ONCE LOOKED WRONG, AND WAS MEASURED RATHER THAN ASSUMED." Because the mark can only appear when the app reports that Session running, and the phase logic in `tree.ts` is untouched by this change, five or six simultaneous marks were checked against an independent source instead of being reported either as a fault or as fact: SIX distinct Session projection caches under `~\.dsh\storages\session_projcache\sessions\` were written inside a 3.5 minute window (14:22:10 to 14:25:29). This machine really does run that many Sessions concurrently. The third capture 90 seconds later shows the membership already changing (one row gone from the list, the order and the selection moved), which is a live list, not a frozen one.
- STILL OPEN FROM ITEM 36, both small and both needing a Session that is actually doing something: the hook bridge firing proof (send one message in the app and check for a new file under `C:\Claude\integrations\dsh-hook-bridge\state\emitted-context\`), and the `claude_design_team_account` read, which mounts only in the app.

## 2026-09-20 - the session-stage-marks build is INSTALLED and verified live, the populated footer is photographed, and the 1.6 question is settled

The 0.1.5-rc.2 rebuild the previous section left PENDING was run the same day at 13:29 to
13:35 and is proven in the RUNNING app. `finish-install.ps1` from
`C:\Projects\worktrees\dsh-stage-icons` exited 0 and printed `SETUP COMPLETE. Running
0.1.5-rc.2`; the installer reported `expected 272, actual 272 / extra 0, missing 0,
mismatch 0 / PASS: seed integrity clean`; the vault read `20 files, all same` after the
install and the script closed with `HARDLINK OK (final): AGENTS.md and .claude\CLAUDE.md
are one file, 2 links, id 0x000000000000000000050000007ad594.`; the provision log
`provision-2026-09-20T17-30-46-313Z.log` ends `seed integrity verified` / `staged health
check passed` (17:35:45.379Z) / `staging profile activated as 0.1.5-rc.2` /
`applyRelease finished`; four processes start afterwards.

- `dsh_local_features_check.py` reads **27 of 27**, exit 0. The three markers that read
  MISSING before the install (`session-footer-live-read`, `session-stage-marks`,
  `session-status-failed`) are present, and the running profile carries
  `dsw-stage-arc-spin` (3), `deploying` (3) and `IconStageWorkingOutline24` (1).
- An independent 21-file SHA256 fingerprint diff against the pre-install capture is
  EMPTY, which is a measurement rather than the tool's own claim.
- Vault snapshot `a4675b9` (`--reason post-install`) pushed to `dsh-config` `main`.

**The populated Session footer was PHOTOGRAPHED**, the thing owed since 2026-09-16.
Opening the `Pull backlinks in dashboard design code` Session renders `Dashboard:
https://ops.theseoitguy.net/backlinks` and `Design Project: Backlinks`. That address is the
exact route the 2026-09-19 `byAddress` fix was built for, so the photograph confirms the
footer-live-intent work visually too. Files in
`C:\Projects\logs\2026-09-20\dsh-settings-retention\`.

**The sidebar stage marks are NOT photographed, for a measured reason:** no Session in the
app was in a running, waiting or plan state during any capture, so the marks that
distinguish states were not on screen, and at this render scale the glyph column does not
survive the vision sidecar's per-image token cap row by row. One click and one keystroke in
the app closes it.

**The 1.6 question is SETTLED, do not re-derive it.** There is no 1.6 release: the newest
of fifteen upstream releases, ALL prereleases, is `dsh-v0.1.6-alpha.2`. And the ordinary
upgrade path is closed, because that tag deletes the desktop provisioning layer and about
a dozen packages the fork's features live in, so a rebase cannot reach it. Two routes
recorded, operator decision was to stay on 0.1.5-rc.2 and take 0.1.6 as its own project.
Full detail: `OPEN_ISSUES.md` item 35 and the playbook's `05-neotech-fork.md` section 3.

**One record was corrected:** item 35 was reported missing by the session that planned
this work, because it read a primary checkout one commit behind `origin/master`. The item
exists and always did (sync commit `4d173056b7`, 13:14:36). The checkout was fast-forwarded
instead of writing a duplicate.

## 2026-09-20 - the 0.1.6 update is BLOCKED by upstream deletions, so the install target fell back to the proven 0.1.5-rc.2 build

`dsh-v0.1.6-alpha.2` is NOT a version bump and the fork cannot take it by rebasing. Two
layers the fork is built on were deleted upstream, both confirmed by direct reads on the
tag rather than from notes:

- `seed-store.ts`, `provision-log.ts` and ten more files under `apps/desktop/` are GONE,
  replaced by a runtime-tree / update-journal / mandatory-update architecture. All four
  provision milestones (`seed integrity verified`, `staged health check passed`,
  `staging profile activated as`, `applyRelease finished`), `verifySeedIntegrity` and
  `integrity.json` return ZERO files on the tag, so `finish-install.ps1`, which references
  `seed` 21 times, cannot drive it.
- About a dozen packages are GONE: `packages/session-status/*`, `client/ui-sessions-panel`,
  `vision/routing`, `llm/account-usage`, `llm/llm-route-fallback`, `api/pinned-files`,
  `client/ui-sidebar-explorer`, `fs/tool-present`, `code-runtime/*`, `e2b/*`,
  `workflow/workflow-worker-thread`. `derivePhase` does not exist there. These are where
  the fork's features live.

A rebase cannot recover either: the local stack never modified `seed-store.ts` (its log
across `dsh-v0.1.5-rc.2..42db6c8038` is empty), so replaying local diffs can never restore
an upstream deletion. 8 of the 53 local commits were replayed before stopping. The gates
cannot catch a wrong choice here, because either route can typecheck, build and package
while leaving first-run provisioning broken. Operator chose the plan's bounded-effort
fallback: install the proven 0.1.5-rc.2 build. See OPEN_ISSUES 35.

WHAT IS READY TO INSTALL. `C:\Projects\worktrees\dsh-stage-icons` was fast-forwarded one
commit (`fe3a1a3c14..42db6c8038`) so its `finish-install.ps1` carries the new hardlink
guard as well as the 11:55 installer (194,849,563 bytes). The already-built installer is
untouched by that fast-forward, because the script is not part of the app bundle. All three
features missing from the running build are PROVEN inside that installer's packaged seed:
`workspaceLinks` 1, `dsw-stage-arc-spin` 3, `deploying` 12. `dsh_local_features_check.py`
reads 24 of 27 today and must read 27 of 27 after the install.

SETTINGS COVER WIDENED, and the rules file can no longer be silently unlinked. The vault
went from 18 protected files to 20: `dashboard-links.json` and `design-links.json` had no
cover at all and the vault's deny list does not match either. `finish-install.ps1` gained a
hardlink guard so a missing `~\.dsh\AGENTS.md` is re-linked to `~\.claude\CLAUDE.md` BEFORE
any vault restore can create a separate file, asserted after each restore and once at the
end. Identity is compared by FILE ID, never by path string: `fsutil` reports long names
while `$env:TEMP` hands back `C:\Users\STEVED~1\...`, so a string compare false-fails a
good link and here a false failure stops the install. Six test modes pass, including a
shortname regression case for exactly that bug, which was found and fixed before shipping.

TWO TOOLING FIXES, both surfaced by the work above. `C:\Claude\bin\dsh_config_vault.py`
tested `(root/".git").is_dir()`, so it refused a LINKED WORKTREE, where `.git` is a file;
since this machine mandates one worktree per session, the vault could not run in the layout
the rules require. And the shared-checkout guard creates its worktree inside the repo, so
`dsh_config_vault.py`'s `git add -A` would have committed a second copy of the whole vault;
`dsh-config` now ignores `.claude/worktrees/`.

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

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=67af2642-6ee7-4835-a37c-bf1219eca868 at=2026-09-24T21:28:14.235346+00:00
-->
## Last save-state (2026-09-24T21:28:14.235346+00:00)

- Trigger: `handoff`
- Actor: `claude-code:steve`
- Session id: `67af2642-6ee7-4835-a37c-bf1219eca868`
- Repos touched: deepseek-harness (source: transcript scan)
- Plan: (none)
- Transcript: C:\Claude\integrations\dsh-hook-bridge\transcripts\99d3e507-7448-4482-a8c3-fe812524a24b.jsonl

<!-- claude-memory-actor:end -->

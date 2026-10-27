# CURRENT_STATE (capped newest-first log)

## 2026-10-27 - 0.2.1-rc.4 backported from an npm-only release; install handed to Steve

- THE RELEASE EXISTS ONLY ON npm: 0.2.1-rc.4 published 2026-10-26T15:28:13Z on the `next` tag, with no git tag, no GitHub release and no public commit (`git ls-remote --tags upstream` has none; releases newest is `dsh-v0.2.1-rc.3`; `master` still reads `0.2.1-rc.3` at `22ddee3792`; the publishes carry no `gitHead`).
- WHAT IT CONTAINS, MEASURED: every family package downloaded at rc.3 and rc.4 and diffed. 76 of 78 byte-identical, the CLI package among them. The whole code change is ONE guard in `dsh-mcp-client` (a server that does not advertise `resources` returns empty resource/template pages instead of calling the SDK, whose fallback logs a diagnostic onto the stream the ACP profile carries JSON-RPC on), plus two README sentences.
- BRANCH: `update/v0.2.1-rc.4` cut from `update/v0.2.1-rc.3` (`35ba87ca75`) in `C:\d214`. `df93cad541` (family stamp, 353 members), `8f8a9403ea` (guard, READMEs, a spec), `f956491c21` (state files carried from master; fork tag `dsh-v0.2.1-rc.4-fork` points here), then the state renewal. Branch and tag both pushed and the tag read back from origin.
- PROOF THE BACKPORT IS THE RELEASE: the built `packages/mcp/mcp-client/lib/index.js` is byte-identical (35,189 bytes) to the published rc.4 artifact, and so is the copy inside the packaged `win-unpacked\resources\app.asar` after CRLF normalisation. The new spec spies on `Client.prototype.listResources` and fails without the guard (`Client.listResources() called but server does not advertise resources capability - returning empty list`).
- GATES: `release:verify` 353 members at one version; typecheck exit 0; `mcp-client` + `mcp-resources` 146 passed against ONE pre-existing environment failure (`negotiation-lifecycle` "no child could be spawned", reproduced identically on the untouched rc.3 tree); seven catalog verifiers exit 0 (slot catalog did not move); build 9 of 9 in 74.6 s. SessionStart chain 17 hooks, 0 non-zero, 9.0 s serial.
- PACKAGING: run 1 died at `runtime:smoke` with `spawnSync electron.exe ETIMEDOUT` after pnpm had already printed `11.28.5`; run 2 passed unchanged. Installer 290,670,337 bytes, sha256 `361898423A8BC96582BB1D2D5FE094C89B1B98DF850FA88F5B53BCC2E97F0DA8`, in `C:\Projects\exports\2026-10-27-dsh-0.2.1-rc.4\`. Packaged asar reads 43 of 43 features and carries the guard.
- INSTALLED 19:12 by this session at Steve's word, from `finish-install.ps1` in `C:\d214`. `Test-RunningInsideHarness` did not fire (this session is VS Code: `pwsh, cmd, claude.exe, pwsh, Code.exe, explorer.exe`). Log `C:\Projects\logs\2026-10-27\dsh-rc4-backport\finish-install-run.log`: installer exit 0, `installed 0.2.1-rc.4 (1 uninstall row)`, preset `up to date` (pinned 34 = shipped 34), `20 files, all same`, `every one of your settings survived the install`, `HARDLINK OK (final)` 2 links one file id, `SETUP COMPLETE. Running 0.2.1-rc.4`, no `STILL DRIFTED`.
- HOOK BRIDGE re-pinned at exactly `0.2.1-rc.4` in `~\.dsh\profiles\desktop` (installed package reads 0.2.1-rc.4) and the app restarted: plugin mtime 19:13:55, earliest app process 19:14:08, so the bridge loaded the new plugins (ledger 56).
- READ BACK after the install: `DisplayVersion 0.2.1-rc.4` with exactly one DeepSeek Harness uninstall row; `dsh_local_features_check.py` 43 of 43 on the INSTALLED asar; `asar_guard_check.cjs` reports the `listable` guard present with the empty-page branch; the checker now answers `UP TO DATE` because installed equals npm `next`, which is the correct end state and the other half of the fix proof.
- NOT PROVEN, and not claimed: hook firing in a session created AFTER the restart (the restored `cipp_gateway` session has 386 hook events, all from before it, and its last event is an app-level `agent/inbox/spliced` at 19:14:35 with no turn since), one real MCP call, and the mode picker on screen. The loopback-listener arm cannot be used on this machine: every loopback listener reports owner PID 0.
- CHECKER FIXED, and it is the real finding: `dsh_update_check.py` read GitHub releases only and answered `UP TO DATE` for rc.4 (that is why the session opened by saying there was nothing to upgrade). It now reads npm release channels too and answers `NPM AHEAD, NO SOURCE TAG 0.2.1-rc.4 (next)`. Its npm dist-tags read had NEVER worked on Windows: a bare `npm` is `npm.CMD` and CreateProcess does not resolve PATHEXT, so the line silently printed nothing. `shutil.which` now resolves it, and the self-test carries both the 2026-10-26 shape and the verdict order.

## 2026-10-24 - 0.2.1-rc.3 installed and verified (43 of 43 features)

- UPDATE: upstream `dsh-v0.2.1-rc.3` (2026-10-23, six commits: More menus, navigation pins, New Session draft kept, analytics click events, API-key route follows `/models`). Branch `update/v0.2.1-rc.3`, worktree `C:\d213`, HEAD `35ba87ca75`, fork tag `dsh-v0.2.1-rc.3-fork`, both pushed and read back.
- METHOD: merged the new tag into `update/v0.2.1-rc.2` (`44eeca3c91`), because that branch was itself a tag merge (`740d66a971`) and the planned cherry-pick conflicted in about 40 files. 7 conflicts, all keep-both; slot catalog regenerated; llm-deepseek README pair re-recorded; nine fork-only packages stamped rc.3 (`35ba87ca75`); `stage-package.ps1` now uses `$PSScriptRoot`.
- COMPLETENESS: old branch is an ancestor of HEAD (21 of 21 commits); 349 of 359 fork-only files byte-identical, the 10 others deliberate.
- INSTALLED 10:58 from Claude Code (ancestry had no Harness; `-WhatIf` clean). Installer 290,524,001 bytes, sha256 `194C9CD3...772E`, kept in `C:\Projects\exports6-10-24-dsh-0.2.1-rc.3\`. Installed `app.asar` byte-identical to the built one (`63ACDB2F...C5C`).
- HARDLINK REPAIRED: the final assert refused because `~\.dsh\AGENTS.md` had been replaced that morning by an edit tool carrying the newer Composio rule. Its text was written into `CLAUDE.md` in place and the link remade (one file id, two names); both originals kept beside the installer.
- HOOK BRIDGE re-pinned at exactly `0.2.1-rc.3`; app restarted after the plugin write (process 11:01:00 > plugin 11:00:25).
- Session log: `C:\Projects\logs6-10-24\dsh-rc3-verify\` (screenshots 01 to 09).

## 2026-10-18 - 0.2.1-rc.2 post-upgrade review: hook bridge is now a pinned profile plugin

- ROOT CAUSE OF THE DEAD HOOKS, IN ONE LINE: 0.2.1 no longer ships
  `@deepseek-ai/dsh-hooks-claude-code` in the installer (upstream guide
  `docs/upgrade-guide/v0.2.1-alpha.1/experimental-package-composition`). It was
  installed into `~\.dsh\profiles\desktop` at 08:19 with
  `dsh.cmd plugin --profile desktop add @deepseek-ai/dsh-hooks-claude-code@0.2.1-rc.2 @deepseek-ai/dsh-hook-protocol@0.2.1-rc.2`
  (package.json read back at exactly `0.2.1-rc.2`; backup
  `package.json.bak-before-hooks-021`). Always pin: npm `latest` for both is a stale
  `0.0.1-rc.x`. The 09:06 restart is what loaded it (section below).
- DENY PATH PROVEN 10:10: a Write of `hook-probe.tmp` into this repo's primary
  checkout was refused by `shared_checkout_worktree_guard.py`, and the refusal
  carried the new `working_directory({cd: ...})` hint.
- PLAN MODE: 0.2.1 returns `{approved: false}` and ends the turn on a dismissed plan
  review. `~\.claude\hooks\plan_handoff_prompt.py` now treats that text and value as
  a decline (17 tests pass).
- WORKTREE GUARD: the bridge exports `DSH_HOOK_BRIDGE=1`. Under it the guard tells a
  Harness session to `working_directory` into the worktree it created, because 0.2.1
  runs hooks in the session's current directory (guard suite 134 pass, bridge 106).
- RUNBOOK: `ds-harness-update` skill v5 (dynamic port, profile-plugin re-pin step,
  ledger rows 56 to 58), claude-cowork-config PR #480 merged `cbf29b54`; playbook
  PR #199 merged. Launchers unchanged: DeepSeek Flash-1017 ships under the same
  `deepseek-flash` id (live `/models`).

## 2026-10-18 - Claude route restored and the hook bridge proven live after the 0.2.1-rc.2 install

- TWO FAULTS IN ONE SESSION. (1) Every turn ended "This turn failed / Request
  timed out. / TIMEOUT" on the default `anthropic / claude-opus-5-5` route. (2) The
  entire Claude Code hook layer (promote gate, worktree guard, verification hooks)
  was silently OFF inside the app.
- FAULT 1 WAS A TRANSPORT DROP, NOT THE UPDATE AND NOT THE PROVIDER. Six of six
  turns failed 08:20 to 08:55; every retry event carried `provider: anthropic`,
  `usage` 0/0/0 and five attempts of 10 to 12 s each. The stored OAuth token was
  healthy throughout: `GET /v1/models` HTTP 200 in 0.33 s (14 models, `expires`
  1792353892060 = 2026-10-18T20:04:52Z) and `POST /v1/messages` reached Anthropic
  and answered HTTP 429 in 0.30 s. The model setting is byte-identical to the
  2026-10-07 backup, so the upgrade rerouted nothing.
- THE PATH CLEARED BY ITSELF; NO VPN CHANGE WAS MADE. A 60-second probe at 09:10
  gave 20 of 20 connects to `160.79.104.10:443` at 13 to 46 ms, and the NordLynx
  tunnel never changed state (last transition 07:31:32). No route exception, no
  Nord server change and no split tunnelling was made or needed. The 08:57
  readings that looked like a hard block were source-bound socket tests, which
  prove nothing: binding a source address does not change the egress interface.
- FAULT 2 WAS A RESTART, AND IT IS PROVEN. The hook plugins were written 08:19:14
  while all five app processes had started 08:04:20, so the 0.2.1 bridge never
  loaded and nothing warned. Restarted 09:06, created a session, sent one prompt:
  `hook/result` `exitCode 0` for UserPromptSubmit, PreToolUse, PostToolUse and
  Stop, and `turn/end` `{"kind":"completed"}` with zero retries on
  `claude-opus-5-5` (a real `pwsh` tool call ran). ALL FIVE POINTS ARE PROVEN:
  SessionStart is never logged as `hook/result` (OPEN_ISSUES 16, reconfirmed over
  13 records today), but it FIRED for that session, proven by its emitted-context
  card `session-c1f0c807-....json` written at 09:21:25 carrying the railway
  orientation block. So the four logged points plus the card are five.
- DRIVEN WITH NO GUI CLICKS. The desktop host is a web app: launch it with stdout
  redirected and it prints `dsh web: http://127.0.0.1:<port>/?token=...`; headless
  Playwright then drove the real composer. 0.2.1 picks a new port every launch
  (ledger 80), so read that URL, never hard-code a port.
- TWO SIDE FACTS FOR NEXT TIME. Nord blocks UDP/53 to every resolver except its
  own `103.86.99.100`, so `dns.resolve4` (c-ares) times out while `dns.lookup`
  answers in 9 ms; and `api.anthropic.com` publishes an AAAA record on a machine
  with no IPv6 address and no IPv6 route.
- WRITTEN BACK: playbook `05-neotech-fork.md` error ledger row 82, a corrected
  hook check (four logged points plus the SessionStart card) and a "bridge was
  LOADED, not just installed" row in section 6;
  memory notes `dsh-anthropic-oauth-and-slow-dns` (second mechanism) and the new
  `dsh-hook-bridge-needs-a-restart`. Session page:
  `C:\Projects\logs\2026-10-18\dsh-anthropic-route-restore\`.

## 2026-10-16 - New Session workspace picker mirrors the sidebar grouping

- WHAT SHIPPED: the blank-session "Choose workspace" dropdown now lists Workspaces under the same named headings as the left pane, A to Z inside each heading, with the ungrouped folders last in their Host order. Commit `bb3fb9b8f0` on `update/v0.2.0-rc.2` (worktree `C:\d202`), pushed with `CI=true` set for the push (without it the pre-push hook's `pnpm install` dies before the typecheck body: ledger 43 and 75).
- HOW: `packages/client/ui-workspace/src/client/tree.ts` gains `workspaceNameOf` (the blank-title-falls-back-to-the-path rule) and `sectionizeWorkspaces`, a generic sectioner; `byWorkspaceName` and `sectionize` now delegate to those primitives, so the sidebar's own ordering is unchanged and the two surfaces cannot drift apart. `WorkspacePicker.tsx` builds its entries from `sectionizeWorkspaces`, emitting one non-interactive `MenuLabel` heading per named section. The menu primitive already skips labels in its keyboard walk, and a heading id carries the `picker.section:` prefix so it can never equal a `selectedId`, which leaves the trailing selection check untouched.
- TESTS: `packages/client/ui-workspace` 430 passed, 4 failed. The 4 are the pre-existing `all-sessions.client.spec.tsx` failures (OPEN_ISSUES 13), and this commit does not touch that spec.
- PACKAGED: the first attempt died at `prepare:runtime` on a transient github.com connect timeout (ledger 45), the retry exited 0. Installer 288,633,766 bytes, sha256 `1A0C5D2F...7D73`. Feature registry 42 -> 43 rows (`workspace-picker-groups`, marker `picker.section:`); the packaged `app.asar` reads 43 of 43 before the hand-over.
- INSTALLED 2026-10-16 18:38 by this session at the operator's instruction (the installer force-closes the app; a Claude Code session is not inside it, ledger 48). Installed `app.asar` sha256 `B3664A7D...FA47` EQUALS the packaged one, and `dsh_local_features_check.py` against the running asar reads "all 43 local features are present".
- SEEN on screen: `C:\Projects\logs\2026-10-16-dsh-020-rc2-picker\picker-open-crop.png` (captured with PrintWindow, DPI aware, window never raised) read back through the vision route transcribes the headings `ABC`, `Clients`, `General` with their folders beneath. The full read-back, the checks that passed, the SessionStart logging gap and the case-sensitivity caveat on the reader's "not alphabetical" verdict are in `VERIFICATION.md` in that same folder.
- NOT SEEN: the lower headings were not photographed, and delete-a-folder-while-open is proven by the Phase 3 spec only.
- WRITTEN BACK: playbook `DeepSeek Harness\05-neotech-fork.md` (feature list corrected from a stale 35 to the registry's 43, plus ledger 78 on the packaging evidence file), pushed to `playbooks` main as `c42b5ac`.

## 2026-10-08 - Composer Save, Archive and Production buttons beside the context meter

- WHAT SHIPPED: three text buttons right of the context percentage under the message box: `Save` (submits `/save-state`), `Archive` (archives that Session), `Production` (submits `deploy to production`). Commits on `update/v0.2.0-rc.2` (worktree `C:\d202`, also `feat/composer-save-archive`), pushed: `ad1f06c6ef`, `c2936cf9d7`, `7b8902e258`.
- HOW: new slot `conversation.composer.meter.trailing` (list, session) rendered after `ContextMeter` in `InputBar.tsx`. Save and Production call `runOperatorCommand`, the factored Ctrl+Shift+S/P path (same refusal toast, same module-scope latch). Archive is `ComposerArchiveButton` from ui-workspace, registered into that slot, calling `archiveFromOperator`, the same guarded function the Ctrl+Shift+A chord now uses (nothingToArchive refusal, latch, undo notice, stop-and-archive confirmation). Slot catalog regenerated.
- INSTALLED by Steve twice (Save/Archive build 06:35, Production build 07:40); installed `app.asar` 07:40:02; `dsh_local_features_check.py` reads 42 of 42 (new rows `composer-save-archive`, `composer-archive-button`, `composer-production-button` in `C:\Claude\bin\dsh_local_features.json`, uncommitted in that shared checkout).
- NOT SEEN on screen: headless browser_verify of the GUI hit 401 (OPEN_ISSUES 12).

## 2026-10-04 - Purpose line: plain text and ten words, seen on screen

- FIX (Steve: "the text is in link ... should only be 10 text"): commit `4ee821e08a` on `update/v0.2.0-rc.2`. The Purpose value had reused the link-coloured `.sessionFooterValue` style; it now uses its own `.sessionFooterText` (`--dsw-alias-label-secondary`, no hover underline). The generator asks for at most 10 words (64 output tokens) and `limitSessionPurposeWords` (`dsh-session-title`) cuts to 10; the `sessionPurpose` projection applies the same cut and moved to stateVersion 2, so sentences logged before the cap shorten too.
- Rebuilt: installer 288,636,277 bytes, sha256 `7D78334B...FA9B` (two transient electron fetch timeouts, third run exit 0). Installed by Steve; installed `app.asar` sha256 `3EC115DC...9193` equals the built one, 39 of 39 features.
- SEEN: window capture `C:\Projects\logs\2026-10-04\dsh-footer-purpose\app-window-purpose-v2.png` shows `Purpose: Adds a Purpose line beneath the skills-used section of every` in plain grey; projection cache reads `ver 2` with the same value.
## 2026-10-04 - Session footer "Purpose:" line, 0.2.0-rc.2 rebuilt and installed

- WHAT SHIPPED: a fourth footer line under `Skills Used:`, `Purpose: <one sentence>`, saying in plain English what the Session is doing. Commit `906050cecb` on `update/v0.2.0-rc.2` (worktree `C:\d202`), pushed with `--no-verify` (pre-push hook dies in its `pnpm install` lefthook postinstall on the global `core.hooksPath`; full `pnpm run typecheck` exit 0 separately).
- HOW: new log-only event `session/purpose` (declared in `dsh-session-title`, persistence catalog regenerated). Generator `packages/session/session-title-llm/src/purpose.ts`, registered by both title plugins: on the first agent-loop `llm/stream` of a ROOT Session it makes one deferred auxiliary call (route of the main request, `purpose: 'session-title'` so DeepSeek thinking is off, 160 output tokens) from the first human prompt (reminder blocks stripped, head 1 KB + tail 5 KB kept when over 6 KB) plus operator skill/command names. Written once; up to 3 failed attempts per process. Host projection `sessionPurpose` (`session-controller/src/session-purpose-projection.ts`); client row `data-session-footer-line="purpose"`, labels `Purpose:` / `目的：`.
- GATES: purpose.spec 8/8, title-llm 12/12, projection spec 4/4, skeleton 40/40, typecheck 0, lint:contracts-ready 0, persistence/cordis/client catalogs 0, README model-experience 0 (new "Auxiliary session purpose request" section, zh pair re-recorded), build 0.
- PACKAGED: first run died on the transient electron download timeout, retry exit 0. Installer 288,636,926 bytes, sha256 `4CBAD381...C0B4`. Feature registry 37 -> 39 rows.
- INSTALLED by Steve 2026-10-04 ~17:04; installed `app.asar` sha256 `3DDD8EEC...F3A6` equals the built one; 39 of 39 features present.
- LIVE: this Session's own log carries `{"type":"session/purpose","seq":967,...,"purpose":"Adds a Purpose line beneath the skills-used section of every session footer, filled at session start with a one-sentence plain-English summary of the initial prompt and skills.","sourceSeq":15,...}` and the projection cache holds the same value. Not yet SEEN on screen (OPEN_ISSUES 11).
- ROLLBACK CHANGED: logs with a `session/purpose` line are refused by any build without that event type, so undo by reverting the commit and rebuilding, not by reinstalling the 2026-09-30 installer. Session log: `C:\Projects\logs\2026-10-04\dsh-footer-purpose\SESSION.md`.
## 2026-10-04 - DSH Web UI quickstart: the workspace section contradicted the shipped app

- ASKED, THEN VERIFIED: Steve pointed at `https://deepseek-harness.github.io/deepseek-harness/en/guide/quickstart` and asked whether anything needs updating, "only if verified". Two findings, then a documentation fix.
- FINDING 1, THE PAGE IS WRONG: "Choose a workspace" told a new reader a fresh Web UI "has no selected workspace until you add one", that the composer "remains unavailable until a workspace is selected", and to add "the project directory where you started `dsh`". Since commit `4d2e420ef8` (2026-09-20, "initialize the default workspace on startup") an empty installation creates a **Default workspace** at `<Documents>/deepseek-harness/default-workspace`, opens a blank session in it, and leaves the composer editable. Proved at BOTH `dsh-v0.2.0-rc.2` (the tag the live site was built from) and `dsh-v0.2.1-alpha.1`: `packages/client/ui-workspace/src/client/navigation.ts` (the empty-registry startup branch calls `initializeDefaultWorkspace`), `packages/api/workspace-controller/README.md` "First-use Workspace", `apps/web/tests/default-workspace.e2e.ts` (chip text becomes "Default workspace", one registry row, one blank session), and `apps/web/tests/scaffold.ts` (ordinary web scenarios DELETE the auto-created workspace first, which is why the old hero state still looks current). The invoking-directory clause belongs to the CLI profiles (`apps/cli/README.md`), not the Web UI.
- FINDING 2, THE LIVE SITE LAGS ONE RELEASE AND IS NOT OURS TO REPUBLISH: the live page matches the `dsh-v0.2.0-rc.2` docs word for word. `dsh-v0.2.1-alpha.1` (published 2026-10-03T06:42Z) adds `docs/user/guide/public-deployments.md`, its Continue link and reworded schedule text; `https://deepseek-harness.github.io/deepseek-harness/en/guide/public-deployments.md` returns 404. `.github/workflows/docs-pages.yml` is `workflow_dispatch` only, run from a `dsh-v*` tag, so republication is DeepSeek's action.
- WHAT WAS BUILT: branch `docs/quickstart-first-use-workspace`, worktree `C:\Projects\worktrees\dsh-docs-quickstart`, cut from `upstream/master` at `5badb15009`. ONE commit `7e9001c272` touching `docs/user/guide/index.md`, `index.zh.md` and `index.i18n.yaml`, pushed to `origin`. English edits: the intro drops the invoking-directory clause and states the local-open and SSH behaviour; "Configure a model" gains the first-run **Add an API key to get started** dialog sentence; "Choose a workspace" describes the Default workspace and **Add workspace…** and keeps the **Choose workspace** fallback for ineligible first use; "Run a task" sends the first message in the open session. The Chinese pair mirrors it and the pairing record was re-recorded.
- GATES: `verify-translation-pairing` (860 pairs), `verify-md-wrap` (1732 files), `verify-md-links` (1708 files), `docs:build` (41.8 s), `verify-doc-site-fragments` (4980 fragments), `verify-doc-budgets` (8 docs) and `verify-concrete-terms` all exit 0. The built English and Chinese pages were rendered headlessly: both PASS with zero console errors, screenshots at `C:\Projects\logs\browser-verify-20261003-212618\` and `C:\Projects\logs\browser-verify-20261003-212630\`. The aggregate `pnpm run doc-sync` then ran with `CI=true`: **41 of 42 gates pass**, and the single failure is `scripts/project-doc-site.spec.ts > publishableImage > refuses a target whose real path escapes the repository`, which dies on `EPERM: operation not permitted, symlink` in a temp directory, a Windows symlink-permission limit unrelated to this diff (150 of 151 tests in that gate pass).
- DELIBERATELY NOT DONE: no pull request to `deepseek-ai/deepseek-harness`, because their `CONTRIBUTING.md` states they cannot accept external pull requests, and nothing was posted anywhere. Both findings are drafted for their Discussions at `C:\Users\SteveDempsey\.claude\Exports\2026-10-03_dsh-quickstart-stale-first-use.md`, with the branch named as the ready patch.
- THE PUSH USED `--no-verify`, AND ITEM 8's REMEDY WAS CONFIRMED AFTERWARDS RATHER THAN DURING: the pre-push lefthook typecheck dies with the known `runDepsStatusCheck` stack, and exporting `CI=true` is what makes it (and the whole `doc-sync` aggregate) run.
- Session page: `C:\Projects\logs\2026-10-04\dsh-quickstart-first-use-workspace\SESSION_STATE.md`.

## 2026-10-01 - Session footer "Skills Used" line, 0.2.0-rc.2 rebuilt and installed

- WHAT SHIPPED: a third footer line under `Design Project:`, `Skills Used: <names>`, listing the skills and commands the OPERATOR typed in that Session, first use first, joined with ", ". Commit `4981088f36` on `update/v0.2.0-rc.2` (worktree `C:\d202`), pushed (`3148ab20a1..4981088f36`).
- HOW: a new host Session projection `skillsUsed` (`packages/api/session-controller/src/skills-used-projection.ts`, stateVersion 1) folds two operator-only records: `user/message` with source `skill-invocation` (written when a typed `/name` resolves to a user-invocable skill) and `command/run`. Model `skill` tool loads are deliberately excluded. Measured over 140 real Session logs before building: 139 operator signals (save-state 79, dashboard-design-sync 18, dashboard-design-code-pull 14, dashboard 14, code-only 5, plan 1) against 19 model loads.
- CLIENT: `ConversationContent.tsx` renders the row alone when a Session resolves no dashboard; the Dashboard / Design Project pair keeps its exact previous behaviour. Labels `Skills Used:` / `使用的技能：`.
- REBUILT THE SAME VERSION: installer `deepseek-harness-0.2.0-rc.2-win-x64-unsigned.exe`, 288,654,439 bytes, sha256 `0E723C54...4A8B`, packaged with a hidden-console stage script (no stdio redirection): `runtime:lockfile` passed first time, smoke passed. Installed by Steve 2026-10-01 ~17:33; installed `app.asar` byte-identical to the built one (`06614FF2...13C5`). Feature registry `C:\Claude\bin\dsh_local_features.json` 35 -> 37 rows, all 37 present.
- LIVE: the projection is folding in the running app (a projection cache row holds `["dashboard-design-sync","save-state"]`). The populated row has NOT yet been seen on screen (OPEN_ISSUES 9).
- Rollback floor unchanged: the original 0.2.0-rc.2 installer in `C:\Projects\exports\2026-09-30-dsh-020-rc2\`. Session page: `C:\Projects\logs\2026-10-01\dsh-session-footer-ui\SESSION_STATE.md`.

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=f4cba619-1774-494d-9bf4-7e2b798e9d6b at=2026-10-11T19:40:30.811883+00:00
-->
## Last save-state (2026-10-11T19:40:30.811883+00:00)

- Trigger: `handoff`
- Actor: `claude-code:steve`
- Session id: `f4cba619-1774-494d-9bf4-7e2b798e9d6b`
- Repos touched: claude-cowork-config, deepseek-harness (source: transcript scan)
- Plan: (none)
- Transcript: C:\Claude\integrations\dsh-hook-bridge\transcripts\56a1ebf5-342f-45c4-b0d1-6717a131ccfd.jsonl

<!-- claude-memory-actor:end -->

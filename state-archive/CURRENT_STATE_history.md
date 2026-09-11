# CURRENT_STATE - archived history

Auto-archived by state_file_cap.py when CURRENT_STATE.md exceeded 32 KB. Newest-first. On-demand only; not read at session start.

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

## 2026-09-09 - Sessions panel shipped (right-sidebar session overview)

Built the ui-sessions-panel feature package: a right-sidebar Sessions tab that lists every open session regardless of workspace, Active-only by default (running, subagent, awaiting-input and planning first) with an All toggle for idle history. About 20 files under packages/client/ui-sessions-panel, 39 tests at 100% coverage, and an independent phase classifier re-implemented so the plugin never imports another feature plugin at runtime. Wired into the web-app bundle, the cordis patch, the tsconfig client references and the web-app package deps; added the sessions-panel tsconfig path alias, closing the sessions-panel half of OPEN_ISSUES item 9. Also fixed apps/desktop/scripts/prepare-runtime.ts to extract the node runtime with system tar (extract-zip produced an empty extraction on this host) and bumped finish-install.ps1 to 0.1.5-alpha.1. The feature shipped and installed in the 0.1.5-alpha.1 update; Steve confirmed everything runs successfully.

## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

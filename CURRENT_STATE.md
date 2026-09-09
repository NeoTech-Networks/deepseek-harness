<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=8b31ca1f-9374-4224-99ec-58ac5ccd26c9 at=2026-09-08T22:13:30.917398+00:00
-->
## Last save-state (2026-09-08T22:13:30.917398+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `8b31ca1f-9374-4224-99ec-58ac5ccd26c9`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general--\session-02c86dd8-7283-412d-9438-93aa1825e5d7

<!-- claude-memory-actor:end -->

## 2026-09-08 - Live Claude Max usage readout in the composer footer

- New package `packages/llm/account-usage` (`@deepseek-ai/dsh-account-usage`), both faces: a Host `TypertRemoteService` (`ctx.accountUsage.read()`) and a browser dock entry seated on `conversation.composer.dock` beside the stats line.
- Host half reads the stored `llm-pi-ai/anthropic` OAuth grant through `ctx.credentials`, calls `GET https://api.anthropic.com/api/oauth/usage` with `anthropic-beta: oauth-2025-04-20`, and answers a snapshot of whole percentages plus reset instants. It never refreshes the token (that would race pi-ai); an expired grant answers `stale`. No token member exists on the wire type.
- Degraded answers keep the last figures: `stale`, `unauthorized` (401/403), `error` (any other fault), `unsupported` (no grant at all, which renders nothing, so a DeepSeek-only install is untouched).
- Browser half polls every 60s idle / 20s while a turn runs, plus one confirming read 1.5s after a turn settles and one on tab focus. Reads "5h N% - Week N%" with a click-open panel carrying reset times, any scoped weekly window, the month's extra-usage spend, and the degraded note.
- Wired into `packages/bundle/web-app` (dependency + `cordis.patch.yml` entry), new subsystem page `docs/subsystems/account-usage.md` (+ zh + pairing), catalogs regenerated.
- Verified: 27/27 package tests (15 host, 12 client), repo typecheck exit 0, `pnpm build` exit 0, and a live read-back where the service answered 5h 20% / week 20% / 11094 minor units of extra usage in the same second a raw call to the endpoint returned utilization 20 / 20 / used_credits 11094.
- Also repaired to get the tree green: an untracked prior-session package (`ui-sessions-panel`) had a test named without the `.client` suffix (host aggregate then compiled client sources), two strict-null test faults, and an apps/web e2e missing from the host include list; `vision-routing` config fields had no JSDoc.
- No deploy (local desktop app, not a Railway repo). Desktop install and the on-screen check are user-gated.

## 2026-09-09 - Console windows: found the two real sources and shipped both fixes

- Supersedes the 2026-09-08 section below. That fix (CREATE_NO_WINDOW on the ordinary Job launch) was correct but covered only one of three launch layers, and it shipped by patching the extracted profile, which the launcher re-provisions away. The flashing continued.
- Reproduced first, from a windowless parent (pythonw started through WMI so it has no console, like Electron): a bundled `node.exe` with no `windowsHide` produced a visible terminal window (10:19:33), the same launch with `CREATE_NO_WINDOW` produced none, and a restricted-token `pwsh` through the installed `dsh-sandbox-windows-acl` produced two (10:22:09, 10:22:12). Evidence in `C:\Projects\logs\dsh-console-flash\flash-log.txt`.
- Harness fix (branch `fix/hide-windows-consoles`, commits `5e10c7c560` + `bb29402be7`): `windowsHide: true` on the four Node launches that had none (`subprocess-local/src/windows-job.ts` runner, `apps/desktop/src/host-process.ts`, `apps/desktop/src/project-manager.ts`, `packages/sdk/client/src/client.ts`), and `STARTF_USESHOWWINDOW` + `SW_HIDE` on both restricted-token creates in `win32-process/src/process.ts`. Those two must NOT take `CREATE_NO_WINDOW`: such a child dies at DLL init with `STATUS_DLL_INIT_FAILED`, as the sandbox README records.
- Also repaired a stale assertion that still expected the ordinary Job launch without `CREATE_NO_WINDOW` (broken since `7258651450`, never noticed).
- Second source, outside the harness: `C:\Claude\skills\keeper_login_watch.py` runs under `pythonw` from Task Scheduler and shelled out to PowerShell every few seconds with no creation flags, so it flashed a terminal window all day. Fixed with `CREATE_NO_WINDOW` on all three invocations (`C:\Claude` commit `74d1a794`) and the task restarted.
- Verified live after the operator ran `finish-install.ps1`: `windowsHide: true` and `wShowWindow: 0` read back out of the RUNNING profile (`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/`), the restricted-token suite green (122 tests, real confined spawns), win32-process 57/57, typecheck exit 0, lint clean on every touched file. A 4-minute window watch at 12:00 with sessions actively running commands recorded ZERO visible console windows, against a positive control at 11:53:06 that proves the watcher still detects one.
- Known unrelated failures on this machine: two `spawn-runner.spec.ts` cases need the symlink privilege (EPERM), and the repo-wide lint has 207 pre-existing errors in other packages.

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




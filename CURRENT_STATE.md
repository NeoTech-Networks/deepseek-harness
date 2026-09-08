<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=1af9c4e8-f7ce-40d6-8170-dd9119e4caf2 at=2026-09-08T17:47:04.847381+00:00
-->
## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

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


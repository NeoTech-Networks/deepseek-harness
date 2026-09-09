## 2026-09-08 - resolved during session account-usage-footer-readout (remote-mount fix)

Moved out of OPEN_ISSUES.md. Original wording preserved verbatim.

- [was UNVERIFIED, now VERIFIED] Live desktop smoke test of vision-routing auto-vision (added 2026-09-08): attach an image to a DeepSeek Pro or Flash session with the subagent-model-selection setting enabled and the vision model in the allowed list, and confirm the model receives the description instead of "Model does not support image input".
  RESOLVED: on DeepSeek-V4-Flash an attached PNG was replaced with `[Attached image description (vision model): A single solid red circle centered on a plain white background...]` and no raw image placeholder was left behind. Evidence: scratchpad screenshot `vision-textonly.png` for session 1fa89993.

- [was UNVERIFIED, now VERIFIED in part] On-screen check of the Claude Max usage readout (added 2026-09-08): the installer was built and installed at 19:10 and the app relaunched at 19:59 carrying the package in its extracted profile, so only the pixels are unproven. Open a session and confirm the two percentages sit beside the stats line under the composer and that clicking them opens the reset times.
  RESOLVED for the percentages: the composer dock renders `5h 37% - Week 24%` in a live session, and again in a session created after the reinstall. Evidence: scratchpad screenshot `app-booted.png`. The click-to-open reset panel was NOT exercised; it is carried forward as a new item in OPEN_ISSUES.md rather than being silently closed.

## 2026-09-08 - session-status triggers composed into the presets

- RESOLVED: "The save-state 'declare finished' step has no working agent trigger: set_session_status (tool-session-status) is not in the agent tool catalog this session (not composed in the standard preset agent plane) and /status is human-only" - composed `command-session-status` (/status) and `tool-session-status` (set_session_status) into the standard, cordis, and ptc presets (mirroring command-goal / tool-goal); added a shipped-preset completeness test asserting the two rows are composed and not disabled. 93/93 targeted tests pass.

## 2026-09-08 - session creation fixed (standard-hooks preset path)

- RESOLVED: "Session creation fails in the desktop app after launch: the default preset "standard-hooks" fails to mount with "Cannot find package" for roughly twenty built-in host plugins ... not declared as dependencies of @deepseek-ai/dsh-agent-presets, so they are never installed. Fix: declare those plugins as dependencies" - the diagnosis was wrong: all ~23 plugins ARE declared and installed in the packaged profile. The real cause was the `standard-hooks` user preset at `~/.dsh/.agent-presets/standard-hooks/agent.cordis.yml`, whose `cordis:include` path hardcoded the SOURCE repo (`C:/Projects/repos/deepseek-harness/...`) instead of the installed profile. Repointed it at `~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-agent-presets/presets/standard/agent.cordis.yml`; New Session now works (user confirmed).

## 2026-09-08 - dependency gate fix

- RESOLVED: "Session-status work from the prior session is still uncommitted on `deepseek-harness` and still fails `verify-package-dependencies`: missing `@deepseek-ai/dsh-session-status` in `packages/client/connection/package.json` and `@deepseek-ai/dsh-goal` in `packages/client/ui-workspace/package.json`" - added both as workspace:^ devDependencies and refreshed pnpm-lock.yaml; verify-package-dependencies now exits 0.

## 2026-09-08 - open-session-in-subfolder

- RESOLVED: "origin is `deepseek-ai/deepseek-harness` with no push access, so a fork target is needed before it can be pushed" - created the `NeoTech-Networks/deepseek-harness` org fork and pushed `feat/open-session-in-subfolder` and `master` there.
## 2026-09-08 - vision-routing auto-vision smoke test

- RESOLVED: "- [UNVERIFIED] Live desktop smoke test of vision-routing auto-vision (added 2026-09-08): attach an image to a DeepSeek Pro or Flash session with the `subagent-model-selection` setting enabled and the vision model in the allowed list, and confirm the model receives the description instead of "Model does not support image input"" - the fix is shipped and verified end-to-end. The operator attached an image to a DeepSeek Pro session and the model received ONLY `[Attached image description (vision model): ...]` (an accurate reading of the screenshot) with no `[image omitted ...]` placeholder. The feature shipped via `5fee33421f` + `41050689df`; the placeholder drop via `c1a9951d60`.

## 2026-09-08 - plan-mode-default-active

- RESOLVED: "deepseek-harness state-file sync fails: the save-state commit worker pushes to the upstream remote (`deepseek-ai/deepseek-harness`) where `neotechnet` has no write access, so every sync returns 403. The repo's `origin` points at upstream; the writable fork is `neotech` (`NeoTech-Networks/deepseek-harness`). Fix: point the worker's push (or `origin`) at the fork." - verified this session via `git remote -v`: `origin` now points at the `NeoTech-Networks/deepseek-harness` fork and `upstream` at `deepseek-ai/deepseek-harness`, so the worker's push to origin now lands on the writable fork.

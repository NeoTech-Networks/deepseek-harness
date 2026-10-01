# NEXT_SESSION_PROMPT (one current pointer)

The installed app is **0.2.0-rc.2, rebuilt 2026-10-01** in worktree `C:\d202`, branch `update/v0.2.0-rc.2`, HEAD `4981088f36` (the session footer's new `Skills Used:` line). Installed by Steve 2026-10-01 ~17:33; the installed `app.asar` is byte-identical to the built one and all 37 fork features are present. Upstream `dsh-v0.2.0-rc.2` is still the newest release; re-run `python C:\Claude\skills\dsh_update_check.py` (with `PYTHONUTF8=1`) before assuming that.

First thing: close OPEN_ISSUES item 9 by seeing the populated footer line on screen (open a Session that typed a `/skill` or `/command`, then capture with `C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`).

The rest of `OPEN_ISSUES.md` is unchanged and mostly UI-only: the plan-review auto-open seen on screen (upstream's fix now), the mode picker and model menu looked at, the `verify-repository-references` decision on `PORT-0.1.7-FEATURE-MAP.md`, committing the `ds-harness-update` skill trio through a worktree PR, and the accepted absent rc.1 rollback floor.

The next upstream replay must carry `4981088f36`; the two `session-footer-skills-used*` rows in `C:\Claude\bin\dsh_local_features.json` will flag it if dropped. Packaging: launch from a hidden console with NO stdio redirection (`C:\Projects\logs\2026-10-01\dsh-footer-skills\package-stage.ps1` is a working template).

Do NOT re-run `dsh-017-restore-mode.py` (it would revert the deliberate `maxBytes: 131072`).

Session page: `C:\Projects\logs\2026-10-01\dsh-session-footer-ui\SESSION_STATE.md`.

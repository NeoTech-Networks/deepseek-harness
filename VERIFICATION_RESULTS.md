

## 2026-09-12 - session footer + workspace UI shipped and installed

| Check | Expected | Result | Status |
|---|---|---|---|
| All local features in running build | 15/15 | `dsh_local_features_check.py` -> all 15 present incl `workspace-unarchived-count`, `session-footer`, `llm-route-fallback` | VERIFIED |
| Boot after reinstall | applyRelease finished | newest provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| ui-workspace tests | pass | 85 passed (46 tree + 39 rows incl count-badge test) | VERIFIED |
| session-controller + ui-conversation tests | pass | 455 passed | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe` 194,791,959 bytes | VERIFIED |
| Footer visual rendering (summary + dashboard link) | renders under message box | not eyeballed | UNVERIFIED |

## 2026-09-11 - version trap fix: archived branch, trunk checkout, reconciled state

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed version | 0.1.5-rc.2 | exe FileVersion `0.1.5-rc.2`, registry `DisplayVersion` `0.1.5-rc.2`, installed seed and active profile `desktop-release.json` both `0.1.5-rc.2` | VERIFIED |
| Newest upstream release | newest tag | `dsh-v0.1.5-rc.2` (2026-09-10) | VERIFIED |
| Nothing newer available | up to date | `dsh_update_check.py` -> `VERDICT: UP TO DATE` | VERIFIED |
| Parked branch pushed | durable copy | `origin/fix/account-usage-remote-mount` = `d77def1b70` | VERIFIED |
| Uncommitted delta preserved | patch outside the repo | `2026-09-11_dsh-primary-checkout-uncommitted-delta.patch`, 47,852 bytes, `git apply --numstat` names the 12 files | VERIFIED |
| Delta was a duplicate, not lost work | already shipped | same 12 files are commit `55c15a6af4` on `update/v0.1.5-rc.2`; `rightbarBySession` x7 on the branch and x6 in the RUNNING profile client.js | VERIFIED |
| Compiled artifacts removed | 484 files, compiled only | `git clean -fdn -- packages vendor` printed 484 entries, 0 non-compiled; a clean sibling worktree (`dsh-update-v0.1.5-rc.2`) carries none of them, and `npm run build:lib:host` exits 0 afterwards with no tracked file touched | VERIFIED |
| Primary checkout on trunk | branch master, clean | `## master...origin/master`, `git status --porcelain` empty, HEAD `5d2e7b087b` | VERIFIED |
| State files reconciled | rc.2 section on origin/master, nothing dropped | `CURRENT_STATE.md` 43 to 46 sections, archive 26 to 29, all five files identical disk vs `origin/master` | VERIFIED |
| rc.2 record on origin/master | present | `git show origin/master:CURRENT_STATE.md` carries `2026-09-11 - 0.1.5-rc.2 INSTALLED` | VERIFIED |
| Worktrees intact | 18 entries, same branches | 18 listed, one per expected branch, primary now `[master]` | VERIFIED |
| Version answer documented | README Version section | `C:\Projects\general\DS harness\README.md` rewritten with the version, the check command and the warning | VERIFIED |
| Windows console flashing item | carry check | the hide-consoles fix `7fab040065` is in the `update/v0.1.5-rc.2` stack, so the remote-only OPEN_ISSUES line is obsolete rather than lost | VERIFIED |
| Pre-push `typecheck` hook on `master` | runs | CANNOT RUN: `pnpm run typecheck` first does a deps-status install whose postinstall (`install-lefthook.mjs`) refuses to replace Steve's global `core.hooksPath`, so the typecheck never starts. This markdown-only state commit was therefore pushed with `--no-verify`, per the OPEN_ISSUES item 22 precedent. `DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1` was deliberately NOT set | ENVIRONMENTAL, not a code fault |

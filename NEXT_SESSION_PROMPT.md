# Next session prompt

Continue deepseek-harness. THE INSTALL IS DONE AND VERIFIED. The app is running the
2026-09-20 build, all 27 local features are present in the running code, the settings
survived untouched, and the populated Session footer has been photographed at last.
Nothing is broken.

## The three things left, all small and all needing the app

1. **THE SIDEBAR STAGE MARKS photographed.** Not done, and the reason is measured rather
   than assumed: no Session in the app was in a running, waiting or plan state during any
   capture, so the marks that distinguish states were never on screen, and at this render
   scale the glyph column does not survive the vision sidecar's per-image token cap row by
   row. Put a Session into one of those states (start a turn, or leave one parked on a
   question) and capture with
   `C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`, crop with
   `crop_png.ps1` beside it, and read it back through
   `C:\Claude\bin\Ask-DeepSeekVision.ps1`. One row at a time crops best. This closes the
   visual half of OPEN_ISSUES 5.
2. **The hook bridge FIRING proof.** All six MCP rows are declared in the preset and five
   of them answered a cheap read this session, but the bridge's own firing evidence is
   still the 2026-09-19 marker: no DSH Session has started or taken a prompt since the
   install. One message sent in the app writes a new
   `C:\Claude\integrations\dsh-hook-bridge\state\emitted-context\<session>.json`, which is
   the proof that `SessionStart` and `UserPromptSubmit` really fire rather than merely
   load. Check the file's mtime afterwards.
3. **One read that cannot be taken from a Claude Code session:**
   `claude_design_team_account` mounts only in the app, so it was never called. Every
   other MCP server (`claude-memory-bridge`, `composio`, `composio_platform`,
   `claude_design`, `playwright`) answered a read.

## What this session did (2026-09-20, plan `upgrrade-dsh-to-1-6-shimmering-hopper`)

- **INSTALLED and VERIFIED the 0.1.5-rc.2 session-stage-marks build.** `finish-install.ps1`
  exited 0 and printed `SETUP COMPLETE. Running 0.1.5-rc.2`; installer 194,849,563 bytes,
  sha256 `eaa8964f3e44928cb4e6cf1ac0724630f9a07e7ae39c501ad658f4e08cc5267c`; seed integrity
  `expected 272, actual 272 / extra 0, missing 0, mismatch 0`; vault `20 files, no change`
  before and `20 files, all same` after; `HARDLINK OK (final)` with file id
  `0x000000000000000000050000007ad594`. Provision log
  `provision-2026-09-20T17-30-46-313Z.log` ends with all four milestones. Four processes
  started after it. `dsh_local_features_check.py` reads **27 of 27**, exit 0, up from 24.
  The running profile carries `dsw-stage-arc-spin` (3), `deploying` (3) and
  `IconStageWorkingOutline24` (1).
- **An independent 21-file SHA256 fingerprint diff is EMPTY** against the pre-install
  capture. That is a measurement, not the tool's own claim.
- **Vault snapshot `a4675b9`** (`--reason post-install`) pushed to `dsh-config` `main`.
- **THE POPULATED FOOTER IS PHOTOGRAPHED.** Opening `Pull backlinks in dashboard design
  code` renders `Dashboard: https://ops.theseoitguy.net/backlinks` and
  `Design Project: Backlinks` under the message box. That address is the exact route the
  2026-09-19 `byAddress` fix was built for, so the photograph confirms the
  footer-live-intent work visually too. Closes OPEN_ISSUES 28 and 33. Evidence in
  `C:\Projects\logs\2026-09-20\dsh-settings-retention\`.
- **THE 1.6 QUESTION IS SETTLED, do not re-derive it.** There is no 1.6 release: all
  fifteen upstream releases are prereleases and the newest is `dsh-v0.1.6-alpha.2`. The
  ordinary upgrade path is closed too, because that tag deletes the desktop provisioning
  layer and about a dozen packages the fork's features live in, so a rebase cannot reach
  it. Routes and the operator's decision are in the playbook `05-neotech-fork.md` section 3
  and OPEN_ISSUES 35.
- **Two records corrected, one plan premise falsified.** The playbook's version-history row
  for the 2026-09-20 rebuild said `Installed here 2026-09-20` before anything was
  installed; it now carries the true date and the evidence. And the session that planned
  this work reported OPEN_ISSUES 35 as MISSING because it read a primary checkout one
  commit behind `origin/master`; the item exists and always did. No duplicate was written.
  **Fetch before concluding a state file lacks an item.**
- Playbook fourteenth pass pushed: the 1.6 verdict in section 3, error ledger row 41
  (`dsh_update_check.py` says `UPDATE AVAILABLE` for a prerelease because it takes
  `releases[0]` and never filters on `.prerelease`; run live, its last line is
  `VERDICT: UPDATE AVAILABLE dsh-v0.1.6-alpha.2` against `installed 0.1.5-rc.2`), the
  `Last refreshed:` bump, and a new `CHANGES.md` page.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master` at `4d173056b7` (fast-forwarded from
  `224597f999` this session, so OPEN_ISSUES 35 is finally readable there).
- `C:\Projects\worktrees\dsh-state-f9cc4e59` on `wt/state-f9cc4e59` is where this session's
  state sections were written. Do not delete it until they are published.
- `C:\Projects\worktrees\dsh-stage-icons` is the worktree the install was run from, at
  `42db6c8038`. Safe to keep.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` at `42db6c8038`
  and STILL carries five uncommitted state files from an earlier session; do not commit or
  publish them.
- `C:\Projects\worktrees\dsh-update-v0.1.6-alpha.2` is PRESERVED work on the abandoned 0.1.6
  attempt: branch `update/v0.1.6-alpha.2`, 8 replayed commits, resolution scripts at
  `C:\Projects\temp\dsh_resolve.py`, ordered SHA list at `C:\Projects\temp\dsh-replay-shas.txt`.
  KEEP IT: the 1.6 question is settled as "its own project", not as "cancel".
- `C:\Projects\worktrees\dsh-footer-intent` holds the known-good OLDER installer
  (194,901,646 bytes) and is the rollback for what is running now.
- `~\.dsh\desktop\rollback` must NEVER be deleted; the app renames it back itself.

## Still open elsewhere, carried forward and NOT re-verified this session

- Pre-existing gate findings, all reproduced on the untouched base: `verify-client-ui-i18n`
  2 (`ui-sidebar-explorer`), oxlint repo-wide 52 errors, `verify-module-graph` and
  `verify-doc-graphs` stale.
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with Developer
  Mode off. 13 fs-local tests fail on the old line for the same environmental reason.
- OPEN_ISSUES 16, 16b, 16-root-cause: the state-file loss loop and the never-merging
  state-sync PR are untouched. NOTE: a PostToolUse hook auto-archived the two oldest
  VERIFICATION_RESULTS sections into `state-archive/` during this session's edit, which is
  the intended behaviour and lost nothing, but it is worth knowing the hook fires on a
  plain Edit of that file.
- The estate checkout `C:\Projects\repos\vercel-services` is behind `origin/main`.
- NEW, cosmetic: `dsh_update_check.py` also raises a `UnicodeDecodeError` in a reader
  thread (`cp1252` decoding git output) while still printing a verdict. Not investigated.

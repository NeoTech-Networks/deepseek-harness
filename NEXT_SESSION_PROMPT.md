# Next session prompt

Continue deepseek-harness. **The 0.1.5-rc.2 update is DONE and installed.** The
running app is 0.1.5-rc.2 and every verification row a file read can settle is
green (see the top table of `VERIFICATION_RESULTS.md`). Nothing about the update
needs picking up.

## What changed for you

- Composer shortcuts moved off Alt to **Ctrl+Shift+S** (`/save-state`) and
  **Ctrl+Shift+P** (the promote phrase). One press sends one message. This is the
  first build where they are actually installed.
- The fork-local vision router no longer names the retired
  `deepseek-v4-flash-vision-exp`; it defaults to `deepseek-flash`.
- Packaging settings are recorded in-repo at `apps/desktop/PACKAGING.md`, and every
  package version reads 0.1.5-rc.2.

## Two things still need STEVE'S EYES, not another file read

1. Press Ctrl+Shift+S and Ctrl+Shift+P in the installed app and confirm each sends
   exactly ONE message and does not open the native menu bar. The code is proven in
   the running profile; only the keystroke is unproven.
2. Collapse then re-expand the 56px sidebar rail and confirm the All Sessions
   section comes back without a restart. This is OPEN_ISSUES 27 and it is the one
   known live defect.

## Then, in priority order

- **Item 27, the All Sessions rail defect.** Two candidate causes are ELIMINATED by
  passing tests added on 2026-09-11 (the shell `wide` flag does not latch, and the
  slot registry does re-register after a declaration collapse and return). Do not
  re-add those tests and do not guess at a fix. Reproduce it in the REAL client
  first, then write the failing test. The surviving candidate is the persisted fold
  store `dsh.workspace.allSessions.v1`, whose `expanded` default is `true`.
- **Item 26 / item 16: the state-file destruction engine.** It fired a FOURTH time
  on 2026-09-11, mid-session, under a save-state run from another session, and took
  the newest section of `CURRENT_STATE.md` with it. Before and after ANY state-file
  edit, compare section and line counts against `git show origin/master:<file>`.
  Publish through `state_file_reconcile.py`, but note its dry run currently reports
  "+0 recovered" on every log, which is the exact condition under which item 16b says
  it misorders a table ledger, so treat it as dry-run-only here.
  **Do NOT run `state_file_cap.py --repo` against this repo (item 25).**
- **The fs-local baseline is environmental.** 13 symlink tests fail on any shell
  without symlink privilege. Developer Mode is currently OFF on this machine
  (`AppModelUnlock` absent) and the shell is not elevated; enabling Developer Mode is
  what restores the clean 156/0 run.
- **Items 1, 2, 5, 10: the CODE is proven live, the ON-SCREEN behaviour is not.**
  These need Steve's eyes, not another file read.
- **Item 23: `image_block_guard.py` still denies an image Read on any DeepSeek
  session.** `deepseek-flash` genuinely reads images now, but the guard keys on the
  backend host and `deepseek-v4-pro` really is text-only, so the deny is correct until
  the guard resolves the session MODEL id. Machine-wide enforcement layer with tests.
- **Item 19: 16 tool results lost on 2026-09-08, cause still unattributed.**
- **Item 18: re-run `C:\Claude\bin\dsh_session_audit.mjs` after a full day of use.**

## Traps that cost real time, so they are not rediscovered

1. "It crashed" after an install is the install WORKING. `finish-install.ps1` step 1
   is `taskkill /F`, so Windows and any session inside the app report a crash. Judge an
   install by the seed-integrity assertion and the post-install read-back, nothing else.
2. First-run setup shows NO WINDOW for about four minutes. Do not re-run the script
   because the app "looks stuck"; it waits and prints a completion line.
3. The 17 failures in the touched suites (13 fs-local symlink, 3 ui-sidebar snapshots,
   1 packed PDF license) are ENVIRONMENTAL and PRE-EXISTING. They are identical on the
   shipped rc.1 line and on rc.2.
4. The `ds-harness-update` skill exists twice. `C:\Claude\skills\ds-harness-update.skill.md`
   is the authority; the `.agents\skills\ds-harness-update\SKILL.md` copy is what the
   desktop app LOADS, and it went stale once, handing out a wrong app id. Both are
   hash-identical as of 2026-09-11; re-sync them after any edit.
5. `apps/desktop/.env.example` cannot be committed: the pre-commit hook refuses that
   filename. The packaging environment lives in `apps/desktop/PACKAGING.md`.
6. A vitest path filter is a SUBSTRING match, so `packages/client/ui-sidebar` also runs
   `ui-sidebar-documentpreview`. Pass explicit test-directory paths when it matters.

The playbook at `C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` carries
the version history and its error ledger.

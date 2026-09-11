Continue deepseek-harness. 0.1.5-rc.2 IS INSTALLED AND RUNNING (installed 2026-09-11 09:47, profile re-extracted 09:51, four processes from 10:45). The composer-shortcut question is CLOSED and must not be re-diagnosed: the chord moved off Alt to Ctrl+Shift in rc.2 and nothing told the operator, which is why his Alt presses did nothing. Ctrl+Shift+S was verified by a real press plus a session-log read-back (`/save-state` at 2026-09-11T15:14:25.963Z, session e0b8a4a0). On Windows an Alt+letter chord arrives as a KEYUP only, so an unbound Alt chord is silent by nature.

FOUR THINGS THE NEXT SESSION NEEDS THAT ARE NEW (all in OPEN_ISSUES.md):

- Item 21: a GLOBAL AutoHotkey script (`C:\Claude\bin\global-hotkeys.ahk`, PID in the several-thousands, from Startup) owns Alt+S / Alt+P and types the two command strings into whatever window has focus, in every app. It can reach the Harness renderer (measured), but the operator still saw nothing. RECOMMENDED, and his decision: scope it to the Harness window and have it send the app's own chord (`#HotIf WinActive("ahk_exe DeepSeek Harness.exe")` / `!s:: Send "^+s"` / `!p:: Send "^+p"`). If that is done, drop the Alt nudge added in `016d1048c2` or it will toast on every Alt press.
- Item 24: `deepseek-harness-0.1.5-rc.2-win-x64.exe` (194,745,776 bytes, from `016d1048c2`) is BUILT AND NOT INSTALLED. It is not a repair; it carries four guards against silent failure plus the chord on the send tooltip. The operator elected to skip it. The commit is on `update/v0.1.5-rc.2`, so the next upstream update replays it anyway.
- Items 22 and 23: the two shared keyboard instruments are BROKEN and were found broken this session. `run-probe.ps1` cannot pass its positive control with `-WithMenu 1` (its focus Alt tap activates the menu and the bare `X` is eaten, so it exits 3); `count-submits.mjs` cannot connect a workspace on rc.2 and has never passed. Fix both before trusting either again. Read `C:\Claude\bin\dsh-alt-chord-probe\README.md` first.
- Item 25: state files are STILL diverged between checkouts (this worktree 09-09, primary 09-11, and a state PR for the primary merged at 15:42Z as #19). This save deliberately did NOT dispatch the worker for the worktree, because a stale base applied onto the newer master can conflict or revert. Settle item 16-root-cause before any per-session worktree publishes state.

TWO GUARDS, RUN AFTER EVERY INSTALL:

  py C:\Claude\bin\dsh_local_features_check.py     # 12 local fork features, exit 0 (note: C:\Claude\bin, NOT C:\Claude\skills)
  py C:\Claude\bin\dsh_config_vault.py verify      # 18 protected ~/.dsh files, exit 0

TWO THINGS TO KNOW BEFORE DIAGNOSING ANYTHING:

  1. "It crashed" after an install is the install WORKING: finish-install.ps1 step 1 is a taskkill /F, the only way to close this app. Whether an install worked is decided by the seed-integrity assertion and the post-install read-back, never by that message.
  2. State files can still be destroyed by a stale copy published over the primary. Compare the line count against `git show origin/master:<file>` before and after any state-file edit, and never run `state_file_cap.py --repo` or `state_file_reconcile.py --apply` against this repo (OPEN_ISSUES 16b, dry-run only).

WHAT IS ACTUALLY LEFT, in priority order: item 21 and item 24 (both operator decisions), items 22 and 23 (tooling), item 16 and 16-root-cause (state-file publishing), then the on-screen checks that still need eyes (2b, 1, 5, 10) and item 13 (record the packaging settings).

Full list in OPEN_ISSUES.md. The playbook at `C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` carries the Alt-chord finding as error-ledger row 0 and the rc.2 install row.

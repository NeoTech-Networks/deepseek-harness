Continue deepseek-harness. 0.1.5-alpha.2 IS BUILT AND PACKAGED BUT NOT INSTALLED. Branch update/v0.1.5-alpha.2 in worktree C:/Projects/worktrees/dsh-update-v0.1.5-alpha.2 (pushed to the fork) carries the local stack rebased onto dsh-v0.1.5-alpha.2 plus four fixes that had never shipped: session-status icons e5146450e3, first-run provisioning f82bb8df30 and f291778191, console-window suppression 5e10c7c560. Gates all green: typecheck 0, build 0, plan-mode 94/94, fs-local 156 passed 0 failed, 594 targeted tests, packaging 0. Installer deepseek-harness-0.1.5-alpha.2-win-x64.exe, 194,655,398 bytes, app id com.deepseek.harness. SessionPanelPhase was read back out of the packaged .tgz, so the fix is in the artifact. DO NOT rebuild, re-rebase or re-package.

THE ONE THING LEFT IS THE OPERATOR'S INSTALL:

  powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-update-v0.1.5-alpha.2\finish-install.ps1"

Then verify the six rows (installed version from resources\seed\desktop-release.json, profile re-extracted under ~\.dsh\profiles\desktop, the new code read out of the RUNNING profile, a clean `web boot:` line with ELECTRON_ENABLE_LOGGING=1, four or more processes started after the install, and a working session), then re-run python C:\Claude\skills\dsh_update_check.py and require UP TO DATE.

TWO THINGS TO KNOW BEFORE YOU DIAGNOSE ANYTHING:

  1. "It crashed" after an install is the install WORKING. finish-install.ps1 step 1 is taskkill /F, the only way to close this app, so Windows and any session inside it report a crash. Whether an install worked is decided by the seed-integrity assertion and the post-install read-back, never by that message.

  2. STATE FILES ARE STILL BEING DESTROYED, twice more on 2026-09-09 (11:56 and 12:31 local, recovered both times from git, damaged copies in %TEMP%). The save-state writer is now RULED OUT: apply_marker_block in memory_save_state_actor.py was re-read at lines 1030-1079 and has no branch that can shorten a file. Something publishes a stale copy over the primary. Of the 10 checkouts holding CURRENT_STATE.md, 8 carry short stale copies. Finding that publisher (the git maintenance worker and /save-state are the candidates) is now the top open item, 16. BEFORE AND AFTER any state-file edit, compare the line count against `git show origin/master:<file>`.

WHAT IS ACTUALLY LEFT, in priority order:
  - The install above, then the six verification rows.
  - Item 16: identify and stop whatever publishes a stale state file over the primary, or route every publish through C:\Claude\bin\state_file_reconcile.py, which unions rather than replaces.
  - Items 1, 2, 5, 10: the CODE is proven present; the ON-SCREEN behaviour (workspace group headers, Alt+S / Alt+P and the sidebar default, session status icons, the plan-mode pulse and the save-state Finished check) still needs Steve's eyes.
  - Item 18: re-run C:\Claude\bin\dsh_session_audit.mjs after a day of real use.
  - Item 19: 16 tool results lost in two bursts on 2026-09-08, cause unattributed.
  - Item 8: DeepSeek vision needs a GUI image ATTACH; read_image on a path is not the test.
  - Item 13: record DSH_DESKTOP_APP_ID (com.deepseek.harness) and DOWNLOAD_TEST_ORIGIN (https://download.neotech.biz) in apps/desktop/README.md or a checked-in .env.example.

Full list in OPEN_ISSUES.md. The playbook at C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md is current as of this session and carries a 20-row error ledger.

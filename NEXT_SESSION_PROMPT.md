Continue deepseek-harness. 0.1.5-alpha.2 IS INSTALLED AND RUNNING (installed 2026-09-09 14:29, profile re-extracted 14:34). The Alt+S / Alt+P shortcut work is CLOSED: root cause was that Electron on Windows never delivers the KEYDOWN of an Alt+letter chord to the renderer, only a keyup carrying altKey, so the binding moved to keyup (commit aca41e5f7b). Proven three ways: real OS keystrokes into a real Electron window, the keyup binding read back out of the RUNNING profile, and Steve pressing Alt+S in the installed app. DO NOT re-diagnose it; the evidence is in VERIFICATION_RESULTS.md and OPEN_ISSUES item 2, and the reusable instrument is C:\Claude\bin\dsh-alt-chord-probe\ (read its README before measuring any keyboard behaviour in this app).

TWO GUARDS NOW EXIST AND MUST BE RUN AFTER EVERY INSTALL:

  py C:\Claude\bin\dsh_local_features_check.py     # 10 of 10 local fork features, exit 0
  py C:\Claude\bin\dsh_config_vault.py verify      # 18 protected ~/.dsh files, exit 0

Both returned exit 0 after this install. finish-install.ps1 now snapshots the settings before installing and verifies after. Add a row to C:\Claude\bin\dsh_local_features.json whenever a new local feature ships, otherwise a future rebase can drop it silently and the app will look perfectly healthy.

TWO THINGS TO KNOW BEFORE YOU DIAGNOSE ANYTHING:

  1. "It crashed" after an install is the install WORKING. finish-install.ps1 step 1 is taskkill /F, the only way to close this app, so Windows and any session inside it report a crash. Whether an install worked is decided by the seed-integrity assertion and the post-install read-back, never by that message.

  2. STATE FILES ARE STILL BEING DESTROYED, twice on 2026-09-09 (11:56 and 12:31 local, recovered both times from git, damaged copies in %TEMP%). The save-state writer is RULED OUT: apply_marker_block in memory_save_state_actor.py has no branch that can shorten a file. Something publishes a stale copy over the primary. Of the 10 checkouts holding CURRENT_STATE.md, 8 carry short stale copies. Finding that publisher (the git maintenance worker and /save-state are the candidates) is the top open item, 16. BEFORE AND AFTER any state-file edit, compare the line count against `git show origin/master:<file>`.

WHAT IS ACTUALLY LEFT, in priority order:
  - Item 16: identify and stop whatever publishes a stale state file over the primary, or route every publish through C:\Claude\bin\state_file_reconcile.py, which unions rather than replaces.
  - Item 16-root-cause: no state-sync PR can ever merge on this fork, because two inherited upstream workflows call create-github-app-token against owner deepseek-harness. That is a decision for Steve, not housekeeping.
  - Items 2b, 1, 5, 10: on-screen behaviour still needing eyes (right sidebar hidden by default, workspace group headers, session status icons, the plan-mode pulse and the save-state Finished check).
  - Item 18: re-run C:\Claude\bin\dsh_session_audit.mjs after a day of real use.
  - Item 19: 16 tool results lost in two bursts on 2026-09-08, cause unattributed.
  - Item 8: DeepSeek vision needs a GUI image ATTACH; read_image on a path is not the test.
  - Item 13: record DSH_DESKTOP_APP_ID (com.deepseek.harness) and DOWNLOAD_TEST_ORIGIN (https://download.neotech.biz) in apps/desktop/README.md or a checked-in .env.example.

Full list in OPEN_ISSUES.md. The playbook at C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md is current and carries the Alt-chord finding as error-ledger row 0.

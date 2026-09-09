Continue deepseek-harness in worktree C:\Projects\worktrees\dsh-update-v0.1.5-alpha.2 (branch update/v0.1.5-alpha.2).

THE RIGHT-SIDEBAR PER-SESSION WIDTH FIX IS LIVE. It was ported from the uncommitted pre-0.1.5 change onto update/v0.1.5-alpha.2, committed bf27396cf6, pushed, built, packaged (194,643,720 bytes) and installed by Steve at 19:13 via INSTALL.cmd. Verified in the running profile: dsh-client-ui-layout/lib/client.js carries rightbarBySession (6 occurrences), the old single rightbar value is gone, seed integrity 271/271 PASS, dsh-config-vault 18 files all same. Do not redo the port, build or install.

ONE THING LEFT, AND IT IS STEVE'S EYES, NOT A FILE READ: resize the right sidebar in one session, switch to a second session, and confirm the widths stay independent. If they do, the per-session-width item is fully closed.

TWO GUARDS STILL APPLY AFTER ANY INSTALL:

  py C:\Claude\bin\dsh_local_features_check.py
  py C:\Claude\bin\dsh_config_vault.py verify

TWO THINGS TO KNOW BEFORE YOU DIAGNOSE ANYTHING:

  1. "It crashed" after an install is the install WORKING (finish-install.ps1 step 1 is taskkill /F). Decide success by the seed-integrity assertion and the post-install read-back, never that message.

  2. STATE FILES ARE STILL BEING DESTROYED on this fork. The save-state writer is RULED OUT; the mechanism is a stale worktree copy published over the primary (item 16). BEFORE AND AFTER any state-file edit, compare the line count against git show origin/master:<file>. Also note the install now goes through INSTALL.cmd (double-click wrapper that keeps the window open and writes install-log.txt), because the pasted PowerShell one-liner fails silently.

WHAT IS ACTUALLY LEFT, in priority order:
  - Item 16: identify and stop whatever publishes a stale state file over the primary, or route every publish through C:\Claude\bin\state_file_reconcile.py.
  - Item 16-root-cause: no state-sync PR can merge on this fork (two inherited upstream workflows call create-github-app-token against owner deepseek-harness). Decision for Steve, not housekeeping.
  - Items 2b, 1, 5, 10: on-screen behaviour still needing eyes (right sidebar hidden by default, workspace group headers, session status icons, the plan-mode pulse and the save-state Finished check).
  - Item 18: re-run C:\Claude\bin\dsh_session_audit.mjs after a day of real use.
  - Item 19: 16 tool results lost in two bursts on 2026-09-08, cause unattributed.
  - Item 8: DeepSeek vision needs a GUI image ATTACH; read_image on a path is not the test.
  - Item 13: record DSH_DESKTOP_APP_ID (com.deepseek.harness) and DOWNLOAD_TEST_ORIGIN (https://download.neotech.biz) in apps/desktop/README.md or a checked-in .env.example.

Full list in OPEN_ISSUES.md. The playbook at C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md is current.

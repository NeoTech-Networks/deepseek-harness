# Next session prompt

Continue deepseek-harness. **The running app is 0.1.5-rc.1, not 0.1.5-alpha.2.**
The `dsh-config` manifest and this file's earlier revision both had it wrong.
Live reads on 2026-09-11: the Windows uninstall entry reports `0.1.5-rc.1`, the
exe `FileVersion` is `0.1.5-rc.1`, `~/.dsh/profiles/desktop/desktop-release.json`
says `0.1.5-rc.1`, and every `@deepseek-ai/dsh-*` pack in `desktop-packages.json`
is `0.1.5-rc.1`. Trust those over any written record. Upstream is at
`dsh-v0.1.5-rc.2`, which is feedback-dialog and file-card polish only, so there
is nothing model-related waiting in a rebuild.

**rc.1 already supports DeepSeek V4.1-Flash.** The installed
`deepseek-ai-dsh-llm-deepseek-0.1.5-rc.1.tgz` carries the `deepseek-flash`
catalogue entry with image modality and `systemPromptUpdate: in-history`, and the
fork branch `update/v0.1.5-rc.1` matches upstream `dsh-v0.1.5-rc.1` on that file.
DeepSeek released V4.1-Flash on 2026-09-10 and retired V4-Flash and
V4-Flash-Vision-Exp; `GET api.deepseek.com/models` now returns exactly
`deepseek-flash` and `deepseek-v4-pro`. The default session model here is already
`deepseek-flash`.

TWO THINGS TO KNOW BEFORE YOU DIAGNOSE ANYTHING:

  1. "It crashed" after an install is the install WORKING. `finish-install.ps1`
     step 1 is `taskkill /F`, the only way to close this app, so Windows and any
     session inside it report a crash. It was mistaken for a failed install once
     already, after an install that had fully succeeded. Whether an install
     worked is decided by the seed-integrity assertion and the post-install
     read-back, never by that message.

  2. STATE FILES ARE STILL BEING DESTROYED, and it happened a THIRD time on
     2026-09-11. `CURRENT_STATE.md` was found in the primary checkout at 38 lines
     holding nothing but stacked save-state marker blocks, against 728 in
     `origin/master`; `VERIFICATION_RESULTS.md` was 148 lines short of
     `origin/master` in the same checkout. Both were restored FROM
     `origin/master`, not from HEAD, because HEAD itself is only 287 lines now.
     Damaged copies are in `%TEMP%` as
     `deepseek-harness-CURRENT_STATE.damaged-2026-09-11.md` and
     `deepseek-harness-VERIFICATION_RESULTS.damaged-2026-09-11.md`. This is
     OPEN_ISSUES item 16, and its engine is item `16-root-cause`: the status-sync
     PR can never merge because two inherited upstream workflows fail on this
     fork. BEFORE AND AFTER any state-file edit, compare the line count against
     `git show origin/master:<file>`, and prefer publishing through
     `C:\Claude\bin\state_file_reconcile.py`.

WHAT IS ACTUALLY LEFT, in priority order:

  - Item 16 / 16-root-cause: stop worktree-based state publishing, and settle the
    two inherited workflows that prevent the status-sync PR from ever merging.
    This is the one that keeps costing real history.
  - Item 15: concurrent sessions still share the primary checkout and write to
    each other's work.
  - Item 21: the right-sidebar per-session width fix (11 files, 220 tests,
    client typecheck clean) is uncommitted in the primary checkout on
    `fix/account-usage-remote-mount`. Commit it on the right branch, build and
    install through the `ds-harness-update` flow, then smoke-test it on screen.
  - Items 1, 2, 5, 10: the CODE is proven live; what is unproven is the ON-SCREEN
    behaviour. These need Steve's eyes, not another file read.
  - Item 8: DeepSeek vision still needs a GUI image ATTACH. `read_image` on a
    path is not the test. Note the refinement found on 2026-09-11: the model CAN
    now see (`deepseek-flash` returned "Red" for a 1x1 red PNG on the
    Anthropic-format route), but `image_block_guard.py` still denies the Read
    because it keys on the backend host. See item 23.
  - Item 23: make `image_block_guard.py` model-aware so a `deepseek-flash`
    session can Read an image. Documented rather than changed, because it is a
    machine-wide enforcement layer with tests.
  - Item 24: the fork-local `vision-routing` default still names the retired
    `deepseek-v4-flash-vision-exp`. No live impact; fold into the next rebuild.
  - Item 18: re-run `C:\Claude\bin\dsh_session_audit.mjs` after a full day of
    real use.
  - Item 19: 16 tool results lost on 2026-09-08, cause still unattributed.
  - Item 13: record `DSH_DESKTOP_APP_ID` (com.deepseek.harness) and
    `DOWNLOAD_TEST_ORIGIN` (https://download.neotech.biz) in
    `apps/desktop/README.md` or a checked-in `.env.example`.

Full list in `OPEN_ISSUES.md`. The working tree is on
`fix/account-usage-remote-mount` and carries uncommitted client work; do not
switch branches in it without checking item 15 first. The playbook at
`C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` carries the
error ledger.

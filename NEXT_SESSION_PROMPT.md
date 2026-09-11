# Next session prompt

Continue deepseek-harness. **The install of 0.1.5-rc.2 is the one thing left of the
2026-09-11 update, and it is Steve's step, not a session's.**

## What is where, as of 2026-09-11

- **Running app: 0.1.5-rc.1.** Live reads then: the Windows uninstall entry, the exe
  `FileVersion`, `~/.dsh/profiles/desktop/desktop-release.json` and every
  `@deepseek-ai/dsh-*` pack all read `0.1.5-rc.1`. Trust those over any written record;
  the manifest and the state files both said `0.1.5-alpha.2` for a day.
- **Built and packaged, NOT installed: 0.1.5-rc.2.**
  Worktree `C:/Projects/worktrees/dsh-update-v0.1.5-rc.2`, branch
  `update/v0.1.5-rc.2` (pushed, 31 commits ahead of the `dsh-v0.1.5-rc.2` tag).
  Installer `apps/desktop/.desktop-build/targets/win-x64/artifacts/deepseek-harness-0.1.5-rc.2-win-x64.exe`,
  194,762,388 bytes, built with `DSH_DESKTOP_APP_ID=com.deepseek.harness`.
  Install line for Steve, in a NEW PowerShell window:
  `powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-update-v0.1.5-rc.2\finish-install.ps1"`

## The moment the install is confirmed

Run the `ds-harness-update` skill's Step 7 table: seed version `0.1.5-rc.2`, exactly
ONE uninstall entry (key `7808434f-469e-5eba-848e-edf64d3b94ce`, so it upgraded in
place rather than installing a parallel copy), profile re-extracted,
`dsh_local_features_check.py` exit 0 with 12 of 12, `dsh_config_vault.py verify`
exit 0, the `web boot:` line clean, 4+ processes, a session that answers, Ctrl+Shift+S
and Ctrl+Shift+P each sending exactly one message with no menu bar opening, and the
All Sessions section surviving a rail round-trip on screen.

Then bump `app_version` to `0.1.5-rc.2` in `C:\Projects\repos\dsh-config\MANIFEST.json`
and re-snapshot. Deliberately NOT bumped yet: that manifest records the version the
machine is actually running.

## Then, in priority order

- **Item 27, the All Sessions rail defect, is still unexplained.** Two causes are now
  ELIMINATED by passing tests added on 2026-09-11 (the shell `wide` flag, and slot
  re-registration after a declaration collapse). Do not re-add those tests and do not
  guess at a fix: reproduce it in the REAL client first, then write the failing test.
  The surviving candidate is the persisted fold store `dsh.workspace.allSessions.v1`.
- **Item 26 / item 16: the state-file destruction engine.** It fired a FOURTH time on
  2026-09-11, mid-session, under a save-state run from another session, and it took the
  newest section of `CURRENT_STATE.md` with it. The file was restored from HEAD. Before
  and after ANY state-file edit, compare section and line counts against
  `git show origin/master:<file>`. Publish through `state_file_reconcile.py`.
  **Do NOT run `state_file_cap.py --repo` against this repo (item 25): it evicts and
  reorders sections.**
- **Items 1, 2, 5, 10: the CODE is proven live, the ON-SCREEN behaviour is not.** These
  need Steve's eyes, not another file read.
- **Item 23: `image_block_guard.py` still denies an image Read on any DeepSeek session.**
  `deepseek-flash` genuinely reads images now, but the guard keys on the backend host and
  `deepseek-v4-pro` really is text-only, so the deny is correct until the guard resolves
  the session MODEL id. Machine-wide enforcement layer with its own tests.
- **Item 19: 16 tool results lost on 2026-09-08, cause still unattributed.**
- **Item 18: re-run `C:\Claude\bin\dsh_session_audit.mjs` after a full day of real use.**

## Traps that cost real time on 2026-09-11

1. "It crashed" after an install is the install WORKING. `finish-install.ps1` step 1 is
   `taskkill /F`, so Windows and any session inside the app report a crash. The install is
   judged by the seed-integrity assertion and the post-install read-back, nothing else.
2. First-run setup shows NO WINDOW for about four minutes. Do not re-run the script
   because the app "looks stuck"; the script now waits and prints a completion line.
3. The 13 fs-local symlink failures and the 4 ui-sidebar/PDF failures are ENVIRONMENTAL
   and PRE-EXISTING. They are identical on the shipped rc.1 line and on rc.2. Developer
   Mode is off and the shell is not elevated, so Windows refuses symlinks.
4. The `ds-harness-update` skill exists twice. `C:\Claude\skills\ds-harness-update.skill.md`
   is the authority; `C:\Users\SteveDempsey\.agents\skills\ds-harness-update\SKILL.md` is
   what the desktop app LOADS and it went stale. Both are hash-identical as of 2026-09-11.
   Re-sync them after any edit.
5. `apps/desktop/.env.example` cannot be committed: the pre-commit hook refuses that
   filename. The packaging environment lives in `apps/desktop/PACKAGING.md`.

The playbook at `C:\Projects\repos\playbooks\DeepSeek Harness\05-neotech-fork.md` carries
the version history and the 27-row error ledger.

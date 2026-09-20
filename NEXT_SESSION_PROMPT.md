# Next session prompt

Continue deepseek-harness. THE INSTALL IS READY AND PENDING. Nothing is broken; the app is
simply still the 2026-09-17 build.

## The one thing left (one install, then the captures)

The installer and the script are both in `C:\Projects\worktrees\dsh-stage-icons`. That
worktree was fast-forwarded today to `42db6c8038`, so its `finish-install.ps1` now carries
the hardlink guard as well as the installer built at 11:55. Close the app, open a NEW
PowerShell window, and paste:

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-stage-icons\finish-install.ps1"
```

SmartScreen will prompt on the unsigned installer: choose "Run anyway". It force-closes the
app (Windows reports that as a crash; expected), then spends about four minutes with no
window. It prints `SETUP COMPLETE. Running 0.1.5-rc.2` when done. Do NOT run it twice.

It should also print `HARDLINK OK` three times and a vault line reading 20 files.

Then, in this order:

1. `py C:\Claude\bin\dsh_local_features_check.py` must exit 0 with 27 of 27. It reads 24 of
   27 today: `session-footer-live-read`, `session-stage-marks` and `session-status-failed`
   are absent from the running build. All three are PROVEN present in this installer's
   packaged seed (`workspaceLinks` 1, `dsw-stage-arc-spin` 3, `deploying` 12), so a MISSING
   row after the install is a real loss, not a stale marker.
2. Boot proof: the newest `~\.dsh\desktop\logs\provision-*.log` must end
   `seed integrity verified`, `staged health check passed`,
   `staging profile activated as 0.1.5-rc.2`, `applyRelease finished`; plus four or more
   live processes with start times after the install.
3. Vault and link proof: `py C:\Claude\bin\dsh_config_vault.py verify` exits 0 over
   **20 files** (up from 18), the fingerprint at
   `C:\Projects\worktrees\dsh-stage-icons\settings-backup\fingerprint-pre.txt` diffs clean
   against a fresh capture, and `fsutil hardlink list ~\.dsh\AGENTS.md` still names BOTH
   paths.
4. THE SIDEBAR CAPTURE and THE FOOTER PHOTOGRAPH, unchanged from the previous prompt. Both
   need eyes: the sidebar marks have never been seen in the app, and the populated footer
   has never been photographed.

## What this session did (2026-09-20, plan `2026-09-20-dsh-0.1.6-update-settings-retention`)

- **The 0.1.6 update is BLOCKED, and not by a rebase.** `dsh-v0.1.6-alpha.2` deletes about a
  dozen packages the fork's features are built on (`packages/session-status/*`,
  `client/ui-sessions-panel`, `vision/routing`, `llm/account-usage`,
  `llm/llm-route-fallback`, `api/pinned-files`, `client/ui-sidebar-explorer`,
  `fs/tool-present`, `code-runtime/*`, `e2b/*`, `workflow/workflow-worker-thread`;
  `derivePhase` does not exist there) and the entire desktop provisioning layer
  (`src/seed-store.ts`, `src/provision-log.ts` and ten more under `apps/desktop/`). None of
  the four provision-log milestones exist at 0.1.6, so `finish-install.ps1` cannot drive it.
  The fork never modified `seed-store.ts`, so a rebase can never bring it back: it is an
  upstream deletion. 8 of 53 local commits were replayed before stopping. Operator decided
  to install the proven 0.1.5-rc.2 build instead. See OPEN_ISSUES 35.
- **The vault now covers 20 files, not 18.** `dashboard-links.json` and `design-links.json`
  had no cover at all. Snapshot `4d83d54`, pushed to `NeoTech-Networks/dsh-config` main.
- **`finish-install.ps1` gained a hardlink guard** (`42db6c8038`), so a missing
  `~\.dsh\AGENTS.md` is re-linked to `~\.claude\CLAUDE.md` BEFORE any vault restore can
  create a separate file, and the link is asserted after. Identity is compared by FILE ID,
  never by path string, because `fsutil` reports long names while `$env:TEMP` hands back
  `C:\Users\STEVED~1\...` and a string compare false-fails a good link.
- `C:\Claude\bin\dsh_config_vault.py` now accepts a LINKED WORKTREE as a vault root, and
  `dsh-config` ignores `.claude/worktrees/` so a snapshot cannot commit a second copy of
  the vault.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master` at `224597f999` and carries this
  session's state sections.
- `C:\Projects\worktrees\dsh-stage-icons` is the worktree to install from. Its
  `feat/session-stage-icons` now reads `42db6c8038`. Do not delete it until the install is
  verified.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` at `42db6c8038`
  and STILL carries five uncommitted state files from an earlier session; do not commit or
  publish them.
- `C:\Projects\worktrees\dsh-update-v0.1.6-alpha.2` is PRESERVED work on the abandoned 0.1.6
  attempt: branch `update/v0.1.6-alpha.2`, 8 replayed commits, resolution scripts at
  `C:\Projects\temp\dsh_resolve.py` and the ordered SHA list at
  `C:\Projects\temp\dsh-replay-shas.txt`. Keep it until the 0.1.6 question is settled.
- `C:\Projects\worktrees\dsh-footer-intent` holds a known-good OLDER installer and is the
  rollback for what is running now (194,901,646 bytes).

## Still open elsewhere, unchanged

- Pre-existing gate findings, all reproduced on the untouched base: `verify-client-ui-i18n`
  2 (`ui-sidebar-explorer`), oxlint repo-wide 52 errors, `verify-module-graph` and
  `verify-doc-graphs` stale.
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with Developer
  Mode off. 13 fs-local tests fail on the old line for the same environmental reason.
- OPEN_ISSUES 16, 16b, 16-root-cause: the state-file loss loop and the never-merging
  state-sync PR are untouched.
- The estate checkout `C:\Projects\repos\vercel-services` is behind `origin/main`.

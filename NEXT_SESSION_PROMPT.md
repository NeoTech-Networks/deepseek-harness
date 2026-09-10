# Next session

Installed and running: DeepSeek Harness 0.1.5-rc.1, with all 11 local features
present (dsh_local_features_check.py exit 0).

Start here: OPEN_ISSUES.md item A, the All Sessions section vanishing after a
sidebar rail round-trip. It is our code, not upstream's: rc.2 changes zero
sidebar source. Read packages/client/ui-workspace/src/client/rows/AllSessions.tsx
and how it is mounted against this release's reworked sidebar / panel slot
contract. Most of the work is offline; the app is only needed to confirm the fix.

Do NOT drive the app UI while Steve is working in it. Check for live activity
first (session store mtimes under ~/.dsh/sessions).

Branches pushed, nothing to re-push:
  update/v0.1.5-rc.1        cf682495c5   (rc.1 stack + install guards)
  feat/sidebar-all-sessions 6eb1341b69

If a rebuild is needed, from THIS worktree:
  $env:DSH_DESKTOP_APP_ID='com.deepseek.harness'
  $env:DSH_DESKTOP_ALLOW_UNSIGNED='1'
  $env:DOWNLOAD_TEST_ORIGIN='https://download.neotech.biz'
  pnpm install; pnpm run build; pnpm run package:desktop:win:x64
Packaging must run from PowerShell, not Git Bash. Then finish-install.ps1 from
this worktree: it derives its own installer path and guards itself now.

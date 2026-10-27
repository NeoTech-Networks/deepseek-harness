# NEXT_SESSION_PROMPT (one current pointer)

0.2.1-rc.4 is BUILT AND PROVEN but NOT INSTALLED (2026-10-27). It is an npm-only
release with no upstream tag, so it was backported: one guard in `dsh-mcp-client`,
proved by the built `lib/index.js` being byte-identical to the published rc.4
artifact. Branch `update/v0.2.1-rc.4` in `C:\d214` and tag `dsh-v0.2.1-rc.4-fork`
are pushed. The installer is
`C:\Projects\exports\2026-10-27-dsh-0.2.1-rc.4\deepseek-harness-0.2.1-rc.4-win-x64-unsigned.exe`
(290,670,337 bytes, sha256 `361898423A8BC96582BB1D2D5FE094C89B1B98DF850FA88F5B53BCC2E97F0DA8`).

Next, in this order:

1. Steve runs the install, which was not run because the Harness app was mid-session:
   `powershell -ExecutionPolicy Bypass -File "C:\d214\finish-install.ps1"`, from a
   window that is not inside the app. Expect `SETUP COMPLETE. Running 0.2.1-rc.4`.
2. Re-pin the hook bridge at exactly `0.2.1-rc.4` and restart the app:
   `dsh.cmd plugin --profile desktop add @deepseek-ai/dsh-hooks-claude-code@0.2.1-rc.4 @deepseek-ai/dsh-hook-protocol@0.2.1-rc.4`,
   then confirm the earliest app process started LATER than the plugin package.json.
3. Read back `DisplayVersion` (must be `0.2.1-rc.4`, one uninstall row),
   `dsh_local_features_check.py` (43 of 43) and the guard inside the installed
   `app.asar` (`node C:\Projects\temp\asar_guard_check.cjs "<installed app.asar>"`
   must report `const listable guard: true`).

Still open from before: product analytics decision (OPEN_ISSUES 16); the composer
buttons pressed in a scratch Session (12); the lower workspace-picker headings
photographed (14); the four all-sessions spec failures diagnosed (13).

The `ds-harness-update` skill is now v7 and still uncommitted in the shared
`C:\Claude` checkout (OPEN_ISSUES 4).

Session log: `C:\Projects\logs\2026-10-27\dsh-rc4-backport\`.

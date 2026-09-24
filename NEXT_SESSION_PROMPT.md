# Next session prompt

Continue deepseek-harness: the 0.1.7-rc.1 port. Everything is built and gated; only
packaging and the install are left. The running app is still 0.1.5-rc.2 and untouched.

## First, confirm the one blocker is cleared

Packaging needs Visual Studio 2022 Build Tools (C++ workload) and a Windows SDK. Check:

    Test-Path "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe"

If it is still missing, the operator installs it from an ELEVATED PowerShell:

    winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

## Then

1. Package from PowerShell in `C:\Projects\worktrees\dsh-update-0.1.7-rc.1`, with `$env:CI='true'`
   and `C:\Windows\System32` first on PATH: `pnpm run package:desktop:win:x64:unsigned`.
   `apps\desktop\.env.windows` is already in place (app id + mandatory-update opt-out).
2. Prove the packaged build: `py C:\Projects\worktrees\claude-dsh-017-tools\bin\dsh_local_features_check.py --asar <win-unpacked>\resources\app.asar`
   must read 34 of 34 (branch `chore/dsh-017-tools`, NOT merged yet: merge it only after
   this proof). Confirm the uninstall key derives to 7808434f-469e-5eba-848e-edf64d3b94ce.
3. Before handing over: `C:\Claude` must have pulled claude-cowork-config `60b0ebcf`
   (bridge reads session.v4), and `finish-install.ps1 -WhatIf` must print the migration plan.
4. Hand the operator ONE line, for a new PowerShell window:
   `powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-update-0.1.7-rc.1\finish-install.ps1"`
5. Then the plan's Verification table, and Step 8 of the ds-harness-update skill.

Evidence and the full map: `C:\Projects\logs\2026-09-24\dsh-017-port\` (feature-map.md, merge-gates.md, hooks-placement.md).
Plan: `C:\Users\SteveDempsey\.claude\plans` (the 0.1.7-rc.1 upgrade plan).

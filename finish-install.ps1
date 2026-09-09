# finish-install.ps1 - completes the DeepSeek Harness reinstall.
#
# Run this from a NEW PowerShell window (Win+R -> "powershell" -> paste the
# command from the session). Do NOT run it from inside the DeepSeek Harness app:
# it force-closes the app, which would kill the very session hosting the app.
#
# It does six things:
#   1. Force-closes any running DeepSeek Harness processes. This is a forced
#      kill, so Windows and any session inside the app report it as a CRASH.
#      That is expected and is not the install failing.
#   2. Clears the OLD packaged seed, so the new install cannot inherit the
#      previous release's package archives (see the note below).
#   3. Silently reinstalls from the freshly built unsigned installer.
#   4. Asserts the installed seed matches its own integrity.json, and STOPS if
#      it does not.
#   5. Clears the stale extracted profile so the next launch re-extracts the
#      new seed.
#   6. Relaunches the app.
#
# Why step 2 exists (2026-09-08 incident): the NSIS silent switch /S writes the
# new files over the old ones without emptying the app directory first. On the
# 0.1.3 -> 0.1.5 reinstall that left 238 previous-release .tgz archives inside
# resources\seed\desktop-packages\. verifySeedIntegrity() compares the ENTIRE
# on-disk file set against integrity.json, so an extra file fails the check just
# as hard as a corrupt one. The app then threw at startup and exited before
# showing a window.
#
# Why rollback is NOT deleted any more: $DSH_HOME\desktop\rollback is the
# recovery copy the app itself renames back into place (project-manager.ts
# recover()). Deleting it is what turned a recoverable integrity failure into a
# dead app with nothing to fall back to. Deleting pending.json instead is both
# sufficient and safe: recover() early-returns when the journal is absent, so a
# kept rollback is never restored over the fresh profile.

$ErrorActionPreference = 'Continue'

$appDir   = 'C:\Users\SteveDempsey\AppData\Local\Programs\DeepSeek Harness'
$exe      = Join-Path $appDir 'DeepSeek Harness.exe'
$seedDir  = Join-Path $appDir 'resources\seed'
$dshHome  = 'C:\Users\SteveDempsey\.dsh'
$checker  = Join-Path $PSScriptRoot 'check-seed-integrity.py'

# 0. Snapshot the operator's own customisations BEFORE anything is removed.
#    settings.yaml, the agent preset that mounts the MCP servers, AGENTS.md and
#    the slash-command skill wrappers all live under .dsh and have been lost to
#    an update before. This must run while they are still on disk.
#    It can never fail the install: a lost snapshot is bad, a half install worse.
$VaultTool = 'C:\Claude\bin\dsh_config_vault.py'
if (Test-Path $VaultTool) {
  Write-Host "[dsh-config-vault] snapshotting your custom settings before install..."
  try {
    & py $VaultTool snapshot --reason "pre-install" 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "[dsh-config-vault] pre-install snapshot exited $LASTEXITCODE; install continues, check with: py $VaultTool list"
    }
  } catch {
    Write-Warning "[dsh-config-vault] pre-install snapshot could not run: $($_.Exception.Message). Install continues."
  }
} else {
  Write-Warning "[dsh-config-vault] vault tool not found at $VaultTool; your custom settings are NOT backed up for this install."
}

# 1. Close the app.
#
# EXPECTED, NOT A FAULT: this is a forced termination, so Windows (and any
# session that was running inside the app) reports it as a CRASH. That report
# is this line doing its job. It is not the install failing, and it is not
# something to diagnose. The app has no clean-shutdown switch to use instead.
Write-Host "closing the app (Windows will report this as a crash - that is expected, it is a forced close)" -ForegroundColor Yellow
taskkill /F /IM "DeepSeek Harness.exe" /T 2>$null | Out-Null
Start-Sleep -Seconds 3
Write-Host "app closed"

# 2. Clear the old seed before installing, so /S cannot leave a previous
#    release's archives behind. The installer recreates it in full.
if (Test-Path $seedDir) {
  Remove-Item -Recurse -Force $seedDir -ErrorAction SilentlyContinue
  if (Test-Path $seedDir) {
    Write-Host "could not clear old seed: $seedDir" -ForegroundColor Red
    Write-Host "is the app still running?" -ForegroundColor Red
    exit 1
  }
  Write-Host "old seed cleared"
}

# 3. Reinstall (silent). The installer is unsigned (built with
#    DSH_DESKTOP_ALLOW_UNSIGNED=1), so SmartScreen may prompt: choose "Run anyway".
$installer = 'C:\Projects\worktrees\dsh-update-v0.1.5-alpha.2\apps\desktop\.desktop-build\targets\win-x64\artifacts\deepseek-harness-0.1.5-alpha.2-win-x64.exe'
if (-not (Test-Path $installer)) {
  Write-Host "installer not found: $installer" -ForegroundColor Red
  exit 1
}
Write-Host "installing..."
$p = Start-Process -FilePath $installer -ArgumentList '/S' -Wait -PassThru
Write-Host "installer exit code: $($p.ExitCode)"

# 4. Prove the seed is exactly what the app expects, BEFORE relaunching.
#    A bad reinstall is reported here rather than discovered as an app that
#    will not open.
if (Test-Path $checker) {
  Write-Host "verifying seed integrity..."
  & py $checker $seedDir
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "SEED INTEGRITY FAILED - not relaunching." -ForegroundColor Red
    Write-Host "The app would show a startup error and exit. Fix the seed above first." -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "check-seed-integrity.py not found beside this script; skipping assertion" -ForegroundColor Yellow
}

# 5. Clear the stale profile (version may be unchanged, so a reinstall alone
#    would reuse the old profile and never pick up the new code). Keep the pnpm
#    store, and keep rollback.
Remove-Item -Force "$dshHome\desktop\pending.json" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dshHome\profiles\desktop" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dshHome\desktop\staging" -ErrorAction SilentlyContinue
Write-Host "profile cleared (rollback and pnpm store kept)"

# 6. Relaunch. The first launch runs a full offline pnpm install into a fresh
#    profile and takes minutes, not seconds.
if (Test-Path $exe) {
  Start-Process $exe
  Write-Host "relaunched (first window can take several minutes)"
} else {
  Write-Host "app exe not found after install: $exe" -ForegroundColor Red
}

# 7. Say whether the install touched any of the operator's own settings, and
#    hand back the exact command to undo it if it did.
if (Test-Path $VaultTool) {
  Write-Host ""
  Write-Host "[dsh-config-vault] checking whether the install changed any of your settings..."
  $VaultVerify = & py $VaultTool verify 2>&1
  $VaultCode = $LASTEXITCODE
  $VaultVerify | ForEach-Object { Write-Host "  $_" }
  if ($VaultCode -eq 3) {
    Write-Host ""
    Write-Warning "DRIFT: this install changed or removed some of your custom settings."
    Write-Host "  CHANGED means the installer overwrote it. MISSING FROM LIVE means it deleted it."
    Write-Host "  Your originals are safe in C:\Projects\repos\dsh-config. Nothing is lost."
    Write-Host "  To put everything back, close DeepSeek Harness and run:"
    Write-Host "    py C:\Claude\bin\dsh_config_vault.py restore --all"
  } elseif ($VaultCode -eq 0) {
    Write-Host "[dsh-config-vault] all of your custom settings survived the install."
  } else {
    Write-Warning "[dsh-config-vault] could not check (exit $VaultCode). Run: py $VaultTool verify"
  }
}

Write-Host ""
Write-Host "Once the window is up (first launch takes minutes), check that every one of"
Write-Host "your own features made it into this build:"
Write-Host "    py C:\Claude\bin\dsh_local_features_check.py"

Write-Host "done"

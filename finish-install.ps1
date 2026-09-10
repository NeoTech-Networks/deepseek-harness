# finish-install.ps1 - completes the DeepSeek Harness reinstall.
#
# Run this from a NEW PowerShell window (Win+R -> "powershell" -> paste the
# command from the session). Do NOT run it from inside the DeepSeek Harness app:
# it force-closes the app, which would kill the very session hosting the app.
# That is no longer left to discipline: a guard below refuses to run when this
# script's own parent chain contains the app.
#
# Run it from the worktree you just built in. It picks its installer from its
# OWN folder and this worktree's package.json version, so there is no path to
# edit per release and no way to install a build from a different worktree.
#
# Guards run before anything is touched, and each exits 2 explaining itself:
# running inside the app, a second copy already running, or a first-run setup
# currently in flight. -Force overrides them (but never the seed integrity
# assertion). After relaunching it WAITS for setup and prints the version, so
# a windowless app is never mistaken for a dead one.
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

param(
  # Skip the safety guards below. Only for the case where a guard is provably
  # wrong and you have read why it fired. It does NOT skip the seed integrity
  # assertion, which is a correctness check, not a guard.
  [switch]$Force,
  # Install and relaunch, but do not wait for first-run setup to finish.
  [switch]$NoWait
)

$ErrorActionPreference = 'Continue'

# Resolved, not hardcoded: this file lives in the repo, so it must not carry one
# machine's user profile. DSH_HOME wins when set, because the harness itself
# honours it and a session can be running against a non-default home.
$appDir   = Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness'
$exe      = Join-Path $appDir 'DeepSeek Harness.exe'
$seedDir  = Join-Path $appDir 'resources\seed'
$dshHome  = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$checker  = Join-Path $PSScriptRoot 'check-seed-integrity.py'
$logDir   = Join-Path $dshHome 'desktop\logs'
$selfLock = Join-Path $env:TEMP 'dsh-finish-install.lock'

# ---------------------------------------------------------------------------
# GUARDS. Every one of these exists because the step below it destroyed a
# working install at least once. Step 1 force-kills the app, so this script is
# only safe to start from a state where nothing is mid-flight.
# ---------------------------------------------------------------------------

function Test-RunningInsideHarness {
  # Walk the parent chain. DeepSeek Harness runs shell tool calls in a child
  # pwsh, so a session that "just runs the script" is a descendant of the very
  # process step 1 kills.
  $id = $PID
  for ($i = 0; $i -lt 10; $i++) {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$id" -ErrorAction SilentlyContinue
    if (-not $p) { return $false }
    if ($p.Name -like 'DeepSeek Harness*') { return $true }
    if (-not $p.ParentProcessId -or $p.ParentProcessId -eq 0) { return $false }
    $id = $p.ParentProcessId
  }
  return $false
}

function Get-ProvisionState {
  # 'running'  first-run setup is in flight RIGHT NOW. Killing it here is what
  #            leaves a dead lock, a half-written staging folder and no profile.
  # 'stalled'  a provision started and stopped writing. Safe to retry.
  # 'finished' last provision completed.
  if (-not (Test-Path $logDir)) { return 'none' }
  $log = Get-ChildItem $logDir -Filter 'provision-*.log' -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $log) { return 'none' }
  if ((Get-Content $log.FullName -Raw) -match 'applyRelease finished') { return 'finished' }
  if (((Get-Date) - $log.LastWriteTime).TotalMinutes -lt 15) { return 'running' }
  return 'stalled'
}

function Stop-Guard($reason, $advice) {
  Write-Host ""
  Write-Host "REFUSING TO RUN: $reason" -ForegroundColor Red
  Write-Host $advice
  Write-Host ""
  Write-Host "If you are certain this is wrong, re-run with -Force." -ForegroundColor DarkGray
  exit 2
}

# Guard 1: never run from inside the app this script force-closes.
if (Test-RunningInsideHarness) {
  if ($Force) {
    Write-Warning "GUARD OVERRIDDEN: running inside DeepSeek Harness. This will kill your own session."
  } else {
    Stop-Guard "this script is running inside DeepSeek Harness." @"
  Step 1 force-closes the app, which would kill the session running this script
  and leave the install half done.

  Open a NEW PowerShell window (Win+R, then: powershell) and run it from there.
"@
  }
}

# Guard 2: one copy at a time.
if (Test-Path $selfLock) {
  $otherPid = (Get-Content $selfLock -Raw -ErrorAction SilentlyContinue).Trim()
  $alive = $false
  if ($otherPid -match '^\d+$') {
    $alive = [bool](Get-Process -Id ([int]$otherPid) -ErrorAction SilentlyContinue)
  }
  if ($alive -and -not $Force) {
    Stop-Guard "another copy of this script is already running (pid $otherPid)." @"
  Two copies race: the second one kills the app the first one just relaunched.
  Wait for the first to print 'done', or close that window.
"@
  }
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
}
Set-Content -Path $selfLock -Value $PID -Encoding ascii
# Release the lock no matter how this script ends.
$null = Register-EngineEvent PowerShell.Exiting -Action {
  Remove-Item (Join-Path $env:TEMP 'dsh-finish-install.lock') -Force -ErrorAction SilentlyContinue
}

# Guard 3: never interrupt a first-run setup. THIS IS THE ONE THAT BIT ON
# 2026-09-10: the script was started a second time on top of its own relaunch,
# the kill landed in the middle of provisioning, and the app was left with no
# profile at all.
$state = Get-ProvisionState
if ($state -eq 'running') {
  if ($Force) {
    Write-Warning "GUARD OVERRIDDEN: first-run setup is in flight. Killing it now will leave no profile."
  } else {
    Stop-Guard "DeepSeek Harness is in the middle of first-run setup." @"
  Setup takes about four minutes and shows NO WINDOW while it runs, which is
  why it looks stuck. Killing it now is what leaves the app with no profile.

  Wait for it to finish, then check the newest log in:
    $logDir
  It is done when the last line reads 'applyRelease finished'.
"@
  }
}

# Stale leftovers from a previously killed run. Removing these is safe: the
# lock names a dead process and the staging folder is a partial copy the app
# will rebuild. This is the cleanup that had to be done by hand on 2026-09-10.
$dshLock = Join-Path $dshHome 'desktop\lock'
if (Test-Path $dshLock) {
  $lockPid = (Get-Content $dshLock -Raw -ErrorAction SilentlyContinue).Trim()
  $lockAlive = $false
  if ($lockPid -match '^\d+$') {
    $lockAlive = [bool](Get-Process -Id ([int]$lockPid) -ErrorAction SilentlyContinue)
  }
  if (-not $lockAlive) {
    Remove-Item $dshLock -Force -ErrorAction SilentlyContinue
    Write-Host "cleared a stale lock left by a killed run (pid $lockPid was not running)"
  }
}

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
#
#    The path is DERIVED from this script's own location and this worktree's
#    package.json version, never hardcoded. There are a dozen dsh-* worktrees on
#    this machine, each with its own artifacts folder, and a hardcoded path was
#    both a chore to update every release and a live risk of silently installing
#    a build from a DIFFERENT worktree than the one just built.
$version = $null
try {
  $version = (Get-Content (Join-Path $PSScriptRoot 'package.json') -Raw | ConvertFrom-Json).version
} catch {
  Write-Host "cannot read version from $PSScriptRoot\package.json" -ForegroundColor Red
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 1
}
$artifactDir = Join-Path $PSScriptRoot 'apps\desktop\.desktop-build\targets\win-x64\artifacts'
$installer   = Join-Path $artifactDir "deepseek-harness-$version-win-x64.exe"

if (-not (Test-Path $installer)) {
  Write-Host "installer not found for version $version" -ForegroundColor Red
  Write-Host "  expected: $installer"
  $others = Get-ChildItem $artifactDir -Filter '*-win-x64.exe' -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending
  if ($others) {
    Write-Host "  this worktree has built:" -ForegroundColor Yellow
    $others | ForEach-Object { Write-Host ("    {0}  ({1:yyyy-MM-dd HH:mm})" -f $_.Name, $_.LastWriteTime) }
    Write-Host "  Version mismatch usually means the package step has not been re-run since the version bump."
  } else {
    Write-Host "  nothing has been packaged in this worktree yet. Run: pnpm run package:desktop:win:x64" -ForegroundColor Yellow
  }
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 1
}
Write-Host "installer: $(Split-Path $installer -Leaf)"
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
#
#    Then WAIT for it, and say so. The script used to exit the moment it called
#    Start-Process, which left the operator watching a windowless app with no
#    way to tell "still working" from "dead". That uncertainty is what caused
#    the second run that broke the install on 2026-09-10. Waiting here removes
#    the reason to re-run it.
$priorLog = (Get-ChildItem $logDir -Filter 'provision-*.log' -ErrorAction SilentlyContinue |
             Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name

if (-not (Test-Path $exe)) {
  Write-Host "app exe not found after install: $exe" -ForegroundColor Red
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 1
}

Start-Process $exe
Write-Host "relaunched"

if ($NoWait) {
  Write-Host "not waiting (-NoWait). First-run setup takes about four minutes and shows no window."
  Write-Host "DO NOT run this script again while that is happening." -ForegroundColor Yellow
} else {
  Write-Host ""
  Write-Host "Waiting for first-run setup. This takes about four minutes and shows NO WINDOW."
  Write-Host "Leave this alone. Do not close the app and do not re-run this script." -ForegroundColor Yellow

  $deadline = (Get-Date).AddMinutes(12)
  $done = $false
  $newLog = $null
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 10
    $newLog = Get-ChildItem $logDir -Filter 'provision-*.log' -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($newLog -and $newLog.Name -ne $priorLog) {
      $body = Get-Content $newLog.FullName -Raw
      if ($body -match 'applyRelease finished') { $done = $true; break }
      # Show the last milestone so the wait is legible rather than a blank pause.
      $last = ($body -split "`n" | Where-Object { $_ -match '^\[\d{4}-' } | Select-Object -Last 1)
      if ($last) { Write-Host ("  " + $last.Trim()) -ForegroundColor DarkGray }
    }
    if (-not (Get-Process -Name 'DeepSeek Harness' -ErrorAction SilentlyContinue)) {
      Write-Host ""
      Write-Host "The app exited during setup. It did NOT finish." -ForegroundColor Red
      Write-Host "Log: $(if ($newLog) { $newLog.FullName } else { $logDir })"
      Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
      exit 1
    }
  }

  if ($done) {
    $activated = (Select-String -Path $newLog.FullName -Pattern 'activated as (.+)$' |
                  Select-Object -Last 1).Matches.Groups[1].Value
    Write-Host ""
    Write-Host "SETUP COMPLETE. Running $activated" -ForegroundColor Green
  } else {
    Write-Host ""
    Write-Host "Setup did not report completion within 12 minutes." -ForegroundColor Red
    Write-Host "It may still be working. Check the newest log in $logDir"
    Write-Host "and look for 'applyRelease finished'. Do NOT re-run this script" -ForegroundColor Yellow
    Write-Host "until that line appears or the app has exited." -ForegroundColor Yellow
  }
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
Write-Host "Check that every one of your own features made it into this build:"
Write-Host "    py C:\Claude\bin\dsh_local_features_check.py"

Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
Write-Host "done"

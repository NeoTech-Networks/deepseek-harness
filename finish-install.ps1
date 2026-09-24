# finish-install.ps1 - completes the DeepSeek Harness reinstall (0.1.7 line).
#
# Run this from a NEW PowerShell window (Win+R -> "powershell" -> paste the
# command from the session). Do NOT run it from inside the DeepSeek Harness app:
# it force-closes the app, which would kill the very session hosting the app.
# A guard below refuses to run when this script's own parent chain contains it.
#
# Run it from the worktree you just built in. It picks its installer from its
# OWN folder and this worktree's package.json version, so there is no path to
# edit per release and no way to install a build from a different worktree.
#
# WHAT CHANGED FROM THE 0.1.5 SCRIPT, AND WHY. 0.1.7 ships the runtime inside
# resources\app.asar and extracts nothing into ~\.dsh, so there is no seed, no
# provision log, no staging, no pending.json and no multi-minute first-run
# install any more. Every guard that keyed off those is gone; every guard that
# still protects something is kept:
#   * inside-Harness refusal and the single-copy lock: unchanged.
#   * the pre-install settings snapshot is still a HARD gate.
#   * the AGENTS.md / .claude\CLAUDE.md hardlink is still asserted.
#   * settings retention is still ENFORCED: drift is repaired, then reported as
#     REPAIRED or STILL DRIFTED.
#
# THE ONE-TIME 0.1.5 -> 0.1.7 MIGRATION. 0.1.7 reads settings in new places (see
# dsh-017-migrate.py for the detail). When this home still holds the 0.1.5
# runtime profile, the script: stages the migrated files BEFORE touching
# anything (and refuses to install if staging fails), installs, moves the 0.1.5
# runtime profile aside, writes the migrated settings.yaml and home patch
# (every replaced file keeps a .pre-0.1.7 copy), launches, waits for 0.1.7 to
# import settings.yaml, proves every section landed, repairs any that did not by
# re-importing just those, then switches the settings vault to the 0.1.7 layout
# and snapshots again. On a later 0.1.7.x reinstall none of that runs.
#
# -WhatIf runs the guards and the staging, prints what WOULD happen and exits
# without closing the app, installing or writing anything under ~\.dsh.

param(
  # Skip the safety guards. Only for the case where a guard is provably wrong
  # and you have read why it fired.
  [switch]$Force,
  # Install and relaunch, but do not wait for the app or verify settings.
  [switch]$NoWait,
  # Dry run: guards + staging + plan, nothing installed, nothing in ~\.dsh written.
  [switch]$WhatIf
)

$ErrorActionPreference = 'Continue'

$appDir     = Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness'
$exe        = Join-Path $appDir 'DeepSeek Harness.exe'
$dshHome    = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$agentsMd   = Join-Path $dshHome 'AGENTS.md'
$claudeMd   = Join-Path $env:USERPROFILE '.claude\CLAUDE.md'
$selfLock   = Join-Path $env:TEMP 'dsh-finish-install.lock'
$migrator   = Join-Path $PSScriptRoot 'dsh-017-migrate.py'
$staged     = Join-Path $dshHome 'migration-0.1.7'
$newManifest = Join-Path $PSScriptRoot 'dsh-config.vault.manifest.0.1.7.yaml'
$vaultRepo  = 'C:\Projects\repos\dsh-config'
$VaultTool  = 'C:\Claude\bin\dsh_config_vault.py'
$hostPort   = 19387
# electron-builder derives the NSIS uninstall key as uuid5(appId); only
# DSH_DESKTOP_APP_ID=com.deepseek.harness yields this one. Any other key means a
# SECOND copy was installed beside the running one.
$uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\7808434f-469e-5eba-848e-edf64d3b94ce'

function Stop-Guard($reason, $advice) {
  Write-Host ""
  Write-Host "REFUSING TO RUN: $reason" -ForegroundColor Red
  Write-Host $advice
  Write-Host ""
  Write-Host "If you are certain this is wrong, re-run with -Force." -ForegroundColor DarkGray
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 2
}

function Test-RunningInsideHarness {
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

# ---------------------------------------------------------------------------
# THE SHARED RULES FILE. $dshHome\AGENTS.md and .claude\CLAUDE.md are ONE file
# with TWO names (a hardlink). A vault restore opens AGENTS.md "wb", so if it is
# missing the restore would create a separate file and sever the link with no
# error; it is therefore re-linked before any restore, and asserted after.
# Identity is compared by FILE ID, never by path string (fsutil prints long
# names, $env:USERPROFILE can be an 8.3 short name).
# ---------------------------------------------------------------------------
function Get-LinkCount($path) {
  $lines = & fsutil hardlink list $path 2>$null
  if ($LASTEXITCODE -ne 0) { return 0 }
  return @($lines | Where-Object { $_ }).Count
}

function Get-FileId($path) {
  $out = & fsutil file queryfileid $path 2>$null
  if ($LASTEXITCODE -ne 0) { return $null }
  if (($out | Out-String) -match '(?i)(0x[0-9a-f]+)') { return $Matches[1].ToLowerInvariant() }
  return $null
}

function Restore-AgentsHardlink {
  if (Test-Path $agentsMd) { return }
  if (-not (Test-Path $claudeMd)) {
    Write-Warning "$claudeMd is missing too, so $agentsMd cannot be re-linked."
    return
  }
  New-Item -ItemType HardLink -Path $agentsMd -Target $claudeMd | Out-Null
  Write-Host "AGENTS.md was missing; re-linked it to .claude\CLAUDE.md (one file, two names)" -ForegroundColor Yellow
}

function Assert-AgentsHardlink($when) {
  $count = Get-LinkCount $agentsMd
  $a = Get-FileId $agentsMd
  $c = Get-FileId $claudeMd
  if ($count -eq 2 -and $a -and $c -and $a -eq $c) {
    Write-Host "HARDLINK OK ($when): AGENTS.md and .claude\CLAUDE.md are one file, 2 links, id $a." -ForegroundColor Green
    return
  }
  Stop-Guard "the shared rules file is no longer one file with two names ($when)." @"
  links seen from AGENTS.md: $count   AGENTS.md id: $a   CLAUDE.md id: $c
  Claude Code reads CLAUDE.md and DeepSeek Harness reads AGENTS.md, so an edit
  to one is now invisible to the other. Put the link back by hand:
    del "$agentsMd"
    New-Item -ItemType HardLink -Path "$agentsMd" -Target "$claudeMd"
"@
}

function Test-HostPort {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync('127.0.0.1', $hostPort)
    return ($task.Wait(1000) -and $client.Connected)
  } catch { return $false } finally { $client.Dispose() }
}

function Wait-AppReady($minutes) {
  # 0.1.7 has no provisioning: the host validates its bundled runtime and opens
  # its local port within seconds. An app that exits first did not start.
  $deadline = (Get-Date).AddMinutes($minutes)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    if (Test-HostPort) { return 'ready' }
    if (-not (Get-Process -Name 'DeepSeek Harness' -ErrorAction SilentlyContinue)) { return 'exited' }
  }
  return 'timeout'
}

function Stop-App {
  # A forced close: Windows and any session inside the app report it as a CRASH.
  # That is expected and is not the install failing.
  taskkill /F /IM "DeepSeek Harness.exe" /T 2>$null | Out-Null
  Start-Sleep -Seconds 3
}

function Invoke-Migrator {
  & py $migrator @args 2>&1 | ForEach-Object { Write-Host "  $_" }
  return $LASTEXITCODE
}

# --- Guards ------------------------------------------------------------------
if (Test-RunningInsideHarness) {
  if ($Force) { Write-Warning "GUARD OVERRIDDEN: running inside DeepSeek Harness. This will kill your own session." }
  else {
    Stop-Guard "this script is running inside DeepSeek Harness." @"
  It force-closes the app, which would kill the session running this script and
  leave the install half done. Open a NEW PowerShell window (Win+R, then:
  powershell) and run it from there.
"@
  }
}

if (Test-Path $selfLock) {
  $otherPid = (Get-Content $selfLock -Raw -ErrorAction SilentlyContinue).Trim()
  $alive = ($otherPid -match '^\d+$') -and [bool](Get-Process -Id ([int]$otherPid) -ErrorAction SilentlyContinue)
  if ($alive -and -not $Force) {
    Stop-Guard "another copy of this script is already running (pid $otherPid)." @"
  Two copies race: the second one kills the app the first one just relaunched.
  Wait for the first to print 'done', or close that window.
"@
  }
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
}
Set-Content -Path $selfLock -Value $PID -Encoding ascii
$null = Register-EngineEvent PowerShell.Exiting -Action {
  Remove-Item (Join-Path $env:TEMP 'dsh-finish-install.lock') -Force -ErrorAction SilentlyContinue
}

# --- Installer ---------------------------------------------------------------
try { $version = (Get-Content (Join-Path $PSScriptRoot 'package.json') -Raw | ConvertFrom-Json).version }
catch { Stop-Guard "cannot read the version from $PSScriptRoot\package.json." "" }
$artifactDir = Join-Path $PSScriptRoot 'apps\desktop\.desktop-build\targets\win-x64\unsigned-artifacts'
$installer   = Join-Path $artifactDir "deepseek-harness-$version-win-x64-unsigned.exe"
if (-not (Test-Path $installer)) {
  $built = Get-ChildItem $artifactDir -Filter '*.exe' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  $list = if ($built) { ($built | ForEach-Object { "    $($_.Name)  ($($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))" }) -join "`n" } else { '    (nothing packaged in this worktree yet)' }
  Stop-Guard "installer not found for version $version." @"
  expected: $installer
  this worktree has built:
$list
  Build it with: pnpm run package:desktop:win:x64:unsigned
"@
}

# --- Is this the one-time migration? -----------------------------------------
$migrating = $false
$oldRuntime = Join-Path $dshHome 'profiles\desktop\package.json'
if (Test-Path $oldRuntime) {
  try { $migrating = ((Get-Content $oldRuntime -Raw | ConvertFrom-Json).name -eq '@deepseek-ai/dsh-desktop-runtime') } catch { }
}

Write-Host "installer : $(Split-Path $installer -Leaf)"
Write-Host "home      : $dshHome"
Write-Host "mode      : $(if ($migrating) { 'FIRST 0.1.7 INSTALL - one-time settings migration' } else { 'reinstall on the 0.1.7 line' })"

if ($migrating) {
  # Staging reads the live files and writes only $staged, so it is safe before the
  # snapshot and before the app is closed. A failure here stops the install while
  # nothing has been touched.
  if (Test-Path $staged) {
    $old = "$staged.previous-$(Get-Date -Format yyyyMMddHHmmss)"
    if (-not $WhatIf) { Rename-Item $staged $old }
  }
  $stageDir = if ($WhatIf) { Join-Path $env:TEMP "dsh-017-whatif-$PID" } else { $staged }
  Write-Host "[migration] staging the 0.1.7 settings into $stageDir"
  if ((Invoke-Migrator stage --home $dshHome --out $stageDir) -ne 0) {
    Stop-Guard "the 0.1.7 settings could not be staged, so nothing was installed." "  Read the ERROR line above; the live settings are untouched."
  }
  if (-not (Test-Path $newManifest)) {
    Stop-Guard "the 0.1.7 vault manifest is missing beside this script." "  expected: $newManifest"
  }
}

if ($WhatIf) {
  Write-Host ""
  Write-Host "WHATIF - would now:" -ForegroundColor Cyan
  Write-Host "  1. snapshot settings to the vault (hard gate)"
  Write-Host "  2. close DeepSeek Harness and run: $installer /S"
  Write-Host "  3. check the uninstall key $uninstallKey reads $version"
  if ($migrating) {
    Write-Host "  4. move profiles\desktop aside to profiles\desktop.0.1.5-runtime"
    Write-Host "  5. write the staged settings.yaml and home cordis.patch.yml (originals kept as *.pre-0.1.7)"
    Write-Host "  6. launch, wait for port $hostPort, wait for settings.yaml.imported, verify every section"
    Write-Host "  7. repair any section that did not import by re-importing it alone"
    Write-Host "  8. switch the vault manifest to the 0.1.7 layout and snapshot again"
  } else {
    Write-Host "  4. launch, wait for port $hostPort, verify settings with the vault, repair drift"
  }
  Write-Host "  final: assert the AGENTS.md hardlink, print SETUP COMPLETE. Running $version"
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  Write-Host "WHATIF done: nothing was installed and nothing under $dshHome was written."
  exit 0
}

# --- 0. Snapshot BEFORE anything is removed (HARD GATE) -------------------------
$snapshotOk = $false
if (Test-Path $VaultTool) {
  Write-Host "[dsh-config-vault] snapshotting your custom settings before install..."
  & py $VaultTool snapshot --reason "pre-install $version" 2>&1 | ForEach-Object { Write-Host "  $_" }
  $snapshotOk = ($LASTEXITCODE -eq 0)
}
if (-not $snapshotOk) {
  if ($Force) { Write-Warning "GUARD OVERRIDDEN: no fresh settings snapshot. Anything this install drops cannot be repaired from this run." }
  else {
    Stop-Guard "your custom settings could not be snapshotted." @"
  The snapshot is the only copy that can put a customisation back, so the install
  stops here. Check the vault: py $VaultTool verify ; py $VaultTool list
"@
  }
}

# --- 1. Close, 2. install -----------------------------------------------------
Write-Host "closing the app (Windows will report this as a crash - that is expected, it is a forced close)" -ForegroundColor Yellow
Stop-App
Write-Host "installing $(Split-Path $installer -Leaf) (unsigned: if SmartScreen prompts, choose Run anyway)..."
$p = Start-Process -FilePath $installer -ArgumentList '/S' -Wait -PassThru
Write-Host "installer exit code: $($p.ExitCode)"
if ($p.ExitCode -ne 0) {
  Stop-Guard "the installer failed (exit $($p.ExitCode)); the app was not relaunched." @"
  0.1.7's installer stages into a new folder and rolls back on failure, so the
  previous install should still be in place. Run it by hand to see its message.
"@
}
$installed = (Get-ItemProperty $uninstallKey -ErrorAction SilentlyContinue).DisplayVersion
if ($installed -ne $version) {
  Stop-Guard "the uninstall key reads '$installed', not $version." @"
  Either the install did not land, or it went in as a SECOND copy under another
  key (wrong DSH_DESKTOP_APP_ID in apps\desktop\.env.windows). Check Settings >
  Apps for two DeepSeek Harness entries.
"@
}
$rows = @(Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall' -ErrorAction SilentlyContinue |
          ForEach-Object { Get-ItemProperty $_.PSPath } | Where-Object { $_.DisplayName -like 'DeepSeek Harness*' })
Write-Host "installed $installed ($($rows.Count) DeepSeek Harness uninstall row(s))"
if ($rows.Count -ne 1) { Write-Warning "expected exactly one DeepSeek Harness install, found $($rows.Count)." }

# --- 3. Migration (one time) or pre-launch drift check -------------------------
if ($migrating) {
  Write-Host "[migration] applying the staged 0.1.7 settings (app is closed)..."
  if ((Invoke-Migrator apply --home $dshHome --staged $staged) -ne 0) {
    Stop-Guard "the staged settings could not be applied." @"
  The app is installed but not relaunched. Nothing was deleted: the originals
  are the *.pre-0.1.7 files in $dshHome and the vault holds the pre-install
  snapshot. Read the REFUSED/ERROR line above.
"@
  }
  Assert-AgentsHardlink 'after the migration'
} elseif (Test-Path $VaultTool) {
  Write-Host "[dsh-config-vault] checking your settings survived the install (app is closed)..."
  & py $VaultTool verify 2>&1 | ForEach-Object { Write-Host "  $_" }
  if ($LASTEXITCODE -eq 3) {
    Write-Warning "[dsh-config-vault] drift before first launch; restoring from the pre-install snapshot"
    Restore-AgentsHardlink
    & py $VaultTool restore --all 2>&1 | ForEach-Object { Write-Host "  $_" }
    Assert-AgentsHardlink 'after the pre-launch repair'
  }
}

# --- 4. Launch and wait ----------------------------------------------------------
if (-not (Test-Path $exe)) { Stop-Guard "app exe not found after install: $exe" "" }
Start-Process $exe
Write-Host "relaunched"
if ($NoWait) {
  Write-Host "not waiting (-NoWait). Settings were NOT verified." -ForegroundColor Yellow
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 0
}
Write-Host "waiting for the app to come up (port $hostPort)..."
$state = Wait-AppReady 3
if ($state -ne 'ready') {
  Write-Host ""
  Write-Host "The app did not come up ($state). It is NOT running $version." -ForegroundColor Red
  Write-Host "Crash reports: $env:APPDATA\@deepseek-ai\dsh-desktop\logs"
  Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
  exit 1
}
Write-Host "app is up"

# --- 5. Prove the settings, repair what did not land ----------------------------
$settingsVerdict = 'UNCHECKED'
if ($migrating) {
  $imported = Join-Path $dshHome 'settings.yaml.imported'
  $deadline = (Get-Date).AddMinutes(2)
  while (-not (Test-Path $imported) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 3 }
  Start-Sleep -Seconds 5   # the import writes section by section after the rename
  Write-Host "[migration] verifying every settings section landed..."
  $code = Invoke-Migrator verify --home $dshHome --staged $staged
  if ($code -eq 0) { $settingsVerdict = 'OK' }
  else {
    $unimported = Join-Path $staged 'unimported.yaml'
    if ((Test-Path $unimported) -and (Get-Item $unimported).Length -gt 0) {
      Write-Warning "some sections did not import; re-importing just those (app closes and reopens once)"
      Stop-App
      Copy-Item $imported "$imported.first" -Force
      Copy-Item $unimported (Join-Path $dshHome 'settings.yaml') -Force
      Start-Process $exe
      $null = Wait-AppReady 3
      $deadline = (Get-Date).AddMinutes(2)
      while ((Test-Path (Join-Path $dshHome 'settings.yaml')) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 3 }
      Start-Sleep -Seconds 5
      # verify compares against the FULL staged set, so the first import's sections count too
      $code = Invoke-Migrator verify --home $dshHome --staged $staged
    }
    $settingsVerdict = if ($code -eq 0) { 'REPAIRED' } else { 'STILL DRIFTED' }
  }
  if ($settingsVerdict -in 'OK', 'REPAIRED') {
    # From here the vault guards the 0.1.7 layout: the profile patch holds the
    # imported settings, settings.yaml no longer exists, .agent-presets is unread.
    Copy-Item $newManifest (Join-Path $vaultRepo 'vault.manifest.yaml') -Force
    Write-Host "[dsh-config-vault] switched to the 0.1.7 manifest; snapshotting the migrated settings..."
    & py $VaultTool snapshot --reason "post-install $version (0.1.7 migration)" 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -ne 0) {
      # The settings are fine (just verified); only the vault's new baseline is missing.
      Write-Warning "[dsh-config-vault] the post-install snapshot FAILED (exit $LASTEXITCODE). Take it by hand: py $VaultTool snapshot --reason post-install"
    }
  }
} elseif (Test-Path $VaultTool) {
  & py $VaultTool verify 2>&1 | ForEach-Object { Write-Host "  $_" }
  $VaultCode = $LASTEXITCODE
  if ($VaultCode -eq 0) { $settingsVerdict = 'OK' }
  elseif ($VaultCode -eq 3) {
    Write-Warning "DRIFT: this install changed or removed some of your settings. Repairing from the snapshot."
    Stop-App
    Restore-AgentsHardlink
    & py $VaultTool restore --all 2>&1 | ForEach-Object { Write-Host "  $_" }
    Start-Process $exe
    $null = Wait-AppReady 3
    & py $VaultTool verify 2>&1 | ForEach-Object { Write-Host "  $_" }
    $settingsVerdict = if ($LASTEXITCODE -eq 0) { 'REPAIRED' } else { 'STILL DRIFTED' }
  }
}

Write-Host ""
switch ($settingsVerdict) {
  'OK'            { Write-Host "[settings] every one of your settings survived the install." -ForegroundColor Green }
  'REPAIRED'      { Write-Host "[settings] REPAIRED: drift was found and put back; the app is running." -ForegroundColor Green }
  'STILL DRIFTED' {
    Write-Host "[settings] STILL DRIFTED after a repair. Treat this install as FAILED for settings." -ForegroundColor Red
    Write-Host "    Originals: $dshHome\*.pre-0.1.7 and the vault's pre-install snapshot." -ForegroundColor Yellow
  }
  default         { Write-Warning "[settings] could not be checked." }
}

Assert-AgentsHardlink 'final'
Write-Host ""
Write-Host "Check that every one of your own features made it into this build:"
Write-Host "    py C:\Claude\bin\dsh_local_features_check.py"
Write-Host ""
Remove-Item $selfLock -Force -ErrorAction SilentlyContinue
if ($settingsVerdict -eq 'STILL DRIFTED') {
  Write-Host "INSTALLED $installed, BUT SETTINGS DID NOT SURVIVE. Do not rely on the app until this is fixed." -ForegroundColor Red
  exit 3
}
Write-Host "SETUP COMPLETE. Running $installed" -ForegroundColor Green
Write-Host "done"

# finish-install.ps1 - completes the DeepSeek Harness reinstall.
#
# Run this from a NEW PowerShell window (Win+R -> "powershell" -> paste the
# command from the session). Do NOT run it from inside the DeepSeek Harness app:
# it force-closes the app, which would kill the very session hosting the app.
#
# It does four things:
#   1. Force-closes any running DeepSeek Harness processes.
#   2. Silently reinstalls from the freshly built unsigned installer.
#   3. Clears the stale extracted profile so the next launch re-extracts the
#      new seed (which now contains the vision-routing package).
#   4. Relaunches the app.

$ErrorActionPreference = 'Continue'

# 1. Close the app.
taskkill /F /IM "DeepSeek Harness.exe" /T 2>$null | Out-Null
Start-Sleep -Seconds 3

# 2. Reinstall (silent). The installer is unsigned (built with
#    DSH_DESKTOP_ALLOW_UNSIGNED=1), so SmartScreen may prompt: choose "Run anyway".
$installer = 'C:\Projects\worktrees\dsh-update-v015\apps\desktop\.desktop-build\targets\win-x64\artifacts\deepseek-harness-0.1.5-alpha.1-win-x64.exe'
if (-not (Test-Path $installer)) {
  Write-Host "installer not found: $installer" -ForegroundColor Red
  exit 1
}
Write-Host "installing..."
$p = Start-Process -FilePath $installer -ArgumentList '/S' -Wait -PassThru
Write-Host "installer exit code: $($p.ExitCode)"

# 3. Clear the stale profile (version is unchanged, so a reinstall alone would
#    reuse the old profile and never pick up the new code). Keep the pnpm store.
$dshHome = 'C:\Users\SteveDempsey\.dsh'
Remove-Item -Recurse -Force "$dshHome\profiles\desktop" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dshHome\desktop\rollback" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dshHome\desktop\staging" -ErrorAction SilentlyContinue
Write-Host "profile cleared"

# 4. Relaunch.
$exe = 'C:\Users\SteveDempsey\AppData\Local\Programs\DeepSeek Harness\DeepSeek Harness.exe'
if (Test-Path $exe) {
  Start-Process $exe
  Write-Host "relaunched"
} else {
  Write-Host "app exe not found after install: $exe" -ForegroundColor Red
}

Write-Host "done"

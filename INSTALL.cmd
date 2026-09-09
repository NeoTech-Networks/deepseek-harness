@echo off
REM Double-click this file to install the DeepSeek Harness build.
REM
REM It exists because a pasted PowerShell one-liner gives no clue when it fails:
REM the window closes and takes the error with it. This wrapper keeps the window
REM open, writes a transcript, and reports the exit code.
REM
REM Do NOT run it from a terminal inside the DeepSeek Harness app: step 1 of the
REM install force-closes that app.

setlocal
set "SCRIPT=%~dp0finish-install.ps1"
set "LOG=%~dp0install-log.txt"

echo Running: %SCRIPT%
echo Transcript: %LOG%
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -Command ^
  "Start-Transcript -Path '%LOG%' -Force | Out-Null; try { & '%SCRIPT%' } catch { Write-Host $_ -ForegroundColor Red }; Stop-Transcript | Out-Null; Write-Host ''; Write-Host 'Finished. This window stays open so you can read the output above.' -ForegroundColor Cyan"

endlocal

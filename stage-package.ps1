# Stage the unsigned Windows installer for the current port (repo = this script's folder).
#
# Run this through Start-Process with -WindowStyle Hidden and NO stdio
# redirection. prepare-dsh.ts requires a real console handle; a redirected file
# is not a console and the packaging step fails partway through. Progress
# therefore comes from apps/desktop/.desktop-build/packaging-runs/<id>/events.jsonl
# and from the status file this script writes, never from this window.
#
# CI=true is set HERE, inside the script, not passed as an argument or an inline
# assignment: the lefthook typecheck needs it and an inline env assignment does
# not survive into the nested pnpm/tsx processes.

$ErrorActionPreference = 'Stop'
$env:CI = 'true'

# Windows ships bsdtar at System32; Git for Windows ships GNU tar, and a
# developer shell puts Git's usr\bin first. GNU tar reads the drive letter in
# C:\... as an rsh host and prepare:packages dies with
#
#   tar (child): Cannot connect to C: resolve failed
#
# Put System32 first so the Windows bsdtar wins, whatever shell launched this.
$system32 = Join-Path $env:WINDIR 'System32'
if (($env:PATH -split ';')[0] -ne $system32) { $env:PATH = "$system32;$env:PATH" }

# Electron runtime download.
#
# github.com and release-assets.githubusercontent.com are unreachable for HTTP
# from this machine (TCP 443 connects, the transfer stalls: measured with curl
# on 2026-10-17 - github.com returned a 302 after 34 s and then zero bytes).
# The public mirror cdn.npmmirror.com does serve the bytes, but slowly enough
# that @electron/get's fixed 10 s connect timeout trips intermittently.
#
# So the artifact is served from a local mirror built from the verified cache:
# mirrors/electron/44.7.0/electron-v44.7.0-win32-x64.zip is byte-identical to
# the published one (sha256 eee30dc8fa1f5ea95490e59f44e46ea68dd24c6e93d22facf70fe5c2d4c2665c,
# cross-checked against npmmirror's SHASUMS256.txt on 2026-10-17), and the real
# SHASUMS256.txt sits beside it. Checksum validation is NOT weakened: the same
# published checksum list is still enforced, just read over loopback.
#
# Only when a caller has not already chosen a mirror.
if (-not $env:ELECTRON_MIRROR) {
    $mirrorRoot = Join-Path $PSScriptRoot 'apps\desktop\.desktop-build\local-electron-mirror'
    $mirrorPort = 18777
    $mirrorUp = $false
    if (Test-Path $mirrorRoot) {
        try {
            $null = Invoke-WebRequest -Uri "http://127.0.0.1:$mirrorPort/mirrors/electron/v44.7.0/SHASUMS256.txt" -TimeoutSec 5 -UseBasicParsing
            $mirrorUp = $true
        } catch {
            Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', "$mirrorPort", '--bind', '127.0.0.1' `
                -WorkingDirectory $mirrorRoot -WindowStyle Hidden
            Start-Sleep -Seconds 2
            try {
                $null = Invoke-WebRequest -Uri "http://127.0.0.1:$mirrorPort/mirrors/electron/v44.7.0/SHASUMS256.txt" -TimeoutSec 10 -UseBasicParsing
                $mirrorUp = $true
            } catch { $mirrorUp = $false }
        }
    }
    if ($mirrorUp) {
        $env:ELECTRON_MIRROR = "http://127.0.0.1:$mirrorPort/mirrors/electron/"
    } else {
        $env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
    }
}

$repo   = $PSScriptRoot
$desktop = Join-Path $repo 'apps\desktop'
$status  = Join-Path $repo 'package-status.json'

function Write-Status {
    param([string]$State, [int]$Code, [string]$Detail)
    $payload = [ordered]@{
        state      = $State
        exit_code  = $Code
        detail     = $Detail
        finished   = (Get-Date).ToString('o')
        repo       = $repo
    }
    ($payload | ConvertTo-Json) | Set-Content -LiteralPath $status -Encoding utf8
}

Write-Status -State 'running' -Code -1 -Detail 'package:win:x64:unsigned started'

try {
    Push-Location $desktop
    & pnpm run package:win:x64:unsigned
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -ne 0) {
        Write-Status -State 'failed' -Code $code -Detail "package:win:x64:unsigned exited $code"
        exit $code
    }
    Write-Status -State 'ok' -Code 0 -Detail 'package:win:x64:unsigned finished'
    exit 0
} catch {
    try { Pop-Location } catch { }
    Write-Status -State 'failed' -Code 1 -Detail $_.Exception.Message
    exit 1
}

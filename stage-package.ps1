# Stage the unsigned Windows installer for the 0.2.1-rc.2 port.
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

# github.com and release-assets.githubusercontent.com are unreachable for HTTP
# from this machine (TCP 443 connects, the transfer stalls: measured with curl
# on 2026-10-17 - github.com returned a 302 after 34 s and then zero bytes).
# @electron/get honours ELECTRON_MIRROR, and cdn.npmmirror.com serves the same
# bytes at about 4 MB/s. Only set it when the caller has not chosen one.
if (-not $env:ELECTRON_MIRROR) {
    $env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
}

$repo   = 'C:\d212'
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

# Package the 0.2.2-rc.1 unsigned Windows installer from C:\d217.
#
# Launched with a real (hidden) console by the caller: apps/desktop/scripts/
# prepare-dsh.ts spawns pnpm with stdio 'inherit', which needs a console
# handle; a harness background pipe or a redirected file is not one, and the
# run then dies at runtime:lockfile with 2147483651 (ledger 44).
#
# CI is set HERE, inside the script, never through -ArgumentList: a quoting
# slip there silently drops it and pnpm's deps-status check then fails (ledger 44).

$ErrorActionPreference = 'Continue'
$repo   = 'C:\d217'
$status = Join-Path $repo 'packaging-status.txt'

function Write-Status([string]$text) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $text"
    Add-Content -Path $status -Value $line -Encoding utf8
}

Set-Content -Path $status -Value "started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Encoding utf8
$env:CI = 'true'
Set-Location $repo

Write-Status 'pnpm run package:desktop:win:x64:unsigned  -> running'
try {
    & pnpm run package:desktop:win:x64:unsigned 2>&1 | ForEach-Object { Add-Content -Path (Join-Path $repo 'packaging.log') -Value $_ -Encoding utf8 }
    $code = $LASTEXITCODE
} catch {
    Write-Status "EXCEPTION: $($_.Exception.Message)"
    $code = 99
}

if ($code -eq 0) {
    Write-Status 'EXIT 0 (packaging finished)'
} else {
    Write-Status "EXIT $code (packaging FAILED - see packaging.log)"
}
exit $code

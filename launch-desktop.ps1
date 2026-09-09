# DeepSeek Harness desktop launcher (hidden console, no DevTools).
# Reads the persisted keys so a double-clicked shortcut gets them regardless of
# Explorer's cached environment, then starts the app in dev mode.
$ErrorActionPreference = 'SilentlyContinue'
foreach ($name in 'ANTHROPIC_API_KEY','ZAI_API_KEY','DSH_GITHUB_TOKEN','POSTGRES_MCP_TOKEN') {
  $val = [Environment]::GetEnvironmentVariable($name, 'User')
  if ($val) { [Environment]::SetEnvironmentVariable($name, $val, 'Process') }
}
$env:DSH_DESKTOP_OPEN_DEVTOOLS = '0'
Set-Location 'C:\Projects\repos\deepseek-harness'
pnpm run start:desktop

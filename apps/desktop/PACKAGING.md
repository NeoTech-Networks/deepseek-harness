# Packaging the NeoTech fork on Windows (0.1.7 line)

The fork is built on one Windows machine and installed from an unsigned NSIS installer.
There is no update feed and no signing certificate.

## Settings live in `apps/desktop/.env.windows`, not in the shell

0.1.7 reads release settings only from this git-ignored file. Values exported in the shell
(`DSH_DESKTOP_*`, `DOWNLOAD_*`, `CSC_*`) are stripped before packaging, so the 0.1.5 recipe of
exporting them no longer works. The file needs exactly two lines:

```
DSH_DESKTOP_APP_ID=com.deepseek.harness
DSH_DESKTOP_MANDATORY_UPDATE_CONFIG=off
```

- `DSH_DESKTOP_APP_ID` is not free choice. electron-builder derives the NSIS uninstall key as
  `uuid5(appId, 50e065bc-3134-11e6-9bab-38c9862bdaf3)`, and only `com.deepseek.harness` yields the
  live key `7808434f-469e-5eba-848e-edf64d3b94ce`. Any other value installs a second copy beside
  the running one instead of upgrading it.
- `DSH_DESKTOP_MANDATORY_UPDATE_CONFIG=off` is a fork-only opt-out
  (`scripts/desktop-policy-environment.mjs`). Upstream embeds a mandatory-update policy origin in
  every packaged build, and a blocking answer from it locks the UI. An unsigned local build has no
  feed to install from, so the fork builds without the policy. Any other value keeps upstream
  behaviour.
- `DSH_DESKTOP_ALLOW_UNSIGNED` and `DOWNLOAD_TEST_ORIGIN` from the 0.1.5 line are gone: the unsigned
  build is selected by the script name below, and an unsigned build never reads a download origin.

## Build

From PowerShell (Git Bash's GNU tar reads `C:\...` as a remote host):

```
$env:CI = 'true'          # install-lefthook refuses the machine-wide core.hooksPath otherwise
pnpm install
pnpm run build
pnpm --filter @deepseek-ai/dsh-desktop run package:win:x64:unsigned
```

Needs the Visual Studio C++ build tools and a Windows SDK (the installer UI helper is compiled
with `cl`). Clear any stale `apps\desktop\.desktop-build\targets\win-x64\win-unpacked*` first; an
`EPERM` renaming `win-unpacked.tmp` is the antivirus scanner, pause and rerun once.

## Artifact

```
apps\desktop\.desktop-build\targets\win-x64\unsigned-artifacts\deepseek-harness-<version>-win-x64-unsigned.exe
```

The feature code ships inside `resources\app.asar` (`dsh/node_modules/@deepseek-ai/...`); nothing is
extracted into `~\.dsh` any more. `finish-install.ps1` at the repo root installs it.

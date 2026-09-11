# Windows packaging environment for this fork

This is the NeoTech fork's local packaging record. It exists because
`DSH_DESKTOP_APP_ID` and `DOWNLOAD_TEST_ORIGIN` are recorded nowhere else in this
repository, and packaging fails before it builds without them. They had to be
recovered from an old session transcript once already (harness `OPEN_ISSUES` 13).
None of these values is a secret.

Copy the assignments into the packaging shell, or export them, then run the fixed
Windows target:

```powershell
$env:DSH_DESKTOP_APP_ID = 'com.deepseek.harness'
$env:DOWNLOAD_TEST_ORIGIN = 'https://download.neotech.biz'
$env:DSH_DESKTOP_ALLOW_UNSIGNED = '1'
pnpm run package:desktop:win:x64
```

Run it from PowerShell, never from Git Bash: the release step shells out to
`tar`, and Git Bash's GNU tar reads a `C:\...` output path as a remote host and
dies with `Cannot connect to C: resolve failed`.

| Variable | Value | Why |
|---|---|---|
| `DSH_DESKTOP_APP_ID` | `com.deepseek.harness` | Reverse-DNS application id. NOT a free choice: electron-builder derives the NSIS uninstall key as `uuid5(appId, ns=50e065bc-3134-11e6-9bab-38c9862bdaf3)`, so only the id that yields the LIVE uninstall key upgrades the running app in place. `com.deepseek.harness` yields `7808434f-469e-5eba-848e-edf64d3b94ce`, which is the key the installed 0.1.5 line uses. A wrong id does not fail the build: it installs a SECOND, parallel copy of the app, leaves the running one untouched, and looks exactly like "the update did nothing". |
| `DOWNLOAD_TEST_ORIGIN` | `https://download.neotech.biz` | Test update deployment origin. Must be an HTTPS origin with no path, no query and no credentials. |
| `DSH_DESKTOP_ALLOW_UNSIGNED` | `1` | This machine has no GlobalSign EV certificate and no SafeNet token, so code signing is opted out for LOCAL builds only, which also skips the SignTool hook. A real release must sign; see the Windows EV signing section of `README.md`. |

A checked-in `.env.example` would be the more obvious home for this, but the
repository's pre-commit hook refuses to commit credential or settings files by
that name, and bypassing it with `--no-verify` is not an acceptable trade for a
documentation file.

## 2026-09-08 - Workspace group headers: color + alphabetical sort

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-workspace tree tests | 40 pass (1 new) | 40/40 | VERIFIED |
| group sections alphabetical | A-to-Z regardless of workspace order | new test asserts Alpha/Beta/Mike/Zeta | VERIFIED |
| group header color | darker brand blue + dark-theme override | token values confirmed in design-platform.css | VERIFIED |
| commit + push | neotech fork, feat/open-session-in-subfolder | f562c0a27f + 1116f9b306 pushed | VERIFIED |
| live desktop smoke (blue + sorted) | headers blue, groups A-to-Z | not run (user-gated GUI) | UNVERIFIED |

## 2026-09-08 - Composer shortcuts and right sidebar default

| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck (host + client) | exit 0 | exit 0 both | VERIFIED |
| input-bar tests | 79 pass (4 new) | 79/79 | VERIFIED |
| full pnpm build | exit 0 | exit 0, 236 client artifacts | VERIFIED |
| commit + push | 88a2289cc3 to neotech fork | pushed feat/open-session-in-subfolder | VERIFIED |
| installed-profile patch | shortcut + autoOpen false present | grep confirms both in ~/.dsh/profiles/desktop | VERIFIED |
| live desktop smoke (shortcuts + sidebar) | works in installed app | user reported sidebar still opening; needs full restart after settings.yaml autoOpen:false | UNVERIFIED |

## 2026-09-08 - Vision-routing auto image description and gate fixes

| Check | Expected | Result | Status |
|---|---|---|---|
| tsc -b tsconfig.host.json | exit 0 | exit 0 | VERIFIED |
| oxlint (changed files) | 0 errors | 0 errors | VERIFIED |
| vision-routing tests | pass | 10 passed | VERIFIED |
| session-models.host tests | pass | 15 passed | VERIFIED |
| cordis-config-files spec | pass | 2 passed | VERIFIED |
| verify-cordis-config | pass | 137 config files | VERIFIED |
| verify-package-invariants | pass | 39 companions conform | VERIFIED |
| verify-export-jsdoc | pass | documented | VERIFIED |
| verify-cordis-catalog | pass | 103 regions up to date | VERIFIED |
| verify-translation-pairing | pass | 756 pairs consistent | VERIFIED |
| verify-type-equiv | pass | 417 blocks match | VERIFIED |
| verify-subsystem-pages | pass | 52 groups conform | VERIFIED |
| live desktop smoke of auto-vision | image described | not run (user-gated GUI) | UNVERIFIED |

## 2026-09-08 - Windows installer build, install, session-creation fix

| Check | Expected | Result | Status |
|---|---|---|---|
| verify-package-dependencies | exit 0 | 61 packages match policy | VERIFIED |
| desktop signing tests | pass | 3 files, 23 tests | VERIFIED |
| package:desktop:win:x64 | exit 0 + exe | 182 MB unsigned exe (NotSigned) | VERIFIED |
| install | exe + Start Menu entry | installed, .lnk present | VERIFIED |
| app uses ~/.dsh not dev home | profile under ~/.dsh | ~/.dsh/profiles/desktop created | VERIFIED |
| profile version | 0.1.3-alpha.2 | desktop-release.json 0.1.3-alpha.2 | VERIFIED |
| app renders UI | window renders | vision-confirmed sidebar/New Session | VERIFIED |
| New Session | succeeds | was failing; fixed, new session created + user confirms | VERIFIED |
| quit-confirm intercepts close | app stays running | app stayed running after CloseMainWindow | VERIFIED |
| quit-confirm dialog visual | dialog visible | not visually confirmed (RDP) | UNVERIFIED |

## 2026-09-08 - Dependency gate and renderer rebuild

| Check | Expected | Result | Status |
|---|---|---|---|
| verify-package-dependencies | 0 violations | 61 packages match policy, exit 0 | VERIFIED |
| pnpm build | exit 0 | exit 0, 236 artifacts, 3 public values | VERIFIED |
| dockkit in apps/web/dist (seed table) | present | 3 files contain dockkit | VERIFIED |
| build record sha256 + commit | fresh + current | a93c618c... + 9a30a55 (HEAD) | VERIFIED |
| verify-client-packages | clean | exit 0 | VERIFIED |
| typecheck | clean | exit 0 | VERIFIED |
| launch smoke (no "missed the module table") | renderer reaches UI | reached startup prompt | VERIFIED |
| session creation | succeeds | "Cannot find package" ~20 plugins | BLOCKED |
## 2026-09-08 - Quit confirmation on the desktop shell

| Check | Expected | Result | Status |
|---|---|---|---|
| desktop shell build | exit 0 | exit 0 (tsc -b + tsdown) | VERIFIED |
| lib/main.js contains the handler | quitConfirmTitle / quitConfirmMessage and close handler present | 6 matches (lines 4439-4479, 4924-4939) | VERIFIED |
| live smoke test (X prompts the dialog) | dialog appears, Quit / Cancel behave | not run (needs app relaunch) | UNVERIFIED |

## 2026-09-08 - Open a session in a sub-directory

| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck (ui-sidebar-files, ui-workspace) | clean | clean | VERIFIED |
| tests (ui-workspace + ui-sidebar-files) | pass | 213 passed (15 files) | VERIFIED |
| lint (changed files) | 0 errors | 0 errors | VERIFIED |
| verify-client-packages | clean | clean | VERIFIED |
| push to org fork | succeeds | feat + master pushed to NeoTech-Networks/deepseek-harness | VERIFIED |
| verify-package-dependencies | clean | 2 violations, both in the in-flight session-status work, not this change | UNVERIFIED |
| live desktop smoke of the two gestures | not run | user-gated GUI | UNVERIFIED |

## 2026-09-07 - Session status icons

| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck | clean | clean (host + client) | VERIFIED |
| lint (session-status packages) | 0 errors | 0 errors | VERIFIED |
| targeted tests | pass | 209 passed (15 files) | VERIFIED |
| coverage (session-status) | 100% per-file | 100% statements/branches/functions/lines | VERIFIED |
| doc-sync | all gates | 32/33; one pre-existing Windows symlink EPERM | VERIFIED |
| bundle composition | 3 plugins in tree | confirmed via `--dump-default-config` | VERIFIED |
| live desktop screenshot | icons visible in sidebar | not run (user-gated GUI) | UNVERIFIED |


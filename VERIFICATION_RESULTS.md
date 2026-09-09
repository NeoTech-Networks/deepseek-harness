## 2026-09-09 - accountUsage remote mount, desktop boot restored

| Check | Expected | Result | Status |
|---|---|---|---|
| named the failing entry | one entry, named, with its missing service | renderer console: `web boot: 1 entry did not activate / @deepseek-ai/dsh-account-usage: pending (waiting for service: remote.accountUsage)` | VERIFIED |
| fix reaches the built bundle | accountUsage present in dsh-api-remotes client bundle | 0 occurrences before, 3 after; control namespace pinnedFiles 45 both times | VERIFIED |
| mount list grew by one | 16 contributions in the `$mount` loop | 15 before, 16 after; the unsuffixed TYPERT_REMOTE is the account-usage descriptor | VERIFIED |
| fix reaches the installer | tarball and package-set carry it | `deepseek-ai-dsh-api-remotes-0.1.3-alpha.2.tgz` in both packed/dsh and package-set: 3 occurrences | VERIFIED |
| no stale-package race | no lib output newer than the installer | 0 files newer than the 21:03:03 installer | VERIFIED |
| profile carries the fix | installed api-remotes bundle has it | 3 occurrences in the re-extracted profile, 246 packages, workaround file gone | VERIFIED |
| app reaches a usable window | no pending, no failed, boot page gone | DOM read: hasPending false, hasBootFailed false, bootPageVisible false, sidebar and chat rendered | VERIFIED |
| no swallowed failure | diagnostic file absent after a clean launch | DSH_DESKTOP_DIAGNOSTIC_FILE set, file ABSENT | VERIFIED |
| new session works | message sent and answered | new session, `BOOT OK` returned in 10s | VERIFIED |
| usage readout renders | percentages beside the stats line | `5h 37% - Week 24%` in the composer dock, in a session created after the reinstall | VERIFIED |
| vision routing, native | image described not dropped | Claude Opus 5: "A single red circle on a white background." | VERIFIED |
| vision routing, sidecar | text-only model receives a description | DeepSeek-V4-Flash: `[Attached image description (vision model): A single solid red circle...]`, no raw placeholder | VERIFIED |
| MCP servers mount | stdio children spawned by the host | claude-design-bridge, Claude Memory Bridge, @playwright/mcp under the app's host child | VERIFIED |
| hook bridge mounts | Claude Code hooks fire in a new session | `Context injection - hooks-claude-code` shown in the fresh session | VERIFIED |
| rebase moved no files | working tree byte-identical | same 4 modified files before and after; new commit tree == old commit tree | VERIFIED |
| wip commit no longer carries the fix | api-remotes absent from it | `git show --stat 78d5d95934 -- packages/api/remotes/` returns nothing | VERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| host suite | grant handling, cache, degraded answers | 15/15 pass (usage.spec.ts) | VERIFIED |
| client suite | both percentages, panel, feed cadence | 12/12 pass (account-usage-line.client.spec.tsx) | VERIFIED |
| no token on the wire | snapshot JSON free of the access token | asserted in "reports the account figures" test | VERIFIED |
| repo typecheck | exit 0 | `pnpm run typecheck` exit 0 | VERIFIED |
| full build | exit 0 | `pnpm build` exit 0 | VERIFIED |
| live read-back vs raw endpoint | service figures equal the account's own | 5h 20 / week 20 / credits 11094 both sides at 2026-09-08T21:45:08Z | VERIFIED |
| installer carries the package | seed manifest names dsh-account-usage | present in the built and installed seed | VERIFIED |
| install landed | app files replaced by the new build | app exe and seed written 2026-09-08 19:10 | VERIFIED |
| running app has the code | profile carries the package and dock wiring | profile client.js 18.7 KB, web-app patch lists account-usage, app started 19:59 | VERIFIED |
| desktop footer on screen | two percentages beside the stats line | not yet looked at (user-gated) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| flag in source | CREATE_NO_WINDOW in CreateProcessW flags | process.ts:534 ORs CREATE_NO_WINDOW | VERIFIED |
| bundle folded value | 0x08000404 = 134218756 | lib/index.js line 615 = 134218756 | VERIFIED |
| profile copy updated | running bundle carries flag | profile lib/index.js grep = 134218756 | VERIFIED |
| pwsh tool still runs | exit 0, output | pwsh-restored-ok returned | VERIFIED |
| headless spawn | no visible console window | conhost MainWindowHandle 0, empty title | VERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| session-status vocab lock | 5 tuples id/label/icon/tone | 11/11 tests pass | VERIFIED |
| shipped-preset completeness | command+tool session-status in std/cordis/ptc | 6/6 tests pass | VERIFIED |
| ui-workspace rows + tree | unchanged | 36 + 40 pass | VERIFIED |
| full targeted run | 93/93 across 4 files | 4 files passed | VERIFIED |
| live desktop smoke (/status icons) | glyphs show | needs app relaunch (user-gated) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| session-models host tests | 15 pass (1 new assertion) | 15/15 | VERIFIED |
| host typecheck | exit 0 | tsc -b tsconfig.host.json exit 0 | VERIFIED |
| drop-image change in built lib | filter removes image blocks | content.filter(...) present in lib/index.js | VERIFIED |
| profile lib updated | change in installed profile | 1 match in ~/.dsh/profiles/desktop node_modules lib/index.js | VERIFIED |
| live end-to-end (attach image) | only description, no placeholder | operator confirmed: only [Attached image description], no [image omitted] | VERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| finish-install.ps1 re-parses | PARSE OK | PSParser::Tokenize no errors | VERIFIED |
| no reserved $home assignment | only $dshHome | grep -i '$home' no match; 4x $dshHome | VERIFIED |
| installer exit code | 0 | installer exit code: 0 (log) | VERIFIED |
| profile cleared and relaunched | cleared, relaunched | both lines present in log | VERIFIED |
| app running with vision-routing | process, window, package | 4 procs, window Responding, package in node_modules + seed | VERIFIED |
| live vision smoke (attach image) | model receives description | not run (user-gated GUI) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| ui-workspace tests | 173 pass (1 new) | 173/173 (10 files) | VERIFIED |
| client typecheck | exit 0 | tsc -b tsconfig.client.json exit 0 | VERIFIED |
| full pnpm build | exit 0 | exit 0 | VERIFIED |
| animation in built bundle | scoped pulse rule + keyframe present | confirmed in ui-workspace/lib/client.js | VERIFIED |
| save-state wrapper regenerated | section 7 present | confirmed in ~/.dsh/skills/save-state.md | VERIFIED |
| finished status auto-set on save-state | set_session_status called | tool not in agent catalog, step could not run | BLOCKED |
| live desktop smoke (pulse + Finished) | pulse + green check visible | not run (needs app relaunch) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| ui-workspace tree tests | 40 pass (1 new) | 40/40 | VERIFIED |
| group sections alphabetical | A-to-Z regardless of workspace order | new test asserts Alpha/Beta/Mike/Zeta | VERIFIED |
| group header color | darker brand blue + dark-theme override | token values confirmed in design-platform.css | VERIFIED |
| commit + push | neotech fork, feat/open-session-in-subfolder | f562c0a27f + 1116f9b306 pushed | VERIFIED |
| live desktop smoke (blue + sorted) | headers blue, groups A-to-Z | not run (user-gated GUI) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck (host + client) | exit 0 | exit 0 both | VERIFIED |
| input-bar tests | 79 pass (4 new) | 79/79 | VERIFIED |
| full pnpm build | exit 0 | exit 0, 236 client artifacts | VERIFIED |
| commit + push | 88a2289cc3 to neotech fork | pushed feat/open-session-in-subfolder | VERIFIED |
| installed-profile patch | shortcut + autoOpen false present | grep confirms both in ~/.dsh/profiles/desktop | VERIFIED |
| live desktop smoke (shortcuts + sidebar) | works in installed app | user reported sidebar still opening; needs full restart after settings.yaml autoOpen:false | UNVERIFIED |
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
| Check | Expected | Result | Status |
|---|---|---|---|
| desktop shell build | exit 0 | exit 0 (tsc -b + tsdown) | VERIFIED |
| lib/main.js contains the handler | quitConfirmTitle / quitConfirmMessage and close handler present | 6 matches (lines 4439-4479, 4924-4939) | VERIFIED |
| live smoke test (X prompts the dialog) | dialog appears, Quit / Cancel behave | not run (needs app relaunch) | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck (ui-sidebar-files, ui-workspace) | clean | clean | VERIFIED |
| tests (ui-workspace + ui-sidebar-files) | pass | 213 passed (15 files) | VERIFIED |
| lint (changed files) | 0 errors | 0 errors | VERIFIED |
| verify-client-packages | clean | clean | VERIFIED |
| push to org fork | succeeds | feat + master pushed to NeoTech-Networks/deepseek-harness | VERIFIED |
| verify-package-dependencies | clean | 2 violations, both in the in-flight session-status work, not this change | UNVERIFIED |
| live desktop smoke of the two gestures | not run | user-gated GUI | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| typecheck | clean | clean (host + client) | VERIFIED |
| lint (session-status packages) | 0 errors | 0 errors | VERIFIED |
| targeted tests | pass | 209 passed (15 files) | VERIFIED |
| coverage (session-status) | 100% per-file | 100% statements/branches/functions/lines | VERIFIED |
| doc-sync | all gates | 32/33; one pre-existing Windows symlink EPERM | VERIFIED |
| bundle composition | 3 plugins in tree | confirmed via `--dump-default-config` | VERIFIED |
| live desktop screenshot | icons visible in sidebar | not run (user-gated GUI) | UNVERIFIED |
| plan-mode tests | pass | 93/93 (4 spec files) | VERIFIED |
| plan-mode typecheck | exit 0 | tsc -b packages/plan/plan-mode/tsconfig.json exit 0 | VERIFIED |
| host lib build | exit 0 | pnpm build:lib:host exit 0 | VERIFIED |
| profile lib updated | pinInitialPlanMode present | grep confirms in ~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-plan-mode/lib/index.js | VERIFIED |
| profile presets updated | defaultActive: true | grep confirms standard/ptc/cordis agent.cordis.yml | VERIFIED |
| live behavior | new session starts in plan mode | user restarted and confirmed "Appears to work" | VERIFIED |
| remote origin | NeoTech fork | read back correct | VERIFIED |
| state worker | exit 0 | PR #2/#3 merged | VERIFIED |

## 2026-09-08 - Claude Max usage readout in the composer footer


## 2026-09-08 - Console window hidden on subprocess spawn


## 2026-09-08 - Session-status triggers composed into the presets


## 2026-09-08 - Drop the [image omitted] placeholder next to vision descriptions


## 2026-09-08 - finish-install.ps1 $home fix and vision-routing install


## 2026-09-08 - Plan-mode icon animation and finished icon after save-state


## 2026-09-08 - Workspace group headers: color + alphabetical sort


## 2026-09-08 - Composer shortcuts and right sidebar default


## 2026-09-08 - Vision-routing auto image description and gate fixes


## 2026-09-08 - Windows installer build, install, session-creation fix


## 2026-09-08 - Dependency gate and renderer rebuild

## 2026-09-08 - Quit confirmation on the desktop shell


## 2026-09-08 - Open a session in a sub-directory


## 2026-09-07 - Session status icons

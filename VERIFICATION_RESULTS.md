## 2026-09-10 - All Sessions sidebar section

| Check | Expected | Result | Status |
|---|---|---|---|
| Client typecheck | exit 0 | tsc -b tsconfig.client.json exit 0 | VERIFIED |
| Targeted tests | pass | 69 passed across tree, apply, sidebar-root, all-sessions | VERIFIED |
| Lint (changed files) | 0 errors | oxlint 0 errors on 8 src files | VERIFIED |
| Client slot catalog | current | gen-client-catalog --check up to date | VERIFIED |
| Agent Note + READMEs | pass gates | format/classification/pairing all pass | VERIFIED |
| Feature in the packed package | AllSessionsSection present | found in dsh-client-ui-workspace .tgz lib/client.js | VERIFIED |
| Installer artifact | ~185 MB | 194,723,910 bytes, packaged exit 0 | VERIFIED |
| Installed app shows the section | renders above Workspaces | install NOT confirmed by Steve | UNVERIFIED |

## 2026-09-09 - Right sidebar per-session width port and install

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-layout + ui-sidebar-right suites | pass | 249/249 across 16 files | VERIFIED |
| Client typecheck | exit 0 | exit 0 | VERIFIED |
| Catalog gates (cordis-inspect, client-catalog, cordis-api) | up to date | all three pass | VERIFIED |
| Full build | exit 0 | exit 0, 240 client artifacts | VERIFIED |
| Packaging | exit 0 | exit 0, installer 194,643,720 bytes | VERIFIED |
| Fix in packaged seed | rightbarBySession present | 6 occurrences in dsh-client-ui-layout client.js | VERIFIED |
| Commit + push | on update/v0.1.5-alpha.2 | bf27396cf6 pushed | VERIFIED |
| Install | seed integrity clean | install-log 271/271 PASS, profile cleared, relaunched | VERIFIED |
| Fix in RUNNING profile | rightbarBySession present, old rightbar gone | 6 occurrences, no legacy rightbar | VERIFIED |
| Settings survived | unchanged | dsh-config-vault 18 files all same | VERIFIED |
| Per-session width on screen | independent widths | not yet eyeballed | UNVERIFIED |
## 2026-09-09 - Alt+S / Alt+P root cause, fix, and the two update-survival guards

| Check | Expected | Result | Status |
|---|---|---|---|
| Shortcut code in the running 0.1.5-alpha.1 build | present or absent | PRESENT, `SAVE_STATE_SHORTCUT` at line 15794 of the profile's `dsh-client-ui-conversation/lib/client.js`; not a lost commit | VERIFIED |
| Same code in a real browser | fires or not | FIRES; headless Chromium against `dsh web` submitted `/save-state`, turn admitted | VERIFIED |
| Real Alt+S into a real Electron window | keydown delivered | NOT DELIVERED; only `AltLeft` keydown plus a `KeyS` KEYUP with altKey | VERIFIED |
| Application menu as the cause | ruled in or out | RULED OUT; identical with `setApplicationMenu(null)` | VERIFIED |
| `before-input-event` in the main process | sees the keydown | NO; same keyUp-only pair | VERIFIED |
| Hidden menu accelerator `Alt+S` | fires | NO, never fired | VERIFIED |
| `SendKeys` as a probe | valid | INVALID; no scan code, so every event arrives with an empty `code`. `SendInput` with `KEYEVENTF_SCANCODE` is the correct instrument | VERIFIED |
| Fix: bind to keyup | tests | 93/93 input-bar, 400/400 across ui-conversation and plan-mode | VERIFIED |
| Typecheck and build | exit 0 | both exit 0 | VERIFIED |
| Rebuilt bundle in a real browser | still submits | YES, `/save-state` admitted with the keyup binding | VERIFIED |
| Fix inside the packaged installer | present | `shortcutUnavailable` and `deploy to production` found in the seed `.tgz` for `dsh-client-ui-conversation` | VERIFIED |
| Installer artifact | exists | `deepseek-harness-0.1.5-alpha.2-win-x64.exe`, 194,655,398 bytes, packaged exit 0 | VERIFIED |
| Config vault round trip | byte identical | sha256 match after corrupt-restore and after delete-restore of `skills/dtp.md` | VERIFIED |
| Vault secret guard | no secret in history | 4 live credential values searched across `git log -p --all`, 0 hits; 0 credential paths ever added | VERIFIED |
| Vault drift detection | exit 3 and names the file | yes, and prints the restore command | VERIFIED |
| Daily snapshot task | exists and runs | `DSH Config Vault Snapshot`, next 2026-09-10 09:00, manual run LastTaskResult 0 | VERIFIED |
| Local-feature marker check | catches a missing feature | yes; reports exactly the two shortcut markers as absent from the build not yet installed | VERIFIED |
| Fixed build under a REAL Electron window, REAL OS keystroke | Alt+S submits | SUBMITTED `/save-state`; turn ran and failed only on the scratch home's missing API key, which is the admission proof | VERIFIED |
| Same, Alt+P | submits the promote phrase | SUBMITTED `deploy to production`, lowercase and exact | VERIFIED |
| The keyup-only behaviour in that same run | reconfirmed | main process logged `keyDown AltLeft`, then `keyUp KeyS` / `keyUp KeyP`, no letter keydown | VERIFIED |
| Install performed | 0.1.5-alpha.2 running | installed 14:29, profile re-extracted 14:34, four processes from the new install | VERIFIED |
| Fix in the RUNNING profile | keyup binding present | `addEventListener("keyup", onShortcut)` L16029, `DEPLOY_SHORTCUT = "deploy to production"` L15815, `shortcutUnavailable` toast L16022 | VERIFIED |
| Local features after the update | none dropped | `dsh_local_features_check.py` 10 of 10 ok, exit 0 | VERIFIED |
| Settings after the update | untouched | `dsh_config_vault.py verify` 18 files all same exit 0; post-install snapshot 0 changed | VERIFIED |
| Alt+S in the INSTALLED app | works | WORKS; confirmed by the operator after the install | VERIFIED |


## 2026-09-09 - Why no state-sync PR can merge on this fork

| Check | Expected | Result | Status |
|---|---|---|---|
| Status PR exists | worker opened one | #6, `chore/state-sync-2026-09-09-163027`, opened 16:31:48Z | VERIFIED |
| Why it will not merge | a real reason, not a flake | `Issue policy` and `Issue lifecycle` fail in 9s on every run | VERIFIED |
| The failure text | names the cause | `The 'client-id' (or deprecated 'app-id') input must be set to a non-empty string` | VERIFIED |
| Whose credential | upstream only | both call `create-github-app-token` with `owner: deepseek-harness` | VERIFIED |
| Other checks | not the problem | `node 26`, `node 24.9`, `Pack npm tarballs`, python matrix all pass | VERIFIED |
| Second, separate failure | push, not merge | lefthook `pre-push` typecheck dies building `fs-ext` with no Visual Studio | VERIFIED |
| Save-state writer as suspect | ruled in or out | RULED OUT; `apply_marker_block` L1030-1079 has no shortening branch | VERIFIED |
| Stale copies on this machine | counted | 8 of 10 checkouts hold short copies against 287 in git | VERIFIED |
| Who publishes the stale copy | named | not identified; worker and /save-state remain the candidates | UNVERIFIED |

## 2026-09-09 - 0.1.5-alpha.2 build gates and installer proof (PRE-install; nothing here is live yet)

Worktree `C:/Projects/worktrees/dsh-update-v0.1.5-alpha.2`, branch
`update/v0.1.5-alpha.2`, rebased onto `dsh-v0.1.5-alpha.2` plus four cherry-picks.

| Check | Expected | Result | Status |
|---|---|---|---|
| Client typecheck | exit 0 | exit 0 after following two upstream API removals | VERIFIED |
| Full build | exit 0 | exit 0, 240 client artifacts recorded | VERIFIED |
| plan-mode suite | 94 of 94 | 94 passed across 4 files | VERIFIED |
| fs-local suite | old baseline 13 Windows failures | 156 passed, 1 skipped, 0 FAILED; baseline no longer applies | VERIFIED |
| Targeted suites (desktop, session-status, workspace, sidebar) | no regressions | 594 passed, 1 skipped, 50 files | VERIFIED |
| Packaging | exit 0 | exit 0, no EPERM this run | VERIFIED |
| Installer artifact | present, ~180-190 MB | 194,655,398 bytes | VERIFIED |
| Packaged seed version | 0.1.5-alpha.2 | `desktop-release.json` reads 0.1.5-alpha.2 | VERIFIED |
| Fork packages in the seed | all at the new version | 14 fork `.tgz` archives, every one 0.1.5-alpha.2 | VERIFIED |
| Session-status fix IS in the artifact | new symbol in built code | `SessionPanelPhase` found in the packaged `.tgz`'s `client.js` and `active.d.ts` | VERIFIED |
| Installed app updated | 0.1.5-alpha.2 | still 0.1.5-alpha.1; operator has not run the installer | NOT YET RUN |
| The six post-install rows | all pass | cannot be run before the install | UNVERIFIED |
## 2026-09-09 - Right sidebar per-session width fix

| Check | Expected | Result | Status |
|---|---|---|---|
| A session's drag does not leak into another | per-session width | layout-store test `keeps one session's width from leaking into another` passes | VERIFIED |
| The frame keys width by session | current session's own 45% default on switch | app-frame test `keys the saved right panel width by session, not globally` passes | VERIFIED |
| ui-layout + ui-sidebar-right suites | pass | 220 passed | VERIFIED |
| Client typecheck | exit 0 | exit 0 | VERIFIED |
| Client/cordis catalog gates | up to date | `gen-client-catalog --check` and `gen-cordis-api --check` pass | VERIFIED |
| Live desktop smoke test | panel width independent per session | not run, needs a build and install | UNVERIFIED |

## 2026-09-09 - Post-install: both fixes confirmed LIVE in the running profile

Installed 08:35, app relaunched 08:36, read back from
`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/`.

| Check | Expected | Result | Status |
|---|---|---|---|
| fs-local retry fix running | `publishOverExisting` present | `PUBLISH_RETRY_DELAYS_MS` L137, `publishOverExisting` L181 + L652 | VERIFIED |
| fs-local torn-read fix running | confirming re-read present | `readTextBytesConfirmingBinary` L449, L463, L471 | VERIFIED |
| plan-mode fix running | `describePlanFault` present | L59, L305, L474 | VERIFIED |
| Old plan gate gone from running code | zero matches | zero matches for `requires a non-empty markdown plan` | VERIFIED |
| Profile re-extracted | fresh, post-install | mtime 08:35, 247 packages (same count as the previous build) | VERIFIED |
| App booted | processes up after install | 4 processes, all started 08:36 | VERIFIED |
| No second parallel install | one app directory | one directory under `AppData\Local\Programs` | VERIFIED |
| No crash events | none for this app | Windows Application log empty for it | VERIFIED |
| The reported "crash" | explained, not a fault | `finish-install.ps1` step 1 is `taskkill /F`; forced close, script now announces it | VERIFIED |
| Items 1/2/5/10 re-check (code half) | feature packages really in the running profile | all 7 present; accountUsage mount in the running client bundle; `dsh-win32-process` carries CREATE_NO_WINDOW | VERIFIED |
| Items 1/2/5/10 (on-screen half) | visual behaviour | not checked, needs eyes on the GUI | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| Divergence between the fix's parent and the 0.1.5 head, 4 touched files | small | ONE line, `plan-mode.spec.ts:1025` (`tool/code-dispatch` renamed `tool/ptc-dispatch`), non-overlapping | VERIFIED |
| Cherry-pick | clean | exit 0, auto-merged, 4 files, 343 insertions | VERIFIED |
| fs-local suite | 6 new cases green, failures still exactly 13 | 142 passed, 13 failed (the pre-existing POSIX symlink/chmod EPERM set), 1 skipped; all 6 new cases named and passing | VERIFIED |
| plan-mode suite | 94/94 | 94/94 | VERIFIED |
| Repo typecheck | exit 0 | exit 0 | VERIFIED |
| Full build | exit 0 | exit 0, 240 client artifacts | VERIFIED |
| Packaging | installer emitted | exit 0, `deepseek-harness-0.1.5-alpha.1-win-x64.exe`, 190,730,194 bytes | VERIFIED |
| **fs-local fix inside the packaged seed** | `publishOverExisting` present | `PUBLISH_RETRY_DELAYS_MS` L137, `publishOverExisting` L181 + L652, `readTextBytesConfirmingBinary` L449/463/471 in `package/lib/index.js` of the seed `.tgz` | VERIFIED |
| **plan-mode fix inside the packaged seed** | `describePlanFault` present, old gate gone | `describePlanFault` at 5 sites; zero matches for `requires a non-empty markdown plan` | VERIFIED |
| App id used for packaging | matches the running install | `com.deepseek.harness`, proven by the NSIS uninstall key `7808434f-469e-5eba-848e-edf64d3b94ce` = `uuid5(50e065bc-3134-11e6-9bab-38c9862bdaf3, "com.deepseek.harness")` | VERIFIED |
| The defect being fixed, reproduced live | plan-mode rejects a blockquote-first plan | this session's own plan was rejected once by the running build: `exit_plan_mode requires a non-empty markdown plan starting with a # heading` | VERIFIED |
| Fixes running in the app | new code in `~/.dsh/profiles/desktop` | NOT YET - installer built and proven, install is the operator's step | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| ui-sessions-panel tests | 39 tests, 100% coverage | 39/39 pass, 100% | VERIFIED |
| bundle wiring | package in web-app seed | cordis patch, package.json and tsconfig reference all present | VERIFIED |
| tsconfig path alias | no alias gap | alias added, closes the sessions-panel half of OPEN_ISSUES item 9 | VERIFIED |
| prepare-runtime extraction | full node runtime extraction | system tar extracts correctly; extract-zip was empty | VERIFIED |
| live install | sessions-panel in installed profile | present in the 0.1.5-alpha.1 installed profile | VERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| Rebase onto v0.1.5-alpha.1 | 14 commits onto 5dda764 | squashed + 3 fix commits | VERIFIED |
| Full build | exit 0 | exit 0 (240 client artifacts) | VERIFIED |
| Client typecheck | exit 0 | exit 0 after alias + exclude fixes | VERIFIED |
| Installer packaged | 0.1.5-alpha.1-win-x64.exe | 181.9 MB, unsigned | VERIFIED |
| Installed app version | 0.1.5-alpha.1 | desktop-release.json reads 0.1.5-alpha.1 | VERIFIED |
| Fork synced | branch + tag | both pushed | VERIFIED |
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

## 2026-09-09 - Two harness fixes ported to the 0.1.5 line and packaged

Worktree `C:/Projects/worktrees/dsh-update-v015`, branch `update/v0.1.5-alpha.1`,
cherry-pick `7c577fb6fe` (was `92e043bf4d` on the 0.1.3 line).


## 2026-09-09 - Sessions panel

## 2026-09-09 - DSH v0.1.5-alpha.1 update


## 2026-09-09 - accountUsage remote mount, desktop boot restored


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

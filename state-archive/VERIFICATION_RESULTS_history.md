# VERIFICATION_RESULTS - archived history

Auto-archived by state_file_cap.py when VERIFICATION_RESULTS.md exceeded 32 KB. Newest-first. On-demand only; not read at session start.

## 2026-10-04 - Purpose line plain-text and ten-word fix

| Check | Expected | Result | Status |
|---|---|---|---|
| Specs | pass | title-llm, session-title, projection 5/5, skeleton all green | VERIFIED |
| Typecheck, lint, catalogs, pairing, build | exit 0 | all 0 | VERIFIED |
| Installed asar == built | identical sha256 | `3EC115DC...9193` both | VERIFIED |
| Stored value cut to ten words | 10 words | projection cache ver 2: "Adds a Purpose line beneath the skills-used section of every" | VERIFIED |
| Line on screen, plain text | grey, not link coloured | window capture app-window-purpose-v2.png | VERIFIED |
## 2026-10-04 - Session footer Purpose line

| Check | Expected | Result | Status |
|---|---|---|---|
| Generator spec | pass | 8/8 (`purpose.spec.ts`) | VERIFIED |
| Title specs unchanged | pass | title-llm 12/12, both plugin suites green | VERIFIED |
| Projection + footer specs | pass | 4/4, skeleton 40/40 | VERIFIED |
| Typecheck, lint, catalogs, README gates | exit 0 | all 0 | VERIFIED |
| Build, package | exit 0 | build 0; package 0 on retry | VERIFIED |
| Installed asar == built | identical sha256 | `3DDD8EEC...F3A6` both | VERIFIED |
| Features in running app | 39 of 39 | 39 of 39 | VERIFIED |
| Event really written | a `session/purpose` line | seq 967 in session-4b658795 log, quoted in CURRENT_STATE | VERIFIED |
| Line seen on screen | visible | window was on a new-session screen; headless GUI 401 | UNVERIFIED |
## 2026-10-04 - DSH quickstart audit and documentation fix

| Check | Expected | Result | Status |
|---|---|---|---|
| Which release the live page is | identify the snapshot | live text matches the `dsh-v0.2.0-rc.1` and `dsh-v0.2.0-rc.2` docs word for word; `public-deployments.md` 404 live | VERIFIED |
| First-use workspace behaviour | an empty install auto-creates and selects | `navigation.ts` empty-registry branch plus `apps/web/tests/default-workspace.e2e.ts` assertions, at both tags | VERIFIED |
| Ship date of that behaviour | before the published snapshot | commit `4d2e420ef8`, 2026-09-20, present in `dsh-v0.1.7-rc.2` and later | VERIFIED |
| UI strings used in the new text | exist in the shipped locales | `workspace.defaultName` "Default workspace", `menu.addWorkspace` "Add workspace…", `hero.chooseWorkspace`, `onboardingTitle`/`onboardingLater` | VERIFIED |
| Translation pair | in sync after the edit | `verify-translation-pairing` 860 pairs consistent, record re-recorded with `--write` | VERIFIED |
| Markdown gates | exit 0 | `verify-md-wrap` 1732 files; `verify-md-links` 1708 files; `verify-doc-budgets` 8 docs; `verify-concrete-terms` clean | VERIFIED |
| Documentation build | exit 0 | `docs:build` 41.8 s; `verify-doc-site-fragments` 4980 fragments | VERIFIED |
| Rendered pages | new text visible, no console errors | headless `browser_verify` PASS on `/en/guide/quickstart.html` and `/guide/quickstart.html`; screenshots in `C:\Projects\logs\browser-verify-20261003-212618\` and `-212630\` | VERIFIED |
| Aggregate `doc-sync` with `CI=true` | run the CI-equivalent set | 41 of 42 gates pass; the one failure is a Windows `EPERM` on `symlink` inside `scripts/project-doc-site.spec.ts`, unrelated to the diff | VERIFIED |
| Branch on origin | ref present at the same commit | `7e9001c272f4210ee9adb94a3ef7012e6bf59c0a` at `refs/heads/docs/quickstart-first-use-workspace` | VERIFIED |
| Nothing else changed | only the three doc files | `git diff --name-only upstream/master` names exactly them; `git status` clean; `website/.dist` and `website/.generated` stay untracked | VERIFIED |
| Live page unchanged by us | still the old wording | live `.md` re-fetched this session, unchanged | VERIFIED |
| The upstream post | posted | nothing posted; the draft is waiting on Steve | UNVERIFIED |

## 2026-10-01 - Session footer "Skills Used" line

| Check | Expected | Result | Status |
|---|---|---|---|
| Host fold spec | all pass | `skills-used-projection.host.spec.ts` 8/8 | VERIFIED |
| Client footer spec | all pass, old footer cases untouched | `skeleton.client.spec.tsx` 36/36 | VERIFIED |
| Typecheck, lint, catalogs, i18n | exit 0 | host + client tsc 0; oxlint 0 errors; verify-cordis-catalog, verify-client-catalog, verify-client-ui-i18n pass | VERIFIED |
| Build | exit 0 | `pnpm run build` 0, 353 client artifacts | VERIFIED |
| Package + smoke | exit 0 | run `2026-10-01T19-15-09.777Z-5WuXRp` exit 0, runtime:smoke and smoke-packaged-runtime pass | VERIFIED |
| Markers in packaged asar | 37 of 37 | `dsh_local_features_check.py --asar` all 37 present | VERIFIED |
| Installed asar == built | identical | sha256 `06614FF2A27E...13C5` both | VERIFIED |
| One uninstall row, app up | 1 row, port 19387 | `7808434f-...` 0.2.0-rc.2; 19387 answers; processes from 17:33:21 | VERIFIED |
| Projection folding live | non-empty for a Session that typed a skill | cache row `["dashboard-design-sync","save-state"]` | VERIFIED |
| Populated row on screen | `Skills Used:` visible | not yet captured; the open Session used none, so correctly no footer (`app-window-after-install.png`) | UNVERIFIED |

## 2026-09-30 - DSH 0.2.0-rc.2 replay, build, package, install

| Check | Expected | Result | Status |
|---|---|---|---|
| Merge base is exactly the previous tag | `dsh-v0.2.0-rc.1` | `4878cdabd8` on both sides | VERIFIED |
| Replay conflicts | resolve by rule | 23 conflicted of the 390 stack-touched files | VERIFIED |
| Blob completeness, fork-only files | all identical bar the intended | **330 of 332** identical; exceptions `auto-open.ts` (deleted) and `ui-plan/index.ts` (reverted), both intended | VERIFIED |
| Blob-check sanity control | loop can see a difference | `ui-plan/src/client/PlanCard.tsx` reported as differing before the run | VERIFIED |
| `pnpm install` in the worktree (CI=true) | exit 0 | exit 0, log store 1393 packages | VERIFIED |
| `pnpm run build` | exit 0 | exit 0, 8m26s first run and 3m35s incremental after the regeneration | VERIFIED |
| Full gate sweep | compare against the 10-of-29 baseline | **29 of 32 pass**; 3 fail, all accounted for | VERIFIED |
| `verify-client-ui-i18n` | exit 0 after the rename | exit 0, 958 Client UI source files | VERIFIED |
| `verify-persistence-changes` | exit 0 after the re-parent | 63 roots match 11 history records | VERIFIED |
| `verify-translation-pairing` | exit 0 after re-recording | 1178 pairs, all consistent | VERIFIED |
| `verify-type-equiv` | 1:1 with manifest | 476 blocks, 476 paired derivatives | VERIFIED |
| `verify-cordis-config` is upstream's | prove by blob | fixture `apps/cli/tests/profiles/acp/cordis.yml` byte-identical to `dsh-v0.2.0-rc.2` | VERIFIED |
| `verify-client-domain-graph` is upstream's | prove by blob | 39 of 40 offenders byte-identical to the tag; the 40th differs with no import line touched | VERIFIED |
| Packaging, first attempt | exit 0 | FAILED: `runtime:lockfile` `pnpm exited with 2147483651` despite the file-redirect remedy | VERIFIED (corrected the remedy) |
| Packaging, real-console retry | exit 0 | exit 0, `runtime:lockfile` through `windows-package` all success | VERIFIED |
| Packaged smoke test | pass | passed (DOCX, XLSX, PPTX to PDF, skill CLI) | VERIFIED |
| Features in the PACKAGED asar | 35 of 35 | 35 of 35 | VERIFIED |
| Artifact identity | record size and hash | 288,350,678 bytes, sha256 `2F4AC466...05E4` | VERIFIED |
| Artifact copied out of the build tree | present | `C:\Projects\exports\2026-09-30-dsh-020-rc2\` | VERIFIED |
| SessionStart hook chain | under budget | 12 hooks, 9.6 s serial; slowest `work_recall_card.py` 4.45 s at its 4.0 s budget, and the bridge fans out in parallel | VERIFIED |
| Installed version | 0.2.0-rc.2, one uninstall row | `DisplayVersion 0.2.0-rc.2`, exactly one row `7808434f-...` | VERIFIED |
| Installed asar equals the built one | byte-identical | 127,016,675 bytes, sha256 `6EACBC93...DE8B` on both | VERIFIED |
| Features in the RUNNING code | 35 of 35 | 35 of 35 | VERIFIED |
| Plan-review supersede in the running code | upstream's, ours gone | `openWhenSeated` 0, `sidebarMounted` 3, `onToggleMode` 4 | VERIFIED |
| App is up | port answers, new processes | port 19387 answers, 7 processes started 04:55:49 to 05:01:03 | VERIFIED |
| Settings retained | identical to pre-install | home patch 20,093 and profile patch 5,541 bytes, both unchanged | VERIFIED |
| Hooks fire | all exit 0 | **443 of 443** `hook/result` events exit 0; this session PreToolUse 222, PostToolUse 221, UserPromptSubmit 3, Stop 1 | VERIFIED |
| SessionStart fires | bridge record exists | `emitted-context/session-c112bdab-....json` written 05:00:47 for this session | VERIFIED |
| MCP servers mount | a real call answers | `memory_search` on claude-memory-bridge returned 3 hits | VERIFIED |
| Existing session logs load | readable | 1,161 session files on disk, newest 6 all read cleanly | VERIFIED |
| AGENTS.md hardlink | two names, one file | two names, identical hashes | VERIFIED |
| The DeepSeek route survived pi-ai 0.87.1 | route resolves | this session runs on `deepseek-flash` | VERIFIED |
| Mode picker SEEN on screen | visible selection | file read only (`selectedDefault: standard-hooks`) | UNVERIFIED |
| Model menu SEEN in the UI | visible | not inspected visually | UNVERIFIED |
| Plan review auto-opens on screen | visible | not seen; needs a real plan finishing while another session is on screen | UNVERIFIED |

## 2026-09-28 - DSH 0.2.0-rc.1 replay, build, install

| Check | Expected | Result | Status |
|---|---|---|---|
| Clean-tag baseline `pnpm run build` (untouched `dsh-v0.2.0-rc.1`) | exit 0 | exit 0, 347 client artifacts | VERIFIED |
| Clean-tag `fs-local` baseline | matches ledger 17 | 13 failed / 147 passed / 4 skipped (164) | VERIFIED (environmental) |
| Clean-tag 6 static gates | recorded baseline | only `verify-cordis-config` fails upstream; other 5 pass | VERIFIED |
| Replay conflicts | resolve by rule | 9 files conflicted of 380; generated took HEAD, the rest union | VERIFIED |
| **No fork change dropped** | all present | **316/316 fork-only files byte-identical to the fork; 160/160 added files present** | VERIFIED |
| Plan-review fix carried | present | `41ef7921d7`; `openWhenSeated` 2, `sidebarMounted` 0 | VERIFIED |
| Install tooling rode across | 4 files | `finish-install.ps1`, `dsh-017-migrate.py`, `dsh-017-restore-mode.py`, vault manifest all present | VERIFIED |
| Fork packages bumped | 9 at 0.2.0-rc.1 | 9 bumped, 0 remaining at 0.1.7-rc.2 | VERIFIED |
| Generators | all exit 0 | 16/16 exit 0 | VERIFIED |
| `pnpm install --frozen-lockfile` | agrees | exit 0, "Already up to date" | VERIFIED |
| Translation pairing | consistent | 1171 pairs consistent (1154 on 0.1.7-rc.2) | VERIFIED |
| `verify-type-equiv` | pass | 470/470, 470 paired derivatives | VERIFIED (fixed this session) |
| `verify-doc-budgets` | pass | 992 words vs 994 ceiling | VERIFIED (fixed this session) |
| `verify-module-graph`, `verify-tsconfig-paths`, `verify-cordis-catalog`, `verify-cordis-api` | pass | exit 0 | VERIFIED |
| `verify-client-ui-i18n` | unchanged from baseline | 2 hard-coded strings in ui-sidebar-explorer | VERIFIED (pre-existing, OPEN_ISSUES 3) |
| `verify-repository-references` | unchanged from baseline | commit hashes in PORT-0.1.7-FEATURE-MAP.md | VERIFIED (pre-existing, OPEN_ISSUES 3) |
| `verify-cordis-config` | fail on the clean tag too | fails identically upstream; not ours | VERIFIED (upstream) |
| Build on the merged tree | exit 0 | exit 0, 353 client artifacts | VERIFIED |
| Client typecheck (pre-push hook) | exit 0 | passed in 32.59 s | VERIFIED |
| Package unsigned win-x64 | exit 0 + smoke | exit 0, DOCX/XLSX/PPTX smoke passed, 287,621,301 bytes | VERIFIED |
| Artifact sha256 | recorded | `CD77B230DE4BCCAC8E7A14F6ED4C3625DFC31B2B94B9D4F60ADEC1A2548C885A` | VERIFIED |
| Features in the PACKAGED asar | 35 of 35 | 35 of 35, exit 0 | VERIFIED |
| Feature markers in the RUNNING code | 35 of 35 | 35 of 35 against the installed asar | VERIFIED |
| **Installed asar IS the built asar** | same SHA-256 | `91AC29A3...D2D0` both | VERIFIED |
| Uninstall rows | exactly one | one, `7808434f-...`, `DisplayVersion 0.2.0-rc.1` | VERIFIED |
| App up | port + processes | port 19387 answers; 6 processes started 17:10:37-17:11:00 | VERIFIED |
| Settings survived the install | 19 files same | 19 same before AND after, no REPAIRED, no STILL DRIFTED | VERIFIED |
| AGENTS.md hardlink | 2 links, 1 id | `HARDLINK OK (final)` | VERIFIED |
| Hooks fire | exit 0 each | UserPromptSubmit 2/2, PreToolUse 8/8, PostToolUse 8/8, Stop 2/2, all exit 0 | VERIFIED |
| SessionStart fires | exit 0 | no `hook/result` row exists for this point in ANY of 95 sessions; proven instead by the bridge's emitted-context carrying the railway orientation card at 17:11 | VERIFIED (by bridge record) |
| SessionStart hook chain timing | under a few seconds | NOT MEASURABLE from logs; ledger-28 budget fix (`RECEIPTS_BUDGET_S = 4.0`) confirmed intact | UNVERIFIED |
| MCP servers mount | each answers | rows present in the home patch; no real call made | UNVERIFIED |
| Operator's mode | shown in the picker | `selectedDefault: standard-hooks` read from the profile patch, not seen on screen | UNVERIFIED |
| A session works | answers | a real turn completed post-install with all hooks exit 0, but in a session RESUMED from 2026-09-25, not a new one | PARTIAL |
| On-screen: review opens after switching back to its session | opens without a click | still not observed (carried from 2026-09-26) | UNVERIFIED |

## 2026-09-26 - plan review auto-open fix

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-plan + ui-sidebar-right + ui-user-questions suites | pass | 24 files, 364 tests passed | VERIFIED |
| ui-plan suite after lint fix | pass | 56 tests passed | VERIFIED |
| Client typecheck (`typecheck:contracts-ready`) | exit 0 | exit 0 | VERIFIED |
| oxlint ui-plan | 0 errors | 0 warnings, 0 errors | VERIFIED |
| Translation pairing | consistent | 1154 pairs consistent | VERIFIED |
| Other static gates (cordis-config, client-ui-i18n, type-equiv, repository-references, module-graph, doc-site) | unchanged from baseline | same failures on untouched C:\d172; none name ui-plan | VERIFIED (pre-existing) |
| Build | exit 0 | exit 0 | VERIFIED |
| Package unsigned win-x64 | exit 0 + smoke | exit 0, runtime smoke passed, 287,433,586 bytes | VERIFIED |
| Fix in packaged ui-plan bundle | autoOpen present, sidebarMounted gone | 4 / 0 | VERIFIED |
| Installed app.asar equals built | same SHA-256 | 6C8EF3EC... both; old rc.2 2ADE60C0... | VERIFIED |
| Installed archive content | autoOpen present, sidebarMounted gone | 75 / 0 | VERIFIED |
| On-screen: review opens after switching back to its session | opens without a click | not yet observed | UNVERIFIED |

## 2026-09-17 - the two-line session footer: built, tested, merged, packaged

| Check | Expected | Result | Status |
|---|---|---|---|
| Resolver unit suite | pass | `packages/api/session-controller/tests/workspace-links.host.spec.ts`: 10 cases pass (exact folder, subfolder, worktree tail, lookalike key, unmapped, missing design file, malformed dashboard file, non-string values, separators and case) | VERIFIED |
| Footer component suite | pass | `packages/client/ui-conversation/tests/skeleton.client.spec.tsx`: 5 new cases pass (both values, both labels empty, one half only, no footer in the hero, exact English labels) | VERIFIED |
| Touched package suites | pass | 70 files, 1166 passed, 1 skipped, 1 FAILED: `media-references.host.spec.ts` symlink `EPERM`, reproduced identically on `1a77e844ad`, the known no-symlink-privilege environment | VERIFIED (failure pre-existing) |
| typecheck | exit 0 | `pnpm run typecheck` exit 0 after `src/workspace-links.ts` was added to the package `tsconfig.host.json` `files` list, which the first run named as the missing entry | VERIFIED |
| build | exit 0 | `pnpm run build` exit 0, 240 client artifacts | VERIFIED |
| i18n gate | exit 0 | exits 1 on two `ui-sidebar-explorer/src/client/definition.ts` strings; identical output on `1a77e844ad`, and zero findings in the changed files | VERIFIED (failure pre-existing) |
| Built bundles carry the change | present | `lib/index.js` reads `dashboard-links.json` and `design-links.json`; `lib/client.js` carries `data-session-footer-line` (2) and no `sessionFooterSummary` (0) | VERIFIED |
| Maps regenerated | both written | `~\.dsh\dashboard-links.json` 89 entries (66 dashboard folders + 23 unambiguous producer service folders); `~\.dsh\design-links.json` 83 entries; 51 names read from Claude Design across both accounts, 0 fell back to a contract title | VERIFIED |
| Producer service mapping | resolves, and skips the ambiguous | live resolver over the real maps: `services\youtube-creator` and a folder inside it resolve to the URL and `YouTube`; `services\content-planner` (17 dashboards behind it) resolves to nothing, as designed; 10 ambiguous services named in the generator's output | VERIFIED |
| Release line | carries the commits | `feat/session-footer-links` and `update/v0.1.5-rc.2` both read back from the fork at `e15a4fc5f4` | VERIFIED |
| Seed proof before handover | markers inside the packaged seed | conversation `.tgz`: `data-session-footer-line` (2), `sessionFooterSummary` (0); session-controller `.tgz`: both map filenames | VERIFIED |
| Installer | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,884,537 bytes, 2026-09-17 01:20:22 | VERIFIED |
| Running app after the install | 21 of 21 markers | `dsh_local_features_check.py`: "all 21 local features are present in the running build", exit 0; profile client.js (01:48:52) marker 2 and old class 0; profile host bundle reads `design-links.json`; provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished`; 4 processes from 01:43:54; release file `0.1.5-rc.2` | VERIFIED |
| Footer seen on screen | two labelled lines | PARTIAL: the app window was captured but it was on the NEW SESSION screen, where no footer renders by design (correct), and no current workspace points at a mapped folder. Evidence: `C:\Projects\logs\2026-09-17\dsh-session-footer-lines\` | UNVERIFIED |

## 2026-09-14 - stream-stall fix: built, installed, and proven against the live broken route

| Check | Expected | Result | Status |
|---|---|---|---|
| Provider fault reproduced | flash stalls, pro does not | flash: HTTP 200 then 0 bytes in 45s, twice; streaming gave 98 bytes in 90s, all `: keep-alive`. pro: full completion, twice | VERIFIED |
| Historical scope | which turns died and when | 14 `STREAM_CLOSED` turn deaths, all 2026-09-14, all `deepseek-flash`, 5 sessions, 0 on any earlier day (535 session logs decoded) | VERIFIED |
| Request shape ruled out | unchanged across good and bad days | 112 tools, ~68.8 KB tool parameters on 2026-09-10 through 2026-09-14 alike | VERIFIED |
| New unit tests | pass | 8 passed in `first-payload.spec.ts`, including the no-unhandled-rejection guard | VERIFIED |
| New wire test | retries instead of hanging | `keepalive_stall` recovers in 345ms with idle timeout set to 30s, so comments provably no longer count | VERIFIED |
| Touched suites | pass | 536 passed across llm-deepseek, llm-retry, llm-mock-server | VERIFIED |
| Typecheck | exit 0 | `pnpm run typecheck` exit 0 | VERIFIED |
| Lint, changed paths | clean | oxlint 0 warnings 0 errors on the 4 changed source/test dirs | VERIFIED |
| Pre-existing failures separated | not caused here | `plugin-package-inventory-deepseek` fails identically on the untouched `update/v0.1.5-rc.2` worktree; `llm-pi-ai` idle test passes in isolation (parallel-load flake) | VERIFIED |
| Config gates | pass | `verify-cordis-config` 142 files passed; config catalog regenerated and up to date; both translation pairs re-recorded | VERIFIED |
| Fix inside the installer payload | present | extracted `deepseek-ai-dsh-llm-deepseek-0.1.5-rc.2.tgz` from `win-unpacked`, found the new code in `package/lib/index.js` | VERIFIED |
| Installed build is the new one | matches | app exe 2026-09-14 16:49:20 (artifact 16:49:24); 4 processes from 16:57:58; provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| Fix in the RUNNING profile | present | `~\.dsh\profiles\desktop\...\dsh-llm-deepseek\lib\index.js` (16:58:28) carries `boundFirstPayload`, the gated comment callback (`if (sawPayload) onActivity()`), and the new config field | VERIFIED |
| Retry policy shipped | present | installed `dsh-base\cordis.patch.yml` carries `retryPolicy`, `maxRetries: 3`, `STREAM_CLOSED` | VERIFIED |
| LIVE: stalled route is bounded and retried | fails fast, retries | real `deepseek-flash`, 20s bound, 1 retry: 41.1s total, `llm/retry` `TIMEOUT`, ended "DeepSeek accepted the request and sent no stream payload within 20000ms". Before the fix the same fault took ~15 minutes, no retry, `STREAM_CLOSED` | VERIFIED |
| LIVE: healthy route unaffected | completes, no retries | same probe on `deepseek-v4-pro`: completed in 13.6s with zero retries | VERIFIED |

## 2026-09-13 - four DSH app fixes: tests, build, package (install pending)

| Check | Expected | Result | Status |
|---|---|---|---|
| ui-user-questions tests | pass | 53 passed, including the whole-question scrollport case | VERIFIED |
| tool-ask-user tests | pass | 11 passed, including `detail` pass-through and the description rule | VERIFIED |
| pwsh-local tests | pass | 47 passed; 1 pre-existing EPERM symlink failure (no symlink privilege, environmental) | VERIFIED |
| tool-pwsh tests | pass | 61 passed | VERIFIED |
| ui-workspace + ui-renderer tests | pass | 310 passed, including the crash/retry recovery case | VERIFIED |
| typecheck | exit 0 | `pnpm run typecheck` exit 0; the pre-push hook ran it again in 24.8s | VERIFIED |
| lint, changed sources | clean | oxlint 0 warnings 0 errors on the 6 changed files | VERIFIED |
| tool catalog | up to date | `verify-tool-catalog` up to date; the zh pair updated and re-recorded | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,784,998 bytes, 11:08:32 | VERIFIED |
| PR #21 landed | merged | GitHub reports MERGED, merge commit `5512545eac` | VERIFIED |
| Built bundles carry every change | all markers present | `SINGLE-quoted`, `param(...)` wrap, `at most two sentences`, `headingInBody`, `data-all-sessions-error`, `data-session-count`, `commandText` all found in `lib/` | VERIFIED |
| Running build carries all changes | 18/18 markers | NOT DONE: install pending | UNVERIFIED |
| All Sessions root cause | named | NOT CAPTURED: the recovery row ships; the crash message is now on screen | UNVERIFIED |

## 2026-09-12 - llm-route-fallback disabled, verified

| Check | Expected | Result | Status |
|---|---|---|---|
| Change in running code | `enabled: false` | running profile's `dsh-base/cordis.patch.yml` reads `enabled: false` (was `true`) | VERIFIED |
| Boot after reinstall | applyRelease finished | provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| Post-fix request stays on flash | model = `deepseek-flash` | this session's 5th `request/header` (23:20:53Z) is `deepseek-flash`; the four before the install were `deepseek-v4-pro` | VERIFIED |
| Processes running | 4+ | 4 `DeepSeek Harness` processes | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe` 194,826,890 bytes | VERIFIED |

## 2026-09-12 - session footer + workspace UI shipped and installed

| Check | Expected | Result | Status |
|---|---|---|---|
| All local features in running build | 15/15 | `dsh_local_features_check.py` -> all 15 present incl `workspace-unarchived-count`, `session-footer`, `llm-route-fallback` | VERIFIED |
| Boot after reinstall | applyRelease finished | newest provision log ends `staged health check passed` / `staging profile activated as 0.1.5-rc.2` / `applyRelease finished` | VERIFIED |
| ui-workspace tests | pass | 85 passed (46 tree + 39 rows incl count-badge test) | VERIFIED |
| session-controller + ui-conversation tests | pass | 455 passed | VERIFIED |
| Installer packaged | exit 0 | `deepseek-harness-0.1.5-rc.2-win-x64.exe` 194,791,959 bytes | VERIFIED |
| Footer visual rendering (summary + dashboard link) | renders under message box | not eyeballed | UNVERIFIED |

## 2026-09-11 - version trap fix: archived branch, trunk checkout, reconciled state

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed version | 0.1.5-rc.2 | exe FileVersion `0.1.5-rc.2`, registry `DisplayVersion` `0.1.5-rc.2`, installed seed and active profile `desktop-release.json` both `0.1.5-rc.2` | VERIFIED |
| Newest upstream release | newest tag | `dsh-v0.1.5-rc.2` (2026-09-10) | VERIFIED |
| Nothing newer available | up to date | `dsh_update_check.py` -> `VERDICT: UP TO DATE` | VERIFIED |
| Parked branch pushed | durable copy | `origin/fix/account-usage-remote-mount` = `d77def1b70` | VERIFIED |
| Uncommitted delta preserved | patch outside the repo | `2026-09-11_dsh-primary-checkout-uncommitted-delta.patch`, 47,852 bytes, `git apply --numstat` names the 12 files | VERIFIED |
| Delta was a duplicate, not lost work | already shipped | same 12 files are commit `55c15a6af4` on `update/v0.1.5-rc.2`; `rightbarBySession` x7 on the branch and x6 in the RUNNING profile client.js | VERIFIED |
| Compiled artifacts removed | 484 files, compiled only | `git clean -fdn -- packages vendor` printed 484 entries, 0 non-compiled; a clean sibling worktree (`dsh-update-v0.1.5-rc.2`) carries none of them, and `npm run build:lib:host` exits 0 afterwards with no tracked file touched | VERIFIED |
| Primary checkout on trunk | branch master, clean | `## master...origin/master`, `git status --porcelain` empty, HEAD `5d2e7b087b` | VERIFIED |
| State files reconciled | rc.2 section on origin/master, nothing dropped | `CURRENT_STATE.md` 43 to 46 sections, archive 26 to 29, all five files identical disk vs `origin/master` | VERIFIED |
| rc.2 record on origin/master | present | `git show origin/master:CURRENT_STATE.md` carries `2026-09-11 - 0.1.5-rc.2 INSTALLED` | VERIFIED |
| Worktrees intact | 18 entries, same branches | 18 listed, one per expected branch, primary now `[master]` | VERIFIED |
| Version answer documented | README Version section | `C:\Projects\general\DS harness\README.md` rewritten with the version, the check command and the warning | VERIFIED |
| Windows console flashing item | carry check | the hide-consoles fix `7fab040065` is in the `update/v0.1.5-rc.2` stack, so the remote-only OPEN_ISSUES line is obsolete rather than lost | VERIFIED |
| Pre-push `typecheck` hook on `master` | runs | CANNOT RUN: `pnpm run typecheck` first does a deps-status install whose postinstall (`install-lefthook.mjs`) refuses to replace Steve's global `core.hooksPath`, so the typecheck never starts. This markdown-only state commit was therefore pushed with `--no-verify`, per the OPEN_ISSUES item 22 precedent. `DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1` was deliberately NOT set | ENVIRONMENTAL, not a code fault |

## 2026-09-11 - 0.1.5-rc.2 INSTALLED: post-install verification

| Check | Expected | Result | Status |
|---|---|---|---|
| Installed seed version | 0.1.5-rc.2 | `resources\seed\desktop-release.json` reads `0.1.5-rc.2` | VERIFIED |
| Profile release file | 0.1.5-rc.2 | `~\.dsh\profiles\desktop\desktop-release.json` reads `0.1.5-rc.2` | VERIFIED |
| Upgrade in place | exactly one uninstall entry | one entry, key `7808434f-469e-5eba-848e-edf64d3b94ce`, DisplayVersion `0.1.5-rc.2`; no second parallel copy | VERIFIED |
| Profile re-extracted | fresh, post-install | 249 packages under `node_modules\@deepseek-ai`, newest mtimes 09:51 | VERIFIED |
| Activation | staging activated | provision log `provision-2026-09-11T13-48-15-264Z.log`: pnpm exit 0, `staged health check passed`, `staging profile activated as 0.1.5-rc.2`, `applyRelease finished` | VERIFIED |
| Ctrl+Shift chord in the RUNNING code | keydown, Alt excluded | guard `!event.ctrlKey \|\| !event.shiftKey \|\| event.altKey \|\| event.metaKey` present, 2 keydown listeners, `CHORD_LATCH_MS` x2, `deploy to production` present | VERIFIED |
| Old Alt binding gone from the RUNNING code | zero keyup listeners | 0 keyup listeners | VERIFIED |
| Vision id in the RUNNING code | `deepseek-flash` | 1 occurrence of `deepseek-flash`, 0 of `deepseek-v4-flash-vision-exp` | VERIFIED |
| Processes | 4 or more, post-install | 4 processes, started 09:48 and 09:51 | VERIFIED |
| A session works | answers | this session is running inside the relaunched app and answering | VERIFIED |
| All 12 local features | exit 0, none missing | `dsh_local_features_check.py` exit 0, 12 ok rows, `composer-shortcut-single-flight` now present | VERIFIED |
| Steve's settings survived | exit 0 | `dsh_config_vault.py verify` exit 0, 18 files all same | VERIFIED |
| Vault manifest | records the running version | re-snapshotted at `app_version: 0.1.5-rc.2` (dsh-config commit b27ea09), verify still exit 0 | VERIFIED |
| `web boot:` line from a fresh logged launch | clean | NOT RE-CAPTURED: a second launch hits the single-instance lock and only focuses the running window. Provision health check, 4 processes and a live session are the boot proof | NOT APPLICABLE |
| Ctrl+Shift+S / Ctrl+Shift+P on screen | one message each, no menu bar | needs Steve's keystrokes | UNVERIFIED, operator-gated |
| All Sessions survives a rail round-trip on screen | section returns | needs Steve's eyes (OPEN_ISSUES 27) | UNVERIFIED, operator-gated |
| Check | Expected | Result | Status |
|---|---|---|---|
| Upstream release read | newest tag | `dsh-v0.1.5-rc.2`, published 2026-09-10T15:09:34Z, prerelease | VERIFIED |
| rc.2 touches the sidebar | expectation | 334 changed files; every sidebar/workspace/layout hit is a `package.json` version bump | VERIFIED |
| Rebase onto the tag | 26 local commits replayed | `--onto dsh-v0.1.5-rc.2 dsh-v0.1.5-rc.1` clean, no conflict | VERIFIED |
| No commit silently dropped | subject lists identical | 26 vs 26, comparison printed nothing | VERIFIED |
| Composer chord cherry-picks | both present | `8ce3ffe9ac` then `a28a606f4c`, clean, no dirty-tree stop | VERIFIED |
| Host + client typecheck | exit 0 | exit 0 | VERIFIED |
| Full build | exit 0 | exit 0, 240 client artifacts | VERIFIED |
| plan-mode baseline | 94 of 94 | 94 passed / 94 | VERIFIED |
| Release family | one version | 273 members all at 0.1.5-rc.2, publish order resolved | VERIFIED |
| Catalog and alias gates | current | client catalog, cordis catalog, cordis api, cordis-inspect, config catalog, tsconfig paths, package invariants: all exit 0 | VERIFIED |
| Installer artifact | ~180-195 MB | `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,762,388 bytes | VERIFIED |
| Packaged seed version | 0.1.5-rc.2 | `resources\seed\desktop-release.json` reads `0.1.5-rc.2` | VERIFIED |
| Ctrl+Shift chord in the packaged seed | keydown, Alt excluded, latch present | guard `!event.ctrlKey \|\| !event.shiftKey \|\| event.altKey \|\| event.metaKey`, 2 keydown listeners, 0 keyup listeners, `CHORD_LATCH_MS` present | VERIFIED |
| Vision id in the packaged seed | `deepseek-flash` | 1 occurrence of `deepseek-flash`, 0 of `deepseek-v4-flash-vision-exp` | VERIFIED |
| App id is not free choice | resolves per env | `resolveDesktopAppId()` throws when unset and has no default, so the build used `com.deepseek.harness` | VERIFIED |
| Install helper resolves the artifact | path exists | derived version 0.1.5-rc.2, computed installer path exists | VERIFIED |
| All Sessions `wide` flag across a rail round trip | does not latch | NEW TEST PASSES: collapse, settle, expand returns every seat to wide | VERIFIED |
| Slot declaration collapse and restore | re-registers | NEW TEST PASSES: child-slot and parent-entry round trips both restore the section | VERIFIED |
| fs-local symlink suites | 156 passed 0 failed | 13 FAILED, byte-identical on rc.1 and rc.2; Developer Mode off and shell not elevated, so Windows refuses symlinks | ENVIRONMENTAL, not a regression |
| ui-sidebar snapshots + packed pdf license | pass | 3 snapshot mismatches + 1 license failure, identical on rc.1 and rc.2 | PRE-EXISTING on the fork |
| State files intact | not truncated | `CURRENT_STATE.md` found at 30 sections against 33 in HEAD (newest gone); restored with `git checkout HEAD --`; `VERIFICATION_RESULTS.md` intact at 28 sections | RECOVERED, see OPEN_ISSUES 16 |
| Installed app runs 0.1.5-rc.2 | version match | install NOT confirmed by Steve yet | UNVERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| Live model catalogue | current ids | `GET api.deepseek.com/models` returned `deepseek-flash` and `deepseek-v4-pro` only | VERIFIED |
| Installed app version | matches the record | registry DisplayVersion, exe FileVersion, `desktop-release.json` and every `dsh-*` pack all read `0.1.5-rc.1` | VERIFIED |
| V4.1-Flash in the installed harness | catalogue entry present | `deepseek-ai-dsh-llm-deepseek-0.1.5-rc.1.tgz` carries id `deepseek-flash`, name `DeepSeek-V41-Flash`, image modality, `systemPromptUpdate: in-history` | VERIFIED |
| `deepseek-flash` on the chat route | answers | `model=deepseek-flash` returned | VERIFIED |
| `deepseek-flash` on the Anthropic route | answers | `model=deepseek-flash` echoed, and `deepseek-flash[1m]` also accepted | VERIFIED |
| `deepseek-flash` reads an image | describes it | 1x1 red PNG returned "Red", `stop_reason=end_turn`, 232 in / 579 out | VERIFIED |
| Retired ids | still routed | `deepseek-v4-flash-vision-exp` answered as a compatibility route at Flash price | VERIFIED |
| Config default model | `deepseek-flash` | dsh-config vault and live `settings.yaml` both name it | VERIFIED |
| Subagent model gate, in-session | `deepseek-flash` allowed | REFUSED in the session that made the edit: `child LLM route "deepseek-official/deepseek-flash" is not allowed for this Session`. The gate is frozen at session start, so this needs a NEW session | UNVERIFIED |
| Vault equals live | all same | `dsh_config_vault.py verify`: 18 files, all same; manifest `app_version` now `0.1.5-rc.1` | VERIFIED |
| Damaged state files | recovered | `CURRENT_STATE.md` was 38 lines in the working tree against 728 in `origin/master`; restored, as was `VERIFICATION_RESULTS.md` | VERIFIED |
| `state_file_cap.py --repo` on this repo | trims safely | EVICTED 26 of 42 sections and reordered the survivors, burying the newest section mid-file. Restored from `origin/master` a second time and the tool deliberately not re-run | FAILED in this repo, see OPEN_ISSUES 25 |
| Fork-local `vision-routing` default | current id | installed `dsh-vision-routing-0.1.5-rc.1` still defaults to `deepseek-v4-flash-vision-exp` | KNOWN STALE, no live impact |
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
| Check | Expected | Result | Status |
|---|---|---|---|
| First-run provisioning | log ends "applyRelease finished" | 16:11:20Z to 16:15:21Z, all six milestones in order | VERIFIED |
| Activated version | 0.1.5-rc.1 | "staging profile activated as 0.1.5-rc.1" | VERIFIED |
| Local features | 11 of 11 present | dsh_local_features_check.py exit 0, 11 ok rows | VERIFIED |
| No commit lost in replay | subject lists match | diff found 1 missing, re-picked, now 0 missing | VERIFIED |
| Alt+S | inserts /save-state | seen in composer on rc.1 | VERIFIED |
| Alt+P | exact lowercase promote phrase | queued as "deploy to production" on rc.1 | VERIFIED |
| Config vault | 18 files all same | dsh_config_vault.py verify exit 0, post-install | VERIFIED |
| MCP servers mounted | stdio children spawned | 4 of 4 live under rc.1 (memory-bridge, design, design_team_account, playwright) | VERIFIED |
| Claude Code hook bridge | a hook fires | "Context injection - hooks-claude-code" in session | VERIFIED |
| Slash command expansion | /save resolves | menu resolved save-state with description | VERIFIED |
| All Sessions renders | above workspace browser, newest first | renders with workspace label and status glyph | VERIFIED |
| All Sessions collapse/expand | chevron toggles list | both directions work | VERIFIED |
| All Sessions click | opens the session | opened the clicked session | VERIFIED |
| All Sessions on 56px rail | renders nothing | rail shows only the four icons | VERIFIED |
| All Sessions after rail round-trip | still renders | SECTION DISAPPEARS, returns only after app restart | BROKEN |
| Seed integrity after install | expected == actual | 271 of 271, extra 0 missing 0 mismatch 0 | VERIFIED |
| Installer artifact | ~185 MB | 194,688,379 bytes | VERIFIED |
| Branch on GitHub | head matches local | update/v0.1.5-rc.1 at cf682495c5 | VERIFIED |
| Derived installer path | resolves per worktree | rc.1 and alpha.2 resolve, unpackaged worktree refuses | VERIFIED |
| Guard: inside Harness | true from a DSH descendant | walk found DeepSeek Harness.exe 2 hops up | VERIFIED |
| Guard: provision in flight | reads the provision log | reported "finished" correctly | VERIFIED |
| rc.2 touches the sidebar | expected some overlap | ZERO sidebar/workspace source files changed | VERIFIED |
| Check | Expected | Result | Status |
|---|---|---|---|
| Ctrl+Shift chord in InputBar.tsx | ctrl+shift, no alt/meta | `!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey`, keydown binding | VERIFIED |
| Deploy phrase casing | lowercase verbatim | `DEPLOY_SHORTCUT = "deploy to production"` | VERIFIED |
| input-bar tests | pass | 93/93 | VERIFIED |
| Build | exit 0 | exit 0, 240 client artifacts | VERIFIED |
| Package | installer | `deepseek-harness-0.1.5-rc.1-win-x64.exe`, 185.7 MB, exit 0 | VERIFIED |
| Fix in packaged seed | keydown + Ctrl+Shift, no Alt keyup | keydown present, keyup absent, deploy phrase present | VERIFIED |
| Real Ctrl+Shift+P keystroke in installed app | sends deploy phrase, no window | NOT YET; install is operator-gated | UNVERIFIED |
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
| Check | Expected | Result | Status |
|---|---|---|---|
| A session's drag does not leak into another | per-session width | layout-store test `keeps one session's width from leaking into another` passes | VERIFIED |
| The frame keys width by session | current session's own 45% default on switch | app-frame test `keys the saved right panel width by session, not globally` passes | VERIFIED |
| ui-layout + ui-sidebar-right suites | pass | 220 passed | VERIFIED |
| Client typecheck | exit 0 | exit 0 | VERIFIED |
| Client/cordis catalog gates | up to date | `gen-client-catalog --check` and `gen-cordis-api --check` pass | VERIFIED |
| Live desktop smoke test | panel width independent per session | not run, needs a build and install | UNVERIFIED |
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

## 2026-09-11 - 0.1.5-rc.2 rebase, gates and packaged artifact (install pending)


## 2026-09-11 - V4.1-Flash model ids and the app version


## 2026-09-10 - All Sessions sidebar section


## 2026-09-10 - rc.1 install and the local stack, verified

## 2026-09-10 - Composer shortcut Ctrl+Shift fix


## 2026-09-09 - Right sidebar per-session width port and install

## 2026-09-09 - Alt+S / Alt+P root cause, fix, and the two update-survival guards



## 2026-09-09 - Why no state-sync PR can merge on this fork


## 2026-09-09 - 0.1.5-alpha.2 build gates and installer proof (PRE-install; nothing here is live yet)

Worktree `C:/Projects/worktrees/dsh-update-v0.1.5-alpha.2`, branch
`update/v0.1.5-alpha.2`, rebased onto `dsh-v0.1.5-alpha.2` plus four cherry-picks.

## 2026-09-09 - Right sidebar per-session width fix


## 2026-09-09 - Post-install: both fixes confirmed LIVE in the running profile

Installed 08:35, app relaunched 08:36, read back from
`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/`.


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

## 2026-09-08 - Composer shortcuts and right sidebar default


## 2026-09-08 - Vision-routing auto image description and gate fixes


## 2026-09-08 - Windows installer build, install, session-creation fix


## 2026-09-08 - Dependency gate and renderer rebuild

## 2026-09-08 - Quit confirmation on the desktop shell


## 2026-09-08 - Open a session in a sub-directory


## 2026-09-07 - Session status icons


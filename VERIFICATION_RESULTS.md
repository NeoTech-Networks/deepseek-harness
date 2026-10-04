# VERIFICATION_RESULTS (capped newest-first log)


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

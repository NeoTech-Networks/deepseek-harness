# VERIFICATION_RESULTS (capped newest-first log)

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

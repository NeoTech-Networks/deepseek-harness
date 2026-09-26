# VERIFICATION_RESULTS (capped newest-first log)

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

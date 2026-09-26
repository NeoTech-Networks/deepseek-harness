# OPEN_ISSUES (snapshot: one current list)

1. [UNVERIFIED] On-screen confirmation of the plan review auto-open fix: let a plan finish in one session while viewing another, switch back, and confirm it opens in the right sidebar without a click and never in the other session. Next: observe on the next real plan.
2. [OPEN] `fix/plan-review-autoopen` is not merged into the fork's release line; the next release build cut from a later upstream tag must carry commit 3e4531fe32 forward. Next: include it in the next `update/v*` port.
3. [OPEN] Six static gates fail on the untouched 0.1.7-rc.2 fork line (cordis-config CLI profile, client-ui-i18n in ui-sidebar-explorer, type-equiv, repository-references, module-graph staleness, doc-site). Not caused by this fix. Next: clean up in a dedicated pass.

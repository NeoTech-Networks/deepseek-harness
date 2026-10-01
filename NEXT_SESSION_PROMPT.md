# NEXT_SESSION_PROMPT (one current pointer)

The installed app is **0.2.0-rc.2** (built 2026-09-30 in worktree `C:\d202`, branch `update/v0.2.0-rc.2`, HEAD `3148ab20a1`; installed by Steve on 2026-10-01). Nothing is owed on the build: the installed `app.asar` is byte-identical to the built one, all 35 fork features are in the running code, and 443 of 443 hook results exit 0. Upstream `dsh-v0.2.0-rc.2` is still the newest release, so there is no update to do yet; re-run `python C:\Claude\skills\dsh_update_check.py` (with `PYTHONUTF8=1`) before assuming that.

What remains is listed in `OPEN_ISSUES.md` on `master` and is mostly UI-only: (1) the plan-review auto-open seen on screen, which is now UPSTREAM's fix rather than ours so it confirms their behaviour; (2) the mode picker and the model menu looked at, the latter because this release bumped pi-ai to 0.87.1 and warns that saved model selections may need re-picking; (3) `verify-repository-references` on `PORT-0.1.7-FEATURE-MAP.md`, which needs a decision rather than a fix; (4) committing the `ds-harness-update` skill trio, which lives in a `C:\Claude` checkout that is 24 commits behind with other sessions' work and therefore needs a worktree PR; (5) the absent rc.1 rollback floor, accepted deliberately.

Do NOT re-run `dsh-017-restore-mode.py`: the shipped `standard` preset is byte-identical between the last two tags and the operator's plugin list matches it exactly (21 ids to 21 ids), so re-deriving would only revert the deliberate `maxBytes: 131072`.

Two things that will save time next update. The catalog GENERATORS must be MERGED rather than taken from either side, because taking one side drops that side's entries while the regenerated output still looks consistent. And packaging must run with a real hidden console and NO stdio redirection, because a redirected file handle still kills `prepare:dsh` at `runtime:lockfile` even though pnpm has already done all its work.

Session page: `C:\Projects\logs\2026-09-30\dsh-020-rc2\`.

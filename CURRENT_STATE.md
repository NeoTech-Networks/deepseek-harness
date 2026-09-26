# CURRENT_STATE (capped newest-first log)

## 2026-09-26 - plan review auto-open fix (fix/plan-review-autoopen)

- **Bug:** a pending plan review only opened in the right sidebar when it arrived while its session was on screen. Arriving elsewhere, then switching back, left it closed.
- **Cause:** `PlanReviewOpen` gated the automatic open on a render-time reading of `ctx.sidebarRight.mounted`. A session switch releases the old seat and binds the new one in separate effects, so the open ran against no binding, threw `no session surface is mounted`, was never marked opened and never retried.
- **Fix (commit 3e4531fe32, pushed):** new `packages/client/ui-plan/src/client/auto-open.ts` (`openWhenSeated`) reads the seat live, requires it to belong to the review's session or a subagent's parent, and retries on each seat change until one open succeeds. `PlanReviewOpen` uses the injected `autoOpen`; the `sidebarMounted` hook was removed. README en/zh updated and pairing re-recorded.
- **Build:** packaged unsigned 0.1.7-rc.2 installer from this worktree; installed by Steve 2026-09-26 ~19:05 local. Installed `resources\app.asar` SHA-256 6C8EF3EC... equals the built one.
- Base: `update/v0.1.7-rc.2` (97b72f1180). Upstream `deepseek-ai` has no equivalent fix as of 2026-09-26.

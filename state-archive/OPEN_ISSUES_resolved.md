# OPEN_ISSUES resolved (archive sidecar, newest first)

Items this file's owner proved resolved come here, removed from `OPEN_ISSUES.md`
but never deleted. Source file named per entry.

## 2026-10-30 - from OPEN_ISSUES.md (Bot Sessions published ids)

13. [CLOSED 2026-10-30] `packages/client/ui-workspace/tests/all-sessions.client.spec.tsx` had 4 failing tests on `update/v0.2.0-rc.2`, failing identically without the 2026-10-08 changes (expects a session name, gets the ungrouped label). DIAGNOSED 2026-10-30: the `summary()` fixture sets `displayTitle` while the row renders `session.title`, so the title comes out empty and the assertion lands on the Workspace column (`未分组`). RESOLVED 2026-10-30 in commit `96b5725a3f` both ways: the fixture now sets `title`, and the row gained the `t('session.untitled')` fallback every other sidebar row already had, which was the real defect. The suite is now 13 files and 524 tests, all passing.

# Next session prompt

Continue deepseek-harness. The 2026-09-16 build is INSTALLED AND VERIFIED at the
code level (01:11 to 01:14): 20 of 20 local feature markers are present in the
running build, and all three changes are in the running profile.

## What is left, and none of it is a read

The mechanical half is done and recorded. The remaining three arms need hands or
eyes, so they are Steve's, and only then does the loop close:

1. **Press Ctrl+Shift+A** with the All Sessions list open, then with the workspace
   tree open. Expected: the session leaves both and the window shows the New
   Session view. Then once with no session open: a banner, nothing archived.
2. **Fold a named group** from its header: a triangle beside the group name, and
   the label should look larger than the old 11px. Then restart the app and
   confirm the fold is still there.
3. **Look at the grouped sidebar as a whole.** The chevron and hover are copied
   from the All Sessions header and the 13px size is a CSS value; nobody has seen
   the rendered result.

## One small thing to decide, not to fix blind

Add/Remove Programs holds TWO rows for this single install:
`7260a3eb-fb49-5c0a-a594-ea7b31e1d959` and `7808434f-469e-5eba-848e-edf64d3b94ce`,
same version, same uninstaller path. It is the app-id mismatch first recorded
2026-09-10 (the build sets `DSH_DESKTOP_APP_ID=com.neotechnetworks.deepseek-harness`;
the install line predates it). Both rows remove the same install, so it is
cosmetic. The 2026-09-09 session cleaned the same duplicate by exporting the key
to `~\.claude\Exports` and deleting it. The durable fix is to settle on one app id
in the ds-harness-update skill and in every future build, and only then retire the
extra row.

## What shipped, for the record

Worktree `C:\Projects\worktrees\dsh-archive-shortcut`, branch
`feat/archive-session-shortcut`, three commits, all fast-forward merged into
`update/v0.1.5-rc.2` and pushed (both refs read back at `1a77e844ad`):

- `1e78c99f4f` Ctrl+Shift+A archives the Session the window is showing.
- `e7b9f7ef6d` a named Workspace group folds from its own header, choice persisted.
  The folded map was added without a persist-key bump on purpose; read the
  2026-09-16 section of `CURRENT_STATE.md` before touching that store.
- `1a77e844ad` the group header label is 13px (was 11px), the default for every
  group.

Installer run: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,906,904 bytes,
2026-09-16 00:39:04. Evidence of the install and the marker read-backs is in the
2026-09-16 sections of `CURRENT_STATE.md` and `VERIFICATION_RESULTS.md`; the
provision log is `~\.dsh\desktop\logs\provision-2026-09-16T05-11-34-481Z.log`.

## Still open elsewhere, unchanged

- OPEN_ISSUES 27: the All Sessions rail defect. NOT touched by this work.
- OPEN_ISSUES 28: the session footer, the workspace count badge and a long
  question card have still never been eyeballed on screen.
- OPEN_ISSUES 29: `deepseek-flash` stalls intermittently; the 25s first-payload
  bound and the retry policy are live.
- PRE-EXISTING GATE FAILURE, found 2026-09-15: `verify-client-ui-i18n` exits 1 on
  two hard-coded strings in
  `packages/client/ui-sidebar-explorer/src/client/definition.ts`. Untouched here
  and present on the committed base. Decide whether to fix it or record it as
  intended.
- Step 8 housekeeping: the 2026-09-15/16 pass is written (version-history row,
  error ledger 37, CHANGES page). The 2026-09-13 gaps (question-card scroll, pwsh
  wrap, All Sessions recovery) are still owed.
- Not taken up: upstream `dsh-v0.1.6-alpha.1` (2026-09-15). The installed app and
  the local stack are both on `0.1.5-rc.2`, deliberately.

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master` (this file and the other state
files are committed there). The RC line lives in
`C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`, which still carries five MODIFIED
state files left by an earlier session; they are stale copies of the
OPEN_ISSUES-16 kind. Do not commit or publish them, and compare against
`git show origin/master:<file>` before touching any state file in a worktree.

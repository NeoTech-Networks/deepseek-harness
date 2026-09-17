# Next session prompt

Continue deepseek-harness. The session footer change is BUILT, TESTED, MERGED,
PACKAGED and INSTALLED. The running build is verified at the code level: 21 of 21
feature markers, the new marker in the running profile, the provision log clean.

## The one thing left

Nobody has LOOKED at the footer of an open Session. The mechanical half is proved;
the visible half is not.

1. Click into any started Session (the app was last seen on the New Session screen,
   where the footer correctly does not render).
2. Expected in an ordinary folder: `Dashboard:` and `Design Project:` on two lines
   under the message box, both EMPTY, and NO grey session summary above them.
3. Expected in a mapped workspace: `Dashboard: <full url>` and `Design Project: <name>`.
   `C:\Projects\repos\sig-railway-services\services\youtube-creator` is mapped and
   resolves to `https://ops.theseoitguy.net/youtube-creator` plus `YouTube`; so are
   the dashboard page folders under vercel-services and their worktrees.
4. Photograph the window (a DPI-aware capture; without `SetProcessDPIAware` the
   capture silently grabs only the top-left corner of the window). Evidence folder
   `C:\Projects\logs\2026-09-17\dsh-session-footer-lines\`.

## Maps and the restart rule

`~\.dsh\dashboard-links.json` (89 entries) and `~\.dsh\design-links.json`
(83 entries, every name read from Claude Design) are written by
`C:\Claude\bin\dsh_dashboard_links.py`. Entries beyond the 66 dashboard page
folders are the 23 unambiguous producer SERVICE folders; 10 ambiguous services
(`content-planner` alone publishes 17 dashboards) are skipped by name. The host
memoizes the map on first use, so a map edit needs an app RESTART, never a rebuild.
Names come from `list_projects` (20 on the primary account, 9 on `team_account`,
no pagination) plus `get_project` for every id the list misses.

## What shipped, for the record

- `4980d90f54` host resolver (`packages/api/session-controller/src/workspace-links.ts`,
  wired through `list.ts`, `types.ts`, the client summary and the lineage entry).
- `e15a4fc5f4` the two footer rows, the CSS, the locale pair, and the tests.
- Both fast-forward merged into `update/v0.1.5-rc.2`, both refs at `e15a4fc5f4`.
- Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,884,537 bytes,
  2026-09-17 01:20:22, installed at 01:49 from
  `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`.
- Feature registry: 21 rows (`session-footer`, `session-footer-design-project`).

## Still open elsewhere, unchanged

- PRE-EXISTING GATE FAILURE: `verify-client-ui-i18n` exits 1 on two hard-coded
  strings in `packages/client/ui-sidebar-explorer/src/client/definition.ts`.
- PRE-EXISTING TEST FAILURE: `media-references.host.spec.ts` fails on `symlink EPERM`
  with Developer Mode off. Both reproduced on `1a77e844ad`.
- A push from the fork's PRIMARY checkout cannot run the pre-push typecheck; push
  state commits by SHA from a healthy worktree (playbook error ledger 38).
- OPEN_ISSUES 27: the All Sessions rail defect. NOT touched.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`.

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master`. The release line is in
`C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`, which still carries five MODIFIED
state files from an earlier session; do not commit or publish them.
`C:\Projects\worktrees\dsh-footer-links` is the feature worktree;
`feat/session-footer-links` is merged and can be deleted when convenient.

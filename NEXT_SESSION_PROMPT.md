# Next session prompt

Continue deepseek-harness. TWO changes are INSTALLED and verified at the code level:
the Session-footer intent fix, and the sidebar's folders sorting by name. The install
ran on 2026-09-18 at 09:58, the profile was re-extracted, and all three markers plus
all 23 features read back out of the RUNNING build.

## The one thing left (one click, then one capture)

A POPULATED footer has never been photographed, because every Session the window was
showing at capture time maps to no dashboard.

1. Open any Session whose workspace resolves: the `Dashboard Design ...` row in All
   Sessions is one, and any Session in the Vercel workspace is another.
2. Capture the window DPI-aware and read the PNG back:
   `pwsh -File C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`
   (without `SetProcessDPIAware` the capture silently grabs only the top-left corner).
3. Expected under the message box: `Dashboard: <full url>` as a link, and
   `Design Project: <name>`.

## Already verified on 2026-09-18, with the evidence

| Check | Result |
|---|---|
| Installer ran | Installed exe 244,440,576 bytes written 2026-09-17 23:52:40, the 23:52 build |
| Provision log | `provision-2026-09-18T13-58-39-011Z.log` ends `staged health check passed` (14:04:39Z), `staging profile activated as 0.1.5-rc.2`, `applyRelease finished` |
| Processes | 4, started 09:58:36 to 10:04:45 |
| Running profile | `resolveSessionLinks` (2, 09:58:52), `hasWorkspaceLinks` (2, 10:00:14), `byWorkspaceName` (3, 09:59:05) |
| Feature registry | `dsh_local_features_check.py` exit 0, "all 23 local features are present in the running build" |
| Sidebar folder order SEEN | Under the expanded SIG group: Agents, backlinks, blog-articles, client-reporting, content-planner, Google Business, onboarding, service-pages. `sidebar-band.png` |
| Footer hides when nothing resolves SEEN | The open Session (maps to nothing) shows no footer rows at all, where the old build drew both labels empty. `composer-band.png` |
| Shipped resolver against the LIVE maps | Vercel plus `/dashboard https://ops.theseoitguy.net/keywords` -> keywords URL plus `Keywords`; `services\youtube-creator` -> youtube-creator plus `YouTube`; unmapped -> `{}`; `https://theseoitguy.com/youtube-creator` -> `{}`. `resolve_live.txt` |

Evidence folder: `C:\Projects\logs\2026-09-18\dsh-footer-intent\` (`app-window.png`,
`sidebar-band.png`, `composer-band.png`, `resolve_live.ts`, `resolve_live.txt`,
`capture_app_window.ps1`, `crop_png.ps1`). The 2026-09-17 folder beside it holds the
build-time evidence (`resolver_count.py`, `map-check.txt`, `EVIDENCE.md`).

## What shipped, for the record

- `43500cd452` `fix(session-footer): resolve the dashboard a Session names, and hide an
  empty footer`. Files: `packages/api/session-controller/src/workspace-links.ts`,
  `packages/api/session-controller/src/list.ts`, their spec, and
  `packages/client/ui-conversation/src/client/skeleton/ConversationRoot.tsx` (with its
  spec).
- `a21af3a222` `feat(ui-workspace): sort the sidebar's folders by name inside every
  group`. Files: `packages/client/ui-workspace/src/client/tree.ts` and its spec. The
  folders under each group sort by the name they show, with the same natural
  case-insensitive collator the file explorer uses; the group headers use it too, so
  both levels order identically. Sessions inside a folder keep their Manual or
  Last-updated order. One existing test asserted the old Host order, which is what the
  operator asked to change; it now pins the session order and the sorted folder order.
- Both fast-forward merged into `update/v0.1.5-rc.2`; both refs pushed to the fork
  (`43500cd452..a21af3a222`).
- Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,901,646 bytes,
  2026-09-17 23:52:45, built in `C:\Projects\worktrees\dsh-footer-intent`, superseding
  the 19:16 build so ONE install carried both changes. Markers were read out of the
  packaged seed `.tgz` archives before handover, not out of the source.
- Feature registry 23 rows: `session-footer-intent` (marker `resolveSessionLinks`) and
  `workspace-folder-sort` (marker `byWorkspaceName`).
- `C:\Claude\bin\dsh_dashboard_links.py` gained `--check` (config repo `4e9b97ff`).

## Known limits of the fix (not faults, do not re-report them)

- A Session whose first message never names a dashboard shows no footer.
- A cold Session resolves by folder alone, because the list path never opens a cold
  Session log. The footer renders under the open Session, which is live.
- A Session that changes its dashboard target later keeps its first answer.

## Still open elsewhere, unchanged

- Pre-existing i18n gate failure: two hard-coded strings in `ui-sidebar-explorer`.
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with
  Developer Mode off.
- OPEN_ISSUES 27 (All Sessions rail) is untouched.
- The estate checkout `C:\Projects\repos\vercel-services` is 38 commits behind
  `origin/main`. The maps were current on 2026-09-17, but a dashboard added to `main`
  would be invisible to the generator until that checkout is updated.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master`.
- `C:\Projects\worktrees\dsh-footer-intent` is this session's worktree; its branch is
  merged into the release line and pushed.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` and STILL
  carries five uncommitted state files from an earlier session; do not commit or
  publish them.
- `C:\Projects\worktrees\dsh-footer-links` (`feat/session-footer-links`) is merged and
  can be deleted when convenient.

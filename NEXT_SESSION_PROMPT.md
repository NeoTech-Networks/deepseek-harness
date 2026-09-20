# Next session prompt

Continue deepseek-harness. ONE change is BUILT, PACKAGED and on the release line, and
NOT installed: the sidebar session row now draws the session's LIVE stage instead of a
bare dot for a running session, using the eight marks from the Claude Design project
`dsh icons`. Code, gates, the packaged seed and a component-level render are proven; the
running build and the sidebar itself are not.

THE INSTALLER IS NEWER THAN THE ONE THE PREVIOUS PROMPT NAMED and it SUPERSEDES it:
`C:\Projects\worktrees\dsh-stage-icons` was cut from the same release line, so its build
carries the session-footer work of 2026-09-19 as well as the stage marks. ONE install
covers both, and the footer-only build in `C:\Projects\worktrees\dsh-footer-live` is no
longer the one to run.

## The one thing left (one install, then TWO captures)

The install force-closes the app that hosts the session that built it, so the operator
runs it from a NEW PowerShell window (SmartScreen: "Run anyway"):

```
powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-stage-icons\finish-install.ps1"
```

It prints `SETUP COMPLETE. Running 0.1.5-rc.2` when first-run setup (about four minutes,
no window) has finished. Do not re-run it because the app "looks stuck".

Then, in this order:

1. `py C:\Claude\bin\dsh_local_features_check.py` must exit 0 with 27 of 27 features. The
   two new rows are `session-stage-marks` (marker `dsw-stage-arc-spin`,
   `dsh-client-ui-workspace`) and `session-status-failed` (marker `deploying`,
   `dsh-session-status`); both were verified ABSENT from the running build before the
   install, so a MISSING row here is a real loss and not a stale marker file.
2. Read the running code, not the repo. In
   `~\.dsh\profiles\desktop\node_modules\@deepseek-ai\`:
   `dsh-client-ui-workspace\lib\client.js` must carry `dsw-stage-arc-spin`;
   `dsh-session-status\lib\index.js` must carry `deploying`;
   `dsh-client-ui-sessions-panel\lib\client.js` must carry `IconStageWorkingOutline24`.
   Take boot proof from the newest `~\.dsh\desktop\logs\provision-*.log` (it must end
   `staged health check passed`, `staging profile activated as 0.1.5-rc.2`,
   `applyRelease finished`) plus four or more live processes.
3. THE SIDEBAR CAPTURE. Open a session with work actually running and photograph the
   sidebar with `pwsh -File C:\Projects\logs\2026-09-18\dsh-footer-intent\capture_app_window.ps1`
   (without `SetProcessDPIAware` the capture silently grabs only the top-left corner),
   crop the sidebar band with `crop_png.ps1` beside it, and read the PNG back. Expected:
   a spinner mark on the running row, a speech-bubble mark on a session waiting on an
   answer, the list/check plan mark in plan mode, and the green or grey dot unchanged on
   done and idle rows. This closes OPEN_ISSUES 5's visual half and is the first time the
   marks have been seen in the app rather than in a component render.
4. THE FOOTER PHOTOGRAPH NOBODY HAS EVER TAKEN (unchanged from the previous prompt).
   Open a Session in the Vercel workspace whose own messages name a dashboard (any of the
   52 resolving Sessions; one is `session-30675526-1e86-4ffa-b430-a700c01409c5`), crop the
   composer band and read the PNG back. Expected under the message box:
   `Dashboard: <full url>` as a link and `Design Project: <name>`. This closes
   OPEN_ISSUES 28 and 33.

KNOWN PITFALL FOR STEP 3: the desktop app is single-instance, so `pnpm run start:desktop`
from a worktree does NOT open a second window while the installed app runs, it only
focuses the running one. The change must be seen through the installed build, which is
why the install comes first.

## What shipped, for the record

- `fe3a1a3c14` `feat(ui-workspace,ui-sessions-panel,session-status): the row icon reports
  the session's live stage`, 23 files, 615 insertions and 107 deletions, on
  `feat/session-stage-icons`, fast-forward merged into `update/v0.1.5-rc.2`; both refs
  pushed and read back at `fe3a1a3c14`.
- Eight stroke glyphs added to `packages/client/ui-primitives/src/icons/index.tsx`
  (Working, Writing, Waiting on user, Blocked, Failed, Session saved, Plan ready,
  Deploying) at the design's 14px working size: viewBox 24, stroke 2.2, default size 14.
  The icon-set assertion moved 75 to 83.
- `PHASE_GLYPHS` in `packages/client/ui-workspace/src/client/rows/Rows.tsx` now covers
  awaiting-approval, awaiting-plan-review, awaiting-answer, planning, running and
  subagents; `running` draws the Working mark and `liveGlyph` marks it live, with the
  wrapper pulse cancelled for it so two loops never share one 14px mark. `done` and `idle`
  keep their dots; `subagents` keeps its agent mark, because the design covers eight
  stages and delegation is none of them.
- `STATUS_ICONS` grew to nine ids: four new (`deploying`, `blocked`, `saved`, `failed`)
  plus the five legacy ids, which stay valid and map to the nearest new mark. The
  allowlist only ever grows, because an icon id rides a stored `session/status` event and
  dropping one would make an old row's status undrawable on replay.
- `DEFAULT_VOCABULARY` in `packages/session-status/session-status/src/index.ts` points at
  the new marks and gains a `failed` status, so the Failed mark is reachable from the row
  menu and the `set_session_status` tool. `waiting-production` carries the deploy tray,
  `stuck` and `waiting-external` share the hourglass (identity in the glyph, urgency in
  the tone), `finished` carries the card-and-check, and `paused` keeps the pause glyph,
  which the design has no stage for.
- THE GLYPHS CARRY NO ANIMATION AND NO INLINE STYLE. Each animatable element names itself
  with `data-part`, and `Rows.module.css` owns the keyframes and the transform origins.
  That is what lets one rule stop all of them for `prefers-reduced-motion`, and it is why
  every glyph's resting frame is the complete mark. The design's own sub-16px reduction is
  applied in CSS: one plan check on the middle row, and the hourglass without its base
  line.
- `SessionsPanel.tsx` draws the same marks at its own 12px size, so one session cannot
  read two ways in one window.
- Gates: 252 tests across 11 files in the four touched package groups, `pnpm run typecheck`
  exit 0, `pnpm run build` exit 0 with "recorded 240 client artifact(s)", 0 new lint
  findings. The four generated artifacts this change touches were regenerated and their
  verifiers pass.
- Installer `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,849,563 bytes,
  2026-09-20 11:55:36, built in `C:\Projects\worktrees\dsh-stage-icons`. Markers were read
  out of the packaged seed `.tgz` archives before handover: `dsw-stage-arc-spin` (3) in
  `dsh-client-ui-workspace`, `deploying` (3) in `dsh-session-status`,
  `IconStageWorkingOutline24` (1) in `dsh-client-ui-sessions-panel`, and all eight glyph
  paths in the packed `web-frontend` `index-CkHN3ty-.js`.
- Feature registry 27 rows.
- Evidence: `C:\Projects\logs\2026-09-20\dsh-stage-icons\` (`design-extract.md` is the
  frozen glyph extract; `stage-marks.html`, `shot_1100.png` and `zoom-14px-paused.png` are
  the component-level render).

## Known limits of this change (not faults, do not re-report them)

- The Writing glyph ships and NOTHING selects it. The row carries no signal that separates
  "producing output" from "in flight", and the design gives the Working spinner precisely
  for the coarser case, so `running` draws Working. The pen is there for the banner and
  pill slots the design also specifies, which are out of scope here.
- The component render proves the SHAPES, not the theme colours: `var(--dsw-alias-state-*)`
  lives in the app's global theme, not in the stylesheet that was rendered, so
  `shot_1100.png` shows the marks in the inherited ink. The colours are unchanged
  behaviour on the same tokens the old glyphs used, and the install is what proves them.
- `failed` is a DECLARABLE status, not an inferred one. An automatic failure badge would
  need a new fact on the session list summary, a new manager state and a new expiry rule,
  which is a different change and was deliberately not half-built.
- The old `?? UNKNOWN_STATUS_ICON` lines in `Rows.tsx` and `SessionsPanel.tsx` still
  carry a pre-existing type-aware lint finding. Removing the `??` would break the tested
  fallback for an icon id this client does not know.

## Still open elsewhere, unchanged

- Pre-existing gate findings, all reproduced on the untouched base commit:
  `verify-client-ui-i18n` 2 (`ui-sidebar-explorer`), oxlint repo-wide 52 errors,
  `verify-module-graph` and `verify-doc-graphs` stale (the base commit's committed module
  graph does not name `pkg_session_status`, which exists in that tree).
- Pre-existing test failure: `media-references.host.spec.ts` symlink `EPERM` with
  Developer Mode off.
- OPEN_ISSUES 16, 16b, 16-root-cause: the state-file loss loop and the never-merging
  state-sync PR are untouched, and this session took a `CURRENT_STATE.md` change from
  another session mid-edit, so the hazard is live.
- The estate checkout `C:\Projects\repos\vercel-services` is behind `origin/main`.
- Not taken up: upstream `dsh-v0.1.6-alpha.1`.

## Checkout state

- `C:\Projects\repos\deepseek-harness` is on `master` and carries this session's state
  sections.
- `C:\Projects\worktrees\dsh-stage-icons` is this session's worktree
  (`feat/session-stage-icons`), and it holds the installer and `finish-install.ps1` the
  install line above uses. Do not delete it until the install is verified.
- `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2` holds `update/v0.1.5-rc.2` and STILL
  carries five uncommitted state files from an earlier session; do not commit or publish
  them.
- `C:\Projects\worktrees\dsh-footer-live` and `dsh-footer-intent` are merged and their
  installers are superseded; they can be deleted when convenient, but only after
  `dsh-stage-icons` has been installed, because `dsh-footer-intent` holds a known-good
  older installer.

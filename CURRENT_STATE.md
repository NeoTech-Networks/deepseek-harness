<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=e9882722-4aa9-476d-a750-3fff8a9e8b51 at=2026-09-09T00:08:42.118722+00:00
-->
## 2026-09-10 - All Sessions sidebar section: built and packaged, install pending

New `sidebar.allSessions` slot (declared by ui-sidebar, filled by ui-workspace)
adds a collapsible "All Sessions" section above the Workspace browser: every
unarchived session newest-first, each row showing the live status mark, the
session title, and the owning Workspace name; clicking a row opens the session.
Fold state persisted in a new `dsh.workspace.allSessions.v1` store, default
expanded, wide-only. Built on `feat/sidebar-all-sessions` (worktree
`C:/Projects/worktrees/dsh-all-sessions`, commit `6eb1341b69`), one commit on
top of `update/v0.1.5-alpha.2`.

Gates green: client typecheck exit 0, 69 targeted tests pass (4 files), oxlint
clean on changed files, client slot catalog regenerated, Agent Note plus
bilingual READMEs pass format/classification/pairing gates. Installer
`deepseek-harness-0.1.5-alpha.2-win-x64.exe` (194,723,910 bytes) packaged after
seeding the Node runtime download cache and clearing a stale win-unpacked
(EPERM, error-ledger row 14). Feature confirmed inside the packed
`dsh-client-ui-workspace` tarball. Install handed to Steve via
`finish-install.ps1`; NOT yet confirmed installed.

## 2026-09-09 - Right sidebar per-session width: ported, built, installed, verified

The per-session panel-width fix (written 2026-09-09 but left uncommitted on the
pre-0.1.5 line, branch fix/account-usage-remote-mount) is now LIVE in the
running app. It was ported onto update/v0.1.5-alpha.2, resolving the
0.1.3-to-0.1.5 store-shape conflicts (the single global `rightbar` became
`layoutInfo.rightbarBySession`, keyed by session id), committed bf27396cf6,
pushed, built, packaged (194,643,720 bytes), and installed by Steve at 19:13
via a new INSTALL.cmd double-click wrapper (added because the pasted one-liner
was failing silently again). The running profile's
`dsh-client-ui-layout/lib/client.js` carries `rightbarBySession` (6 occurrences)
and the old single `rightbar` value is gone. Install-log: seed integrity
271/271 PASS, profile cleared, relaunched, dsh-config-vault 18 files all same.
What is left is Steve's visual pass: resize the right sidebar in one session,
switch to a second, and confirm the widths are independent.

## 2026-09-09 - Alt+S / Alt+P: DONE, installed and confirmed working in the app

0.1.5-alpha.2 installed at 14:29, profile re-extracted at 14:34. The keyup
binding was read back out of the RUNNING profile, `dsh_local_features_check.py`
reported 10 of 10 present (exit 0), `dsh_config_vault.py verify` reported 18
files all same (exit 0) with a post-install snapshot of 0 changed, and Steve
pressed Alt+S in the installed app and reported it worked. The section below is
the record of how it was found and fixed.

## 2026-09-09 - The Alt+S / Alt+P shortcuts: root cause found, fixed, packaged, install pending

The shortcuts never worked in the desktop app, and the update did not break
them. The code was in the installed 0.1.5-alpha.1 build the whole time.

**Root cause: Electron on Windows never delivers the KEYDOWN of an Alt+letter
chord to the renderer.** Only `Alt` arrives as a keydown; the letter arrives
solely as a `keyup` carrying `altKey`. Measured with a stripped-down Electron
window built from the packaged runtime and real `SendInput` scan-code
keystrokes. `before-input-event` in the main process sees the same keyUp-only
pair, a hidden `Alt+S` menu accelerator never fires, and removing the
application menu changes nothing. A browser delivers both events, which is why
93 unit tests and a real headless Chromium run both passed against the broken
binding.

**Fix** (commit `aca41e5f7b` on `update/v0.1.5-alpha.2`): bind to `keyup`, toast
instead of refusing in silence when the composer is locked or mid-admission, and
send the canonical lowercase `deploy to production`. Rebuilt and repackaged as
`deepseek-harness-0.1.5-alpha.2-win-x64.exe` (194,655,398 bytes); the fix is
confirmed inside the packaged seed archive. **Install is operator gated and has
not happened yet**, so the running app is still 0.1.5-alpha.1.

**Two survival guards now exist**, and they cover different halves:

- `C:\Claude\bin\dsh_config_vault.py` with the vault at
  `C:\Projects\repos\dsh-config` (local git, no remote) protects the operator's
  `~/.dsh` configuration: `settings.yaml`, the `.agent-presets` preset that
  mounts the desktop MCP servers, `cordis.patch.yml`, `AGENTS.md` and the 13
  slash-command skill wrappers. 18 files. `.credentials.yaml` is denied by the
  manifest and proven never to have entered the history. A hidden daily task
  snapshots at 09:00.
- `C:\Claude\bin\dsh_local_features_check.py` covers what a settings backup
  cannot: it reads the EXTRACTED profile and reports any of the 10 local fork
  features an update dropped. A dropped feature leaves a perfectly healthy app.

`finish-install.ps1` now snapshots before it installs, verifies after, and
prints the feature-check command.




## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=e9882722-4aa9-476d-a750-3fff8a9e8b51 at=2026-09-09T00:08:42.118722+00:00
-->
## 2026-09-09 - Why state files keep dying: two inherited upstream checks and a native build the fork cannot do

Two independent, provable reasons no state-sync PR ever merges on this fork.
Both were read live this session and together they explain every "diverged from
origin/master" receipt going back to 2026-09-08.

- **Reason 1, the required checks can never pass here.** `Issue policy` and
  `Issue lifecycle` both call `actions/create-github-app-token` against
  `owner: deepseek-harness` with a GitHub App credential that exists only in the
  upstream organization. On `NeoTech-Networks/deepseek-harness` they fail in 9
  seconds on every PR, verbatim: `Error: The 'client-id' (or deprecated
  'app-id') input must be set to a non-empty string.` Everything else on the
  live status PR #6 is green or pending (`node 26`, `node 24.9`, `Pack npm
  tarballs`, the python matrix). The maintenance worker is behaving correctly by
  refusing to merge; the gate is simply unpassable.
- **Reason 2, the pre-push hook cannot build a native dependency.** Two receipts
  (13:31Z and 12:19Z) show the PUSH failing, not the merge: lefthook's
  `pre-push` typecheck runs `pnpm install` in the worker's throwaway worktree,
  `fs-ext@2.1.1` needs `node-gyp`, and there is no Visual Studio C++ toolchain
  here, so `Could not find any Visual Studio installation to use` kills it.
  NOTE: upstream alpha.2 ships "Fix npm installations that previously required a
  local `fs-ext` build", so installing alpha.2 should remove this half by itself.
- **Consequence, measured.** `origin/master` never moves, every checkout drifts,
  and 8 of the 10 checkouts on this machine holding `CURRENT_STATE.md` carry
  short stale copies (80, 68, 106, 119, 135, 98, 98 lines) against 287 in git.
  Any process that publishes one of those over the primary destroys real
  history, which happened twice today (11:56 and 12:31 local, both recovered
  from git, damaged copies kept in `%TEMP%`).
- **The save-state writer is RULED OUT.** `apply_marker_block` in
  `memory_save_state_actor.py` was re-read at lines 1030-1079: create-if-missing,
  regex-replace one block in place, or append at the end. No branch can shorten a
  file, and its read-failure branch skips rather than overwrites.
- **The fix is a DECISION, not housekeeping**, because it changes what gates a
  merge on `master`: stop those two inherited workflows running on this fork,
  drop them from the required set, or point status PRs at a branch they do not
  gate.

## 2026-09-09 - 0.1.5-alpha.2 built, packaged and proven in the installer; INSTALL NOT YET RUN

- **Upstream moved again the same day.** `dsh-v0.1.5-alpha.2` published
  2026-09-09T14:23:10Z, one release past the installed 0.1.5-alpha.1. It brings
  the right-sidebar document preview (Markdown, code, HTML, PDF, images),
  model-delivered files in a session, `/feedback` detail, and seven fixes.
  Session-data format is now V3 and the web plugin panel API moved the
  `conversation` slot under `main`.
- **Branch `update/v0.1.5-alpha.2`**, worktree
  `C:/Projects/worktrees/dsh-update-v0.1.5-alpha.2`, pushed to the fork. The
  local stack was rebased onto the tag (`git rebase --onto dsh-v0.1.5-alpha.2
  dsh-v0.1.5-alpha.1`), 18 files conflicted and were resolved by hand; the
  lockfile took the upstream side and `pnpm install` re-added the workspace.
- **Four previously unshipped local fixes cherry-picked in**, so this build is
  the first to carry them: session-status icons `e5146450e3`, first-run
  provisioning `f82bb8df30` and `f291778191`, console-window suppression
  `5e10c7c560`.
- **Upstream removed two APIs the fork used**, which no conflict marker showed
  and only the client typecheck caught: `SidebarRightGuideEntry.description` is
  gone, and `DocumentFileIcon` was replaced by `FileTypeIcon` +
  `classifyFileType`. The sessions panel and the explorer follow both, tests and
  locale dictionaries included. `gen-tsconfig-paths` also needed a hand-written
  alias for `@deepseek-ai/dsh-client-ui-sessions-panel`.
- **Gates, all green:** client typecheck exit 0, full build exit 0, plan-mode
  94/94, fs-local 156 passed 1 skipped 0 failed (the 13 documented Windows
  failures are GONE upstream, so that baseline no longer applies), 594 tests
  across 50 targeted files, packaging exit 0.
- **Installer:** `deepseek-harness-0.1.5-alpha.2-win-x64.exe`, 194,655,398
  bytes, app id `com.deepseek.harness`. Every fork package is in the packaged
  seed at 0.1.5-alpha.2, and `SessionPanelPhase` was read back out of the
  packaged `.tgz`'s built `client.js`, so the fix is in the artifact and not
  just in the source.
- **WHAT IS LEFT:** Steve runs `finish-install.ps1` from a separate PowerShell
  window. Until then the running app is still 0.1.5-alpha.1 and NOTHING in this
  section is live. After the install: the six verification rows, then
  `dsh_update_check.py` must report `UP TO DATE`.
## 2026-09-09 - Right sidebar panel width made per-session

Fixed the right sidebar so each session keeps its own panel width instead of sharing one global value.

- **Root cause.** The panel width lived in the root-scoped layout store as one `rightbar` number, so a panel dragged narrow in one session stayed narrow everywhere ("opens to minimize size no matter what session") and the width was shared across sessions ("the view stays the same no matter the session"). The tabs and expanded flag were already per-session; the width was the one shared piece.
- **Fix.** Keyed the width by session id (`rightbarBySession`) in `ui-layout/src/client/stores.ts`; `openRightbar`/`setRightbar` now take a session id; `AppFrame.tsx` reads/writes the current session's key; the right sidebar seat passes its session id through `syncPresentation`; the `ctx.layout.openRightbar` face and the client api-catalog follow.
- **Verified.** 220 tests pass across `ui-layout` and `ui-sidebar-right` (including two new per-session-width regression tests), client typecheck exit 0, `gen-client-catalog --check` and `gen-cordis-api --check` pass.
- **Not shipped.** The fix is uncommitted service code in the primary checkout `C:\Projects\repos\deepseek-harness` (branch `fix/account-usage-remote-mount`). Next: commit on the right branch, then build and install via the ds-harness-update flow, then smoke-test that each session remembers its own panel width in the desktop app.

## 2026-09-09 - Both harness fixes CONFIRMED LIVE in the running app, and a state file lost and recovered in the same pass

- **Installed and verified.** Steve installed at 08:35; the profile re-extracted
  with 247 packages and the app relaunched at 08:36. Read back out of
  `~/.dsh/profiles/desktop`: `dsh-fs-local/lib/index.js` carries
  `PUBLISH_RETRY_DELAYS_MS`, `publishOverExisting` and
  `readTextBytesConfirmingBinary`; `dsh-plan-mode/lib/index.js` carries
  `describePlanFault` with ZERO occurrences of the old rejection message. One
  install directory, no crash events in the Windows Application log.
  OPEN_ISSUES item 0 is closed on that evidence.
- **The "crash" the install reports is the install working.** Step 1 of
  `finish-install.ps1` is `taskkill /F`, so Windows and any session inside the
  app report a crash. The script now announces this before doing it, in both the
  header and a yellow line at run time, because it read as a failure twice.
- **The four doubted items were re-checked at the code level.** Every feature
  package is present in the running profile (`dsh-workspace`,
  `dsh-session-status`, `dsh-vision-routing`, `dsh-account-usage`,
  `dsh-client-ui-sessions-panel`, `dsh-win32-process` with the CREATE_NO_WINDOW
  flag, `dsh-goal`) and the accountUsage remote mount is in the running client
  bundle. Only the ON-SCREEN behaviour of items 1, 2, 5 and 10 is still
  unproven; that needs eyes, not another read.
- **Tidy-up:** the stale duplicate Add/Remove Programs entry left by the old app
  id was backed up to
  `~\.claude\Exports\2026-09-09_dsh-stale-uninstall-key-backup.reg` and removed.
  One entry remains, and it is the live one.
- **STATE FILE LOST AGAIN, AND RECOVERED.** `CURRENT_STATE.md` was found at 38
  lines: three stacked save-state marker blocks and NOT ONE dated section, where
  git HEAD and origin/master both held 251. Recovered whole with
  `git checkout HEAD -- CURRENT_STATE.md`; the damaged copy is kept at
  `%TEMP%\CURRENT_STATE.damaged.md`. **The 2026-09-08 writer fix is NOT the
  culprit and was not reopened**: that branch now skips rather than overwrites,
  and the code was re-read this session to confirm it. The likely mechanism is
  different, and is the sharpest form of item 16 yet: two per-session worktrees
  under `.claude/worktrees/` hold their own `CURRENT_STATE.md` at 80 and 68
  lines, built on the OLD checkout each was cut from, so anything that publishes
  a worktree's copy over the primary deletes every section written since. The
  other two repos were checked and are intact (C:/Claude 423 lines, jetway 507).

## 2026-09-09 - The two harness fixes ported to 0.1.5 and packaged into an installer

The job in `NEXT_SESSION_PROMPT.md`, done up to the operator's install step.

- **The port was a cherry-pick, not a rewrite.** Diffing the four touched files
  between the fix's parent and the 0.1.5 head showed exactly ONE line of
  divergence, in `plan-mode.spec.ts` (`tool/code-dispatch` renamed to
  `tool/ptc-dispatch`), and it does not overlap the fix. `git cherry-pick
  92e043bf4d` onto `update/v0.1.5-alpha.1` applied clean as `7c577fb6fe`.
- **Proven at source:** fs-local 142 passed with the 13 pre-existing
  POSIX-on-Windows failures unchanged and all 6 new cases named and green;
  plan-mode 94/94; repo typecheck exit 0; `pnpm run build` exit 0.
- **Proven in the artifact, which is the step every previous attempt skipped.**
  The packaged seed archives were extracted and read:
  `deepseek-ai-dsh-fs-local-0.1.5-alpha.1.tgz` contains `PUBLISH_RETRY_DELAYS_MS`,
  `publishOverExisting` and `readTextBytesConfirmingBinary`;
  `deepseek-ai-dsh-plan-mode-0.1.5-alpha.1.tgz` contains `describePlanFault` and
  zero occurrences of the old `requires a non-empty markdown plan` message.
  Installer `deepseek-harness-0.1.5-alpha.1-win-x64.exe`, 190,730,194 bytes.
- **The plan-mode defect was reproduced live on the way in.** This session's own
  plan, in the operator's house format with the metadata blockquote above the
  title, was rejected once by the running build with
  `exit_plan_mode requires a non-empty markdown plan starting with a # heading`.
- **`DSH_DESKTOP_APP_ID` was recorded wrongly and is now settled by derivation.**
  OPEN_ISSUES item 13 and the playbook both said
  `com.neotechnetworks.deepseek-harness`. The installed 0.1.5 build was made with
  `com.deepseek.harness`: electron-builder derives the NSIS uninstall key as
  `uuid5(appId)` in namespace `50e065bc-3134-11e6-9bab-38c9862bdaf3`, and the
  running app's key `7808434f-469e-5eba-848e-edf64d3b94ce` is that of
  `com.deepseek.harness`, while the other value produces the stale 0.1.3 entry.
  A wrong id does not fail the build; it installs a second parallel copy.
- **Also committed:** `finish-install.ps1` and `check-seed-integrity.py`
  (`5124a7e3ee`), which were sitting uncommitted. They clear the old seed before
  the silent install, assert seed integrity before relaunching, and keep
  `rollback` rather than deleting it.
- **NOT LIVE YET.** The install force-closes the app that hosts this session, so
  it is the operator's step. Nothing changes in the running harness until
  `finish-install.ps1` is run from a separate PowerShell window.
- Playbook updated in the same session: `05-neotech-fork.md` app id corrected
  with its derivation, install sequence rewritten, version history row added,
  error ledger rows 11-13.

## 2026-09-09 - Sessions panel shipped (right-sidebar session overview)

Built the ui-sessions-panel feature package: a right-sidebar Sessions tab that lists every open session regardless of workspace, Active-only by default (running, subagent, awaiting-input and planning first) with an All toggle for idle history. About 20 files under packages/client/ui-sessions-panel, 39 tests at 100% coverage, and an independent phase classifier re-implemented so the plugin never imports another feature plugin at runtime. Wired into the web-app bundle, the cordis patch, the tsconfig client references and the web-app package deps; added the sessions-panel tsconfig path alias, closing the sessions-panel half of OPEN_ISSUES item 9. Also fixed apps/desktop/scripts/prepare-runtime.ts to extract the node runtime with system tar (extract-zip produced an empty extraction on this host) and bumped finish-install.ps1 to 0.1.5-alpha.1. The feature shipped and installed in the 0.1.5-alpha.1 update; Steve confirmed everything runs successfully.

## 2026-09-09 - DSH v0.1.5-alpha.1 update shipped and installed

Updated the desktop harness from 0.1.3-alpha.2 to 0.1.5-alpha.1 in worktree C:/Projects/worktrees/dsh-update-v015 (branch update/v0.1.5-alpha.1). Rebased the local feature stack (workspace grouping, session status, vision routing, windows packaging, account-usage, sessions-panel) onto upstream v0.1.5-alpha.1 as one squashed commit plus three fix commits. Fixed two build breaks: missing path aliases (account-usage, session-status) and a sessions-panel e2e test that needed excluding from the web client typecheck. Bumped 8 local packages to 0.1.5-alpha.1. Full build exit 0. Packaged the unsigned installer (181.9 MB) and Steve installed it. Pushed branch update/v0.1.5-alpha.1 and tag dsh-v0.1.5-alpha.1 to NeoTech-Networks/deepseek-harness.

## 2026-09-09 - DSH daily review: state-file loss fixed at source, corruption attributed, model gaps closed

Audited all 52 DSH sessions from 2026-09-08 by decompressing the multi-frame zstd
session logs: 6,202 tool calls, 160 failures (2.58%), Opus 2.48% vs DeepSeek 2.75%.
New reusable tool `C:\Claude\bin\dsh_session_audit.mjs` reproduces the whole audit in
one command and is the regression check for everything below.

- **Three of my own first-pass conclusions were wrong and were corrected before any fix
  shipped.** Win32 1175 is "unable to remove the file to be replaced" (target held open),
  not a replacement-move fault. The tool-argument corruption is NOT a harness bug. Kimi
  and GLM authenticate fine.
- **State-file loss, root cause found and fixed at source.** `memory_save_state_actor.py`
  wrote state files with a plain `Path.write_text` (truncate-in-place) at four sites, and
  on a transient read failure overwrote the whole file with just the marker block. Now
  atomic (temp + fsync + os.replace, bounded retry) and the read-failure branch skips
  instead of destroying. Verified with a four-arm concurrency test: the old method showed
  a reader an incomplete file on 1,621 of 3,854 reads (42%); the new one 0 of 4,329, with
  the file always complete afterwards.
- **Harness hardened against any other non-atomic writer** (commit `92e043bf4d`):
  publication now retries and falls back to rename (9 lost writes on 2026-09-08), and
  read/edit confirm with a second read before declaring a file binary (4 false verdicts on
  a file containing no NUL byte). 6 new tests; fs-local failures unchanged at the 13
  pre-existing POSIX-on-Windows ones.
- **Argument corruption ATTRIBUTED, and it is provider-side.** `assistant/message` already
  records the raw provider stream. In all three damaged calls the damage is in the model's
  own FIRST JSON delta (`{"plan": "and#`), before any harness code. The accumulator is
  exonerated and was deliberately left alone. Three other plan rejections were the harness
  validator being too strict, now fixed.
- **`exit_plan_mode` accepts plans it used to reject** (blockquote or blank lines before the
  H1, which the local plan format itself mandates). It rejected this session's own plan
  twice. 94/94 plan-mode tests.
- **State files reconciled across three repos** with `C:\Claude\bin\state_file_reconcile.py`;
  the real worker now reports 0 needing attention for all three. 431 rows and 26 sections of
  lost history recovered into C:/Claude alone.
- **Every allowed subagent model probed live.** Eight answer; `glm-5.3-highspeed` is refused
  by Z.ai for lack of entitlement and was removed from `allowedModels`.
- `~/.dsh/AGENTS.md` now gives the memory tools their full `mcp__claude-memory-bridge__`
  names (DeepSeek called the short name and failed three times).
- Built and synced `dsh-fs-local` and `dsh-plan-mode` into `~/.dsh/profiles/desktop`. **That
  sync did NOT hold, see the post-relaunch check below.**
- **POST-RELAUNCH CHECK (Steve restarted the app): the two harness fixes are NOT live.** The
  desktop app runs published `0.1.5-alpha.1`; this checkout is `0.1.3-alpha.2`.
  `pnpm run start:desktop` re-provisions `~/.dsh/profiles/desktop` from 0.1.5 on every
  launch, which overwrote the libs synced into it earlier in the session. Read directly from
  the running build afterwards: `fs-local` still has `if (!isENOENT(error)) throw error;` at
  lines 165 and 184 plus 3 unguarded "binary file" sites, and `plan-mode` line 270 still has
  the old `/^#\s+\S/` test. The sync-into-the-profile technique therefore does not survive a
  restart, and any earlier session that claimed a fix was live on that basis needs
  re-checking the same way. New OPEN_ISSUES item 0; next session ports both onto the 0.1.5
  line at `C:/Projects/worktrees/dsh-update-v015` and ships a real installer.
- **The bridge speed-up IS live, and was measured on PRODUCTION traffic** after the change
  rather than on a bench: PreToolUse 1,832ms to 1,176ms (36% faster, n=114), PostToolUse
  1,520 to 1,042, UserPromptSubmit 3,048 to 2,247, Stop 5,007 to 3,252. The bridge is plain
  Python re-read on every invocation, so it needed no relaunch.
- **Hook tax cut, and its SHAPE fixed.** Four causes in the bridge, all measured, none of
  them the hook scripts: pool width below the fan-out; `shell=True` spawning `cmd.exe` per
  hook (553ms to 214ms over 22 cold starts); the transcript projection re-decompressing the
  whole session log every call; and `session_route` doing that same full decompress a second
  time to read two strings (0.671s of a 1.002s run). Cost used to GROW with session length;
  it is now 461ms on a 100KB log and 483ms on a 2.78MB log, effectively flat, down from a
  median 1,113ms. Commits `56969c4b` and `09fce83d` in `C:\Claude`.
- Final verification sweep, all green: the atomic-writer concurrency test (4 arms, the
  control arm still proving it can fail), the incremental-decode test (byte-identical to a
  full rebuild), fs-local 142 passed with the 13 pre-existing POSIX-on-Windows failures
  unchanged, plan-mode 94/94, bridge 69 passed with its one pre-existing policy-listing
  failure, 9 allowed models with `glm-5.3-highspeed` gone, the full MCP memory tool names
  present, and the save-state worker reporting "0 needing attention" for all three repos.

## 2026-09-09 - Desktop hung on the boot screen: accountUsage was never mounted on the Client

- ROOT CAUSE. `packages/api/remotes/src/client/index.ts` is a HAND-WRITTEN selection list, not a generated catalog. A `remote.<ns>` service exists only because that file `$mount`s the package's generated contribution (`packages/api/gateway/src/client/index.ts:660` builds the key `remote.<ns>`, `:348` constructs the service inside `createNamespace`). The account-usage commit d14e69cfa9 added the Host service and the browser consumer but never added the mount, so `remote.accountUsage` could not come into existence, the client entry parked on its `inject` forever, and `packages/client/web/src/boot.ts:150` reported `web boot: 1 entry did not activate` and never called `mountApp()`. The window sat on the loading screen.
- The two generated catalogs (`tool-cordis/src/api-catalog.ts:85`, `cordis-client-runner/src/client/slot-catalog.ts:504`) both knew about accountUsage and both shipped it. Neither can mount anything. There is no generated mount registry.
- FIX, 5 lines across 2 files: value import of `@deepseek-ai/dsh-account-usage/remote`, the declaration-merge re-export, the entry in the `$mount` array, and the devDependency. Committed in isolation as b99e942c0b on `fix/account-usage-remote-mount-only`, parented directly on d14e69cfa9.
- The desktop app keeps NO log file. The only channel that named the fault was the renderer console, reached by launching the exe with stderr redirected and `ELECTRON_ENABLE_LOGGING=1`. `DSH_DESKTOP_DIAGNOSTIC_FILE` wrote nothing because the Electron main process never threw; the failure was entirely in the browser half.
- Interim unblock that worked and was then removed: a `- id: account-usage` / `disabled: true` row in `~/.dsh/profiles/desktop/cordis.patch.yml`. The reinstall clears the profile, so it is gone; it was only ever an unblock.
- Rebuilt (`pnpm run build` then `pnpm run package:desktop:win:x64`), reinstalled through `finish-install.ps1`, profile re-extracted with 246 packages. Installer 190,744,191 bytes at 21:03.
- Packaging needed two env vars that live nowhere in the repo, `DSH_DESKTOP_APP_ID` and `DOWNLOAD_TEST_ORIGIN`, recovered from an older session transcript. It also failed twice on a transient EPERM renaming `win-unpacked.tmp`, which is an antivirus lock and not a code fault.
- CONCURRENCY HAZARD, confirmed live. Sessions restored inside the desktop app resumed autonomous builds in the SAME primary checkout, stomping the packed tarball directory mid-run (count observed climbing 100 to 126 with no build of this session's running) and breaking two packaging attempts. One of those sessions also committed this session's staged files into an unrelated wip commit on this session's branch. The app had to be closed to finish. This is the One Worktree Per Session rule failing in practice.
- Git left tidy: `fix/account-usage-remote-mount-only` = the isolated fix; `fix/account-usage-remote-mount` = the wip rebased on top of it (78d5d95934, tree identical to the pre-rebase commit so no file moved); `backup/wip-pre-rebase-87607362` = the pre-rebase copy. Nothing merged to master, nothing pushed.

## Last save-state (2026-09-09T03:50:14.915068+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `321e7af0-b0ab-4a0b-9a4c-de8eea784e39`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-6d11ab26-811b-4500-899f-621252ea2c9a

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=f37650c8-6b34-48cf-9494-775af97db5b1 at=2026-09-09T16:43:42.809531+00:00
-->
## Last save-state (2026-09-09T16:43:42.809531+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `f37650c8-6b34-48cf-9494-775af97db5b1`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-c7aa133d-166b-4416-9f6e-6d4f76ca3e93

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=8f0a49c1-6187-4582-9bd1-d8700eea3158 at=2026-09-09T17:49:01.394307+00:00
-->
## Last save-state (2026-09-09T17:49:01.394307+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `8f0a49c1-6187-4582-9bd1-d8700eea3158`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-1c7a1a4a-b736-4790-9770-d82530ff0656

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T23:35:44.128791+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `a463cfd2-49e3-4da7-b34c-e0db2cd09616`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-58e0688c-a243-41d8-9833-8412029663cc

<!-- claude-memory-actor:end -->

## Last save-state (2026-09-09T00:08:42.118722+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `e9882722-4aa9-476d-a750-3fff8a9e8b51`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-4a177f59-8ce0-4b1c-b9e9-675e49f71b98

<!-- claude-memory-actor:end -->

## 2026-09-08 - Live Claude Max usage readout in the composer footer

- New package `packages/llm/account-usage` (`@deepseek-ai/dsh-account-usage`), both faces: a Host `TypertRemoteService` (`ctx.accountUsage.read()`) and a browser dock entry seated on `conversation.composer.dock` beside the stats line.
- Host half reads the stored `llm-pi-ai/anthropic` OAuth grant through `ctx.credentials`, calls `GET https://api.anthropic.com/api/oauth/usage` with `anthropic-beta: oauth-2025-04-20`, and answers a snapshot of whole percentages plus reset instants. It never refreshes the token (that would race pi-ai); an expired grant answers `stale`. No token member exists on the wire type.
- Degraded answers keep the last figures: `stale`, `unauthorized` (401/403), `error` (any other fault), `unsupported` (no grant at all, which renders nothing, so a DeepSeek-only install is untouched).
- Browser half polls every 60s idle / 20s while a turn runs, plus one confirming read 1.5s after a turn settles and one on tab focus. Reads "5h N% - Week N%" with a click-open panel carrying reset times, any scoped weekly window, the month's extra-usage spend, and the degraded note.
- Wired into `packages/bundle/web-app` (dependency + `cordis.patch.yml` entry), new subsystem page `docs/subsystems/account-usage.md` (+ zh + pairing), catalogs regenerated.
- Verified: 27/27 package tests (15 host, 12 client), repo typecheck exit 0, `pnpm build` exit 0, and a live read-back where the service answered 5h 20% / week 20% / 11094 minor units of extra usage in the same second a raw call to the endpoint returned utilization 20 / 20 / used_credits 11094.
- Also repaired to get the tree green: an untracked prior-session package (`ui-sessions-panel`) had a test named without the `.client` suffix (host aggregate then compiled client sources), two strict-null test faults, and an apps/web e2e missing from the host include list; `vision-routing` config fields had no JSDoc.
- Committed `d14e69cfa9` on `feat/open-session-in-subfolder` (47 files). No deploy (local desktop app, not a Railway repo).
- Windows installer rebuilt (181.9 MB, unsigned, packaged with `DSH_DESKTOP_APP_ID=com.deepseek.harness` and `DOWNLOAD_TEST_ORIGIN=https://download.neotech.biz`), installed at 19:10, app relaunched 19:59 with the package present in `~/.dsh/profiles/desktop` and the dock entry in the running web-app patch. Only the on-screen look is still unproven.

## 2026-09-08 - Stopped console windows flashing on subprocess spawn

- Root cause: `@deepseek-ai/dsh-win32-process` `spawnCurrentTokenJobProcess` called `CreateProcessW` with `CREATE_SUSPENDED | CREATE_UNICODE_ENVIRONMENT` and no `CREATE_NO_WINDOW`, so every console-subsystem tool subprocess (pwsh, cmd, node) got a fresh visible console window. Third distinct cause of this symptom on this machine; the earlier two (Playwright MCP `--extension` crash loop, dashboard sweep dispatcher) were confirmed still fixed.
- Fix: added `CREATE_NO_WINDOW` (0x08000000) to the flags in `packages/subprocess/win32-process/src/abi.ts` + `process.ts`. Recompiled `lib/types` via tsc and patched the bundle and the running profile copy (`~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-win32-process/lib/index.js`) to the folded value 0x08000404.
- Committed `83f763c555` on `feat/open-session-in-subfolder` (2 files). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Composed session-status triggers into the presets (icons now reachable)

- Root cause of the session status icons never firing: `web-app/cordis.patch.yml` disables `command-session-status` (/status) and `tool-session-status` (set_session_status) at the host plane, but unlike their goal siblings they were never re-added to a preset, so neither the operator nor the model could declare a status.
- Added `command-session-status` + `tool-session-status` to the standard, cordis, and ptc presets (mirroring command-goal / tool-goal) in packages/preset/agent-presets/presets/{standard,cordis,ptc}/agent.cordis.yml.
- Added two checks: locked the full 5-status vocabulary (id/label/icon/tone) in packages/session-status/session-status/tests/session-status.spec.ts, and a shipped-preset completeness test (the two rows composed and not disabled) in packages/preset/agent-presets/tests/shipped-root.spec.ts.
- Verified 93/93 targeted tests across 4 suites (session-status 11, shipped-root 6, tree 40, rows 36).
- No deploy (local desktop app). Config-only (YAML), takes effect on app relaunch via launch-desktop.vbs. Live smoke still user-gated.

## 2026-09-08 - Dropped the [image omitted] placeholder next to vision descriptions

- Prompt admission in `packages/api/session-controller/src/commands.ts` now REPLACES the raw image blocks with the vision model's description text for a text-only model, instead of appending the description beside the "[image omitted ...]" placeholder. Commit `c1a9951d60` pushed to the fork on `feat/open-session-in-subfolder`.
- Added an assertion to `session-models.host.spec.ts` that no `image` block survives admission; 15/15 tests pass, host typecheck exit 0.
- Rebuilt `dsh-api-session-controller` and copied its `lib` into the installed profile so the change is live on the next app relaunch.
- End-to-end verified live (operator reloaded the app): attaching an image to a DeepSeek Pro session now yields ONLY `[Attached image description (vision model): ...]` with no `[image omitted ...]` placeholder. The vision model reads the screenshot accurately.
- No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Fixed $home collision in finish-install.ps1 and installed vision-routing

- Fixed the reinstall script `finish-install.ps1` aborting at line 33: `$home = ...` collided with PowerShell's read-only automatic `$HOME` (variable names are case-insensitive). Renamed the local to `$dshHome` (4 occurrences). Script re-parses clean; no reserved-name assignment remains.
- Re-ran `finish-install.ps1` elevated (UAC) to pick up the vision-routing package in the installed desktop app. Log at `C:\Projects\logs\2026-09-08-finish-install\finish-install-run.log` shows installing..., installer exit code 0, profile cleared, relaunched, done.
- Verified the app relaunched with vision-routing live: 4 "DeepSeek Harness" processes (main window visible and Responding, title "Use DeepSeek Pro for images"); package present in both `~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-vision-routing` and `resources/seed/desktop-packages/deepseek-ai-dsh-vision-routing-0.1.3-alpha.2.tgz`.
- `finish-install.ps1` is untracked in the checkout (local helper). No deploy (local desktop app, not a Railway repo).

## 2026-09-08 - Animated plan-mode icon and finished icon after save-state

- Animated the plan-mode sidebar icon while the session runs: `SessionStatusDots` (packages/client/ui-workspace/src/client/rows/Rows.tsx) now takes a `running` flag and sets `data-active="true"` on the planning glyph only when `phase === 'planning' && running`; `Rows.module.css` adds a 1.6s opacity pulse keyframe, disabled under `prefers-reduced-motion`. New test in rows.client.spec.tsx.

- Added a "Finished" icon after /save-state: the session-status domain already renders the `finished` status (green check) via `declaredStatusOf` plus the `session/status` event; the missing trigger was that /save-state never declared it. Appended a "Declare the session finished" delta to `C:\Claude\skills\dsh_command_bridge.json` (deltas.save-state) and regenerated `~/.dsh/skills/save-state.md` so save-state calls `set_session_status(status: "finished")`, fallback `/status finished`.

- Verified: ui-workspace suite 173/173 (10 files); client typecheck exit 0; full `pnpm build` exit 0; the scoped pulse rule and keyframe are present in the built `ui-workspace/lib/client.js`.

- Found a gap in the finished-icon trigger: `set_session_status` (tool-session-status) is not in the agent tool catalog this session (not composed in the standard preset agent plane), so the save-state "declare finished" step cannot run from the agent; the operator fallback is a manual `/status finished`.

- No deploy (local desktop app, not a Railway repo). Changes are uncommitted in the checkout.

## 2026-09-08 - Workspace group headers: darker blue + alphabetical sort

- Recolored the workspace group section headers from gray (`--dsw-alias-label-tertiary`) to the DeepSeek brand darker blue (`--dsw-static-deepseek-600`, with `--dsw-static-deepseek-400` for dark theme) in `packages/client/ui-workspace/src/client/rows/WorkspaceBrowser.module.css`.

- Made named group sections sort alphabetically in `packages/client/ui-workspace/src/client/tree.ts` (`sectionize` sorts the group labels with `localeCompare`), so a newly added group slots into A-to-Z order automatically.

- Added a test in `packages/client/ui-workspace/tests/tree.client.spec.ts`; the ui-workspace tree suite passes 40/40.

- Committed `f562c0a27f` (feat: sort) and `1116f9b306` (style: color) on `feat/open-session-in-subfolder`; pushed both to the `neotech` fork (NeoTech-Networks/deepseek-harness).

## 2026-09-08 - Composer shortcuts and right sidebar hidden by default

- Added Alt+S (fills the composer with /save-state and submits) and Alt+P (fills with the deploy phrase and submits) as a renderer-level window keydown listener in `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx`, plus 4 tests in input-bar.client.spec.tsx.

- Made the right sidebar hidden by default for new sessions: flipped the `pinned-files` settings schema `autoOpen` default from true to false in `packages/api/pinned-files/src/index.ts` (the pinned-directory explorer was auto-opening and expanding the column on every new session).

- Diagnosed why the changes were not live in the installed app: it serves client/host bundles from the extracted profile `~/.dsh/profiles/desktop/node_modules/...`, which predated the change. Patched the stale bundles in place and set `autoOpen: false` explicitly in `~/.dsh/settings.yaml`.

- Committed the 5 files as `88a2289cc3` and pushed to the `neotech` fork (NeoTech-Networks/deepseek-harness), branch `feat/open-session-in-subfolder`.

- Verified: host + client typecheck exit 0; 79/79 input-bar tests; full `pnpm build` exit 0 (236 client artifacts). Live desktop smoke test of both changes is still user-gated (user last reported the sidebar still auto-opening).

## 2026-09-08 - Vision-routing auto image description, plus four pre-existing gate fixes

- New `@deepseek-ai/dsh-vision-routing` package (`packages/vision/vision-routing/`): a text-only model session (DeepSeek Pro or Flash) with an attached image now admits the image and appends the vision model's description as a text block instead of rejecting with "Model does not support image input". Gated by the existing `subagent-model-selection` setting; a failed describe call appends a "description unavailable" note. Admission changed in `packages/api/session-controller/src/commands.ts`; plugin wired into the `web-app` bundle.

- Fixed the four pre-existing gate failures so doc-sync/CI is green: verify-cordis-config (git symlink pointers resolve under `core.symlinks=false` via `scripts/cordis-config-files.ts`), verify-package-invariants (session-status README companion sentences), verify-export-jsdoc (`baseNameOf` in ui-sidebar-explorer), and gen-cordis-catalog (pinned-files types in LINK_MAP, vision SERVICE_PAGE, sidebar-right cordis-surface markers). Translation-pairing fallout re-recorded for the vision group, session-status, and pinned-files.

- Live desktop smoke test of the auto-vision path is still pending (user-gated GUI).

## 2026-09-08 - Windows installer built, installed, session creation fixed

- Built an unsigned Windows installer (182 MB) via an opt-in `DSH_DESKTOP_ALLOW_UNSIGNED=1` flag (commit fdb44376aa), plus two build fixes: build under PowerShell (GNU tar in Git Bash chokes on `C:` paths) and skip the POSIX-only `fs-ext` native compile on win32 (`project-manager.ts` platform-conditional + `lease.ts` lazy-load).

- Installed to `%LOCALAPPDATA%\Programs\DeepSeek Harness\` (Start Menu entry + desktop shortcut). First launch extracted the seed into `~/.dsh`; profile `desktop` at version 0.1.3-alpha.2; app renders the product UI and reads the real `~/.dsh`.

- Fixed the "New Session does nothing" bug: the default `standard-hooks` user preset (`~/.dsh/.agent-presets/standard-hooks/agent.cordis.yml`) hardcoded a `cordis:include` path to the SOURCE repo, so every plugin import failed "Cannot find package". Repointed it at the installed profile's `standard` preset; New Session works (user confirmed).

- Commits: 1340b92f40 (feature work) + fdb44376aa (unsigned + fs-ext) on `feat/open-session-in-subfolder`, 2 ahead of `neotech`, push held.

## 2026-09-08 - Dependency gate fix and full renderer rebuild

- Fixed the two `verify-package-dependencies` violations left by the uncommitted session-status work: added `@deepseek-ai/dsh-session-status` (workspace:^) to `packages/client/connection/package.json` devDependencies and `@deepseek-ai/dsh-goal` (workspace:^) to `packages/client/ui-workspace/package.json` devDependencies, and refreshed `pnpm-lock.yaml`. The gate now exits 0 (61 packages match policy).

- Ran the full `pnpm build` (exit 0), regenerating the stale web renderer `apps/web/dist` and `.dsh-build/client-build-environment.json` (sha256 a93c618c..., commit 9a30a55, dirty=true). This fixes the desktop launch crash ("missed the module table"): `dockkit` is now in the seed table.

- Smoke-tested the desktop app via `start:desktop`: the renderer reached the startup prompt with no "missed the module table" error, so the launch crash is fixed. But session creation now fails with a SEPARATE error: the default preset "standard-hooks" fails to mount ("Cannot find package") for roughly twenty built-in host plugins (persona, agent-instructions, tool-fs, tool-goal, plan-mode, compaction, subagent tools, workflow-worker-thread, and others) listed in the standard preset's agent.cordis.yml but not declared as dependencies of @deepseek-ai/dsh-agent-presets.

- Uncommitted (no push; origin is upstream deepseek-ai with no write access). Nothing deployed.

## 2026-09-08 - Quit confirmation on the desktop shell

- Added a native close confirmation to the Electron main window in `apps/desktop/src/main.ts`: the window `close` event is intercepted, a "Quit DeepSeek Harness?" dialog is shown (Quit / Cancel, Cancel default), and the app only quits on confirm. Menu Quit and the updater restart path are not double-prompted; the Desktop Plugins window is unaffected.

- Added en + zh message strings in `apps/desktop/src/locale.ts`.

- Rebuilt the desktop shell (`pnpm --filter @deepseek-ai/dsh-desktop run build`, exit 0) and verified the compiled `apps/desktop/lib/main.js` contains the handler and strings.

- Not smoke-tested live: the change activates on next launch (a relaunch would end the running session).

## 2026-09-08 - Open a session directly in a sub-directory from the Files tab

- Added two gestures to the right-sidebar Files tree: right-click a folder for "New session here" (adopts the folder as its own workspace and opens or reuses its session, filed under the parent's group label), and "New session in each sub-folder..." (registers every immediate sub-directory under one group, opening a session only in the first).

- New `UiWorkspaceService.openDirectory(path, group)` capability reuses create-by-path + setGroup + connectWorkspace, so a repeated gesture reuses the blank session instead of stacking.

- ui-sidebar-files wired to `ctx.workspaces` / `ctx.sessions` / `ctx.uiWorkspace`; en + zh copy; package.json + tsconfig updated.

- Committed `9a30a554e8` on branch `feat/open-session-in-subfolder`; pushed that branch and local `master` (`67ceb5406a`) to a new org fork `NeoTech-Networks/deepseek-harness` (`neotech` remote).

## 2026-09-08 - Plan mode defaults on for every new session (model-agnostic)

- Added `defaultActive?: boolean` to `@deepseek-ai/dsh-plan-mode` (`packages/plan/plan-mode/src/index.ts`): `resolveConfig` validates and defaults it, and a new `pinInitialPlanMode` appends `plan/mode { active: true }` at session creation (a `session/created` listener plus a one-time sweep of existing sessions), skipping subagents (`header.origin === 'subagent'`) and any session that already carries a `plan/mode` event, so forks and resumes keep their state.
- Set `defaultActive: true` on all four plan-mode mounts: the standard/ptc/cordis agent presets and the base bundle (CLI/headless). The web-app bundle only disables the base mount, so it needed no change.
- Plan mode is model-agnostic: the `plan:policy` section is injected into every model request's system prompt regardless of provider/model, so the default covers Claude, Kimi, DeepSeek and GLM.
- Verified: 93/93 plan-mode tests (4 files); `tsc -b packages/plan/plan-mode/tsconfig.json` clean; `pnpm build:lib:host` exit 0.
- Made it live without a full repackage: synced the rebuilt `@deepseek-ai/dsh-plan-mode/lib/` and the three preset YAMLs into `~/.dsh/profiles/desktop/node_modules/`; user restarted and confirmed "Appears to work".
- Docs updated: README.md/.zh.md + README.i18n.yaml, docs/config-catalog.md/.zh.md. Committed on `feat/open-session-in-subfolder` (bundled into the bulk `feat(vision)` commit, whose message does not name plan mode) and pushed to the `NeoTech-Networks` fork.

## 2026-09-08 - Repointed origin to the NeoTech fork, state auto-commit fixed

`origin` was the upstream deepseek-ai repo, so every state push failed 403.
Repointed to NeoTech-Networks/deepseek-harness (upstream kept as `upstream`),
set `gh repo set-default`, and tracked the untracked state files. State now
lands on the fork (PRs #2 and #3 merged).

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=321e7af0-b0ab-4a0b-9a4c-de8eea784e39 at=2026-09-09T03:50:14.915068+00:00
-->
## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

## 2026-09-07 - Session status icons in the sidebar

- Added a durable, model-independent declared session status. New `packages/session-status/` group: domain (`session/status` event, `sessionStatus` projection, validated vocabulary, `ctx.sessionStatus`), `tool-session-status` (`set_session_status`), `command-session-status` (`/status`).

- Session Controller: `setStatus` + `listStatuses` remotes with client bindings and fixtures.

- Sidebar (`ui-workspace`): `declared` row phase (precedence awaiting-* > declared > planning > running > subagents > done > idle), goal-phase fallback (blocked→stuck, complete→finished, paused→paused), distinct subagent glyph, status glyph + tone, row-menu "Set status…" / "Clear status".

- Bundle composition: base + web-app patches, packages in base/package.json; confirmed via `dsh --profile headless --dump-default-config`.

- Docs: package/group READMEs, `docs/subsystems/session-status.md`, agent note triple, generator manifests.

- Verified: typecheck clean; lint clean on new packages; 209 targeted tests; 100% coverage on session-status; doc-sync 32/33 (one failure is a pre-existing Windows symlink EPERM).

- Open: uncommitted on the repo (no upstream push access to deepseek-ai); live desktop smoke test pending (user-gated).

## 2026-09-07 - Workspace grouping implemented and committed

- Implemented workspace grouping end-to-end: `group` field on the workspace domain record, `setGroup` in the API controller + typert wire codec, two-level group/workspace/sessions tree in the sidebar, and a "Set group…" dialog on the workspace row menu.

- Verified: host + client tsc typecheck clean; typert host + client bundles built; 257 tests pass (2 failures are pre-existing symlink EPERM under the Windows sandbox, not this change).

- Committed: `67ceb5406a` on local `master`, rebased cleanly onto `c389f96bf3`.

- Open: `git push` denied (neotechnet has no access to the deepseek-ai org; no fork exists). Either fork to a chosen account and push, or keep the change local. Visual smoke test of the grouped sidebar still pending.

<!-- claude-memory-actor:end -->

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=a463cfd2-49e3-4da7-b34c-e0db2cd09616 at=2026-09-09T23:35:44.128791+00:00
-->
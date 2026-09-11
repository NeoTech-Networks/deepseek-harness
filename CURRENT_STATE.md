<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=e9882722-4aa9-476d-a750-3fff8a9e8b51 at=2026-09-09T00:08:42.118722+00:00
-->
## 2026-09-11 - The operator's composer shortcuts "stopped working": the chord moved off Alt, and a global AutoHotkey layer was found

**The shortcut was never broken.** Steve pressed Ctrl+Shift+S at 11:14 ET and a
`/save-state` user message landed at `2026-09-11T15:14:25.963Z` in session
`e0b8a4a0-b590-4d02-8eea-cb813f5d13cb`, read back by decoding
`~\.dsh\sessions\**\session.v3.jsonl.zstd` (the logs are concatenated zstd
frames; `zstdDecompressSync` stops at the first frame, so every frame offset has
to be walked). One press, one submission.

**What actually happened:** 0.1.5-rc.2 (installed 09:47 today) binds
Ctrl+Shift+S / Ctrl+Shift+P on keydown, and the Alt pair was confirmed working
on 2026-09-09. Nothing told the operator, and an Alt+letter press reaches the
renderer as a KEYUP only on Windows, so his presses produced no event, no toast
and no trace. `dsh-client-ui-conversation/lib/client.js` holds the only
`KeyS`/`KeyP` handler in the whole running profile.

**A second layer nobody had recorded: a global AutoHotkey script is running.**
`C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe` (PID 30304, launched from
Startup) runs `C:\Claude\bin\global-hotkeys.ahk`, which maps `!s` and `!p` with
NO window condition to `SendInput` of the two command strings plus Enter. It
fires in every app. Measured with the probe app driven directly (menu bar
present, real Alt chord): its payload DOES reach an Electron renderer as plain
keydowns plus Enter, for both letters. Why it does not work for the operator in
the Harness is NOT established; his live sessions were deliberately not typed
into.

**Shipped** (branch `update/v0.1.5-rc.2`, `016d1048c2`, pushed): the chord
listener now registers even while no Session is current and answers that state
with the existing toast, the chord resolves from `event.key` when the scan code
is missing, the retired Alt keyup is answered with a toast naming the new keys
(never submits), and the chord is named on the send control's tooltip. Packaged
as `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,745,776 bytes (previous build
of the same version 194,762,388). **Install NOT taken**: the operator asked why
an installer was needed, was told the shortcut already works, and the guards
ride the next upstream update otherwise.

**State-file divergence, again:** this worktree's copies are the 2026-09-09 set
(283 lines) while the primary checkout holds the 2026-09-11 set (878 lines), and
a state PR for the primary merged at 15:42Z today (#19). The state commit for
this session was made on this branch instead of dispatched through the worker,
because applying this tree's stale files onto a master that just received the
newer set can conflict or revert. See OPEN_ISSUES 21-24.

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




## 2026-09-14 - a keep-alive stall no longer costs fifteen minutes and a dead turn

- SYMPTOM: "This turn failed SSE stream ended without [DONE]". A decode of all 535 saved session logs found 14 `STREAM_CLOSED` turn deaths, every one dated 2026-09-14, every one on `deepseek-official / deepseek-flash`, across 5 sessions, and ZERO on any earlier day. Each burned about fifteen minutes and recorded exactly one chunk: the finish error. No content ever arrived.
- ROOT CAUSE, provider side: `deepseek-flash` is not starting inference at all. An 8-token "hi" with no tools returns HTTP 200 and then 98 bytes in 90 seconds, all of them `: keep-alive`, zero data payloads. `deepseek-v4-pro` on the same key answers in about a second. Confirmed four times between 16:20 and 16:50. DeepSeek trace id `47725ea260636ad4556acd718262e2b1`.
- ROOT CAUSE, our side (two defects, both fixed): `adapter.ts` passed the idle watchdog's `pulse()` to `parseSse` as its COMMENT callback, so every keep-alive rearmed the 300s stall timer and the watchdog could never fire; and `STREAM_CLOSED` is the one transport-class code `retry-policy.ts` excludes by default, so the turn died rather than retrying (the same scan shows 603 TRANSPORT and 373 TIMEOUT failures absorbed silently that week).
- The DeepSeek playbook already documented the provider behaviour (`AGENT.md` hard rule 6: keep-alive comments while inference has not started, connection closed at ten minutes, "your parser must tolerate both"). The harness was not tolerating it.
- FIX, branch `fix/deepseek-stream-stall` (`4929fed9fe`, `3fdc254989`), pushed to the fork: new `streamFirstPayloadTimeoutMs` (default 120000, `0` disables) bounds send-to-first-payload only; a comment no longer rearms the idle watchdog BEFORE the first payload and counts exactly as before after it; expiry is `TIMEOUT`, already retryable. The bundle patch now gives the DeepSeek route its own `retryPolicy`: `maxRetries: 3` and the full six-code list including `STREAM_CLOSED` (the list REPLACES the defaults, so it is spelled out).
- Mock server gained a `keepalive_stall` behavior so the shape is reproducible offline.
- WHY IT SURFACED NOW: the 2026-09-13 install carries `1e89100c7f`, which disabled `llm-route-fallback`. That plugin had been diverting every flash request over 3000 tool-parameter bytes to `deepseek-v4-pro`, and the real catalog is 69029 bytes, so it diverted all of them. Disabling it put traffic back on flash on the day DeepSeek's flash route went bad. The harness change did not cause the fault; it removed an accidental shield.
- Installed and verified the same day. Evidence: `C:\Projects\exports\2026-09-14-dsh-sse-stall\`.
- CORRECTION, SAME DAY, 17:35: the line above saying `deepseek-flash` "is not starting inference at all" was WRONG. The route is INTERMITTENTLY stalling, not down, and every probe in the 16:20-17:16 window happened to land on a stall. Steve pushed back that it had been working; he was right. Measured after: 20 single-shot probes across 5 request variants mostly answered in 0.5-1.2s, six full-sized streaming requests (112 tools, 156 KB) all completed with first payload 797-1336 ms and zero keep-alive comments, a context sweep to 250k tokens gave 1526-2330 ms, and 8 real agent turns completed 8 of 8 in 863-1244 ms with no retry needed. The fix is unaffected and is worth MORE against a flaky route than a dead one, because retrying actually recovers. What changed is the tuning: `streamFirstPayloadTimeoutMs` went from a cautious 120000 to a measured 25000 (about ten times the slowest honest first token of 2.33s), in `~\.dsh\settings.yaml` for immediate hot-reload and in the source default for a clean install. `retryPolicy` is now in the settings file as well as the bundle patch so the section cannot shadow it. METHOD NOTE worth keeping: "the provider is down" needs a RATE, not a repetition.
- MERGED the same day: `fix/deepseek-stream-stall` fast-forwarded into `update/v0.1.5-rc.2` (`471e72742e` to `3fdc254989`) and pushed, with the pre-push typecheck green in 53s. Both refs read back equal from the remote, and the release line's `adapter.ts` and `cordis.patch.yml` carry the fix. The five modified state files sitting in the rc.2 worktree were left untouched by the fast-forward, deliberately: they are stale copies of the item-16 kind.

## 2026-09-13 - four app fixes built: question scroll, All Sessions recovery, param-led pwsh, PR #21 landed

- Merged PR #21 (`feat/ui-session-footer`) into `update/v0.1.5-rc.2` as `5512545eac`. The last install had been packaged from that line WITHOUT it, which is exactly why `workspace-unarchived-count` and `session-footer` read MISSING at 13/15.
- Four fixes built on top as `e39f7bf01e`, pushed to `update/v0.1.5-rc.2`:
  - the whole question card (title, detail, options) now rides ONE scrollport, with the action row and the footer pinned, so a long question can no longer push its choices out of view;
  - `ask_user_question` gained the optional `detail` markdown field and the at-most-two-sentences-per-paragraph rule;
  - a section-scoped error boundary in `AllSessionsSection` shows the crash reason plus one retry, instead of the shared slot boundary's silent empty div that needed an app restart;
  - `pwsh-local` wraps a `param(...)`-led command in a script block, so the UTF-8 encoding preamble can no longer turn `param` into an unknown command.
- The recurring PowerShell failure is NAMED: 107 of 2,195 failing pwsh calls since 2026-08-01 are the same `ParserError: Variable reference is not valid. '$' was not followed by a valid variable name character`, caused by a regex such as `^\$script:` inside a DOUBLE-quoted `-Pattern`. The `pwsh` tool description now teaches single-quoted patterns.
- Installer built: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,784,998 bytes, 2026-09-13 11:08. NOT INSTALLED: the operator runs `finish-install.ps1`, which force-closes the app hosting the session that built it.
- Feature markers added to `C:\Claude\bin\dsh_local_features.json`: `question-card-scroll` (`headingInBody`), `all-sessions-recovery` (`data-all-sessions-error`), `pwsh-param-led` (`commandText`).
- Evidence and the two read-only scan scripts live in `C:\Projects\logs\2026-09-13\dsh-ui-fixes\` (`EVIDENCE.md`, `scan-pwsh-errors.mjs`, `dump-parser-errors.mjs`, `pwsh-error-scan.txt`, `parser-error-dump.txt`).
- SETTINGS RETENTION, found broken and fixed the same day: the config vault (`C:\Projects\repos\dsh-config`) was AHEAD 4 / BEHIND 1 against its origin, so nothing had published since 2026-09-11 while every scheduled snapshot printed a failure nobody reads. Reconciled and published (`origin/main` `70b2552`), and `push_vault` in `C:\Claude\bin\dsh_config_vault.py` now fetches and replays the local snapshots on top of `origin/<branch>` so a diverged remote heals itself.
- `finish-install.ps1` now GUARANTEES retention instead of reporting drift: the pre-install snapshot is a hard gate (no fresh copy, no install), a verify+restore runs while the app is closed before the first launch, and after first-run setup a drift is repaired by closing the app, restoring every protected file, relaunching and re-verifying. Commit `471e72742e` on `update/v0.1.5-rc.2`. Isolated end-to-end proof (temp home, temp vault, bare remote) in `C:\Projects\logs\2026-09-13\dsh-settings-retention\`.
- NOTE: `471e72742e` changes the helper script only, NOT the installer, so the packaged `deepseek-harness-0.1.5-rc.2-win-x64.exe` (194,784,998 bytes) is still current; the operator re-runs the same `finish-install.ps1` command and gets the retention guarantee.

## 2026-09-12 - llm-route-fallback disabled: sessions were silently running on pro

- The `llm-route-fallback` plugin merged earlier today was moving EVERY request from `deepseek-flash` to `deepseek-v4-pro`: its `limitBytes` (3000) sits below the real tool-catalog size, so the "tools assembled" gate never kept a request. Every new session started on flash and flipped to pro on its first request.
- Fixed by setting `enabled: false` in `packages/bundle/base/cordis.patch.yml` on `feat/llm-route-fallback` (commit `9f8261490a`), then rebuilding and reinstalling.
- Verified live: the running profile's `dsh-base/cordis.patch.yml` reads `enabled: false`, and this session's request headers show four pre-fix requests on `deepseek-v4-pro` followed by the first post-install request on `deepseek-flash` (23:20:53Z, 18s after `applyRelease finished`).
- Installer: `deepseek-harness-0.1.5-rc.2-win-x64.exe`, 194,826,890 bytes.
- Landed on the release line the same day: replayed as `1e89100c7f` on top of the PR #20 squash-merge (`ba3644927a`) and pushed to `update/v0.1.5-rc.2`.

## 2026-09-12 - session footer, workspace indent/count, route fallback shipped

- Installed 0.1.5-rc.2 with all 15 local features verified (`dsh_local_features_check.py`).
- Merged PR #20 (llm-route-fallback) into `update/v0.1.5-rc.2`.
- New UI on `feat/ui-session-footer` (PR #21): sessions indented under workspace folders; workspaces coloured + counted when they have unarchived sessions; a session footer under the message box (summary plus the associated dashboard URL, shown only when the workspace maps to a dashboard in `~/.dsh/dashboard-links.json`, 67 entries, regenerated by `dsh_dashboard_links.py`).
- Commits `ed2298f345` and `86ed07586b`; installer 194,791,959 bytes built 20:56.
- Feature markers added: `workspace-unarchived-count`, `session-footer`.



## 2026-09-10 - Composer shortcut moved off Alt to Ctrl+Shift; installer built, install pending

The Alt+P / Alt+S composer shortcuts were replaced with Ctrl+Shift+P /
Ctrl+Shift+S. The 2026-09-09 keyup fix made the shortcut fire, but the Alt
KEYDOWN still woke the native Windows menu bar, whose first item is "Desktop
Plugins…", so Alt+P popped that window open. Ctrl+Shift is delivered to the
renderer on keydown, so the menu bar is left alone.

- Commit `8ce3ffe9ac` on branch `fix/composer-shortcut-modifier` (based on
  update/v0.1.5-rc.1), pushed to origin.
- InputBar.tsx chord + 5 tests in input-bar.client.spec.tsx; also updated
  C:\Claude\bin\dsh_local_features.json (3 shortcut entries).
- Proven: 93/93 input-bar tests, build exit 0, package exit 0 (after seeding
  the cached Node 24.17.0 runtime from another worktree because nodejs.org
  timed out). Fix confirmed in the packaged seed (keydown + Ctrl+Shift, no
  Alt keyup).
- Installer: apps/desktop/.desktop-build/targets/win-x64/artifacts/
  deepseek-harness-0.1.5-rc.1-win-x64.exe (185.7 MB).
- NOT installed yet (operator runs finish-install.ps1). Two new findings for
  the playbook: (1) packaging needs the Node runtime and nodejs.org can time
  out, seed the download cache; (2) the installer was built with
  DSH_DESKTOP_APP_ID=com.neotechnetworks.deepseek-harness (per the skill), but
  the live 0.1.5-rc.1 install uses com.deepseek.harness (uninstall key
  7808434f-...); that mismatch will register a second uninstall entry.

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
  Last write: actor=claude-code:steve session=ebc921e6-3f5e-46d3-af0d-32619934dd7c at=2026-09-13T22:53:20.166027+00:00
-->
## Last save-state (2026-09-13T22:53:20.166027+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `ebc921e6-3f5e-46d3-af0d-32619934dd7c`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-e656220d-fdaa-4c9c-9983-ade21cd572c5

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

<!-- claude-memory-actor:begin
  Auto-managed by the claude-memory save-state hook.
  Anything between :begin and :end is overwritten on every save-state.
  Edits outside this block are preserved.
  Last write: actor=claude-code:steve session=632cd4ea-2b2c-4ff4-a4a1-757d88fb75dc at=2026-09-11T15:40:40.315533+00:00
-->
## Last save-state (2026-09-11T15:40:40.315533+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `632cd4ea-2b2c-4ff4-a4a1-757d88fb75dc`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-f9bd88ea-2024-41da-beec-95d06c47ccaf

<!-- claude-memory-actor:end -->

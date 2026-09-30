# DSH 0.1.5-rc.2 fork -> 0.1.7-rc.1 feature map (Phase 1)

Built 2026-09-24 from four read-only traces, which hold the line-level detail:
`map-sidebar.md`, `map-conversation.md`, `map-llm.md`, `map-desktop-settings.md` (same folder).
OLD = `C:/Projects/worktrees/dsh-update-v0.1.5-rc.2` (HEAD 203ac5a2d7, 54 commits over dsh-v0.1.5-rc.2).
NEW = `C:/Projects/worktrees/dsh-update-0.1.7-rc.1`, branch `update/v0.1.7-rc.1` from dsh-v0.1.7-rc.1 (46a7f68b09).

Classes: **carry** (target still exists, replay/3-way merge), **overlap** (upstream has an equivalent,
upstream is the base, fork extras added on top), **rehome** (target deleted or rewritten, re-implement
on the 0.1.7 equivalent), **superseded** (upstream now does it, nothing to add), **tooling**
(install/state files, rebuilt in Phase 5 or not carried).

## Phase 2 baseline (clean tag)

- `pnpm install` needs `CI=true` on this machine: `install-lefthook.mjs` refuses the operator's global
  `core.hooksPath`, and `CI=true` is its own skip switch (never use the hooksPath override, ledger 35/38).
- `pnpm run build`: exit 0 (`baseline-build.log`).
- plan-mode: 87/87. fs-local: 147 pass, 13 fail, 4 skipped; all 13 are symlink tests (ledger 17, environmental).

## A. Features (the 29 rows of dsh_local_features.json, plus two found untracked)

| Feature id | Class | 0.1.7 target | What to do on top of upstream |
|---|---|---|---|
| composer-shortcuts | carry | client/ui-conversation `InputBar.tsx`, `locales.ts` | 3-way merge; 2 trivial locale conflicts (upstream dropped `input.accessMode`) |
| composer-shortcuts-refuse-aloud | carry | same | same merge |
| promote-phrase-exact | carry | same | same merge |
| composer-shortcut-single-flight | carry | same | same merge |
| session-footer | rehome (UI) + carry (host) | footer UI into `skeleton/ConversationContent.tsx` after `{inputBar}`, gated to the `main` variant; CSS carries | ConversationRoot is now a 13-line wrapper |
| session-footer-design-project | rehome | same | same |
| session-footer-intent | carry | api/session-controller `workspace-links*.ts` | new files carry; coordinate `types.ts`/`index.ts` hunks with session-status |
| session-footer-live-intent | carry | api/session-controller projection | same |
| session-footer-live-read | rehome | ui-conversation footer | same |
| question-card-scroll | carry | client/ui-user-questions, tool-ask-user | one conflict from icon rename (`*Outline14/16` -> `*OutlineRegular`); regen tool catalog |
| pwsh-param-led | carry | shell/pwsh-local `argv()` | clean 3-way merge; upstream still has the bug |
| no-console-flash | overlap | upstream f8b1309fe5 covers subprocess-local/win32-process | add `windowsHide: true` at `apps/desktop/src/host-process.ts` ~l.174 and `packages/sdk/client/src/client.ts` ~l.217. Keep marker `windowsHide: true` in subprocess-local (already upstream) |
| plan-lead-in-tolerated | carry | plan/plan-mode | bf1a215fec applies clean; 203ac5a2d7 3-way clean; add upstream's oxlint-disable for `snapshotEvents()` |
| edit-self-observe | carry | fs/fs-observation-policy | **not in the 54**: commit c3ee39fb88 on branch `fix/edit-self-observe` only. Apply explicitly |
| vision-routing | rehome | new package vision/vision-routing | fork-only package. flash is now image-capable upstream; Pro is still text-only and admission (`commands.ts:347`) still rejects. Re-add package, own message-source kind, hook inside upstream `if (hasImage)`, bundle + tsconfig wiring |
| account-usage | carry | new package llm/account-usage | no upstream equivalent; composer dock slot, `readRecord`, credential unchanged. Hand-edit `api/remotes/src/client/index.ts` + package.json |
| llm-route-fallback | carry (stays disabled) | new package llm/llm-route-fallback | `agent/request` hook unchanged; `agent.ts`/`runtime-types.ts` hunks apply; bundle row re-added with `disabled: true` (OPEN_ISSUES 29) |
| pinned-files-closed-by-default | rehome | new package api/pinned-files, entry id `pinned-files`, `roots`/`autoOpen` `.volatile()` | 0.1.7 file tree never auto-opens already; the fork's pinned roots outside the workspace need the package back on the new settings API |
| sidebar-all-sessions | overlap + carry | ui-sidebar slots/SidebarRoot + ui-workspace `AllSessions.tsx` | carry; also fix the conditional-hook crash (useMemo after early return at l.128) |
| all-sessions-recovery | carry | ui-workspace `AllSessions.tsx` | same |
| workspace-grouping | carry (host) + overlap (UI) | `packages/workspace/workspace/src/spec.ts` gains `group`; workspace-controller; ui-workspace tree/WorkspaceBrowser/Rows | **live data**: 32 workspace records carry `group`; schema must accept it BEFORE first 0.1.7 launch or the next write strips it |
| workspace-unarchived-count | overlap | ui-workspace `Rows.tsx` ProjectRowItem | upstream computes `sessionCount` but never renders; render it counting unarchived only; indent via CSS |
| archive-session-shortcut | rehome | ui-workspace `client/index.ts` `apply()` | route Ctrl+Shift+A through upstream's archive path (gets undo toast + busy-session confirm); keep latch + refuse-aloud |
| workspace-group-fold | carry | ui-workspace stores + WorkspaceBrowser | persisted fold per group |
| group header 13px (1a77e844ad) | carry | ui-workspace css | 13px/18px labels |
| workspace-folder-sort | carry | WorkspaceBrowser root groups | A-Z inside every named group; drag-reorder stays for anything not in a named group (decision taken: fork behaviour wins inside groups, upstream drag survives elsewhere) |
| session-stage-marks | overlap (rewrite) | ui-workspace `tree.ts` sessionNode, `Rows.tsx`, css, ui-primitives icons | redraw the 8 marks on upstream `useSessionStatus` + the carried `sessionStatus` projection; icons re-added under the new `*Regular` naming |
| session-status | carry | packages/session-status/{session-status,command-session-status,tool-session-status} | fork-only packages; row menu via `sidebar.workspaces.session.menu.item` slot |
| session-status-failed | carry | same | same |
| sessions-panel | rehome (thin) | client/ui-sessions-panel | fork-only; duplicated by All Sessions + upstream flat mode. Carry as a package if it builds against 0.1.7, otherwise record as superseded by All Sessions (the feature row stays checkable either way) |
| right-panel width per session (55c15a6af4) | carry | ui-layout stores/service/AppFrame, ui-sidebar-right | key off the session that reports `openRightbar` (`SessionListState.current` gone) |
| ui-sidebar-explorer | carry | client/ui-sidebar-explorer | needs api/pinned-files |
| first-payload stream bound (4929fed9fe, 708e2daa30) | rehome | llm/llm-deepseek `defaults.ts`, `config.ts` (`.volatile()`), `types.ts`, `adapter.ts request()` | llm-deepseek now speaks Anthropic Messages; time the first CONTENT event, not `message_start`/ping. Mock server `keepalive_stall` applies |
| truncated-stream retry budget (3fdc254989) | carry | bundle base `cordis.patch.yml` | applies cleanly |
| open-links-in-default-browser (094e4dd642) | superseded | 0.1.7 `main.ts` | upstream mostly does this; verify only |

## B. Data migrations that must land before the first 0.1.7 launch

| Item | Risk | Fix |
|---|---|---|
| 407/866 session logs contain `session/status` events | v3->v4 migrator throws on unknown non-ignorable types: those sessions would not open | add the type to `RELEASED_V3_EVENT_TYPES` in `session-format-v3-to-v4/src/extension-identities.ts` (session-status is carried) |
| 32 workspace records carry `group` | stripped on next write | `group` in `workspace/spec.ts` |
| `profiles/desktop` holds the 0.1.5 runtime manifest | `initProfile` keeps it, bundles list empty, likely dead app | install script renames it aside once (`profiles/desktop.0.1.5-runtime`) |
| hook bridge `dsh_transcript.py` | sessions now `session.v4.jsonl.zstd`; Stop gates go blind | add v4 first in `SOURCE_NAMES` |

## C. Setting surfaces

| Surface | 0.1.7 reads it? | Action |
|---|---|---|
| `settings.yaml` | imported ONCE, renamed `.imported`, merged into `profiles/desktop/cordis.patch.yml` per section; a bad key drops the whole section | pre-stage: rename `subagent-model-selection` -> `subagent-model-selection-settings`; drop `agent-presets`; keep `llm-deepseek` only once `streamFirstPayloadTimeoutMs` is `.volatile()` in the port; `pinned-files` imports once the package is back with volatile fields |
| `agent-presets.default: standard-hooks` + `.agent-presets/standard-hooks` | **no** (dir not scanned) | move hook-bridge row + all MCP rows to ROOT rows in `$DSH_HOME/cordis.patch.yml` (map-desktop-settings A5); shipped `standard` stays default and tracks upstream |
| `$DSH_HOME/cordis.patch.yml` | **yes, now read by desktop** (was CLI-only) | gate `mcp-github`/`mcp-postgres` off for profile `desktop` |
| MCP row format | unchanged (stdio / streamable-http, serverName, headers, env, scrub) | credentials still explicit `!!js process.env.X` |
| hooks-claude-code config | unchanged (`configPath`, `defaultTimeoutMs`) | SessionStart now awaited; exit-2 stdout workaround still needed |
| `AGENTS.md` hardlink | yes, 65536 budget unchanged | headroom now ~2.8 KB |
| `~/.agents/skills` junction | yes | none |
| `DSH_HOME` | yes | none |
| slash commands via bridge UserPromptSubmit | yes (`agent/pre-step`) | none |
| model picker (Opus 5.5 in `llm-pi-ai.providers`) | yes (volatile) | pi-ai still 0.85.1, block still needed; imports cleanly |
| config vault manifest | protects `settings.yaml`, `.agent-presets/**`, denies `profiles/**` | protect `profiles/desktop/cordis.patch.yml` + home `cordis.patch.yml`; retire the other two; version read from asar `desktop-runtime.json` |

## D. Desktop / packaging / install

| Item | 0.1.7 | Action |
|---|---|---|
| packaging env | only from `apps/desktop/.env.windows`; shell exports stripped; `DSH_DESKTOP_ALLOW_UNSIGNED` gone (`--unsigned`) | `.env.windows` with `DSH_DESKTOP_APP_ID=com.deepseek.harness` + policy origin; run `package:win:x64:unsigned` |
| uninstall GUID | uuid5(appId) unchanged | 7808434f-469e-5eba-848e-edf64d3b94ce holds with that app id |
| mandatory update | unsigned build has no feed (cannot download); policy origin still embedded and required | fork-patch `resolveDesktopPolicyEnvironment` to return undefined (tolerated by beforePack, skipped at main.ts:1067) |
| artifact | `targets/win-x64/unsigned-artifacts/deepseek-harness-0.1.7-rc.1-win-x64-unsigned.exe` | finish-install derives this |
| runtime on disk | inside `resources/app.asar/dsh/node_modules` | feature check reads the asar |
| finish-install guards | provision log / seed / staging / pending gone | rewrite per map-desktop-settings E |

## E. The 54 old commits, classified

Feature commits map to rows above; state/tooling commits are not replayed as code.

| Old commit | Subject (short) | Class |
|---|---|---|
| 27f44416eb | local features: grouping, status, vision, packaging, usage, sessions-panel | split: carry/rehome per rows above; packaging part superseded by `--unsigned` |
| 5c9ad57055 | tsconfig path aliases + web e2e exclude | carry (regenerate with gen-tsconfig-paths) |
| 1cbd797ef0 | bump local packages 0.1.5-alpha.1 | superseded (bump to 0.1.7-rc.1) |
| aed2254ac9 | finish-install -> alpha.1 | tooling (Phase 5) |
| 20727f452a | extract Node zip with system tar | check on 0.1.7 prepare-runtime; carry only if still extract-zip |
| 4ed94030df | clear old seed + integrity | tooling, superseded (no seed) |
| bf1a215fec | fs contended writes + valid plans | carry |
| 0f46a24291 | forced close reports as crash | tooling (Phase 5) |
| 5568d481b6 | stalled first-run setup reports itself | superseded (no provisioning on 0.1.7) |
| e8d61f637c | package install child vanishes | superseded (project-manager pnpm spawn gone) |
| 7fab040065 | no console flash | overlap (two one-liners) |
| d2e62ec66e | bump alpha.2 + client API | superseded (bump) |
| 0b65297b48 | regen catalogs | superseded (regenerate) |
| 47787fdecd | finish-install -> alpha.2 | tooling |
| 79f79e21cb, 969fef95db, 5321bde96b, 841698d4fb, 87581c6a28, 55ef4098d9 | state files | tooling (state, not code) |
| 7a7f67826c | Alt shortcuts to keyup | carry (composer) |
| 55c15a6af4 | right panel width per session | carry |
| 63c706cec2 | All Sessions section | carry |
| 354c7d6c59 | session-status reports what it does | carry |
| 502bf5f5a8 | bump rc.1 | superseded (bump) |
| 4329434a88, 4efa1b2dd1, 471e72742e, 42db6c8038 | finish-install guards | tooling (Phase 5, guards kept) |
| 714f0f8f74 | sidebar rail round trip tests | carry |
| b9064104d1, f0512f7605, 016d1048c2 | composer chord fixes | carry |
| 7fdd0d6c9c | vision default flash + bump rc.2 | rehome (vision) / superseded (bump) |
| d15b86e551 | PACKAGING.md | carry, rewritten for `.env.windows` |
| ba3644927a | llm-route-fallback | carry |
| ed2298f345 | indent + unarchived count | overlap |
| 86ed07586b | session footer | rehome |
| 1e89100c7f | route fallback disabled | carry |
| 5512545eac | merge PR #21 | merge commit, no content of its own |
| e39f7bf01e | questions, All Sessions recovery, pwsh param | carry |
| 4929fed9fe, 708e2daa30 | first-payload bound | rehome |
| 3fdc254989 | truncated stream recoverable | carry |
| 1e78c99f4f | Ctrl+Shift+A archive | rehome |
| e7b9f7ef6d | group fold | carry |
| 1a77e844ad | 13px group header | carry |
| 4980d90f54, e15a4fc5f4, 43500cd452, d9e83fca02 | footer links / intent | carry (host) + rehome (UI) |
| a21af3a222 | folder sort | carry |
| fe3a1a3c14 | stage marks | overlap (rewrite) |
| 203ac5a2d7 | plan lead-in | carry |
| (c3ee39fb88) | edit-self-observe, branch only | carry |

## Unknowns carried into Phase 3

- Whether the first-content-event timer in llm-deepseek sees the right event on the live DeepSeek
  Anthropic-format stream (probe before trusting).
- Whether the v3->v4 migrator rewrites in place or writes v4 beside v3 (affects the bridge's source pick).
- sessions-panel builds against 0.1.7 or not (decides carry vs superseded).

# CURRENT_STATE - archived history

Auto-archived by state_file_cap.py when CURRENT_STATE.md exceeded 32 KB. Newest-first. On-demand only; not read at session start.

## 2026-09-09 - Sessions panel shipped (right-sidebar session overview)

Built the ui-sessions-panel feature package: a right-sidebar Sessions tab that lists every open session regardless of workspace, Active-only by default (running, subagent, awaiting-input and planning first) with an All toggle for idle history. About 20 files under packages/client/ui-sessions-panel, 39 tests at 100% coverage, and an independent phase classifier re-implemented so the plugin never imports another feature plugin at runtime. Wired into the web-app bundle, the cordis patch, the tsconfig client references and the web-app package deps; added the sessions-panel tsconfig path alias, closing the sessions-panel half of OPEN_ISSUES item 9. Also fixed apps/desktop/scripts/prepare-runtime.ts to extract the node runtime with system tar (extract-zip produced an empty extraction on this host) and bumped finish-install.ps1 to 0.1.5-alpha.1. The feature shipped and installed in the 0.1.5-alpha.1 update; Steve confirmed everything runs successfully.

## Last save-state (2026-09-08T17:47:04.847381+00:00)

- Trigger: `save_state`
- Actor: `claude-code:steve`
- Session id: `1af9c4e8-f7ce-40d6-8170-dd9119e4caf2`
- Repos touched: deepseek-harness (source: cwd fallback (transcript scan found none))
- Plan: (none)
- Transcript: C:\Users\SteveDempsey\.dsh\sessions\--C-Projects-general-DS~0020harness--\session-d236bdea-4e7a-4e0c-b761-552123f3da1d

<!-- claude-memory-actor:end -->

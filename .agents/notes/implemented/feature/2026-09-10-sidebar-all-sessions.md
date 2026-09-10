# Agent Note: All Sessions sidebar section

Status: implemented

English | [中文](2026-09-10-sidebar-all-sessions.zh.md)

## Problem

The sidebar nests sessions under Workspace folders, which sit under named groups. Finding a session means knowing its Workspace and expanding the right group, and a session outside every Workspace is easy to miss.

## Decision

A new `sidebar.allSessions` hole, declared by ui-sidebar and filled by ui-workspace, renders a collapsible "All Sessions" section above the workspace browser. Expanded, it lists every unarchived session newest-first; each row shows the live status mark, the session title, and the owning Workspace title (or the cwd basename for an ungrouped session). Clicking a row opens the session through `uiWorkspace.openSession`, the same navigation the browser rows use. The fold flag lives in a new `dsh.workspace.allSessions.v1` store and defaults to expanded. The section is wide-only: the collapsed rail keeps its own icons.

## Alternatives considered

**Reuse the existing "In one list" flat mode.** It already lists every session, but it replaces the Workspace tree instead of sitting above it, and its rows omit the Workspace label, so it cannot answer where a session lives at a glance.

**Render inside the workspace browser's scroll region.** Keeps one scrollbar but couples the quick-nav list to the browser's search and view-option state, which the section must not share.

## Consequences

The shell renders two section slots in order, all-sessions above workspaces. The derivation reuses `sessionVisible` and `sessionNode` from the flat list, so archive, blank, and subagent filtering stay identical. New store, derivation, component, locale, shell-order, and registration tests cover the section.

# Agent Note: Sessions panel

Status: implemented

English | [中文](2026-09-08-sessions-panel.zh.md)

## Problem

The left sidebar groups sessions by workspace and collapses each group to five rows, so a session that is running, waiting on the operator, or holding running subagents in a lower workspace is invisible at a glance. The operator has to expand workspaces one by one to find what is actually open. The right Sidebar's [docking infrastructure](2026-09-04-right-sidebar-docking-infrastructure.md) already carries a tab-type registry with a page-type pattern and a guide-entry doorway, but no shipped type answers "show me every active session regardless of workspace".

## Decision

A new client package, `@deepseek-ai/dsh-client-ui-sessions-panel`, registers a `sessions` tab type and its body, following the external-type template `ui-sidebar-textpreview` established. The type is a page type: `{ id: '@deepseek-ai/dsh-client-ui-sessions-panel', kind: 'sessions', priority: 'builtin', title, guide: [{ order: 10, title, description, icon: IconListPenOutline16 }] }`. It claims no address; the guide's entry box opens it by kind with `replaceTab: true`, the same doorway the file tree uses.

The body is a fixed Active/All filter header over one scrolling list. It reads the session list and pending interactions through the global `useSessions` / `useSessionPendingInteraction` hooks and workspaces through `useWorkspaces`, and drives exactly one Host action, `open`, through its inject face (`ctx.sessions.open`). The filter is component-local state, defaulting to **Active**.

`deriveSessions` in `active.ts` is the pure derivation, deliberately re-expressed rather than imported from `ui-workspace` (a feature plugin must not runtime-import another feature plugin's values). Visibility mirrors the left sidebar: subagent rows are folded into their parent, archived rows are hidden, and only the selected blank row shows. A session is active when it has a pending interaction (approval, plan-review, question), plan mode is active, it is running, running subagent descendants exist, or it is finished-but-unopened. Active rows lead in phase-precedence order (awaiting first, then plan, running, subagents, done) then recency; idle rows trail by recency. The running-subagent count uses the same small lineage walk the UI Workspace domain projects, re-expressed here so the panel owns its own view.

Each row shows a state dot for the phase (warning for awaiting/planning, ongoing for running/subagents, done for finished), the title, the owning workspace label, and a relative time; clicking it opens that session. Copy is the `sessionsPanel` locale namespace, en and zh.

## Alternatives considered

**A flat list in the left sidebar.** The workspace browser already ships a "Group by: In one list" flat mode; it lists every session across workspaces but does not isolate active ones, and it lives in the left column that competes with the conversation. Not taken as the answer because it does not surface "open" sessions on top.

**An active-only filter inside the left sidebar.** Rejected: it entangles the workspace browser's two existing grouping modes with a third axis, and the panel's purpose is a persistent, always-available view beside the conversation.

**Import `derivePhase` from `ui-workspace`.** Rejected by the export rule: a feature plugin must not runtime-import another feature plugin's values. The classifier is small and re-expressed, matching the existing precedent that the UI Subagent and UI Workspace domains project their own views.

**A root-scoped panel.** Rejected: the `sidebar.right.pane.tab` seat is session-scoped and a root-scoped tab would need a new seat. The panel works as a launcher anchored to a main session; opening a session from it moves the conversation focus.

## Consequences

- A session doing work or waiting on the operator is visible without expanding workspace folders: the Sessions tab shows active sessions first, cross-workspace, and the All filter reveals idle history below them.
- The panel is session-scoped, so opening the tab in one session does not install it in another. This is stated, not hidden.
- The phase classifier mirrors but is not byte-identical to the left sidebar's; the two can drift, which is the accepted cost of the export rule.

## Testing

`tests/active.client.spec.ts` covers classification, ordering, the id tiebreak in both directions, subagent lineage folding, archived and blank visibility, and empty input. `tests/sessions-panel.client.spec.tsx` covers the Active/All filter, click-to-open, empty states, workspace labels, first-label-wins, phase dots, and relative time. `tests/apply.client.spec.ts` and `tests/definition.client.spec.ts` cover registration, the inject face, and teardown. All source files are at 100% per-file coverage, and the full client aggregate typecheck and `verify-client-packages` pass.

## Deferred

- A "follow the session" nicety that also opens the Sessions tab in the destination session when a row is clicked.
- A dedicated toolbar button or keyboard shortcut that opens the Sessions tab directly, instead of the two-click guide doorway.

## Related

- [Right Sidebar docking infrastructure](2026-09-04-right-sidebar-docking-infrastructure.md) - the panel and panes.
- [Sidebar tab types and navigation](../architecture/2026-09-05-sidebar-tab-types-and-navigation.md) - the registry, bands, and `openTab`.
- [Sidebar text preview and file tree](2026-09-05-sidebar-text-preview-and-file-tree.md) - the external-type template this package follows.

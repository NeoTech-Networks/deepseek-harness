---
description: "The right Sidebar's pinned-directory explorer: operator-owned roots anywhere on the Host, listed lazily, with its own file preview and a once-per-Session auto-open."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sidebar-explorer

English | [中文](README.zh.md)

## Summary

The right Sidebar's second navigator: a tree over the directories the operator pinned, wherever they are on the Host, listed one level at a time over the `pinnedFiles` Remote namespace. It is the same tree in every Session and every Workspace, because its roots are Host state rather than a Session's working directory. It ships a second tab type, a plain text preview, because a pinned file usually sits outside the Session's workspace and the shipped `text` viewer refuses to read there.

## Table of Contents

- [What it registers](#what-it-registers)
- [The tree](#the-tree)
- [Auto-open](#auto-open)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="what-it-registers"></a>
## What it registers

- **The explorer type** — kind `explorer`, id `@deepseek-ai/dsh-client-ui-sidebar-explorer`, band `builtin`, no patterns, one guide entry at order 5.
- **The preview type** — kind `pinnedText`, id `…#text`, band `builtin`, no guide entry: a preview with nothing to preview is not a place to land from the guide. It takes a `path` navigation parameter, declared into `SidebarRightTabParamsMap`.
- **Both bodies** — the keyed `sidebar.right.pane.tab` seat, one under each id.
- **The auto-open** — one subscription to the Session list.

Source files under `src/client/`: `definition.ts` (the two types), `store.ts` (what the tree keeps), `face.ts` (how it calls the Host), `ExplorerBody.tsx` (the tree), `TextBody.tsx` (the preview), `locales.ts` (what it says), and `index.ts` (the wiring).

<a id="the-tree"></a>
## The tree

Every root is a header row that toggles; every level below it is keyed by the absolute path the Host reported, so the client never joins path segments. Rows are ordered directories first, then by natural case-insensitive name; dotfiles are shown like any other entry, and an entry that is neither a file nor a directory is greyed and inert. A level cut by the endpoint's entry cap ends with a marker; an empty level says so; a failed level shows one line per `pinned-files/*` code.

Clicking a file opens the `pinnedText` tab in the same pane. Because that tab is opened by kind rather than by address, one preview tab per pane is reused as the operator clicks around, and each click arrives as a fresh navigation with a stepped revision.

The controls are a refresh in the header, an unpin beside each root, and one add row at the foot: a path field, a **Browse...** button that opens the Host's own folder chooser when the composed picker has one, and **Add**. The typed field is the fallback that always works, so a deployment whose picker cannot open a native dialog loses the button and nothing else.

State lives in the type's own store, bucketed by tab id, with the root list shared by every explorer tab in the Session. The owner's `signal` ends a bucket: on abort the tab is forgotten and a listing that settles afterwards writes nothing.

<a id="auto-open"></a>
## Auto-open

The Sidebar keeps no layout across reloads and draws nothing before a Session's surface has been mounted, so "the explorer is simply there" cannot be a property of the layout. This package takes it as an action instead: on the `current` edge of the Session list it calls `openTabIn(sessionId, 'explorer')`, once per Session, with one late retry that covers the surface's first paint. Opening content expands the column, which is why each Session is visited at most once: collapse it and it stays collapsed. Setting `autoOpen: false` under `pinned-files` in the settings document turns the behaviour off; the value is read once at load.

<a id="model-experience"></a>
## Model Experience

None, as this package draws a directory tree in the browser and registers nothing model-facing.

#### KV Cache effect

None; directory listings and file reads travel over the Remote and assemble no model request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Listing only.** No search, filter, drag-and-drop, rename, context menu, current-file highlight, or filesystem watching; a level changes only through refresh.
- **No reordering or renaming of roots.** A root's label is its basename, and the order is the order they were added; changing either means editing the settings document.
- **The preview is plain text.** No syntax highlighting, no paging, no images, and a file past the Host's byte cap is refused rather than shown in part.
- **`autoOpen` is read once.** Editing it in the settings document takes effect at the next load, unlike the roots themselves, which are re-read on every refresh.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The tree's only runtime state is one Slot store per Session, written by the bodies that own it and forgotten on each tab's abort signal; there is no second observation of it to compare against.

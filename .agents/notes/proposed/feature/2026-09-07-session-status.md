# Agent Note: durable session status icons in the sidebar

Status: proposed

English | [中文](2026-09-07-session-status.zh.md)

## Problem

The sidebar row already derives one phase per session and draws four glyphs for the states a colour alone cannot tell apart (awaiting approval, awaiting plan review, awaiting answer, plan mode), but it has no vocabulary for the states an operator actually triages: a session held for the deploy phrase, a session stuck on the operator, a finished session, and a session whose own turn is over but whose subagents are still running. The first three have no representation anywhere in the harness, and the fourth renders with the same animated dot as the session's own work.

The earlier feature note on the abandoned `feat/session-phase-shortcuts` branch proposed this as "stage 2" of a durable operator-assigned phase. That stage landed here, with one rename: the declared value is a **status**, not a phase, because `SessionPhase` already names the derived row state in `ui-workspace/tree.ts`.

## Proposal

One declared, model-independent status, with two write routes and one free fallback.

- **Durable status.** `@deepseek-ai/dsh-session-status` owns a whole-value `session/status` event, a `sessionStatus` projection, a validated vocabulary, and a resolving service. The event carries the complete `{ id, label, icon, tone }`, so a later vocabulary edit cannot retroactively change a logged row. Any human-authored `user/message` clears the status, because the prompt answers whatever the status was holding for.
- **Two write routes.** `@deepseek-ai/dsh-tool-session-status` gives the model `set_session_status`, and `@deepseek-ai/dsh-command-session-status` gives the human `/status`. The Session Controller adds `setStatus` and `listStatuses` remotes so the row menu can offer the operator the same vocabulary the tool offers the model. The tool and command are harness plugins, so the behaviour is identical on every model backend.
- **Free goal fallback.** The row derivation maps a `blocked` goal to `stuck`, a `complete` goal to `finished`, and a `paused` goal to `paused`, so a session that manages a goal through the goal tools lights up the icon without a second declaration.
- **Precedence.** A declared status sits below the three operator-blocking phases and above plan mode and activity. A stale "finished" tag never hides a session waiting on the operator, and a new prompt clears the tag anyway.
- **Subagents glyph.** `subagents` gets its own glyph, so the animated dot now means exactly "this session is working", not "this session or something under it".

The shipped vocabulary is `waiting-production` (attention, `right-up`), `stuck` (error, `stop`), `finished` (success, `check`), `waiting-external` (attention, `clock`), and `paused` (neutral, `pause`), drawn from the existing 74-glyph `ui-primitives` set.

## Alternatives considered

- **Derive the status from turn outcomes.** Rejected: the operator explicitly wanted `stuck` to fire only when the session says so, never from a failed request.
- **Keep one dot and encode phase in colour alone.** Rejected: the three operator-blocking phases would stay indistinguishable, and adding more colours to a 10px dot degrades faster than adding glyphs.
- **Store the status in client localStorage.** Rejected: it would not survive a second browser, would not appear on a cold row, and would not fork with the session.

## Acceptance criteria

A sidebar of mixed sessions is readable at a glance, one row per state, with the correct glyph and tone; every row still reports every live status to a screen reader and in the hover card; the status survives reload, resume, and fork; a new prompt clears it; and an unknown id is a rendered error, never a crash.

## Risks

- **A declared status displaces the running dot.** A session tagged `finished` whose subagents are still running shows the tag, not the activity. Deliberate, and the hover card still lists the running descendants.
- **A model that never calls the tool.** The row behaves exactly as it does today; the goal fallback and the row menu are the two corrections.
- **Cold rows before the projection cache warms.** The row renders as it does today. Invisible and self-correcting.

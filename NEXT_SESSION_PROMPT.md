# NEXT_SESSION_PROMPT (one current pointer)

0.2.1-rc.5 plus BOTH Bot Sessions changes is INSTALLED (2026-10-30 16:12):
`8b9510fcd6` added the group and `96b5725a3f` made it ask ds-bot which sessions
are its own, so `Igor` and `YouTube` now file under `Bot Sessions` even though
they work in `sig-railway-services` and a playbooks worktree. Proved live: 7 ids
published, none of the main list published, all 6 group rows published, and the
degrade path falls back to the folder rule. 48 of 48 features in the running
build; the ds-bot patch reads 9 of 9.

Build tree `C:\d216` (detached at `96b5725a3f`), installer sha256
`806E1BDC7CF2366E40C908EBAE9DB557AD23E57D6C7A13548A1BD71B2FB0AAAC` is at
`C:\d216\apps\desktop\.desktop-build\targets\win-x64\unsigned-artifacts\`.
Rollback is reverting `96b5725a3f` and rebuilding; the plugin half rolls back
with `ds_bot_combined_sidebar_patch.py --revert`.

Next, in this order:

1. Restore the operator's "Brainstorm + approve" preset, which the 2026-10-29
   install deleted (OPEN_ISSUES 22). Needs the app closed.
2. One new bot chat created AFTER the install, to confirm it joins the group
   unaided (OPEN_ISSUES 26). The mechanism is spec-covered; only the live join
   of a brand new chat is unseen.
3. The composer buttons pressed in a scratch session (12) and the lower
   workspace-picker headings photographed (14).

The `ds-harness-update` skill is v7 and still uncommitted in the shared
`C:\Claude` checkout (OPEN_ISSUES 4 and 19).

Session page: `C:\Projects\logs\2026-10-30\dsh-all-sessions\SESSION_STATE.md`.

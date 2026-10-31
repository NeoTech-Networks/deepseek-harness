# NEXT_SESSION_PROMPT (one current pointer)

0.2.1-rc.5 plus the Workspaces fold and the single account button is INSTALLED
(2026-10-31 13:07): `3d164b23c6` folds the browser section header, merged into
`feat/bot-sessions` as `eb0101cc42`; the ds-bot patch gained a tenth hunk that
gates BOTH account launchers on `uiNow.accountSeated`, so exactly one renders.
Proved live: the header folds on a click (group headers 5 to 0 and back),
exactly one Account button in every census, the fold value written to disk, and
the plugin patch 10 of 10 after the install.

Build tree `C:\d216` (at `eb0101cc42`), installer sha256
`9E3FD37978EF19D42AD76AA9D11B39880735AA06C15861BBCF11FCC9028B272F` at
`C:\d216\apps\desktop\.desktop-build\targets\win-x64\unsigned-artifacts\` and
copied to `C:\Projects\exports\2026-10-31-dsh-workspaces-collapse\`. The
pre-fold installer is the rollback floor at
`C:\Projects\exports\2026-10-31-dsh-0.2.1-rc.5-pre-fold\`. The plugin half rolls
back with `ds_bot_combined_sidebar_patch.py --revert`.

Next, in this order:

1. Restore the operator's "Brainstorm + approve" preset, which the 2026-10-29
   install deleted and which three held-aside installs since have not restored
   (OPEN_ISSUES 22). Needs the app closed.
2. Fold the Workspaces header, quit and relaunch, and confirm it comes back
   folded (OPEN_ISSUES 27). The disk write is proven; the restart round trip is
   not.
3. One new bot chat created AFTER the install, to confirm it joins the group
   unaided (OPEN_ISSUES 26).
4. The composer buttons pressed in a scratch session (12) and the lower
   workspace-picker headings photographed (14).

The `ds-harness-update` skill is v7 and still uncommitted in the shared
`C:\Claude` checkout (OPEN_ISSUES 4 and 19), and so is the ten-hunk
`ds_bot_combined_sidebar_patch.py`.

Session page: `C:\Projects\logs\2026-10-31\dsh-sidebar-collapse\SESSION_STATE.md`.

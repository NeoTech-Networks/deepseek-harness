Continue deepseek-harness. The two harness fixes are now PORTED, BUILT AND PROVEN INSIDE AN INSTALLER, and the only thing left is the install and the read-back. Do NOT redo the port.

WHAT HAPPENED LAST SESSION: `git cherry-pick 92e043bf4d` onto `update/v0.1.5-alpha.1` in worktree C:/Projects/worktrees/dsh-update-v015 applied clean as `7c577fb6fe`. The four touched files had diverged from the 0.1.3 line by exactly ONE non-overlapping line, so the port that had been assumed to need a rewrite was one command. fs-local 142 passed with the 13 pre-existing POSIX-on-Windows failures unchanged and all 6 new cases green; plan-mode 94/94; typecheck exit 0; build exit 0; packaging exit 0. Installer: apps/desktop/.desktop-build/targets/win-x64/artifacts/deepseek-harness-0.1.5-alpha.1-win-x64.exe, 190,730,194 bytes, packaged with DSH_DESKTOP_APP_ID=com.deepseek.harness and DOWNLOAD_TEST_ORIGIN=https://download.neotech.biz.

THE PROOF THAT MAKES THIS DIFFERENT FROM EVERY EARLIER ATTEMPT: the packaged seed archives themselves were extracted and read. deepseek-ai-dsh-fs-local-0.1.5-alpha.1.tgz contains PUBLISH_RETRY_DELAYS_MS, publishOverExisting and readTextBytesConfirmingBinary; deepseek-ai-dsh-plan-mode-0.1.5-alpha.1.tgz contains describePlanFault and ZERO occurrences of the old "requires a non-empty markdown plan" message. The installer carries the fixes.

THE JOB, if Steve has run the installer:
  1. Confirm the install: %LOCALAPPDATA%\Programs\DeepSeek Harness\resources\seed\desktop-release.json reads 0.1.5-alpha.1, and the uninstall entry count under HKCU Uninstall did not grow (a wrong app id would have added a third).
  2. Read the RUNNING code, which is the check that caught the last failure: ~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-fs-local/lib/index.js must contain publishOverExisting, and .../dsh-plan-mode/lib/index.js must contain describePlanFault with no bare /^#\s+\S/ gate left.
  3. Behavioural check: submit one plan whose first line is the operator-metadata blockquote, above the # title. It must be accepted first time. The running build rejected exactly that on 2026-09-09, which is the defect being fixed.
  4. Boot proof: launch with ELECTRON_ENABLE_LOGGING=1 and stderr redirected, read the `web boot:` line, confirm no entry failed to activate.
  5. Then close OPEN_ISSUES item 0, and re-check items 1, 2, 5 and 10 the same way (they were claimed live on the strength of a profile sync, which does not survive a relaunch).

IF STEVE HAS NOT RUN IT YET, that one command is the whole blocker, from a NEW PowerShell window, never from inside the app (it force-closes the app):
  powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-update-v015\finish-install.ps1"

ALSO SETTLED LAST SESSION, do not re-litigate: DSH_DESKTOP_APP_ID is com.deepseek.harness, not com.neotechnetworks.deepseek-harness. Proven by GUID derivation against the live uninstall key (details in OPEN_ISSUES item 13 and playbook 05-neotech-fork.md section 4). A wrong app id does not fail the build, it silently installs a second parallel copy. The playbook was corrected in the same session, along with the install sequence (the seed is now cleared before install, integrity is asserted before relaunch, and rollback is deliberately KEPT).

The sessions-panel feature (right-sidebar Sessions tab) shipped and installed in the 0.1.5-alpha.1 update; nothing outstanding there.

STILL OPEN otherwise: item 16 (state files written on feature branches, published to master, so they drift), item 18 (re-run dsh_session_audit.mjs after a normal day to confirm the hook win holds on real traffic), item 19 (16 tool results lost in two process-wide bursts, cause unattributed), item 8 (DeepSeek vision needs a GUI image ATTACH; read_image on a path is not the test and will always refuse). Full list in OPEN_ISSUES.md.

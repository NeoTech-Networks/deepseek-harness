Continue deepseek-harness. The 2026-09-09 DSH daily review is DONE except for one thing, and that one thing is the whole job for the next session: TWO HARNESS FIXES ARE COMMITTED BUT NOT RUNNING, because the desktop app runs published 0.1.5-alpha.1 while the checkout they were written on is 0.1.3-alpha.2. Relaunching the app re-provisions ~/.dsh/profiles/desktop from 0.1.5 and overwrites any patched lib, so the sync-into-the-profile technique does NOT survive a restart. This was proved on 2026-09-09 by relaunching and re-reading the running code.

THE JOB: port the two fixes onto the 0.1.5 line and ship them through a real build, not a profile patch.

The two fixes, both on branch fix/account-usage-remote-mount at commit 92e043bf4d (0.1.3-alpha.2):
  1. packages/fs/fs-local/src/fsio.ts - publishOverExisting(): bounded retry then a rename fallback, because the publication step caught only ENOENT and any other Win32 failure discarded the staged content (9 writes lost on 2026-09-08 to Win32 1175). Plus readTextBytesConfirmingBinary(): a confirming second read before declaring a file binary (4 false verdicts on a file with no NUL byte in it).
  2. packages/plan/plan-mode/src/index.ts - describePlanFault(): skip leading blank and blockquote lines before looking for the H1, and report what was actually found. The current strict /^#\s+\S/ test rejects every plan written to this operator's own plan format, which opens with the operator-metadata blockquote. It rejected this session's own plan twice.

CONFIRMED STILL BROKEN in the RUNNING 0.1.5 build (read directly from ~/.dsh/profiles/desktop/node_modules/@deepseek-ai/): fs-local lib/index.js lines 165 and 184 are `if (!isENOENT(error)) throw error;`, there are 3 unguarded "binary file" sites, and plan-mode lib/index.js line 270 is the old `/^#\s+\S/` test.

WHERE TO DO IT: a 0.1.5 upgrade is already in flight at worktree C:/Projects/worktrees/dsh-update-v015 on branch update/v0.1.5-alpha.1 (fs-local there is 0.1.5-alpha.1 and does NOT contain the fixes). Port onto that, then build the installer and install it. Do NOT re-sync lib files into the profile and call it done; that is what silently reverted.

Both fixes have tests that travel with them: 6 new fs-local tests (retry, rename fallback, ENOENT fast path, two torn-read cases, stable-binary still rejected) and 3 new plan-mode cases. fs-local baseline on Windows is 13 pre-existing POSIX failures; do not treat those as regressions. plan-mode must stay 94/94.

EVERYTHING ELSE FROM THE REVIEW IS LIVE AND PROVEN, do not redo it:
  - The non-atomic state writer, which was the ROOT CAUSE of the notes-file loss, is fixed in ~/.claude/hooks/memory_save_state_actor.py (commit c2d54ff in the .claude repo) and is live. It also no longer destroys a state file when a read fails transiently, which is the likely source of the missing history.
  - State files reconciled across deepseek-harness, C:/Claude and jetway-tracktik-paycom-sync; the real worker reports "0 needing attention" for all three. Tool: C:\Claude\bin\state_file_reconcile.py.
  - Hook bridge sped up, live and measured on PRODUCTION traffic after the change: PreToolUse 1,832ms -> 1,176ms (36%), PostToolUse 1,520 -> 1,042, UserPromptSubmit 3,048 -> 2,247, Stop 5,007 -> 3,252. Commits 56969c4b and 09fce83d in C:/Claude. The bridge is plain Python read fresh on every call, so it needed no relaunch.
  - glm-5.3-highspeed removed from allowedModels (Z.ai refuses it: 429 code 1311, no entitlement). All nine other routes probed live and answer.
  - ~/.dsh/AGENTS.md now carries the full mcp__claude-memory-bridge__ tool names.
  - The "tool argument corruption" is NOT a harness bug: the damage is in the model's own first JSON delta. Do not touch the accumulator. C:\Claude\bin\dsh_session_audit.mjs re-attributes any future occurrence.

STILL OPEN after that: item 16 (state files are written on feature branches but published to master, so they will drift again), item 18 (re-run dsh_session_audit.mjs after a normal day to confirm the hook win holds on real traffic), item 19 (16 tool results lost in two process-wide bursts, cause unattributed), item 8 (DeepSeek vision needs a GUI image ATTACH; read_image on a path is not the test and will always refuse). Full list in OPEN_ISSUES.md.

# NEXT_SESSION_PROMPT (one current pointer)

0.2.2-rc.3 is INSTALLED with DS Bot 0.3.6. On 2026-11-17 the DS Bot restart
bundle went live: fork #26 and #27 merged (stack `stack/installed-0.3.5` head
`33b96332`), the profile patch was rebuilt (`bbd42f41...`), and the 8000 px image
cap was set in the desktop profile. The app was restarted at 07:21 and read back.

Next, in this order:

1. Verify and merge this state-file PR (#80). A different session must run
   `coding_job_verify.py` for it, because the builder cannot verify its own PR.
2. Prove the image cap live: a Bot reads
   `C:\Projects\logs\2026-11-17\dsbot-restart-bundle\tall-12000.png` and the
   stored long side is 8000 or less (OPEN_ISSUES 19).
3. Watch the first answered handoff show as closed, not waiting (OPEN_ISSUES 20).
4. Find what replaces `~\.dsh\AGENTS.md` instead of editing it (OPEN_ISSUES 18).

Session log: `C:\Projects\logs\2026-11-17\dsbot-restart-bundle-image-cap\SESSION_STATE.md`.

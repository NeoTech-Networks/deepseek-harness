# NEXT_SESSION_PROMPT (one current pointer)

0.2.2-rc.1 is INSTALLED (2026-11-05 11:45) and read back: one uninstall row,
47 of 48 fork features in the running asar, settings survived, hook bridge
re-pinned and loaded, hardlink repaired. The bot team was restored first, to
39 bots and 7 rooms from `C:\tmp\state.json`. Branch `update/v0.2.2-rc.1` in
`C:\d217`.

Next, in this order:

1. The Igor turn fault (OPEN_ISSUES 26). His own-chat turn throws
   `Cannot read properties of undefined (reading 'filter')` and it is new since
   the install. Reproduce it with a stack; ds-bot logs no stack.
2. The room turn loop (OPEN_ISSUES 27). SIG Growth and SIG Content re-issued 38
   sessions in 5 minutes with nothing landing. Pause both rooms first, then
   decide whether it is ds-bot retrying an aborted observation.
3. Re-authorise Anthropic (OPEN_ISSUES 28); the refresh token is expired and
   every anthropic-backed bot fails until it is not.
4. Only then the two unproven install checks: the composer Save / Production
   row on an IDLE session, and four `hook/result` exit 0 entries on a
   tool-using turn.

Still outstanding from the plan: the `05-neotech-fork.md` version row and
ledger entries for 0.2.2-rc.1.

Session log: `C:\Projects\logs\2026-11-05-dsh-0.2.2-rc.1\`.

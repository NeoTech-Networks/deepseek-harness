# Next session prompt

Continue deepseek-harness. The stream-stall fix is BUILT, INSTALLED AND VERIFIED
(2026-09-14). Nothing is waiting on the operator.

## What shipped 2026-09-14

Branch `fix/deepseek-stream-stall` off `update/v0.1.5-rc.2`, pushed to the fork,
worktree `C:\Projects\worktrees\dsh-stream-stall`, two commits:

- `4929fed9fe` adds `streamFirstPayloadTimeoutMs` (default 120000, `0` disables).
  A keep-alive comment no longer rearms the idle watchdog BEFORE the stream's
  first data payload, and counts exactly as before after it. Expiry is `TIMEOUT`,
  which the retry policy already recovers. The mock server gained a
  `keepalive_stall` behavior and there is a wire-level test whose idle timeout is
  30s against a 200ms bound, so it would hang if comments still counted.
- `3fdc254989` gives the DeepSeek route its own `retryPolicy` in the bundle
  patch: `maxRetries: 3` and all six codes including `STREAM_CLOSED` (the list
  REPLACES the defaults, so it is spelled out).

Why: `deepseek-flash` went dead at DeepSeek's end that day, returning HTTP 200
and then nothing but `: keep-alive`. The harness counted those as progress, so
fourteen turns each burned about fifteen minutes and died on the one
transport-class code it refuses to retry. Live proof after install: the same real
fault now costs 41.1s for two attempts with a visible `TIMEOUT` retry, while
`deepseek-v4-pro` completes in 13.6s with zero retries.

Full write-up and raw captures: `C:\Projects\exports\2026-09-14-dsh-sse-stall\`.

## What is left

- MERGE DECISION, not housekeeping: `fix/deepseek-stream-stall` is installed and
  proven but has not been merged into `update/v0.1.5-rc.2`. Decide whether it
  lands there or waits for the next version bump.
- `deepseek-flash` was still dead at 16:50 on 2026-09-14 (OPEN_ISSUES item 29).
  Re-probe before running anything on it, and decide whether to send DeepSeek the
  trace id `47725ea260636ad4556acd718262e2b1`.
- Step 8 housekeeping still owed for BOTH this build and the 2026-09-13 one:
  playbook version-history table, error ledger, `CHANGES.md`.
- Carried over from 2026-09-13, unaffected by this work: confirm
  `py C:\Claude\bin\dsh_local_features_check.py` reads 18/18, and EYEBALL the
  workspace session-count badge, the session footer, and a long question card.
- All Sessions root cause is STILL OPEN (OPEN_ISSUES item 27-update).

## Checkout state

`C:\Projects\repos\deepseek-harness` is on `master`. The RC line is
`update/v0.1.5-rc.2` in worktree `C:\Projects\worktrees\dsh-update-v0.1.5-rc.2`.
The fix line is `fix/deepseek-stream-stall` in worktree
`C:\Projects\worktrees\dsh-stream-stall`, clean and equal to origin, and it is
what the installed app was built from.

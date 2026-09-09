# Next session

Install the provision-diagnostics build and finish its verification.

1. Steve runs, in a NEW PowerShell window (not from inside the Harness app):

   ```
   powershell -ExecutionPolicy Bypass -File "C:\Projects\worktrees\dsh-provision-diag\finish-install.ps1"
   ```

2. Then verify, in this order:
   - `resources\seed\desktop-release.json` says `0.1.5-alpha.1`
   - `~\.dsh\profiles\desktop\node_modules\@deepseek-ai` exists with fresh mtimes
   - `~\.dsh\desktop\logs\provision-*.log` EXISTS and names every step. This is
     the whole point of the change. A zero-length or absent file is a FAILED
     verification, not a pass.
   - the app opens a window, and a session created after the install answers a
     message

3. Branch `fix/provision-diagnostics` (f82bb8df30, pushed to the fork). Not
   merged; merging is Steve's call.

4. Still open: why the 07:20 first-run setup stalled on 2026-09-09. It could not
   be settled because the stalled run wrote nothing anywhere. The next stall
   leaves a transcript that answers it. Background in
   `C:\Projects\logs\2026-09-09\dsh-wont-start\FINDINGS.md`.

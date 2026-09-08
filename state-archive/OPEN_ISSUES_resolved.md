## 2026-09-08 - session creation fixed (standard-hooks preset path)

- RESOLVED: "Session creation fails in the desktop app after launch: the default preset "standard-hooks" fails to mount with "Cannot find package" for roughly twenty built-in host plugins ... not declared as dependencies of @deepseek-ai/dsh-agent-presets, so they are never installed. Fix: declare those plugins as dependencies" - the diagnosis was wrong: all ~23 plugins ARE declared and installed in the packaged profile. The real cause was the `standard-hooks` user preset at `~/.dsh/.agent-presets/standard-hooks/agent.cordis.yml`, whose `cordis:include` path hardcoded the SOURCE repo (`C:/Projects/repos/deepseek-harness/...`) instead of the installed profile. Repointed it at `~/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-agent-presets/presets/standard/agent.cordis.yml`; New Session now works (user confirmed).

## 2026-09-08 - dependency gate fix

- RESOLVED: "Session-status work from the prior session is still uncommitted on `deepseek-harness` and still fails `verify-package-dependencies`: missing `@deepseek-ai/dsh-session-status` in `packages/client/connection/package.json` and `@deepseek-ai/dsh-goal` in `packages/client/ui-workspace/package.json`" - added both as workspace:^ devDependencies and refreshed pnpm-lock.yaml; verify-package-dependencies now exits 0.

## 2026-09-08 - open-session-in-subfolder

- RESOLVED: "origin is `deepseek-ai/deepseek-harness` with no push access, so a fork target is needed before it can be pushed" - created the `NeoTech-Networks/deepseek-harness` org fork and pushed `feat/open-session-in-subfolder` and `master` there.

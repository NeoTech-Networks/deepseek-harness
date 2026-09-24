/**
 * Human-facing `/status` command over the session-status domain: bare `/status`
 * reports the current status and the legal next ones, `/status <id>` sets one,
 * and `/status clear` clears it. An unknown id is a rendered error, never a
 * thrown failure.
 *
 * @module @deepseek-ai/dsh-command-session-status
 */

import type { Context } from '@deepseek-ai/cordis'
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands'
import type { SessionStatusValue } from '@deepseek-ai/dsh-session-status'

export const name = 'command-session-status'
export const inject = ['commands', 'sessionStatus']

const USAGE = 'Usage: /status [<id>|clear]'

/** Render one status with its legal next values. */
function renderStatus(ctx: Context, title: string, status: SessionStatusValue | null): CommandResult {
  const ids = ctx.sessionStatus.list().map(entry => entry.id)
  const line = status === null
    ? 'No status is currently set.'
    : `Status: ${status.label}`
  return {
    kind: 'success',
    text: [
      title,
      line,
      '',
      `Available: ${ids.join(', ')} | clear`,
      USAGE,
    ].join('\n'),
  }
}

/** Execute one parsed human command through the session-status service. */
function executeStatusCommand(ctx: Context, invocation: CommandInvocation): CommandResult {
  const input = invocation.rawInput.trim()
  try {
    if (input === '') {
      return renderStatus(ctx, 'Status', ctx.sessionStatus.current(invocation.agent.session))
    }
    if (input.toLowerCase() === 'clear') {
      ctx.sessionStatus.clear(invocation.agent.session)
      return renderStatus(ctx, 'Status cleared', null)
    }
    ctx.sessionStatus.set(invocation.agent.session, input)
    return renderStatus(ctx, 'Status set', ctx.sessionStatus.current(invocation.agent.session))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { kind: 'error', text: `${message} ${USAGE}` }
  }
}

/** Register the `/status` command for every composed command adapter. */
export function apply(ctx: Context): void {
  ctx.commands.register({
    name: 'status',
    description: 'set or view the declared session status',
    input: { hint: '[<id>|clear]' },
    handler: invocation => executeStatusCommand(ctx, invocation),
  })
}

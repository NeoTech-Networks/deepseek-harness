/**
 * Model-facing `set_session_status` tool over the session-status domain. One
 * call appends the whole-value `session/status` event to the calling agent's
 * session, so the operator's sidebar row shows a durable status without
 * reading model text. The status enum is built from the live vocabulary plus a
 * `clear` sentinel, so a model cannot invent an id the deployment does not
 * declare. Named exports preserve loader injection metadata.
 *
 * @module @deepseek-ai/dsh-tool-session-status
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
// Type-only: brings the ctx.sessionStatus augmentation into scope.
import type {} from '@deepseek-ai/dsh-session-status'

export const name = 'tool-session-status'
export const inject = ['tools', 'sessionStatus']

const CLEAR = 'clear'

const DESCRIPTION
  = 'Set a durable status on the current session so the operator\'s sidebar shows '
  + 'what the session is doing at a glance, independent of which model is running. '
  + 'Call it when the session reaches a state the operator should see without opening '
  + 'the session. Use "waiting-production" when the work is built and holding for the '
  + 'operator\'s deploy phrase, "stuck" when the session cannot make progress without '
  + 'the operator, "finished" when the objective is met, "waiting-external" when '
  + 'waiting on a third party, and "paused" when it is parked. Send "clear" to remove '
  + 'the status. The status clears automatically when the operator next prompts the session.'

/**
 * Register the `set_session_status` tool on `ctx.tools`, resolving its status
 * enum from the live session-status vocabulary.
 * @param ctx - registrant context carrying the tool and session-status registries.
 */
export function apply(ctx: Context): void {
  const vocabulary = ctx.sessionStatus.list()
  const statuses = [...vocabulary.map(entry => entry.id), CLEAR]
  ctx.tools.register(defineTool({
    name: 'set_session_status',
    description: DESCRIPTION,
    parameters: {
      status: {
        type: 'string',
        required: true,
        enum: statuses,
        description: 'The status to set, or "clear" to remove the current status.',
      },
      note: {
        type: 'string',
        description: 'Optional one-line reason, recorded beside the status.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: {
            required: true,
            oneOf: [
              {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string', required: true },
                  label: { type: 'string', required: true },
                  icon: { type: 'string', required: true },
                  tone: { type: 'string', required: true },
                },
              },
              { type: 'null' },
            ],
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.status === null
          ? 'Cleared the session status.'
          : `Set session status to ${value.status.label}.`,
      }],
    },
    execute(args, exec) {
      if (!exec.agent) {
        throw new Error('set_session_status requires an owning agent session')
      }
      const session = exec.agent.session
      if (args.status === CLEAR) {
        ctx.sessionStatus.clear(session)
        return Promise.resolve({ status: null })
      }
      ctx.sessionStatus.set(session, args.status, args.note)
      return Promise.resolve({ status: ctx.sessionStatus.current(session) })
    },
    presentCall: args => ({
      card: 'generic',
      title: args.status === CLEAR ? 'Clear status' : 'Set session status',
      kind: 'other',
      rawInput: args.status,
    }),
  }))
}

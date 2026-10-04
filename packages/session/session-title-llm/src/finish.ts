/** Terminal finish-reason policy shared by the title and purpose auxiliary calls. */

import type { FinishReason } from '@deepseek-ai/dsh-llm'

/**
 * Translate a terminal finish reason into an auxiliary-call failure.
 * @param finish - terminal finish reason of one auxiliary stream.
 * @returns the failure, or `undefined` for a clean stop.
 */
export function finishError(finish: FinishReason): Error | undefined {
  switch (finish.kind) {
    case 'stop':
      return undefined
    case 'error':
    case 'aborted': {
      const error = new Error(finish.failure.message) as Error & { code?: string }
      error.code = finish.failure.code
      return error
    }
    case 'max-tokens':
      return new Error('session-title-llm: title output reached maxOutputTokens')
    case 'tool-calls':
      return new Error('session-title-llm: title model unexpectedly requested a tool')
    default:
      return new Error(`session-title-llm: unsupported finish reason "${String((finish as { kind?: unknown }).kind)}"`)
  }
}

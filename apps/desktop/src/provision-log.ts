/** Durable transcript of one desktop package transaction. */

import { appendFileSync, mkdirSync, openSync, closeSync } from 'node:fs'
import { join } from 'node:path'

/** Sink that records every step and every byte of one package transaction. */
export interface ProvisionLog {
  /** Absolute path of the file this transaction is writing to. */
  readonly path: string
  /** Record one timestamped step of the transaction. */
  step(message: string): void
  /** Record child output exactly as it arrived, without a timestamp. */
  raw(chunk: string): void
}

/** Discard every record, for callers that supply no log directory. */
export const SILENT_PROVISION_LOG: ProvisionLog = {
  path: '',
  step: () => {},
  raw: () => {},
}

function timestamp(): string {
  return new Date().toISOString()
}

/**
 * Open one transaction transcript under the Electron-owned log directory.
 * @param directory - desktop log directory, created when missing.
 * @param label - short transaction name recorded in the file name.
 * @returns a log that never throws, so a failed write can never stall a transaction.
 */
export function openProvisionLog(directory: string, label: string): ProvisionLog {
  const name = `${label}-${timestamp().replace(/[:.]/gu, '-')}.log`
  const path = join(directory, name)
  try {
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    closeSync(openSync(path, 'a', 0o600))
  } catch {
    return SILENT_PROVISION_LOG
  }
  const write = (text: string): void => {
    try {
      appendFileSync(path, text)
    } catch {
      // A transcript is diagnostic only and must never fail the transaction it records.
    }
  }
  write(`[${timestamp()}] provision log opened for ${label}\n`)
  return {
    path,
    step: (message: string) => { write(`[${timestamp()}] ${message}\n`) },
    raw: (chunk: string) => { write(chunk) },
  }
}

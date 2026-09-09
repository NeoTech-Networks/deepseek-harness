/** Cordis Loader configuration file discovery. */

import { existsSync, globSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

/**
 * Return repository-relative Cordis Loader YAML paths under `root`.
 *
 * Translation consistency records are YAML sidecars, never Loader inputs.
 * Symlinks collapse to their target so a config that is also a link is
 * validated once, never as the link's own path text.
 *
 * @param root Repository root to scan.
 * @returns Sorted repository-relative Loader configuration paths.
 */
export function cordisConfigFiles(root: string): string[] {
  const seen = new Set<string>()
  const files: string[] = []
  for (const match of globSync(['**/*cordis*.yml', '**/*cordis*.yaml'], {
    cwd: root,
    exclude: ['.claude/**', 'node_modules/**', 'vendor/**', '**/*.i18n.yaml'],
  })) {
    const abs = resolve(root, match)
    const real = resolveCordisConfig(abs)
    if (real === undefined || seen.has(real)) continue
    seen.add(real)
    files.push(relative(root, real))
  }
  return files.sort()
}

/**
 * Resolve one discovered config path to its canonical file.
 *
 * A real symlink resolves through `realpath`. Git materializes a symlink as a
 * plain file holding the single-line relative target when `core.symlinks` is
 * false (the Windows default), so that case is resolved by hand. Any other
 * file resolves to itself.
 * @param abs - absolute path of one discovered config.
 * @returns the canonical absolute target, or undefined for a non-file.
 */
function resolveCordisConfig(abs: string): string | undefined {
  let isLink = false
  try {
    const stat = lstatSync(abs)
    if (stat.isSymbolicLink()) {
      isLink = true
    } else if (!stat.isFile()) {
      return undefined
    }
  } catch {
    return undefined
  }
  if (isLink) return realpathSync(abs)
  const source = readFileSync(abs, 'utf8').trim()
  // A git symlink pointer is a single relative path with no whitespace.
  if (source.length === 0 || /[\r\n]/.test(source)) return abs
  const target = resolve(dirname(abs), source)
  return existsSync(target) ? realpathSync(target) : abs
}

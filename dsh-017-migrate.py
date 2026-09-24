"""One-time settings migration for the NeoTech fork, DeepSeek Harness 0.1.5 -> 0.1.7.

0.1.7 changed where the desktop app reads the operator's settings:

  * `$DSH_HOME/.agent-presets/<id>/` is no longer scanned at all, so the
    `standard-hooks` preset (hook bridge + every MCP server) would vanish.
  * `$DSH_HOME/settings.yaml` is imported ONCE on first boot, renamed to
    `settings.yaml.imported`, and merged section by section into
    `$DSH_HOME/profiles/desktop/cordis.patch.yml`. A section whose name is not
    a plugin entry id, or that carries one non-editable key, is dropped whole.
  * `$DSH_HOME/cordis.patch.yml` (the home layer) is now read by the desktop
    app too, where 0.1.5 read it from the CLI only.
  * `$DSH_HOME/profiles/desktop` is now the plugin profile. The 0.1.5 runtime
    manifest sitting there would be kept as-is and list no bundles.

Verbs (all take --home, default DSH_HOME or ~/.dsh):

  stage  --out DIR   derive the migrated settings.yaml and home patch from the
                     LIVE files into DIR. Reads the live home, writes only DIR.
  apply  --staged DIR  back up the live files (*.pre-0.1.7), move the 0.1.5
                     runtime profile aside, write the staged files. Refuses
                     unless the 0.1.5 runtime profile is still present (so it
                     runs once), or --force.
  verify --staged DIR  after first 0.1.7 boot: every staged settings section
                     landed in the profile patch, and the home patch is the
                     staged one. Writes DIR/unimported.yaml holding only the
                     sections that did not land, for a repair pass.
  self-test          run stage/apply/verify against a scratch copy of a fake home.

Exit codes: 0 ok, 3 drift (verify found a section missing or a changed
file), 2 refused, 1 error. Nothing is ever deleted: every replaced file keeps a
`.pre-0.1.7` copy beside it.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

import yaml

MARK = '.pre-0.1.7'
OLD_RUNTIME_NAME = '@deepseek-ai/dsh-desktop-runtime'
RUNTIME_ASIDE = 'desktop.0.1.5-runtime'

# settings.yaml section -> 0.1.7 plugin entry id. Mirrors LEGACY_SECTION_ENTRIES in
# packages/settings/settings/src/index.ts plus the two renames 0.1.7 does NOT map.
SECTION_RENAMES = {'subagent-model-selection': 'subagent-model-selection-settings'}
SECTION_DROPS = {
    # The preset registry's `default` is not editable, and the hook bridge and MCP
    # rows move to root rows in the home patch, so the shipped `standard` preset
    # stays the default and keeps tracking upstream.
    'agent-presets',
}
LEGACY_SECTION_ENTRIES = {
    'ui-developer-tools': 'ui-settings',
    'ui-onboarding': 'ui-settings-general',
    'shell': 'pwsh-sandbox',
}
PRESET_DIR = Path('.agent-presets') / 'standard-hooks'
DESKTOP_GATE = """disabled: !!js "ctx.get('profileContext')?.name === 'desktop'\""""
CLI_ONLY_IDS = ('mcp-github', 'mcp-postgres')


class JsLoader(yaml.SafeLoader):
    """SafeLoader that keeps `!!js` scalars as tagged strings instead of failing."""


def _js(loader: yaml.SafeLoader, node: yaml.Node) -> str:
    return '!!js ' + str(loader.construct_scalar(node))


JsLoader.add_constructor('tag:yaml.org,2002:js', _js)


def load(text: str):
    return yaml.load(text, Loader=JsLoader)


def home_dir(value: str | None) -> Path:
    if value:
        return Path(value)
    env = (os.environ.get('DSH_HOME') or '').strip()
    return Path(env) if env else Path.home() / '.dsh'


def top_level_blocks(text: str) -> list[tuple[str | None, list[str]]]:
    """Split a YAML document into (top-level key, lines) blocks. Leading comments and
    blank lines attach to the block that follows them."""
    blocks: list[tuple[str | None, list[str]]] = []
    pending: list[str] = []
    for line in text.splitlines(keepends=True):
        m = re.match(r'^([A-Za-z0-9_.-]+):', line)
        if m:
            blocks.append((m.group(1), pending + [line]))
            pending = []
        elif blocks and not (line.strip() == '' or line.startswith('#')):
            # content of the current block: comments/blanks seen since belong to it too
            blocks[-1][1].extend(pending)
            pending = []
            blocks[-1][1].append(line)
        else:
            pending.append(line)
    if pending:
        blocks.append((None, pending))
    return blocks


def migrate_settings(text: str) -> tuple[str, dict]:
    """Rename and drop settings sections at the text level, so the comments survive in
    the `.imported` copy 0.1.7 keeps. Returns the new text and a plan."""
    out: list[str] = []
    plan = {'renamed': {}, 'dropped': [], 'kept': []}
    for key, lines in top_level_blocks(text):
        if key in SECTION_DROPS:
            plan['dropped'].append(key)
            continue
        if key in SECTION_RENAMES:
            new = SECTION_RENAMES[key]
            lines = [re.sub(r'^' + re.escape(key) + r':', new + ':', l, count=1) if re.match(r'^' + re.escape(key) + r':', l) else l
                     for l in lines]
            plan['renamed'][key] = new
            plan['kept'].append(new)
        elif key is not None:
            plan['kept'].append(key)
        out.extend(lines)
    new_text = ''.join(out)
    before, after = load(text) or {}, load(new_text) or {}
    expected = {SECTION_RENAMES.get(k, k): v for k, v in before.items() if k not in SECTION_DROPS}
    if after != expected:
        raise RuntimeError('settings migration changed a value it should only have renamed or dropped')
    return new_text, plan


def preset_rows(preset_text: str) -> str:
    """Every row of the standard-hooks preset except the `cordis:include` of the shipped
    standard composition, which has no target on 0.1.7. Returned as text with comments."""
    rows = load(preset_text) or []
    if not isinstance(rows, list):
        raise RuntimeError('preset is not a row list')
    include_ids = [r.get('id') for r in rows if isinstance(r, dict) and r.get('name') == 'cordis:include']
    lines = preset_text.splitlines(keepends=True)
    starts = [i for i, l in enumerate(lines) if l.startswith('- ')]
    keep: list[str] = []
    # Header comment of the file itself is not carried; the new block has its own.
    for n, s in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        # a row's leading comments belong to it: walk back over comment/blank lines
        chunk = lines[s:end]
        m = re.match(r'^- id:\s*(\S+)', lines[s])
        row_id = m.group(1) if m else None
        if row_id in include_ids:
            # drop the include row and any trailing comments inside it
            continue
        keep.extend(chunk)
    body = ''.join(keep)
    # A bare `!!js process.env.X` yields undefined when X is missing, and env/header values
    # are string-typed, so one missing variable would refuse the whole row. The template
    # form always yields a string (same fix as the CLI rows on 2026-09-22).
    body = re.sub(r"!!js process\.env\.([A-Z0-9_]+)[ \t]*$",
                  lambda m: "!!js '`${process.env.%s ?? \"\"}`'" % m.group(1), body, flags=re.M)
    return body


def migrate_home_patch(home_text: str, preset_text: str) -> str:
    # 1. Keep the CLI-only rows CLI-only: the desktop app reads this file on 0.1.7.
    lines = home_text.splitlines(keepends=True)
    out: list[str] = []
    current: str | None = None
    for line in lines:
        m = re.match(r'^(\s*)- id:\s*(\S+)', line)
        if m:
            current = m.group(2)
        out.append(line)
        m2 = re.match(r'^(\s*)name:\s', line)
        if m2 and current in CLI_ONLY_IDS:
            out.append(f'{m2.group(1)}{DESKTOP_GATE}\n')
    text = ''.join(out)
    text = re.sub(r'^# MCP opt-ins for the DeepSeek Harness \*CLI\*\. NOT the desktop app\.',
                  '# Home layer ($DSH_HOME/cordis.patch.yml). Since 0.1.7 the DESKTOP app reads\n'
                  '# this file too (packages/boot/app-boot/src/profile-context.ts readProfilePatches),\n'
                  '# and it hot-reloads. The notes below describe 0.1.5 and are kept for history;\n'
                  '# the first two rows are gated off the desktop profile to keep them CLI-only.\n#\n'
                  '# (0.1.5 header) MCP opt-ins for the DeepSeek Harness *CLI*. NOT the desktop app.',
                  text, count=1, flags=re.M)
    if not text.endswith('\n'):
        text += '\n'
    # 2. The standard-hooks preset rows, now ROOT rows: a root row registers into the
    #    global tools layer and untagged event listeners, so it reaches every Agent of
    #    every preset, subagents included.
    rows = preset_rows(preset_text)
    block = ['\n',
             '# --- Migrated 0.1.7: the standard-hooks preset rows -------------------------\n',
             '# 0.1.7 no longer scans $DSH_HOME/.agent-presets, so the hook bridge and the MCP\n',
             '# servers that preset mounted live here as ROOT rows instead. The shipped\n',
             '# `standard` preset stays the default and tracks upstream by itself, which was\n',
             "# the preset's original 'include, do not copy' goal. Source of these rows:\n",
             f'# {PRESET_DIR.as_posix()}/agent.cordis.yml, derived by dsh-017-migrate.py.\n',
             '- insert:\n']
    for line in rows.splitlines(keepends=True):
        block.append(('    ' + line) if line.strip() else line)
    text += ''.join(block)
    if not text.endswith('\n'):
        text += '\n'
    return text


def validate_home_patch(text: str, preset_text: str) -> list[str]:
    ops = load(text)
    if not isinstance(ops, list):
        raise RuntimeError('home patch is not a patch-operation list')
    inserted = [r for op in ops for r in (op.get('insert') or [])]
    ids = [r.get('id') for r in inserted]
    want = [r['id'] for r in (load(preset_text) or []) if isinstance(r, dict) and r.get('name') != 'cordis:include']
    missing = [i for i in want if i not in ids]
    if missing:
        raise RuntimeError('migrated home patch lost preset rows: %s' % ', '.join(missing))
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        raise RuntimeError('migrated home patch has duplicate row ids: %s' % ', '.join(dup))
    for r in inserted:
        if r.get('id') in CLI_ONLY_IDS and 'desktop' not in str(r.get('disabled', '')):
            raise RuntimeError('%s is not gated off the desktop profile' % r.get('id'))
    return ids


def stage(home: Path, out: Path) -> dict:
    settings = home / 'settings.yaml'
    patch = home / 'cordis.patch.yml'
    preset = home / PRESET_DIR / 'agent.cordis.yml'
    for p in (settings, patch, preset):
        if not p.is_file():
            raise FileNotFoundError(p)
    out.mkdir(parents=True, exist_ok=True)
    s_text, plan = migrate_settings(settings.read_text(encoding='utf-8'))
    preset_text = preset.read_text(encoding='utf-8')
    h_text = migrate_home_patch(patch.read_text(encoding='utf-8'), preset_text)
    ids = validate_home_patch(h_text, preset_text)
    (out / 'settings.yaml').write_text(s_text, encoding='utf-8', newline='\n')
    (out / 'cordis.patch.yml').write_text(h_text, encoding='utf-8', newline='\n')
    plan['home_patch_rows'] = ids
    plan['expected_entries'] = [LEGACY_SECTION_ENTRIES.get(k, k) for k in plan['kept']]
    (out / 'plan.json').write_text(json.dumps(plan, indent=2), encoding='utf-8')
    return plan


def old_runtime_present(home: Path) -> bool:
    pkg = home / 'profiles' / 'desktop' / 'package.json'
    try:
        return json.loads(pkg.read_text(encoding='utf-8')).get('name') == OLD_RUNTIME_NAME
    except (OSError, ValueError):
        return False


def backup(path: Path) -> None:
    if path.exists():
        dest = path.with_name(path.name + MARK)
        if dest.exists():
            raise FileExistsError(f'{dest} already exists; refusing to overwrite an earlier backup')
        shutil.copy2(path, dest)


def apply(home: Path, staged: Path, force: bool) -> str:
    if not old_runtime_present(home) and not force:
        return 'SKIPPED: no 0.1.5 runtime profile at profiles/desktop, so this home is already migrated'
    for name in ('settings.yaml', 'cordis.patch.yml'):
        if not (staged / name).is_file():
            raise FileNotFoundError(staged / name)
    backup(home / 'settings.yaml')
    backup(home / 'cordis.patch.yml')
    runtime = home / 'profiles' / 'desktop'
    if old_runtime_present(home):
        aside = home / 'profiles' / RUNTIME_ASIDE
        if aside.exists():
            raise FileExistsError(f'{aside} already exists')
        runtime.rename(aside)
    shutil.copyfile(staged / 'settings.yaml', home / 'settings.yaml')
    shutil.copyfile(staged / 'cordis.patch.yml', home / 'cordis.patch.yml')
    return 'APPLIED'


def _find_entry(node, entry: str):
    """Find the mapping for entry `entry` anywhere in a parsed Loader patch."""
    if isinstance(node, dict):
        if node.get('id') == entry:
            return node
        for v in node.values():
            hit = _find_entry(v, entry)
            if hit is not None:
                return hit
    elif isinstance(node, list):
        for v in node:
            hit = _find_entry(v, entry)
            if hit is not None:
                return hit
    return None


def verify(home: Path, staged: Path, profile: str = 'desktop') -> tuple[int, list[str]]:
    report: list[str] = []
    drift = False
    staged_settings = load((staged / 'settings.yaml').read_text(encoding='utf-8')) or {}
    live_settings = home / 'settings.yaml'
    imported = home / 'settings.yaml.imported'
    if live_settings.exists():
        drift = True
        report.append('NOT IMPORTED: settings.yaml is still present, so the first-boot import has not run')
    if not imported.exists():
        drift = True
        report.append('MISSING: settings.yaml.imported')
    profile_patch = home / 'profiles' / profile / 'cordis.patch.yml'
    patch = load(profile_patch.read_text(encoding='utf-8')) if profile_patch.exists() else None
    unimported: dict = {}
    for section, values in staged_settings.items():
        entry = LEGACY_SECTION_ENTRIES.get(section, section)
        row = _find_entry(patch, entry) if patch is not None else None
        config = (row or {}).get('config') if isinstance(row, dict) else None
        keys = list(values.keys()) if isinstance(values, dict) else []
        lost = [k for k in keys if not isinstance(config, dict) or k not in config]
        if row is None or lost:
            drift = True
            unimported[section] = values
            report.append(f'NOT IMPORTED: {section} -> {entry}' + (f' (missing {", ".join(lost)})' if row is not None else ''))
        else:
            report.append(f'IMPORTED: {section} -> {entry} ({len(keys)} keys)')
    (staged / 'unimported.yaml').write_text(yaml.safe_dump(unimported, sort_keys=False) if unimported else '',
                                           encoding='utf-8')
    live_patch = home / 'cordis.patch.yml'
    if not live_patch.exists() or live_patch.read_bytes() != (staged / 'cordis.patch.yml').read_bytes():
        drift = True
        report.append('CHANGED: cordis.patch.yml differs from the staged home patch')
    else:
        report.append('MATCHES: cordis.patch.yml is the staged home patch')
    return (3 if drift else 0), report


def self_test() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        home = Path(tmp) / 'home'
        (home / PRESET_DIR).mkdir(parents=True)
        (home / 'profiles' / 'desktop').mkdir(parents=True)
        (home / 'profiles' / 'desktop' / 'package.json').write_text(json.dumps({'name': OLD_RUNTIME_NAME}))
        (home / 'settings.yaml').write_text(
            '# top comment\nui-onboarding:\n  welcomeNoticeVersion: "1"\n'
            'agent-presets:\n  default: standard-hooks\n'
            '# a note\nsubagent-model-selection:\n  enabled: true\n  allowedModels:\n    - a\n'
            'permission:\n  defaultPreset: full\n', encoding='utf-8')
        (home / 'cordis.patch.yml').write_text(
            '# MCP opt-ins for the DeepSeek Harness *CLI*. NOT the desktop app.\n- insert:\n'
            '    - id: mcp-github\n      name: x\n      config: {}\n'
            '    - id: mcp-postgres\n      name: y\n      config: {}\n', encoding='utf-8')
        (home / PRESET_DIR / 'agent.cordis.yml').write_text(
            '# header\n- id: base-standard\n  name: cordis:include\n  config:\n    path: file:///x\n\n'
            '# bridge\n- id: hooks-claude-code\n  name: h\n  config:\n    configPath: c\n\n'
            '- id: mcp-memory\n  name: m\n  config:\n    env:\n      K: !!js process.env.K\n', encoding='utf-8')
        out = Path(tmp) / 'staged'
        plan = stage(home, out)
        assert plan['dropped'] == ['agent-presets'], plan
        assert plan['renamed'] == {'subagent-model-selection': 'subagent-model-selection-settings'}, plan
        staged_patch = (out / 'cordis.patch.yml').read_text(encoding='utf-8')
        assert '${process.env.K ?? ""}' in staged_patch, staged_patch
        assert 'cordis:include' not in staged_patch
        assert apply(home, out, False) == 'APPLIED'
        assert (home / 'settings.yaml.pre-0.1.7').exists() and (home / 'profiles' / RUNTIME_ASIDE).exists()
        assert apply(home, out, False).startswith('SKIPPED')
        # simulate the first boot import
        (home / 'settings.yaml').rename(home / 'settings.yaml.imported')
        (home / 'profiles' / 'desktop').mkdir()
        (home / 'profiles' / 'desktop' / 'cordis.patch.yml').write_text(
            '- insert: []\n- id: ui-settings-general\n  config:\n    welcomeNoticeVersion: "1"\n'
            '- id: subagent-model-selection-settings\n  config:\n    enabled: true\n    allowedModels: [a]\n',
            encoding='utf-8')
        code, report = verify(home, out)
        assert code == 3 and any('NOT IMPORTED: permission' in r for r in report), report
        assert 'permission' in (out / 'unimported.yaml').read_text(encoding='utf-8')
        with (home / 'profiles' / 'desktop' / 'cordis.patch.yml').open('a', encoding='utf-8') as f:
            f.write('- id: permission\n  config:\n    defaultPreset: full\n')
        code, report = verify(home, out)
        assert code == 0, report
    print('self-test OK')
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('verb', choices=['stage', 'apply', 'verify', 'self-test'])
    ap.add_argument('--home')
    ap.add_argument('--out')
    ap.add_argument('--staged')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--profile', default='desktop', help='verify: profile whose patch received the import')
    a = ap.parse_args(argv)
    try:
        if a.verb == 'self-test':
            return self_test()
        home = home_dir(a.home)
        if a.verb == 'stage':
            plan = stage(home, Path(a.out))
            print(json.dumps(plan, indent=2))
            return 0
        if a.verb == 'apply':
            result = apply(home, Path(a.staged), a.force)
            print(result)
            return 0
        code, report = verify(home, Path(a.staged), a.profile)
        for line in report:
            print(line)
        return code
    except (FileExistsError, FileNotFoundError) as e:
        print(f'REFUSED: {e}', file=sys.stderr)
        return 2
    except Exception as e:  # noqa: BLE001 - one plain line for the install script
        print(f'ERROR: {e}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

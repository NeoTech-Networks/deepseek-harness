#!/usr/bin/env python
"""Re-derive the operator's pinned "Standard + Claude Code hooks" preset.

WHY THIS EXISTS
---------------
`~/.dsh/cordis.patch.yml` holds its own copy of the standard agent preset, under
row id `preset-standard-hooks` (config id `standard-hooks`). That copy is a
SNAPSHOT: it does not track upstream by itself. Left alone across an upstream
release it silently drifts, and nothing complains, because a preset that is
merely out of date still loads.

Measured at the 0.2.0-rc.2 -> 0.2.1-rc.2 port (2026-10-17), comparing the pinned
copy against `packages/bundle/web-app/presets/standard.patch.yml` at the new tag:

  missing three rows the new standard ships:
      time-context, tool-schedule, tool-plugin-market
  still carried three things upstream had since removed or reworded:
      persona.config.suffix                 (removed upstream)
      delegation tool-subagent.backgroundMode: continuable   (removed upstream)
      the older plan-mode section wording   (reworded upstream)

So a re-derive is required whenever that comparison is not a no-op. This script
performs it as a SURGICAL TEXT EDIT, never a YAML round-trip: the file is 21 KB
of load-bearing commentary and carries `!!js` tags (for example
`disabled: !!js process.platform === 'win32'`) that a parse-and-dump would
destroy. It copies the shipped `plugins:` block verbatim, at the same
indentation, and changes exactly one value on the way through.

THE ONE DELIBERATE DIFFERENCE
-----------------------------
`agent-instructions.maxBytes` stays 131072, not the shipped 65536. That is what
keeps the operator's global ~/.claude/CLAUDE.md rules loaded; restoring the
shipped default silently drops them (DeepSeek Harness error ledger 31 and 47).

The preset's identity fields are preserved as they are: row id
`preset-standard-hooks`, config id `standard-hooks`, its name, description and
order. Only `config.plugins` is replaced.

USAGE
    py dsh-preset-rederive.py --check          # report only, changes nothing
    py dsh-preset-rederive.py                  # apply (app must be closed)
    py dsh-preset-rederive.py --force          # apply even if the app is running

Exit codes
    0  applied, or --check found nothing to change
    2  usage or environment error
    3  --check found the pinned copy out of date
    4  refused: the app is running (close it first, or pass --force)
"""
from __future__ import annotations

import argparse
import difflib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

PS = "        "                 # indent of `plugins:` in both files (8 spaces)
ROW_ID = "preset-standard-hooks"
CHILD = PS + "  "               # indent of `- id:` entries under plugins
MAXBYTES_OLD = CHILD + "    maxBytes: 65536"
MAXBYTES_NEW = (
    CHILD + "    maxBytes: 131072  # raised from 65536 (2026-09-24): the 48 KB global AGENTS.md"
    " plus a repo's own files overran 64 KB and the global rules were silently dropped"
)


def dsh_home() -> Path:
    return Path(os.environ.get("DSH_HOME") or (Path.home() / ".dsh"))


def app_running() -> bool:
    """True when a DeepSeek Harness process is alive."""
    try:
        out = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "@(Get-Process -Name 'DeepSeek Harness' -ErrorAction SilentlyContinue).Count"],
            capture_output=True, text=True, timeout=30,
        )
        return out.stdout.strip().isdigit() and int(out.stdout.strip()) > 0
    except Exception:
        return False


def plugins_start(lines: list[str], path: Path) -> int:
    """Index of the single top-level `        plugins:` line."""
    hits = [i for i, line in enumerate(lines) if line == PS + "plugins:"]
    if len(hits) != 1:
        raise SystemExit(f"{path}: expected exactly one '{PS}plugins:' line, found {len(hits)}")
    return hits[0]


def shipped_block(source: Path) -> list[str]:
    """The shipped preset's plugins block, verbatim, with the maxBytes override applied."""
    lines = source.read_text(encoding="utf-8").split("\n")
    start = plugins_start(lines, source)
    block = lines[start:]
    # Drop trailing blank lines; the caller re-adds one final newline.
    while block and block[-1].strip() == "":
        block.pop()
    if MAXBYTES_OLD not in block:
        raise SystemExit(
            f"{source}: expected '{MAXBYTES_OLD.strip()}' in the shipped preset; "
            "upstream changed the agent-instructions row, so update this script's constant."
        )
    block = [MAXBYTES_NEW if line == MAXBYTES_OLD else line for line in block]
    return block


def row_ids(block: list[str]) -> list[str]:
    out = []
    for line in block:
        s = line.strip()
        if s.startswith("- id:"):
            out.append(s.split(":", 1)[1].strip())
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--home", default=None, help="DSH_HOME (default: $DSH_HOME or ~/.dsh)")
    ap.add_argument("--source", default=None,
                    help="shipped standard.patch.yml (default: <repo>/packages/bundle/web-app/presets/standard.patch.yml)")
    ap.add_argument("--check", action="store_true", help="report only; change nothing")
    ap.add_argument("--force", action="store_true", help="apply even while the app is running")
    args = ap.parse_args()

    home = Path(args.home) if args.home else dsh_home()
    target = home / "cordis.patch.yml"
    if not target.is_file():
        print(f"error: no home patch at {target}", file=sys.stderr)
        return 2

    source = Path(args.source) if args.source else (
        Path(__file__).resolve().parent
        / "packages" / "bundle" / "web-app" / "presets" / "standard.patch.yml"
    )
    if not source.is_file():
        print(f"error: no shipped preset at {source}", file=sys.stderr)
        return 2

    new_block = shipped_block(source)
    current_lines = target.read_text(encoding="utf-8").split("\n")

    # Locate the operator's pinned preset row, then its plugins block.
    row_at = [i for i, line in enumerate(current_lines) if line.strip() == f"- id: {ROW_ID}"]
    if len(row_at) != 1:
        print(f"error: expected exactly one '{ROW_ID}' row in {target}, found {len(row_at)}", file=sys.stderr)
        return 2
    start = next((i for i in range(row_at[0], len(current_lines)) if current_lines[i] == PS + "plugins:"), None)
    if start is None:
        print(f"error: no '{PS}plugins:' block under {ROW_ID}", file=sys.stderr)
        return 2
    old_block = [line for line in current_lines[start:] if line.strip() != ""]
    # Compare like for like: the shipped block keeps its blank lines, the
    # current one was just filtered, so blank lines would otherwise always read
    # as a difference and --check could never report "up to date".
    shipped_block_nonblank = [line for line in new_block if line.strip() != ""]

    old_ids, new_ids = row_ids(old_block), row_ids(new_block)
    added = [i for i in new_ids if i not in old_ids]
    removed = [i for i in old_ids if i not in new_ids]
    same = not added and not removed and old_block == shipped_block_nonblank

    # Every row in the source must carry an id, or the comparison above is blind.
    if len(new_ids) < 10:
        print(f"error: parsed only {len(new_ids)} rows from {source}; refusing to act", file=sys.stderr)
        return 2

    if args.check:
        print(f"pinned preset : {target}  row {ROW_ID}")
        print(f"shipped preset: {source}")
        print(f"rows: pinned {len(old_ids)}, shipped {len(new_ids)}")
        print(f"  add   : {', '.join(added) if added else '(none)'}")
        print(f"  remove: {', '.join(removed) if removed else '(none)'}")
        if same:
            print("verdict: up to date; nothing to change")
            return 0
        diff = difflib.unified_diff(old_block, new_block, "pinned", "shipped", lineterm="", n=1)
        shown = [line for line in diff if line.startswith(("+", "-")) and not line.startswith(("+++", "---"))]
        print(f"verdict: OUT OF DATE ({len(shown)} differing line(s))")
        for line in shown[:40]:
            print("   ", line)
        if len(shown) > 40:
            print(f"    ... {len(shown) - 40} more")
        return 3

    if same:
        print("up to date; nothing written")
        return 0

    if app_running() and not args.force:
        print("refused: DeepSeek Harness is running and hot-reloads this file.", file=sys.stderr)
        print("close the app, or pass --force if you know the app is about to restart anyway.", file=sys.stderr)
        return 4

    backup = target.with_name(target.name + ".pre-0.2.1")
    shutil.copy2(target, backup)

    out = current_lines[:start] + new_block + [""]
    tmp = target.with_name(target.name + ".tmp")
    tmp.write_text("\n".join(out), encoding="utf-8", newline="\n")
    os.replace(tmp, target)

    print(f"rewrote {target} (backup: {backup.name})")
    print(f"  rows now: {len(new_ids)}")
    print(f"  added   : {', '.join(added) if added else '(none)'}")
    print(f"  removed : {', '.join(removed) if removed else '(none)'}")
    print(f"  kept    : agent-instructions.maxBytes = 131072")

    # A parse proves the file still loads and the override survived.
    try:
        import yaml

        class L(yaml.SafeLoader):
            pass

        L.add_multi_constructor("tag:yaml.org,2002:js", lambda loader, suffix, node: f"<js:{suffix}>")
        L.add_multi_constructor("", lambda loader, suffix, node: f"<tag:{suffix}>")
        doc = yaml.load(target.read_text(encoding="utf-8"), Loader=L)
        preset = next(
            (e for row in doc for e in (row.get("insert") or [])
             if isinstance(e, dict) and e.get("id") == ROW_ID), None,
        )
        if preset is None:
            raise SystemExit("post-write check failed: preset row disappeared")
        plugs = preset["config"]["plugins"]
        mb = next(p for p in plugs if p.get("id") == "agent-instructions")["config"]["maxBytes"]
        js = next((p.get("disabled") for p in plugs if p.get("id") == "tool-bash"), None)
        print(f"post-write check: parses, {len(plugs)} rows, maxBytes={mb}, tool-bash disabled={js!r}")
        if mb != 131072:
            print("error: maxBytes override did not survive", file=sys.stderr)
            return 2
    except ImportError:
        print("post-write check skipped: PyYAML not importable")

    return 0


if __name__ == "__main__":
    sys.exit(main())

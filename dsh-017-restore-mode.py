"""Put the operator's 'Standard + Claude Code hooks' mode back on 0.1.7.

0.1.7 no longer scans $DSH_HOME/.agent-presets, so the standard-hooks preset
vanished from the mode picker. Its hook bridge and MCP rows already live as ROOT
rows in the home patch (they reach every mode), so the mode itself only needs the
standard plugin list under its own id, name and description. That list is copied
from the shipped standard preset of the SAME build, so the two are identical today.
"""
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, r"C:/d17")
import importlib.util

spec = importlib.util.spec_from_file_location("mig", r"C:/d17/dsh-017-migrate.py")
mig = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mig)

home = Path.home() / ".dsh"
shipped = Path(r"C:/d17/packages/bundle/web-app/presets/standard.patch.yml").read_text(encoding="utf-8")
preset_yml = mig.load((home / ".agent-presets" / "standard-hooks" / "preset.yml").read_text(encoding="utf-8"))

# Body of the shipped row, from its `- insert:` down.
start = shipped.index("- insert:")
body = shipped[start:]
assert body.count("id: preset-standard\n") == 1
body = body.replace("    - id: preset-standard\n", "    - id: preset-standard-hooks\n", 1)
body, n = re.subn(r"^(        )id: standard\n", r"\1id: standard-hooks\n", body, count=1, flags=re.M)
assert n == 1
desc = " ".join(str(preset_yml["description"]).split())
body, n = re.subn(r"^(        )order: 1\n",
                  "\\1name: '" + preset_yml["name"].replace("'", "''") + "'\n"
                  "\\1description: '" + desc.replace("'", "''") + "'\n"
                  "\\1order: 0\n", body, count=1, flags=re.M)
assert n == 1

block = (
    "\n# --- The operator's own mode: Standard + Claude Code hooks (restored 2026-09-24) ----\n"
    "# 0.1.7 stopped scanning $DSH_HOME/.agent-presets, so this mode disappeared from the\n"
    "# picker. Its plugin list is the shipped `standard` preset's list, copied from the\n"
    "# same 0.1.7-rc.1 build; the hook bridge and MCP servers are the ROOT rows above,\n"
    "# so they reach this mode and every other. A harness update that changes the\n"
    "# shipped standard list does NOT flow into this copy: re-derive it on update.\n"
    + body
)
patch_path = home / "cordis.patch.yml"
text = patch_path.read_text(encoding="utf-8")
if "id: preset-standard-hooks" in text:
    sys.exit("already restored")
new_text = text.rstrip("\n") + "\n" + block
ops = mig.load(new_text)
rows = [r for op in ops for r in (op.get("insert") or [])]
mode = [r for r in rows if r.get("id") == "preset-standard-hooks"]
assert len(mode) == 1 and mode[0]["config"]["id"] == "standard-hooks" and mode[0]["config"]["order"] == 0
shipped_rows = [r for op in mig.load(shipped) for r in (op.get("insert") or [])]
assert mode[0]["config"]["plugins"] == shipped_rows[0]["config"]["plugins"], "plugin list differs from shipped standard"

shutil.copy2(patch_path, patch_path.with_name("cordis.patch.yml.bak-before-mode-restore"))
patch_path.write_text(new_text, encoding="utf-8", newline="\n")

# Default mode: the registry's volatile selectedDefault, in the PROFILE patch the Settings
# screen owns. `config` replaces wholesale, so the required `default` is restated.
profile = home / "profiles" / "desktop" / "cordis.patch.yml"
ptext = profile.read_text(encoding="utf-8")
if "id: agent-preset-registry" not in ptext:
    shutil.copy2(profile, profile.with_name("cordis.patch.yml.bak-before-mode-restore"))
    ptext = ptext.rstrip("\n") + (
        "\n- id: agent-preset-registry\n"
        "  name: \"@deepseek-ai/dsh-agent-preset-registry\"\n"
        "  config:\n"
        "    default: standard\n"
        "    selectedDefault: standard-hooks\n"
    )
    mig.load(ptext)
    profile.write_text(ptext, encoding="utf-8", newline="\n")
print("restored: mode standard-hooks (", len(mode[0]["config"]["plugins"]), "plugins ), default selected")

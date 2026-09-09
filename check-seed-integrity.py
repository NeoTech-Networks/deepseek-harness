"""Verify the installed DeepSeek Harness seed matches its own integrity.json.

Mirrors verifySeedIntegrity() in apps/desktop/src/project-manager.ts, which
compares the ENTIRE on-disk file set against the manifest. An extra file fails
the check just as hard as a missing or corrupt one, so a silent reinstall over
a previous release leaves the app unable to start.

Exit 0 = clean, exit 1 = the app will refuse to boot.
"""
import hashlib
import json
import os
import sys

DEFAULT_SEED = (
    r"C:\Users\SteveDempsey\AppData\Local\Programs"
    r"\DeepSeek Harness\resources\seed"
)


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SEED
    manifest = os.path.join(root, "integrity.json")
    if not os.path.isfile(manifest):
        print("FAIL: no integrity.json at " + root)
        return 1

    with open(manifest, encoding="utf-8") as fh:
        expected = {
            f["path"]: (f["bytes"], f["sha256"])
            for f in json.load(fh)["files"]
        }

    actual = {}
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, root).replace("\\", "/")
            if rel == "integrity.json":
                continue
            with open(path, "rb") as fh:
                blob = fh.read()
            actual[rel] = (len(blob), hashlib.sha256(blob).hexdigest())

    extra = sorted(set(actual) - set(expected))
    missing = sorted(set(expected) - set(actual))
    mismatch = sorted(k for k in set(actual) & set(expected)
                      if actual[k] != expected[k])

    print("expected %d, actual %d" % (len(expected), len(actual)))
    print("extra %d, missing %d, mismatch %d"
          % (len(extra), len(missing), len(mismatch)))

    if not (extra or missing or mismatch):
        print("PASS: seed integrity clean")
        return 0

    for label, items in (("EXTRA", extra), ("MISSING", missing),
                         ("MISMATCH", mismatch)):
        for rel in items[:10]:
            print("  %s %s" % (label, rel))
        if len(items) > 10:
            print("  %s ... and %d more" % (label, len(items) - 10))
    print("FAIL: the app will refuse to start with this seed")
    return 1


if __name__ == "__main__":
    sys.exit(main())

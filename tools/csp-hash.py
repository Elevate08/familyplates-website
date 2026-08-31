#!/usr/bin/env python3
"""Keep the CSP script-src hash in sync with the inline <script> in index.html.

The Content-Security-Policy meta tag in index.html allowlists the inline
theme-init script by SHA-256. Editing that script — including its indentation
or line endings — invalidates the hash, and the browser then silently blocks
it: the page still renders, but the saved theme stops applying on first paint.

Usage:
    ./tools/csp-hash.py            # same as --check
    ./tools/csp-hash.py --check    # exit 1 if the CSP is stale
    ./tools/csp-hash.py --write    # rewrite the CSP with the current hashes
"""

import argparse
import base64
import hashlib
import re
import sys
from pathlib import Path

HTML = Path(__file__).resolve().parent.parent / "index.html"

# Inline scripts only: a <script> tag with no src= attribute.
INLINE_SCRIPT = re.compile(rb"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", re.S)
# The script-src directive inside the CSP meta tag.
SCRIPT_SRC = re.compile(r"(script-src\s+'self')((?:\s+'sha256-[A-Za-z0-9+/=]+')*)", re.S)


def inline_hashes(raw: bytes) -> list[str]:
    """SHA-256 of each inline script body, base64-encoded, as CSP source values."""
    return [
        "'sha256-%s'" % base64.b64encode(hashlib.sha256(body).digest()).decode()
        for body in INLINE_SCRIPT.findall(raw)
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="update index.html in place")
    parser.add_argument("--check", action="store_true", help="verify only (default)")
    args = parser.parse_args()

    raw = HTML.read_bytes()
    text = raw.decode("utf-8")

    expected = inline_hashes(raw)
    if not expected:
        print("no inline <script> found — nothing to hash", file=sys.stderr)
        return 1

    match = SCRIPT_SRC.search(text)
    if not match:
        print("could not find a script-src directive in index.html", file=sys.stderr)
        return 1

    present = re.findall(r"'sha256-[A-Za-z0-9+/=]+'", match.group(2))
    if present == expected:
        print("CSP script-src hash is current: %s" % " ".join(expected))
        return 0

    print("CSP script-src is STALE")
    print("  in index.html: %s" % (" ".join(present) or "(none)"))
    print("  computed:      %s" % " ".join(expected))

    if not args.write:
        print("\nrerun with --write to fix", file=sys.stderr)
        return 1

    updated = text[: match.start()] + match.group(1) + " " + " ".join(expected) + text[match.end():]
    HTML.write_text(updated, encoding="utf-8")
    print("\nindex.html updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Fail if any page (or variations/data.js) links a local file that doesn't exist, or the home page pulls in a heavy asset.

Run: python3 scripts/check_site.py
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAX_HOME_ASSET = 5_000_000  # bytes; convert GIFs to MP4 and resize photos past this
REF = re.compile(r'(?:src|href|poster|content)="([^"#?]+)')


def local_refs(html):
    for ref in REF.findall(html):
        ref = ref.removeprefix("https://jamesponwith.github.io/")
        if not re.search(r"^(?:[a-z]+:|//)|\s|\$\{", ref) and "." in ref.rsplit("/", 1)[-1]:
            yield ref


def problems():
    pages = [*ROOT.glob("*.html"), *ROOT.glob("variations/**/index.html"), ROOT / "theory-simulations/index.html"]
    for page in sorted(pages):
        name = page.relative_to(ROOT).as_posix()
        for ref in sorted(set(local_refs(page.read_text(encoding="utf-8")))):
            path = ROOT / ref.lstrip("/") if ref.startswith("/") else page.parent / ref
            if not path.is_file():
                yield f"{name}: missing {ref}"
            elif name == "index.html" and path.stat().st_size > MAX_HOME_ASSET:
                yield f"{name}: {ref} is {path.stat().st_size / 1e6:.1f} MB"
    data = (ROOT / "variations/data.js").read_text(encoding="utf-8")
    for ref in sorted(set(re.findall(r"'(/[^'\s]*)'", data))):
        if not (ROOT / ref.lstrip("/")).exists():
            yield f"variations/data.js: missing {ref}"


if __name__ == "__main__":
    found = list(problems())
    print("\n".join(found) or "ok")
    sys.exit(1 if found else 0)

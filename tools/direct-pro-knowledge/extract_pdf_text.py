#!/usr/bin/env python3
"""Extract text from PDFs in a Direct.Pro source pack into a gitignored folder.

Usage:
    .venv-pdf/bin/python tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>

Reads:  knowledge/drafts/<pack-id>/inputs/*.pdf  (gitignored; can be symlinks)
Writes: knowledge/drafts/<pack-id>/extracted/<basename>.txt  (gitignored)

Per the source-pack workflow (see tools/direct-pro-knowledge/README.md), this
script is a "manual PDF drop" extractor: raw output stays under
knowledge/drafts/ and is never committed.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import fitz  # type: ignore[import-untyped]  # PyMuPDF


def extract_pdf(pdf_path: Path, out_path: Path) -> tuple[int, int]:
    """Extract text from a PDF; return (pages, chars)."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    chars = 0
    with fitz.open(pdf_path) as doc, out_path.open("w", encoding="utf-8") as out:
        out.write(f"# Source: {pdf_path.name}\n")
        out.write(f"# Pages: {doc.page_count}\n\n")
        for i, page in enumerate(doc, start=1):
            text = page.get_text("text")
            out.write(f"\n----- page {i} -----\n")
            out.write(text)
            chars += len(text)
        return doc.page_count, chars


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pack_id", help="source-pack id, e.g. campaign-types-v1")
    parser.add_argument(
        "--repo-root",
        default=str(Path(__file__).resolve().parents[2]),
        help="repository root (default: parent of tools/)",
    )
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    inputs = repo_root / "knowledge" / "drafts" / args.pack_id / "inputs"
    extracted = repo_root / "knowledge" / "drafts" / args.pack_id / "extracted"

    if not inputs.is_dir():
        print(f"ERROR: inputs directory not found: {inputs}", file=sys.stderr)
        return 1

    pdfs = sorted(p for p in inputs.iterdir() if p.suffix.lower() == ".pdf")
    if not pdfs:
        print(f"ERROR: no PDFs in {inputs}", file=sys.stderr)
        return 1

    extracted.mkdir(parents=True, exist_ok=True)
    print(f"Extracting {len(pdfs)} PDF(s) -> {extracted}")
    total_chars = 0
    for pdf in pdfs:
        out_path = extracted / (pdf.stem + ".txt")
        try:
            pages, chars = extract_pdf(pdf, out_path)
        except Exception as exc:  # noqa: BLE001
            print(f"  FAIL {pdf.name}: {exc}", file=sys.stderr)
            continue
        total_chars += chars
        print(f"  OK   {pdf.name} -> {out_path.name} ({pages} pages, {chars} chars)")
    print(f"Total chars extracted: {total_chars}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

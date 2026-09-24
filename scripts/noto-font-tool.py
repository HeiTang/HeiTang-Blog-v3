#!/usr/bin/env python3
"""Verify or regenerate the site's Noto Sans TC variable WOFF2 subset."""

from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import sys
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT_BLOB_SHA = "82943579ad39c281212df8f14ac999824694a6ab"
FONT_BLOB_URL = f"https://api.github.com/repos/google/fonts/git/blobs/{FONT_BLOB_SHA}"
TRACKED_RANGES = (
    (0x3000, 0x30FF),
    (0x3100, 0x312F),
    (0x3400, 0x4DBF),
    (0x4E00, 0x9FFF),
    (0xF900, 0xFAFF),
    (0x20000, 0x2FA1F),
)
MAX_ADDED_CODEPOINTS = 5000


def is_tracked(codepoint: int) -> bool:
    return any(start <= codepoint <= end for start, end in TRACKED_RANGES)


def parse_codepoint(value: object) -> int:
    if not isinstance(value, str) or not value.startswith("U+"):
        raise ValueError(f"Invalid code point: {value!r}")
    try:
        codepoint = int(value[2:], 16)
    except ValueError as error:
        raise ValueError(f"Invalid code point: {value!r}") from error
    if not is_tracked(codepoint) or codepoint > 0x10FFFF:
        raise ValueError(f"Code point outside tracked ranges: {value}")
    return codepoint


def read_coverage(path: Path) -> set[int]:
    return {
        ord(character)
        for character in path.read_text(encoding="utf-8")
        if is_tracked(ord(character))
    }


def cmap_codepoints(font: TTFont) -> set[int]:
    return {
        codepoint
        for table in font["cmap"].tables
        for codepoint in table.cmap
    }


def check_weight_axis(font: TTFont) -> dict[str, float]:
    if "fvar" not in font:
        raise ValueError("Noto Sans TC subset is not variable: fvar table is missing.")
    axis = next((item for item in font["fvar"].axes if item.axisTag == "wght"), None)
    if axis is None or axis.minValue != 100 or axis.maxValue != 900:
        raise ValueError("Noto Sans TC subset must retain the wght axis from 100 to 900.")
    return {
        "min": float(axis.minValue),
        "default": float(axis.defaultValue),
        "max": float(axis.maxValue),
    }


def write_report(path: Path | None, report: dict[str, object]) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"schemaVersion": 1, **report}, ensure_ascii=False, indent=2) + "\n")


def verify(args: argparse.Namespace) -> int:
    try:
        coverage = read_coverage(args.coverage)
        font = TTFont(args.font, recalcTimestamp=False)
        weight_axis = check_weight_axis(font)
        missing = sorted(coverage - cmap_codepoints(font))
        report = {
            "status": "missing" if missing else "ok",
            "coverageCount": len(coverage),
            "fontCodePointCount": len(cmap_codepoints(font)),
            "weightAxis": weight_axis,
            "missing": [f"U+{codepoint:04X}" for codepoint in missing],
        }
        write_report(args.report, report)
        if missing:
            print("WOFF2 cmap is missing coverage code points: " + ", ".join(report["missing"]), file=sys.stderr)
            return 1
        print(f"WOFF2 cmap OK: {len(coverage)} covered code points; wght 100–900.")
        return 0
    except Exception as error:  # The report is consumed by a separate trust boundary.
        write_report(args.report, {"status": "error", "error": str(error)[:1000], "missing": []})
        print(f"WOFF2 cmap check failed: {error}", file=sys.stderr)
        return 1


def download_source() -> bytes:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "HeiTang-Blog-font-subset-check",
    }
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(
        FONT_BLOB_URL,
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        blob = json.loads(response.read())
    if blob.get("sha") != FONT_BLOB_SHA or blob.get("encoding") != "base64":
        raise ValueError("Google Fonts returned an unexpected source blob.")
    source = base64.b64decode(blob["content"], validate=False)
    git_sha = hashlib.sha1(f"blob {len(source)}\0".encode() + source).hexdigest()
    if git_sha != FONT_BLOB_SHA:
        raise ValueError("Pinned Google Fonts source failed its Git blob SHA-1 check.")
    return source


def generate(args: argparse.Namespace) -> int:
    coverage_path = args.coverage
    additions = json.loads(args.codepoints.read_text(encoding="utf-8"))
    if not isinstance(additions, list) or not additions or len(additions) > MAX_ADDED_CODEPOINTS:
        raise ValueError(f"Expected 1–{MAX_ADDED_CODEPOINTS} added code points.")

    old_coverage = read_coverage(coverage_path)
    added = {parse_codepoint(value) for value in additions}
    target = old_coverage | added

    source = download_source()
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    check_weight_axis(font)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=target)
    subsetter.subset(font)
    font.flavor = "woff2"

    output_cmap = cmap_codepoints(font)
    if not target <= output_cmap:
        missing = sorted(target - output_cmap)
        raise ValueError("Pinned font source lacks required code points: " + ", ".join(f"U+{cp:04X}" for cp in missing))
    check_weight_axis(font)
    args.font_output.parent.mkdir(parents=True, exist_ok=True)
    font.save(args.font_output, reorderTables=False)
    args.coverage_output.parent.mkdir(parents=True, exist_ok=True)
    args.coverage_output.write_text("".join(chr(codepoint) for codepoint in sorted(target)) + "\n", encoding="utf-8")
    print(f"Generated {args.font_output} with {len(target)} coverage code points.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    verify_parser = commands.add_parser("verify")
    verify_parser.add_argument("--font", type=Path, default=ROOT / "public/fonts/noto-sans-tc-site.woff2")
    verify_parser.add_argument("--coverage", type=Path, default=ROOT / "scripts/noto-sans-tc-site.coverage.txt")
    verify_parser.add_argument("--report", type=Path)
    generate_parser = commands.add_parser("generate")
    generate_parser.add_argument("--coverage", type=Path, required=True)
    generate_parser.add_argument("--codepoints", type=Path, required=True)
    generate_parser.add_argument("--font-output", type=Path, required=True)
    generate_parser.add_argument("--coverage-output", type=Path, required=True)
    args = parser.parse_args()
    if args.command == "verify":
        return verify(args)
    try:
        return generate(args)
    except Exception as error:
        print(f"Noto Sans TC subset generation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Draw the CodeWrangler icon: an open book, code on the left, prose on the right."""

import struct
import zlib
from pathlib import Path


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int, pixel) -> None:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixel(x, y))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def rounded_box(x, y, left, top, right, bottom, radius) -> bool:
    if x < left or x >= right or y < top or y >= bottom:
        return False
    cx = left + radius if x < left + radius else right - radius - 1 if x >= right - radius else x
    cy = top + radius if y < top + radius else bottom - radius - 1 if y >= bottom - radius else y
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius**2


def icon_pixel(x: int, y: int):
    size = 1024
    # Transparent outside a soft rounded squircle so the book reads on any dock.
    inset = 48
    if not rounded_box(x, y, inset, inset, size - inset, size - inset, 180):
        return (0, 0, 0, 0)

    cover = (26, 61, 52, 255)
    paper = (251, 246, 236, 255)
    ink = (36, 28, 20, 255)
    rule = (196, 164, 116, 255)
    ribbon = (122, 46, 42, 255)
    page_shadow = (232, 220, 200, 255)

    # Cover
    if not rounded_box(x, y, 96, 120, 928, 904, 72):
        return cover if rounded_box(x, y, inset, inset, size - inset, size - inset, 180) else (0, 0, 0, 0)

    # Pages
    if rounded_box(x, y, 140, 168, 884, 856, 36):
        # Gutter
        if 500 <= x <= 524:
            return (214, 196, 168, 255)
        if 486 <= x < 500 or 524 < x <= 538:
            return page_shadow
        # Ribbon
        if 470 <= x <= 554 and y >= 150:
            if y < 210 or (y > 780 and abs(x - 512) < 28):
                return ribbon
        # Left page marks, like short lines of code
        if 190 <= x <= 430 and y >= 280:
            lines = [300, 360, 420, 480, 540, 600]
            for index, line_y in enumerate(lines):
                width = 180 if index % 2 == 0 else 240
                if line_y <= y <= line_y + 16 and x <= 190 + width:
                    return ink if index != 2 else rule
        # Right page marks, like sentences
        if 590 <= x <= 830 and y >= 280:
            lines = [300, 352, 404, 456, 508, 560, 640, 692]
            for index, line_y in enumerate(lines):
                width = 220 if index % 3 else 150
                if line_y <= y <= line_y + 12 and x <= 590 + width:
                    return rule if index < 2 else ink
        return paper

    return cover


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    write_png(root / "build" / "icon.png", 1024, icon_pixel)
    print(root / "build" / "icon.png")

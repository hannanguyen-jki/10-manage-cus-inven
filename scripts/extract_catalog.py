"""
Extract the product catalog from the Word price list (data/Mix 06.10. 2026.docx).

Rules (matching how the Word file is laid out):
  * A category header is a one-cell table row with a coloured fill and text
    (white text on blue). Every product after it belongs to that category
    until the next header.
  * Products sit in table cells: an image cell, with the text cell (name + price)
    in the same column on the next row. A cell may also hold both.
  * Brushes listing several "Size XX $ price" lines become one product per size.

Usage:
  python scripts/extract_catalog.py "data/Mix 06.10. 2026.docx"
Writes data/catalog.json and images to public/catalog/.
"""

import io
import json
import os
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
PR = "{http://schemas.openxmlformats.org/package/2006/relationships}"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "public", "catalog")
OUT_JSON = os.path.join(ROOT, "data", "catalog.json")

PRICE_RE = re.compile(r"\$\s*([0-9]+(?:[.,][0-9]+)?)")
SIZE_RE = re.compile(r"^\s*size\s*([0-9A-Za-z]+)\s*\$\s*([0-9]+(?:[.,][0-9]+)?)", re.I)


def clean(s: str) -> str:
    s = s.replace("�", "–").replace(" ", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip(" -–|")


def cell_lines(tc):
    out = []
    for p in tc.iter(W + "p"):
        t = "".join(x.text or "" for x in p.iter(W + "t"))
        t = clean(t)
        if t:
            out.append(t)
    return out


def cell_blips(tc):
    return [b.get(R + "embed") for b in tc.iter(A + "blip") if b.get(R + "embed")]


def has_fill(el):
    for shd in el.iter(W + "shd"):
        f = (shd.get(W + "fill") or "").lower()
        if f and f not in ("auto", "ffffff"):
            return True
    return False


def grid_cells(tr):
    """Yield (column_index, tc) honouring gridSpan."""
    col = 0
    for tc in tr.findall(W + "tc"):
        span = 1
        tcpr = tc.find(W + "tcPr")
        if tcpr is not None:
            gs = tcpr.find(W + "gridSpan")
            if gs is not None:
                span = int(gs.get(W + "val") or 1)
        yield col, tc
        col += span


def category_code(name: str, used: set) -> str:
    words = re.findall(r"[A-Za-z0-9]+", name.upper())
    if len(words) >= 2:
        code = "".join(w[0] for w in words[:3])
    else:
        code = (words[0] if words else "CAT")[:3]
    base, n = code, 2
    while code in used:
        code = f"{base}{n}"
        n += 1
    used.add(code)
    return code


def parse_products(lines):
    """Turn a text cell into one or more (name, price) items."""
    sizes = [(m.group(1), float(m.group(2).replace(",", "."))) for l in lines for m in [SIZE_RE.match(l)] if m]
    if len(sizes) >= 2:
        base = clean(" ".join(PRICE_RE.sub("", l) for l in lines if not SIZE_RE.match(l)))
        return [(f"{base} – Size {sz}", price) for sz, price in sizes]
    joined = " ".join(lines)
    m = PRICE_RE.search(joined)
    price = float(m.group(1).replace(",", ".")) if m else 0.0
    name = clean(PRICE_RE.sub("", joined))
    return [(name, price)]


def main(docx_path):
    z = zipfile.ZipFile(docx_path)
    rels = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    rid_target = {r.get("Id"): "word/" + r.get("Target").lstrip("/").replace("word/", "") for r in rels.findall(PR + "Relationship")}
    body = ET.fromstring(z.read("word/document.xml")).find(W + "body")

    os.makedirs(IMG_DIR, exist_ok=True)
    categories, products, problems = [], [], []
    used_codes, cat_codes, cat_counts = set(), {}, {}
    current = None

    def save_image(rid, sku):
        target = rid_target.get(rid)
        if not target or target not in z.namelist():
            return None
        try:
            im = Image.open(io.BytesIO(z.read(target)))
            im.load()
        except Exception:
            return None
        im = im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")
        im.thumbnail((640, 640))
        fname = f"{sku}.webp"
        im.save(os.path.join(IMG_DIR, fname), "WEBP", quality=82, method=6)
        return f"/catalog/{fname}"

    for tbl in body.iter(W + "tbl"):
        pending = {}
        orphans = {}  # column -> products whose image comes in a later row
        for tr in tbl.findall(W + "tr"):
            cells = list(grid_cells(tr))
            # Category header row
            if len(cells) == 1:
                tc = cells[0][1]
                lines = cell_lines(tc)
                if lines and not cell_blips(tc) and (has_fill(tr) or has_fill(tc)):
                    current = clean(" ".join(lines))
                    if current not in cat_codes:
                        categories.append(current)
                        cat_codes[current] = category_code(current, used_codes)
                        cat_counts[current] = 0
                    pending = {}
                    continue
            row_img_cols = []  # image-only cells seen in this row (side-by-side layout)
            for col, tc in cells:
                blips = cell_blips(tc)
                lines = cell_lines(tc)
                if blips and not lines:
                    group = orphans.pop(col, None)
                    if group:
                        url = save_image(blips[0], group[0]["sku"])
                        for prod in group:
                            prod["imageUrl"] = url
                    else:
                        pending[col] = blips[0]
                        row_img_cols.append(col)
                    continue
                if not lines:
                    continue
                if current is None:
                    problems.append(f"text before any category: {lines}")
                    continue
                rid = blips[0] if blips else pending.pop(col, None)
                if not rid and row_img_cols and row_img_cols[-1] < col and row_img_cols[-1] in pending:
                    # image directly to the left of the text in the same row
                    rid = pending.pop(row_img_cols.pop())
                items = parse_products(lines)
                img_url = None
                group = []
                for i, (name, price) in enumerate(items):
                    cat_counts[current] += 1
                    sku = f"{cat_codes[current]}-{cat_counts[current]:03d}"
                    if rid and img_url is None:
                        img_url = save_image(rid, sku)
                    if not name:
                        problems.append(f"{sku}: empty name from {lines}")
                    if price == 0:
                        problems.append(f"{sku}: no price in {lines}")
                    products.append(
                        {
                            "sku": sku,
                            "name": name or "Unnamed product",
                            "category": current,
                            "wholesalePrice": price,
                            "imageUrl": img_url,
                            "sortOrder": len(products) + 1,
                        }
                    )
                    group.append(products[-1])
                if not rid:
                    orphans[col] = group
                if rid and img_url is None:
                    problems.append(f"{items[0][0]}: image could not be read ({rid_target.get(rid)})")

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({"categories": categories, "products": products}, f, ensure_ascii=False, indent=1)

    print(f"{len(categories)} categories, {len(products)} products, {sum(1 for p in products if p['imageUrl'])} with images")
    for c in categories:
        print(f"  {cat_codes[c]:6} {cat_counts[c]:4}  {c}")
    print(f"{len(problems)} notes:")
    for p in problems:
        print("  -", p)


if __name__ == "__main__":
    main(sys.argv[1])

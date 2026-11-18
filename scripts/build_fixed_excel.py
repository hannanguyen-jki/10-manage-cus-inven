"""
Build "Data Sale - fixed.xlsx" (values only, no formulas) from the Google Sheet CSV exports in data/.
  PIVOT         customer -> product -> total quantity (same definition as the sheet's pivot)
  Customer      customers; "Last Sale" recomputed as the latest invoice date in History sale
  History sale  invoice lines with real dates and numeric price / quantity
Run from the project root:  python scripts/build_fixed_excel.py
"""
import collections
import csv
import re
import sys
from datetime import date, datetime

import openpyxl
from openpyxl.styles import Font, PatternFill

sys.stdout.reconfigure(encoding="utf-8")
OUT = sys.argv[1] if len(sys.argv) > 1 else "data/Data Sale - fixed.xlsx"


def money(v):
    v = (v or "").replace("$", "").replace(",", "").strip()
    try:
        return float(v) if v else None
    except ValueError:
        return None


def mdy(v):
    m = re.match(r"\s*(\d+)/(\d+)/(\d+)", v or "")
    return date(int(m[3]), int(m[1]), int(m[2])) if m else None


H = list(csv.reader(open("data/gsheet_history_sale.csv", encoding="utf-8")))
C = list(csv.reader(open("data/gsheet_customer.csv", encoding="utf-8")))
HDR = PatternFill("solid", fgColor="2F6050")
HF = Font(bold=True, color="FFFFFF")
GRP = PatternFill("solid", fgColor="DDE3EC")


def header(ws, ncols):
    for c in range(1, ncols + 1):
        ws.cell(1, c).fill = HDR
        ws.cell(1, c).font = HF


wb = openpyxl.Workbook()

# ---- History sale
wh = wb.active
wh.title = "History sale"
wh.append(H[0])
last, tot = {}, collections.defaultdict(lambda: collections.defaultdict(float))
for r in H[1:]:
    name, d = r[4].strip(), mdy(r[5])
    price, qty = money(r[2]), money(r[3])
    desc = r[1] if r[1] and not r[1].startswith("#") else r[0]  # "#N/A" lookup errors -> product name
    wh.append([r[0] or None, desc or None, price, qty, name, datetime.combine(d, datetime.min.time())])
    row = wh.max_row
    wh.cell(row, 3).number_format = "$#,##0.00"
    wh.cell(row, 6).number_format = "m/d/yyyy"
    last[name] = max(last.get(name, d), d)
    tot[name][r[0]] += qty or 0
header(wh, 6)
for col, w in zip("ABCDEF", [34, 48, 13, 19, 32, 13]):
    wh.column_dimensions[col].width = w
wh.freeze_panes = "A2"
wh.auto_filter.ref = f"A1:F{wh.max_row}"

# ---- Customer
wc = wb.create_sheet("Customer", 0)
wc.append(C[0])
for r in C[1:]:
    ls = last.get(r[1].strip())
    wc.append([r[0], r[1], r[2] or None, r[3] or None, r[4] or None, r[5] or None, r[6] or None,
               datetime.combine(ls, datetime.min.time()) if ls else "Không tìm thấy"])
    if ls:
        wc.cell(wc.max_row, 8).number_format = "m/d/yyyy"
header(wc, 8)
for col, w in zip("ABCDEFGH", [13, 34, 34, 18, 12, 18, 22, 14]):
    wc.column_dimensions[col].width = w
wc.freeze_panes = "A2"
wc.auto_filter.ref = f"A1:H{wc.max_row}"

# ---- PIVOT
wp = wb.create_sheet("PIVOT", 0)
wp.append(["Name", "PRODUCT DESCRIPTION", "SUM of TOTAL ITEMS INVOICE"])
header(wp, 3)
grand = 0
for name in sorted(tot, key=str.lower):
    prods = tot[name]
    s = sum(prods.values())
    grand += s
    wp.append([name, None, s])
    for c in range(1, 4):
        wp.cell(wp.max_row, c).fill = GRP
        wp.cell(wp.max_row, c).font = Font(bold=True)
    for p in sorted(prods, key=lambda x: str(x).lower()):
        wp.append([None, p or None, prods[p]])
        wp.row_dimensions[wp.max_row].outlineLevel = 1
        wp.row_dimensions[wp.max_row].hidden = True
wp.append(["Grand Total", None, grand])
for c in range(1, 4):
    wp.cell(wp.max_row, c).font = Font(bold=True)
wp.sheet_properties.outlinePr.summaryBelow = False
for col, w in zip("ABC", [36, 58, 28]):
    wp.column_dimensions[col].width = w
wp.freeze_panes = "A2"

wb.active = 0
wb.save(OUT)
print(f"saved {OUT} | history rows {wh.max_row - 1} | customers {wc.max_row - 1} | pivot customers {len(tot)} | grand total {grand:,.0f}")

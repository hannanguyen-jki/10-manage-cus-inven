"""
Rebuild customer + order data from the real sales history in the Google Sheet "Data Sale".

Source (CSV exports of the sheet tabs, values only, true M/D/YYYY dates):
  data/gsheet_customer.csv      Customer tab      -> one row per customer (ID SUP01..., address, phone, ATTN)
  data/gsheet_history_sale.csv  History sale tab  -> one row per invoice line (product, price, qty, customer name, invoice date)
  (data/gsheet_pivot.csv is the PIVOT tab, kept for reference only)
Re-download them with:
  https://docs.google.com/spreadsheets/d/1rrNMJLmFBcCg_FwaY7pO9Ug0TM_8t0-DNPGBpIG4hLA/export?format=csv&gid=<gid>
  gid: Customer=0, History sale=585914927, PIVOT=739413704

There is no invoice number in the sheet, so one invoice = one customer + one invoice date.

Outputs (overwritten):
  data/customers_extracted.json   customers with their orders embedded (used by the no-database fallback)
  data/orders_seed.json           flat order list (used by prisma/seed-orders.ts)
  data/customers_merged.json      duplicate customer ids removed -> kept id (prisma/seed-orders.ts deletes them from the DB)
  data/catalog.json               appended with SHEET-... products for history items not in the catalog yet

Run from the project root:  python scripts/build_data_from_sheet.py
Nothing here is random: re-running gives identical output.
"""
import hashlib
import json
import re
import sys
import warnings
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta

import csv

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")

HISTORY_CSV = "data/gsheet_history_sale.csv"
CUSTOMER_CSV = "data/gsheet_customer.csv"
REF_DATE = date(2026, 11, 17)  # reference date for the ACTIVE / AT_RISK / INACTIVE buckets

# Duplicate customer rows (same shop, spelled differently). The sheet's History uses the spelling on the
# right-hand record, which also holds the address/contact data; the bare-name duplicate on the left is removed.
# {removed customer id: kept customer id}
MERGED_CUSTOMERS = {
    "SUP03": "SUP07",      # A & N Nail Supply            -> A&N Nail Supply
    "SUP0229": "SUP0232",  # T & L Nail Supply            -> T&L Nail Supply
    "SUP098": "SUP0109",   # K S Nail Supply              -> KS Nail Supply
    "SUP0141": "SUP0165",  # N V Nail & Beauty Supply     -> NV Nail Supply
    "SUP053": "SUP0266",   # D&D Nail Supply              -> DD Nail Supply
    "SUP015": "SUP016",    # Angel's Nail & Beauty Supply -> Angels Nail Supply
    "SUP0175": "SUP0176",  # Pedispa World Nail Supply    -> Pedispaworld Nail Beauty Supply
    "SUP0163": "SUP0164",  # NTT Beauty Supply            -> NTT Nail Supply
    "SUP0221": "SUP0222",  # Sunrise Beauty Supply        -> Sunrise Nail Supply
    "SUP085": "SUP084",    # Hey Beautiful Supply         -> Hey Beautiful Nail Supply
    "SUP0237": "SUP0236",  # Texas Nail & Beauty Supply   -> Texas Beauty Nail Supply
    "SUP0231": "SUP0244",  # T Spa & Nail Supply          -> T Spa Nail Supply
}


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s or "").lower()).strip()


def sheet_sku(name):
    return "SHEET-" + hashlib.sha256(str(name).strip().lower().encode()).hexdigest()[:12].upper()


def to_date(v):
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    return None


def parse_money(v):
    v = (v or "").replace("$", "").replace(",", "").strip()
    try:
        return float(v) if v else None
    except ValueError:
        return None


def parse_mdy(v):
    m = re.match(r"\s*(\d+)/(\d+)/(\d+)", v or "")
    return date(int(m[3]), int(m[1]), int(m[2])) if m else None


def mdy(d):
    return f"{d.month}/{d.day}/{d.year}"


def main():
    cust_rows = [r for r in list(csv.reader(open(CUSTOMER_CSV, encoding="utf-8")))[1:] if r and r[0]]
    hist_rows = []
    for r in list(csv.reader(open(HISTORY_CSV, encoding="utf-8")))[1:]:
        # (code, description, price, qty, customer name, invoice date); lines with no product at all are blank rows
        if not r[4].strip() or not (r[0].strip() or r[1].strip()):
            continue
        desc = r[1].strip()
        if desc.startswith("#"):  # #N/A lookup error in the sheet -> fall back to the product code/name
            desc = ""
        hist_rows.append((r[0].strip(), desc or r[0].strip(), parse_money(r[2]), parse_money(r[3]), r[4].strip(), parse_mdy(r[5])))

    customers = json.load(open("data/customers_extracted.json", encoding="utf-8"))
    customers = [c for c in customers if c["id"] not in MERGED_CUSTOMERS]  # drop the bare duplicates
    cust_by_id = {c["id"]: c for c in customers}
    cust_by_name = {c["businessName"].strip().lower(): c for c in customers}
    sheet_ids = {r[0] for r in cust_rows}
    assert sheet_ids - set(MERGED_CUSTOMERS) == set(cust_by_id), "Customer IDs in sheet and in customers_extracted.json differ"
    assert all(k in sheet_ids and v in cust_by_id for k, v in MERGED_CUSTOMERS.items()), "Bad merge mapping"

    catalog_doc = json.load(open("data/catalog.json", encoding="utf-8"))
    products = catalog_doc["products"]
    by_sku = {p["sku"]: p for p in products}
    by_lower, by_norm = {}, {}
    for p in products:  # real catalog products win over SHEET-... placeholders
        for idx, key in ((by_lower, p["name"].strip().lower()), (by_norm, norm(p["name"]))):
            if key not in idx or (idx[key]["sku"].startswith("SHEET-") and not p["sku"].startswith("SHEET-")):
                idx[key] = p

    # ---- product mapping: one product per distinct (code, description) pair ----
    latest_price = {}
    for r in hist_rows:
        key = (r[0], r[1])
        d = to_date(r[5])
        if isinstance(r[2], (int, float)) and d and (key not in latest_price or d >= latest_price[key][0]):
            latest_price[key] = (d, float(r[2]))

    pair_to_product, created, matched_by = {}, [], Counter()
    next_sort = max(p["sortOrder"] for p in products) + 1
    for key in sorted({(r[0], r[1]) for r in hist_rows}, key=lambda k: (str(k[1]).lower(), str(k[0]).lower())):
        code, desc = key
        hit, how = None, None
        for label, idx, val in (
            ("name", by_lower, str(desc).strip().lower()),
            ("name", by_lower, str(code).strip().lower()),
            ("normalized", by_norm, norm(desc)),
            ("normalized", by_norm, norm(code)),
        ):
            if val in idx:
                hit, how = idx[val], label
                break
        if hit is None:
            # product code such as JKIC012 / KB009 at the start of the sheet name -> the one catalog product with that code
            m = re.match(r"\s*([A-Za-z]{2,5}\d{2,4})\b", str(code)) or re.match(r"\s*([A-Za-z]{2,5}\d{2,4})\b", str(desc))
            if m:
                same_code = [p for p in products
                             if not p["sku"].startswith("SHEET-") and re.match(r"\s*" + re.escape(m.group(1)) + r"\b", p["name"], re.I)]
                if len(same_code) == 1:
                    hit, how = same_code[0], "code"
        if hit is None:
            sku = sheet_sku(desc)
            if sku in by_sku:
                hit, how = by_sku[sku], "sheet-sku"
            else:
                price = latest_price.get(key, (None, 0.0))[1]
                hit = {"sku": sku, "name": str(desc).strip(), "category": "SHEET IMPORT",
                       "wholesalePrice": price, "imageUrl": None, "sortOrder": next_sort}
                next_sort += 1
                by_sku[sku] = hit
                products.append(hit)
                created.append(hit)
                how = "new"
        matched_by[how] += 1
        pair_to_product[key] = hit

    # price fallback for history lines with no price: last known price of that product
    last_known = {}
    for r in sorted(hist_rows, key=lambda r: to_date(r[5])):
        if isinstance(r[2], (int, float)):
            last_known[pair_to_product[(r[0], r[1])]["sku"]] = float(r[2])

    # ---- invoices ----
    invoices = defaultdict(list)
    issues = Counter()
    for r in hist_rows:
        d = to_date(r[5])
        c = cust_by_name.get(str(r[4]).strip().lower())
        if c is None or d is None:
            issues["line skipped: unknown customer/date"] += 1
            continue
        prod = pair_to_product[(r[0], r[1])]
        qty = r[3]
        if isinstance(qty, (int, float)) and qty == 0:
            issues["zero-quantity line ignored (nothing bought)"] += 1
            continue
        if not isinstance(qty, (int, float)) or qty < 0:
            issues["line skipped: quantity missing"] += 1
            invoices[(c["id"], d)].append(None)  # marker so the order note mentions it
            continue
        price = r[2]
        if not isinstance(price, (int, float)):
            price = last_known.get(prod["sku"], prod["wholesalePrice"])
            issues["line price filled from last known price"] += 1
        invoices[(c["id"], d)].append((prod, int(qty) if float(qty).is_integer() else float(qty), float(price)))

    # ---- build orders ----
    orders_by_cust = defaultdict(list)
    all_orders = []
    seq = 1000
    for (cid, d), lines in sorted(invoices.items(), key=lambda kv: (kv[0][1], kv[0][0])):
        real = [l for l in lines if l]
        dropped = len(lines) - len(real)
        if not real:
            issues["invoice skipped: no usable lines"] += 1
            continue
        seq += 1
        items, total = [], 0.0
        for n, (prod, qty, price) in enumerate(real, 1):
            line_total = round(qty * price, 2)
            total += line_total
            items.append({
                "id": f"item-{seq}-{n}", "productId": prod["sku"], "sku": prod["sku"],
                "productName": prod["name"], "category": prod["category"], "imageUrl": prod.get("imageUrl"),
                "quantity": qty, "unitPrice": price, "lineTotal": line_total,
            })
        total = round(total, 2)
        note = f"Invoice dated {mdy(d)} (imported from sales history sheet)"
        if dropped:
            note += f"; {dropped} line(s) without quantity not included"
        o = {
            "id": f"ord-{seq}", "orderNumber": f"INV-{d.year}-{seq:04d}", "customerId": cid,
            "totalAmount": total, "paidAmount": total, "paymentStatus": "PAID",
            "dueDate": datetime.combine(d + timedelta(days=30), datetime.min.time()).isoformat(),
            "saleRep": cust_by_id[cid].get("assignedSale") or "admin", "notes": note,
            "createdAt": datetime.combine(d, datetime.min.time()).isoformat(), "items": items,
        }
        orders_by_cust[cid].append(o)
        all_orders.append(o)

    # ---- customers ----
    for c in customers:
        orders = orders_by_cust.get(c["id"], [])
        c["orders"] = orders
        c["orderCount"] = len(orders)
        c["totalSpent"] = round(sum(o["totalAmount"] for o in orders), 2)
        c["totalPaid"] = c["totalSpent"]
        c["debtAmount"] = 0.0
        if orders:
            last = max(date.fromisoformat(o["createdAt"][:10]) for o in orders)
            c["lastSale"] = mdy(last)
            c["lastOrderDate"] = f"{last.isoformat()}T00:00:00"
            days = (REF_DATE - last).days
            c["status"] = "ACTIVE" if days <= 90 else "AT_RISK" if days <= 180 else "INACTIVE"
        else:
            c["lastSale"] = None
            c["lastOrderDate"] = None
            c["status"] = "INACTIVE"  # no invoices in the sales history

    with open("data/customers_extracted.json", "w", encoding="utf-8") as f:
        json.dump(customers, f, indent=2, ensure_ascii=False)
    with open("data/orders_seed.json", "w", encoding="utf-8") as f:
        json.dump(all_orders, f, indent=2, ensure_ascii=False)
    with open("data/customers_merged.json", "w", encoding="utf-8") as f:
        json.dump(MERGED_CUSTOMERS, f, indent=2, ensure_ascii=False)
    if created:
        with open("data/catalog.json", "w", encoding="utf-8") as f:
            json.dump(catalog_doc, f, indent=2, ensure_ascii=False)

    st = Counter(c["status"] for c in customers)
    print(f"customers: {len(customers)} | with orders: {sum(1 for c in customers if c['orders'])} | without: {sum(1 for c in customers if not c['orders'])}")
    print(f"orders: {len(all_orders)} | lines: {sum(len(o['items']) for o in all_orders)} | revenue: {sum(o['totalAmount'] for o in all_orders):,.2f}")
    print(f"product mapping: {dict(matched_by)} | new catalog products: {len(created)} | catalog total: {len(products)}")
    print(f"status: {dict(st)}")
    print(f"issues: {dict(issues)}")


if __name__ == "__main__":
    main()

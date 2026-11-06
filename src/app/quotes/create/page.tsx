"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Loader2,
  Store,
  ShoppingBasket,
  Send,
  Save,
  ChevronDown,
  Truck,
  PackageOpen,
  X,
  CalendarClock,
} from "lucide-react";
import type { QuoteCustomerData, ProductCatalogItem } from "@/lib/quotesData";
import { Avatar, EmptyState, SpotlightCard, TierBadge, cn } from "@/components/ui";

interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number; // %
}

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const prettyCat = (c: string) =>
  c
    .replace(/\s+/g, " ")
    .replace(/\b(\w) (?=\w)/g, "$1")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (s) => s.toUpperCase());

const PAYMENT_TERMS = [
  { value: "Net 15 (Zelle / Company Check)", label: "Trả trong 15 ngày (Zelle / Check)" },
  { value: "Net 30 (Approved Wholesale Account)", label: "Trả trong 30 ngày" },
  { value: "Due upon receipt (Zelle prior to dispatch)", label: "Trả trước khi giao (Zelle)" },
  { value: "Credit Card (Visa / Mastercard / Amex)", label: "Thẻ tín dụng" },
  { value: "COD (Houston Local Hub)", label: "Trả khi nhận hàng (COD)" },
  { value: "Bank Wire Transfer", label: "Chuyển khoản ngân hàng" },
];

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCustomerId = searchParams?.get("customerId");

  const [customers, setCustomers] = useState<QuoteCustomerData[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [productQuery, setProductQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [items, setItems] = useState<LineItem[]>([]);

  const [quoteNumber, setQuoteNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [salesRep, setSalesRep] = useState("Johnny Tran");
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[0].value);
  const [notes, setNotes] = useState("Free local delivery for wholesale orders in Greater Houston. 30-day replacement warranty on Kolinsky bristles.");
  const [saving, setSaving] = useState<"DRAFT" | "SENT" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    setQuoteNumber(`QT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`);
    setValidUntil(new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0]);

    fetch("/api/quotes/options")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        setCustomers(data.customers);
        setProducts(data.products);
        if (paramCustomerId && data.customers.some((c: any) => c.id === paramCustomerId)) setCustomerId(paramCustomerId);
      })
      .finally(() => setLoading(false));
  }, [paramCustomerId]);

  const customer = customers.find((c) => c.id === customerId);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => (category === "ALL" || p.category === category) && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
  }, [products, category, productQuery]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    return customers.filter((c) => !q || [c.businessName, c.contactPerson, c.phone, c.city].some((v) => (v || "").toLowerCase().includes(q)));
  }, [customers, customerQuery]);

  const addProduct = (p: ProductCatalogItem) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.productId === p.id);
      if (i >= 0) return prev.map((it, idx) => (idx === i ? { ...it, quantity: it.quantity + 1 } : it));
      return [
        ...prev,
        { productId: p.id, productName: p.name, sku: p.sku, imageUrl: p.imageUrl, category: p.category, quantity: 10, unitPrice: p.wholesalePrice, discount: 0 },
      ];
    });
  };
  const update = (i: number, patch: Partial<LineItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const discount = items.reduce((s, it) => s + it.quantity * it.unitPrice * (it.discount / 100), 0);
  const freeShip = subtotal >= 500;
  const shipping = items.length === 0 || freeShip ? 0 : 25;
  const total = Math.max(0, subtotal - discount + shipping);
  const pieces = items.reduce((s, it) => s + it.quantity, 0);

  const step = !customer ? 1 : items.length === 0 ? 2 : 3;

  const save = async (status: "DRAFT" | "SENT") => {
    setError("");
    if (!customerId) return setError("Hãy chọn khách hàng trước");
    if (items.length === 0) return setError("Hãy thêm ít nhất 1 sản phẩm");
    setSaving(status);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          customerId,
          customer,
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            sku: it.sku,
            imageUrl: it.imageUrl,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discount: Number(it.discount) || 0,
          })),
          validUntil: new Date(`${validUntil}T23:59:59.000Z`).toISOString(),
          notes,
          paymentTerms,
          status,
          createdUser: salesRep,
        }),
      });
      const data = await res.json();
      if (data.success && data.quote) router.push(`/quotes/${data.quote.id}`);
      else setError(data.error || "Không lưu được, thử lại nhé");
    } catch {
      setError("Lỗi kết nối, thử lại nhé");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="icon-btn bg-white border border-ink-100 shadow-sm" title="Quay lại">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">Tạo báo giá</h1>
            <p className="text-xs font-mono text-ink-400">{quoteNumber}</p>
          </div>
        </div>

        {/* Stepper */}
        <ol className="flex items-center gap-2 text-xs font-semibold">
          {[
            { n: 1, label: "Chọn khách", icon: Store },
            { n: 2, label: "Thêm sản phẩm", icon: ShoppingBasket },
            { n: 3, label: "Lưu & gửi", icon: Send },
          ].map((s, i) => {
            const done = step > s.n;
            const on = step === s.n;
            const Icon = s.icon;
            return (
              <li key={s.n} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all",
                    done ? "bg-emerald-50 text-emerald-700" : on ? "bg-brand-500 text-white shadow-glow" : "bg-white text-ink-400 border border-ink-100"
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {i < 2 && <span className={cn("w-4 h-0.5 rounded-full", done ? "bg-emerald-300" : "bg-ink-200")} />}
              </li>
            );
          })}
        </ol>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 animate-pop-in">
          {error}
          <button onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* 1. Customer */}
          <SpotlightCard className="p-5 !overflow-visible z-20">
            <StepTitle n={1} title="Khách hàng" done={!!customer} />
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className={cn("w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all", pickerOpen ? "border-brand-400 ring-4 ring-brand-500/10" : "border-ink-200 hover:border-brand-300")}
              >
                {customer ? (
                  <>
                    <Avatar name={customer.businessName} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 truncate">{customer.businessName}</p>
                      <p className="text-xs text-ink-400 truncate">
                        {customer.contactPerson} · {customer.phone} · {[customer.city, customer.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    {customer.tier && <TierBadge tier={customer.tier} />}
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-ink-400">{loading ? "Đang tải..." : "Bấm để chọn khách"}</span>
                  </>
                )}
                <ChevronDown className={cn("w-4 h-4 text-ink-400 transition-transform", pickerOpen && "rotate-180")} />
              </button>

              {pickerOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-3xl bg-white border border-ink-100 shadow-2xl p-2 animate-pop-in">
                  <div className="relative p-1">
                    <Search className="w-4 h-4 text-ink-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    <input autoFocus value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} placeholder="Tìm tên tiệm, SĐT..." className="input pl-11" />
                  </div>
                  <div className="max-h-72 overflow-y-auto mt-1">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCustomerId(c.id);
                          setPickerOpen(false);
                          setCustomerQuery("");
                        }}
                        className={cn("w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-brand-50/60", c.id === customerId && "bg-brand-50")}
                      >
                        <Avatar name={c.businessName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink-800 truncate">{c.businessName}</p>
                          <p className="text-xs text-ink-400 truncate">
                            {c.contactPerson} · {[c.city, c.state].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        {c.id === customerId && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Không tìm thấy</p>}
                  </div>
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* 2. Items */}
          <SpotlightCard className="p-5">
            <div className="flex items-center justify-between">
              <StepTitle n={2} title="Sản phẩm trong báo giá" done={items.length > 0} />
              {items.length > 0 && (
                <span className="text-xs font-semibold text-ink-500">
                  {items.length} loại · {pieces.toLocaleString("en-US")} cái
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-3xl border-2 border-dashed border-ink-200">
                <EmptyState icon={PackageOpen} title="Chưa có sản phẩm" hint="Chọn sản phẩm ở danh mục bên cạnh (hoặc bên dưới trên điện thoại)." />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {items.map((it, i) => {
                  const line = it.quantity * it.unitPrice * (1 - it.discount / 100);
                  return (
                    <div key={it.productId} className="rounded-2xl border border-ink-100 bg-white p-3 animate-fade-up">
                     <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-ink-100 bg-ink-50 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-900 leading-tight line-clamp-2">{it.productName}</p>
                        <p className="text-[11px] font-mono text-ink-400 mt-0.5">{it.sku}</p>
                      </div>
                      <p className="text-sm font-bold text-ink-900 tabular-nums shrink-0">{money(line)}</p>
                      <button type="button" onClick={() => remove(i)} className="icon-btn hover:!text-rose-600 hover:!bg-rose-50" title="Bỏ khỏi báo giá">
                        <Trash2 className="w-4 h-4" />
                      </button>
                     </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-[68px]">
                        {/* qty */}
                        <div className="flex items-center rounded-xl border border-ink-200 bg-white">
                          <button type="button" onClick={() => update(i, { quantity: Math.max(1, it.quantity - 1) })} className="w-8 h-9 flex items-center justify-center text-ink-500 hover:text-brand-600">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => update(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-12 text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            title="Số lượng"
                          />
                          <button type="button" onClick={() => update(i, { quantity: it.quantity + 1 })} className="w-8 h-9 flex items-center justify-center text-ink-500 hover:text-brand-600">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* price */}
                        <label className="flex items-center rounded-xl border border-ink-200 bg-white px-2 h-9" title="Giá mỗi cái">
                          <span className="text-xs text-ink-400">$</span>
                          <input
                            type="number"
                            step="0.5"
                            value={it.unitPrice}
                            onChange={(e) => update(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="w-14 text-right text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </label>
                        {/* discount */}
                        <label className="flex items-center rounded-xl border border-ink-200 bg-white px-2 h-9" title="Giảm giá (%)">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={it.discount}
                            onChange={(e) => update(i, { discount: Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)) })}
                            className="w-8 text-right text-sm font-semibold text-amber-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-ink-400 ml-0.5">% giảm</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SpotlightCard>

          {/* Details */}
          <SpotlightCard className="p-5">
            <h3 className="font-bold text-ink-900">Thông tin thêm</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Hiệu lực đến</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Cách thanh toán</label>
                <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="input">
                  {PAYMENT_TERMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Người lập</label>
                <input value={salesRep} onChange={(e) => setSalesRep(e.target.value)} className="input" />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Ghi chú in trên PDF</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input resize-none" />
            </div>
          </SpotlightCard>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Summary */}
          <div className="lg:sticky lg:top-2 space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-white p-5">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand-500/40 blur-3xl" />
              <div className="relative">
                <StepTitle n={3} title="Tổng báo giá" done={false} dark />
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Tiền hàng" value={money(subtotal)} />
                  {discount > 0 && <Row label="Giảm giá" value={`-${money(discount)}`} className="text-amber-300" />}
                  <Row
                    label={
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Phí giao
                      </span>
                    }
                    value={freeShip ? "Miễn phí" : money(shipping)}
                    className={freeShip ? "text-emerald-300" : ""}
                  />
                </dl>
                {!freeShip && items.length > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-400 transition-all duration-700" style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink-300">Thêm {money(500 - subtotal)} để được miễn phí giao</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
                  <span className="text-sm text-ink-300">Tổng cộng</span>
                  <span className="text-3xl font-bold tabular-nums">{money(total)}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button type="button" disabled={!!saving} onClick={() => save("DRAFT")} className="btn bg-white/10 border border-white/15 text-white hover:bg-white/20">
                    {saving === "DRAFT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu nháp
                  </button>
                  <button type="button" disabled={!!saving} onClick={() => save("SENT")} className="btn-primary">
                    {saving === "SENT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Tạo PDF
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
                  <CalendarClock className="w-3.5 h-3.5" /> Báo giá có hiệu lực 14 ngày, có thể đổi ở trên.
                </p>
              </div>
            </div>

            {/* Catalog */}
            <SpotlightCard className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-900">Danh mục sản phẩm</h3>
                <span className="text-xs text-ink-400">{filteredProducts.length} sản phẩm</span>
              </div>
              <div className="relative mt-3">
                <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Tìm tên hoặc mã sản phẩm..." className="input pl-11" />
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {["ALL", ...categories].map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={cn("chip !py-1", category === c ? "chip-on" : "chip-off")}>
                    {c === "ALL" ? "Tất cả" : prettyCat(c)}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredProducts.slice(0, 120).map((p) => {
                  const inQuote = items.find((it) => it.productId === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className={cn(
                        "group relative text-left rounded-2xl border p-2 transition-all hover:-translate-y-0.5 hover:shadow-lift",
                        inQuote ? "border-brand-300 bg-brand-50/50" : "border-ink-100 bg-white hover:border-brand-200"
                      )}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <span
                          className={cn(
                            "absolute right-1.5 bottom-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
                            inQuote ? "bg-emerald-500" : "bg-brand-500 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                          )}
                        >
                          {inQuote ? <span className="text-[10px] font-bold">{inQuote.quantity}</span> : <Plus className="w-4 h-4" />}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-ink-800 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="mt-0.5 text-xs font-bold text-brand-600">{money(p.wholesalePrice)}</p>
                    </button>
                  );
                })}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ n, title, done, dark }: { n: number; title: string; done: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center",
          done ? "bg-emerald-500 text-white" : dark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-600"
        )}
      >
        {done ? <Check className="w-4 h-4" /> : n}
      </span>
      <h3 className={cn("font-bold", dark ? "text-white" : "text-ink-900")}>{title}</h3>
    </div>
  );
}

function Row({ label, value, className }: { label: React.ReactNode; value: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between text-ink-200", className)}>
      <dt>{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export default function CreateQuotePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-400">Đang mở...</div>}>
      <CreateQuoteContent />
    </Suspense>
  );
}

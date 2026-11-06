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
  PackageOpen,
  X,
  UserPlus,
  CalendarClock,
} from "lucide-react";
import type { QuoteCustomerData, ProductCatalogItem } from "@/lib/quotesData";
import { Avatar, EmptyState, SpotlightCard, cn, prettyCategory } from "@/components/ui";

interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const EMPTY_NEW_CUSTOMER = {
  businessName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "TX",
  zipCode: "",
};

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCustomerId = searchParams?.get("customerId");

  const [customers, setCustomers] = useState<QuoteCustomerData[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [newCustomer, setNewCustomer] = useState(EMPTY_NEW_CUSTOMER);
  const [customerId, setCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [productQuery, setProductQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [items, setItems] = useState<LineItem[]>([]);

  const [quoteNumber, setQuoteNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [salesRep, setSalesRep] = useState("Johnny Tran");
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

  // Categories in catalog order (products arrive sorted like the Word price list)
  const categories = useMemo(() => {
    const seen: string[] = [];
    products.forEach((p) => !seen.includes(p.category) && seen.push(p.category));
    return seen;
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
        { productId: p.id, productName: p.name, sku: p.sku, imageUrl: p.imageUrl, category: p.category, quantity: 10, unitPrice: p.wholesalePrice },
      ];
    });
  };
  const update = (i: number, patch: Partial<LineItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const pieces = items.reduce((s, it) => s + it.quantity, 0);

  const setNew = (k: keyof typeof EMPTY_NEW_CUSTOMER, v: string) => setNewCustomer((c) => ({ ...c, [k]: v }));
  const newReady = !!(newCustomer.businessName.trim() && newCustomer.contactPerson.trim() && newCustomer.phone.trim());
  const customerReady = mode === "existing" ? !!customer : newReady;
  const step = !customerReady ? 1 : items.length === 0 ? 2 : 3;

  const save = async (status: "DRAFT" | "SENT") => {
    setError("");
    if (mode === "existing" && !customerId) return setError("Choose a customer first");
    if (mode === "new" && !newReady) return setError("Enter the new customer's shop name, contact person and phone");
    if (items.length === 0) return setError("Add at least one product");
    setSaving(status);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          ...(mode === "existing" ? { customerId, customer } : { newCustomer }),
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            sku: it.sku,
            imageUrl: it.imageUrl,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
          })),
          validUntil: new Date(`${validUntil}T23:59:59.000Z`).toISOString(),
          status,
          createdUser: salesRep,
        }),
      });
      const data = await res.json();
      if (data.success && data.quote) router.push(`/quotes/${data.quote.id}`);
      else setError(data.error || "Could not save, please try again");
    } catch {
      setError("Connection error, please try again");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="icon-btn bg-white border border-ink-100 shadow-sm" title="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">New quote</h1>
            <p className="text-xs font-mono text-ink-400">{quoteNumber}</p>
          </div>
        </div>

        {/* Stepper */}
        <ol className="flex items-center gap-2 text-xs font-semibold">
          {[
            { n: 1, label: "Customer", icon: Store },
            { n: 2, label: "Products", icon: ShoppingBasket },
            { n: 3, label: "Save & send", icon: Send },
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepTitle n={1} title="Customer" done={customerReady} />
              <div className="inline-flex rounded-2xl bg-ink-50 p-1 text-sm font-semibold">
                {(
                  [
                    { k: "existing", label: "Existing", icon: Store },
                    { k: "new", label: "New customer", icon: UserPlus },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.k}
                      type="button"
                      onClick={() => {
                        setMode(m.k);
                        setPickerOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all",
                        mode === m.k ? "bg-white text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "new" ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
                <div className="sm:col-span-2">
                  <label className="label">Shop name *</label>
                  <input className="input" value={newCustomer.businessName} onChange={(e) => setNew("businessName", e.target.value)} placeholder="e.g. Glamour Nail Supply" />
                </div>
                <div>
                  <label className="label">Contact person *</label>
                  <input className="input" value={newCustomer.contactPerson} onChange={(e) => setNew("contactPerson", e.target.value)} placeholder="Owner / manager" />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input font-mono" value={newCustomer.phone} onChange={(e) => setNew("phone", e.target.value)} placeholder="1 713-330-6165" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email</label>
                  <input className="input" type="email" value={newCustomer.email} onChange={(e) => setNew("email", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input className="input" value={newCustomer.address} onChange={(e) => setNew("address", e.target.value)} placeholder="Street address" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={newCustomer.city} onChange={(e) => setNew("city", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">State</label>
                    <input className="input uppercase" maxLength={2} value={newCustomer.state} onChange={(e) => setNew("state", e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="label">Zip</label>
                    <input className="input" value={newCustomer.zipCode} onChange={(e) => setNew("zipCode", e.target.value)} />
                  </div>
                </div>
                <p className="sm:col-span-2 text-xs text-ink-400">The new customer is saved to Customers when the quote is created.</p>
              </div>
            ) : (
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
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-ink-400">{loading ? "Loading..." : "Tap to choose a customer"}</span>
                  </>
                )}
                <ChevronDown className={cn("w-4 h-4 text-ink-400 transition-transform", pickerOpen && "rotate-180")} />
              </button>

              {pickerOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-3xl bg-white border border-ink-100 shadow-2xl p-2 animate-pop-in">
                  <div className="relative p-1">
                    <Search className="w-4 h-4 text-ink-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    <input autoFocus value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} placeholder="Search shop or phone..." className="input pl-11" />
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
                    {filteredCustomers.length === 0 && (
                      <div className="py-6 text-center">
                        <p className="text-sm text-ink-400">No match</p>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("new");
                            setPickerOpen(false);
                            setNewCustomer((c) => ({ ...c, businessName: customerQuery }));
                          }}
                          className="btn-ghost mt-3"
                        >
                          <UserPlus className="w-4 h-4" /> Enter new customer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </SpotlightCard>

          {/* 2. Items */}
          <SpotlightCard className="p-5">
            <div className="flex items-center justify-between">
              <StepTitle n={2} title="Products in this quote" done={items.length > 0} />
              {items.length > 0 && (
                <span className="text-xs font-semibold text-ink-500">
                  {items.length} items · {pieces.toLocaleString("en-US")} pcs
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-3xl border-2 border-dashed border-ink-200">
                <EmptyState icon={PackageOpen} title="No products yet" hint="Pick products from the catalog (beside this, or below on a phone)." />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {items.map((it, i) => {
                  const line = it.quantity * it.unitPrice;
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
                      <button type="button" onClick={() => remove(i)} className="icon-btn hover:!text-rose-600 hover:!bg-rose-50" title="Remove from quote">
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
                            title="Quantity"
                          />
                          <button type="button" onClick={() => update(i, { quantity: it.quantity + 1 })} className="w-8 h-9 flex items-center justify-center text-ink-500 hover:text-brand-600">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* price */}
                        <label className="flex items-center rounded-xl border border-ink-200 bg-white px-2 h-9" title="Price each">
                          <span className="text-xs text-ink-400">$</span>
                          <input
                            type="number"
                            step="0.5"
                            value={it.unitPrice}
                            onChange={(e) => update(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="w-14 text-right text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
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
            <h3 className="font-bold text-ink-900">Details</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Valid until</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Prepared by</label>
                <input value={salesRep} onChange={(e) => setSalesRep(e.target.value)} className="input" />
              </div>
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
                <StepTitle n={3} title="Quote total" done={false} dark />
                <p className="mt-3 text-sm text-ink-300">
                  {items.length} items · {pieces.toLocaleString("en-US")} pcs
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
                  <span className="text-sm text-ink-300">Total</span>
                  <span className="text-3xl font-bold tabular-nums">{money(total)}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button type="button" disabled={!!saving} onClick={() => save("DRAFT")} className="btn bg-white/10 border border-white/15 text-white hover:bg-white/20">
                    {saving === "DRAFT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save draft
                  </button>
                  <button type="button" disabled={!!saving} onClick={() => save("SENT")} className="btn-primary">
                    {saving === "SENT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Create PDF
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
                  <CalendarClock className="w-3.5 h-3.5" /> Quotes are valid for 14 days; you can change this above.
                </p>
              </div>
            </div>

            {/* Catalog */}
            <SpotlightCard className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-900">Product catalog</h3>
                <span className="text-xs text-ink-400">{filteredProducts.length} products</span>
              </div>
              <div className="relative mt-3">
                <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search name or code..." className="input pl-11" />
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {["ALL", ...categories].map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={cn("chip !py-1", category === c ? "chip-on" : "chip-off")}>
                    {c === "ALL" ? "All" : prettyCategory(c)}
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
                        <img src={p.imageUrl} alt="" loading="lazy" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
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

export default function CreateQuotePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-400">Loading...</div>}>
      <CreateQuoteContent />
    </Suspense>
  );
}

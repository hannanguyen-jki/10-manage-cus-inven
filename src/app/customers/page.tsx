"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Mail,
  FileText,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  X,
  MapPin,
  SearchX,
} from "lucide-react";
import {
  Avatar,
  EmptyState,
  PageHeader,
  Skeleton,
  cn,
  useToast,
} from "@/components/ui";
import QuoIcon from "@/components/QuoIcon";
import { sendEmail, sendQuoMessage, ContactResult, ContactTarget } from "@/lib/contact-actions";
import CustomerFormModal, { STATUS_META } from "@/components/CustomerFormModal";
import { getInactivityDetails, parseDateSafe } from "@/lib/inactivity";

interface Customer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  lastSale: string | null;
  status: "ACTIVE" | "AT_RISK" | "INACTIVE";
  payStatus: "PAID" | "OWING" | "NONE";
  unpaidOrders: number;
  paidOrders: number;
  orderCount: number;
  lastOrderDate: string | null;
}

type StatusFilter = "ALL" | "ACTIVE" | "AT_RISK" | "INACTIVE";

type SortKey = "id" | "shop" | "contact" | "lastSale";
type SortDir = "asc" | "desc";
// first click on a column: names A-Z, Last Sale newest first (high to low), ID ascending
const DEFAULT_DIR: Record<SortKey, SortDir> = { id: "asc", shop: "asc", contact: "asc", lastSale: "desc" };
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "id:asc", label: "Customer ID" },
  { value: "shop:asc", label: "Shop A–Z" },
  { value: "shop:desc", label: "Shop Z–A" },
  { value: "contact:asc", label: "Contact A–Z" },
  { value: "contact:desc", label: "Contact Z–A" },
  { value: "lastSale:desc", label: "Last Sale: newest first" },
  { value: "lastSale:asc", label: "Last Sale: oldest first" },
];

const idNumber = (id: string) => Number((id || "").replace(/\D/g, "")) || 0;
const textCompare = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true });

const cityLine = (c: Customer) => [c.city, [c.state, c.zipCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [state, setState] = useState<string>("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "id", dir: "asc" });
  const toast = useToast();

  // click a column header: sort by it (default direction first), click again to reverse
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: DEFAULT_DIR[key] }));

  // placeholder contact actions (not connected yet, see src/lib/contact-actions.ts)
  const runContact = async (fn: (t: ContactTarget) => Promise<ContactResult>, c: Customer) => {
    const r = await fn(c);
    toast.show(r.message, r.ok ? "success" : "info");
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      toast.show("Could not load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1") setAddOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const states = useMemo(() => Array.from(new Set(customers.map((c) => c.state).filter(Boolean))).sort() as string[], [customers]);

  const counts = useMemo(
    () => ({
      ALL: customers.length,
      ACTIVE: customers.filter((c) => c.status === "ACTIVE").length,
      AT_RISK: customers.filter((c) => c.status === "AT_RISK").length,
      INACTIVE: customers.filter((c) => c.status === "INACTIVE").length,
    }),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customers.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (state !== "ALL" && c.state !== state) return false;
      if (!q) return true;
      return [c.id, c.businessName, c.contactPerson, c.phone, c.address, c.city, c.zipCode].some((v) => (v || "").toLowerCase().includes(q));
    });

    const sign = sort.dir === "asc" ? 1 : -1;
    // rows with nothing to sort on (no contact name / no last sale) always go to the bottom
    const byText = (get: (c: Customer) => string) => (a: Customer, b: Customer) => {
      const x = get(a).trim();
      const y = get(b).trim();
      if (!x && !y) return 0;
      if (!x) return 1;
      if (!y) return -1;
      return sign * textCompare(x, y);
    };
    const saleTime = (c: Customer) => parseDateSafe(c.lastOrderDate || c.lastSale)?.getTime() ?? null;
    const compare =
      sort.key === "shop"
        ? byText((c) => c.businessName || "")
        : sort.key === "contact"
        ? byText((c) => c.contactPerson || "")
        : sort.key === "lastSale"
        ? (a: Customer, b: Customer) => {
            const x = saleTime(a);
            const y = saleTime(b);
            if (x === null && y === null) return 0;
            if (x === null) return 1;
            if (y === null) return -1;
            return sign * (x - y);
          }
        : (a: Customer, b: Customer) => sign * (idNumber(a.id) - idNumber(b.id));
    return [...list].sort(compare);
  }, [customers, search, statusFilter, state, sort]);

  const exportCsv = () => {
    const head = ["Customer ID", "Shop", "Contact", "Phone", "Address", "City", "State", "Zip", "Last sale"];
    const rows = filtered.map((c) => [
      c.id,
      c.businessName,
      c.contactPerson || "",
      c.phone || "",
      c.address || "",
      c.city || "",
      c.state || "",
      c.zipCode || "",
      c.lastSale || "",
    ]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const hasFilter = search || statusFilter !== "ALL" || state !== "ALL";

  return (
    <div className="space-y-6">
      {toast.node}

      <PageHeader
        icon={Users}
        title="Customers"
        subtitle="Shops, contacts and order history"
        actions={
          <>
            <button onClick={exportCsv} className="btn-ghost" title="Download Excel (CSV)">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add customer
            </button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="card p-3 sm:p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, shop, contact, phone, city or zip..."
            className="input pl-11 pr-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              { k: "ALL", label: "All", n: counts.ALL, dot: "bg-ink-300" },
              { k: "ACTIVE", label: "Bought ≤ 3 months", n: counts.ACTIVE, dot: "bg-emerald-500" },
              { k: "AT_RISK", label: "3–6 months", n: counts.AT_RISK, dot: "bg-amber-500" },
              { k: "INACTIVE", label: "Over 6 months", n: counts.INACTIVE, dot: "bg-rose-500" },
            ] as const
          ).map((t) => (
            <button key={t.k} onClick={() => setStatusFilter(t.k)} className={cn("chip", statusFilter === t.k ? "chip-on" : "chip-off")}>
              <span className={cn("w-2 h-2 rounded-full", t.dot)} />
              {t.label}
              <span className={cn("rounded-full px-1.5", statusFilter === t.k ? "bg-white/20" : "bg-ink-100")}>{t.n}</span>
            </button>
          ))}
          <select value={state} onChange={(e) => setState(e.target.value)} className="chip chip-off pr-7 cursor-pointer outline-none">
            <option value="ALL">📍 All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={SearchX}
            title="No customers found"
            hint="Try another search or clear the filters."
            action={
              hasFilter ? (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setState("ALL");
                  }}
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-500 px-1">
            Showing <b className="text-ink-800">{filtered.length}</b> of {customers.length} customers
          </p>

          {/* Desktop table */}
          <div className="card overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-400 border-b border-ink-100">
                  <SortTh label="Customer ID" k="id" sort={sort} onSort={toggleSort} className="py-3.5 pl-6 pr-3 whitespace-nowrap" />
                  <SortTh label="Shop" k="shop" sort={sort} onSort={toggleSort} className="py-3.5 px-3" />
                  <SortTh label="Contact" k="contact" sort={sort} onSort={toggleSort} className="py-3.5 px-3" />
                  <th className="py-3.5 px-3 hidden lg:table-cell">Address</th>
                  <SortTh label="Last Sale" k="lastSale" sort={sort} onSort={toggleSort} className="py-3.5 px-3 whitespace-nowrap" />
                  <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((c, i) => {
                  const inact = getInactivityDetails(c.lastOrderDate || c.lastSale);
                  return (
                    <tr key={c.id} className="group hover:bg-brand-50/40 transition-colors animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                      <td className="py-3.5 pl-6 pr-3 font-mono text-xs font-semibold text-ink-600 whitespace-nowrap">
                        <Link href={`/customers/${c.id}`} className="hover:text-brand-600">{c.id}</Link>
                      </td>
                      <td className="py-3.5 px-3">
                        <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                          <span className="hidden 2xl:inline-flex"><Avatar name={c.businessName} /></span>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900 group-hover:text-brand-600 transition-colors truncate max-w-[180px]">{c.businessName}</p>
                            <p className="text-xs text-ink-400 flex items-center gap-1 lg:hidden">
                              <MapPin className="w-3 h-3" />
                              {cityLine(c) || "—"}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              inact.tier === "ACTIVE" && "bg-emerald-500",
                              inact.tier === "AT_RISK" && "bg-amber-500",
                              inact.tier === "INACTIVE" && "bg-rose-500",
                              inact.tier === "NO_ORDER" && "bg-ink-300"
                            )}
                            title={inact.fullLabel}
                          />
                        </Link>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-ink-700">{c.contactPerson || "—"}</p>
                        {c.phone ? (
                          <p className="text-xs font-mono text-ink-400 whitespace-nowrap">{c.phone}</p>
                        ) : (
                          <p className="text-xs text-ink-300">No phone</p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 hidden lg:table-cell">
                        <p className="text-ink-700 truncate max-w-[180px]" title={c.address || ""}>{c.address || "—"}</p>
                        <p className="text-xs text-ink-400 truncate max-w-[180px]">{cityLine(c)}</p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-medium text-ink-800">{c.lastSale || "—"}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
                              inact.tier === "ACTIVE" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                              inact.tier === "AT_RISK" && "bg-amber-50 text-amber-800 border border-amber-200",
                              inact.tier === "INACTIVE" && "bg-rose-50 text-rose-700 border border-rose-200",
                              inact.tier === "NO_ORDER" && "bg-ink-50 text-ink-600 border border-ink-200"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                inact.tier === "ACTIVE" && "bg-emerald-500",
                                inact.tier === "AT_RISK" && "bg-amber-500",
                                inact.tier === "INACTIVE" && "bg-rose-500",
                                inact.tier === "NO_ORDER" && "bg-ink-400"
                              )}
                            />
                            {inact.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-6 pl-3">
                        <RowActions c={c} onQuo={() => runContact(sendQuoMessage, c)} onEmail={() => runContact(sendEmail, c)} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            <select
              className="input"
              aria-label="Sort customers"
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
                setSort({ key, dir });
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            {filtered.map((c, i) => {
              const inact = getInactivityDetails(c.lastOrderDate || c.lastSale);
              return (
                <div key={c.id} className="card p-4 animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                  <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                    <Avatar name={c.businessName} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 truncate">
                        <span className="font-mono text-xs text-ink-500 mr-1.5">{c.id}</span>
                        {c.businessName}
                      </p>
                      <p className="text-xs text-ink-400 truncate">
                        {[c.contactPerson, c.phone, cityLine(c)].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-ink-500">Last sale: {c.lastSale || "—"}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                            inact.tier === "ACTIVE" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                            inact.tier === "AT_RISK" && "bg-amber-50 text-amber-800 border border-amber-200",
                            inact.tier === "INACTIVE" && "bg-rose-50 text-rose-700 border border-rose-200",
                            inact.tier === "NO_ORDER" && "bg-ink-50 text-ink-600 border border-ink-200"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1 h-1 rounded-full",
                              inact.tier === "ACTIVE" && "bg-emerald-500",
                              inact.tier === "AT_RISK" && "bg-amber-500",
                              inact.tier === "INACTIVE" && "bg-rose-500",
                              inact.tier === "NO_ORDER" && "bg-ink-400"
                            )}
                          />
                          {inact.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-300" />
                  </Link>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <RowActions c={c} onQuo={() => runContact(sendQuoMessage, c)} onEmail={() => runContact(sendEmail, c)} compact />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CustomerFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={(ok, msg) => {
          toast.show(msg, ok ? "success" : "error");
          if (ok) load();
        }}
      />
    </div>
  );
}

function SortTh({
  label,
  k,
  sort,
  onSort,
  className,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const on = sort.key === k;
  const Icon = !on ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={className} aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn("inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-brand-600", on ? "text-brand-600" : "text-ink-400")}
        title={`Sort by ${label}`}
      >
        {label}
        <Icon className={cn("w-3.5 h-3.5", !on && "opacity-50")} />
      </button>
    </th>
  );
}

function RowActions({ c, onQuo, onEmail, compact }: { c: Customer; onQuo: () => void; onEmail: () => void; compact?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {c.phone ? (
        <button onClick={onQuo} className="icon-btn" title="Message via Quo">
          <QuoIcon className="w-5 h-5" />
        </button>
      ) : null}
      <button onClick={onEmail} className="icon-btn" title="Email">
        <Mail className="w-4 h-4" />
      </button>
      <Link href={`/quotes/create?customerId=${c.id}`} className="icon-btn" title="Create quote">
        <FileText className="w-4 h-4" />
      </Link>
      {!compact && (
        <Link href={`/customers/${c.id}`} className="icon-btn" title="View details">
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

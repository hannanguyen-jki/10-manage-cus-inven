"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  UserRound,
  MessageSquare,
  FileText,
  Pencil,
  Receipt,
  Package,
  StickyNote,
  UserX,
  Inbox,
  Plus,
  ChevronDown,
  Hash,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Aurora,
  Avatar,
  EmptyState,
  FadeIn,
  ProgressRing,
  QuoteBadge,
  Skeleton,
  SpotlightCard,
  cn,
  formatDate,
  timeAgo,
  useToast,
} from "@/components/ui";
import QuoIcon from "@/components/QuoIcon";
import { sendEmail, sendQuoMessage, ContactResult, ContactTarget } from "@/lib/contact-actions";
import CustomerFormModal, { STATUS_META } from "@/components/CustomerFormModal";
import { getInactivityDetails } from "@/lib/inactivity";

type Tab = "orders" | "quotes" | "sms";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("orders");
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      setC(data.success ? data.customer : null);
    } catch {
      setC(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-[32px]" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="card max-w-lg mx-auto mt-10">
        <EmptyState
          icon={UserX}
          title="Customer not found"
          action={
            <Link href="/customers" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to list
            </Link>
          }
        />
      </div>
    );
  }

  // placeholder contact actions (not connected yet, see src/lib/contact-actions.ts)
  const runContact = async (fn: (t: ContactTarget) => Promise<ContactResult>) => {
    const r = await fn(c);
    toast.show(r.message, r.ok ? "success" : "info");
  };

  const orders: any[] = [...(c.orders || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // total quantity of products across all of this customer's orders
  const totalProductsOrdered = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0),
    0
  );
  const quotes: any[] = c.quotes || [];
  const smsLogs: any[] = c.smsLogs || [];
  const status = STATUS_META[c.status] || STATUS_META.ACTIVE;
  const inactivity = getInactivityDetails(c.lastOrderDate || c.lastSale || orders[0]?.createdAt);

  const info = [
    { icon: Hash, label: "Customer ID", value: c.id },
    { icon: UserRound, label: "Contact person", value: c.contactPerson },
    { icon: Phone, label: "Phone", value: c.phone },
    { icon: Mail, label: "Email", value: c.email, href: c.email ? `mailto:${c.email}` : undefined },
    { icon: MapPin, label: "Address", value: [c.address, c.city, [c.state, c.zipCode].filter(Boolean).join(" ")].filter(Boolean).join(", ") },
    { icon: UserRound, label: "Sales rep", value: c.assignedSale },
  ];

  return (
    <div className="space-y-6">
      {toast.node}

      <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-600 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Customers
      </Link>

      {/* Profile hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-[32px] bg-ink-950 text-white p-6 sm:p-8">
          <Aurora className="opacity-70" />
          <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar name={c.businessName} size="lg" />
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-white/60">{c.id}</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{c.businessName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                    <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      inactivity.tier === "ACTIVE" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                      inactivity.tier === "AT_RISK" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                      inactivity.tier === "INACTIVE" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                      inactivity.tier === "NO_ORDER" && "bg-white/10 text-white/70"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {inactivity.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
              <QuickAction onClick={() => runContact(sendQuoMessage)} icon={QuoIcon} label="Message" />
              <QuickAction onClick={() => runContact(sendEmail)} icon={Mail} label="Email" />
              <QuickAction href={`/quotes/create?customerId=${c.id}`} icon={FileText} label="Quote" primary />
              <QuickAction onClick={() => setEditOpen(true)} icon={Pencil} label="Edit" />
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: info + activity */}
        <div className="space-y-4">
          <FadeIn delay={60}>
            <SpotlightCard className="p-6">
              <h2 className="font-bold text-ink-900">Activity & Recency</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Total orders</span>
                  <b className="text-ink-900 font-semibold">{orders.length || c.orderCount || 0}</b>
                </div>
                {totalProductsOrdered > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Total products ordered</span>
                    <b className="text-ink-900 font-semibold tabular-nums">
                      {totalProductsOrdered.toLocaleString("en-US")}
                    </b>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Last order date</span>
                  <span className="text-ink-800 font-medium">{inactivity.dateStr || c.lastSale || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Elapsed time</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-xs font-bold",
                      inactivity.tier === "ACTIVE" && "bg-emerald-100 text-emerald-800",
                      inactivity.tier === "AT_RISK" && "bg-amber-100 text-amber-800",
                      inactivity.tier === "INACTIVE" && "bg-rose-100 text-rose-800",
                      inactivity.tier === "NO_ORDER" && "bg-ink-100 text-ink-600"
                    )}
                  >
                    {inactivity.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Account status</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-ink-700">
                    <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={120}>
            <SpotlightCard className="p-6">
              <h2 className="font-bold text-ink-900">Details</h2>
              <ul className="mt-4 space-y-3.5">
                {info.map((row) => {
                  const Icon = row.icon;
                  return (
                    <li key={row.label} className="flex items-start gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-xl bg-ink-50 text-ink-500 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-ink-400">{row.label}</p>
                        {row.value ? (
                          row.href ? (
                            <a href={row.href} className="text-sm font-medium text-ink-800 hover:text-brand-600 break-all">
                              {row.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-ink-800 break-words">{row.value}</p>
                          )
                        ) : (
                          <p className="text-sm text-ink-300">Not set</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {c.notes && (
                <div className="mt-5 rounded-2xl bg-amber-50/70 border border-amber-100 p-3.5 flex gap-2.5">
                  <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-700">{c.notes}</p>
                </div>
              )}
            </SpotlightCard>
          </FadeIn>
        </div>

        {/* Right: tabs */}
        <FadeIn delay={100} className="lg:col-span-2">
          <div className="card p-2 sm:p-3">
            <div className="flex gap-1 p-1 rounded-2xl bg-ink-50 overflow-x-auto no-scrollbar">
              {(
                [
                  { k: "orders", label: "Orders", icon: Receipt, n: orders.length },
                  { k: "quotes", label: "Quotes", icon: FileText, n: quotes.length },
                  { k: "sms", label: "Texts", icon: MessageSquare, n: smsLogs.length },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap",
                      tab === t.k ? "bg-white text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                    <span className="rounded-full bg-ink-100 px-1.5 text-xs">{t.n}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-2 sm:p-3 mt-1">
              {tab === "orders" &&
                (orders.length === 0 ? (
                  <EmptyState icon={Receipt} title="No orders yet" />
                ) : (
                  <div className="space-y-3">
                    {orders.map((o, i) => {
                      const open = expanded === o.id || (!expanded && i === 0);
                      const items: any[] = o.items || [];
                      return (
                        <div
                          key={o.id}
                          className="rounded-2xl border border-ink-100 bg-white overflow-hidden shadow-soft animate-fade-up"
                          style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                        >
                          <div
                            className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-ink-50/60 transition-colors"
                            onClick={() => setExpanded(open ? "none" : o.id)}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                                <Receipt className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold font-mono text-ink-900">{o.orderNumber}</p>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                    <CheckCircle2 className="w-3 h-3" /> Invoice Issued
                                  </span>
                                </div>
                                <p className="text-xs text-ink-400 flex items-center gap-2 mt-0.5">
                                  <span>Invoice date: <b className="text-ink-700 font-medium">{formatDate(o.createdAt)}</b> ({timeAgo(o.createdAt)})</span>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Package className="w-3 h-3" /> {items.length} {items.length === 1 ? "item" : "items"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-ink-50 flex items-center justify-center text-ink-500">
                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")} />
                              </div>
                            </div>
                          </div>

                          {open && items.length > 0 && (
                            <div className="border-t border-ink-100 bg-ink-50/30 p-4">
                              <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2.5 px-1">
                                Ordered Products ({items.length})
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-left text-ink-400 border-b border-ink-100">
                                      <th className="pb-2 pl-2">Product</th>
                                      <th className="pb-2 px-2 text-center">Qty</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-ink-100/60">
                                    {items.map((it: any) => {
                                      const pName = it.product?.name || it.productName || "Product";
                                      const pSku = it.product?.sku || it.sku || "";
                                      const pImg = it.product?.imageUrl || it.imageUrl;
                                      const pCat = it.product?.category || it.category;
                                      const qty = Number(it.quantity) || 1;

                                      return (
                                        <tr key={it.id} className="hover:bg-white/80 transition-colors">
                                          <td className="py-2.5 pl-2">
                                            <div className="flex items-center gap-2.5">
                                              {pImg ? (
                                                <img
                                                  src={pImg}
                                                  alt={pName}
                                                  className="w-9 h-9 rounded-lg object-cover border border-ink-100 shrink-0 bg-white"
                                                  onError={(e) => {
                                                    (e.currentTarget as HTMLElement).style.display = "none";
                                                  }}
                                                />
                                              ) : (
                                                <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center shrink-0 text-ink-400">
                                                  <Package className="w-4 h-4" />
                                                </div>
                                              )}
                                              <div className="min-w-0">
                                                <p className="font-semibold text-ink-800 text-sm truncate max-w-xs">{pName}</p>
                                                <p className="text-[11px] text-ink-400 flex items-center gap-1.5 font-mono">
                                                  {pSku && <span>SKU: {pSku}</span>}
                                                  {pCat && <span>· {pCat}</span>}
                                                </p>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-2 text-center font-bold text-ink-800 tabular-nums">
                                            ×{qty.toLocaleString("en-US")}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-ink-200">
                                      <td className="pt-3 pl-2 font-bold text-ink-700 text-right">
                                        Total products:
                                      </td>
                                      <td className="pt-3 px-2 font-bold text-ink-900 text-center text-sm tabular-nums">
                                        ×{items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0).toLocaleString("en-US")}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

              {tab === "quotes" &&
                (quotes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No quotes yet"
                    action={
                      <Link href={`/quotes/create?customerId=${c.id}`} className="btn-primary">
                        <Plus className="w-4 h-4" /> Create quote
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {quotes.map((q: any) => (
                      <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3.5 card-hover bg-white">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-mono text-ink-800">{q.quoteNumber}</p>
                          <p className="text-xs text-ink-400">{formatDate(q.createdAt)}</p>
                        </div>
                        <QuoteBadge status={q.status} />
                      </Link>
                    ))}
                  </div>
                ))}

              {tab === "sms" &&
                (smsLogs.length === 0 ? (
                  <EmptyState icon={Inbox} title="No texts yet" />
                ) : (
                  <div className="space-y-3">
                    {smsLogs.map((log: any) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 rounded-2xl rounded-tl-md bg-ink-50 px-4 py-3">
                          <p className="text-sm text-ink-700">{log.content}</p>
                          <p className="mt-1 text-[11px] text-ink-400">{formatDate(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        customerId={c.id}
        initial={{
          businessName: c.businessName || "",
          contactPerson: c.contactPerson || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
          zipCode: c.zipCode || "",
          birthday: c.birthday ? String(c.birthday).slice(0, 10) : "",
          assignedSale: c.assignedSale || "",
          tier: c.tier || "STANDARD",
          status: c.status || "ACTIVE",
          lastSale: c.lastSale || "",
          notes: c.notes || "",
        }}
        onSaved={(ok, msg) => {
          toast.show(msg, ok ? "success" : "error");
          if (ok) load();
        }}
      />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  onClick,
  primary,
}: {
  icon: any;
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const cls = cn(
    "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95",
    primary ? "bg-brand-500 text-white hover:bg-brand-400 shadow-glow" : "bg-white/10 border border-white/15 text-white hover:bg-white/20 backdrop-blur"
  );
  const inner = (
    <>
      <Icon className="w-4 h-4" />
      {label}
    </>
  );
  if (href) {
    return href.startsWith("/") ? (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    ) : (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

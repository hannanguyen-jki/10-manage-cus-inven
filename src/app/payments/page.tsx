"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Search,
  X,
  Phone,
  MessageSquare,
  CheckCheck,
  Check,
  Undo2,
  PartyPopper,
  Receipt,
  CalendarDays,
  Package,
  Loader2,
  Info,
} from "lucide-react";
import {
  Avatar,
  EmptyState,
  FadeIn,
  PAY_META,
  PageHeader,
  PayBadge,
  PayStatus,
  ProgressRing,
  SegmentBar,
  Skeleton,
  SpotlightCard,
  cn,
  formatDate,
  timeAgo,
  useToast,
} from "@/components/ui";
import SmsModal from "@/components/SmsModal";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: PayStatus;
  itemCount: number;
  customer: {
    id: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    city: string | null;
    state: string | null;
    tier: string;
  };
}

type Tab = "OWING" | "PAID" | "ALL";

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("OWING");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [smsCustomer, setSmsCustomer] = useState<Order["customer"] | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.show("Không tải được dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "PAID" || t === "ALL") setTab(t);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (ids: string[], status: PayStatus, key: string) => {
    setBusy(key);
    try {
      const results = await Promise.all(
        ids.map((orderId) =>
          fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status }),
          }).then((r) => r.json())
        )
      );
      if (results.every((r) => r.success)) {
        setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, status } : o)));
        toast.show(status === "PAID" ? "Đã ghi nhận: khách đã trả" : "Đã cập nhật trạng thái");
      } else {
        toast.show("Có đơn không cập nhật được", "error");
      }
    } catch {
      toast.show("Lỗi kết nối, thử lại sau", "error");
    } finally {
      setBusy(null);
    }
  };

  // Group orders by customer
  const groups = useMemo(() => {
    const map = new Map<string, { customer: Order["customer"]; orders: Order[] }>();
    for (const o of orders) {
      const g = map.get(o.customer.id) || { customer: o.customer, orders: [] };
      g.orders.push(o);
      map.set(o.customer.id, g);
    }
    return Array.from(map.values()).map((g) => {
      const unpaid = g.orders.filter((o) => o.status !== "PAID");
      const oldest = unpaid.reduce<string | null>((m, o) => (!m || o.createdAt < m ? o.createdAt : m), null);
      return { ...g, unpaid, oldest };
    });
  }, [orders]);

  const stats = useMemo(() => {
    const s = { PAID: 0, PARTIAL: 0, UNPAID: 0 } as Record<PayStatus, number>;
    orders.forEach((o) => s[o.status]++);
    return {
      ...s,
      total: orders.length,
      owingCustomers: groups.filter((g) => g.unpaid.length > 0).length,
      paidCustomers: groups.filter((g) => g.unpaid.length === 0).length,
    };
  }, [orders, groups]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter((g) => (tab === "OWING" ? g.unpaid.length > 0 : tab === "PAID" ? g.unpaid.length === 0 : true))
      .filter(
        (g) =>
          !q ||
          [g.customer.businessName, g.customer.contactPerson, g.customer.phone, ...g.orders.map((o) => o.orderNumber)].some((v) =>
            (v || "").toLowerCase().includes(q)
          )
      )
      .sort((a, b) => (a.oldest && b.oldest ? a.oldest.localeCompare(b.oldest) : a.oldest ? -1 : b.oldest ? 1 : a.customer.businessName.localeCompare(b.customer.businessName)));
  }, [groups, tab, search]);

  return (
    <div className="space-y-6">
      {toast.node}
      <PageHeader icon={Wallet} title="Thanh toán" subtitle="Xem khách nào đã trả, khách nào chưa" />

      {/* Infographic summary */}
      {loading ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (
        <FadeIn>
          <SpotlightCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <ProgressRing value={stats.PAID} total={stats.total} size={140} stroke={14} color="#10b981">
                <span className="text-3xl font-bold text-ink-900">{stats.total ? Math.round((stats.PAID / stats.total) * 100) : 0}%</span>
                <span className="text-xs text-ink-400">đơn đã trả</span>
              </ProgressRing>

              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {(["PAID", "PARTIAL", "UNPAID"] as PayStatus[]).map((s) => {
                    const m = PAY_META[s];
                    const Icon = m.icon;
                    return (
                      <div key={s} className="rounded-2xl bg-ink-50 p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-ink-500">
                          <Icon className="w-4 h-4" style={{ color: m.color }} />
                          <span className="truncate">{m.label}</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-ink-900 tabular-nums">{stats[s]}</p>
                        <p className="text-[11px] text-ink-400">đơn hàng</p>
                      </div>
                    );
                  })}
                </div>
                <SegmentBar
                  segments={(["PAID", "PARTIAL", "UNPAID"] as PayStatus[]).map((s) => ({ label: PAY_META[s].label, value: stats[s], color: PAY_META[s].color }))}
                />
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>
      )}

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="inline-flex rounded-2xl bg-white border border-ink-100 p-1 shadow-sm self-start">
          {(
            [
              { k: "OWING", label: "Chưa trả", n: stats.owingCustomers, dot: "bg-rose-500" },
              { k: "PAID", label: "Đã trả hết", n: stats.paidCustomers, dot: "bg-emerald-500" },
              { k: "ALL", label: "Tất cả", n: groups.length, dot: "bg-ink-300" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold transition-all",
                tab === t.k ? "bg-ink-900 text-white shadow-soft" : "text-ink-500 hover:text-ink-900"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", t.dot)} />
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs", tab === t.k ? "bg-white/20" : "bg-ink-100")}>{t.n}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm khách hoặc mã đơn..." className="input pl-11 pr-10" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-ink-400 px-1">
        <Info className="w-3.5 h-3.5" /> Bấm <b className="text-ink-600">“Đã trả”</b> khi khách thanh toán xong một đơn.
      </p>

      {/* Groups */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          {tab === "OWING" && !search ? (
            <EmptyState icon={PartyPopper} title="Tất cả đơn đã được thanh toán" hint="Không còn đơn nào chưa trả." />
          ) : (
            <EmptyState icon={Receipt} title="Không có kết quả" hint="Thử đổi từ khóa hoặc chọn tab khác." />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visible.map((g, i) => {
            const owing = g.unpaid.length > 0;
            return (
              <FadeIn key={g.customer.id} delay={Math.min(i, 8) * 40}>
                <SpotlightCard
                  className={cn("p-5 h-full", owing && "border-rose-100")}
                  color={owing ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)"}
                >
                  {/* Customer header */}
                  <div className="flex items-start gap-3">
                    <Avatar name={g.customer.businessName} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/customers/${g.customer.id}`} className="font-semibold text-ink-900 hover:text-brand-600 truncate block">
                        {g.customer.businessName}
                      </Link>
                      <p className="text-xs text-ink-400 truncate">
                        {g.customer.contactPerson} · {[g.customer.city, g.customer.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <a href={`tel:${g.customer.phone}`} className="icon-btn" title="Gọi điện">
                        <Phone className="w-4 h-4" />
                      </a>
                      <button onClick={() => setSmsCustomer(g.customer)} className="icon-btn" title="Nhắn tin nhắc">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {owing ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {g.unpaid.length}/{g.orders.length} đơn chưa trả · từ {timeAgo(g.oldest)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600">Đã trả hết {g.orders.length} đơn</span>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="mt-4 space-y-2">
                    {[...g.unpaid, ...g.orders.filter((o) => o.status === "PAID")]
                      .slice(0, g.unpaid.length + (owing ? 1 : 3))
                      .map((o) => (
                        <div
                          key={o.id}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
                            o.status === "PAID" ? "border-ink-100 bg-ink-50/50" : "border-ink-100 bg-white"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold font-mono text-ink-800">{o.orderNumber}</p>
                            <p className="text-[11px] text-ink-400 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {formatDate(o.createdAt)}
                              </span>
                              {o.itemCount > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {o.itemCount} món
                                </span>
                              )}
                            </p>
                          </div>
                          <PayBadge status={o.status} />
                          {o.status === "PAID" ? (
                            <button
                              onClick={() => setStatus([o.id], "UNPAID", o.id)}
                              disabled={busy === o.id}
                              className="icon-btn"
                              title="Hoàn tác: chuyển về chưa trả"
                            >
                              {busy === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => setStatus([o.id], "PAID", o.id)}
                              disabled={busy === o.id}
                              className="btn-success !px-3 !py-1.5 !text-xs !rounded-xl"
                            >
                              {busy === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Đã trả
                            </button>
                          )}
                        </div>
                      ))}
                  </div>

                  {g.orders.length - g.unpaid.length > (owing ? 1 : 3) && (
                    <Link href={`/customers/${g.customer.id}`} className="mt-2 block text-center text-xs font-semibold text-ink-400 hover:text-brand-600">
                      + {g.orders.length - g.unpaid.length - (owing ? 1 : 3)} đơn đã trả khác
                    </Link>
                  )}

                  {g.unpaid.length > 1 && (
                    <button
                      onClick={() => setStatus(g.unpaid.map((o) => o.id), "PAID", g.customer.id)}
                      disabled={busy === g.customer.id}
                      className="btn-ghost w-full mt-3 !text-emerald-700 hover:!border-emerald-300"
                    >
                      {busy === g.customer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                      Đánh dấu trả hết {g.unpaid.length} đơn
                    </button>
                  )}
                </SpotlightCard>
              </FadeIn>
            );
          })}
        </div>
      )}

      <SmsModal
        open={!!smsCustomer}
        onClose={() => setSmsCustomer(null)}
        customer={smsCustomer}
        initialTemplate="AR_REMINDER"
        onSent={(ok, msg) => toast.show(msg, ok ? "success" : "error")}
      />
    </div>
  );
}

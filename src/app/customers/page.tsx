"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  FileText,
  ChevronRight,
  Download,
  X,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Crown,
  SearchX,
} from "lucide-react";
import {
  Avatar,
  EmptyState,
  FadeIn,
  PageHeader,
  Skeleton,
  StatCard,
  TIER_META,
  TierBadge,
  cn,
  timeAgo,
  useToast,
  CustomerPayBadge,
} from "@/components/ui";
import SmsModal, { SmsTemplate } from "@/components/SmsModal";
import CustomerFormModal, { STATUS_META } from "@/components/CustomerFormModal";

interface Customer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  tier: "STANDARD" | "WHOLESALE" | "VIP";
  status: "ACTIVE" | "AT_RISK" | "INACTIVE";
  payStatus: "PAID" | "OWING" | "NONE";
  unpaidOrders: number;
  paidOrders: number;
  orderCount: number;
  lastOrderDate: string | null;
}

type PayFilter = "ALL" | "OWING" | "PAID";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pay, setPay] = useState<PayFilter>("ALL");
  const [tier, setTier] = useState<string>("ALL");
  const [state, setState] = useState<string>("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [sms, setSms] = useState<{ c: Customer; t: SmsTemplate } | null>(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      toast.show("Không tải được danh sách khách", "error");
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
      all: customers.length,
      owing: customers.filter((c) => c.payStatus === "OWING").length,
      paid: customers.filter((c) => c.payStatus === "PAID").length,
      vip: customers.filter((c) => c.tier === "VIP").length,
    }),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (pay !== "ALL" && c.payStatus !== pay) return false;
      if (tier !== "ALL" && c.tier !== tier) return false;
      if (state !== "ALL" && c.state !== state) return false;
      if (!q) return true;
      return [c.businessName, c.contactPerson, c.phone, c.city].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [customers, search, pay, tier, state]);

  const exportCsv = () => {
    const head = ["Tên tiệm", "Người liên hệ", "SĐT", "Email", "Thành phố", "Bang", "Nhóm", "Thanh toán", "Đơn chưa trả"];
    const rows = filtered.map((c) => [
      c.businessName,
      c.contactPerson,
      c.phone,
      c.email || "",
      c.city || "",
      c.state || "",
      TIER_META[c.tier]?.label || c.tier,
      c.payStatus === "PAID" ? "Đã trả hết" : c.payStatus === "OWING" ? "Còn nợ" : "Chưa có đơn",
      c.unpaidOrders,
    ]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `khach-hang_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const hasFilter = search || pay !== "ALL" || tier !== "ALL" || state !== "ALL";

  return (
    <div className="space-y-6">
      {toast.node}

      <PageHeader
        icon={Users}
        title="Khách hàng"
        subtitle="Danh sách tiệm, liên hệ và tình trạng trả tiền"
        actions={
          <>
            <button onClick={exportCsv} className="btn-ghost" title="Tải file Excel (CSV)">
              <Download className="w-4 h-4" /> Xuất file
            </button>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm khách
            </button>
          </>
        }
      />

      {/* Stat filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0}>
          <StatCard label="Tất cả khách" value={counts.all} icon={Users} tone="brand" onClick={() => setPay("ALL")} active={pay === "ALL"} />
        </FadeIn>
        <FadeIn delay={60}>
          <StatCard label="Còn nợ" value={counts.owing} icon={AlertCircle} tone="rose" onClick={() => setPay("OWING")} active={pay === "OWING"} />
        </FadeIn>
        <FadeIn delay={120}>
          <StatCard label="Đã trả hết" value={counts.paid} icon={CheckCircle2} tone="green" onClick={() => setPay("PAID")} active={pay === "PAID"} />
        </FadeIn>
        <FadeIn delay={180}>
          <StatCard label="Khách VIP" value={counts.vip} icon={Crown} tone="amber" onClick={() => setTier(tier === "VIP" ? "ALL" : "VIP")} active={tier === "VIP"} />
        </FadeIn>
      </div>

      {/* Toolbar */}
      <div className="card p-3 sm:p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên tiệm, người liên hệ, số điện thoại..."
            className="input pl-11 pr-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[{ k: "ALL", label: "Mọi nhóm", emoji: "✨" }, ...Object.entries(TIER_META).map(([k, m]) => ({ k, label: m.label, emoji: m.emoji }))].map((t) => (
            <button key={t.k} onClick={() => setTier(t.k)} className={cn("chip", tier === t.k ? "chip-on" : "chip-off")}>
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
          <select value={state} onChange={(e) => setState(e.target.value)} className="chip chip-off pr-7 cursor-pointer outline-none">
            <option value="ALL">📍 Mọi bang</option>
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
            title="Không tìm thấy khách nào"
            hint="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
            action={
              hasFilter ? (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setSearch("");
                    setPay("ALL");
                    setTier("ALL");
                    setState("ALL");
                  }}
                >
                  Xóa bộ lọc
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-500 px-1">
            Đang hiện <b className="text-ink-800">{filtered.length}</b> / {customers.length} khách
          </p>

          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-400 border-b border-ink-100">
                  <th className="py-3.5 pl-6 pr-3">Tiệm</th>
                  <th className="py-3.5 px-3">Liên hệ</th>
                  <th className="py-3.5 px-3">Nhóm</th>
                  <th className="py-3.5 px-3">Thanh toán</th>
                  <th className="py-3.5 px-3 hidden 2xl:table-cell whitespace-nowrap">Mua gần nhất</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((c, i) => (
                  <tr key={c.id} className="group hover:bg-brand-50/40 transition-colors animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <td className="py-3.5 pl-6 pr-3">
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                        <Avatar name={c.businessName} />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 group-hover:text-brand-600 transition-colors truncate max-w-[240px]">{c.businessName}</p>
                          <p className="text-xs text-ink-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                            <span className={cn("ml-2 w-1.5 h-1.5 rounded-full", STATUS_META[c.status]?.dot)} title={STATUS_META[c.status]?.label} />
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-ink-700">{c.contactPerson}</p>
                      <a href={`tel:${c.phone}`} className="text-xs font-mono text-ink-400 hover:text-brand-600 whitespace-nowrap">
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-3">
                      <TierBadge tier={c.tier} />
                    </td>
                    <td className="py-3.5 px-3">
                      <CustomerPayBadge c={c} />
                    </td>
                    <td className="py-3.5 px-3 text-ink-500 hidden 2xl:table-cell whitespace-nowrap">{timeAgo(c.lastOrderDate)}</td>
                    <td className="py-3.5 pr-6 pl-3">
                      <RowActions c={c} onSms={(t) => setSms({ c, t })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((c, i) => (
              <div key={c.id} className="card p-4 animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                  <Avatar name={c.businessName} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 truncate">{c.businessName}</p>
                    <p className="text-xs text-ink-400 truncate">
                      {c.contactPerson} · {[c.city, c.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300" />
                </Link>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <CustomerPayBadge c={c} />
                    <TierBadge tier={c.tier} />
                  </div>
                  <RowActions c={c} onSms={(t) => setSms({ c, t })} compact />
                </div>
              </div>
            ))}
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
      <SmsModal
        open={!!sms}
        onClose={() => setSms(null)}
        customer={sms?.c || null}
        initialTemplate={sms?.t}
        onSent={(ok, msg) => toast.show(msg, ok ? "success" : "error")}
      />
    </div>
  );
}

function RowActions({ c, onSms, compact }: { c: Customer; onSms: (t: SmsTemplate) => void; compact?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <a href={`tel:${c.phone}`} className="icon-btn" title="Gọi điện">
        <Phone className="w-4 h-4" />
      </a>
      <button onClick={() => onSms(c.payStatus === "OWING" ? "AR_REMINDER" : "FOLLOW_UP")} className="icon-btn" title="Nhắn tin">
        <MessageSquare className="w-4 h-4" />
      </button>
      <Link href={`/quotes/create?customerId=${c.id}`} className="icon-btn" title="Tạo báo giá">
        <FileText className="w-4 h-4" />
      </Link>
      {!compact && (
        <Link href={`/customers/${c.id}`} className="icon-btn" title="Xem chi tiết">
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

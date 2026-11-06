"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Cake,
  UserRound,
  CalendarDays,
  MessageSquare,
  FileText,
  Pencil,
  Receipt,
  Package,
  Check,
  Undo2,
  Loader2,
  StickyNote,
  UserX,
  Inbox,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  Aurora,
  Avatar,
  CustomerPayBadge,
  EmptyState,
  FadeIn,
  PayBadge,
  ProgressRing,
  QuoteBadge,
  Skeleton,
  SpotlightCard,
  TierBadge,
  cn,
  formatDate,
  normalizePay,
  timeAgo,
  useToast,
} from "@/components/ui";
import SmsModal, { SmsTemplate } from "@/components/SmsModal";
import CustomerFormModal, { STATUS_META } from "@/components/CustomerFormModal";

type Tab = "orders" | "quotes" | "sms";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("orders");
  const [editOpen, setEditOpen] = useState(false);
  const [smsTpl, setSmsTpl] = useState<SmsTemplate | null>(null);
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
    if (new URLSearchParams(window.location.search).get("sms") === "reminder") setSmsTpl("AR_REMINDER");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setPay = async (orderId: string, status: "PAID" | "UNPAID") => {
    setBusy(orderId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.show(status === "PAID" ? "Đã ghi nhận: khách đã trả" : "Đã chuyển về chưa trả");
        load();
      } else toast.show(data.error || "Không cập nhật được", "error");
    } catch {
      toast.show("Lỗi kết nối", "error");
    } finally {
      setBusy(null);
    }
  };

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
          title="Không tìm thấy khách này"
          action={
            <Link href="/customers" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Về danh sách
            </Link>
          }
        />
      </div>
    );
  }

  const orders: any[] = [...(c.orders || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const quotes: any[] = c.quotes || [];
  const smsLogs: any[] = c.smsLogs || [];
  const status = STATUS_META[c.status] || STATUS_META.ACTIVE;

  const info = [
    { icon: UserRound, label: "Người liên hệ", value: c.contactPerson },
    { icon: Phone, label: "Điện thoại", value: c.phone, href: `tel:${c.phone}` },
    { icon: Mail, label: "Email", value: c.email, href: c.email ? `mailto:${c.email}` : undefined },
    { icon: MapPin, label: "Địa chỉ", value: [c.address, c.city, c.state, c.zipCode].filter(Boolean).join(", ") },
    { icon: Cake, label: "Sinh nhật", value: c.birthday ? formatDate(c.birthday) : null },
    { icon: UserRound, label: "Nhân viên phụ trách", value: c.assignedSale },
  ];

  return (
    <div className="space-y-6">
      {toast.node}

      <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-600 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Khách hàng
      </Link>

      {/* Profile hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-[32px] bg-ink-950 text-white p-6 sm:p-8">
          <Aurora className="opacity-70" />
          <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar name={c.businessName} size="lg" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{c.businessName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TierBadge tier={c.tier} />
                  <CustomerPayBadge c={c} />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                    <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
              <QuickAction href={`tel:${c.phone}`} icon={Phone} label="Gọi" />
              <QuickAction onClick={() => setSmsTpl(c.payStatus === "OWING" ? "AR_REMINDER" : "FOLLOW_UP")} icon={MessageSquare} label="Nhắn tin" />
              <QuickAction href={`/quotes/create?customerId=${c.id}`} icon={FileText} label="Báo giá" primary />
              <QuickAction onClick={() => setEditOpen(true)} icon={Pencil} label="Sửa" />
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: info + payment ring */}
        <div className="space-y-4">
          <FadeIn delay={60}>
            <SpotlightCard className="p-6">
              <h2 className="font-bold text-ink-900">Thanh toán</h2>
              <div className="mt-4 flex items-center gap-5">
                <ProgressRing value={c.paidOrders || 0} total={c.orderCount || 0} size={112} stroke={12} color="#10b981">
                  <span className="text-2xl font-bold text-ink-900">
                    {c.paidOrders || 0}/{c.orderCount || 0}
                  </span>
                  <span className="text-[11px] text-ink-400">đơn đã trả</span>
                </ProgressRing>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đã trả: <b>{c.paidOrders || 0}</b>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Chưa trả: <b>{c.unpaidOrders || 0}</b>
                  </p>
                  <p className="flex items-center gap-2 text-ink-400 text-xs">
                    <CalendarDays className="w-3.5 h-3.5" /> Mua gần nhất: {timeAgo(c.lastOrderDate)}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={120}>
            <SpotlightCard className="p-6">
              <h2 className="font-bold text-ink-900">Thông tin</h2>
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
                          <p className="text-sm text-ink-300">Chưa có</p>
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
                  { k: "orders", label: "Đơn hàng", icon: Receipt, n: orders.length },
                  { k: "quotes", label: "Báo giá", icon: FileText, n: quotes.length },
                  { k: "sms", label: "Tin nhắn", icon: MessageSquare, n: smsLogs.length },
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
                  <EmptyState icon={Receipt} title="Chưa có đơn hàng" />
                ) : (
                  <div className="space-y-2">
                    {orders.map((o, i) => {
                      const st = normalizePay(o.paymentStatus);
                      const open = expanded === o.id;
                      const items: any[] = o.items || [];
                      return (
                        <div key={o.id} className="rounded-2xl border border-ink-100 bg-white animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                          <div className="flex items-center gap-3 p-3.5">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", st === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                              <Receipt className="w-5 h-5" />
                            </div>
                            <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded(open ? null : o.id)}>
                              <p className="text-sm font-semibold font-mono text-ink-800">{o.orderNumber}</p>
                              <p className="text-xs text-ink-400 flex items-center gap-2">
                                {formatDate(o.createdAt)}
                                {items.length > 0 && (
                                  <span className="inline-flex items-center gap-1">
                                    · <Package className="w-3 h-3" /> {items.length} món
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
                                  </span>
                                )}
                              </p>
                            </button>
                            <PayBadge status={st} />
                            {st === "PAID" ? (
                              <button onClick={() => setPay(o.id, "UNPAID")} disabled={busy === o.id} className="icon-btn" title="Hoàn tác">
                                {busy === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                              </button>
                            ) : (
                              <button onClick={() => setPay(o.id, "PAID")} disabled={busy === o.id} className="btn-success !px-3 !py-1.5 !text-xs !rounded-xl">
                                {busy === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Đã trả
                              </button>
                            )}
                          </div>
                          {open && items.length > 0 && (
                            <ul className="border-t border-ink-100 px-4 py-3 space-y-1.5 animate-fade-up">
                              {items.map((it: any) => (
                                <li key={it.id} className="flex items-center justify-between text-sm">
                                  <span className="text-ink-700 truncate">{it.product?.name || it.productName || "Sản phẩm"}</span>
                                  <span className="text-ink-400 tabular-nums shrink-0 pl-3">× {Number(it.quantity).toLocaleString("en-US")}</span>
                                </li>
                              ))}
                            </ul>
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
                    title="Chưa có báo giá"
                    action={
                      <Link href={`/quotes/create?customerId=${c.id}`} className="btn-primary">
                        <Plus className="w-4 h-4" /> Tạo báo giá
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
                  <EmptyState icon={Inbox} title="Chưa nhắn tin lần nào" />
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
          state: c.state || "TX",
          zipCode: c.zipCode || "",
          birthday: c.birthday ? String(c.birthday).slice(0, 10) : "",
          assignedSale: c.assignedSale || "",
          tier: c.tier || "STANDARD",
          status: c.status || "ACTIVE",
          notes: c.notes || "",
        }}
        onSaved={(ok, msg) => {
          toast.show(msg, ok ? "success" : "error");
          if (ok) load();
        }}
      />
      <SmsModal
        open={!!smsTpl}
        onClose={() => setSmsTpl(null)}
        customer={c}
        initialTemplate={smsTpl || "FOLLOW_UP"}
        onSent={(ok, msg) => {
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

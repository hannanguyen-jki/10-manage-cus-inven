"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  Phone,
  MessageSquare,
  Wallet,
  MapPin,
  Sparkles,
  BellRing,
  Receipt,
  PartyPopper,
} from "lucide-react";
import {
  Aurora,
  Avatar,
  CountUp,
  EmptyState,
  FadeIn,
  PayBadge,
  ProgressRing,
  QUOTE_META,
  QuoteBadge,
  SegmentBar,
  Skeleton,
  SpotlightCard,
  StatCard,
  TIER_META,
  timeAgo,
} from "@/components/ui";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d?.success ? d : null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 rounded-[32px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState icon={AlertCircle} title="Không tải được dữ liệu" hint="Thử tải lại trang sau ít phút." />;
  }

  const t = data.totals;
  const paidPct = t.customers - t.customersNoOrder > 0 ? Math.round((t.customersPaid / (t.customers - t.customersNoOrder)) * 100) : 0;
  const maxState = Math.max(1, ...data.states.map((s: any) => s.count));

  return (
    <div className="space-y-6">
      {/* HERO */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-[32px] bg-ink-950 text-white p-6 sm:p-8 lg:p-10">
          <Aurora />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3 py-1 text-xs font-medium text-brand-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="shiny-text text-brand-100">Tổng quan hôm nay</span>
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                {t.customersOwing > 0 ? (
                  <>
                    Có <span className="gradient-text">{t.customersOwing} khách</span> chưa trả hết tiền
                  </>
                ) : (
                  <>
                    Tất cả khách <span className="gradient-text">đã trả đủ</span> 🎉
                  </>
                )}
              </h1>
              <p className="mt-2 text-ink-300">Nhắc thanh toán hoặc gửi báo giá mới chỉ với một chạm.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/quotes/create" className="btn-primary">
                  <Plus className="w-4 h-4" /> Tạo báo giá
                </Link>
                <Link href="/payments" className="btn bg-white/10 border border-white/15 text-white hover:bg-white/20 backdrop-blur">
                  <Wallet className="w-4 h-4" /> Xem ai chưa trả
                </Link>
                <Link href="/customers?add=1" className="btn bg-white/10 border border-white/15 text-white hover:bg-white/20 backdrop-blur">
                  <Users className="w-4 h-4" /> Thêm khách
                </Link>
              </div>
            </div>

            {/* Infographic ring */}
            <div className="flex items-center gap-6 rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-md p-5 self-start lg:self-auto">
              <ProgressRing value={t.customersPaid} total={t.customers - t.customersNoOrder} size={132} stroke={14} color="#34d399" track="rgba(255,255,255,0.12)">
                <span className="text-3xl font-bold">{paidPct}%</span>
                <span className="text-[11px] text-ink-300">đã trả hết</span>
              </ProgressRing>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-ink-300">Đã trả hết</span>
                  <b className="ml-auto pl-4">{t.customersPaid}</b>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-ink-300">Còn nợ</span>
                  <b className="ml-auto pl-4">{t.customersOwing}</b>
                </div>
                {t.customersNoOrder > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-400" />
                    <span className="text-ink-300">Chưa có đơn</span>
                    <b className="ml-auto pl-4">{t.customersNoOrder}</b>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={50}>
          <Link href="/customers">
            <StatCard label="Tổng khách hàng" value={t.customers} icon={Users} tone="brand" />
          </Link>
        </FadeIn>
        <FadeIn delay={100}>
          <Link href="/payments?tab=PAID">
            <StatCard label="Đã trả hết" value={t.customersPaid} icon={CheckCircle2} tone="green" />
          </Link>
        </FadeIn>
        <FadeIn delay={150}>
          <Link href="/payments">
            <StatCard label="Còn nợ" value={t.customersOwing} icon={AlertCircle} tone="rose" />
          </Link>
        </FadeIn>
        <FadeIn delay={200}>
          <Link href="/quotes">
            <StatCard label="Báo giá" value={t.quotes} icon={FileText} tone="violet" />
          </Link>
        </FadeIn>
      </div>

      {/* REMIND + QUOTE FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeIn delay={100} className="lg:col-span-2">
          <SpotlightCard className="p-6 h-full">
            <SectionTitle icon={BellRing} tone="bg-rose-50 text-rose-600" title="Cần nhắc thanh toán" link="/payments" linkText="Xem tất cả" />
            {data.toRemind.length === 0 ? (
              <EmptyState icon={PartyPopper} title="Không ai nợ cả!" hint="Mọi khách đều đã thanh toán đủ." />
            ) : (
              <div className="mt-4 divide-y divide-ink-100">
                {data.toRemind.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 py-3 group">
                    <Avatar name={c.businessName} />
                    <Link href={`/customers/${c.id}`} className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 truncate group-hover:text-brand-600 transition-colors">{c.businessName}</p>
                      <p className="text-xs text-ink-400 truncate">
                        {c.unpaidOrders} đơn chưa trả · từ {timeAgo(c.oldestUnpaid)}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1">
                      <a href={`tel:${c.phone}`} className="icon-btn" title="Gọi điện">
                        <Phone className="w-4 h-4" />
                      </a>
                      <Link href={`/customers/${c.id}?sms=reminder`} className="icon-btn" title="Nhắn tin nhắc">
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={150}>
          <SpotlightCard className="p-6 h-full">
            <SectionTitle icon={FileText} tone="bg-violet-50 text-violet-600" title="Báo giá" link="/quotes" linkText="Mở" />
            <div className="mt-5 space-y-3">
              {(["DRAFT", "SENT", "ACCEPTED", "REJECTED"] as const).map((s, i) => {
                const m = QUOTE_META[s];
                const Icon = m.icon;
                const count = data.quoteStatus[s] || 0;
                const max = Math.max(1, ...Object.values(data.quoteStatus as Record<string, number>));
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2 font-medium text-ink-700">
                        <Icon className="w-4 h-4 text-ink-400" /> {m.label}
                      </span>
                      <b className="tabular-nums">{count}</b>
                    </div>
                    <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full animate-fade-up"
                        style={{
                          width: `${Math.max(count ? 6 : 0, (count / max) * 100)}%`,
                          background: ["#858ea0", "#039dd5", "#10b981", "#f43f5e"][i],
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/quotes/create" className="btn-ghost w-full mt-6">
              <Plus className="w-4 h-4" /> Báo giá mới
            </Link>
          </SpotlightCard>
        </FadeIn>
      </div>

      {/* TIERS + STATES + RECENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FadeIn delay={100}>
          <SpotlightCard className="p-6 h-full">
            <SectionTitle icon={Users} tone="bg-amber-50 text-amber-600" title="Nhóm khách" />
            <div className="mt-6">
              <SegmentBar
                segments={(["VIP", "WHOLESALE", "STANDARD"] as const).map((k) => ({
                  label: TIER_META[k].label,
                  value: data.tiers[k] || 0,
                  color: TIER_META[k].color,
                }))}
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(["VIP", "WHOLESALE", "STANDARD"] as const).map((k) => (
                <div key={k} className="rounded-2xl bg-ink-50 p-3 text-center">
                  <div className="text-xl">{TIER_META[k].emoji}</div>
                  <div className="text-xl font-bold mt-1">
                    <CountUp to={data.tiers[k] || 0} />
                  </div>
                  <div className="text-[11px] text-ink-500">{TIER_META[k].label}</div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={150}>
          <SpotlightCard className="p-6 h-full">
            <SectionTitle icon={MapPin} tone="bg-brand-50 text-brand-600" title="Khách theo bang" />
            <div className="mt-5 space-y-2.5">
              {data.states.slice(0, 6).map((s: any, i: number) => (
                <div key={s.state} className="flex items-center gap-3">
                  <span className="w-9 text-xs font-bold text-ink-500">{s.state}</span>
                  <div className="flex-1 h-7 rounded-xl bg-ink-50 overflow-hidden">
                    <div
                      className="h-full rounded-xl bg-gradient-to-r from-brand-300 to-brand-500 flex items-center justify-end pr-2 text-[11px] font-bold text-white animate-fade-up"
                      style={{ width: `${Math.max(12, (s.count / maxState) * 100)}%`, animationDelay: `${i * 80}ms` }}
                    >
                      {s.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={200} className="md:col-span-2 lg:col-span-1">
          <SpotlightCard className="p-6 h-full">
            <SectionTitle icon={Receipt} tone="bg-emerald-50 text-emerald-600" title="Đơn gần đây" link="/payments" linkText="Tất cả" />
            <ol className="mt-5 relative border-l-2 border-dashed border-ink-100 ml-2 space-y-4">
              {data.recentOrders.map((o: any) => (
                <li key={o.id} className="pl-5 relative">
                  <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${o.status === "PAID" ? "bg-emerald-500" : o.status === "PARTIAL" ? "bg-amber-500" : "bg-rose-500"}`} />
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/customers/${o.customerId}`} className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate hover:text-brand-600">{o.businessName}</p>
                      <p className="text-xs text-ink-400">{timeAgo(o.createdAt)}</p>
                    </Link>
                    <PayBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ol>
          </SpotlightCard>
        </FadeIn>
      </div>

      {/* Recent quotes */}
      {data.recentQuotes.length > 0 && (
        <FadeIn>
          <SpotlightCard className="p-6">
            <SectionTitle icon={FileText} tone="bg-violet-50 text-violet-600" title="Báo giá mới nhất" link="/quotes" linkText="Tất cả" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {data.recentQuotes.map((q: any) => (
                <Link key={q.id} href={`/quotes/${q.id}`} className="rounded-2xl border border-ink-100 p-4 card-hover bg-white">
                  <p className="text-xs font-mono text-ink-400">{q.quoteNumber}</p>
                  <p className="font-semibold text-ink-800 truncate mt-1">{q.businessName}</p>
                  <div className="mt-3">
                    <QuoteBadge status={q.status} />
                  </div>
                </Link>
              ))}
            </div>
          </SpotlightCard>
        </FadeIn>
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  tone,
  title,
  link,
  linkText,
}: {
  icon: any;
  tone: string;
  title: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      {link && (
        <Link href={link} className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
          {linkText}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

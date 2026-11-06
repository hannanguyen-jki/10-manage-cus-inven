"use client";

/**
 * Shared UI kit. Several pieces are lightweight, dependency-free takes on
 * React Bits components (CountUp, SpotlightCard, Aurora, AnimatedContent).
 */

import React, { useEffect, useRef, useState } from "react";
import { LucideIcon, X, CheckCircle2, XCircle, CircleDashed, Send, ThumbsUp, ThumbsDown, FileEdit } from "lucide-react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* CountUp – animates a number when it scrolls into view               */
/* ------------------------------------------------------------------ */
export function CountUp({ to, duration = 1.2, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const eased = 1 - Math.pow(1 - t, 4);
        setValue(Math.round(to * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    const fallback = setTimeout(() => {
      // If the observer or animation frames are throttled, show the real number
      if (!started) {
        started = true;
        setValue(to);
      }
    }, 1500);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value.toLocaleString("en-US")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SpotlightCard – soft glow that follows the cursor                   */
/* ------------------------------------------------------------------ */
export function SpotlightCard({
  children,
  className,
  color = "rgba(3,157,213,0.12)",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("card group relative overflow-hidden", className)}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--x) var(--y), ${color}, transparent 45%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aurora – animated blurred colour blobs for hero areas               */
/* ------------------------------------------------------------------ */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -top-1/2 -left-1/4 h-[140%] w-[70%] rounded-full bg-brand-500/40 blur-3xl animate-aurora" />
      <div className="absolute -bottom-1/2 right-[-10%] h-[130%] w-[60%] rounded-full bg-cyan-300/30 blur-3xl animate-aurora-slow" />
      <div className="absolute top-[-30%] right-[20%] h-[90%] w-[35%] rounded-full bg-indigo-400/25 blur-3xl animate-aurora" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FadeIn – reveal content with blur + slide on scroll                 */
/* ------------------------------------------------------------------ */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    // Safety net: never leave content hidden if the observer is throttled
    const fallback = setTimeout(() => setShown(true), 1200 + delay);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [delay]);
  return (
    <div
      ref={ref}
      className={cn(shown ? "animate-fade-up" : "opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ProgressRing – donut infographic                                     */
/* ------------------------------------------------------------------ */
export function ProgressRing({
  value,
  total,
  size = 120,
  stroke = 12,
  color = "#039dd5",
  track = "#eceef2",
  children,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const pct = total > 0 ? value / total : 0;
  useEffect(() => {
    const t = setTimeout(() => setProgress(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SegmentBar – stacked horizontal bar infographic                      */
/* ------------------------------------------------------------------ */
export function SegmentBar({
  segments,
  className,
}: {
  segments: { value: number; color: string; label: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={cn("flex h-3 w-full overflow-hidden rounded-full bg-ink-100 gap-0.5", className)}>
      {segments.map((s) => (
        <div
          key={s.label}
          title={`${s.label}: ${s.value}`}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{
            width: ready ? `${(s.value / total) * 100}%` : "0%",
            background: s.color,
            transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */
const tones = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  ink: "bg-ink-100 text-ink-700 ring-ink-200",
};
export type Tone = keyof typeof tones;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  onClick,
  active,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <SpotlightCard
      onClick={onClick}
      className={cn(
        "p-4 sm:p-5 card-hover",
        onClick && "cursor-pointer",
        active && "ring-2 ring-brand-400 border-brand-200"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center ring-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6", tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
        <CountUp to={value} />
      </div>
      <div className="mt-0.5 text-sm font-medium text-ink-500">{label}</div>
      {hint && <div className="mt-2 text-xs text-ink-400">{hint}</div>}
    </SpotlightCard>
  );
}

/* ------------------------------------------------------------------ */
/* PageHeader                                                          */
/* ------------------------------------------------------------------ */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-glow">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar with deterministic gradient                                  */
/* ------------------------------------------------------------------ */
const avatarGradients = [
  "from-brand-400 to-brand-600",
  "from-violet-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-cyan-500",
  "from-ink-500 to-ink-800",
];
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .replace(/[^A-Za-z0-9À-ɏḀ-ỿ\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const g = avatarGradients[h % avatarGradients.length];
  const s = size === "sm" ? "w-8 h-8 text-[11px] rounded-xl" : size === "lg" ? "w-16 h-16 text-xl rounded-3xl" : "w-10 h-10 text-sm rounded-2xl";
  return (
    <div className={cn("shrink-0 bg-gradient-to-br text-white font-bold flex items-center justify-center shadow-sm", g, s)}>
      {initials || "?"}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payment status                                                      */
/* ------------------------------------------------------------------ */
export type PayStatus = "PAID" | "PARTIAL" | "UNPAID";

export const PAY_META: Record<PayStatus, { label: string; cls: string; dot: string; icon: LucideIcon; color: string }> = {
  PAID: { label: "Đã trả", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2, color: "#10b981" },
  PARTIAL: { label: "Trả một phần", cls: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", icon: CircleDashed, color: "#f59e0b" },
  UNPAID: { label: "Chưa trả", cls: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500", icon: XCircle, color: "#f43f5e" },
};

export function normalizePay(s?: string | null): PayStatus {
  if (s === "PAID") return "PAID";
  if (s === "PARTIAL") return "PARTIAL";
  return "UNPAID";
}

export function PayBadge({ status, pulse }: { status: PayStatus; pulse?: boolean }) {
  const m = PAY_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1", m.cls)}>
      <span className="relative flex h-2 w-2">
        {pulse && status !== "PAID" && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", m.dot)} />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", m.dot)} />
      </span>
      {m.label}
    </span>
  );
}

/** Per-customer payment summary badge */
export function CustomerPayBadge({ c }: { c: { payStatus: string; unpaidOrders: number } }) {
  if (c.payStatus === "NONE")
    return <span className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold bg-ink-100 text-ink-500">Chưa có đơn</span>;
  if (c.payStatus === "PAID")
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Đã trả hết
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
      </span>
      Chưa trả {c.unpaidOrders} đơn
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Quote status                                                        */
/* ------------------------------------------------------------------ */
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
export const QUOTE_META: Record<QuoteStatus, { label: string; cls: string; icon: LucideIcon; hint: string }> = {
  DRAFT: { label: "Nháp", cls: "bg-ink-100 text-ink-600 ring-ink-200", icon: FileEdit, hint: "Chưa gửi cho khách" },
  SENT: { label: "Đã gửi", cls: "bg-brand-50 text-brand-700 ring-brand-200", icon: Send, hint: "Đang chờ khách trả lời" },
  ACCEPTED: { label: "Khách đồng ý", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: ThumbsUp, hint: "Khách đã chốt đơn" },
  REJECTED: { label: "Khách từ chối", cls: "bg-rose-50 text-rose-700 ring-rose-200", icon: ThumbsDown, hint: "Khách không lấy / để sau" },
};
export function QuoteBadge({ status }: { status: QuoteStatus }) {
  const m = QUOTE_META[status] || QUOTE_META.DRAFT;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1", m.cls)}>
      <Icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tier                                                                */
/* ------------------------------------------------------------------ */
export const TIER_META: Record<string, { label: string; cls: string; emoji: string; color: string }> = {
  VIP: { label: "VIP", cls: "bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 ring-amber-200", emoji: "👑", color: "#f59e0b" },
  WHOLESALE: { label: "Khách sỉ", cls: "bg-brand-50 text-brand-700 ring-brand-200", emoji: "🏢", color: "#039dd5" },
  STANDARD: { label: "Khách thường", cls: "bg-ink-100 text-ink-600 ring-ink-200", emoji: "🛍️", color: "#858ea0" },
};
export function TierBadge({ tier }: { tier: string }) {
  const m = TIER_META[tier] || TIER_META.STANDARD;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1", m.cls)}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-pop-in" onClick={onClose} />
      <div className={cn("relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-ink-100 animate-pop-in max-h-[92vh] flex flex-col", w)}>
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-ink-100">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-base font-bold text-ink-900">{title}</h3>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-ink-100 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
export function useToast() {
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  };
  const node = toast ? (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 z-[70] animate-fade-up">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl",
          toast.type === "success" ? "bg-ink-900 text-white" : "bg-rose-600 text-white"
        )}
      >
        {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5" />}
        {toast.text}
      </div>
    </div>
  ) : null;
  return { show, node };
}

/* ------------------------------------------------------------------ */
/* EmptyState & Skeleton                                               */
/* ------------------------------------------------------------------ */
export function EmptyState({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-brand-200/50 blur-xl" />
        <div className="relative w-16 h-16 rounded-3xl bg-white border border-ink-100 shadow-soft flex items-center justify-center animate-float">
          <Icon className="w-7 h-7 text-brand-500" />
        </div>
      </div>
      <p className="font-semibold text-ink-800">{title}</p>
      {hint && <p className="text-sm text-ink-500 mt-1 max-w-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-ink-100", className)} />;
}

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */
export function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function timeAgo(d?: string | Date | null) {
  if (!d) return "Chưa có";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "Chưa có";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

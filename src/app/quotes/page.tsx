"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Download,
  MessageSquare,
  Check,
  Send,
  Loader2,
  CalendarClock,
  Package,
  ChevronRight,
  Trophy,
  Hourglass,
  FilePlus2,
} from "lucide-react";
import {
  Avatar,
  EmptyState,
  FadeIn,
  Modal,
  PageHeader,
  ProgressRing,
  QUOTE_META,
  QuoteBadge,
  QuoteStatus,
  Skeleton,
  SpotlightCard,
  StatCard,
  cn,
  formatDate,
  useToast,
} from "@/components/ui";
import type { QuoteData } from "@/lib/quotesData";

export default function QuotesListPage() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | QuoteStatus>("ALL");
  const [smsQuote, setSmsQuote] = useState<QuoteData | null>(null);
  const [smsText, setSmsText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusQuote, setStatusQuote] = useState<QuoteData | null>(null);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await fetch(`/api/quotes?status=ALL`);
      const data = await res.json();
      if (data.success) setQuotes(data.quotes || []);
    } catch {
      toast.show("Could not load quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: quotes.length, DRAFT: 0, SENT: 0, ACCEPTED: 0, REJECTED: 0 } as Record<string, number>;
    quotes.forEach((q) => c[q.status]++);
    return c;
  }, [quotes]);

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return quotes.filter(
      (q) =>
        (filter === "ALL" || q.status === filter) &&
        (!s || [q.quoteNumber, q.customer.businessName, q.customer.contactPerson, q.customer.phone].some((v) => (v || "").toLowerCase().includes(s)))
    );
  }, [quotes, filter, search]);

  const openSms = (q: QuoteData) => {
    setSmsQuote(q);
    setSmsText(
      `JKIOCEAN Houston: Hi ${q.customer.contactPerson} (${q.customer.businessName}), here is your price quote #${q.quoteNumber}, valid until ${new Date(
        q.validUntil
      ).toLocaleDateString("en-US")}. Reply here or call +1 (713) 330-6165 if you have any questions. Thank you!`
    );
  };

  const sendSms = async () => {
    if (!smsQuote) return;
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${smsQuote.id}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customMessage: smsText, targetPhone: smsQuote.customer.phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.show("Quote sent by text");
        setSmsQuote(null);
        load();
      } else toast.show(data.error || "Could not send", "error");
    } catch {
      toast.show("Connection error", "error");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (q: QuoteData, status: QuoteStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.show("Status updated");
        setStatusQuote(null);
        load();
      } else toast.show("Could not update", "error");
    } catch {
      toast.show("Connection error", "error");
    } finally {
      setUpdating(false);
    }
  };

  const winRate = counts.ACCEPTED + counts.REJECTED > 0 ? Math.round((counts.ACCEPTED / (counts.ACCEPTED + counts.REJECTED)) * 100) : 0;

  return (
    <div className="space-y-6">
      {toast.node}
      <PageHeader
        icon={FileText}
        title="Quotes"
        subtitle="Create, send and track quotes"
        actions={
          <Link href="/quotes/create" className="btn-primary">
            <Plus className="w-4 h-4" /> Create quote
          </Link>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn>
          <StatCard label="All quotes" value={counts.ALL} icon={FileText} tone="brand" onClick={() => setFilter("ALL")} active={filter === "ALL"} />
        </FadeIn>
        <FadeIn delay={60}>
          <StatCard label="Waiting for reply" value={counts.SENT} icon={Hourglass} tone="amber" onClick={() => setFilter("SENT")} active={filter === "SENT"} />
        </FadeIn>
        <FadeIn delay={120}>
          <StatCard label="Accepted" value={counts.ACCEPTED} icon={Trophy} tone="green" onClick={() => setFilter("ACCEPTED")} active={filter === "ACCEPTED"} />
        </FadeIn>
        <FadeIn delay={180}>
          <SpotlightCard className="p-5 h-full flex items-center gap-4">
            <ProgressRing value={counts.ACCEPTED} total={counts.ACCEPTED + counts.REJECTED} size={84} stroke={9} color="#8b5cf6">
              <span className="text-lg font-bold text-ink-900">{winRate}%</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-medium text-ink-500">Win rate</p>
              <p className="text-xs text-ink-400 mt-1">of quotes with an answer</p>
            </div>
          </SpotlightCard>
        </FadeIn>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={cn("chip", filter === k ? "chip-on" : "chip-off")}>
              {k === "ALL" ? "All" : QUOTE_META[k].label}
              <span className={cn("rounded-full px-1.5", filter === k ? "bg-white/20" : "bg-ink-100")}>{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
          <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quote # or shop..." className="input pl-11" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-3xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FilePlus2}
            title={quotes.length === 0 ? "No quotes yet" : "No matching quotes"}
            hint={quotes.length === 0 ? "Create your first quote with product photos and a PDF." : "Try another filter or search."}
            action={
              <Link href="/quotes/create" className="btn-primary">
                <Plus className="w-4 h-4" /> Create quote
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((q, i) => {
            const expired = new Date(q.validUntil).getTime() < Date.now() && q.status !== "ACCEPTED";
            const pcs = q.items.reduce((s, it) => s + it.quantity, 0);
            return (
              <FadeIn key={q.id} delay={Math.min(i, 9) * 40}>
                <SpotlightCard className="p-5 h-full flex flex-col card-hover">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-ink-400">{q.quoteNumber}</span>
                    <QuoteBadge status={q.status} />
                  </div>
                  <Link href={`/quotes/${q.id}`} className="mt-4 flex items-center gap-3 group/link">
                    <Avatar name={q.customer.businessName} />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 truncate group-hover/link:text-brand-600">{q.customer.businessName}</p>
                      <p className="text-xs text-ink-400 truncate">{q.customer.contactPerson}</p>
                    </div>
                  </Link>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-ink-50 px-3 py-2">
                      <p className="text-ink-400 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Products
                      </p>
                      <p className="font-semibold text-ink-800 mt-0.5">
                        {q.items.length} items · {pcs.toLocaleString("en-US")} pcs
                      </p>
                    </div>
                    <div className={cn("rounded-xl px-3 py-2", expired ? "bg-rose-50" : "bg-ink-50")}>
                      <p className={cn("flex items-center gap-1", expired ? "text-rose-500" : "text-ink-400")}>
                        <CalendarClock className="w-3 h-3" /> {expired ? "Expired" : "Valid until"}
                      </p>
                      <p className={cn("font-semibold mt-0.5", expired ? "text-rose-700" : "text-ink-800")}>{formatDate(q.validUntil)}</p>
                    </div>
                  </div>

                  <div className="flex-1" />
                  <div className="mt-4 pt-3 flex items-center gap-1 border-t border-ink-100">
                    <a href={`/api/quotes/${q.id}/pdf`} target="_blank" rel="noopener noreferrer" className="icon-btn" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </a>
                    <button onClick={() => openSms(q)} className="icon-btn" title="Send by text">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setStatusQuote(q)} className="icon-btn" title="Change status">
                      <Check className="w-4 h-4" />
                    </button>
                    <Link href={`/quotes/${q.id}`} className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 group/open">
                      Open <ChevronRight className="w-4 h-4 transition-transform group-hover/open:translate-x-0.5" />
                    </Link>
                  </div>
                </SpotlightCard>
              </FadeIn>
            );
          })}
        </div>
      )}

      {/* SMS modal */}
      <Modal
        open={!!smsQuote}
        onClose={() => setSmsQuote(null)}
        title="Send quote by text"
        icon={MessageSquare}
        footer={
          <>
            <button onClick={() => setSmsQuote(null)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={sendSms} disabled={sending || !smsText.trim()} className="btn-primary">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
            </button>
          </>
        }
      >
        {smsQuote && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
              <p className="text-sm font-semibold text-ink-900 truncate">{smsQuote.customer.businessName}</p>
              <span className="text-sm font-mono font-semibold text-brand-700">{smsQuote.customer.phone}</span>
            </div>
            <div>
              <p className="label">Message</p>
              <textarea rows={5} value={smsText} onChange={(e) => setSmsText(e.target.value)} className="input resize-none" />
            </div>
          </div>
        )}
      </Modal>

      {/* Status modal */}
      <Modal open={!!statusQuote} onClose={() => setStatusQuote(null)} title="Change status" icon={Check} size="sm">
        {statusQuote && (
          <div className="space-y-2">
            {(Object.keys(QUOTE_META) as QuoteStatus[]).map((s) => {
              const m = QUOTE_META[s];
              const Icon = m.icon;
              const on = statusQuote.status === s;
              return (
                <button
                  key={s}
                  disabled={updating}
                  onClick={() => changeStatus(statusQuote, s)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                    on ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:border-brand-200"
                  )}
                >
                  <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center ring-1", m.cls)}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900">{m.label}</p>
                    <p className="text-xs text-ink-400">{m.hint}</p>
                  </div>
                  {on && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

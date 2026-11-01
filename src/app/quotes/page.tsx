"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Filter,
  Phone,
  Building,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Check,
} from "lucide-react";
import { QuoteData } from "@/lib/quotesData";

export default function QuotesListPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stats, setStats] = useState({
    totalQuotesCount: 0,
    totalQuotesThisMonth: 0,
    totalAmountThisMonth: 0,
    pendingCount: 0,
    acceptedCount: 0,
    closedAmount: 0,
  });

  // Modal states
  const [smsModalQuote, setSmsModalQuote] = useState<QuoteData | null>(null);
  const [smsContent, setSmsContent] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

  const [statusModalQuote, setStatusModalQuote] = useState<QuoteData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setQuotes(data.quotes);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotes();
  };

  // Open Quo SMS modal
  const handleOpenSmsModal = (quote: QuoteData) => {
    setSmsModalQuote(quote);
    setSmsContent(
      `JKIOCEAN Houston Hub: Hi ${quote.customer.contactPerson} (${quote.customer.businessName}), here is your official wholesale price quote #${quote.quoteNumber}. Total: $${quote.totalAmount.toFixed(
        2
      )}. Valid until: ${new Date(quote.validUntil).toLocaleDateString("en-US")}. Free local delivery from Houston Distribution Hub. View full PDF or call hotline +1 (713) 330-6165.`
    );
    setSmsSuccess(false);
  };

  const handleSendSms = async () => {
    if (!smsModalQuote) return;
    try {
      setSendingSms(true);
      const res = await fetch(`/api/quotes/${smsModalQuote.id}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMessage: smsContent,
          targetPhone: smsModalQuote.customer.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsSuccess(true);
        setTimeout(() => {
          setSmsModalQuote(null);
          setSmsSuccess(false);
          fetchQuotes();
        }, 1500);
      }
    } catch (err) {
      console.error("Error sending SMS:", err);
    } finally {
      setSendingSms(false);
    }
  };

  const handleChangeStatus = async (quoteId: string, newStatus: QuoteData["status"]) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusModalQuote(null);
        fetchQuotes();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: QuoteData["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Send className="w-3 h-3 mr-1" />
            Sent
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">B2B Quotes & Invoices</h1>
            <span className="bg-[#253c68]/10 text-[#253c68] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-[#253c68]/20">
              Houston Hub
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, and dispatch official JKIOCEAN wholesale price quotes with 1-click PDF and SMS delivery.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchQuotes()}
            title="Refresh Quotes"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/quotes/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#253c68] to-[#1e3054] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#253c68]/20 hover:shadow-[#253c68]/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quote</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quotes This Month</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${stats.totalAmountThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="font-bold text-blue-600">{stats.totalQuotesThisMonth} quotes</span>
              <span>issued this month</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Response</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.pendingCount}</span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-amber-600">Draft & Sent</span>
              <span>require follow-up</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Closed Revenue ($)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              ${stats.closedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="font-bold text-emerald-600">{stats.acceptedCount} accepted quotes</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quote Win Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalQuotesCount > 0
                ? `${Math.round((stats.acceptedCount / stats.totalQuotesCount) * 100)}%`
                : "0%"}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>Total: </span>
              <span className="font-bold text-slate-700">{stats.totalQuotesCount} quotes</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All" },
              { id: "DRAFT", label: "Draft" },
              { id: "SENT", label: "Sent" },
              { id: "ACCEPTED", label: "Accepted" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#253c68] text-white shadow-md shadow-[#253c68]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[300px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quote #, customer name, phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Quote #</th>
                <th className="py-3.5 px-4">Customer / Salon</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Sales Rep</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#253c68]" />
                      <span className="text-xs">Loading quotation list...</span>
                    </div>
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-600">No quotes found</span>
                      <span className="text-xs text-slate-400">Create a new wholesale quote for B2B salons</span>
                    </div>
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const createdDate = new Date(quote.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const validDate = new Date(quote.validUntil).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const isExpired = new Date(quote.validUntil).getTime() < Date.now();

                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Quote Number */}
                      <td className="py-4 px-4 font-mono font-bold text-[#253c68]">
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="hover:underline flex items-center space-x-1.5"
                        >
                          <span>{quote.quoteNumber}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{quote.customer.businessName}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{quote.customer.contactPerson}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{quote.customer.phone}</span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-600">{createdDate}</td>

                      {/* Valid Until */}
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className={isExpired ? "text-rose-600 font-bold" : "text-slate-700 font-medium"}>
                            {validDate}
                          </span>
                          {isExpired && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items Count & Preview */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700">
                          <span>{quote.items.length} items</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500">
                            {quote.items.reduce((s, it) => s + it.quantity, 0)} pcs
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 text-base">
                        ${quote.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">{getStatusBadge(quote.status)}</td>

                      {/* Sales Rep */}
                      <td className="py-4 px-4 text-center text-xs font-medium text-slate-700">
                        {quote.createdUser || "Johnny Tran"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* View Detail */}
                          <Link
                            href={`/quotes/${quote.id}`}
                            title="View / Edit Quote Details"
                            className="p-1.5 text-slate-500 hover:text-[#253c68] hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Download PDF */}
                          <a
                            href={`/api/quotes/${quote.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download PDF"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Send Quo SMS */}
                          <button
                            onClick={() => handleOpenSmsModal(quote)}
                            title="Send SMS via Quo (+1-713-330-6165)"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Change Status */}
                          <button
                            onClick={() => setStatusModalQuote(quote)}
                            title="Update Status"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quo SMS Send Modal */}
      {smsModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Send Quote via Quo SMS</h3>
                  <p className="text-xs text-slate-500">From Houston Hub Hotline: +1 (713) 330-6165</p>
                </div>
              </div>
              <button
                onClick={() => setSmsModalQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient Customer / Salon:</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{smsModalQuote.customer.businessName}</span>
                    <span className="text-slate-400 ml-1">({smsModalQuote.customer.contactPerson})</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {smsModalQuote.customer.phone}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SMS Message Content:</label>
                <textarea
                  rows={4}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {smsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center space-x-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>SMS sent successfully! Quote status updated to SENT.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                disabled={sendingSms}
                onClick={() => setSmsModalQuote(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
              >
                Close
              </button>
              <button
                disabled={sendingSms || smsSuccess}
                onClick={handleSendSms}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {sendingSms ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending via Quo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Update Quote Status</h3>
              <button
                onClick={() => setStatusModalQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Quote <strong className="text-slate-800">{statusModalQuote.quoteNumber}</strong> for{" "}
              <strong>{statusModalQuote.customer.businessName}</strong>.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {[
                { status: "DRAFT", label: "Draft", desc: "Internal draft in preparation" },
                { status: "SENT", label: "Sent", desc: "Official PDF / SMS dispatched to client" },
                { status: "ACCEPTED", label: "Accepted", desc: "Client confirmed wholesale order" },
                { status: "REJECTED", label: "Rejected", desc: "Client declined or postponed" },
              ].map((opt) => (
                <button
                  key={opt.status}
                  disabled={updatingStatus}
                  onClick={() => handleChangeStatus(statusModalQuote.id, opt.status as QuoteData["status"])}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    statusModalQuote.status === opt.status
                      ? "border-[#253c68] bg-[#253c68]/5 font-bold"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                  {statusModalQuote.status === opt.status && <Check className="w-4 h-4 text-[#253c68]" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStatusModalQuote(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

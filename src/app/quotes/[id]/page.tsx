"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Check,
  RefreshCw,
  Share2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Copy,
  FileSpreadsheet,
  ThumbsUp,
} from "lucide-react";
import { QuoteData } from "@/lib/quotesData";
import { EmptyState, Modal, QuoteBadge, Skeleton } from "@/components/ui";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const handleCopyQuoteText = () => {
    if (!quote) return;
    const lines = [
      `[JKIOCEAN WHOLESALE PRICE QUOTE] #${quote.quoteNumber}`,
      `Prepared For: ${quote.customer.contactPerson} (${quote.customer.businessName})`,
      `Phone: ${quote.customer.phone}`,
      `Address: ${quote.customer.address || ""}, ${quote.customer.city || ""}, ${quote.customer.state || ""}`,
      `Valid Until: ${new Date(quote.validUntil).toLocaleDateString("en-US")}`,
      `------------------------------------------`,
      ...quote.items.map((it, idx) => `${idx + 1}. ${it.productName} [${it.sku}]\n   Qty: ${it.quantity} x $${it.unitPrice.toFixed(2)} = $${it.lineTotal.toFixed(2)}`),
      `------------------------------------------`,
      `TOTAL: $${quote.totalAmount.toFixed(2)}`,
      `------------------------------------------`,
      `Hotline: +1 (713) 330-6165`,
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleExportCsv = () => {
    if (!quote) return;
    const headers = ["Item #", "SKU", "Product Name", "Category", "Quantity", "Unit Price ($)", "Line Total ($)"];
    const rows = quote.items.map((it, idx) => [
      idx + 1,
      `"${it.sku}"`,
      `"${it.productName.replace(/"/g, '""')}"`,
      `"${(it.category || '').replace(/"/g, '""')}"`,
      it.quantity,
      it.unitPrice.toFixed(2),
      it.lineTotal.toFixed(2)
    ]);
    const summaryRows = [
      [],
      ["", "", "", "", "", "TOTAL:", quote.totalAmount.toFixed(2)]
    ];

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(",")), ...summaryRows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quote_${quote.quoteNumber}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // SMS Modal
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsContent, setSmsContent] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes/${id}`);
      const data = await res.json();
      if (data.success && data.quote) {
        setQuote(data.quote);
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuote();
    }
  }, [id]);

  const handleOpenSms = () => {
    if (!quote) return;
    setSmsContent(
      `JKIOCEAN Houston Hub: Hi ${quote.customer.contactPerson} (${quote.customer.businessName}), here is your official wholesale price quote #${quote.quoteNumber}. Valid until: ${new Date(quote.validUntil).toLocaleDateString("en-US")}. Free local delivery from Houston Hub. Download PDF or call our hotline at +1 (713) 330-6165.`
    );
    setSmsSuccess(false);
    setShowSmsModal(true);
  };

  const handleSendSms = async () => {
    if (!quote) return;
    try {
      setSendingSms(true);
      const res = await fetch(`/api/quotes/${quote.id}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMessage: smsContent,
          targetPhone: quote.customer.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsSuccess(true);
        setTimeout(() => {
          setShowSmsModal(false);
          setSmsSuccess(false);
          fetchQuote();
        }, 1500);
      }
    } catch (err) {
      console.error("Error sending SMS:", err);
    } finally {
      setSendingSms(false);
    }
  };

  const handleStatusChange = async (newStatus: QuoteData["status"]) => {
    if (!quote) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchQuote();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quote) return;
    setDownloadingPdf(true);
    // Direct link to PDF route
    window.open(`/api/quotes/${quote.id}/pdf`, "_blank");
    setTimeout(() => setDownloadingPdf(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="card max-w-lg mx-auto mt-10">
        <EmptyState
          icon={AlertCircle}
          title="Quote not found"
          action={
            <Link href="/quotes" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to list
            </Link>
          }
        />
      </div>
    );
  }

  const formattedCreated = new Date(quote.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedValid = new Date(quote.validUntil).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action bar */}
      <div className="print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="icon-btn bg-white border border-ink-100 shadow-sm" title="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-900 font-mono">{quote.quoteNumber}</h1>
              <QuoteBadge status={quote.status} />
            </div>
            <p className="text-sm text-ink-500">{quote.customer.businessName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl bg-white border border-ink-100 p-1 shadow-sm">
            <button onClick={handleCopyQuoteText} className="icon-btn" title={copiedToast ? "Copied" : "Copy as text for a message"}>
              {copiedToast ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleExportCsv} className="icon-btn" title="Export Excel (CSV)">
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="icon-btn" title="In">
              <Printer className="w-4 h-4" />
            </button>
          </div>
          {quote.status !== "ACCEPTED" && (
            <button disabled={updatingStatus} onClick={() => handleStatusChange("ACCEPTED")} className="btn-ghost !text-emerald-700 hover:!border-emerald-300">
              <ThumbsUp className="w-4 h-4" /> Mark accepted
            </button>
          )}
          <button onClick={handleOpenSms} className="btn-dark">
            <MessageSquare className="w-4 h-4" /> Send text
          </button>
          <button disabled={downloadingPdf} onClick={handleDownloadPdf} className="btn-primary">
            {downloadingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
          </button>
        </div>
      </div>

      {/* Branded Live Quotation Document Preview (Pixel-Perfect 1:1 with PDF) */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-lift overflow-hidden p-6 sm:p-10 animate-fade-up text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Brand Header */}
        <div className="mb-6 pb-6 border-b-4 border-brand-500 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="JKI OCEAN" className="h-16 w-auto" />
            <div className="text-xs italic text-brand-600 uppercase tracking-widest mt-2">Let Beauty Begin</div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-900 text-sm">JKIOCEAN GLOBAL LLC</strong>
            <br />
            10606 Bellaire Blvd, Suite 108, Houston, TX 77036
            <br />
            Tel: <span className="text-brand-600 font-bold">+1 (713) 330-6165</span> · support@jkiocean.com
            <br />
            www.jkioceanhub.com
          </div>
        </div>

        {/* Customer & Quote Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Bill To */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-dashed border-slate-300 pb-1.5 flex items-center justify-between">
              <span>Prepared For (B2B Customer / Salon)</span>
            </div>
            <div className="text-base font-extrabold text-brand-700">{quote.customer.businessName}</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Person:</span>
                <span className="font-semibold text-slate-800">{quote.customer.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{quote.customer.phone}</span>
              </div>
              {quote.customer.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-700">{quote.customer.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Salon Address:</span>
                <span className="text-slate-800 font-medium text-right">
                  {[quote.customer.address, quote.customer.city, [quote.customer.state, quote.customer.zipCode].filter(Boolean).join(" ")]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Quotation Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-dashed border-slate-300 pb-1.5">
              Quote Details
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Quote #:</span>
                <span className="font-mono font-bold text-brand-700 text-sm">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issue Date:</span>
                <span className="font-medium text-slate-800">{formattedCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Until:</span>
                <span className="font-bold text-amber-700">{formattedValid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sales Representative:</span>
                <span className="font-semibold text-slate-800">{quote.createdUser || "Johnny Tran"} (Houston Hub)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-700 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 text-center" style={{ width: "40px" }}>
                  Item #
                </th>
                <th className="py-3 px-3 text-center" style={{ width: "90px" }}>
                  Image
                </th>
                <th className="py-3 px-3">Description & SKU</th>
                <th className="py-3 px-3 text-center" style={{ width: "70px" }}>
                  Qty
                </th>
                <th className="py-3 px-3 text-right" style={{ width: "100px" }}>
                  Unit Price
                </th>
                <th className="py-3 px-3 text-right" style={{ width: "110px" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {quote.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="w-16 h-16 mx-auto rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
                      <img
                        src={it.imageUrl || "/logo.png"}
                        alt={it.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 text-sm">{it.productName}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                        {it.sku}
                      </span>
                      {it.category && (
                        <span className="text-[10px] bg-sky-50 text-brand-700 font-bold px-2 py-0.5 rounded">
                          {it.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800 text-sm">{it.quantity}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 text-sm">
                    ${it.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ${it.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-80 rounded-xl border border-slate-200 p-4 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900 uppercase">Total (USD)</span>
            <span className="bg-brand-700 text-white px-3 py-1 rounded-lg font-mono font-black text-lg">${quote.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
          Thank you for your business! This official wholesale price quote is generated by JKIOCEAN LLC - Houston Distribution Hub • Tel: +1 (713) 330-6165 • Email: support@jkiocean.com
        </div>
      </div>

      <Modal
        open={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        title="Send quote by text"
        icon={MessageSquare}
        footer={
          <>
            <button onClick={() => setShowSmsModal(false)} className="btn-ghost">
              Cancel
            </button>
            <button disabled={sendingSms || smsSuccess} onClick={handleSendSms} className="btn-primary">
              {sendingSms ? <RefreshCw className="w-4 h-4 animate-spin" /> : smsSuccess ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {smsSuccess ? "Sent" : "Send"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900 truncate">{quote.customer.businessName}</p>
            <span className="text-sm font-mono font-semibold text-brand-700">{quote.customer.phone}</span>
          </div>
          <div>
            <p className="label">Message</p>
            <textarea rows={5} value={smsContent} onChange={(e) => setSmsContent(e.target.value)} className="input resize-none" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

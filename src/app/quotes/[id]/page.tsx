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
  ShieldCheck,
  Check,
  RefreshCw,
  Share2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { QuoteData } from "@/lib/quotesData";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
      `JKIOCEAN: Chào chị ${quote.customer.contactPerson} (${quote.customer.businessName}), JKIOCEAN xin gửi báo giá chính thức #${quote.quoteNumber}. Tổng tiền: $${quote.totalAmount.toFixed(
        2
      )}. Hiệu lực đến: ${new Date(quote.validUntil).toLocaleDateString("en-US")}. Miễn phí giao hàng nội thành Houston Hub. Chị bấm vào link tải PDF hoặc liên hệ hotline +1-713-330-6165.`
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
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#253c68]" />
        <span className="text-sm font-semibold text-slate-600">Đang tải chi tiết báo giá...</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy báo giá</h2>
        <p className="text-xs text-slate-500">Mã báo giá không tồn tại hoặc đã bị xóa</p>
        <Link
          href="/quotes"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#253c68] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            href="/quotes"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400">Báo Giá:</span>
              <span className="text-lg font-black text-slate-900 font-mono">{quote.quoteNumber}</span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  quote.status === "ACCEPTED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : quote.status === "SENT"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : quote.status === "REJECTED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {quote.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Khách hàng: {quote.customer.businessName}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Toggle */}
          {quote.status !== "ACCEPTED" && (
            <button
              disabled={updatingStatus}
              onClick={() => handleStatusChange("ACCEPTED")}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Đánh Dấu Đã Chốt</span>
            </button>
          )}

          {/* Send Quo SMS */}
          <button
            onClick={handleOpenSms}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-emerald-600/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gửi Quo SMS</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Bản Giấy</span>
          </button>

          {/* Download PDF */}
          <button
            disabled={downloadingPdf}
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-gradient-to-r from-[#253c68] to-[#1e3054] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#253c68]/20 hover:scale-[1.01] transition-all flex items-center space-x-1.5"
          >
            {downloadingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tạo PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Tải File PDF Chuẩn</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Branded Live Quotation Document Preview (Pixel-Perfect 1:1 with PDF) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden p-6 sm:p-10 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-[#1a2c4e] to-[#253c68] text-white p-6 sm:p-7 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-start gap-4 border-l-8 border-[#38bdf8] shadow-md">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-black tracking-wider text-white">JKIOCEAN</span>
            </div>
            <div className="text-xs italic text-[#93c5fd] uppercase tracking-widest mt-1">
              Let Beauty Begin
            </div>
            <div className="inline-block bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#7dd3fc] text-[10px] font-extrabold px-2.5 py-0.5 rounded mt-3 uppercase tracking-wider">
              ★ Houston Logistics & Distribution Hub ★
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-200 leading-relaxed">
            <strong className="text-white text-sm">JKIOCEAN GLOBAL LLC</strong>
            <br />
            10606 Bellaire Blvd, Suite 108
            <br />
            Houston, TX 77036
            <br />
            Tel:{" "}
            <span className="text-[#38bdf8] font-bold font-mono text-sm">+1 (713) 330-6165</span>
            <br />
            Email: <span className="text-[#38bdf8] font-semibold">support@jkiocean.com</span>
            <br />
            Web: <strong>www.jkioceanhub.com</strong>
          </div>
        </div>

        {/* Customer & Quote Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Bill To */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-dashed border-slate-300 pb-1.5 flex items-center justify-between">
              <span>Bill To (Khách Hàng B2B / Salon)</span>
              {quote.customer.tier && (
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                  {quote.customer.tier}
                </span>
              )}
            </div>
            <div className="text-base font-extrabold text-[#253c68]">{quote.customer.businessName}</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Người phụ trách:</span>
                <span className="font-semibold text-slate-800">{quote.customer.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Điện thoại:</span>
                <span className="font-mono font-bold text-slate-900">{quote.customer.phone}</span>
              </div>
              {quote.customer.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-700">{quote.customer.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Địa chỉ salon:</span>
                <span className="text-slate-800 font-medium text-right">
                  {quote.customer.address || "10606 Bellaire Blvd"}, {quote.customer.city || "Houston"},{" "}
                  {quote.customer.state || "TX"} {quote.customer.zipCode || "77036"}
                </span>
              </div>
            </div>
          </div>

          {/* Quotation Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-dashed border-slate-300 pb-1.5">
              Chi Tiết Báo Giá (Quotation Info)
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mã số báo giá:</span>
                <span className="font-mono font-bold text-[#253c68] text-sm">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày phát hành:</span>
                <span className="font-medium text-slate-800">{formattedCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hiệu lực đến (Valid Until):</span>
                <span className="font-bold text-amber-700">{formattedValid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phụ trách kinh doanh:</span>
                <span className="font-semibold text-slate-800">{quote.createdUser} (Houston Hub)</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    quote.status === "ACCEPTED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : quote.status === "SENT"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : quote.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {quote.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#253c68] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 text-center" style={{ width: "40px" }}>
                  #
                </th>
                <th className="py-3 px-3 text-center" style={{ width: "90px" }}>
                  Hình Ảnh
                </th>
                <th className="py-3 px-3">Sản Phẩm & SKU</th>
                <th className="py-3 px-3 text-center" style={{ width: "70px" }}>
                  SL
                </th>
                <th className="py-3 px-3 text-right" style={{ width: "100px" }}>
                  Đơn Giá Sỉ
                </th>
                <th className="py-3 px-3 text-right" style={{ width: "80px" }}>
                  CK (%)
                </th>
                <th className="py-3 px-3 text-right" style={{ width: "110px" }}>
                  Thành Tiền
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
                        src={it.imageUrl || "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=300"}
                        alt={it.productName}
                        className="w-full h-full object-cover"
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
                        <span className="text-[10px] bg-sky-50 text-[#253c68] font-bold px-2 py-0.5 rounded">
                          {it.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800 text-sm">{it.quantity}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 text-sm">
                    ${it.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600 text-sm">
                    {it.discount > 0 ? `-${it.discount}%` : "-"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ${it.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
          <div className="sm:col-span-7 bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-dashed border-slate-300 pb-1.5">
              Ghi Chú Đơn Hàng & Vận Chuyển
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {quote.notes || "Giao hàng tận nơi miễn phí cho salon khu vực Greater Houston."}
            </p>
            <div className="pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-[#253c68]">Chính sách chất lượng:</strong> 100% cọ JKIOCEAN được kiểm định
              chất lượng lông cọ Kolinsky nguyên chất, bảo hành lỗi sản xuất đổi mới 1:1 trong 30 ngày đầu tiên.
            </div>
          </div>

          <div className="sm:col-span-5 bg-white border border-slate-300 rounded-xl p-4 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng (Subtotal):</span>
              <span className="font-bold text-slate-800">${quote.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Chiết khấu sỉ (Savings):</span>
              <span>-${quote.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Vận chuyển (Houston Local):</span>
              <span className="font-bold text-emerald-600">
                {quote.shipping === 0 ? "FREE ($0.00)" : `$${quote.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Thuế Resale (Tax Exempt):</span>
              <span className="font-bold text-slate-800">$0.00</span>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t-2 border-[#253c68] flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase block">TỔNG CỘNG (USD)</span>
              </div>
              <span className="bg-[#253c68] text-white px-3 py-1 rounded-lg font-mono font-black text-lg">
                ${quote.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Terms Info Box */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 mb-6 text-xs text-sky-900 space-y-2">
          <div className="font-extrabold uppercase tracking-wider text-sky-800 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Phương Thức Thanh Toán & Cam Kết (Payment Terms)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed pt-1">
            <div>
              • <strong>Zelle:</strong> <span className="font-mono font-bold">pay@jkiocean.com</span> (JKIOCEAN LLC)
              <br />• <strong>Company Check:</strong> Kính gửi <em>"JKIOCEAN LLC"</em> (Houston Hub)
            </div>
            <div>
              • <strong>Credit Card:</strong> Visa / Mastercard / Amex (Hóa đơn điện tử)
              <br />• <strong>Giao hàng:</strong> Xe kho Houston Hub giao trực tiếp trong 24 giờ làm việc
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐẠI DIỆN JKIOCEAN GLOBAL</div>
            <div className="mt-14 border-b border-dashed border-slate-400 pb-1 font-bold text-slate-900 text-xs">
              {quote.createdUser}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Houston Distribution Hub Manager</div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              XÁC NHẬN CỦA KHÁCH HÀNG / SALON
            </div>
            <div className="mt-14 border-b border-dashed border-slate-400 pb-1 font-bold text-slate-900 text-xs">
              {quote.customer.contactPerson}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{quote.customer.businessName}</div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
          Báo giá này được tạo tự động bởi Hệ Thống ERP JKIOCEAN Houston Hub • Hotline: +1 (713) 330-6165 • Email:
          support@jkiocean.com
        </div>
      </div>

      {/* Quo SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Gửi Báo Giá Qua Quo SMS</h3>
                  <p className="text-xs text-slate-500">Tổng đài Houston Hub: +1 (713) 330-6165</p>
                </div>
              </div>
              <button onClick={() => setShowSmsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại Salon nhận tin:</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">{quote.customer.businessName}</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {quote.customer.phone}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung tin nhắn:</label>
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
                  <span>Đã gửi SMS thành công & cập nhật trạng thái báo giá thành ĐÃ GỬI (SENT)!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                disabled={sendingSms}
                onClick={() => setShowSmsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              <button
                disabled={sendingSms || smsSuccess}
                onClick={handleSendSms}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {sendingSms ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi qua Quo SMS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác Nhận Gửi SMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  DollarSign,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Send,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Building2,
  CreditCard,
  X,
  MessageSquare,
  Calendar,
  User,
  Check,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

interface CustomerInfo {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  state?: string;
  city?: string;
}

interface OrderAR {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  daysPastDue: number;
  agingBucket: "0-30" | "31-60" | "61-90" | ">90";
  bucketLabel: string;
  saleRep: string;
  notes?: string;
  customer: CustomerInfo;
}

interface ARSummary {
  totalOutstanding: number;
  totalOverdue: number;
  totalPaid: number;
  totalInvoices: number;
  buckets: {
    current: { amount: number; count: number; label: string };
    bucket31_60: { amount: number; count: number; label: string };
    bucket61_90: { amount: number; count: number; label: string };
    bucketOver90: { amount: number; count: number; label: string };
  };
}

export default function AccountsReceivablePage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderAR[]>([]);
  const [summary, setSummary] = useState<ARSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bucketFilter, setBucketFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Payment Record Modal
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderAR | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Zelle");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Quo SMS Modal
  const [selectedOrderForSms, setSelectedOrderForSms] = useState<OrderAR | null>(null);
  const [smsContent, setSmsContent] = useState<string>("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchARData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ar");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Error fetching AR data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchARData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Open Payment Modal
  const handleOpenPayment = (order: OrderAR) => {
    setSelectedOrderForPayment(order);
    setPaymentAmount(order.balanceDue.toString());
    setPaymentMethod("Zelle");
    setPaymentNotes("");
  };

  // Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Vui lòng nhập số tiền hợp lệ (> 0)", "error");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch("/api/ar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForPayment.id,
          amountPaid: amount,
          paymentMethod,
          notes: paymentNotes,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(`Đã thu thành công $${amount.toFixed(2)} từ ${selectedOrderForPayment.customer?.businessName}`);
        setSelectedOrderForPayment(null);
        await fetchARData();
      } else {
        showToast(resData.error || "Lỗi khi ghi nhận thanh toán", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi mạng hoặc hệ thống", "error");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Open Quo SMS Modal
  const handleOpenSmsModal = (order: OrderAR) => {
    setSelectedOrderForSms(order);
    const contact = order.customer?.contactPerson || order.customer?.businessName || "Quý khách";
    const dueDateStr = new Date(order.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const defaultMessage = `Hi ${contact}, polite reminder from JKIOCEAN Houston regarding Invoice #${
      order.orderNumber
    } with an outstanding balance of $${order.balanceDue.toFixed(
      2
    )} (Due: ${dueDateStr}). You can conveniently pay via Zelle to +1(713) 330-6165 (JKIOCEAN LLC). Please let us know if you need any assistance!`;

    setSmsContent(defaultMessage);
  };

  // Apply quick templates for Quo SMS
  const applyTemplate = (type: "gentle" | "urgent" | "zelle") => {
    if (!selectedOrderForSms) return;
    const contact = selectedOrderForSms.customer?.contactPerson || selectedOrderForSms.customer?.businessName || "Quý khách";
    const dueDateStr = new Date(selectedOrderForSms.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (type === "gentle") {
      setSmsContent(
        `Hi ${contact}, friendly check-in from JKIOCEAN Houston regarding Invoice #${selectedOrderForSms.orderNumber}. Balance: $${selectedOrderForSms.balanceDue.toFixed(2)} due on ${dueDateStr}. Thank you for your continued business!`
      );
    } else if (type === "urgent") {
      setSmsContent(
        `[URGENT] Hi ${contact}, this is an urgent notification from JKIOCEAN regarding past due Invoice #${selectedOrderForSms.orderNumber} with balance of $${selectedOrderForSms.balanceDue.toFixed(2)} (${selectedOrderForSms.daysPastDue} days overdue). Please send payment today via Zelle to +1(713) 330-6165 to avoid order holds.`
      );
    } else {
      setSmsContent(
        `Hi ${contact}, JKIOCEAN Zelle payment details: Recipient: JKIOCEAN LLC | Phone: +1 (713) 330-6165 | Memo: Inv #${selectedOrderForSms.orderNumber}. Amount: $${selectedOrderForSms.balanceDue.toFixed(2)}. Once transferred, reply here with the confirmation. Thank you!`
      );
    }
  };

  // Dispatch Quo SMS
  const handleSendQuoSms = async () => {
    if (!selectedOrderForSms || !smsContent.trim()) return;

    setIsSendingSms(true);
    try {
      const res = await fetch("/api/quo/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedOrderForSms.customer?.phone,
          content: smsContent.trim(),
          type: "AR_REMINDER",
          customerId: selectedOrderForSms.customerId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(
          `Đã gửi Quo SMS thành công đến ${selectedOrderForSms.customer?.businessName} (${selectedOrderForSms.customer?.phone})!`
        );
        setSelectedOrderForSms(null);
      } else {
        showToast(resData.error || "Không thể gửi SMS qua Quo", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi kết nối Quo SMS", "error");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm);

    const matchesBucket =
      bucketFilter === "ALL" || order.agingBucket === bucketFilter;

    const matchesStatus =
      statusFilter === "ALL" || order.paymentStatus === statusFilter;

    return matchesSearch && matchesBucket && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all duration-300 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-900/20"
              : "bg-rose-600 text-white shadow-rose-900/20"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#253c68] via-[#1a2c4e] to-[#253c68] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#38bdf8]/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Receipt className="w-6 h-6 text-[#38bdf8]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Accounts Receivable (Công Nợ Khách Hàng)</h1>
                <p className="text-sm text-slate-300">
                  Phân loại nợ theo tuổi hóa đơn (Aging Buckets), nhắc nợ 1-click qua Quo SMS US Hotline
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchARData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
            <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Quo US SMS Ready (+1 713-330-6165)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Tổng Công Nợ Còn Lại"
          value={`$${(summary?.totalOutstanding || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${summary?.totalInvoices || 0} hóa đơn chưa thu xong`}
          icon={DollarSign}
          color="navy"
          badge="Total AR"
        />

        <MetricCard
          title="Current (0-30 Ngày)"
          value={`$${(summary?.buckets?.current?.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${summary?.buckets?.current?.count || 0} đơn an toàn / mới xuất`}
          icon={CheckCircle2}
          color="emerald"
          badge="0-30D"
        />

        <MetricCard
          title="31 - 60 Ngày"
          value={`$${(summary?.buckets?.bucket31_60?.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${summary?.buckets?.bucket31_60?.count || 0} đơn cần gửi nhắc nợ đợt 1`}
          icon={Clock}
          color="amber"
          badge="31-60D"
        />

        <MetricCard
          title="61 - 90 Ngày"
          value={`$${(summary?.buckets?.bucket61_90?.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${summary?.buckets?.bucket61_90?.count || 0} đơn nguy cơ quá hạn cao`}
          icon={AlertTriangle}
          color="rose"
          badge="61-90D"
        />

        <MetricCard
          title="> 90 Ngày Quá Hạn"
          value={`$${(summary?.buckets?.bucketOver90?.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${summary?.buckets?.bucketOver90?.count || 0} đơn nợ xấu / gọi trực tiếp`}
          icon={AlertOctagon}
          color="rose"
          badge=">90D Nợ Xấu"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Salon, Order #, chủ tiệm, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Aging Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(["ALL", "0-30", "31-60", "61-90", ">90"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  bucketFilter === b
                    ? "bg-[#253c68] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {b === "ALL" ? "Tất cả" : b}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#253c68]"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
            <option value="PARTIAL">Thanh toán một phần (PARTIAL)</option>
            <option value="OVERDUE">Quá hạn (OVERDUE)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Order # & Ngày</th>
                <th className="py-3.5 px-4">Salon / Khách Hàng</th>
                <th className="py-3.5 px-4">Hạn TT (Due Date)</th>
                <th className="py-3.5 px-4 text-right">Tổng Đơn</th>
                <th className="py-3.5 px-4 text-right">Đã Trả</th>
                <th className="py-3.5 px-4 text-right">Còn Nợ (Balance)</th>
                <th className="py-3.5 px-4 text-center">Tuổi Nợ (Bucket)</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#253c68]" />
                    <span>Đang tải danh sách công nợ...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Không có hóa đơn công nợ phù hợp!</p>
                    <p className="text-xs text-slate-400 mt-1">Toàn bộ khách hàng đã thanh toán hoặc không khớp bộ lọc.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCritical = order.agingBucket === ">90";
                  const isHighAlert = order.agingBucket === "61-90";
                  const isWarning = order.agingBucket === "31-60";

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* Order # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{order.orderNumber}</div>
                        <div className="text-[11px] font-normal text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>

                      {/* Salon / Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer?.businessName || "Salon"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{order.customer?.contactPerson || "Chủ tiệm"}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-[#253c68] font-semibold">
                            {order.customer?.phone}
                          </span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {new Date(order.dueDate).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-[11px]">
                          {order.daysPastDue > 0 ? (
                            <span className="text-rose-600 font-bold">
                              Trễ {order.daysPastDue} ngày
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Còn {Math.abs(order.daysPastDue)} ngày</span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-semibold">
                        ${order.paidAmount.toFixed(2)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-rose-600 text-base">
                        ${order.balanceDue.toFixed(2)}
                      </td>

                      {/* Aging Bucket Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            isCritical
                              ? "bg-rose-100 text-rose-700 border border-rose-300"
                              : isHighAlert
                              ? "bg-orange-100 text-orange-700 border border-orange-300"
                              : isWarning
                              ? "bg-amber-100 text-amber-700 border border-amber-300"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          }`}
                        >
                          {order.agingBucket === "0-30"
                            ? "Current (0-30)"
                            : order.agingBucket === "31-60"
                            ? "31-60 Ngày"
                            : order.agingBucket === "61-90"
                            ? "61-90 Ngày"
                            : ">90 Ngày"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.paymentStatus === "PARTIAL"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => handleOpenPayment(order)}
                            title="Ghi nhận thu nợ"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Thu tiền</span>
                          </button>

                          {/* Quo SMS 1-Click Reminder */}
                          <button
                            onClick={() => handleOpenSmsModal(order)}
                            title="1-Click Quo SMS Reminder"
                            className="px-2.5 py-1.5 rounded-lg bg-[#253c68] hover:bg-[#1a2c4e] text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>SMS</span>
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

      {/* MODAL 1: GHI NHẬN THU NỢ (RECORD PAYMENT) */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-5 h-5 text-[#38bdf8]" />
                <h3 className="font-extrabold text-base">Ghi Nhận Thu Nợ Đơn Hàng</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForPayment(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Hóa đơn:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedOrderForPayment.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Khách hàng:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrderForPayment.customer?.businessName}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Số nợ hiện tại:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    ${selectedOrderForPayment.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Số tiền thu ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#253c68] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#253c68]"
                >
                  <option value="Zelle">Zelle (+1 713-330-6165 JKIOCEAN LLC)</option>
                  <option value="Check">Check (Chi phiếu gửi tiệm/bưu điện)</option>
                  <option value="Credit Card">Credit Card / POS</option>
                  <option value="Bank Wire">Bank Wire Transfer</option>
                  <option value="Cash">Tiền mặt (Cash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ghi chú giao dịch
                </label>
                <input
                  type="text"
                  placeholder="Mã reference Zelle, số check, người chuyển..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  {isSubmittingPayment ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Xác nhận thu nợ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GỬI QUO SMS NHẮC CÔNG NỢ (1-CLICK SMS) */}
      {selectedOrderForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="w-5 h-5 text-[#38bdf8]" />
                <div>
                  <h3 className="font-extrabold text-base">Quo SMS Nhắc Nợ Tức Thì</h3>
                  <p className="text-[11px] text-slate-300">Hotline gửi: +1 (713) 330-6165 (Quo US)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForSms(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Recipient Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Gửi tới: </span>
                  <span className="font-bold text-slate-900">
                    {selectedOrderForSms.customer?.businessName} ({selectedOrderForSms.customer?.contactPerson})
                  </span>
                </div>
                <div className="font-mono font-bold text-[#253c68] bg-[#253c68]/10 px-2 py-0.5 rounded">
                  {selectedOrderForSms.customer?.phone}
                </div>
              </div>

              {/* Template quick select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Chọn mẫu tin nhắn nhanh
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate("gentle")}
                    className="p-2 rounded-xl border border-slate-200 hover:border-[#253c68] text-left text-xs bg-slate-50 hover:bg-white transition-all group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-[#253c68]">Lịch sự</div>
                    <div className="text-[10px] text-slate-400">Đơn trong hạn</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("urgent")}
                    className="p-2 rounded-xl border border-rose-200 hover:border-rose-500 text-left text-xs bg-rose-50/50 hover:bg-rose-50 transition-all group"
                  >
                    <div className="font-bold text-rose-700">Khẩn cấp</div>
                    <div className="text-[10px] text-rose-500">Đã quá hạn</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("zelle")}
                    className="p-2 rounded-xl border border-slate-200 hover:border-[#253c68] text-left text-xs bg-slate-50 hover:bg-white transition-all group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-[#253c68]">Thông tin Zelle</div>
                    <div className="text-[10px] text-slate-400">Kèm số phone</div>
                  </button>
                </div>
              </div>

              {/* Message Content Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nội dung tin nhắn SMS
                </label>
                <textarea
                  rows={5}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-sans text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#253c68] focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Ký tự: {smsContent.length} (~{Math.ceil(smsContent.length / 160)} SMS)</span>
                  <span className="text-emerald-600 font-semibold">Tự động lưu lịch sử vào hệ thống</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForSms(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSendQuoSms}
                  disabled={isSendingSms || !smsContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#253c68] hover:bg-[#1a2c4e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  {isSendingSms ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Gửi SMS qua Quo ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

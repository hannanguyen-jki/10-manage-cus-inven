"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Crown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  FileText,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Edit,
  ExternalLink,
  Receipt,
  User,
  ShieldAlert,
  ChevronRight,
  X,
  XCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface CustomerDetail {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  birthday: string | null;
  assignedSale: string;
  tier: "STANDARD" | "WHOLESALE" | "VIP";
  status: "ACTIVE" | "AT_RISK" | "INACTIVE";
  notes: string | null;
  totalSpent: number;
  totalPaid: number;
  debtAmount: number;
  orderCount: number;
  lastOrderDate: string | null;
  lastContactDate: string | null;
  createdAt: string;
  orders: any[];
  quotes: any[];
  smsLogs: any[];
  churnSurveys: any[];
}

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "quotes" | "sms" | "churn">("orders");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals & States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isChurnModalOpen, setIsChurnModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Customer Form State
  const [editFormData, setEditFormData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "TX",
    zipCode: "",
    birthday: "",
    assignedSale: "admin",
    tier: "STANDARD",
    status: "ACTIVE",
    notes: "",
  });

  // SMS Form State
  const [smsData, setSmsData] = useState({
    type: "FOLLOW_UP" as "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP",
    content: "",
  });

  // Churn Survey Form State
  const [churnFormData, setChurnFormData] = useState({
    analysisMonth: "2026-10",
    dropPercent: -45,
    reason: "HIGH_INVENTORY_REMAINING",
    saleNotes: "",
    actionPlan: "",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchCustomerDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();

      if (data.success && data.customer) {
        setCustomer(data.customer);
        // Pre-fill edit form
        const c = data.customer;
        setEditFormData({
          businessName: c.businessName || "",
          contactPerson: c.contactPerson || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "TX",
          zipCode: c.zipCode || "",
          birthday: c.birthday ? c.birthday.split("T")[0] : "",
          assignedSale: c.assignedSale || "admin",
          tier: c.tier || "STANDARD",
          status: c.status || "ACTIVE",
          notes: c.notes || "",
        });
      } else {
        setError(data.error || "Không tìm thấy thông tin khách hàng");
      }
    } catch (err: any) {
      console.error("Fetch customer detail error:", err);
      setError("Lỗi kết nối khi tải hồ sơ khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cập nhật thông tin khách hàng thành công!");
        setIsEditModalOpen(false);
        fetchCustomerDetail();
      } else {
        showToast(data.error || "Không thể cập nhật thông tin", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send SMS
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !smsData.content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          toPhone: customer.phone,
          content: smsData.content,
          type: smsData.type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã gửi tin nhắn Quo SMS thành công!");
        setIsSmsModalOpen(false);
        setSmsData({ type: "FOLLOW_UP", content: "" });
        fetchCustomerDetail();
      } else {
        showToast(data.error || "Không thể gửi SMS", "error");
      }
    } catch (err) {
      showToast("Lỗi gửi tin nhắn", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP") => {
    if (!customer) return;
    let text = "";
    if (type === "PROMOTION") {
      text = `JKIOCEAN: Chào ${customer.contactPerson} ơi, lô cọ Z-Kolinsky Master #14 vừa về kho Houston. Em giữ trước cho tiệm ${customer.businessName} giá sỉ VIP nhé!`;
    } else if (type === "BIRTHDAY") {
      text = `JKIOCEAN kính chúc ${customer.contactPerson} sinh nhật vui vẻ, dồi dào sức khỏe và tiệm ${customer.businessName} ngày càng phát tài phát lộc!`;
    } else if (type === "AR_REMINDER") {
      text = `JKIOCEAN thân gửi ${customer.contactPerson}: Tiệm hiện còn nợ $${customer.debtAmount.toLocaleString()} tiền cọ Z-Brushes, chị sắp xếp gửi check/zelle hỗ trợ team em nhé ạ!`;
    } else {
      text = `JKIOCEAN xin chào ${customer.contactPerson}! Cọ đợt trước tiệm mình dùng có êm tay không ạ? Khi nào cần lấy thêm cọ đắp bột hoặc cọ vẽ chị nhắn em nha!`;
    }
    setSmsData({ type, content: text });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <RefreshCw className="w-10 h-10 text-[#253c68] animate-spin mb-3" />
        <p className="text-slate-600 font-semibold text-sm">Đang tải hồ sơ Customer 360°...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy hồ sơ</h2>
        <p className="text-slate-500 text-sm mt-1">{error || "Khách hàng không tồn tại trong cơ sở dữ liệu."}</p>
        <Link
          href="/customers"
          className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#253c68] text-white text-sm font-semibold hover:bg-[#1a2c4e] transition btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khách hàng</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-[#253c68] text-white border border-[#38bdf8]/30 shadow-[#253c68]/30"
              : "bg-rose-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
          ) : (
            <XCircle className="w-5 h-5 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-[#253c68] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách Khách Hàng B2B</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Customer ID:</span>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
            {customer.id}
          </span>
        </div>
      </div>

      {/* Customer 360 Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        {/* Accent background bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#253c68] via-[#3a568c] to-[#38bdf8]"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
          {/* Main Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-[#253c68] tracking-tight">
                {customer.businessName}
              </h1>

              {/* Tier Badge */}
              {customer.tier === "VIP" && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>VIP MEMBER</span>
                </span>
              )}
              {customer.tier === "WHOLESALE" && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ĐẠI LÝ SỈ</span>
                </span>
              )}
              {customer.tier === "STANDARD" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  STANDARD
                </span>
              )}

              {/* Status Badge */}
              {customer.status === "ACTIVE" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                  Đang hoạt động
                </span>
              )}
              {customer.status === "AT_RISK" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  Cần Chăm Sóc Khẩn
                </span>
              )}
            </div>

            {/* Sub Info Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{customer.contactPerson}</span>
                <span className="text-xs text-slate-400">(Chủ Tiệm)</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-sky-600" />
                <a
                  href={`tel:${customer.phone}`}
                  className="font-mono text-sky-700 hover:underline font-semibold"
                >
                  {customer.phone}
                </a>
              </div>

              {customer.email && (
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${customer.email}`} className="text-slate-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  {customer.address ? `${customer.address}, ` : ""}
                  {customer.city}, {customer.state} {customer.zipCode || ""}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Sale phụ trách: <strong className="capitalize">{customer.assignedSale}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Create Quote Link */}
            <Link
              href={`/quotes?new=true&customerId=${customer.id}`}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[#253c68] text-[#253c68] hover:bg-[#253c68]/5 font-bold text-sm btn-press transition"
            >
              <FileText className="w-4 h-4" />
              <span>Tạo Báo Giá Mới</span>
            </Link>

            {/* Send Quo SMS */}
            <button
              onClick={() => {
                setSmsData({
                  type: "FOLLOW_UP",
                  content: `JKIOCEAN: Chào ${customer.contactPerson} (${customer.businessName})...`,
                });
                setIsSmsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 btn-press transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gửi Quo SMS</span>
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm btn-press transition"
            >
              <Edit className="w-4 h-4" />
              <span>Sửa Thông Tin</span>
            </button>
          </div>
        </div>

        {/* Customer Notes banner if available */}
        {customer.notes && (
          <div className="mt-5 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Đặc điểm / Ghi chú tiệm:</strong> {customer.notes}
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lifetime Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh Số Trọn Đời (LTV)</span>
            <DollarSign className="w-4 h-4 text-[#253c68]" />
          </div>
          <div className="text-2xl font-black text-[#253c68] mt-2">
            ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Đã thanh toán: ${customer.totalPaid.toLocaleString()}</p>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Số Lượng Đơn Hàng</span>
            <ShoppingBag className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{customer.orderCount} đơn</div>
          <p className="text-xs text-slate-500 mt-1">
            Giá trị TB/đơn:{" "}
            <strong className="text-slate-800">
              $
              {customer.orderCount > 0
                ? (customer.totalSpent / customer.orderCount).toFixed(0)
                : 0}
            </strong>
          </p>
        </div>

        {/* Debt Amount */}
        <div
          className={`p-5 rounded-2xl border shadow-sm card-hover ${
            customer.debtAmount > 0
              ? "bg-rose-50/50 border-rose-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Công Nợ Chưa Thu (AR)
            </span>
            <Receipt className={`w-4 h-4 ${customer.debtAmount > 0 ? "text-rose-600" : "text-emerald-600"}`} />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              customer.debtAmount > 0 ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            ${customer.debtAmount.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {customer.debtAmount > 0 ? "Cần gửi SMS nhắc thanh toán" : "Tuyệt vời, không có nợ tồn đọng"}
          </p>
        </div>

        {/* Health & Churn Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tình Trạng Sức Khỏe Tiệm</span>
            <ShieldAlert className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black mt-2">
            {customer.status === "ACTIVE" ? (
              <span className="text-emerald-600">Ổn định</span>
            ) : customer.status === "AT_RISK" ? (
              <span className="text-rose-600">Nguy cơ sụt giảm</span>
            ) : (
              <span className="text-slate-500">Tạm dừng</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đơn gần nhất: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString("vi-VN") : "Chưa có đơn"}
          </p>
        </div>
      </div>

      {/* 4 Detail Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-sm font-bold transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-white border-[#253c68] text-[#253c68] shadow-sm"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lịch Sử Đơn Hàng ({customer.orders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-sm font-bold transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === "quotes"
                ? "bg-white border-[#253c68] text-[#253c68] shadow-sm"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Báo Giá PDF ({customer.quotes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("sms")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-sm font-bold transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === "sms"
                ? "bg-white border-[#253c68] text-[#253c68] shadow-sm"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nhật Ký Quo SMS ({customer.smsLogs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("churn")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-sm font-bold transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === "churn"
                ? "bg-white border-[#253c68] text-[#253c68] shadow-sm"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>Xu Hướng Mua & Churn Notes ({customer.churnSurveys?.length || 0})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Danh Sách Đơn Hàng Cọ Z-Brushes</h3>
                <span className="text-xs text-slate-400">Tất cả đơn xuất từ kho Houston Hub</span>
              </div>

              {(!customer.orders || customer.orders.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có đơn hàng nào được tạo cho salon này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 transition bg-white shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <span className="font-extrabold text-[#253c68] text-base">{order.orderNumber}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.paymentStatus === "PARTIAL"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {order.paymentStatus === "PAID"
                              ? "ĐÃ THANH TOÁN"
                              : order.paymentStatus === "PARTIAL"
                              ? "THANH TOÁN 1 PHẦN"
                              : "CHƯA THANH TOÁN"}
                          </span>
                          <span className="font-black text-slate-900 text-lg">
                            ${order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items list if available */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 pt-2 text-xs">
                          <div className="text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                            Sản phẩm trong đơn:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {item.product?.name || item.productName || "Z-Brushes Professional"}
                                  </div>
                                  <div className="text-slate-400 text-[11px]">
                                    SKU: {item.product?.sku || item.sku || "N/A"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-700">
                                    {item.quantity} cây × ${item.unitPrice}
                                  </div>
                                  <div className="font-bold text-[#253c68]">
                                    ${(item.quantity * item.unitPrice).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mt-2 text-xs text-slate-500 italic">
                          Ghi chú giao hàng: {order.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUOTATIONS */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Danh Sách Báo Giá Đã Lập</h3>
                <Link
                  href={`/quotes?new=true&customerId=${customer.id}`}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#253c68] px-3.5 py-2 rounded-xl hover:bg-[#1a2c4e] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Báo Giá Mới</span>
                </Link>
              </div>

              {(!customer.quotes || customer.quotes.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có bản báo giá nào cho salon này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.quotes.map((quote: any) => (
                    <div
                      key={quote.id}
                      className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-[#253c68]">{quote.quoteNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              quote.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : quote.status === "SENT"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {quote.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Hiệu lực đến:{" "}
                          <strong>
                            {new Date(quote.validUntil).toLocaleDateString("vi-VN")}
                          </strong>
                          {quote.notes && ` • Ghi chú: ${quote.notes}`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-black text-slate-900">
                          ${quote.totalAmount.toLocaleString()}
                        </span>
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-[#253c68] hover:bg-slate-100 transition"
                          title="Xem chi tiết báo giá"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUO SMS CONVERSATIONS */}
          {activeTab === "sms" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Nhật Ký Quo SMS Trực Tiếp</h3>
                  <p className="text-xs text-slate-500">
                    Đầu số tổng đài JKIOCEAN Houston: <strong>+1 (713) 330-6165</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsSmsModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-sky-600 px-3.5 py-2 rounded-xl hover:bg-sky-700 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Soạn SMS Mới</span>
                </button>
              </div>

              {/* SMS Timeline */}
              {(!customer.smsLogs || customer.smsLogs.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có tin nhắn SMS nào được gửi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.smsLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start space-x-3.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-800">
                              Đến: {log.toPhone}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.type === "PROMOTION"
                                  ? "bg-purple-100 text-purple-700"
                                  : log.type === "BIRTHDAY"
                                  ? "bg-amber-100 text-amber-800"
                                  : log.type === "AR_REMINDER"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {log.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                          {log.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHURN NOTES & RECOVERY PLAN */}
          {activeTab === "churn" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Phân Tích Sụt Giảm & Kế Hoạch Chăm Sóc (Churn Prevention)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ghi nhận nguyên nhân tiệm giảm lượng cọ và phương án giữ chân khách hàng
                  </p>
                </div>
                <button
                  onClick={() => setIsChurnModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl hover:bg-rose-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ghi Nhận Churn Mới</span>
                </button>
              </div>

              {(!customer.churnSurveys || customer.churnSurveys.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 text-sm">Tiệm duy trì phong độ tốt!</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chưa có cảnh báo sụt giảm đơn hàng bất thường nào trong 3 tháng qua.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.churnSurveys.map((survey: any) => (
                    <div
                      key={survey.id}
                      className="border border-rose-200 bg-rose-50/20 rounded-xl p-4.5 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-800">
                            Tháng khảo sát: {survey.analysisMonth}
                          </span>
                          <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded text-xs">
                            {survey.dropPercent}% doanh số
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Ghi nhận bởi: <strong>{survey.saleRep}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <strong>Nguyên nhân chính: </strong>
                        <span className="font-semibold text-rose-800">{survey.reason}</span>
                      </div>

                      {survey.saleNotes && (
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          <strong>Ghi nhận từ tiệm:</strong> {survey.saleNotes}
                        </div>
                      )}

                      {survey.actionPlan && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <strong>Kế hoạch giữ chân (Action Plan):</strong> {survey.actionPlan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: SỬA HỒ SƠ KHÁCH HÀNG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#253c68]">Chỉnh Sửa Hồ Sơ Salon</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Tiệm Nail</label>
                  <input
                    type="text"
                    required
                    value={editFormData.businessName}
                    onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chủ Tiệm</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số ĐT (+1)</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ngày Sinh Chủ Tiệm</label>
                  <input
                    type="date"
                    value={editFormData.birthday}
                    onChange={(e) => setEditFormData({ ...editFormData, birthday: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa Chỉ</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thành Phố</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiểu Bang</label>
                  <select
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  >
                    <option value="TX">TX (Texas)</option>
                    <option value="CA">CA (California)</option>
                    <option value="FL">FL (Florida)</option>
                    <option value="GA">GA (Georgia)</option>
                    <option value="OK">OK (Oklahoma)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phân Hạng (Tier)</label>
                  <select
                    value={editFormData.tier}
                    onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] font-bold text-[#253c68]"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  >
                    <option value="ACTIVE">Hoạt động (Active)</option>
                    <option value="AT_RISK">Nguy cơ sụt giảm (At Risk)</option>
                    <option value="INACTIVE">Tạm ngưng (Inactive)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ghi Chú</label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Cập Nhật Hồ Sơ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GỬI QUO SMS */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#253c68] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Gửi Quo SMS Cho {customer.contactPerson}</h3>
                  <p className="text-xs text-sky-200">{customer.businessName} • {customer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSms} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Chọn mẫu tin nhắn mẫu:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => applyTemplate("PROMOTION")}
                    className={`p-2 rounded-xl border text-left transition ${
                      smsData.type === "PROMOTION"
                        ? "border-[#253c68] bg-[#253c68]/5 text-[#253c68] font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    🎉 Khuyến mãi cọ Z-Brushes
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("FOLLOW_UP")}
                    className={`p-2 rounded-xl border text-left transition ${
                      smsData.type === "FOLLOW_UP"
                        ? "border-[#253c68] bg-[#253c68]/5 text-[#253c68] font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    💬 Hỏi thăm trải nghiệm cọ
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("AR_REMINDER")}
                    className={`p-2 rounded-xl border text-left transition ${
                      smsData.type === "AR_REMINDER"
                        ? "border-[#253c68] bg-[#253c68]/5 text-[#253c68] font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    💳 Nhắc thanh toán công nợ
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("BIRTHDAY")}
                    className={`p-2 rounded-xl border text-left transition ${
                      smsData.type === "BIRTHDAY"
                        ? "border-[#253c68] bg-[#253c68]/5 text-[#253c68] font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    🎂 Chúc mừng sinh nhật
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nội Dung Tin Nhắn
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsData.content}
                  onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Ký tự: {smsData.content.length}</span>
                  <span>Người nhận: {customer.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSmsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-5 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Đang gửi..." : "Gửi Quo SMS Ngay"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

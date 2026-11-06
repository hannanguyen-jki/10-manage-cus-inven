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
  Award,
  BarChart3,
} from "lucide-react";

interface CustomerDetail {
  id: string;
  rank?: string | number;
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
  profit?: number;
  aov?: number;
  cycleDays?: number;
  rev2024?: number;
  orders2024?: number;
  rev2025?: number;
  orders2025?: number;
  rev2026?: number;
  orders2026?: number;
  growth25vs24?: number | null;
  growth26vs25?: number | null;
  firstPurchase?: string | null;
  lastPurchase?: string | null;
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
    assignedSale: "johnny",
    tier: "STANDARD",
    status: "ACTIVE",
    notes: "",
  });

  // SMS Form State
  const [smsData, setSmsData] = useState({
    type: "FOLLOW_UP" as "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP",
    content: "",
  });

  // Churn Form State
  const [churnData, setChurnData] = useState({
    analysisMonth: "2026-10",
    dropPercent: -45,
    reason: "HIGH_INVENTORY_REMAINING" as any,
    saleNotes: "",
    actionPlan: "",
    saleRep: "Johnny Tran",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) {
        throw new Error("Could not find customer profile");
      }
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
        // Pre-fill edit form
        setEditFormData({
          businessName: data.customer.businessName || "",
          contactPerson: data.customer.contactPerson || "",
          phone: data.customer.phone || "",
          email: data.customer.email || "",
          address: data.customer.address || "",
          city: data.customer.city || "",
          state: data.customer.state || "TX",
          zipCode: data.customer.zipCode || "",
          birthday: data.customer.birthday ? data.customer.birthday.slice(0, 10) : "",
          assignedSale: data.customer.assignedSale || "johnny",
          tier: data.customer.tier || "STANDARD",
          status: data.customer.status || "ACTIVE",
          notes: data.customer.notes || "",
        });
      } else {
        throw new Error("Customer record missing");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetail();
    }
  }, [id]);

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã cập nhật thông tin khách hàng thành công!");
        setIsEditModalOpen(false);
        fetchCustomerDetail();
      } else {
        showToast(data.error || "Không thể cập nhật", "error");
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
      showToast("Lỗi kết nối gửi SMS", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP") => {
    if (!customer) return;
    let text = "";
    if (type === "PROMOTION") {
      text = `JKIOCEAN: Xin chào ${customer.contactPerson}, các sản phẩm cọ và phụ liệu nail chuẩn salon vừa về kho Houston Hub. JKIOCEAN xin gửi ưu đãi giá sỉ cho ${customer.businessName}!`;
    } else if (type === "BIRTHDAY") {
      text = `JKIOCEAN kính chúc ${customer.contactPerson} một sinh nhật nhiều niềm vui, sức khỏe và tiệm ${customer.businessName} ngày càng phát tài!`;
    } else if (type === "AR_REMINDER") {
      text = `JKIOCEAN xin phép gửi thông báo đến ${customer.contactPerson}: Tiệm ${customer.businessName} hiện có số dư công nợ $${customer.debtAmount.toLocaleString()}. Nhờ anh/chị hỗ trợ thanh toán qua Zelle/Check giúp bên em nhé. Cảm ơn anh/chị!`;
    } else {
      text = `JKIOCEAN thăm hỏi ${customer.contactPerson}: Anh/chị dùng đợt hàng vừa rồi thế nào ạ? Khi nào cần lấy thêm cọ, kềm hay phụ liệu thì nhắn em gửi hỏa tốc qua nhé!`;
    }
    setSmsData({ type, content: text });
  };

  const formatSalesRep = (rep: string) => {
    if (!rep) return "Johnny Tran";
    const low = rep.toLowerCase();
    if (low === "johnny" || low === "johnny tran") return "Johnny Tran";
    if (low === "hanna" || low === "hanna nguyen") return "Hanna Nguyen";
    if (low === "alice" || low === "alice nguyen") return "Alice Nguyen";
    if (low === "tan" || low === "tan ho") return "Tan Ho";
    if (low === "kate") return "Kate";
    if (low === "admin") return "Admin";
    return rep;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <RefreshCw className="w-10 h-10 text-[#253c68] animate-spin mb-3" />
        <p className="text-slate-600 font-semibold text-sm">Đang tải hồ sơ 360° khách hàng...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không Tìm Thấy Khách Hàng</h2>
        <p className="text-slate-500 text-sm mt-1">{error || "Khách hàng không tồn tại."}</p>
        <Link
          href="/customers"
          className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#253c68] text-white text-sm font-semibold hover:bg-[#1a2c4e] transition btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
          <span>Quay lại danh sách 32 khách hàng</span>
        </Link>

        <div className="flex items-center space-x-2">
          {customer.rank && (
            <span className="text-xs font-mono bg-blue-50 text-[#253c68] px-2.5 py-0.5 rounded font-bold border border-blue-200">
              Rank #{customer.rank}
            </span>
          )}
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
            {customer.id}
          </span>
        </div>
      </div>

      {/* Customer 360 Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
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
                  <span>WHOLESALE</span>
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
                  Active
                </span>
              )}
              {customer.status === "AT_RISK" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  Nguy Cơ Churn (Sụt giảm doanh số)
                </span>
              )}
            </div>

            {/* Sub Info Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{customer.contactPerson}</span>
                <span className="text-xs text-slate-400">(Người phụ trách / Attn)</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-sky-600" />
                <a
                  href={`tel:${customer.phone}`}
                  className="font-mono text-sky-700 hover:underline font-bold"
                >
                  {customer.phone}
                </a>
              </div>

              {customer.email && (
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{customer.email}</span>
                </div>
              )}

              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  {customer.city}, {customer.state}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Phụ trách: <strong>{formatSalesRep(customer.assignedSale)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/quotes/create?customerId=${customer.id}`}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[#253c68] text-[#253c68] hover:bg-[#253c68]/5 font-bold text-sm btn-press transition"
            >
              <FileText className="w-4 h-4" />
              <span>Tạo Báo Giá Mới</span>
            </Link>

            <button
              onClick={() => {
                setSmsData({
                  type: "FOLLOW_UP",
                  content: `JKIOCEAN: Xin chào ${customer.contactPerson} (${customer.businessName})...`,
                });
                setIsSmsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 btn-press transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gửi Quo SMS</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm btn-press transition"
            >
              <Edit className="w-4 h-4" />
              <span>Chỉnh Sửa</span>
            </button>
          </div>
        </div>

        {/* Customer Notes */}
        {customer.notes && (
          <div className="mt-5 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Ghi chú khách hàng:</strong> {customer.notes}
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lifetime Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Tiền Đã Mua (LTV)</span>
            <DollarSign className="w-4 h-4 text-[#253c68]" />
          </div>
          <div className="text-2xl font-black text-[#253c68] mt-2">
            ${Number(customer.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tổng cộng: {customer.orderCount} đơn hàng</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm card-hover bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Lợi Nhuận Gộp Đóng Góp</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            +${Number(customer.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-emerald-600 mt-1">Đóng góp lợi nhuận ròng</p>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Đơn Hàng TB (AOV)</span>
            <ShoppingBag className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${Number(customer.aov || (customer.totalSpent / Math.max(1, customer.orderCount))).toFixed(0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chu kỳ: <strong>{customer.cycleDays ? `${customer.cycleDays} ngày/đơn` : "Mua một lần"}</strong>
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
              Công Nợ AR Còn Lại
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
            {customer.debtAmount > 0 ? "Cần nhắc hẹn thu hồi công nợ" : "Đã thanh toán đầy đủ 100%"}
          </p>
        </div>
      </div>

      {/* CHI TIẾT DOANH SỐ MUA HÀNG THEO TỪNG NĂM (2024 - 2025 - 2026) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Thống Kê Khách Mua Hàng Qua Các Năm (Sheet Thực Tế)</h3>
            <p className="text-xs text-slate-500">Chi tiết doanh số mua và số lượng đơn hàng năm 2024, 2025 và 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Năm 2024 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Năm 2024</div>
            <div className="text-xl font-black text-slate-800">
              ${Number(customer.rev2024 || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {customer.orders2024 || 0} đơn hàng đã hoàn tất
            </div>
          </div>

          {/* Năm 2025 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Năm 2025</div>
            <div className="text-xl font-black text-slate-800">
              ${Number(customer.rev2025 || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {customer.orders2025 || 0} đơn hàng đã hoàn tất
              {customer.growth25vs24 !== undefined && customer.growth25vs24 !== null && (
                <span className={`ml-2 font-bold ${customer.growth25vs24 >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  ({customer.growth25vs24 >= 0 ? "+" : ""}{(customer.growth25vs24 * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          {/* Năm 2026 */}
          <div className="p-4 rounded-xl border border-[#253c68]/30 bg-blue-50/30 space-y-1">
            <div className="text-xs font-bold text-[#253c68] uppercase">Năm 2026 (YTD)</div>
            <div className="text-xl font-black text-[#253c68]">
              ${Number(customer.rev2026 || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {customer.orders2026 || 0} đơn hàng
              {customer.growth26vs25 !== undefined && customer.growth26vs25 !== null && (
                <span className={`ml-2 font-bold ${customer.growth26vs25 >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  ({customer.growth26vs25 >= 0 ? "+" : ""}{(customer.growth26vs25 * 100).toFixed(1)}% so với 2025)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tabs Navigation */}
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
            <span>Lịch Sử Đơn Hàng & Sản Phẩm Đã Mua ({customer.orders?.length || 0})</span>
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
            <span>Báo Giá PDF Kèm Ảnh ({customer.quotes?.length || 0})</span>
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
            <span>Tin Nhắn Quo SMS ({customer.smsLogs?.length || 0})</span>
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
            <span>Phân Tích Xu Hướng Mua & Churn ({customer.churnSurveys?.length || 0})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: ORDER HISTORY & PURCHASED ITEMS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Chi Tiết Từng Đơn Hàng & Mặt Hàng Khách Mua</h3>
                <span className="text-xs text-slate-400">Xuất kho từ JKIOCEAN Houston Hub</span>
              </div>

              {(!customer.orders || customer.orders.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có đơn hàng nào được ghi nhận cho salon này.</p>
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
                          <span className="font-extrabold text-[#253c68] text-base font-mono">{order.orderNumber}</span>
                          <span className="text-xs text-slate-400">
                            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
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
                              ? "TRẢ 1 PHẦN"
                              : "CHƯA THANH TOÁN"}
                          </span>
                          <span className="font-black text-slate-900 text-lg">
                            ${Number(order.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 pt-2 text-xs">
                          <div className="text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                            Sản phẩm trong đơn hàng:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {item.product?.name || item.productName || "Sản phẩm Nail Chuyên Nghiệp"}
                                  </div>
                                  <div className="text-slate-400 text-[11px] font-mono">
                                    Mã SKU: {item.product?.sku || item.sku || "N/A"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-700">
                                    {item.quantity} cái x ${item.unitPrice}
                                  </div>
                                  <div className="font-bold text-[#253c68]">
                                    ${Number(item.quantity * item.unitPrice).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mt-2 text-xs text-slate-500 italic">
                          Ghi chú giao vận: {order.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUOTES */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Báo Giá Gửi Khách Hàng</h3>
                  <p className="text-xs text-slate-500">Các bảng báo giá xuất mẫu kèm hình ảnh và đơn giá sỉ</p>
                </div>
                <Link
                  href={`/quotes/create?customerId=${customer.id}`}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#253c68] px-3.5 py-2 rounded-xl hover:bg-[#1a2c4e] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Báo Giá Cho Khách</span>
                </Link>
              </div>

              {(!customer.quotes || customer.quotes.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có báo giá nào cho đối tác này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.quotes.map((q: any) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-white"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{q.quoteNumber}</span>
                          <span className="text-xs text-slate-400">• {new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{q.notes}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">${q.totalAmount}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SMS LOG */}
          {activeTab === "sms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Lịch Sử Quo SMS</h3>
                  <p className="text-xs text-slate-500">Tin nhắn chăm sóc, báo giá và nhắc công nợ gửi tới {customer.phone}</p>
                </div>
                <button
                  onClick={() => setIsSmsModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-sky-600 px-3.5 py-2 rounded-xl hover:bg-sky-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gửi Tin Nhắn Mới</span>
                </button>
              </div>

              {(!customer.smsLogs || customer.smsLogs.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Chưa có tin nhắn nào được gửi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.smsLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-700">{log.type}</span>
                        <span className="text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{log.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHURN TRENDS */}
          {activeTab === "churn" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Phân Tích Xu Hướng Mua & Cảnh Báo Sụt Giảm</h3>
                  <p className="text-xs text-slate-500">Theo dõi khách hàng có dấu hiệu giảm đơn hoặc tồn kho cao</p>
                </div>
              </div>

              {(!customer.churnSurveys || customer.churnSurveys.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 text-sm">Xu hướng mua hàng ổn định!</p>
                  <p className="text-xs text-slate-400 mt-0.5">Không phát hiện sụt giảm bất thường.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.churnSurveys.map((survey: any) => (
                    <div
                      key={survey.id}
                      className="border border-rose-200 bg-rose-50/20 rounded-xl p-4.5 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded text-xs">
                          {survey.dropPercent}% doanh số
                        </span>
                        <span className="text-xs text-slate-400">
                          Phụ trách: <strong>{survey.saleRep}</strong>
                        </span>
                      </div>
                      <div className="text-xs text-slate-700">
                        <strong>Lý do chính:</strong> {survey.reason}
                      </div>
                      {survey.saleNotes && (
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          <strong>Ghi chú sale:</strong> {survey.saleNotes}
                        </div>
                      )}
                      {survey.actionPlan && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <strong>Kế hoạch hành động:</strong> {survey.actionPlan}
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

      {/* Quo SMS Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Gửi Tin Nhắn Quo SMS</h3>
              </div>
              <button onClick={() => setIsSmsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">Người nhận:</p>
              <p className="font-bold text-slate-800 text-sm">
                {customer.contactPerson} ({customer.businessName}) -{" "}
                <span className="font-mono text-sky-700">{customer.phone}</span>
              </p>
            </div>

            {/* Quick Templates */}
            <div>
              <span className="text-xs font-bold text-slate-600">Mẫu tin nhắn nhanh:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => applyTemplate("PROMOTION")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Ưu Đãi Báo Giá
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("AR_REMINDER")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-700"
                >
                  Nhắc Công Nợ
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("FOLLOW_UP")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-sky-50 hover:bg-sky-100 text-sky-700"
                >
                  Thăm Hỏi
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nội dung tin nhắn:</label>
              <textarea
                rows={4}
                value={smsData.content}
                onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSmsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendSms}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi SMS Ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-[#253c68]" />
                <h3 className="font-extrabold text-slate-900 text-base">Chỉnh Sửa Thông Tin Khách Hàng</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tiệm / Supply Store *</label>
                <input
                  type="text"
                  required
                  value={editFormData.businessName}
                  onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Người Phụ Trách (Attn) *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thành Phố</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiểu Bang (State)</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#253c68] text-white hover:bg-[#1a2c4e] shadow-md shadow-[#253c68]/20"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

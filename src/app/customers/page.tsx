"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  Crown,
  Building2,
  AlertTriangle,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Eye,
  Edit,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Send,
  X,
  PhoneCall,
  Download,
  Award,
  TrendingDown,
  TrendingUp,
  FileText,
} from "lucide-react";

interface CustomerItem {
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
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedCustomerForSms, setSelectedCustomerForSms] = useState<CustomerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Customer Form State
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "Houston",
    state: "TX",
    zipCode: "77036",
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

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (selectedTier !== "ALL") queryParams.set("tier", selectedTier);
      if (selectedState !== "ALL") queryParams.set("state", selectedState);
      if (selectedStatus !== "ALL") queryParams.set("status", selectedStatus);

      const res = await fetch(`/api/customers?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Could not load customers data");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTier, selectedState, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const vipCount = customers.filter((c) => c.tier === "VIP").length;
    const wholesaleCount = customers.filter((c) => c.tier === "WHOLESALE").length;
    const atRiskCount = customers.filter((c) => c.status === "AT_RISK").length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalProfit = customers.reduce((sum, c) => sum + (c.profit || 0), 0);
    const totalDebt = customers.reduce((sum, c) => sum + (c.debtAmount || 0), 0);

    return { total, vipCount, wholesaleCount, atRiskCount, totalRevenue, totalProfit, totalDebt };
  }, [customers]);

  // Export CSV
  const exportCsv = () => {
    if (customers.length === 0) return;
    const headers = [
      "Rank",
      "Business Name",
      "Contact Person (Attn)",
      "Phone",
      "Email",
      "City",
      "State",
      "Tier",
      "Status",
      "Rev 2026",
      "Rev 2025",
      "Rev 2024",
      "Total Spent",
      "Total Profit",
      "Average Order Value (AOV)",
      "Debt Amount",
    ];

    const rows = customers.map((c) => [
      c.rank || "",
      `"${c.businessName}"`,
      `"${c.contactPerson}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.city || ""}"`,
      c.state || "",
      c.tier,
      c.status,
      c.rev2026 || 0,
      c.rev2025 || 0,
      c.rev2024 || 0,
      c.totalSpent,
      c.profit || 0,
      c.aov || 0,
      c.debtAmount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `b2b_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Add Customer Form Submit
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactPerson || !formData.phone) {
      showToast("Vui lòng điền Tên tiệm, Người liên hệ và Số điện thoại", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Đã thêm khách hàng B2B mới thành công!");
        setIsAddModalOpen(false);
        setFormData({
          businessName: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          city: "Houston",
          state: "TX",
          zipCode: "77036",
          birthday: "",
          assignedSale: "johnny",
          tier: "STANDARD",
          status: "ACTIVE",
          notes: "",
        });
        fetchCustomers();
      } else {
        showToast(data.error || "Không thể thêm khách hàng", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Quo SMS Modal
  const openSmsModal = (customer: CustomerItem) => {
    setSelectedCustomerForSms(customer);
    setSmsData({
      type: "FOLLOW_UP",
      content: `JKIOCEAN: Xin chào ${customer.contactPerson} (${customer.businessName}). Em là Johnny từ JKIOCEAN Houston Hub...`,
    });
    setIsSmsModalOpen(true);
  };

  // Handle Send Quo SMS Submit
  const handleSendSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForSms || !smsData.content.trim()) {
      showToast("Vui lòng nhập nội dung tin nhắn", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerForSms.id,
          toPhone: selectedCustomerForSms.phone,
          content: smsData.content,
          type: smsData.type,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || "Đã gửi SMS thành công!");
        setIsSmsModalOpen(false);
      } else {
        showToast(data.error || "Không thể gửi SMS", "error");
      }
    } catch (err) {
      showToast("Lỗi khi kết nối dịch vụ SMS", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-medium transition-all transform translate-y-0 ${
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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#253c68]/10 text-[#253c68]">
              Quản Trị Khách Hàng B2B
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">32 Salon & Supply Store Thực Tế</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#253c68] mt-1 tracking-tight">
            Danh Sách & Doanh Số Mua Hàng Của Khách
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem chi tiết số tiền từng khách đã mua qua các năm (2024, 2025, 2026), đơn giá trung bình, lợi nhuận và công nợ
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchCustomers()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 btn-press transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 btn-press transition text-xs"
            title="Xuất file CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#253c68] text-white font-semibold hover:bg-[#1a2c4e] shadow-md shadow-[#253c68]/20 btn-press transition text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Tổng Khách Hàng</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#253c68] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</p>
          <p className="text-xs text-slate-500 mt-1">Salon & Supply Store B2B</p>
        </div>

        {/* Total Lifetime Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#253c68]/20 shadow-sm card-hover bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#253c68]">Tổng Tiền Khách Đã Mua</span>
            <div className="w-8 h-8 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#253c68] mt-2">
            ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Doanh số tích lũy từ các năm</p>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/70 shadow-sm card-hover bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-700">Lợi Nhuận Đóng Góp</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2">
            ${metrics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-emerald-600/80 mt-1">Gross Margin đóng góp</p>
        </div>

        {/* VIP Salons */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/70 shadow-sm card-hover bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-600">Khách Hàng VIP</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-2">{metrics.vipCount}</p>
          <p className="text-xs text-amber-600/80 mt-1">Đại lý & Salon mua trên $3,000</p>
        </div>

        {/* At-Risk Salons */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-sm card-hover bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-600">Nguy Cơ Churn</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-2xl font-black text-rose-700">{metrics.atRiskCount}</p>
            {metrics.atRiskCount > 0 && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          <p className="text-xs text-rose-600/80 mt-1">Giảm mua &gt;35% năm 2026</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tiệm, người liên hệ, SĐT, thành phố..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] focus:ring-2 focus:ring-[#253c68]/10 bg-slate-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả phân hạng</option>
              <option value="VIP">⭐ VIP (&gt; $3,000)</option>
              <option value="WHOLESALE">🏢 Wholesale ($1,000 - $3,000)</option>
              <option value="STANDARD">📦 Standard (&lt; $1,000)</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả tiểu bang (State)</option>
              <option value="TX">Texas (TX)</option>
              <option value="FL">Florida (FL)</option>
              <option value="CA">California (CA)</option>
              <option value="WI">Wisconsin (WI)</option>
              <option value="ID">Idaho (ID)</option>
              <option value="CO">Colorado (CO)</option>
              <option value="GA">Georgia (GA)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (Active)</option>
              <option value="AT_RISK">Nguy cơ rời bỏ (At Risk)</option>
              <option value="INACTIVE">Ngừng mua (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Customers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#253c68] animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Đang tải danh sách 32 khách hàng...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchCustomers()}
              className="mt-3 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
            >
              Thử lại
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-base text-slate-700">Không tìm thấy khách hàng phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4"># Rank</th>
                  <th className="py-3.5 px-4">Tên Salon / Đại Lý</th>
                  <th className="py-3.5 px-4">Người Phụ Trách & SĐT</th>
                  <th className="py-3.5 px-4 text-center">Hạng</th>
                  <th className="py-3.5 px-4 text-right">Tổng Tiền Đã Mua</th>
                  <th className="py-3.5 px-4 text-right">Doanh Số 2026</th>
                  <th className="py-3.5 px-4 text-right">Doanh Số 2025</th>
                  <th className="py-3.5 px-4 text-right">Lợi Nhuận Gộp</th>
                  <th className="py-3.5 px-4 text-right">Đơn TB (AOV)</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-xs">
                        #{c.rank || "--"}
                      </td>

                      {/* Salon Name & Address */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-bold text-[#253c68] hover:underline flex items-center space-x-1.5"
                        >
                          <span className="text-sm font-extrabold">{c.businessName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#253c68] group-hover:translate-x-0.5 transition" />
                        </Link>
                        <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{c.city}, {c.state}</span>
                        </div>
                      </td>

                      {/* Attn & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {c.contactPerson}
                        </div>
                        <div className="mt-0.5">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center space-x-1 text-xs text-sky-700 hover:underline font-mono font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {c.tier === "VIP" && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>VIP</span>
                          </span>
                        )}
                        {c.tier === "WHOLESALE" && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            <span>SỈ</span>
                          </span>
                        )}
                        {c.tier === "STANDARD" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Chuẩn
                          </span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-[#253c68] text-sm">
                          ${Number(c.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.orderCount} đơn hàng
                        </div>
                      </td>

                      {/* Rev 2026 */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        ${Number(c.rev2026 || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>

                      {/* Rev 2025 */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 text-xs">
                        ${Number(c.rev2025 || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>

                      {/* Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-xs">
                        +${Number(c.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>

                      {/* AOV */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 text-xs">
                        ${Number(c.aov || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {c.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                        {c.status === "AT_RISK" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            At Risk
                          </span>
                        )}
                        {c.status === "INACTIVE" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/customers/${c.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#253c68] hover:bg-slate-100 transition"
                            title="Xem chi tiết đơn mua"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/quotes/create?customerId=${c.id}`}
                            className="p-1.5 rounded-lg text-[#253c68] hover:bg-[#253c68]/10 transition"
                            title="Tạo báo giá"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openSmsModal(c)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition"
                            title="Gửi tin nhắn Quo SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quo SMS Modal */}
      {isSmsModalOpen && selectedCustomerForSms && (
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
                {selectedCustomerForSms.contactPerson} ({selectedCustomerForSms.businessName}) -{" "}
                <span className="font-mono text-sky-700">{selectedCustomerForSms.phone}</span>
              </p>
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
                onClick={handleSendSmsSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi SMS Ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#253c68]" />
                <h3 className="font-extrabold text-slate-900 text-base">Thêm Đại Lý / Khách Hàng Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tiệm / Supply Store *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Ví dụ: Glamour Nail Supply"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Người Phụ Trách (Attn) *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Chủ tiệm / Quản lý"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại Mỹ *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="1 713-330-6165"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thành Phố (City)</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiểu Bang (State)</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#253c68] text-white hover:bg-[#1a2c4e] shadow-md shadow-[#253c68]/20"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Khách Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Building2,
  RefreshCw,
  Search,
  Filter,
  Send,
  X,
  FileEdit,
  ArrowDownRight,
  PackageCheck,
  Tag,
  ThumbsDown,
  Truck,
  Store,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

interface CustomerData {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  assignedSale?: string;
  status?: string;
}

interface FlaggedCustomer {
  id: string;
  customerId: string;
  analysisMonth: string;
  customer: CustomerData;
  previousSpend: number;
  currentSpend: number;
  dropPercent: number;
  dropAmount: number;
  reason:
    | "HIGH_INVENTORY_REMAINING"
    | "PRICE_COMPETITION"
    | "PRODUCT_QUALITY_FEEDBACK"
    | "DELIVERY_DELAY"
    | "STORE_TEMPORARILY_CLOSED"
    | "OTHER";
  saleNotes?: string;
  actionPlan?: string;
  saleRep?: string;
  isResolved: boolean;
  updatedAt?: string;
}

interface ReasonDistributionItem {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface ChurnResponse {
  success: boolean;
  metrics: {
    totalFlagged: number;
    totalRevenueAtRisk: number;
    resolvedCount: number;
    resolutionRate: number;
  };
  reasonDistribution: ReasonDistributionItem[];
  flaggedCustomers: FlaggedCustomer[];
}

export default function ChurnDefensePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChurnResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReason, setFilterReason] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Log Reason & Plan Modal
  const [selectedCustomerForPlan, setSelectedCustomerForPlan] =
    useState<FlaggedCustomer | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(
    "HIGH_INVENTORY_REMAINING"
  );
  const [saleNotes, setSaleNotes] = useState<string>("");
  const [actionPlan, setActionPlan] = useState<string>("");
  const [saleRep, setSaleRep] = useState<string>("Sơn Nguyễn");
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);

  // Quo SMS Retention Modal
  const [selectedForSms, setSelectedForSms] = useState<FlaggedCustomer | null>(
    null
  );
  const [smsContent, setSmsContent] = useState<string>("");
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchChurnData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/churn-detection");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error("Error fetching churn detection data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurnData();
  }, []);

  // Open Log Reason Modal
  const handleOpenPlanModal = (item: FlaggedCustomer) => {
    setSelectedCustomerForPlan(item);
    setSelectedReason(item.reason || "HIGH_INVENTORY_REMAINING");
    setSaleNotes(item.saleNotes || "");
    setActionPlan(item.actionPlan || "");
    setSaleRep(item.saleRep || item.customer?.assignedSale || "Sơn Nguyễn");
    setIsResolved(Boolean(item.isResolved));
  };

  // Submit Retention Plan
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPlan) return;

    setIsSavingPlan(true);
    try {
      const res = await fetch("/api/churn-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerForPlan.customerId,
          analysisMonth: selectedCustomerForPlan.analysisMonth || "2026-10",
          dropPercent: selectedCustomerForPlan.dropPercent,
          reason: selectedReason,
          saleNotes,
          actionPlan,
          saleRep,
          isResolved,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(
          `Đã lưu kế hoạch giữ chân cho ${selectedCustomerForPlan.customer?.businessName}!`
        );
        setSelectedCustomerForPlan(null);
        await fetchChurnData();
      } else {
        showToast(resData.error || "Không thể lưu kế hoạch", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi lưu dữ liệu", "error");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Open Quo SMS Modal for Retention
  const handleOpenSmsModal = (item: FlaggedCustomer) => {
    setSelectedForSms(item);
    const contact =
      item.customer?.contactPerson || item.customer?.businessName || "anh/chị";

    let message = "";
    if (item.reason === "HIGH_INVENTORY_REMAINING") {
      message = `Hi ${contact}, em Sơn bên JKIOCEAN Houston hỏi thăm tình hình salon mình đợt này. Lô cọ Kolinsky tháng trước thợ dùng vẫn êm chứ ạ? Hiện kho Houston đang về thêm dòng nước rửa cọ chuyên dụng Brush Cleaner và Liquid Monomer loại mới, em gửi tặng tiệm 1 chai dùng thử nhé!`;
    } else if (item.reason === "PRICE_COMPETITION") {
      message = `Hi ${contact}, JKIOCEAN Houston đang có chương trình tri ân salon VIP tháng này: Khi đặt từ 25 cây cọ Z-Brush Kolinsky bất kỳ, tiệm được tặng thêm 5 cây cọ oval đắp bột + Free UPS Express ship trong Texas. Anh/chị xem cần lấy thêm size nào để em hỗ trợ nhé!`;
    } else {
      message = `Hi ${contact}, em Sơn từ JKIOCEAN Houston (+1 713-330-6165). Lâu rồi không thấy salon đặt thêm cọ và đồ bột, bên em rất trân trọng đóng góp của anh/chị. Salon có cần hỗ trợ gì thêm về chất lượng sản phẩm hay bảng giá sỉ mới không ạ?`;
    }

    setSmsContent(message);
  };

  // Send Quo SMS
  const handleSendQuoSms = async () => {
    if (!selectedForSms || !smsContent.trim()) return;

    setIsSendingSms(true);
    try {
      const res = await fetch("/api/quo/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedForSms.customer?.phone,
          content: smsContent.trim(),
          type: "FOLLOW_UP",
          customerId: selectedForSms.customerId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(
          `Đã gửi Quo SMS chăm sóc đến ${selectedForSms.customer?.businessName} (${selectedForSms.customer?.phone})!`
        );
        setSelectedForSms(null);
      } else {
        showToast(resData.error || "Không thể gửi SMS", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Lỗi kết nối Quo", "error");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Helper reason text & badge
  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "HIGH_INVENTORY_REMAINING":
        return {
          label: "Tồn kho còn nhiều",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
          icon: PackageCheck,
        };
      case "PRICE_COMPETITION":
        return {
          label: "Cạnh tranh giá",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
          icon: Tag,
        };
      case "PRODUCT_QUALITY_FEEDBACK":
        return {
          label: "Chất lượng sản phẩm",
          badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
          icon: ThumbsDown,
        };
      case "DELIVERY_DELAY":
        return {
          label: "Giao hàng chậm",
          badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
          icon: Truck,
        };
      case "STORE_TEMPORARILY_CLOSED":
        return {
          label: "Tiệm sửa / Tạm đóng",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
          icon: Store,
        };
      default:
        return {
          label: "Lý do khác",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: HelpCircle,
        };
    }
  };

  // Filtered customers
  const filteredCustomers = (data?.flaggedCustomers || []).filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.customer?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer?.phone?.includes(searchTerm) ||
      item.customer?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason =
      filterReason === "ALL" || item.reason === filterReason;

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "RESOLVED" && item.isResolved) ||
      (filterStatus === "PENDING" && !item.isResolved);

    return matchesSearch && matchesReason && matchesStatus;
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
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Purchase Dip & Churn Defense (Phòng Ngừa Rời Bỏ)
                </h1>
                <p className="text-sm text-slate-300 italic mt-0.5">
                  &quot;Khách tháng trước mua nhiều nhưng tháng sau mua ít thì phải biết vì sao&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchChurnData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Phân tích lại</span>
            </button>
            <div className="flex items-center space-x-2 bg-rose-500/20 border border-rose-400/30 px-3 py-2 rounded-xl text-xs font-bold text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>Ngưỡng cảnh báo: Giảm &gt; 40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Khách Hàng Cảnh Báo"
          value={data?.metrics?.totalFlagged || 0}
          subtitle="Giảm chi tiêu > 40% hoặc về 0"
          icon={TrendingDown}
          color="rose"
          badge="High Dip"
        />

        <MetricCard
          title="Doanh Số Nguy Cơ Mất"
          value={`$${(data?.metrics?.totalRevenueAtRisk || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Tổng độ sụt giảm so với tháng trước"
          icon={AlertTriangle}
          color="amber"
          badge="At Risk"
        />

        <MetricCard
          title="Tỷ Lệ Đã Giữ Chân / Xử Lý"
          value={`${data?.metrics?.resolutionRate || 0}%`}
          subtitle={`${data?.metrics?.resolvedCount || 0} salon đã có phương án thành công`}
          icon={CheckCircle2}
          color="emerald"
          badge="Resolved"
        />

        <MetricCard
          title="Lý Do Hàng Đầu"
          value="Tồn Kho Nhiều"
          subtitle="40% khách mua đợt trước còn hàng"
          icon={PackageCheck}
          color="navy"
          badge="Key Insight"
        />
      </div>

      {/* Reason Distribution Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#253c68]" />
              <span>Phân Bổ Nguyên Nhân Salon Mua Ít Đi (Root Cause Distribution)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân loại dữ liệu thực tế từ khảo sát của Sales Rep sau khi liên hệ trực tiếp chủ tiệm
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tháng 10/2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {(data?.reasonDistribution || []).map((item) => {
            const badge = getReasonBadge(item.key);
            const Icon = badge.icon;
            return (
              <div
                key={item.key}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#253c68]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">{badge.label}</span>
                  </div>
                  <span className="font-extrabold text-[#253c68] text-sm">
                    {item.count} salon ({item.percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.key === "HIGH_INVENTORY_REMAINING"
                        ? "bg-amber-500"
                        : item.key === "PRICE_COMPETITION"
                        ? "bg-rose-500"
                        : item.key === "PRODUCT_QUALITY_FEEDBACK"
                        ? "bg-sky-500"
                        : item.key === "DELIVERY_DELAY"
                        ? "bg-orange-500"
                        : "bg-[#253c68]"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Salon, chủ tiệm, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Reason Filter */}
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#253c68]"
          >
            <option value="ALL">Mọi nguyên nhân</option>
            <option value="HIGH_INVENTORY_REMAINING">Tồn kho còn nhiều</option>
            <option value="PRICE_COMPETITION">Cạnh tranh giá</option>
            <option value="PRODUCT_QUALITY_FEEDBACK">Chất lượng sản phẩm</option>
            <option value="DELIVERY_DELAY">Giao hàng chậm</option>
            <option value="STORE_TEMPORARILY_CLOSED">Tiệm sửa / Đóng cửa</option>
            <option value="OTHER">Lý do khác</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#253c68]"
          >
            <option value="ALL">Mọi trạng thái xử lý</option>
            <option value="PENDING">Chưa xử lý (Cần chăm sóc)</option>
            <option value="RESOLVED">Đã giải quyết / Giữ chân xong</option>
          </select>
        </div>
      </div>

      {/* Flagged Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Salon / Khách Hàng</th>
                <th className="py-3.5 px-4 text-right">Tháng Trước</th>
                <th className="py-3.5 px-4 text-right">Tháng Này</th>
                <th className="py-3.5 px-4 text-center">Tỷ Lệ Giảm (Dip %)</th>
                <th className="py-3.5 px-4">Nguyên Nhân Xác Định</th>
                <th className="py-3.5 px-4">Kế Hoạch Giữ Chân (Action Plan)</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#253c68]" />
                    <span>Đang phân tích dữ liệu mua hàng của khách...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">
                      Không có khách hàng nào bị sụt giảm bất thường!
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Toàn bộ salon duy trì nhịp mua đều đặn.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((item) => {
                  const badge = getReasonBadge(item.reason);
                  const Icon = badge.icon;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.dropPercent <= -80 ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Salon / Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.customer?.businessName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{item.customer?.contactPerson}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-[#253c68] font-semibold">
                            {item.customer?.phone}
                          </span>
                          <span>•</span>
                          <span>{item.customer?.city || "Texas"}</span>
                        </div>
                      </td>

                      {/* Previous Spend */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                        ${item.previousSpend.toFixed(2)}
                      </td>

                      {/* Current Spend */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ${item.currentSpend.toFixed(2)}
                      </td>

                      {/* Drop Percent */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{item.dropPercent}%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Giảm -${item.dropAmount.toFixed(0)}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.badgeClass}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        {item.saleNotes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 max-w-xs">
                            {item.saleNotes}
                          </p>
                        )}
                      </td>

                      {/* Action Plan */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-2">
                          {item.actionPlan || (
                            <span className="italic text-slate-400">
                              Chưa ghi nhận kế hoạch giữ chân
                            </span>
                          )}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Sale phụ trách:{" "}
                          <span className="font-semibold text-slate-600">
                            {item.saleRep || "Sơn Nguyễn"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {item.isResolved ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã xử lý</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Cần chăm sóc</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Log Reason & Plan Button */}
                          <button
                            onClick={() => handleOpenPlanModal(item)}
                            title="Ghi nhận lý do & lập kế hoạch"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-[#253c68]" />
                            <span>Kế hoạch</span>
                          </button>

                          {/* Quo SMS Retention */}
                          <button
                            onClick={() => handleOpenSmsModal(item)}
                            title="Gửi Quo SMS chăm sóc"
                            className="px-2.5 py-1.5 rounded-lg bg-[#253c68] hover:bg-[#1a2c4e] text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Quo SMS</span>
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

      {/* MODAL 1: GHI NHẬN LÝ DO & KẾ HOẠCH GIỮ CHÂN (LOG REASON & RETENTION PLAN) */}
      {selectedCustomerForPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileEdit className="w-5 h-5 text-[#38bdf8]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Ghi Nhận Lý Do & Kế Hoạch Giữ Chân
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Khảo sát thực tế từ cuộc gọi / gặp gỡ trực tiếp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForPlan(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="p-6 space-y-4">
              {/* Salon info banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Salon: </span>
                  <span className="font-bold text-slate-900">
                    {selectedCustomerForPlan.customer?.businessName}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Chủ: {selectedCustomerForPlan.customer?.contactPerson} •{" "}
                    {selectedCustomerForPlan.customer?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Mức sụt giảm</div>
                  <div className="font-bold text-rose-600 font-mono text-sm">
                    {selectedCustomerForPlan.dropPercent}%
                  </div>
                </div>
              </div>

              {/* Reason select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nguyên nhân chính khiến salon mua ít đi
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#253c68]"
                >
                  <option value="HIGH_INVENTORY_REMAINING">
                    📦 Tồn kho còn nhiều (Lô cọ trước thợ chưa dùng hết)
                  </option>
                  <option value="PRICE_COMPETITION">
                    🏷️ Cạnh tranh giá (Đối thủ chào giá thấp hơn hoặc chiết khấu cao)
                  </option>
                  <option value="PRODUCT_QUALITY_FEEDBACK">
                    ⭐ Phản hồi chất lượng sản phẩm (Lông cọ cứng/mềm, cán cầm...)
                  </option>
                  <option value="DELIVERY_DELAY">
                    🚚 Chậm trễ giao hàng (Đơn trước bị chậm trễ gây ảnh hưởng salon)
                  </option>
                  <option value="STORE_TEMPORARILY_CLOSED">
                    🏪 Tiệm tạm đóng cửa / Sửa chữa / Đổi chủ sở hữu
                  </option>
                  <option value="OTHER">
                    ❓ Lý do khác (Chủ đi vắng, chuyển địa điểm, thời vụ...)
                  </option>
                </select>
              </div>

              {/* Sale Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tình hình thực tế (Chủ salon chia sẻ gì?)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi chú chi tiết trao đổi: số lượng tồn còn lại, phản ánh của thợ nail, đối thủ đang chào giá bao nhiêu..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68] resize-none"
                />
              </div>

              {/* Action Plan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kế hoạch hành động giữ chân (Action Plan)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Tặng 5 cây cọ mẫu thử lông siêu mềm, ưu đãi combo sỉ, tạm hoãn chào cọ chuyển sang chào Brush Cleaner và bột nhúng..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68] resize-none"
                />
              </div>

              {/* Sales Rep & Resolved Checkbox */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sale Phụ Trách
                  </label>
                  <input
                    type="text"
                    value={saleRep}
                    onChange={(e) => setSaleRep(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isResolved}
                      onChange={(e) => setIsResolved(e.target.checked)}
                      className="w-4 h-4 text-[#253c68] rounded border-slate-300 focus:ring-[#253c68]"
                    />
                    <span>Đã giải quyết / Giữ chân xong</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPlan(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="flex-1 py-2.5 rounded-xl bg-[#253c68] hover:bg-[#1a2c4e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  {isSavingPlan ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Lưu kế hoạch phòng thủ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GỬI QUO SMS CHĂM SÓC (RETENTION SMS) */}
      {selectedForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-[#38bdf8]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Gửi Quo SMS Chăm Sóc & Giữ Chân
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Hotline gửi: +1 (713) 330-6165 (Quo US)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedForSms(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Người nhận: </span>
                  <span className="font-bold text-slate-900">
                    {selectedForSms.customer?.businessName} (
                    {selectedForSms.customer?.contactPerson})
                  </span>
                </div>
                <div className="font-mono font-bold text-[#253c68] bg-[#253c68]/10 px-2 py-0.5 rounded">
                  {selectedForSms.customer?.phone}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nội dung tin nhắn chăm sóc
                </label>
                <textarea
                  rows={5}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-sans text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#253c68] focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>
                    Ký tự: {smsContent.length} (~{Math.ceil(smsContent.length / 160)}{" "}
                    SMS)
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    Lưu tự động vào nhật ký SMS
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForSms(null)}
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
                  <span>Gửi SMS qua Quo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

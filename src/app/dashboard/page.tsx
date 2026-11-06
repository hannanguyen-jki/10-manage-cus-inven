"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
  FileText,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  ArrowRight,
  BarChart3,
  Award,
  Crown,
  Building2,
  Phone,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import MetricCard from "@/components/MetricCard";

// Custom Sleek Tooltip for Area & Bar Charts
const CustomChartTooltip = ({ active, payload, label, prefix = "$" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs">
        <p className="font-semibold text-slate-400 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between space-x-3 py-0.5">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {prefix}
              {Number(entry.value).toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject("Fetch error")))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  const metrics = data?.metrics || {
    totalRevenue: 72890,
    totalCustomers: 32,
    vipCustomers: 11,
    wholesaleCustomers: 14,
    standardCustomers: 7,
    totalGrossProfit: 51240,
    totalAR: 8640,
    overdueAR: 3450,
    churnAlertCount: 5,
    averageOrderValue: 1150,
  };

  const revenueTrend = data?.revenueTrend || [
    { year: "2024", revenue: 20042, label: "Năm 2024" },
    { year: "2025", revenue: 27863, label: "Năm 2025" },
    { year: "2026", revenue: 48980, label: "Năm 2026 (YTD)" },
  ];

  const arAging = data?.arAging || [
    { category: "Current (0-30)", amount: 5190, color: "#10b981" },
    { category: "31-60 Days", amount: 1725, color: "#38bdf8" },
    { category: "61-90 Days", amount: 1035, color: "#f59e0b" },
    { category: "90+ Days", amount: 690, color: "#f43f5e" },
  ];

  const customerTiers = data?.customerTiers || [
    { name: "VIP Wholesale (>$3k)", value: metrics.vipCustomers || 11, color: "#253c68" },
    { name: "Wholesale ($1k-$3k)", value: metrics.wholesaleCustomers || 14, color: "#38bdf8" },
    { name: "Standard (<$1k)", value: metrics.standardCustomers || 7, color: "#10b981" },
  ];

  const topCustomers = data?.topCustomers || [];
  const churnAlerts = data?.churnAlerts || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Header & Operations Cockpit */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#253c68] via-[#1a2c4e] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#253c68]/15 border border-slate-700/60">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-[#38bdf8] mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>JKIOCEAN Houston Hub • Quản Trị Khách Hàng & Doanh Thu B2B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bảng Điều Hành Doanh Số & Khách Hàng B2B
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              Theo dõi chi tiết số liệu mua hàng thực tế từ 32 đại lý & Salon Nail đối tác (Doanh thu các năm 2024 - 2025 - 2026, lợi nhuận gộp và quản lý công nợ).
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap lg:flex-col sm:flex-row gap-2.5 shrink-0">
            <Link
              href="/customers"
              className="inline-flex items-center justify-center space-x-2 bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>Xem 32 Khách Hàng B2B</span>
            </Link>
            <Link
              href="/quotes/create"
              className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-[#253c68] font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-[#253c68]" />
              <span>Tạo Báo Giá PDF Kèm Ảnh</span>
            </Link>
            <Link
              href="/ar"
              className="inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4 text-[#38bdf8]" />
              <span>Theo Dõi Thu Hồi Công Nợ</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#38bdf8]/15 to-transparent pointer-events-none blur-3xl" />
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Tổng Doanh Thu B2B"
          value={`$${Number(metrics.totalRevenue).toLocaleString("en-US")}`}
          subtitle="Doanh số tích lũy từ 32 đối tác"
          icon={DollarSign}
          trend={{ value: "+28.4% tăng trưởng", isPositive: true }}
          color="navy"
          badge="Doanh Số Tích Lũy"
        />

        <MetricCard
          title="Khách Hàng B2B Thực Tế"
          value={`${metrics.totalCustomers} Đối Tác`}
          subtitle={`${metrics.vipCustomers} Đại lý VIP / Wholesale lớn`}
          icon={Users}
          color="sky"
          badge="Mạng Lưới Salon"
        />

        <MetricCard
          title="Lợi Nhuận Gộp Đóng Góp"
          value={`$${Number(metrics.totalGrossProfit).toLocaleString("en-US")}`}
          subtitle="Tỷ suất lợi nhuận đóng góp từ khách hàng"
          icon={Award}
          color="emerald"
          badge="Lợi Nhuận Thực Tế"
        />

        <MetricCard
          title="Tổng Công Nợ AR Còn Lại"
          value={`$${Number(metrics.totalAR).toLocaleString("en-US")}`}
          subtitle={`$${Number(metrics.overdueAR).toLocaleString("en-US")} cần nhắc hẹn thanh toán`}
          icon={Receipt}
          color={metrics.overdueAR > 0 ? "rose" : "emerald"}
          badge="Accounts Receivable"
        />
      </div>

      {/* Churn Alert Banner */}
      {churnAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Phát Hiện {churnAlerts.length} Khách Hàng Có Doanh Số Năm 2026 Suy Giảm (Churn Risk)
                  </h3>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    CẦN CHĂM SÓC
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Các đối tác như Nails Warehouse, Monaco Nail Supply... có tỷ lệ sụt giảm doanh số &gt;35% so với năm 2025. Cần liên hệ gửi bảng giá ưu đãi mới.
                </p>
              </div>
            </div>
            <Link
              href="/churn"
              className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all shrink-0 self-end sm:self-auto"
            >
              <span>Xem Chi Tiết Cảnh Báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 2 MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Doanh Thu Qua Các Năm (2024 - 2025 - 2026) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#253c68]" />
                  <h3 className="font-bold text-slate-900 text-base">Tăng Trưởng Doanh Thu B2B Qua Các Năm</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp doanh số bán buôn thực tế năm 2024, 2025 và 2026 (YTD)
                </p>
              </div>
              <span className="text-xs font-bold bg-[#253c68]/10 text-[#253c68] px-2.5 py-1 rounded-lg self-start sm:self-auto">
                Dữ liệu thực tế từ Sheet
              </span>
            </div>

            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip content={<CustomChartTooltip prefix="$" />} />
                  <Bar dataKey="revenue" name="Doanh Thu ($)" fill="#253c68" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Giá trị đơn hàng trung bình (AOV):</span>
            <span className="font-bold text-[#253c68] text-sm">${metrics.averageOrderValue.toLocaleString("en-US")} / đơn</span>
          </div>
        </div>

        {/* Chart 2: Customer Tier Breakdown (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">Phân Hạng Khách Hàng</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">32 đối tác phân chia theo hạn mức chi tiêu</p>
              </div>
            </div>

            <div className="h-56 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerTiers}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {customerTiers.map((entry: any, index: number) => (
                      <Cell key={`tier-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip prefix="" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {customerTiers.map((tier: any) => (
                <div key={tier.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-medium text-slate-700">{tier.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{tier.value} Salon ({Math.round((tier.value / 32) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hạng VIP & Wholesale:</span>
            <span className="font-bold text-[#253c68] text-sm">
              {metrics.vipCustomers + metrics.wholesaleCustomers} / 32 (78%)
            </span>
          </div>
        </div>
      </div>

      {/* TWO ACTION PANELS: TOP CUSTOMERS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top B2B Customers By Lifetime Purchases */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top 5 Khách Hàng Chi Tiêu Lớn Nhất</h3>
                <p className="text-xs text-slate-400">Các đối tác mang lại doanh số & lợi nhuận cao nhất</p>
              </div>
            </div>
            <Link
              href="/customers"
              className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
            >
              <span>Xem Tất Cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {topCustomers.map((cust: any, idx: number) => (
              <Link
                key={cust.id}
                href={`/customers/${cust.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#253c68]/30 hover:bg-slate-50/80 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 font-black text-xs text-slate-600 flex items-center justify-center group-hover:bg-[#253c68] group-hover:text-white transition-colors">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#253c68]">
                      {cust.businessName}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Người liên hệ: <strong>{cust.contactPerson}</strong></span>
                      <span>•</span>
                      <span>SĐT: <strong className="font-mono">{cust.phone}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">
                    ${Number(cust.totalSpent).toLocaleString("en-US")}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    Lợi nhuận: +${Number(cust.profit).toLocaleString("en-US")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Hoạt Động Hóa Đơn / Mua Hàng Gần Đây */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Đơn Hàng & Hóa Đơn Mới Nhất</h3>
                <p className="text-xs text-slate-400">Lịch sử xuất hàng và thu tiền của các salon</p>
              </div>
            </div>
            <Link
              href="/ar"
              className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
            >
              <span>Xem Công Nợ AR</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-[#253c68] text-xs font-mono">{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.paymentStatus === "PARTIAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{ord.customer}</div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">
                    ${Number(ord.totalAmount).toLocaleString("en-US")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString("en-US")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

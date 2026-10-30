"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Package,
  Receipt,
  TrendingDown,
  FileText,
  Upload,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const metrics = data?.metrics || {
    totalRevenue: 28450,
    totalCustomers: 24,
    vipCustomers: 6,
    totalProducts: 38,
    lowStockCount: 3,
    totalStockValue: 84600,
    totalAR: 9240,
    overdueAR: 2150,
    churnAlertCount: 2,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Welcome & Houston Hub Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#253c68] via-[#1a2c4e] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#253c68]/10 border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#38bdf8] mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JKIOCEAN Houston Hub • Vận Hành Bán Hàng & Kho</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tổng Quan Kinh Doanh & Điều Hành
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Theo dõi doanh số theo từng khách hàng, quản lý biến động kho, tự động hóa follow-up và kiểm soát công nợ thị trường Mỹ.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/quotes/create"
              className="inline-flex items-center space-x-2 bg-white text-[#253c68] hover:bg-slate-100 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all btn-press"
            >
              <FileText className="w-4 h-4 text-[#253c68]" />
              <span>Tạo Báo Giá PDF</span>
            </Link>
            <Link
              href="/inventory/import"
              className="inline-flex items-center space-x-2 bg-[#38bdf8] hover:bg-sky-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all btn-press"
            >
              <Upload className="w-4 h-4" />
              <span>Import Word (.docx)</span>
            </Link>
            <Link
              href="/leads"
              className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all btn-press"
            >
              <Users className="w-4 h-4 text-[#38bdf8]" />
              <span>Tìm Salon B2B</span>
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#38bdf8]/10 to-transparent pointer-events-none blur-3xl"></div>
      </div>

      {/* 4 Core Metric Cards with Hover Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Doanh Số Tích Lũy"
          value={`$${Number(metrics.totalRevenue).toLocaleString("en-US")}`}
          subtitle="Doanh thu từ các đơn hàng B2B"
          icon={DollarSign}
          trend={{ value: "14.2% tháng này", isPositive: true }}
          color="navy"
          badge="Doanh Số"
        />

        <MetricCard
          title="Khách Hàng B2B"
          value={metrics.totalCustomers}
          subtitle={`${metrics.vipCustomers} khách VIP đại lý sỉ`}
          icon={Users}
          trend={{ value: "+3 salon mới", isPositive: true }}
          color="sky"
          badge="Salon & Supply"
        />

        <MetricCard
          title="Tổng Tồn Kho (Houston)"
          value={`$${Number(metrics.totalStockValue).toLocaleString("en-US")}`}
          subtitle={`${metrics.lowStockCount} sản phẩm sắp hết hàng`}
          icon={Package}
          color={metrics.lowStockCount > 0 ? "amber" : "emerald"}
          badge={metrics.lowStockCount > 0 ? "Cần Nhập Thêm" : "Kho Đầy Đủ"}
        />

        <MetricCard
          title="Công Nợ Phải Thu (AR)"
          value={`$${Number(metrics.totalAR).toLocaleString("en-US")}`}
          subtitle={`Quá hạn: $${Number(metrics.overdueAR).toLocaleString("en-US")}`}
          icon={Receipt}
          color={metrics.overdueAR > 0 ? "rose" : "emerald"}
          badge="Accounts Receivable"
        />
      </div>

      {/* Special Feature: Churn & Purchase Dip Anomaly Alert */}
      {metrics.churnAlertCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white rounded-2xl border border-rose-200/80 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cảnh Báo Biến Động: Có {metrics.churnAlertCount} Khách Hàng Tháng Trước Mua Nhiều Nhưng Tháng Này Mua Ít!
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full">
                    Cần Gán Lý Do
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Hệ thống tự động phát hiện sụt giảm doanh số &gt;40%. Vui lòng kiểm tra lý do (tồn kho cũ, giá cạnh tranh hay chất lượng) để có giải pháp chăm sóc giữ chân khách.
                </p>
              </div>
            </div>

            <Link
              href="/churn"
              className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors btn-press shadow-sm shadow-rose-600/20"
            >
              <span>Xem & Chẩn Đoán Ngay</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Two-Column Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: B2B Leads AI vừa tìm thấy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">B2B Leads AI Gợi Ý Tiếp Cận</h3>
                <p className="text-xs text-slate-400">Salon nail tiềm năng cao tại Texas & California</p>
              </div>
            </div>
            <Link href="/leads" className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1">
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentLeads && data.recentLeads.length > 0
              ? data.recentLeads
              : [
                  {
                    id: "l1",
                    salonName: "Milano Nail Spa Austin",
                    city: "Austin, TX",
                    phone: "+1 (512) 555-0143",
                    icpScore: 94,
                    personalizedHook: "Tiệm 24 thợ chuyên đắp bột Ombre cao cấp, nhu cầu cọ Z Brushes rất lớn",
                  },
                  {
                    id: "l2",
                    salonName: "Bella Nails & Spa Houston",
                    city: "Houston, TX",
                    phone: "+1 (832) 555-0199",
                    icpScore: 88,
                    personalizedHook: "Gần kho Houston, thợ thường xuyên thay kềm cắt da Cobalt",
                  },
                  {
                    id: "l3",
                    salonName: "Diamond Nails Supply Dallas",
                    city: "Dallas, TX",
                    phone: "+1 (214) 555-0187",
                    icpScore: 82,
                    personalizedHook: "Đại lý phân phối sỉ đang tìm nguồn cọ Kolinsky nhập trực tiếp",
                  },
                ]
            ).map((lead: any) => (
              <div
                key={lead.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#253c68]/30 transition-all flex items-center justify-between card-hover"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{lead.salonName}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                      {lead.city}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                    "{lead.personalizedHook}"
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    ICP {lead.icpScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quản lý Công Nợ & Báo Giá Gần Đây */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hóa Đơn Cần Thu Hồi Công Nợ</h3>
                <p className="text-xs text-slate-400">Theo dõi hạn nợ và gửi nhắc nhở 1-click qua Quo SMS</p>
              </div>
            </div>
            <Link href="/ar" className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1">
              <span>Xem báo cáo AR</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "ord-1",
                orderNumber: "ORD-2026-0881",
                customer: "Luxury Nail Lounge Houston",
                dueDays: 14,
                balance: 1450,
                status: "OVERDUE",
              },
              {
                id: "ord-2",
                orderNumber: "ORD-2026-0885",
                customer: "One Nail Supply Store",
                dueDays: 5,
                balance: 3200,
                status: "DUE_SOON",
              },
              {
                id: "ord-3",
                orderNumber: "ORD-2026-0889",
                customer: "T&T Beauty Supply Houston",
                dueDays: 28,
                balance: 890,
                status: "OVERDUE",
              },
            ].map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#253c68]/30 transition-all flex items-center justify-between card-hover"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{inv.orderNumber}</span>
                    <span className="text-xs text-slate-600 font-semibold">• {inv.customer}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Hạn nợ: {inv.dueDays} ngày trước</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-rose-600">${inv.balance.toLocaleString()}</p>
                  <Link
                    href={`/ar?search=${inv.orderNumber}`}
                    className="inline-flex items-center space-x-1 text-[11px] text-[#253c68] font-bold hover:underline mt-0.5"
                  >
                    <PhoneCall className="w-2.5 h-2.5" />
                    <span>Nhắc nợ Quo</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

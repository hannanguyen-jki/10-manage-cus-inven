"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Package,
  Receipt,
  TrendingUp,
  FileText,
  Upload,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Clock,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
            <span className="font-bold text-white">
              {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString("en-US") : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Donut Chart
const DonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-2xl border border-slate-700 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-semibold">{data.name}:</span>
          <span className="font-bold text-sky-400">{data.value} accounts</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
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
    totalRevenue: 28450,
    totalCustomers: 24,
    vipCustomers: 6,
    totalProducts: 38,
    lowStockCount: 3,
    totalStockValue: 84600,
    totalAR: 9240,
    overdueAR: 2150,
    churnAlertCount: 2,
    revenueGrowth: 14.2,
  };

  const revenueTrend = data?.revenueTrend || [
    { month: "May", revenue: 18200, target: 16000, orders: 28 },
    { month: "Jun", revenue: 21400, target: 19000, orders: 34 },
    { month: "Jul", revenue: 24800, target: 22000, orders: 41 },
    { month: "Aug", revenue: 23100, target: 24000, orders: 37 },
    { month: "Sep", revenue: 26900, target: 25000, orders: 46 },
    { month: "Oct", revenue: 28450, target: 27000, orders: 52 },
  ];

  const arAging = data?.arAging || [
    { category: "Current", amount: 5200, color: "#10b981" },
    { category: "1-15 Days", amount: 1890, color: "#38bdf8" },
    { category: "16-30 Days", amount: 980, color: "#f59e0b" },
    { category: "31-60 Days", amount: 820, color: "#fb923c" },
    { category: "60+ Days", amount: 350, color: "#f43f5e" },
  ];

  const customerTiers = data?.customerTiers || [
    { name: "VIP Wholesale", value: 6, color: "#253c68" },
    { name: "Gold Salons", value: 9, color: "#38bdf8" },
    { name: "Silver Salons", value: 7, color: "#10b981" },
    { name: "New Accounts", value: 2, color: "#f59e0b" },
  ];

  const inventoryByCategory = data?.inventoryByCategory || [
    { category: "Acrylic Brushes", inStock: 18, lowStock: 1, stockValue: 34200 },
    { category: "Nail Nippers", inStock: 12, lowStock: 2, stockValue: 28500 },
    { category: "Gel Systems", inStock: 8, lowStock: 0, stockValue: 14800 },
    { category: "Accessories", inStock: 5, lowStock: 0, stockValue: 7100 },
  ];

  const churnAlerts = data?.churnAlerts || [];
  const recentLeads = data?.recentLeads || [];
  const pendingAR = data?.pendingAR || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Header & Operations Cockpit */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#253c68] via-[#1a2c4e] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#253c68]/15 border border-slate-700/60">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-[#38bdf8] mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>JKIOCEAN Houston Hub • Sales & Warehouse Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Executive Business & Operations Cockpit
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              Real-time B2B revenue tracking, inventory valuation, AR aging, and salon engagement metrics across the US market.
            </p>

            {/* Time Range Filter Pills */}
            <div className="flex items-center gap-1.5 mt-5">
              {[
                { id: "7d", label: "Last 7 Days" },
                { id: "30d", label: "Last 30 Days" },
                { id: "quarter", label: "This Quarter" },
                { id: "ytd", label: "Year to Date" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setTimeRange(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    timeRange === pill.id
                      ? "bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#38bdf8]/20"
                      : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Shortcuts (100% Professional English) */}
          <div className="flex flex-wrap lg:flex-col sm:flex-row gap-2.5 shrink-0">
            <Link
              href="/quotes/create"
              className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-[#253c68] font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-[#253c68]" />
              <span>Create PDF Quote</span>
            </Link>
            <Link
              href="/inventory/import"
              className="inline-flex items-center justify-center space-x-2 bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import Word (.docx)</span>
            </Link>
            <Link
              href="/leads"
              className="inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-[#38bdf8]" />
              <span>Explore B2B Leads</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#38bdf8]/15 to-transparent pointer-events-none blur-3xl" />
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total B2B Revenue"
          value={`$${Number(metrics.totalRevenue).toLocaleString("en-US")}`}
          subtitle="Gross sales across 24 salons"
          icon={DollarSign}
          trend={{ value: `+${metrics.revenueGrowth || 14.2}% MoM`, isPositive: true }}
          color="navy"
          badge="Houston Sales"
        />

        <MetricCard
          title="Active B2B Customers"
          value={`${metrics.totalCustomers} Salons`}
          subtitle={`${metrics.vipCustomers} VIP Wholesale accounts`}
          icon={Users}
          trend={{ value: "+3 new this month", isPositive: true }}
          color="sky"
          badge="B2B Network"
        />

        <MetricCard
          title="Houston Stock Valuation"
          value={`$${Number(metrics.totalStockValue).toLocaleString("en-US")}`}
          subtitle={`${metrics.lowStockCount} items below safety limit`}
          icon={Package}
          color={metrics.lowStockCount > 0 ? "amber" : "emerald"}
          badge={metrics.lowStockCount > 0 ? "Reorder Needed" : "Stock Optimal"}
        />

        <MetricCard
          title="Outstanding AR Balance"
          value={`$${Number(metrics.totalAR).toLocaleString("en-US")}`}
          subtitle={`$${Number(metrics.overdueAR).toLocaleString("en-US")} past due date`}
          icon={Receipt}
          color={metrics.overdueAR > 0 ? "rose" : "emerald"}
          badge="Accounts Receivable"
        />
      </div>

      {/* Anomaly / Purchase Dip Alert Banner */}
      {metrics.churnAlertCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50/70 to-white rounded-2xl border border-rose-200/90 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Purchase Anomaly Alert: {metrics.churnAlertCount} Salons Showed &gt;40% Reorder Drop This Month
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Automated telemetry detected sudden order deceleration. Review salon notes (inventory overhang, competitive pricing, or feedback) to protect recurring B2B volume.
                </p>
              </div>
            </div>

            <Link
              href="/churn"
              className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow-sm shadow-rose-600/20 active:scale-95"
            >
              <span>Diagnose & Resolve</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* VISUAL CHARTS SECTION - ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Revenue & Order Trajectory (Area Chart with Target Benchmark) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#253c68]" />
                  <h3 className="font-bold text-slate-900 text-base">Revenue & Order Trajectory</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly gross sales performance against benchmark target ($27,000 for Oct)
                </p>
              </div>

              {/* Chart Legend & Target Info */}
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#253c68]" />
                  <span>Actual Sales</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500">
                  <span className="w-3 h-0.5 bg-[#38bdf8] border-b-2 border-dashed border-[#38bdf8]" />
                  <span>Target Benchmark</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Container */}
            <div className="h-72 w-full mt-4">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#253c68" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#253c68" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val / 1000}k`}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomChartTooltip prefix="$" />} />
                    <Area
                      type="monotone"
                      dataKey="target"
                      name="Target Benchmark"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#targetGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Actual Revenue"
                      stroke="#253c68"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading revenue chart...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Average Order Size: $547 / order</span>
            <span className="font-bold text-emerald-600 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Oct Revenue exceeded target by +5.3%</span>
            </span>
          </div>
        </div>

        {/* Chart 2: Customer Tier & Segment Distribution (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                <h3 className="font-bold text-slate-900 text-base">Customer Segments</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of active accounts by purchasing volume tier
              </p>
            </div>

            {/* Donut Container with Center Label */}
            <div className="relative h-56 w-full mt-2 flex items-center justify-center">
              {isMounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTiers}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {customerTiers.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900 leading-tight">24</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Accounts
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading segment chart...
                </div>
              )}
            </div>

            {/* Legend List */}
            <div className="space-y-2 mt-2">
              {customerTiers.map((tier: any) => (
                <div key={tier.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-semibold text-slate-700">{tier.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{tier.value} salons</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({Math.round((tier.value / 24) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Key Accounts Retention:</span>
            <span className="font-bold text-[#253c68]">96.8%</span>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS SECTION - ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Accounts Receivable (AR) Aging Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#253c68]" />
                  <h3 className="font-bold text-slate-900 text-base">AR Aging Distribution</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Outstanding credit categorized by maturity and overdue risk
                </p>
              </div>
              <Link
                href="/ar"
                className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
              >
                <span>AR Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Recharts Bar Container */}
            <div className="h-64 w-full mt-4">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={arAging} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomChartTooltip prefix="$" />} />
                    <Bar dataKey="amount" name="Outstanding Balance" radius={[6, 6, 0, 0]}>
                      {arAging.map((entry: any, index: number) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading AR chart...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Overdue Risk: <span className="font-bold text-rose-600">$2,150 (23.3%)</span>
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              76.7% In Good Standing
            </span>
          </div>
        </div>

        {/* Chart 4: Inventory Health & Stock Valuation by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-[#38bdf8]" />
                  <h3 className="font-bold text-slate-900 text-base">Inventory Health by Category</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available warehouse stock units and low-stock warnings
                </p>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
              >
                <span>Stock Room</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Category Health Bars */}
            <div className="space-y-4 mt-5">
              {inventoryByCategory.map((cat: any) => {
                const totalUnits = cat.inStock + cat.lowStock;
                const healthPercent = Math.min(100, Math.round((cat.inStock / (totalUnits || 1)) * 100));
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{cat.category}</span>
                        {cat.lowStock > 0 ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {cat.lowStock} Low Stock Alert
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            Optimal
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-slate-600 font-medium">
                        <span>{cat.inStock} In Stock</span>
                        <span className="text-slate-900 font-bold">${cat.stockValue.toLocaleString("en-US")}</span>
                      </div>
                    </div>
                    {/* Progress Track */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          cat.lowStock > 0 ? "bg-amber-500" : "bg-[#253c68]"
                        }`}
                        style={{ width: `${healthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Houston Inventory Valuation:</span>
            <span className="font-black text-slate-900 text-sm">$84,600</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN HIGH-PRIORITY ACTION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top B2B Salon Opportunities (AI ICP Qualified) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top B2B Salon Opportunities</h3>
                <p className="text-xs text-slate-400">High-conversion prospective salons in Texas & California</p>
              </div>
            </div>
            <Link
              href="/leads"
              className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
            >
              <span>View All Leads</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead: any) => (
              <div
                key={lead.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#253c68]/30 transition-all flex items-center justify-between card-hover group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{lead.salonName}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                      {lead.city}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                    &ldquo;{lead.personalizedHook}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">{lead.phone}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    ICP {lead.icpScore}/100
                  </span>
                  <Link
                    href={`/leads`}
                    className="inline-flex items-center space-x-1 text-[11px] text-[#253c68] font-bold hover:underline opacity-80 group-hover:opacity-100"
                  >
                    <span>Engage</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pending AR Collections & Cash Flow Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pending AR Collections</h3>
                <p className="text-xs text-slate-400">Overdue balances requiring automated Quo SMS payment reminders</p>
              </div>
            </div>
            <Link
              href="/ar"
              className="text-xs font-bold text-[#253c68] hover:underline flex items-center space-x-1"
            >
              <span>View AR Ledger</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingAR.map((inv: any) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#253c68]/30 transition-all flex items-center justify-between card-hover group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{inv.orderNumber}</span>
                    <span className="text-xs text-slate-700 font-semibold">• {inv.customer}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-500">
                      {inv.status === "OVERDUE" ? `Matured ${inv.dueDays} days ago` : `Due in ${inv.dueDays} days`}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        inv.status === "OVERDUE"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status === "OVERDUE" ? "Overdue" : "Due Soon"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-rose-600">${inv.balance.toLocaleString("en-US")}</p>
                  <Link
                    href={`/ar?search=${inv.orderNumber}`}
                    className="inline-flex items-center space-x-1 text-[11px] text-[#253c68] font-bold hover:underline mt-0.5"
                  >
                    <PhoneCall className="w-2.5 h-2.5" />
                    <span>Send Quo SMS</span>
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

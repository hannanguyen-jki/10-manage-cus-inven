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
  const [saleRep, setSaleRep] = useState<string>("Johnny Tran");
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
    setSaleRep(item.saleRep || item.customer?.assignedSale || "Johnny Tran");
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
          `Retention plan saved successfully for ${selectedCustomerForPlan.customer?.businessName}!`
        );
        setSelectedCustomerForPlan(null);
        await fetchChurnData();
      } else {
        showToast(resData.error || "Failed to save retention plan", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Data saving error", "error");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Open Quo SMS Modal for Retention
  const handleOpenSmsModal = (item: FlaggedCustomer) => {
    setSelectedForSms(item);
    const contact =
      item.customer?.contactPerson || item.customer?.businessName || "Valued Customer";

    let message = "";
    if (item.reason === "HIGH_INVENTORY_REMAINING") {
      message = `Hi ${contact}, this is Johnny from JKIOCEAN Houston checking in. How are your nail technicians liking the Kolinsky brushes from last month? Our Houston Hub just received our new specialized Brush Cleaner and Liquid Monomer formula—we'd love to send your salon a complimentary bottle to test out!`;
    } else if (item.reason === "PRICE_COMPETITION") {
      message = `Hi ${contact}, JKIOCEAN Houston is running an exclusive VIP salon appreciation special this month: Order any 25 Kolinsky Z-Brushes, receive 5 complimentary acrylic oval brushes + Free UPS Express shipping across Texas. Let us know which sizes your technicians need!`;
    } else {
      message = `Hi ${contact}, this is Johnny from JKIOCEAN Houston (+1 713-330-6165). We value your salon partnership and noticed you haven't placed a brush replenishment order recently. How can we support your team with our wholesale pricing or specialized bristle options?`;
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
          `Quo SMS sent successfully to ${selectedForSms.customer?.businessName} (${selectedForSms.customer?.phone})!`
        );
        setSelectedForSms(null);
      } else {
        showToast(resData.error || "Failed to send SMS via Quo", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Quo connection error", "error");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Helper reason text & badge
  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "HIGH_INVENTORY_REMAINING":
        return {
          label: "High existing inventory",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
          icon: PackageCheck,
        };
      case "PRICE_COMPETITION":
        return {
          label: "Competitor pricing pressure",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
          icon: Tag,
        };
      case "PRODUCT_QUALITY_FEEDBACK":
        return {
          label: "Product quality issue / feedback",
          badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
          icon: ThumbsDown,
        };
      case "DELIVERY_DELAY":
        return {
          label: "Delivery delay",
          badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
          icon: Truck,
        };
      case "STORE_TEMPORARILY_CLOSED":
        return {
          label: "Store temporarily closed / Renovation",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
          icon: Store,
        };
      default:
        return {
          label: "Other (Vacation, seasonal slowdown)",
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
                  Customer Churn & Purchase Dip Detection
                </h1>
                <p className="text-sm text-slate-300 italic mt-0.5">
                  AI-driven anomaly detection identifying salons with &gt;40% order drop compared to previous months
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
              <span>Re-analyze</span>
            </button>
            <div className="flex items-center space-x-2 bg-rose-500/20 border border-rose-400/30 px-3 py-2 rounded-xl text-xs font-bold text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>Alert Threshold: Drop &gt; 40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Flagged Accounts"
          value={data?.metrics?.totalFlagged || 0}
          subtitle="Spend dip > 40% or zero spend"
          icon={TrendingDown}
          color="rose"
          badge="High Dip"
        />

        <MetricCard
          title="Revenue at Risk"
          value={`$${(data?.metrics?.totalRevenueAtRisk || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Total spend decline vs prior month"
          icon={AlertTriangle}
          color="amber"
          badge="At Risk"
        />

        <MetricCard
          title="Resolution Rate"
          value={`${data?.metrics?.resolutionRate || 0}%`}
          subtitle={`${data?.metrics?.resolvedCount || 0} salons with active retention plans`}
          icon={CheckCircle2}
          color="emerald"
          badge="Resolved"
        />

        <MetricCard
          title="Primary Churn Driver"
          value="High Inventory"
          subtitle="40% of salons still hold prior stock"
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
              <span>Root Cause Distribution & Purchase Dip Analysis</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical findings verified by sales representatives through direct salon visits and phone calls
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            October 2026
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
                    {item.count} salons ({item.percent}%)
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
            placeholder="Search by salon, contact person, phone, city..."
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
            <option value="ALL">All Reasons</option>
            <option value="HIGH_INVENTORY_REMAINING">High existing inventory</option>
            <option value="PRICE_COMPETITION">Competitor pricing pressure</option>
            <option value="PRODUCT_QUALITY_FEEDBACK">Quality issue / feedback</option>
            <option value="DELIVERY_DELAY">Delivery delay</option>
            <option value="STORE_TEMPORARILY_CLOSED">Store temporarily closed / Renovation</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#253c68]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review (Action Required)</option>
            <option value="RESOLVED">Resolved / Retained</option>
          </select>
        </div>
      </div>

      {/* Flagged Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Salon / Customer</th>
                <th className="py-3.5 px-4 text-right">Previous Spend</th>
                <th className="py-3.5 px-4 text-right">Current Spend</th>
                <th className="py-3.5 px-4 text-center">Dip %</th>
                <th className="py-3.5 px-4">Identified Root Cause</th>
                <th className="py-3.5 px-4">Action Plan / Follow-up Note</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#253c68]" />
                    <span>Analyzing customer purchasing patterns...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">
                      No accounts flagged with abnormal purchase dips!
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      All salon accounts maintain regular purchasing frequency.
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
                          Dip -${item.dropAmount.toFixed(0)}
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
                              No follow-up action plan recorded
                            </span>
                          )}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Sales Rep:{" "}
                          <span className="font-semibold text-slate-600">
                            {item.saleRep || "Johnny Tran"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {item.isResolved ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Action Required</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Log Reason & Plan Button */}
                          <button
                            onClick={() => handleOpenPlanModal(item)}
                            title="Log Follow-up Note & Plan"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-[#253c68]" />
                            <span>Plan</span>
                          </button>

                          {/* Quo SMS Retention */}
                          <button
                            onClick={() => handleOpenSmsModal(item)}
                            title="Send Quo Retention SMS"
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

      {/* MODAL 1: LOG REASON & RETENTION PLAN */}
      {selectedCustomerForPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileEdit className="w-5 h-5 text-[#38bdf8]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Log Follow-up Note & Retention Plan
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Empirical survey from direct call or salon visit
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
                    Contact: {selectedCustomerForPlan.customer?.contactPerson} •{" "}
                    {selectedCustomerForPlan.customer?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Spend Decline</div>
                  <div className="font-bold text-rose-600 font-mono text-sm">
                    {selectedCustomerForPlan.dropPercent}%
                  </div>
                </div>
              </div>

              {/* Reason select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Primary Root Cause for Purchase Dip
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#253c68]"
                >
                  <option value="HIGH_INVENTORY_REMAINING">
                    📦 High existing inventory (Technicians still using prior brush batch)
                  </option>
                  <option value="PRICE_COMPETITION">
                    🏷️ Competitor pricing pressure (Competitor offered lower quotes / discounts)
                  </option>
                  <option value="PRODUCT_QUALITY_FEEDBACK">
                    ⭐ Quality feedback / issue (Bristle softness, handle balance, etc.)
                  </option>
                  <option value="DELIVERY_DELAY">
                    🚚 Delivery delay (Prior order logistics affected salon operations)
                  </option>
                  <option value="STORE_TEMPORARILY_CLOSED">
                    🏪 Store temporarily closed / Remodeling / Ownership transfer
                  </option>
                  <option value="OTHER">
                    ❓ Other reason (Owner traveling, seasonal slowdown, relocation)
                  </option>
                </select>
              </div>

              {/* Sale Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Observed Situation & Salon Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed notes: remaining inventory count, technician feedback, competitor price quoted..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68] resize-none"
                />
              </div>

              {/* Action Plan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Action Plan / Retention Strategy
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Provide 5 ultra-soft sample brushes, offer wholesale combo discount, pitch Brush Cleaner & dipping powder..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#253c68] resize-none"
                />
              </div>

              {/* Sales Rep & Resolved Checkbox */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sales Representative
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
                    <span>Mark Resolved / Retained</span>
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
                  Close
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
                  <span>Save Retention Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND QUO RETENTION SMS */}
      {selectedForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#253c68] to-[#1a2c4e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-[#38bdf8]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Send Quo Retention & Care SMS
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Sending Hotline: +1 (713) 330-6165 (Quo US)
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
                  <span className="text-slate-500 font-medium">Recipient: </span>
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
                  SMS Message Content
                </label>
                <textarea
                  rows={5}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-sans text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#253c68] focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>
                    Characters: {smsContent.length} (~{Math.ceil(smsContent.length / 160)}{" "}
                    SMS)
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    Automatically logged to customer history
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForSms(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Close
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
                  <span>Send SMS via Quo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

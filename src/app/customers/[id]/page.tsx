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
          assignedSale: c.assignedSale || "johnny",
          tier: c.tier || "STANDARD",
          status: c.status || "ACTIVE",
          notes: c.notes || "",
        });
      } else {
        setError(data.error || "Customer profile not found");
      }
    } catch (err: any) {
      console.error("Fetch customer detail error:", err);
      setError("Failed to load customer profile");
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
        showToast("Customer profile updated successfully!");
        setIsEditModalOpen(false);
        fetchCustomerDetail();
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
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
        showToast("Quo SMS sent successfully!");
        setIsSmsModalOpen(false);
        setSmsData({ type: "FOLLOW_UP", content: "" });
        fetchCustomerDetail();
      } else {
        showToast(data.error || "Failed to send SMS", "error");
      }
    } catch (err) {
      showToast("Error sending SMS", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP") => {
    if (!customer) return;
    let text = "";
    if (type === "PROMOTION") {
      text = `JKIOCEAN: Hi ${customer.contactPerson}, the new batch of Z-Kolinsky Master #14 brushes just arrived at our Houston Hub. We reserved a VIP wholesale price for ${customer.businessName}!`;
    } else if (type === "BIRTHDAY") {
      text = `JKIOCEAN wishes ${customer.contactPerson} a wonderful birthday filled with happiness, health, and continued prosperity for ${customer.businessName}!`;
    } else if (type === "AR_REMINDER") {
      text = `JKIOCEAN friendly notice for ${customer.contactPerson}: ${customer.businessName} currently has an open balance of $${customer.debtAmount.toLocaleString()} for your brush order. Please arrange payment via Check or Zelle at your earliest convenience!`;
    } else {
      text = `JKIOCEAN follow-up for ${customer.contactPerson}: How are your nail technicians liking the latest brushes? Let us know when you need refills on acrylic or art brushes!`;
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
        <p className="text-slate-600 font-semibold text-sm">Loading Customer 360° Profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || "Customer does not exist in the database."}</p>
        <Link
          href="/customers"
          className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#253c68] text-white text-sm font-semibold hover:bg-[#1a2c4e] transition btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
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
          <span>Back to Customers</span>
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
                  At Risk - Attention Needed
                </span>
              )}
              {customer.status === "INACTIVE" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  Inactive
                </span>
              )}
            </div>

            {/* Sub Info Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{customer.contactPerson}</span>
                <span className="text-xs text-slate-400">(Contact Person)</span>
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
                  Assigned Sales Rep: <strong>{formatSalesRep(customer.assignedSale)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Create Quote Link */}
            <Link
              href={`/quotes/create?customerId=${customer.id}`}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[#253c68] text-[#253c68] hover:bg-[#253c68]/5 font-bold text-sm btn-press transition"
            >
              <FileText className="w-4 h-4" />
              <span>Create New Quote</span>
            </Link>

            {/* Send Quo SMS */}
            <button
              onClick={() => {
                setSmsData({
                  type: "FOLLOW_UP",
                  content: `JKIOCEAN: Hi ${customer.contactPerson} (${customer.businessName})...`,
                });
                setIsSmsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 btn-press transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Quo SMS</span>
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm btn-press transition"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Customer Notes banner if available */}
        {customer.notes && (
          <div className="mt-5 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Customer Notes / Preferences:</strong> {customer.notes}
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lifetime Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Lifetime Revenue (LTV)</span>
            <DollarSign className="w-4 h-4 text-[#253c68]" />
          </div>
          <div className="text-2xl font-black text-[#253c68] mt-2">
            ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Paid to date: ${customer.totalPaid.toLocaleString()}</p>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{customer.orderCount} orders</div>
          <p className="text-xs text-slate-500 mt-1">
            Avg Order Value:{" "}
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
              AR Balance
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
            {customer.debtAmount > 0 ? "SMS payment reminder recommended" : "Zero outstanding balance"}
          </p>
        </div>

        {/* Health & Churn Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Account Health</span>
            <ShieldAlert className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black mt-2">
            {customer.status === "ACTIVE" ? (
              <span className="text-emerald-600">Stable</span>
            ) : customer.status === "AT_RISK" ? (
              <span className="text-rose-600">Churn Risk</span>
            ) : (
              <span className="text-slate-500">Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Last order: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString("en-US") : "No orders recorded"}
          </p>
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
            <span>Order History ({customer.orders?.length || 0})</span>
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
            <span>Quotes ({customer.quotes?.length || 0})</span>
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
            <span>Quo SMS Log ({customer.smsLogs?.length || 0})</span>
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
            <span>Purchasing Trends & Churn ({customer.churnSurveys?.length || 0})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Z-Brushes Order History</h3>
                <span className="text-xs text-slate-400">All orders fulfilled from Houston Hub</span>
              </div>

              {(!customer.orders || customer.orders.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No orders recorded for this salon yet.</p>
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
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
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
                              ? "PAID"
                              : order.paymentStatus === "PARTIAL"
                              ? "PARTIAL"
                              : "UNPAID"}
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
                            Products in order:
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
                                    {item.quantity} pcs x ${item.unitPrice}
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
                          Delivery Notes: {order.notes}
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
                <h3 className="text-base font-bold text-slate-800">Quotes List</h3>
                <Link
                  href={`/quotes/create?customerId=${customer.id}`}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#253c68] px-3.5 py-2 rounded-xl hover:bg-[#1a2c4e] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Quote</span>
                </Link>
              </div>

              {(!customer.quotes || customer.quotes.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No quotes created for this salon yet.</p>
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
                          Valid until:{" "}
                          <strong>
                            {new Date(quote.validUntil).toLocaleDateString("en-US")}
                          </strong>
                          {quote.notes && ` • Notes: ${quote.notes}`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-black text-slate-900">
                          ${quote.totalAmount.toLocaleString()}
                        </span>
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-[#253c68] hover:bg-slate-100 transition"
                          title="View quote details"
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
                  <h3 className="text-base font-bold text-slate-800">Direct Quo SMS Log</h3>
                  <p className="text-xs text-slate-500">
                    Houston Hub Hotline: <strong>+1 (713) 330-6165</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsSmsModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-sky-600 px-3.5 py-2 rounded-xl hover:bg-sky-700 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose New SMS</span>
                </button>
              </div>

              {/* SMS Timeline */}
              {(!customer.smsLogs || customer.smsLogs.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No SMS messages sent yet.</p>
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
                              To: {log.toPhone}
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
                            {new Date(log.createdAt).toLocaleString("en-US")}
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
                    Purchasing Trends & Churn Prevention
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record causes of decreased order volume and customer retention strategies
                  </p>
                </div>
                <button
                  onClick={() => setIsChurnModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl hover:bg-rose-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record New Churn Entry</span>
                </button>
              </div>

              {(!customer.churnSurveys || customer.churnSurveys.length === 0) ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 text-sm">Consistent ordering pattern!</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No abnormal volume drops detected in the past 3 months.
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
                            Survey Month: {survey.analysisMonth}
                          </span>
                          <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded text-xs">
                            {survey.dropPercent}% order volume
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Recorded by: <strong>{formatSalesRep(survey.saleRep)}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <strong>Primary Reason: </strong>
                        <span className="font-semibold text-rose-800">{survey.reason}</span>
                      </div>

                      {survey.saleNotes && (
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          <strong>Salon Feedback:</strong> {survey.saleNotes}
                        </div>
                      )}

                      {survey.actionPlan && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <strong>Retention Action Plan:</strong> {survey.actionPlan}
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

      {/* MODAL: EDIT CUSTOMER PROFILE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#253c68]">Edit Salon Profile</h3>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business / Salon Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.businessName}
                    onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number (+1)</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Birthday</label>
                  <input
                    type="date"
                    value={editFormData.birthday}
                    onChange={(e) => setEditFormData({ ...editFormData, birthday: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Tier</label>
                  <select
                    value={editFormData.tier}
                    onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] font-bold text-[#253c68]"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Sales Rep</label>
                  <select
                    value={editFormData.assignedSale}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedSale: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  >
                    <option value="johnny">Johnny Tran</option>
                    <option value="hanna">Hanna Nguyen</option>
                    <option value="alice">Alice Nguyen</option>
                    <option value="tan">Tan Ho</option>
                    <option value="kate">Kate</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Preferences</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND QUO SMS */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#253c68] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Send Quo SMS to {customer.contactPerson}</h3>
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
                  Select message template:
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
                    🎉 Z-Brushes Promotion
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
                    💬 Brush Experience Follow-up
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
                    💳 Payment / AR Reminder
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
                    🎂 Birthday Greeting
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsData.content}
                  onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Characters: {smsData.content.length}</span>
                  <span>Recipient: {customer.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSmsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-5 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Send Quo SMS Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

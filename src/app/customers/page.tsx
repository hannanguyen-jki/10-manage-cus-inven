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
} from "lucide-react";

interface CustomerItem {
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
  const [selectedSale, setSelectedSale] = useState<string>("ALL");
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

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTier !== "ALL") params.set("tier", selectedTier);
      if (selectedState !== "ALL") params.set("state", selectedState);
      if (selectedSale !== "ALL") params.set("assignedSale", selectedSale);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        setError(data.error || "Failed to load customer list");
      }
    } catch (err: any) {
      console.error("Fetch customers error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedTier, selectedState, selectedSale, selectedStatus]);

  // Debounced Search Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = customers.length;
    const vipCount = customers.filter((c) => c.tier === "VIP").length;
    const wholesaleCount = customers.filter((c) => c.tier === "WHOLESALE").length;
    const atRiskCount = customers.filter((c) => c.status === "AT_RISK").length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalDebt = customers.reduce((sum, c) => sum + (c.debtAmount || 0), 0);

    return { total, vipCount, wholesaleCount, atRiskCount, totalRevenue, totalDebt };
  }, [customers]);

  // Export CSV
  const exportCsv = () => {
    if (customers.length === 0) return;
    const headers = [
      "Customer ID",
      "Salon / Business Name",
      "Contact Person",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "ZIP Code",
      "Tier",
      "Status",
      "Assigned Sales Rep",
      "Total Orders",
      "Total Revenue",
      "AR Debt Amount",
    ];
    const rows = customers.map((c) => [
      c.id,
      `"${(c.businessName || "").replace(/"/g, '""')}"`,
      `"${(c.contactPerson || "").replace(/"/g, '""')}"`,
      c.phone,
      c.email || "",
      `"${(c.address || "").replace(/"/g, '""')}"`,
      c.city || "",
      c.state || "",
      c.zipCode || "",
      c.tier,
      c.status,
      c.assignedSale || "",
      c.orderCount || 0,
      c.totalSpent || 0,
      c.debtAmount || 0,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
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
      showToast("Please fill in Business Name, Contact Person, and Phone Number", "error");
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
        showToast("New B2B customer added successfully!");
        setIsAddModalOpen(false);
        setFormData({
          businessName: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          city: "Houston",
          state: "TX",
          zipCode: "",
          birthday: "",
          assignedSale: "johnny",
          tier: "STANDARD",
          status: "ACTIVE",
          notes: "",
        });
        fetchCustomers();
      } else {
        showToast(data.error || "Unable to add customer", "error");
      }
    } catch (err) {
      showToast("Failed to connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Quo SMS Modal
  const openSmsModal = (customer: CustomerItem) => {
    setSelectedCustomerForSms(customer);
    setSmsData({
      type: "FOLLOW_UP",
      content: `JKIOCEAN: Hi ${customer.contactPerson} (${customer.businessName}). This is ${customer.assignedSale} from our Houston Wholesale Hub...`,
    });
    setIsSmsModalOpen(true);
  };

  // Handle Send Quo SMS Submit
  const handleSendSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForSms || !smsData.content.trim()) {
      showToast("Please enter message content", "error");
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
        showToast(data.message || "Quo SMS sent successfully!");
        setIsSmsModalOpen(false);
      } else {
        showToast(data.error || "Failed to send SMS", "error");
      }
    } catch (err) {
      showToast("Failed to send SMS via phone carrier", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySmsTemplate = (type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP") => {
    if (!selectedCustomerForSms) return;
    const name = selectedCustomerForSms.contactPerson;
    const salon = selectedCustomerForSms.businessName;

    let text = "";
    if (type === "PROMOTION") {
      text = `JKIOCEAN: Hi ${name}, our fresh batch of Z-Kolinsky Master #14 and Ombre brushes just arrived at our Houston Hub! We reserved a VIP wholesale allocation for ${salon}. Let us know how many you need for express delivery!`;
    } else if (type === "BIRTHDAY") {
      text = `JKIOCEAN wishes ${name} (${salon}) a wonderful birthday filled with happiness, health, and continued business success!`;
    } else if (type === "AR_REMINDER") {
      const debt = selectedCustomerForSms.debtAmount > 0 ? `$${selectedCustomerForSms.debtAmount.toLocaleString()}` : "the outstanding";
      text = `JKIOCEAN friendly reminder for ${name}: ${salon} currently has an open balance of ${debt} for your brush supplies order. Please assist with payment via Zelle or Check at your earliest convenience. Thank you!`;
    } else {
      text = `JKIOCEAN follow-up for ${name} (${salon}): How are your nail technicians liking the latest batch of brushes? Let us know if you need any restocks or support!`;
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

  return (
    <div className="space-y-6">
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
              B2B CRM & Accounts
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Texas & Sunbelt Salons</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#253c68] mt-1 tracking-tight">
            B2B Customers & Salons
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage salon accounts, wholesale pricing tiers, order history & Quo SMS
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchCustomers()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 btn-press transition"
            title="Refresh customer data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 btn-press transition"
            title="Export filtered customers to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#253c68] text-white font-semibold hover:bg-[#1a2c4e] shadow-md shadow-[#253c68]/20 btn-press transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#253c68] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</p>
          <p className="text-xs text-slate-500 mt-1">Salons & Supply Stores</p>
        </div>

        {/* VIP Salons */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/70 shadow-sm card-hover bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-600">VIP Members</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-2">{metrics.vipCount}</p>
          <p className="text-xs text-amber-600/80 mt-1">High-volume chains & academies</p>
        </div>

        {/* Wholesale Customers */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200/70 shadow-sm card-hover bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-indigo-600">Wholesale Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-2">{metrics.wholesaleCount}</p>
          <p className="text-xs text-indigo-600/80 mt-1">Distributors & wholesale stores</p>
        </div>

        {/* At-Risk Salons */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-sm card-hover bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-600">At-Risk Accounts</span>
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
          <p className="text-xs text-rose-600/80 mt-1">Declining volume, call needed</p>
        </div>

        {/* Total Lifetime Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#253c68]/20 shadow-sm card-hover bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#253c68]">Cumulative Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#253c68] mt-2">
            ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Outstanding AR: <span className="font-semibold text-rose-600">${metrics.totalDebt.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search salon name, phone, city, or VIP tier..."
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
              <option value="ALL">All Tiers</option>
              <option value="VIP">⭐ VIP</option>
              <option value="WHOLESALE">🏢 Wholesale</option>
              <option value="STANDARD">📦 Standard</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">All States</option>
              <option value="TX">Texas (TX)</option>
              <option value="CA">California (CA)</option>
              <option value="FL">Florida (FL)</option>
              <option value="GA">Georgia (GA)</option>
              <option value="OK">Oklahoma (OK)</option>
            </select>
          </div>

          {/* Sales Rep Filter */}
          <div>
            <select
              value={selectedSale}
              onChange={(e) => setSelectedSale(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">All Sales Reps</option>
              <option value="admin">Admin</option>
              <option value="hanna">Hanna Nguyen</option>
              <option value="johnny">Johnny Tran</option>
              <option value="alice">Alice Nguyen</option>
              <option value="tan">Tan Ho</option>
              <option value="kate">Kate</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="AT_RISK">At Risk</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Customers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#253c68] animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Loading customer profiles...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchCustomers()}
              className="mt-3 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
            >
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-base text-slate-700">No customers match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new customer</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#253c68] text-white rounded-xl text-xs font-semibold hover:bg-[#1a2c4e] btn-press transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Salon / Business Name</th>
                  <th className="py-3.5 px-4">Contact Person & Phone</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Tier & Pricing</th>
                  <th className="py-3.5 px-4 text-right">Total Orders / Revenue</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Assigned Sales Rep</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Salon Name & Address */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-bold text-[#253c68] hover:underline flex items-center space-x-1.5"
                        >
                          <span className="text-base">{c.businessName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#253c68] group-hover:translate-x-0.5 transition" />
                        </Link>
                        <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[220px]">
                            {c.address ? `${c.address}, ` : ""}
                            {c.city}, {c.state} {c.zipCode || ""}
                          </span>
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{c.contactPerson}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center space-x-1 text-xs text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded-md font-mono"
                            title="Call phone"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </a>
                        </div>
                        {c.email && (
                          <div className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">
                            {c.email}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {c.state || "TX"}
                        </span>
                        <div className="text-xs text-slate-400 mt-0.5">{c.city || "Houston"}</div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-4 px-4 text-center">
                        {c.tier === "VIP" && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>VIP</span>
                          </span>
                        )}
                        {c.tier === "WHOLESALE" && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>WHOLESALE</span>
                          </span>
                        )}
                        {c.tier === "STANDARD" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            STANDARD
                          </span>
                        )}
                      </td>

                      {/* Total Spent & Orders */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold text-[#253c68] text-base">
                          ${c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.orderCount} orders
                        </div>
                        {c.debtAmount > 0 && (
                          <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            AR: ${c.debtAmount.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {c.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Active
                          </span>
                        )}
                        {c.status === "AT_RISK" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
                            At Risk
                          </span>
                        )}
                        {c.status === "INACTIVE" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Assigned Sales Rep */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700 bg-slate-100/80 px-2 py-1 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-[#253c68]"></span>
                          <span>{formatSalesRep(c.assignedSale)}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Send Quo SMS */}
                          <button
                            onClick={() => openSmsModal(c)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition"
                            title="Send Quo SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Customer 360 Link */}
                          <Link
                            href={`/customers/${c.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#253c68]/10 text-[#253c68] hover:bg-[#253c68] hover:text-white font-semibold text-xs transition"
                            title="View Customer 360° Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>360°</span>
                          </Link>
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

      {/* MODAL: Add Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#253c68]">Add Customer</h3>
                  <p className="text-xs text-slate-500">Create profile for nail salon or wholesale supply store</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Salon Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Business / Salon Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Venetian Nail Spa - Houston"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68]"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jennifer Tran"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +17135550192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68] font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@salon.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5015 Westheimer Rd, Ste 2200"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Houston"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* State & Zip */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                    >
                      <option value="TX">TX (Texas)</option>
                      <option value="CA">CA (California)</option>
                      <option value="FL">FL (Florida)</option>
                      <option value="GA">GA (Georgia)</option>
                      <option value="OK">OK (Oklahoma)</option>
                      <option value="LA">LA (Louisiana)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ZIP Code</label>
                    <input
                      type="text"
                      placeholder="77056"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                    />
                  </div>
                </div>

                {/* Tier & Sale Rep */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] font-semibold text-[#253c68]"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assigned Sales Rep
                  </label>
                  <select
                    value={formData.assignedSale}
                    onChange={(e) => setFormData({ ...formData, assignedSale: e.target.value })}
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

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Preferences</label>
                  <textarea
                    rows={2}
                    placeholder="Salon specialty, technician count, Z-Brushes order preferences..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md shadow-[#253c68]/20 btn-press disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Send Quo SMS */}
      {isSmsModalOpen && selectedCustomerForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#253c68] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Send Quo SMS</h3>
                  <p className="text-xs text-sky-200">
                    To: {selectedCustomerForSms.contactPerson} • {selectedCustomerForSms.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SMS Body */}
            <form onSubmit={handleSendSmsSubmit} className="p-5 space-y-4">
              {/* Sender Info Banner */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/80">
                <span className="font-medium">
                  Outbound Number: <strong className="text-[#253c68]">+1 (713) 330-6165</strong> (JKIOCEAN Houston)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  QUO CONNECTED
                </span>
              </div>

              {/* Quick Template Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Message Template (Quo Templates):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => applySmsTemplate("PROMOTION")}
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
                    onClick={() => applySmsTemplate("FOLLOW_UP")}
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
                    onClick={() => applySmsTemplate("AR_REMINDER")}
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
                    onClick={() => applySmsTemplate("BIRTHDAY")}
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

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsData.content}
                  onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68]"
                  placeholder="Enter message text..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>
                    Length: {smsData.content.length} characters (~{Math.ceil(smsData.content.length / 160)} SMS segment)
                  </span>
                  <span>Recipient: {selectedCustomerForSms.phone}</span>
                </div>
              </div>

              {/* Actions */}
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
                  className="flex items-center space-x-2 px-5 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md shadow-[#253c68]/20 btn-press disabled:opacity-50"
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Target,
  Sparkles,
  Search,
  Filter,
  Plus,
  Phone,
  PhoneCall,
  MessageSquare,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  Send,
  Zap,
} from "lucide-react";

interface LeadItem {
  id: string;
  salonName: string;
  ownerName: string | null;
  phone: string;
  city: string | null;
  state: string | null;
  address: string | null;
  googleReviewCount: number | null;
  rating: number | null;
  icpScore: number;
  personalizedHook: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "REJECTED";
  assignedSale: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState<string>("ALL");

  // Modals & Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedLeadForSms, setSelectedLeadForSms] = useState<LeadItem | null>(null);
  const [isConvertingId, setIsConvertingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Lead Form
  const [formData, setFormData] = useState({
    salonName: "",
    ownerName: "",
    phone: "",
    city: "Houston",
    state: "TX",
    address: "",
    googleReviewCount: 150,
    rating: 4.8,
    icpScore: 85,
    personalizedHook: "",
    status: "NEW",
    assignedSale: "johnny",
  });

  // SMS Form
  const [smsData, setSmsData] = useState({
    content: "",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedState !== "ALL") params.set("state", selectedState);
      if (minScoreFilter !== "ALL") params.set("minScore", minScoreFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
      } else {
        setError(data.error || "Failed to load Leads list");
      }
    } catch (err: any) {
      console.error("Fetch leads error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus, selectedState, minScoreFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const highIcp = leads.filter((l) => l.icpScore >= 80).length;
    const contacted = leads.filter((l) => l.status === "CONTACTED" || l.status === "QUALIFIED").length;
    const converted = leads.filter((l) => l.status === "CONVERTED").length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";

    return { total, highIcp, contacted, converted, conversionRate };
  }, [leads]);

  // Convert Lead to Customer (1-Click)
  const handleConvertToCustomer = async (lead: LeadItem) => {
    if (!confirm(`Are you sure you want to convert Salon "${lead.salonName}" into an active B2B Customer?`)) {
      return;
    }

    try {
      setIsConvertingId(lead.id);
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          action: "CONVERT_TO_CUSTOMER",
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || "Lead converted to active B2B customer!");
        fetchLeads();
        if (data.customerId) {
          setTimeout(() => {
            router.push(`/customers/${data.customerId}`);
          }, 1200);
        }
      } else {
        showToast(data.error || "Failed to convert lead", "error");
      }
    } catch (err) {
      showToast("Error converting lead", "error");
    } finally {
      setIsConvertingId(null);
    }
  };

  // Inline Status Change
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${newStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
        );
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Error updating status", "error");
    }
  };

  // Add Lead Submit
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.salonName || !formData.phone) {
      showToast("Please provide Salon Name and Phone Number", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast("New B2B Lead added successfully!");
        setIsAddModalOpen(false);
        setFormData({
          salonName: "",
          ownerName: "",
          phone: "",
          city: "Houston",
          state: "TX",
          address: "",
          googleReviewCount: 150,
          rating: 4.8,
          icpScore: 85,
          personalizedHook: "",
          status: "NEW",
          assignedSale: "johnny",
        });
        fetchLeads();
      } else {
        showToast(data.error || "Failed to add lead", "error");
      }
    } catch (err) {
      showToast("Server connection error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Hook Generator
  const generateAiHook = () => {
    const salon = formData.salonName || "Nail Salon";
    const city = formData.city || "Houston";
    const reviews = formData.googleReviewCount || 100;
    const rating = formData.rating || 4.8;

    const hook = `${salon} in ${city} with ${reviews} reviews and a ${rating}⭐ rating. Premium clientele and strong technician volume, ideal for introducing the Z-Kolinsky Master #14 and Ombre brush trial kit with a 30-day quality guarantee.`;
    setFormData((prev) => ({ ...prev, personalizedHook: hook }));
  };

  // Open SMS modal for Lead
  const openLeadSmsModal = (lead: LeadItem) => {
    setSelectedLeadForSms(lead);
    const content =
      lead.personalizedHook ||
      `JKIOCEAN: Hi ${lead.ownerName || "Salon Owner"} (${lead.salonName}). This is JKI Wholesale Hub Houston, presenting an exclusive trial package for our Kolinsky VIP brushes...`;
    setSmsData({ content });
    setIsSmsModalOpen(true);
  };

  // Send SMS to Lead
  const handleSendLeadSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForSms || !smsData.content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: selectedLeadForSms.phone,
          content: smsData.content,
          type: "PROMOTION",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Outbound Quo SMS sent successfully!");
        setIsSmsModalOpen(false);
        // Automatically switch status to CONTACTED
        handleStatusChange(selectedLeadForSms.id, "CONTACTED");
      } else {
        showToast(data.error || "Failed to send SMS", "error");
      }
    } catch (err) {
      showToast("Error sending message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>AI Lead Hunting & Prospecting</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">B2B Nail Salons Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#253c68] mt-1 tracking-tight">
            AI B2B Lead Generation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            High-potential nail salons & beauty supplies in Texas & California identified by AI
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchLeads()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 btn-press transition"
            title="Refresh lead list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#253c68] text-white font-semibold hover:bg-[#1a2c4e] shadow-md shadow-[#253c68]/20 btn-press transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#253c68] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</p>
          <p className="text-xs text-slate-500 mt-1">High-potential nail salons on radar</p>
        </div>

        {/* High ICP Score (>80) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm card-hover bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-700">High ICP Score (&gt;80)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2">{metrics.highIcp}</p>
          <p className="text-xs text-emerald-700/80 mt-1">Meets large salon & premium brush criteria</p>
        </div>

        {/* Contacted */}
        <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-sm card-hover bg-gradient-to-br from-white to-sky-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-sky-700">Contacted Leads</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-900 mt-2">{metrics.contacted}</p>
          <p className="text-xs text-sky-700/80 mt-1">Reached out via Call or Quo SMS</p>
        </div>

        {/* Converted to Customer */}
        <div className="bg-white p-5 rounded-2xl border border-[#253c68]/20 shadow-sm card-hover bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#253c68]">Converted to Customers</span>
            <div className="w-8 h-8 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className="text-2xl font-black text-[#253c68]">{metrics.converted}</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {metrics.conversionRate}% conversion rate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Official B2B customer accounts</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by salon name, owner, phone, city..."
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* ICP Score Filter */}
          <div>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="ALL">All ICP Scores</option>
              <option value="80">Top Tier (&gt;= 80 pts)</option>
              <option value="60">Medium (&gt;= 60 pts)</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#253c68] bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="ALL">All States</option>
              <option value="TX">Texas (TX)</option>
              <option value="CA">California (CA)</option>
              <option value="FL">Florida (FL)</option>
              <option value="GA">Georgia (GA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#253c68] animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Loading B2B Leads...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="mt-3 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-base text-slate-700">No leads match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Lead" to enter a new prospect</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Salon Name & Address</th>
                  <th className="py-3.5 px-4">Owner / Decision Maker</th>
                  <th className="py-3.5 px-4">Google Reviews</th>
                  <th className="py-3.5 px-4 text-center">ICP Score</th>
                  <th className="py-3.5 px-4 max-w-xs">Personalized Pitch / Hook</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Salon & Address */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-base">{lead.salonName}</div>
                        <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>
                            {lead.address ? `${lead.address}, ` : ""}
                            {lead.city}, {lead.state || "TX"}
                          </span>
                        </div>
                      </td>

                      {/* Owner & Phone */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {lead.ownerName || "Salon Owner"}
                        </div>
                        <div className="mt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center space-x-1 text-xs text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded font-mono font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Google Review */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60 inline-flex">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{lead.rating || 4.5}</span>
                          <span className="text-slate-400 font-normal">
                            ({lead.googleReviewCount || 0} reviews)
                          </span>
                        </div>
                      </td>

                      {/* ICP Score */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                            lead.icpScore >= 80
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : lead.icpScore >= 60
                              ? "bg-sky-100 text-sky-800 border border-sky-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          {lead.icpScore} / 100
                        </span>
                      </td>

                      {/* Personalized AI Hook */}
                      <td className="py-4 px-4 max-w-xs">
                        {lead.personalizedHook ? (
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 line-clamp-3 hover:line-clamp-none transition-all">
                            <span className="font-bold text-sky-700 mr-1">AI Pitch:</span>
                            {lead.personalizedHook}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No AI pitch generated yet</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4 text-center">
                        <select
                          value={lead.status}
                          disabled={lead.status === "CONVERTED"}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none transition ${
                            lead.status === "CONVERTED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 cursor-default"
                              : lead.status === "QUALIFIED"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : lead.status === "CONTACTED"
                              ? "bg-sky-100 text-sky-800 border-sky-200"
                              : lead.status === "NEW"
                              ? "bg-slate-100 text-slate-800 border-slate-200"
                              : "bg-rose-100 text-rose-800 border-rose-200"
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Send Quo SMS */}
                          <button
                            onClick={() => openLeadSmsModal(lead)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition"
                            title="Contact via Quo SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* 1-Click Convert to Customer */}
                          {lead.status === "CONVERTED" ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Customer</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConvertToCustomer(lead)}
                              disabled={isConvertingId === lead.id}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#253c68] text-white hover:bg-[#1a2c4e] text-xs font-bold shadow-sm shadow-[#253c68]/20 btn-press transition disabled:opacity-50"
                              title="Convert to Customer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{isConvertingId === lead.id ? "Converting..." : "Convert"}</span>
                            </button>
                          )}
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

      {/* MODAL: ADD NEW LEAD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#253c68]">Add New B2B Lead</h3>
                  <p className="text-xs text-slate-500">Prospect salon via Google Maps / Instagram discovery</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Salon Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Crystal Luxe Nail Lounge"
                    value={formData.salonName}
                    onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner / Decision Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Dang"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (+1) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +18325550711"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Katy"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  >
                    <option value="TX">Texas (TX)</option>
                    <option value="CA">California (CA)</option>
                    <option value="FL">Florida (FL)</option>
                    <option value="GA">Georgia (GA)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 24419 Katy Fwy"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* Reviews & Ratings */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Review Count</label>
                  <input
                    type="number"
                    value={formData.googleReviewCount}
                    onChange={(e) => setFormData({ ...formData, googleReviewCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating (Stars)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                {/* ICP Score */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Ideal Customer Profile (ICP) Score: <span className="text-[#253c68] font-black">{formData.icpScore}/100</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.icpScore}
                    onChange={(e) => setFormData({ ...formData, icpScore: Number(e.target.value) })}
                    className="w-full accent-[#253c68]"
                  />
                </div>

                {/* AI Hook */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Personalized Pitch / Hook</label>
                    <button
                      type="button"
                      onClick={generateAiHook}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      <span>Generate AI Pitch</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Opening pitch script or salon notes..."
                    value={formData.personalizedHook}
                    onChange={(e) => setFormData({ ...formData, personalizedHook: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Sales Rep</label>
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
              </div>

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
                  className="px-6 py-2 text-sm font-bold text-white bg-[#253c68] hover:bg-[#1a2c4e] rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND QUO SMS TO LEAD */}
      {isSmsModalOpen && selectedLeadForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#253c68] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Send Quo SMS Pitch</h3>
                  <p className="text-xs text-sky-200">{selectedLeadForSms.salonName} • {selectedLeadForSms.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendLeadSms} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message Content (Outbound line: +1 713-330-6165)
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsData.content}
                  onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#253c68]"
                  placeholder="Enter opening pitch text..."
                />
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
                  className="flex items-center space-x-2 px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md btn-press disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Send Quo SMS Pitch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

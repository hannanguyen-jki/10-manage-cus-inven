"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Warehouse,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  FileSpreadsheet,
  Edit3,
  Trash2,
  History,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

interface StockMovement {
  id: string;
  type: "INBOUND" | "OUTBOUND" | "ADJUSTMENT";
  quantity: number;
  referenceNo?: string | null;
  notes?: string | null;
  createdUser: string;
  createdAt: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  wholesalePrice: number;
  retailPrice?: number | null;
  currentStock: number;
  minStockAlert: number;
  location?: string | null;
  stockMovements?: StockMovement[];
  updatedAt: string;
  createdAt: string;
}

interface InventoryMetrics {
  totalSkus: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  houstonHubStock: number;
}

const DEFAULT_CATEGORIES = [
  "All Categories",
  "Acrylic Brushes",
  "Nail Nippers & Tools",
  "Gel & Lacquer",
  "Accessories & Supplies",
  "Z Brushes",
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalSkus: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0,
    houstonHubStock: 0,
  });
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [productMovements, setProductMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Form states for Add/Edit
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Acrylic Brushes");
  const [formWholesale, setFormWholesale] = useState("");
  const [formRetail, setFormRetail] = useState("");
  const [formStock, setFormStock] = useState("0");
  const [formMinAlert, setFormMinAlert] = useState("10");
  const [formLocation, setFormLocation] = useState("Houston Hub");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Form states for Movement
  const [movType, setMovType] = useState<"INBOUND" | "OUTBOUND" | "ADJUSTMENT">("INBOUND");
  const [movQuantity, setMovQuantity] = useState("10");
  const [movRefNo, setMovRefNo] = useState("");
  const [movNotes, setMovNotes] = useState("");
  const [submittingMovement, setSubmittingMovement] = useState(false);

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load inventory stock list");
      }
      setProducts(data.products || []);
      if (data.metrics) setMetrics(data.metrics);

      // Merge categories
      const dynamicCats = data.categories || [];
      const mergedCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...dynamicCats]));
      setCategories(mergedCats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error loading inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (
        selectedCategory !== "All Categories" &&
        selectedCategory !== "All" &&
        p.category !== selectedCategory
      ) {
        return false;
      }

      // Stock status filter
      const alertThreshold = p.minStockAlert || 10;
      if (stockStatus === "in-stock" && p.currentStock <= 0) return false;
      if (stockStatus === "low-stock" && (p.currentStock <= 0 || p.currentStock > alertThreshold)) return false;
      if (stockStatus === "out-of-stock" && p.currentStock > 0) return false;

      // Location filter
      if (selectedLocation !== "all" && !p.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchSku = p.sku.toLowerCase().includes(query);
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = p.category?.toLowerCase().includes(query);
        const matchLoc = p.location?.toLowerCase().includes(query);
        if (!matchSku && !matchName && !matchCat && !matchLoc) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, stockStatus, selectedLocation, search]);

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormSku("");
    setFormName("");
    setFormCategory("Acrylic Brushes");
    setFormWholesale("");
    setFormRetail("");
    setFormStock("0");
    setFormMinAlert("10");
    setFormLocation("Houston Hub");
    setFormDescription("");
    setFormImageUrl("");
    setIsAddEditOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category || "Acrylic Brushes");
    setFormWholesale(p.wholesalePrice.toString());
    setFormRetail(p.retailPrice !== null && p.retailPrice !== undefined ? p.retailPrice.toString() : "");
    setFormStock(p.currentStock.toString());
    setFormMinAlert(p.minStockAlert.toString());
    setFormLocation(p.location || "Houston Hub");
    setFormDescription(p.description || "");
    setFormImageUrl(p.imageUrl || "");
    setIsAddEditOpen(true);
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim() || !formWholesale) {
      alert("Please provide SKU, Product Name, and Wholesale Price");
      return;
    }

    try {
      setSubmittingProduct(true);
      const payload = {
        sku: formSku.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory.trim(),
        wholesalePrice: parseFloat(formWholesale),
        retailPrice: formRetail ? parseFloat(formRetail) : null,
        currentStock: parseInt(formStock, 10) || 0,
        minStockAlert: parseInt(formMinAlert, 10) || 10,
        location: formLocation.trim() || "Houston Hub",
        description: formDescription.trim() || null,
        imageUrl: formImageUrl.trim() || null,
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/inventory/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Operation failed");
      }

      setIsAddEditOpen(false);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Error saving product");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete product ${p.sku} - ${p.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/inventory/${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Error deleting product");
    }
  };

  // Export Inventory to CSV / Stock Sheet
  const handleExportInventoryCsv = () => {
    if (products.length === 0) return;
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Wholesale Price ($)",
      "Retail / MSRP ($)",
      "Current Stock",
      "Min Stock Alert",
      "Stock Value ($)",
      "Warehouse Location",
    ];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.category || "").replace(/"/g, '""')}"`,
      p.wholesalePrice.toFixed(2),
      p.retailPrice !== null && p.retailPrice !== undefined ? p.retailPrice.toFixed(2) : "",
      p.currentStock,
      p.minStockAlert,
      (p.currentStock * p.wholesalePrice).toFixed(2),
      `"${(p.location || "Houston Hub").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JKIOCEAN_Stock_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Quick Stock Adjust (+ / -) directly
  const handleQuickAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.currentStock + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, currentStock: newStock } : p))
    );
    try {
      await fetch("/api/inventory/stock-movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          type: delta > 0 ? "INBOUND" : "OUTBOUND",
          quantity: Math.abs(delta),
          referenceNo: `QUICK-${delta > 0 ? "IN" : "OUT"}`,
          notes: `Quick floor adjustment ${delta > 0 ? "+" : ""}${delta} units`,
        }),
      });
    } catch {
      // Background sync
    }
  };

  // Open Quick Movement Modal
  const openMovementModal = (p?: Product) => {
    setMovementProduct(p || products[0] || null);
    setMovType("INBOUND");
    setMovQuantity("10");
    setMovRefNo(p ? `PO-${p.sku}-${Date.now().toString().slice(-4)}` : "");
    setMovNotes("");
    setIsMovementOpen(true);
  };

  // Handle Submit Movement
  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementProduct) {
      alert("Please select a product");
      return;
    }
    const qty = parseInt(movQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be a positive integer");
      return;
    }

    try {
      setSubmittingMovement(true);
      const res = await fetch("/api/inventory/stock-movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: movementProduct.id,
          type: movType,
          quantity: qty,
          referenceNo: movRefNo.trim() || null,
          notes: movNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Warehouse stock movement transaction failed");
      }

      setIsMovementOpen(false);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Error processing warehouse stock movement");
    } finally {
      setSubmittingMovement(false);
    }
  };

  // Open Product History Modal
  const openHistoryModal = async (p: Product) => {
    setHistoryProduct(p);
    setIsHistoryOpen(true);
    setLoadingMovements(true);
    try {
      const res = await fetch(`/api/inventory/${p.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProductMovements(data.product.stockMovements || []);
      } else {
        setProductMovements([]);
      }
    } catch (err) {
      console.error(err);
      setProductMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#253c68]">
            <Package className="w-4 h-4 text-[#38bdf8]" />
            <span>Warehouse & Inventory Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Inventory & Warehouse Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track stock levels, wholesale pricing, reorder thresholds & warehouse movements at Houston Hub
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import Docx Button */}
          <Link
            href="/inventory/import"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#253c68] to-[#1e3054] hover:from-[#1a2c4e] hover:to-[#16243e] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#253c68]/20 transition-all card-hover btn-press border border-[#3a568c]/30"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#38bdf8]" />
            <span>Import from Word (.docx)</span>
          </Link>

          {/* Export Excel / Stock Sheet */}
          <button
            onClick={handleExportInventoryCsv}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all btn-press"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Stock Sheet</span>
          </button>

          {/* Quick Movement */}
          <button
            onClick={() => openMovementModal()}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press border border-slate-200"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>Stock Adjustment</span>
          </button>

          {/* Add Product */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          {/* Reload */}
          <button
            onClick={fetchInventory}
            title="Refresh inventory data"
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#253c68]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total SKUs"
          value={metrics.totalSkus.toLocaleString()}
          subtitle={`${metrics.inStockCount} active in stock`}
          icon={Package}
          color="navy"
        />

        <MetricCard
          title="Total Inventory Value"
          value={`$${metrics.totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Based on wholesale pricing"
          icon={DollarSign}
          color="emerald"
        />

        <MetricCard
          title="Low Stock Alerts"
          value={metrics.lowStockCount}
          subtitle="Stock ≤ minimum threshold"
          icon={AlertTriangle}
          color="amber"
          badge={metrics.lowStockCount > 0 ? "Reorder Required" : "Optimal"}
        />

        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockCount}
          subtitle={`${metrics.houstonHubStock.toLocaleString()} total units at Houston Hub`}
          icon={Warehouse}
          color="sky"
          badge={metrics.outOfStockCount > 0 ? "Replenish" : "Clear"}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-slate-200 px-6 pt-4 flex space-x-1 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-150 ${
                  isActive
                    ? "border-[#253c68] text-[#253c68] bg-slate-50/80 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {cat}
                {cat === "All Categories" ? ` (${products.length})` : ""}
              </button>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 md:p-6 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253c68]/30 focus:border-[#253c68] text-sm text-slate-900"
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

          {/* Status & Location filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status dropdown */}
            <select
              value={stockStatus}
              onChange={(e: any) => setStockStatus(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#253c68]/20"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock (&gt;0)</option>
              <option value="low-stock">Low Stock (≤ Alert Level)</option>
              <option value="out-of-stock">Out of Stock (=0)</option>
            </select>

            {/* Location dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#253c68]/20"
            >
              <option value="all">All Locations</option>
              <option value="Houston Hub">Houston Hub (TX)</option>
              <option value="Vietnam">Vietnam Hub</option>
            </select>

            <span className="text-xs text-slate-400 font-medium pl-2 hidden lg:inline">
              Showing <span className="font-bold text-slate-700">{filteredProducts.length}</span> products
            </span>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-16 text-center">Image</th>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Wholesale Price</th>
                <th className="py-3 px-4 text-right">Retail / MSRP</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Min Alert Level</th>
                <th className="py-3 px-4 text-right">Stock Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#253c68] mb-2" />
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const alertThreshold = p.minStockAlert || 10;
                  const isOut = p.currentStock <= 0;
                  const isLow = !isOut && p.currentStock <= alertThreshold;
                  const stockVal = p.currentStock * p.wholesalePrice;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4 text-center">
                        <div
                          className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative cursor-pointer group/img"
                          onClick={() => {
                            if (p.imageUrl) {
                              setZoomedImage({ url: p.imageUrl, title: `${p.sku} - ${p.name}` });
                            }
                          }}
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Product / SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-[#253c68]/40 group-hover:text-[#253c68] transition-colors">
                            {p.sku}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-1 mt-1">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {p.description}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Location: <span className="text-slate-600 font-medium">{p.location || "Houston Hub"}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      {/* Wholesale Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#253c68]">
                        ${p.wholesalePrice.toFixed(2)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {p.retailPrice !== null && p.retailPrice !== undefined
                          ? `$${p.retailPrice.toFixed(2)}`
                          : "—"}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => handleQuickAdjust(p, -5)}
                            title="Quick dispatch -5 units"
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 font-bold text-xs flex items-center justify-center transition shadow-xs"
                          >
                            -
                          </button>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isOut
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isLow
                                ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {p.currentStock.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleQuickAdjust(p, 10)}
                            title="Quick restock +10 units"
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 font-bold text-xs flex items-center justify-center transition shadow-xs"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                            Low Stock
                          </div>
                        )}
                        {isOut && (
                          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                            Out of Stock
                          </div>
                        )}
                      </td>

                      {/* Min Alert Level */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                        {p.minStockAlert}
                      </td>

                      {/* Stock Value */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        ${stockVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick In/Out */}
                          <button
                            onClick={() => openMovementModal(p)}
                            title="Stock Movement Adjustment"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </button>

                          {/* Movements history */}
                          <button
                            onClick={() => openHistoryModal(p)}
                            title="Stock Movement History"
                            className="p-1.5 text-slate-500 hover:text-[#253c68] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold">
                  {editingProduct ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProduct ? `Edit Product (${editingProduct.sku})` : "Add New Product"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Product identification, wholesale/retail pricing, and inventory management.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZB-001, NIP-14"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  >
                    <option value="Acrylic Brushes">Acrylic Brushes</option>
                    <option value="Nail Nippers & Tools">Nail Nippers & Tools</option>
                    <option value="Gel & Lacquer">Gel & Lacquer</option>
                    <option value="Accessories & Supplies">Accessories & Supplies</option>
                    <option value="Z Brushes">Z Brushes</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolinsky Ombre Acrylic Brush #8"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Wholesale Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Wholesale Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="18.50"
                      value={formWholesale}
                      onChange={(e) => setFormWholesale(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                    />
                  </div>
                </div>

                {/* Retail Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Retail / MSRP ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="25.00"
                      value={formRetail}
                      onChange={(e) => setFormRetail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                    />
                  </div>
                </div>

                {/* Current Stock */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {editingProduct ? "Current Stock Level" : "Initial Stock Quantity"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                  {editingProduct && (
                    <p className="text-[11px] text-amber-600 mt-1">
                      * Direct modifications will automatically record an inventory count adjustment (ADJUSTMENT).
                    </p>
                  )}
                </div>

                {/* Min Alert */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Min Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    placeholder="Houston Hub"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Image URL / File Path
                  </label>
                  <input
                    type="text"
                    placeholder="/uploads/products/image.png or web URL"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="100% pure Kolinsky sable hair, smooth blend, durable ferrule..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-6 py-2 bg-[#253c68] hover:bg-[#1a2c4e] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
                >
                  {submittingProduct && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST STOCK MOVEMENT */}
      {isMovementOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    movType === "INBOUND"
                      ? "bg-emerald-50 text-emerald-600"
                      : movType === "OUTBOUND"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-sky-50 text-sky-600"
                  }`}
                >
                  {movType === "INBOUND" ? (
                    <ArrowDownToLine className="w-5 h-5" />
                  ) : movType === "OUTBOUND" ? (
                    <ArrowUpFromLine className="w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Adjust Stock Movement
                  </h3>
                  <p className="text-xs text-slate-500">Record inventory inbound, outbound, or audit movements</p>
                </div>
              </div>
              <button
                onClick={() => setIsMovementOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMovType("INBOUND")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    movType === "INBOUND"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Stock Inbound (+)
                </button>
                <button
                  type="button"
                  onClick={() => setMovType("OUTBOUND")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    movType === "OUTBOUND"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Stock Outbound (-)
                </button>
                <button
                  type="button"
                  onClick={() => setMovType("ADJUSTMENT")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    movType === "ADJUSTMENT"
                      ? "bg-[#253c68] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Audit Count (±)
                </button>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Product
                </label>
                <select
                  value={movementProduct?.id || ""}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    setMovementProduct(found || null);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} (In stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current stock status */}
              {movementProduct && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Current Stock Level:</span>
                  <span className="font-mono font-bold text-base text-slate-800">
                    {movementProduct.currentStock.toLocaleString()} units
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity {movType === "INBOUND" ? "In" : movType === "OUTBOUND" ? "Out" : "Adjustment"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movQuantity}
                  onChange={(e) => setMovQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                />
              </div>

              {/* Reference No / Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason / Reference No (Purchase Order, Sale Order, Damage, Inventory Count Adjustment)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-001, SO-4819, DAMAGE-01, AUDIT-092"
                  value={movRefNo}
                  onChange={(e) => setMovRefNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Reason or transaction details..."
                  value={movNotes}
                  onChange={(e) => setMovNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsMovementOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMovement}
                  className={`px-6 py-2 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2 ${
                    movType === "INBOUND"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : movType === "OUTBOUND"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[#253c68] hover:bg-[#1a2c4e]"
                  }`}
                >
                  {submittingMovement && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Confirm Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRODUCT HISTORY & MOVEMENTS */}
      {isHistoryOpen && historyProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Stock Movement History: {historyProduct.sku}
                  </h3>
                  <p className="text-xs text-slate-500">{historyProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Product quick summary bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Current Stock</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{historyProduct.currentStock}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Wholesale Price</span>
                  <p className="text-xl font-black text-[#253c68] mt-0.5">${historyProduct.wholesalePrice}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Location</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{historyProduct.location || "Houston Hub"}</p>
                </div>
              </div>

              {/* Movements Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Movement Type</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3">Reference / Reason</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingMovements ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#253c68] mb-1" />
                          Loading stock movement history...
                        </td>
                      </tr>
                    ) : productMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No stock movement records found for this product.
                        </td>
                      </tr>
                    ) : (
                      productMovements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {new Date(m.createdAt).toLocaleString("en-US")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                m.type === "INBOUND"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : m.type === "OUTBOUND"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-sky-50 text-sky-700 border border-sky-200"
                              }`}
                            >
                              {m.type === "INBOUND"
                                ? "Inbound"
                                : m.type === "OUTBOUND"
                                ? "Outbound"
                                : "Adjustment"}
                            </span>
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              m.type === "INBOUND"
                                ? "text-emerald-600"
                                : m.type === "OUTBOUND"
                                ? "text-rose-600"
                                : "text-sky-600"
                            }`}
                          >
                            {m.type === "INBOUND" ? `+${m.quantity}` : m.type === "OUTBOUND" ? `-${m.quantity}` : `±${m.quantity}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {m.referenceNo || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {m.notes || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-medium">
                            {m.createdUser}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: IMAGE ZOOM */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800 truncate">{zoomedImage.title}</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-50 max-h-[70vh]">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

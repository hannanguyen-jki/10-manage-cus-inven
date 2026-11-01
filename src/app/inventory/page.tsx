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
  Eye,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
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
  "Tất cả",
  "Z Brushes",
  "Kềm cắt da",
  "Dụng cụ nail",
  "Phụ liệu",
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
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
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
  const [formCategory, setFormCategory] = useState("Z Brushes");
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
        throw new Error(data.error || "Không thể tải danh sách tồn kho");
      }
      setProducts(data.products || []);
      if (data.metrics) setMetrics(data.metrics);

      // Merge categories
      const dynamicCats = data.categories || [];
      const mergedCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...dynamicCats]));
      setCategories(mergedCats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi tải dữ liệu");
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
      if (selectedCategory !== "Tất cả" && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      const alert = p.minStockAlert || 10;
      if (stockStatus === "in-stock" && p.currentStock <= 0) return false;
      if (stockStatus === "low-stock" && (p.currentStock <= 0 || p.currentStock > alert)) return false;
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
    setFormCategory("Z Brushes");
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
    setFormCategory(p.category || "Z Brushes");
    setFormWholesale(p.wholesalePrice.toString());
    setFormRetail(p.retailPrice ? p.retailPrice.toString() : "");
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
      alert("Vui lòng điền đủ SKU, Tên sản phẩm và Giá sỉ");
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
        throw new Error(data.error || "Thao tác không thành công");
      }

      setIsAddEditOpen(false);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Lỗi lưu sản phẩm");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm ${p.sku} - ${p.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/inventory/${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể xóa sản phẩm");
      }
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa");
    }
  };

  // Export Inventory to CSV / Excel
  const handleExportInventoryCsv = () => {
    if (products.length === 0) return;
    const headers = ["Mã SKU", "Tên Sản Phẩm", "Danh Mục", "Giá Sỉ ($)", "Giá Lẻ ($)", "Tồn Kho", "Cảnh Báo Min", "Giá Trị Tồn ($)", "Vị Trí Kho"];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.wholesalePrice.toFixed(2),
      p.retailPrice ? p.retailPrice.toFixed(2) : "",
      p.currentStock,
      p.minStockAlert,
      (p.currentStock * p.wholesalePrice).toFixed(2),
      `"${(p.location || 'Houston Hub').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Ton_Kho_JKIOCEAN_${new Date().toISOString().slice(0, 10)}.csv`;
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
          notes: `Điều chỉnh nhanh ${delta > 0 ? "+" : ""}${delta} trực tiếp tại kho`,
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
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    const qty = parseInt(movQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Số lượng phải là số nguyên dương");
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
        throw new Error(data.error || "Giao dịch kho không thành công");
      }

      setIsMovementOpen(false);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || "Lỗi thực hiện xuất nhập kho");
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
            <span>Hệ Thống Quản Trị Tồn Kho</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Kho Hàng & Sản Phẩm JKIOCEAN
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tồn kho thời gian thực, xuất nhập kho và nhập hàng loạt từ tài liệu Word (.docx).
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
            <span>Import Word (.docx)</span>
          </Link>

          {/* Export Excel */}
          <button
            onClick={handleExportInventoryCsv}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all btn-press"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel Kiểm Kê</span>
          </button>

          {/* Quick Movement */}
          <button
            onClick={() => openMovementModal()}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press border border-slate-200"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>Nhập / Xuất Kho</span>
          </button>

          {/* Add Product */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm</span>
          </button>

          {/* Reload */}
          <button
            onClick={fetchInventory}
            title="Làm mới dữ liệu"
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#253c68]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng Mã SKU"
          value={metrics.totalSkus.toLocaleString()}
          subtitle={`${metrics.inStockCount} mã đang có hàng`}
          icon={Package}
          color="navy"
        />

        <MetricCard
          title="Giá Trị Tồn Kho"
          value={`$${metrics.totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle="Tính theo giá sỉ (Wholesale)"
          icon={DollarSign}
          color="emerald"
        />

        <MetricCard
          title="Cảnh Báo Sắp Hết"
          value={metrics.lowStockCount}
          subtitle={`Tồn kho ≤ mức cảnh báo`}
          icon={AlertTriangle}
          color="amber"
          badge={metrics.lowStockCount > 0 ? "Cần Đặt Thêm" : "An Toàn"}
        />

        <MetricCard
          title="Kho Houston Hub"
          value={metrics.houstonHubStock.toLocaleString()}
          subtitle="Tổng số lượng sản phẩm tại TX"
          icon={Warehouse}
          color="sky"
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
                {cat === "Tất cả" ? ` (${products.length})` : ""}
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
              placeholder="Tìm theo SKU, tên sản phẩm, danh mục, kho..."
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
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="in-stock">Còn Hàng (&gt;0)</option>
              <option value="low-stock">Cảnh Báo Sắp Hết (≤ Mức Min)</option>
              <option value="out-of-stock">Hết Hàng (=0)</option>
            </select>

            {/* Location dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#253c68]/20"
            >
              <option value="all">Tất Cả Vị Trí Kho</option>
              <option value="Houston Hub">Houston Hub (TX)</option>
              <option value="Vietnam">Vietnam Hub</option>
            </select>

            <span className="text-xs text-slate-400 font-medium pl-2 hidden lg:inline">
              Hiển thị <span className="font-bold text-slate-700">{filteredProducts.length}</span> sản phẩm
            </span>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-16 text-center">Hình Ảnh</th>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên Sản Phẩm</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4 text-right">Giá Sỉ (Wholesale)</th>
                <th className="py-3 px-4 text-right">Giá Lẻ (Retail)</th>
                <th className="py-3 px-4 text-center">Tồn Kho</th>
                <th className="py-3 px-4">Vị Trí</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#253c68] mb-2" />
                    Đang tải dữ liệu kho hàng...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const alertThreshold = p.minStockAlert || 10;
                  const isOut = p.currentStock <= 0;
                  const isLow = !isOut && p.currentStock <= alertThreshold;

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
                                // fallback if broken
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-bold text-xs text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:border-[#253c68]/40 group-hover:text-[#253c68] transition-colors">
                          {p.sku}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
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
                            title="Xuất nhanh 5 cây/sản phẩm"
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
                            title="Nhập thêm 10 cây/sản phẩm"
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 font-bold text-xs flex items-center justify-center transition shadow-xs"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                            Min: {p.minStockAlert}
                          </div>
                        )}
                        {isOut && (
                          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                            Hết hàng
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {p.location || "Houston Hub"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick In/Out */}
                          <button
                            onClick={() => openMovementModal(p)}
                            title="Nhập / Xuất kho nhanh"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </button>

                          {/* Movements history */}
                          <button
                            onClick={() => openHistoryModal(p)}
                            title="Lịch sử xuất nhập kho"
                            className="p-1.5 text-slate-500 hover:text-[#253c68] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            title="Xóa sản phẩm"
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
                    {editingProduct ? `Cập Nhật Sản Phẩm (${editingProduct.sku})` : "Thêm Sản Phẩm Mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thông tin định danh, giá thành và quản lý tồn kho tại kho hàng.
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
                    Mã SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: ZB-001, KEM-14"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Danh Mục <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  >
                    <option value="Z Brushes">Z Brushes</option>
                    <option value="Kềm cắt da">Kềm cắt da</option>
                    <option value="Dụng cụ nail">Dụng cụ nail</option>
                    <option value="Phụ liệu">Phụ liệu</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tên Sản Phẩm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cọ Ombre Z Brushes #8 Lông Chồn"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Wholesale Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giá Sỉ (Wholesale $) <span className="text-rose-500">*</span>
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
                    Giá Lẻ (Retail $)
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
                    {editingProduct ? "Tồn Kho Hiện Tại" : "Số Lượng Ban Đầu"}
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
                      * Thay đổi trực tiếp sẽ ghi nhận bản ghi kiểm kê cân kho (ADJUSTMENT).
                    </p>
                  )}
                </div>

                {/* Min Alert */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mức Cảnh Báo Sắp Hết (Min Alert)
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
                    Vị Trí Kho
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
                    Đường Dẫn Hình Ảnh (URL / Path)
                  </label>
                  <input
                    type="text"
                    placeholder="/uploads/products/image.png hoặc link URL"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mô Tả / Đặc Điểm Kỹ Thuật
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Chất liệu lông chồn tự nhiên Kolinsky, độ bung tốt..."
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
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-6 py-2 bg-[#253c68] hover:bg-[#1a2c4e] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
                >
                  {submittingProduct && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK INBOUND / OUTBOUND / ADJUSTMENT */}
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
                    {movType === "INBOUND"
                      ? "Nhập Kho (Inbound)"
                      : movType === "OUTBOUND"
                      ? "Xuất Kho (Outbound)"
                      : "Kiểm Kê Cân Kho (Adjustment)"}
                  </h3>
                  <p className="text-xs text-slate-500">Ghi nhận giao dịch tồn kho tức thì vào hệ thống</p>
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
                  Nhập Kho (+)
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
                  Xuất Kho (-)
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
                  Kiểm Kê (±)
                </button>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chọn Sản Phẩm
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
                      [{p.sku}] {p.name} (Hiện có: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current stock status */}
              {movementProduct && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Tồn kho hiện tại:</span>
                  <span className="font-mono font-bold text-base text-slate-800">
                    {movementProduct.currentStock.toLocaleString()} sp
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số Lượng {movType === "INBOUND" ? "Nhập" : movType === "OUTBOUND" ? "Xuất" : "Điều Chỉnh"}{" "}
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

              {/* Reference No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mã Tham Chiếu / Số Đơn (Reference No)
                </label>
                <input
                  type="text"
                  placeholder="VD: PO-2026-001, SO-4819, INV-092"
                  value={movRefNo}
                  onChange={(e) => setMovRefNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#253c68]/20 focus:border-[#253c68]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú lý do xuất nhập kho..."
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
                  Đóng
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
                  <span>Xác Nhận Thực Hiện</span>
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
                    Lịch Sử Xuất Nhập: {historyProduct.sku}
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
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Tồn kho hiện tại</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{historyProduct.currentStock}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Giá sỉ</span>
                  <p className="text-xl font-black text-[#253c68] mt-0.5">${historyProduct.wholesalePrice}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Vị trí</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{historyProduct.location || "Houston Hub"}</p>
                </div>
              </div>

              {/* Movements Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Thời Gian</th>
                      <th className="py-2.5 px-3">Loại Giao Dịch</th>
                      <th className="py-2.5 px-3 text-right">Số Lượng</th>
                      <th className="py-2.5 px-3">Số Tham Chiếu</th>
                      <th className="py-2.5 px-3">Ghi Chú</th>
                      <th className="py-2.5 px-3">Người Tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingMovements ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#253c68] mb-1" />
                          Đang tải lịch sử kho...
                        </td>
                      </tr>
                    ) : productMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Chưa có phát sinh giao dịch xuất nhập kho nào.
                        </td>
                      </tr>
                    ) : (
                      productMovements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {new Date(m.createdAt).toLocaleString("vi-VN")}
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
                                ? "Nhập Kho"
                                : m.type === "OUTBOUND"
                                ? "Xuất Kho"
                                : "Kiểm Kê"}
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
                Đóng
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

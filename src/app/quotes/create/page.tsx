"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  Truck,
  ShieldCheck,
  Check,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { QuoteCustomerData, ProductCatalogItem } from "@/lib/quotesData";

interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number; // %
}

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCustomerId = searchParams?.get("customerId");

  // Catalog data
  const [customers, setCustomers] = useState<QuoteCustomerData[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Product search state
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Quote Line Items
  const [items, setItems] = useState<LineItem[]>([]);

  // Quote Metadata
  const [quoteNumber, setQuoteNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [salesRep, setSalesRep] = useState("Johnny Tran");
  const [paymentTerms, setPaymentTerms] = useState("Net 15 (Zelle / Company Check)");
  const [notes, setNotes] = useState(
    "Free local delivery for wholesale orders in Greater Houston Hub. 30-day replacement warranty on Kolinsky bristles."
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize Quote Number and Default 14-day validity
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    setQuoteNumber(`QT-${yyyy}${mm}-${rand}`);
    setIssueDate(today.toISOString().split("T")[0]);

    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    setValidUntil(twoWeeksLater.toISOString().split("T")[0]);

    // Fetch customers and products
    fetch("/api/quotes/options")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers);
          setProducts(data.products);
          if (data.customers.length > 0) {
            if (paramCustomerId && data.customers.some((c: any) => c.id === paramCustomerId)) {
              setSelectedCustomerId(paramCustomerId);
            } else {
              setSelectedCustomerId(data.customers[0].id);
            }
          }
          // Seed with 2 initial popular items for quick builder UX
          if (data.products.length >= 2) {
            setItems([
              {
                productId: data.products[0].id,
                productName: data.products[0].name,
                sku: data.products[0].sku,
                imageUrl: data.products[0].imageUrl,
                category: data.products[0].category,
                quantity: 10,
                unitPrice: data.products[0].wholesalePrice,
                discount: 10,
              },
              {
                productId: data.products[1].id,
                productName: data.products[1].name,
                sku: data.products[1].sku,
                imageUrl: data.products[1].imageUrl,
                category: data.products[1].category,
                quantity: 5,
                unitPrice: data.products[1].wholesalePrice,
                discount: 10,
              },
            ]);
          }
        }
      })
      .catch((err) => console.error("Error loading options:", err))
      .finally(() => setLoadingOptions(false));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Add product to items table
  const handleAddProduct = (prod: ProductCatalogItem) => {
    const existingIndex = items.findIndex((it) => it.productId === prod.id);
    if (existingIndex >= 0) {
      // Increase qty
      const updated = [...items];
      updated[existingIndex].quantity += 5;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          imageUrl: prod.imageUrl,
          category: prod.category,
          quantity: 10,
          unitPrice: prod.wholesalePrice,
          discount: 10,
        },
      ]);
    }
  };

  // Update item field
  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Real-time calculations
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const totalDiscount = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice * (it.discount / 100),
    0
  );
  // Free local shipping for wholesale >= $500
  const isFreeShipping = subtotal >= 500;
  const shipping = isFreeShipping ? 0 : 25.0;
  const totalAmount = Math.max(0, subtotal - totalDiscount + shipping);

  // Filter products catalog
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch =
      productSearch.trim() === "" ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filter customers for dropdown search
  const filteredCustomers = customers.filter(
    (c) =>
      c.businessName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  // Save Quote Handler
  const handleSaveQuote = async (status: "DRAFT" | "SENT") => {
    setErrorMsg("");
    if (!selectedCustomerId) {
      setErrorMsg("Please select a B2B salon / wholesale customer");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Please add at least 1 product to the wholesale quotation");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          customerId: selectedCustomerId,
          customer: selectedCustomer,
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            sku: it.sku,
            imageUrl: it.imageUrl,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discount: Number(it.discount) || 0,
          })),
          validUntil: new Date(`${validUntil}T23:59:59.000Z`).toISOString(),
          notes,
          paymentTerms,
          status,
          createdUser: salesRep,
        }),
      });

      const data = await res.json();
      if (data.success && data.quote) {
        router.push(`/quotes/${data.quote.id}`);
      } else {
        setErrorMsg(data.error || "Failed to create quote. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving wholesale quotation");
    } finally {
      setSaving(false);
    }
  };

  const categories = ["ALL", "Z Brushes", "Art Brushes", "French Brushes", "Liner Brushes", "Gel Brushes", "Accessories"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/quotes"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Wholesale Quote</h1>
              <span className="font-mono text-xs bg-[#253c68] text-white font-extrabold px-2.5 py-0.5 rounded-full">
                {quoteNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft official JKIOCEAN wholesale price quotes with high-resolution images, automated volume discounts & PDF export
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveQuote("DRAFT")}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveQuote("SENT")}
            className="px-5 py-2 bg-gradient-to-r from-[#253c68] to-[#1e3054] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#253c68]/20 hover:scale-[1.01] transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Quote...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Official PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      {/* Main Grid: Left: Customer & Items; Right: Products Picker & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Customer Info + Items Table + Terms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Customer Selection</h3>
                  <p className="text-[11px] text-slate-400">Select customer salon from directory or search</p>
                </div>
              </div>
              {selectedCustomer?.tier && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                  {selectedCustomer.tier} PARTNER
                </span>
              )}
            </div>

            {/* Customer Dropdown with Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer / Salon:</label>
                <div className="relative">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} - {c.contactPerson} ({c.city}, {c.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiration Date:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Selected Customer Details Preview */}
            {selectedCustomer && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{selectedCustomer.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-700">
                    {selectedCustomer.address || "10606 Bellaire Blvd"}, {selectedCustomer.city || "Houston"},{" "}
                    {selectedCustomer.state || "TX"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Line Items</h3>
                <p className="text-[11px] text-slate-400">
                  Official products with high-resolution imagery automatically formatted for print
                </p>
              </div>
              <span className="text-xs font-bold text-[#253c68] bg-[#253c68]/10 px-2.5 py-1 rounded-lg">
                {items.length} items
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs font-semibold">No items added to quote yet</p>
                <p className="text-[11px] mt-1">Select products from the catalog on the right to add them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-2">Image</th>
                      <th className="py-2.5 px-2">Product & SKU</th>
                      <th className="py-2.5 px-2 text-center" style={{ width: "90px" }}>
                        Quantity
                      </th>
                      <th className="py-2.5 px-2 text-right" style={{ width: "100px" }}>
                        Unit Price
                      </th>
                      <th className="py-2.5 px-2 text-center" style={{ width: "95px" }}>
                        Discount %
                      </th>
                      <th className="py-2.5 px-2 text-right" style={{ width: "100px" }}>
                        Line Total
                      </th>
                      <th className="py-2.5 px-2 text-center" style={{ width: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item, idx) => {
                      const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition group">
                          {/* Image */}
                          <td className="py-3 px-2">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 shadow-xs">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Name & SKU */}
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-900 leading-tight">{item.productName}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.category}</span>
                            </div>
                          </td>

                          {/* Qty changer */}
                          <td className="py-3 px-2 text-center">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItem(idx, "quantity", Math.max(1, item.quantity - 1))
                                }
                                className="px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-10 text-center font-bold text-slate-800 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, "quantity", item.quantity + 1)}
                                className="px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Unit Price */}
                          <td className="py-3 px-2 text-right">
                            <div className="relative inline-block">
                              <span className="absolute left-2 top-1.5 text-slate-400">$</span>
                              <input
                                type="number"
                                step="0.5"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleUpdateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)
                                }
                                className="w-20 pl-5 pr-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-xs focus:bg-white focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Discount % */}
                          <td className="py-3 px-2 text-center">
                            <div className="relative inline-block">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                value={item.discount}
                                onChange={(e) =>
                                  handleUpdateItem(idx, "discount", Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)))
                                }
                                className="w-14 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-600 text-xs focus:bg-white focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400 ml-1">%</span>
                            </div>
                          </td>

                          {/* Line Total */}
                          <td className="py-3 px-2 text-right font-mono font-extrabold text-slate-900 text-sm">
                            ${lineTotal.toFixed(2)}
                          </td>

                          {/* Remove */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              title="Remove from quote"
                              className="text-slate-300 hover:text-rose-500 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes & Payment Terms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Special Notes / Terms</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms:</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition"
                >
                  <option value="Net 15 (Zelle / Company Check)">Net 15 (Zelle / Company Check)</option>
                  <option value="Net 30 (Approved Wholesale Account)">Net 30 (Approved Wholesale Account)</option>
                  <option value="Due upon receipt (Zelle prior to dispatch)">Due upon receipt (Zelle)</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                  <option value="Credit Card (Visa / Mastercard / Amex)">Credit Card (Visa / Mastercard / Amex)</option>
                  <option value="COD (Houston Local Hub)">COD (Houston Local Delivery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sales Representative:</label>
                <input
                  type="text"
                  value={salesRep}
                  onChange={(e) => setSalesRep(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Houston Hub Delivery Guarantee:</label>
                <div className="p-2 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Free local delivery in Greater Houston for orders over $500!</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Special Notes / Terms Printed on PDF:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#253c68]"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Product Selector & Live Total Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financial Calculation Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-slate-900 text-sm">Quote Details & Summary</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">USD CURRENCY</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Wholesale Discount:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>Shipping / Handling:</span>
                  {isFreeShipping && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.2 rounded">
                      FREE HOUSTON
                    </span>
                  )}
                </span>
                <span className={isFreeShipping ? "text-emerald-600 font-bold" : "font-bold text-slate-900"}>
                  {shipping === 0 ? "$0.00" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (Resale Exempt):</span>
                <span className="font-bold text-slate-900">$0.00</span>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-slate-800 uppercase block">Grand Total</span>
                  <span className="text-[10px] text-slate-400">Includes applied wholesale discounts</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#253c68] font-mono">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveQuote("SENT")}
                className="w-full py-3 bg-gradient-to-r from-[#253c68] to-[#1e3054] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#253c68]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official PDF</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveQuote("DRAFT")}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Product Quick Picker Catalog */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Add Product</h3>
                <span className="text-[10px] text-slate-400">{products.length} products</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Click (+) to add item directly to quote</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    selectedCategory === cat
                      ? "bg-[#253c68] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search SKU or brush name..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#253c68]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Product Item Cards */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const inQuote = items.find((it) => it.productId === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:border-[#253c68]/40 hover:bg-slate-50/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-[#253c68]">
                          {prod.name}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-mono font-bold text-slate-700">{prod.sku}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">${prod.wholesalePrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProduct(prod)}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 transition ${
                        inQuote
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 hover:bg-[#253c68] hover:text-white text-slate-700"
                      }`}
                      title="Add to quote"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {inQuote && <span className="text-[10px]">({inQuote.quantity})</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateQuotePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-semibold">Preparing quote builder...</div>}>
      <CreateQuoteContent />
    </Suspense>
  );
}

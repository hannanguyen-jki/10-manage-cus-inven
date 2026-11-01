"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Package,
  Layers,
  MapPin,
  Sparkles,
  ExternalLink,
  X,
  FileCheck,
  RotateCcw,
} from "lucide-react";

interface ParsedProductItem {
  id?: string;
  sku: string;
  name: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number | null;
  currentStock: number;
  minStockAlert: number;
  location: string;
  description: string | null;
  imageUrl: string | null;
}

export default function DocxImporterPage() {
  const router = useRouter();

  // Wizard Steps: 1 = Upload, 2 = Preview & Edit, 3 = Completed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<string | null>(null);

  // Extracted data state
  const [products, setProducts] = useState<ParsedProductItem[]>([]);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [activeImagePickerIndex, setActiveImagePickerIndex] = useState<number | null>(null);

  // Bulk Edit Bar
  const [bulkCategory, setBulkCategory] = useState("Acrylic Brushes");
  const [bulkLocation, setBulkLocation] = useState("Houston Hub");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    total: number;
    created: number;
    updated: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelected(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".docx")) {
      setUploadError("Only Microsoft Word (.docx) files are supported. Please try again.");
      return;
    }
    setFile(selectedFile);
    setUploadError(null);
    uploadAndParseFile(selectedFile);
  };

  // Upload and parse via API
  const uploadAndParseFile = async (fileToUpload: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccessAlert(null);

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/inventory/import-docx", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse document");
      }

      setProducts(data.products || []);
      setExtractedImages(data.extractedImages || []);
      setUploadSuccessAlert("File parsed successfully");
      setCurrentStep(2);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to parse document");
    } finally {
      setIsUploading(false);
    }
  };

  // Row edits
  const handleCellChange = (index: number, field: keyof ParsedProductItem, value: any) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    setProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add empty row
  const handleAddRow = () => {
    const newIdx = products.length + 1;
    setProducts((prev) => [
      ...prev,
      {
        sku: `JKI-NEW-${String(newIdx).padStart(3, "0")}`,
        name: "New Catalog Product",
        category: bulkCategory,
        wholesalePrice: 0,
        retailPrice: 0,
        currentStock: 0,
        minStockAlert: 10,
        location: bulkLocation,
        description: null,
        imageUrl: extractedImages[0] || null,
      },
    ]);
  };

  // Apply bulk category
  const applyBulkCategory = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        category: bulkCategory,
      }))
    );
  };

  // Apply bulk location
  const applyBulkLocation = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        location: bulkLocation,
      }))
    );
  };

  // Reset / Re-upload
  const handleResetReupload = () => {
    setFile(null);
    setProducts([]);
    setExtractedImages([]);
    setUploadError(null);
    setUploadSuccessAlert(null);
    setCurrentStep(1);
  };

  // Confirm and Save into Database
  const handleConfirmSave = async () => {
    if (products.length === 0) {
      alert("No products to save");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/inventory/bulk-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save products to database");
      }

      setSaveResult({
        total: data.totalProcessed || products.length,
        created: data.createdCount || 0,
        updated: data.updatedCount || 0,
      });

      setCurrentStep(3);
    } catch (err: any) {
      alert(err.message || "Error saving products to inventory");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Link
            href="/inventory"
            className="hover:text-[#253c68] font-semibold flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Import from Word (.docx)</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#253c68] via-[#1f3358] to-[#162541] rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-[#253c68]/15 border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI & OpenXML Smart Extraction Engine</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Bulk Import Products from Word (.docx)
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Upload official JKIOCEAN product catalog document to automatically parse SKUs, descriptions, pricing and images.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between max-w-xl text-xs">
          {/* Step 1 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep >= 1 ? "bg-[#38bdf8] text-[#1a2c4e]" : "bg-slate-700 text-slate-400"
              }`}
            >
              1
            </div>
            <span className={currentStep === 1 ? "font-bold text-white" : "text-slate-400"}>
              Upload .docx
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-700"></div>

          {/* Step 2 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep >= 2 ? "bg-[#38bdf8] text-[#1a2c4e]" : "bg-slate-700 text-slate-400"
              }`}
            >
              2
            </div>
            <span className={currentStep === 2 ? "font-bold text-white" : "text-slate-400"}>
              Extracted Products Preview ({products.length})
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-700"></div>

          {/* Step 3 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep === 3 ? "bg-emerald-400 text-emerald-950" : "bg-slate-700 text-slate-400"
              }`}
            >
              3
            </div>
            <span className={currentStep === 3 ? "font-bold text-white" : "text-slate-400"}>
              Save to Inventory
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD ZONE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-[#253c68] bg-[#253c68]/5 scale-[0.99]"
                : "border-slate-300 hover:border-[#253c68] hover:bg-slate-50/70"
            }`}
          >
            {isUploading ? (
              <div className="py-8 space-y-4">
                <RefreshCw className="w-12 h-12 text-[#253c68] animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Extracting OpenXML Content & Parsing Catalog...</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Scanning Word document structure, extracting product media, and mapping catalog tables...
                </p>
                <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#253c68] to-[#38bdf8] animate-pulse w-3/4 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#253c68] flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Drag & drop Word catalog file (.docx) here, or click to browse
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supported format: Microsoft Word (.docx) with embedded product tables & images
                  </p>
                </div>
                <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
                  <UploadCloud className="w-4 h-4 text-[#253c68]" />
                  <span>Maximum file size 50MB • Microsoft Word (.docx)</span>
                </div>
              </div>
            )}
          </div>

          {/* Upload error message */}
          {uploadError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Helper instructions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-bold text-slate-800">Automated Image Extraction</p>
                <p className="text-slate-500 mt-0.5">
                  High-res images are extracted directly from word/media/ and mapped to table rows.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-slate-800">Interactive Live Preview</p>
                <p className="text-slate-500 mt-0.5">
                  Review, edit pricing, update SKUs, or change images prior to saving to inventory.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-[#253c68]/10 text-[#253c68] flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-slate-800">Smart Merge & Sync</p>
                <p className="text-slate-500 mt-0.5">
                  Existing SKUs are updated with latest pricing and incremental stock quantities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: LIVE PREVIEW & EDIT TABLE */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Success banner if just parsed */}
          {uploadSuccessAlert && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{uploadSuccessAlert}</span>
                <span>— {products.length} products ready for preview</span>
              </div>
              <button
                onClick={() => setUploadSuccessAlert(null)}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Extracted Products Preview</h3>
                <p className="text-xs text-slate-500">
                  Total Extracted: <span className="text-[#253c68] font-black">{products.length}</span> products ({extractedImages.length} embedded images)
                </p>
              </div>
            </div>

            {/* Bulk actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk category */}
              <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600">Category:</span>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Acrylic Brushes">Acrylic Brushes</option>
                  <option value="Nail Nippers & Tools">Nail Nippers & Tools</option>
                  <option value="Gel & Lacquer">Gel & Lacquer</option>
                  <option value="Accessories & Supplies">Accessories & Supplies</option>
                  <option value="Z Brushes">Z Brushes</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={applyBulkCategory}
                  className="text-[10px] bg-[#253c68] text-white px-2 py-0.5 rounded font-bold hover:bg-[#1a2c4e]"
                >
                  Apply to All
                </button>
              </div>

              {/* Bulk location */}
              <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600">Location:</span>
                <select
                  value={bulkLocation}
                  onChange={(e) => setBulkLocation(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Houston Hub">Houston Hub</option>
                  <option value="Vietnam">Vietnam Hub</option>
                </select>
                <button
                  type="button"
                  onClick={applyBulkLocation}
                  className="text-[10px] bg-[#253c68] text-white px-2 py-0.5 rounded font-bold hover:bg-[#1a2c4e]"
                >
                  Apply to All
                </button>
              </div>

              {/* Add row */}
              <button
                onClick={handleAddRow}
                className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>

              {/* Reset / Re-upload */}
              <button
                onClick={handleResetReupload}
                className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset / Re-upload</span>
              </button>

              {/* Confirm Save Button */}
              <button
                onClick={handleConfirmSave}
                disabled={isSaving || products.length === 0}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all btn-press"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Save to Inventory ({products.length})</span>
              </button>
            </div>
          </div>

          {/* Interactive Editable Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3 w-16 text-center">Image</th>
                    <th className="py-3 px-3 w-32">SKU *</th>
                    <th className="py-3 px-3 min-w-[200px]">Product Name *</th>
                    <th className="py-3 px-3 w-36">Category</th>
                    <th className="py-3 px-3 w-28 text-right">Wholesale Price ($) *</th>
                    <th className="py-3 px-3 w-28 text-right">Retail / MSRP ($)</th>
                    <th className="py-3 px-3 w-24 text-center">Initial Stock</th>
                    <th className="py-3 px-3 w-28">Location</th>
                    <th className="py-3 px-2 w-10 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Index */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      {/* Image Thumbnail & Picker */}
                      <td className="py-2.5 px-3 text-center">
                        <div
                          onClick={() => setActiveImagePickerIndex(idx)}
                          title="Click to preview or change image"
                          className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center cursor-pointer hover:border-[#253c68] relative group"
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          )}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <span className="text-[9px] font-bold">Edit</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={p.sku}
                          onChange={(e) => handleCellChange(idx, "sku", e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68]"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleCellChange(idx, "name", e.target.value)}
                          className="w-full px-2 py-1 font-semibold text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68] focus:ring-1 focus:ring-[#253c68]"
                        />
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3">
                        <select
                          value={p.category}
                          onChange={(e) => handleCellChange(idx, "category", e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68]"
                        >
                          <option value="Acrylic Brushes">Acrylic Brushes</option>
                          <option value="Nail Nippers & Tools">Nail Nippers & Tools</option>
                          <option value="Gel & Lacquer">Gel & Lacquer</option>
                          <option value="Accessories & Supplies">Accessories & Supplies</option>
                          <option value="Z Brushes">Z Brushes</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>

                      {/* Wholesale Price */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={p.wholesalePrice}
                            onChange={(e) =>
                              handleCellChange(idx, "wholesalePrice", parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-5 pr-1 py-1 font-mono font-bold text-xs text-[#253c68] text-right bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68]"
                          />
                        </div>
                      </td>

                      {/* Retail Price */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={p.retailPrice !== null ? p.retailPrice : ""}
                            placeholder="0.00"
                            onChange={(e) =>
                              handleCellChange(
                                idx,
                                "retailPrice",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            className="w-full pl-5 pr-1 py-1 font-mono text-xs text-slate-600 text-right bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68]"
                          />
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={p.currentStock}
                          onChange={(e) =>
                            handleCellChange(idx, "currentStock", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 mx-auto px-1 py-1 font-mono font-bold text-xs text-center bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68]"
                        />
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={p.location}
                          onChange={(e) => handleCellChange(idx, "location", e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#253c68]"
                        />
                      </td>

                      {/* Remove */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          title="Remove this product row"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED SUCCESS VIEW */}
      {currentStep === 3 && saveResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              All products saved to database
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Catalog items and product images have been successfully imported into the JKIOCEAN inventory system.
            </p>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Total Processed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{saveResult.total}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Created New</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">+{saveResult.created}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Updated Existing</span>
              <p className="text-2xl font-black text-[#253c68] mt-1">{saveResult.updated}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/inventory"
              className="w-full sm:w-auto px-6 py-3 bg-[#253c68] hover:bg-[#1a2c4e] text-white font-bold rounded-xl text-sm shadow-md transition-all card-hover"
            >
              Back to Inventory Management
            </Link>
            <button
              onClick={() => {
                setFile(null);
                setProducts([]);
                setExtractedImages([]);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
            >
              Import Another Document
            </button>
          </div>
        </div>
      )}

      {/* IMAGE PICKER MODAL */}
      {activeImagePickerIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Select Image for Product: {products[activeImagePickerIndex]?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Select an extracted image from the Word document media pool
                </p>
              </div>
              <button
                onClick={() => setActiveImagePickerIndex(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {extractedImages.map((imgUrl, i) => {
                  const isSelected = products[activeImagePickerIndex]?.imageUrl === imgUrl;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        handleCellChange(activeImagePickerIndex, "imageUrl", imgUrl);
                        setActiveImagePickerIndex(null);
                      }}
                      className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 p-1 relative ${
                        isSelected
                          ? "border-[#253c68] ring-2 ring-[#253c68]/30 bg-blue-50"
                          : "border-slate-200 hover:border-slate-400 bg-slate-50"
                      }`}
                    >
                      <img src={imgUrl} alt={`Extracted ${i}`} className="w-full h-full object-cover rounded-lg" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#253c68] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {extractedImages.length === 0 && (
                <p className="text-center py-8 text-xs text-slate-400">
                  No images were found in the Word document.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  handleCellChange(activeImagePickerIndex, "imageUrl", null);
                  setActiveImagePickerIndex(null);
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Remove image from this product
              </button>
              <button
                onClick={() => setActiveImagePickerIndex(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

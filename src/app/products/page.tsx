"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Plus,
  Search,
  X,
  ImagePlus,
  Loader2,
  Save,
  Pencil,
  Trash2,
  Tag,
  AlertCircle,
  FolderPlus,
  Upload,
  PackageSearch,
} from "lucide-react";
import { EmptyState, Modal, PageHeader, Skeleton, cn, prettyCategory, useToast } from "@/components/ui";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  wholesalePrice: number;
  imageUrl: string | null;
}

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Resize a picked image in the browser and return a compact WebP data URL. */
async function fileToDataUrl(file: File, max = 800): Promise<string> {
  const src = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [noPriceOnly, setNoPriceOnly] = useState(false);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setCategories(data.categories);
      }
    } catch {
      toast.show("Could not load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    products.forEach((p) => (m[p.category] = (m[p.category] || 0) + 1));
    return m;
  }, [products]);
  const noPriceCount = useMemo(() => products.filter((p) => !p.wholesalePrice).length, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "ALL" || p.category === category) &&
        (!noPriceOnly || !p.wholesalePrice) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [products, category, search, noPriceOnly]);

  // Group in catalog order
  const groups = useMemo(() => {
    const order = categories.filter((c) => visible.some((p) => p.category === c));
    return order.map((c) => ({ category: c, items: visible.filter((p) => p.category === c) }));
  }, [visible, categories]);

  const onSaved = (saved: Product, isNew: boolean) => {
    setProducts((prev) => (isNew ? [...prev, saved] : prev.map((p) => (p.id === saved.id ? saved : p))));
    if (!categories.includes(saved.category)) setCategories((c) => [...c, saved.category]);
    toast.show(isNew ? "Product added" : "Changes saved");
  };

  return (
    <div className="space-y-6">
      {toast.node}
      <PageHeader
        icon={Package}
        title="Products"
        subtitle="Prices and photos for quotes, grouped like the Word price list"
        actions={
          <button onClick={() => setEditing("new")} className="btn-primary">
            <Plus className="w-4 h-4" /> Add product
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-start">
        {/* Categories */}
        <aside className="card p-3 lg:sticky lg:top-2 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
          <p className="px-2 pt-1 pb-2 text-xs font-semibold text-ink-400 hidden lg:block">Categories · {categories.length}</p>
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {[{ key: "ALL", label: "All products", n: products.length }, ...categories.map((c) => ({ key: c, label: prettyCategory(c), n: counts[c] || 0 }))].map(
              (c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-left whitespace-nowrap lg:whitespace-normal transition-all",
                    category === c.key ? "bg-ink-900 text-white shadow-soft" : "text-ink-600 hover:bg-ink-50"
                  )}
                >
                  <span className="truncate">{c.label}</span>
                  <span className={cn("shrink-0 rounded-full px-1.5 text-xs", category === c.key ? "bg-white/20" : "bg-ink-100 text-ink-500")}>{c.n}</span>
                </button>
              )
            )}
          </div>
        </aside>

        <div className="space-y-4 min-w-0">
          {/* Toolbar */}
          <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or code..." className="input pl-11 pr-10" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {noPriceCount > 0 && (
              <button onClick={() => setNoPriceOnly((v) => !v)} className={cn("chip", noPriceOnly ? "chip-on" : "chip-off")}>
                <AlertCircle className="w-3.5 h-3.5" /> No price
                <span className={cn("rounded-full px-1.5", noPriceOnly ? "bg-white/20" : "bg-amber-100 text-amber-700")}>{noPriceCount}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="card">
              <EmptyState icon={PackageSearch} title="No products found" hint="Try another search or category." />
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.category}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="rounded-xl bg-brand-700 text-white px-3 py-1.5 text-xs font-bold tracking-wide uppercase">{g.category}</h2>
                  <span className="text-xs text-ink-400">{g.items.length} items</span>
                  <div className="flex-1 h-px bg-ink-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                  {g.items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEditing(p)}
                      className="group text-left rounded-2xl border border-ink-100 bg-white p-2 transition-all hover:-translate-y-0.5 hover:shadow-lift hover:border-brand-200"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-50">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" loading="lazy" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-300">
                            <ImagePlus className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute right-1.5 top-1.5 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-ink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-4 h-4" />
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink-800 line-clamp-2 leading-snug min-h-[2.5rem]">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-ink-400">{p.sku}</span>
                        {p.wholesalePrice ? (
                          <span className="text-sm font-bold text-brand-600">{money(p.wholesalePrice)}</span>
                        ) : (
                          <span className="rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 text-[11px] font-semibold">No price</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <ProductModal
        product={editing}
        categories={categories}
        defaultCategory={category !== "ALL" ? category : categories[0]}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
        onError={(m) => toast.show(m, "error")}
      />
    </div>
  );
}

function ProductModal({
  product,
  categories,
  defaultCategory,
  onClose,
  onSaved,
  onError,
}: {
  product: Product | "new" | null;
  categories: string[];
  defaultCategory?: string;
  onClose: () => void;
  onSaved: (p: Product, isNew: boolean) => void;
  onError: (msg: string) => void;
}) {
  const isNew = product === "new";
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product) return;
    if (product === "new") {
      setName("");
      setPrice("");
      setCategory(defaultCategory || "");
      setImage(null);
    } else {
      setName(product.name);
      setPrice(product.wholesalePrice ? String(product.wholesalePrice) : "");
      setCategory(product.category);
      setImage(product.imageUrl);
    }
    setNewCategory("");
    setAddingCategory(false);
    setImageChanged(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const pickFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("Please choose an image file");
    try {
      setImage(await fileToDataUrl(file));
      setImageChanged(true);
    } catch {
      onError("Could not read this image");
    }
  };

  const save = async () => {
    const finalCategory = (addingCategory ? newCategory : category).trim();
    if (!name.trim()) return onError("Enter a product name");
    if (!finalCategory) return onError("Choose a category");
    const priceNum = price.trim() === "" ? 0 : Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return onError("Price must be a number");

    setBusy(true);
    try {
      const body: Record<string, any> = { name: name.trim(), category: finalCategory, wholesalePrice: priceNum };
      if (isNew || imageChanged) body.imageUrl = image;
      const res = await fetch(isNew ? "/api/products" : `/api/products/${(product as Product).id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) return onError(data.error || "Could not save");
      const p = data.product;
      onSaved(
        { id: p.id, sku: p.sku, name: p.name, category: p.category, wholesalePrice: Number(p.wholesalePrice) || 0, imageUrl: p.imageUrl ?? null },
        isNew
      );
      onClose();
    } catch {
      onError("Connection error, please try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      size="lg"
      icon={isNew ? Plus : Pencil}
      title={isNew ? "Add product" : "Edit product"}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={save} disabled={busy} className="btn-primary">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
        {/* Image */}
        <div>
          <p className="label">Photo</p>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center transition-all",
              dragOver ? "border-brand-400 bg-brand-50" : "border-ink-200 bg-ink-50 hover:border-brand-300"
            )}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-ink-400 px-4">
                <Upload className="w-8 h-8 mx-auto" />
                <p className="mt-2 text-sm font-medium">Click or drop a photo</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost flex-1 !py-2 !text-xs">
              <ImagePlus className="w-4 h-4" /> {image ? "Change" : "Upload"}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageChanged(true);
                }}
                className="icon-btn hover:!text-rose-600 hover:!bg-rose-50"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {!isNew && (
            <p className="text-xs text-ink-400">
              Code <span className="font-mono font-semibold text-ink-600">{(product as Product)?.sku}</span>
            </p>
          )}
          <div>
            <label className="label">Product name *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nail Art Palette Heart Blue" />
          </div>
          <div>
            <label className="label">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">$</span>
              <input
                className="input pl-8 text-lg font-semibold"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Category *</label>
              <button type="button" onClick={() => setAddingCategory((v) => !v)} className="text-xs font-semibold text-brand-600 hover:text-brand-700 mb-1.5 inline-flex items-center gap-1">
                {addingCategory ? (
                  <>
                    <Tag className="w-3.5 h-3.5" /> Pick existing
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-3.5 h-3.5" /> New category
                  </>
                )}
              </button>
            </div>
            {addingCategory ? (
              <input className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" autoFocus />
            ) : (
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

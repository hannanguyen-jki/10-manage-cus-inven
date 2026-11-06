import { prisma } from "@/lib/prisma";
import catalog from "../../data/catalog.json";

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  wholesalePrice: number;
  imageUrl: string | null;
  sortOrder: number;
  updatedAt?: string;
}

// In-memory fallback (no database), shared across API routes
const g = globalThis as unknown as { __jkiProducts?: ProductRow[] };
function memStore(): ProductRow[] {
  if (!g.__jkiProducts) {
    g.__jkiProducts = (catalog as any).products.map((p: any) => ({
      id: `prod-${p.sku}`,
      sku: p.sku,
      name: p.name,
      category: p.category,
      wholesalePrice: Number(p.wholesalePrice) || 0,
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    }));
  }
  return g.__jkiProducts!;
}

const useDb = () => !!process.env.DATABASE_URL;

export async function listProducts(): Promise<ProductRow[]> {
  if (useDb()) {
    try {
      const rows = await prisma.product.findMany({
        select: { id: true, sku: true, name: true, category: true, wholesalePrice: true, imageUrl: true, sortOrder: true, updatedAt: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (rows.length > 0) return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
    } catch {
      // fall back to memory
    }
  }
  return [...memStore()].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Categories in catalog order (order of first appearance). */
export function orderedCategories(products: ProductRow[]): string[] {
  const seen: string[] = [];
  for (const p of products) if (!seen.includes(p.category)) seen.push(p.category);
  return seen;
}

function codeFor(category: string, products: ProductRow[]): string {
  const inCat = products.find((p) => p.category === category && /^[A-Z0-9]+-\d+$/.test(p.sku));
  if (inCat) return inCat.sku.split("-")[0];
  const words = category.toUpperCase().match(/[A-Z0-9]+/g) || ["NEW"];
  let code = words.length >= 2 ? words.slice(0, 3).map((w) => w[0]).join("") : words[0].slice(0, 3);
  const used = new Set(products.map((p) => p.sku.split("-")[0]));
  let n = 2;
  const base = code;
  while (used.has(code)) code = `${base}${n++}`;
  return code;
}

function nextSku(category: string, products: ProductRow[]): string {
  const code = codeFor(category, products);
  const max = products
    .filter((p) => p.sku.startsWith(`${code}-`))
    .reduce((m, p) => Math.max(m, parseInt(p.sku.split("-")[1]) || 0), 0);
  return `${code}-${String(max + 1).padStart(3, "0")}`;
}

/**
 * New products go to the end of their category: they share the last item's sortOrder and,
 * being created later, sort after it. A new category goes after all existing ones.
 */
function nextSortOrder(category: string, products: ProductRow[]): number {
  const inCat = products.filter((p) => p.category === category);
  if (inCat.length > 0) return Math.max(...inCat.map((p) => p.sortOrder));
  return Math.max(0, ...products.filter((p) => p.sortOrder < 100000).map((p) => p.sortOrder)) + 1;
}

export async function createProduct(input: { name: string; category: string; wholesalePrice: number; imageUrl: string | null }) {
  const all = await listProducts();
  const sku = nextSku(input.category, all);
  const sortOrder = nextSortOrder(input.category, all);
  const data = { ...input, sku, sortOrder };

  if (useDb()) {
    try {
      const created = await prisma.product.create({ data });
      return created;
    } catch (err) {
      console.error("[createProduct]", err);
      throw err;
    }
  }
  const row: ProductRow = { id: `prod-${sku}`, ...data };
  memStore().push(row);
  return row;
}

export async function updateProduct(id: string, patch: Partial<Pick<ProductRow, "name" | "category" | "wholesalePrice" | "imageUrl">>) {
  if (useDb()) {
    return prisma.product.update({ where: { id }, data: patch });
  }
  const row = memStore().find((p) => p.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  return row;
}

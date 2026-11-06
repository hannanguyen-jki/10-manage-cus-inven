import { prisma } from "@/lib/prisma";
import rawCustomers from "../../data/customers_extracted.json";
import rawCatalog from "../../data/catalog.json";

export interface QuoteItemData {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage e.g. 10 = 10%
  lineTotal: number;
}

export interface QuoteCustomerData {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  tier?: string;
}

export interface QuoteData {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: QuoteCustomerData;
  totalAmount: number;
  subtotal: number;
  totalDiscount: number;
  shipping: number;
  validUntil: string;
  createdAt: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  notes?: string | null;
  paymentTerms?: string;
  createdUser: string;
  items: QuoteItemData[];
}

export interface ProductCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  wholesalePrice: number;
  retailPrice: number;
  currentStock: number;
  location: string;
}

// 32 Authentic B2B Customers from CUSTOMER FOR SALE.xlsx
export const SAMPLE_CUSTOMERS: QuoteCustomerData[] = (rawCustomers as any[]).map((c) => ({
  id: c.id,
  businessName: c.businessName,
  contactPerson: c.contactPerson,
  phone: c.phone,
  email: c.email || null,
  address: c.address || null,
  city: c.city || null,
  state: c.state || null,
  zipCode: c.zipCode || null,
  tier: c.tier || "STANDARD",
}));

// Product catalog extracted from the Word price list (data/catalog.json); used when no database
export const SAMPLE_PRODUCTS: ProductCatalogItem[] = (rawCatalog as any).products.map((p: any) => ({
  id: `prod-${p.sku}`,
  sku: p.sku,
  name: p.name,
  category: p.category || "General",
  description: "",
  imageUrl: p.imageUrl || "",
  wholesalePrice: Number(p.wholesalePrice || 0),
  retailPrice: 0,
  currentStock: 0,
  location: "",
}));

// In-Memory store for quotes created by users (no test quotes)
// Kept on globalThis so every API route shares the same list (route modules are loaded separately in dev)
const quotesGlobal = globalThis as unknown as { __jkiQuotesStore?: QuoteData[] };
const quotesStore: QuoteData[] = (quotesGlobal.__jkiQuotesStore ??= []);

// Helper: Query quotes from Prisma or fallback to Memory Store
export async function getQuotesList(search?: string, status?: string) {
  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }
      if (search && search.trim() !== "") {
        const q = search.trim();
        where.OR = [
          { quoteNumber: { contains: q, mode: "insensitive" } },
          { customer: { businessName: { contains: q, mode: "insensitive" } } },
          { customer: { contactPerson: { contains: q, mode: "insensitive" } } },
          { customer: { phone: { contains: q, mode: "insensitive" } } },
        ];
      }

      const dbQuotes = await prisma.quote.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbQuotes && dbQuotes.length > 0) {
        return dbQuotes.map((q) => {
          const items: QuoteItemData[] = q.items.map((it) => {
            const lTot = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
            return {
              id: it.id,
              productId: it.productId,
              productName: it.product?.name || "Product",
              sku: it.product?.sku || "SKU",
              imageUrl: it.product?.imageUrl || undefined,
              category: it.product?.category,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
              lineTotal: Number(lTot.toFixed(2)),
            };
          });

          const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
          const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);

          return {
            id: q.id,
            quoteNumber: q.quoteNumber,
            customerId: q.customerId,
            customer: {
              id: q.customer.id,
              businessName: q.customer.businessName,
              contactPerson: q.customer.contactPerson,
              phone: q.customer.phone,
              email: q.customer.email,
              address: q.customer.address,
              city: q.customer.city,
              state: q.customer.state,
              zipCode: q.customer.zipCode,
              tier: q.customer.tier,
            },
            totalAmount: q.totalAmount,
            subtotal: Number(subtotal.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2)),
            shipping: 0,
            validUntil: q.validUntil.toISOString(),
            createdAt: q.createdAt.toISOString(),
            status: q.status as QuoteData["status"],
            notes: q.notes,
            paymentTerms: "Zelle / Check / Wire Transfer",
            createdUser: q.createdUser,
            items,
          };
        });
      }
    } catch (err) {
      // Database connection not ready, proceed to memory store
    }
  }

  // Memory store fallback
  let list = [...quotesStore];
  if (status && status !== "ALL") {
    list = list.filter((q) => q.status.toUpperCase() === status.toUpperCase());
  }
  if (search && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (it) =>
        it.quoteNumber.toLowerCase().includes(q) ||
        it.customer.businessName.toLowerCase().includes(q) ||
        it.customer.contactPerson.toLowerCase().includes(q) ||
        it.customer.phone.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper: Get quote by ID or quoteNumber
export async function getQuoteDetail(idOrNumber: string): Promise<QuoteData | null> {
  if (process.env.DATABASE_URL) {
    try {
      const q = await prisma.quote.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { quoteNumber: idOrNumber }],
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (q) {
        const items: QuoteItemData[] = q.items.map((it) => {
          const lTot = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
          return {
            id: it.id,
            productId: it.productId,
            productName: it.product?.name || "Product",
            sku: it.product?.sku || "SKU",
            imageUrl: it.product?.imageUrl || undefined,
            category: it.product?.category,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount,
            lineTotal: Number(lTot.toFixed(2)),
          };
        });

        const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
        const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);

        return {
          id: q.id,
          quoteNumber: q.quoteNumber,
          customerId: q.customerId,
          customer: {
            id: q.customer.id,
            businessName: q.customer.businessName,
            contactPerson: q.customer.contactPerson,
            phone: q.customer.phone,
            email: q.customer.email,
            address: q.customer.address,
            city: q.customer.city,
            state: q.customer.state,
            zipCode: q.customer.zipCode,
            tier: q.customer.tier,
          },
          totalAmount: q.totalAmount,
          subtotal: Number(subtotal.toFixed(2)),
          totalDiscount: Number(totalDiscount.toFixed(2)),
          shipping: 0,
          validUntil: q.validUntil.toISOString(),
          createdAt: q.createdAt.toISOString(),
          status: q.status as QuoteData["status"],
          notes: q.notes,
          paymentTerms: "Zelle / Check / Wire Transfer",
          createdUser: q.createdUser,
          items,
        };
      }
    } catch (err) {
      // Fallback to memory
    }
  }

  const found = quotesStore.find((q) => q.id === idOrNumber || q.quoteNumber === idOrNumber);
  return found || null;
}

// Helper: Create a new quote
export async function createNewQuote(data: {
  customerId: string;
  customer?: Partial<QuoteCustomerData>;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    imageUrl?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  validUntil: string;
  notes?: string;
  paymentTerms?: string;
  status?: QuoteData["status"];
  createdUser?: string;
}): Promise<QuoteData> {
  const quoteNumber = `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  let customer = SAMPLE_CUSTOMERS.find((c) => c.id === data.customerId);
  if (!customer && data.customer) {
    customer = {
      id: data.customerId,
      businessName: data.customer.businessName || "Valued Customer",
      contactPerson: data.customer.contactPerson || "Salon Manager",
      phone: data.customer.phone || "+1-713-330-6165",
      email: data.customer.email || null,
      address: data.customer.address || null,
      city: data.customer.city || null,
      state: data.customer.state || "TX",
      zipCode: data.customer.zipCode || null,
      tier: data.customer.tier || "STANDARD",
    };
  }

  if (!customer) {
    customer = SAMPLE_CUSTOMERS[0];
  }

  const items: QuoteItemData[] = data.items.map((it, idx) => {
    const disc = it.discount || 0;
    const lTot = it.quantity * it.unitPrice * (1 - disc / 100);
    return {
      id: `qi-new-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      imageUrl: it.imageUrl,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: disc,
      lineTotal: Number(lTot.toFixed(2)),
    };
  });

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);
  const totalAmount = Number((subtotal - totalDiscount).toFixed(2));

  const newQuote: QuoteData = {
    id: `qt-${Date.now()}`,
    quoteNumber,
    customerId: customer.id,
    customer,
    totalAmount,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    shipping: 0,
    validUntil: data.validUntil,
    createdAt: new Date().toISOString(),
    status: data.status || "DRAFT",
    notes: data.notes || "Free local delivery for wholesale orders in Greater Houston Hub.",
    paymentTerms: data.paymentTerms || "Zelle / Check / Wire Transfer",
    createdUser: data.createdUser || "Johnny Tran",
    items,
  };

  if (process.env.DATABASE_URL) {
    try {
      await prisma.quote.create({
        data: {
          id: newQuote.id,
          quoteNumber: newQuote.quoteNumber,
          customerId: newQuote.customerId,
          totalAmount: newQuote.totalAmount,
          validUntil: new Date(newQuote.validUntil),
          notes: newQuote.notes,
          status: newQuote.status,
          createdUser: newQuote.createdUser,
          items: {
            create: newQuote.items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
            })),
          },
        },
      });
    } catch (err) {
      // Fallback to memory store
    }
  }

  quotesStore.unshift(newQuote);
  return newQuote;
}

export function updateQuoteStatus(id: string, status: QuoteData["status"]): QuoteData | null {
  const q = quotesStore.find((x) => x.id === id);
  if (q) {
    q.status = status;
    return q;
  }
  return null;
}

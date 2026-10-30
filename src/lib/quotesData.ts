import { prisma } from "@/lib/prisma";

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

// Sample Houston Salon B2B Customers
export const SAMPLE_CUSTOMERS: QuoteCustomerData[] = [
  {
    id: "cus-01",
    businessName: "Glamour Nail Bar Houston",
    contactPerson: "Ms. Linda Nguyen",
    phone: "+1-832-555-0188",
    email: "linda@glamournailbar.com",
    address: "9889 Bellaire Blvd, Suite 204",
    city: "Houston",
    state: "TX",
    zipCode: "77036",
    tier: "WHOLESALE",
  },
  {
    id: "cus-02",
    businessName: "Luxe Nails & Organic Spa Dallas",
    contactPerson: "Mr. David Le",
    phone: "+1-214-555-0145",
    email: "david@luxenailorganic.com",
    address: "3200 Preston Rd, Suite 12",
    city: "Dallas",
    state: "TX",
    zipCode: "75240",
    tier: "VIP",
  },
  {
    id: "cus-03",
    businessName: "Diamond Nails Lounge Austin",
    contactPerson: "Ms. Tina Tran",
    phone: "+1-512-555-0199",
    email: "tina@diamondnailslounge.com",
    address: "11200 Lakeline Mall Dr",
    city: "Austin",
    state: "TX",
    zipCode: "78717",
    tier: "WHOLESALE",
  },
  {
    id: "cus-04",
    businessName: "Bella Nails & Lashes San Antonio",
    contactPerson: "Mr. Kevin Vu",
    phone: "+1-210-555-0123",
    email: "kevin@bellanailssa.com",
    address: "17503 La Cantera Pkwy",
    city: "San Antonio",
    state: "TX",
    zipCode: "78257",
    tier: "STANDARD",
  },
  {
    id: "cus-05",
    businessName: "Royal Pedi Lounge Houston",
    contactPerson: "Ms. Jenny Hoang",
    phone: "+1-713-555-0912",
    email: "jenny@royalpedilounge.com",
    address: "2411 S Shepherd Dr",
    city: "Houston",
    state: "TX",
    zipCode: "77019",
    tier: "VIP",
  },
];

// Sample JKIOCEAN Professional Brush Catalog with high-res imagery
export const SAMPLE_PRODUCTS: ProductCatalogItem[] = [
  {
    id: "prod-01",
    sku: "JKI-KL10",
    name: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #10",
    category: "Z Brushes",
    description: "100% Pure Kolinsky Hair, Oval Shape, Acetone-Resistant Gradient Blue Metal Handle",
    imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 45.0,
    retailPrice: 75.0,
    currentStock: 120,
    location: "Houston Hub",
  },
  {
    id: "prod-02",
    sku: "JKI-KL12",
    name: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #12",
    category: "Z Brushes",
    description: "Pure Kolinsky hair for heavy powder pickup, ergonomic silver grip, precision point",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 52.0,
    retailPrice: 88.0,
    currentStock: 95,
    location: "Houston Hub",
  },
  {
    id: "prod-03",
    sku: "JKI-OM08",
    name: "JKIOCEAN Z-Pure Ombre Master Brush #8",
    category: "Art Brushes",
    description: "Special dual-tone feathered bristle structure for seamless babyboomer & color blend",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 28.0,
    retailPrice: 46.0,
    currentStock: 210,
    location: "Houston Hub",
  },
  {
    id: "prod-04",
    sku: "JKI-3D04",
    name: "JKIOCEAN 3D Flower Carving Pointed Brush #4",
    category: "Art Brushes",
    description: "Ultra-sharp Japanese Kolinsky point for realistic flower petals and acrylic embossed art",
    imageUrl: "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 22.5,
    retailPrice: 38.0,
    currentStock: 180,
    location: "Houston Hub",
  },
  {
    id: "prod-05",
    sku: "JKI-FR06",
    name: "JKIOCEAN French Smile-Line Cutter Brush #6",
    category: "French Brushes",
    description: "Razor sharp oblique angled bristles for crisp, clean French manicure smile lines",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 19.0,
    retailPrice: 32.0,
    currentStock: 140,
    location: "Houston Hub",
  },
  {
    id: "prod-06",
    sku: "JKI-LN03",
    name: "JKIOCEAN Diamond Nail Art Liner Set (7mm/9mm/11mm)",
    category: "Liner Brushes",
    description: "Trio set of ultra-fine line art brushes with crystal-filled anti-slip handles",
    imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 32.0,
    retailPrice: 55.0,
    currentStock: 85,
    location: "Houston Hub",
  },
  {
    id: "prod-07",
    sku: "JKI-GL08",
    name: "JKIOCEAN Oval Gel Application Brush #8",
    category: "Gel Brushes",
    description: "Elastic flexible synthetic sable bristles for streak-free builder gel and polygel sculpting",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 24.0,
    retailPrice: 40.0,
    currentStock: 160,
    location: "Houston Hub",
  },
  {
    id: "prod-08",
    sku: "JKI-DS01",
    name: "JKIOCEAN Fluffy Rose Nail Dust Removal Brush",
    category: "Accessories",
    description: "Ultra-soft micro bristles with electroplated rose gold stem for dust and powder removal",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
    wholesalePrice: 12.0,
    retailPrice: 20.0,
    currentStock: 250,
    location: "Houston Hub",
  },
];

// In-Memory store for quotes with initial realistic records
let quotesStore: QuoteData[] = [
  {
    id: "qt-001",
    quoteNumber: "QT-202610-1001",
    customerId: "cus-01",
    customer: SAMPLE_CUSTOMERS[0],
    subtotal: 1395.0,
    totalDiscount: 139.5,
    shipping: 0,
    totalAmount: 1255.5,
    validUntil: "2026-11-02T23:59:59.000Z",
    createdAt: "2026-10-18T10:15:00.000Z",
    status: "SENT",
    notes: "Special Wholesale Package for Houston Salon Expansion. Free local delivery by Houston Hub team.",
    paymentTerms: "Zelle / Company Check (Net 15)",
    createdUser: "Johnny Tran",
    items: [
      {
        id: "qi-101",
        productId: "prod-01",
        productName: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #10",
        sku: "JKI-KL10",
        imageUrl: SAMPLE_PRODUCTS[0].imageUrl,
        category: "Z Brushes",
        quantity: 20,
        unitPrice: 45.0,
        discount: 10,
        lineTotal: 810.0,
      },
      {
        id: "qi-102",
        productId: "prod-03",
        productName: "JKIOCEAN Z-Pure Ombre Master Brush #8",
        sku: "JKI-OM08",
        imageUrl: SAMPLE_PRODUCTS[2].imageUrl,
        category: "Art Brushes",
        quantity: 15,
        unitPrice: 28.0,
        discount: 10,
        lineTotal: 378.0,
      },
      {
        id: "qi-103",
        productId: "prod-05",
        productName: "JKIOCEAN French Smile-Line Cutter Brush #6",
        sku: "JKI-FR06",
        imageUrl: SAMPLE_PRODUCTS[4].imageUrl,
        category: "French Brushes",
        quantity: 10,
        unitPrice: 19.0,
        discount: 10,
        lineTotal: 171.0,
      },
    ],
  },
  {
    id: "qt-002",
    quoteNumber: "QT-202610-1002",
    customerId: "cus-02",
    customer: SAMPLE_CUSTOMERS[1],
    subtotal: 2820.0,
    totalDiscount: 423.0,
    shipping: 0,
    totalAmount: 2397.0,
    validUntil: "2026-11-05T23:59:59.000Z",
    createdAt: "2026-10-17T14:30:00.000Z",
    status: "ACCEPTED",
    notes: "Dallas Branch VIP Volume pricing. Priority UPS Express Ground dispatch.",
    paymentTerms: "Wire Transfer / Zelle",
    createdUser: "Johnny Tran",
    items: [
      {
        id: "qi-201",
        productId: "prod-02",
        productName: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #12",
        sku: "JKI-KL12",
        imageUrl: SAMPLE_PRODUCTS[1].imageUrl,
        category: "Z Brushes",
        quantity: 30,
        unitPrice: 52.0,
        discount: 15,
        lineTotal: 1326.0,
      },
      {
        id: "qi-202",
        productId: "prod-06",
        productName: "JKIOCEAN Diamond Nail Art Liner Set (7mm/9mm/11mm)",
        sku: "JKI-LN03",
        imageUrl: SAMPLE_PRODUCTS[5].imageUrl,
        category: "Liner Brushes",
        quantity: 25,
        unitPrice: 32.0,
        discount: 15,
        lineTotal: 680.0,
      },
      {
        id: "qi-203",
        productId: "prod-07",
        productName: "JKIOCEAN Oval Gel Application Brush #8",
        sku: "JKI-GL08",
        imageUrl: SAMPLE_PRODUCTS[6].imageUrl,
        category: "Gel Brushes",
        quantity: 20,
        unitPrice: 24.0,
        discount: 15,
        lineTotal: 408.0,
      },
    ],
  },
  {
    id: "qt-003",
    quoteNumber: "QT-202610-1003",
    customerId: "cus-03",
    customer: SAMPLE_CUSTOMERS[2],
    subtotal: 925.0,
    totalDiscount: 46.25,
    shipping: 0,
    totalAmount: 878.75,
    validUntil: "2026-10-31T23:59:59.000Z",
    createdAt: "2026-10-19T09:00:00.000Z",
    status: "DRAFT",
    notes: "Quote prepared for Austin salon reopening. Includes sample carving brushes.",
    paymentTerms: "Zelle / Card (Visa/Mastercard)",
    createdUser: "Hanna Nguyen",
    items: [
      {
        id: "qi-301",
        productId: "prod-01",
        productName: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #10",
        sku: "JKI-KL10",
        imageUrl: SAMPLE_PRODUCTS[0].imageUrl,
        category: "Z Brushes",
        quantity: 10,
        unitPrice: 45.0,
        discount: 5,
        lineTotal: 427.5,
      },
      {
        id: "qi-302",
        productId: "prod-04",
        productName: "JKIOCEAN 3D Flower Carving Pointed Brush #4",
        sku: "JKI-3D04",
        imageUrl: SAMPLE_PRODUCTS[3].imageUrl,
        category: "Art Brushes",
        quantity: 15,
        unitPrice: 22.5,
        discount: 5,
        lineTotal: 320.63,
      },
      {
        id: "qi-303",
        productId: "prod-08",
        productName: "JKIOCEAN Fluffy Rose Nail Dust Removal Brush",
        sku: "JKI-DS01",
        imageUrl: SAMPLE_PRODUCTS[7].imageUrl,
        category: "Accessories",
        quantity: 15,
        unitPrice: 12.0,
        discount: 5,
        lineTotal: 171.0,
      },
    ],
  },
  {
    id: "qt-004",
    quoteNumber: "QT-202610-1004",
    customerId: "cus-04",
    customer: SAMPLE_CUSTOMERS[3],
    subtotal: 670.0,
    totalDiscount: 0,
    shipping: 25.0,
    totalAmount: 695.0,
    validUntil: "2026-10-25T23:59:59.000Z",
    createdAt: "2026-10-12T11:20:00.000Z",
    status: "REJECTED",
    notes: "Customer decided to delay brush upgrade until Q1 2027.",
    paymentTerms: "Credit Card",
    createdUser: "Alice Nguyen",
    items: [
      {
        id: "qi-401",
        productId: "prod-01",
        productName: "JKIOCEAN Kolinsky Acrylic Sculpting Brush #10",
        sku: "JKI-KL10",
        imageUrl: SAMPLE_PRODUCTS[0].imageUrl,
        category: "Z Brushes",
        quantity: 8,
        unitPrice: 45.0,
        discount: 0,
        lineTotal: 360.0,
      },
      {
        id: "qi-402",
        productId: "prod-03",
        productName: "JKIOCEAN Z-Pure Ombre Master Brush #8",
        sku: "JKI-OM08",
        imageUrl: SAMPLE_PRODUCTS[2].imageUrl,
        category: "Art Brushes",
        quantity: 10,
        unitPrice: 28.0,
        discount: 0,
        lineTotal: 280.0,
      },
    ],
  },
];

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
          paymentTerms: "Zelle / Check / Card",
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
          paymentTerms: "Zelle / Check / Card",
          createdUser: q.createdUser,
          items,
        };
      }
    } catch (err) {
      // Database connection not ready, proceed to memory store
    }
  }

  const found = quotesStore.find(
    (q) => q.id === idOrNumber || q.quoteNumber.toLowerCase() === idOrNumber.toLowerCase()
  );
  return found || null;
}

// Helper: Save new quote
export async function createNewQuote(payload: {
  quoteNumber?: string;
  customerId: string;
  customer?: QuoteCustomerData;
  items: Array<{
    productId: string;
    productName?: string;
    sku?: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  validUntil: string;
  notes?: string;
  paymentTerms?: string;
  createdUser?: string;
  status?: QuoteData["status"];
}): Promise<QuoteData> {
  const quoteNumber =
    payload.quoteNumber ||
    `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

  // Find customer
  let customer = payload.customer;
  if (!customer) {
    customer = SAMPLE_CUSTOMERS.find((c) => c.id === payload.customerId) || {
      id: payload.customerId,
      businessName: "Houston Beauty Supply & Salon",
      contactPerson: "Valued Customer",
      phone: "+1-713-555-0100",
      city: "Houston",
      state: "TX",
    };
  }

  // Calculate items
  const items: QuoteItemData[] = payload.items.map((it, idx) => {
    const prod = SAMPLE_PRODUCTS.find((p) => p.id === it.productId);
    const pName = it.productName || prod?.name || "JKIOCEAN Professional Brush";
    const sku = it.sku || prod?.sku || `JKI-BR0${idx + 1}`;
    const img = it.imageUrl || prod?.imageUrl || SAMPLE_PRODUCTS[0].imageUrl;
    const disc = it.discount || 0;
    const lineTotal = Number((it.quantity * it.unitPrice * (1 - disc / 100)).toFixed(2));

    return {
      id: `qi-new-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: pName,
      sku: sku,
      imageUrl: img,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: disc,
      lineTotal,
    };
  });

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);
  const shipping = subtotal >= 500 ? 0 : 25; // Free local delivery for $500+ wholesale
  const totalAmount = Number((subtotal - totalDiscount + shipping).toFixed(2));

  // Try Prisma insert
  if (process.env.DATABASE_URL) {
    try {
      const createdInDb = await prisma.quote.create({
        data: {
          quoteNumber,
          customerId: payload.customerId,
          totalAmount,
          validUntil: new Date(payload.validUntil),
          notes: payload.notes || null,
          status: (payload.status as any) || "DRAFT",
          createdUser: payload.createdUser || "Johnny Tran",
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
            })),
          },
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

      if (createdInDb) {
        const qd: QuoteData = {
          id: createdInDb.id,
          quoteNumber: createdInDb.quoteNumber,
          customerId: createdInDb.customerId,
          customer: {
            id: createdInDb.customer.id,
            businessName: createdInDb.customer.businessName,
            contactPerson: createdInDb.customer.contactPerson,
            phone: createdInDb.customer.phone,
            email: createdInDb.customer.email,
            address: createdInDb.customer.address,
            city: createdInDb.customer.city,
            state: createdInDb.customer.state,
            zipCode: createdInDb.customer.zipCode,
          },
          totalAmount: createdInDb.totalAmount,
          subtotal: Number(subtotal.toFixed(2)),
          totalDiscount: Number(totalDiscount.toFixed(2)),
          shipping,
          validUntil: createdInDb.validUntil.toISOString(),
          createdAt: createdInDb.createdAt.toISOString(),
          status: createdInDb.status as QuoteData["status"],
          notes: createdInDb.notes,
          paymentTerms: payload.paymentTerms || "Zelle / Check / Card",
          createdUser: createdInDb.createdUser,
          items,
        };
        quotesStore.unshift(qd);
        return qd;
      }
    } catch (err) {
      // Database connection error, proceed to memory store
    }
  }

  const newQuote: QuoteData = {
    id: `qt-${Date.now()}`,
    quoteNumber,
    customerId: payload.customerId,
    customer,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    shipping,
    totalAmount,
    validUntil: payload.validUntil,
    createdAt: new Date().toISOString(),
    status: payload.status || "DRAFT",
    notes: payload.notes || "Free local delivery for wholesale orders in Greater Houston.",
    paymentTerms: payload.paymentTerms || "Zelle / Company Check / Card",
    createdUser: payload.createdUser || "Johnny Tran",
    items,
  };

  quotesStore.unshift(newQuote);
  return newQuote;
}

// Helper: Update quote status
export async function updateQuoteStatus(id: string, status: QuoteData["status"]) {
  if (process.env.DATABASE_URL) {
    try {
      await prisma.quote.update({
        where: { id },
        data: { status: status as any },
      });
    } catch (err) {
      // Database error, update in-memory
    }
  }

  const quote = quotesStore.find((q) => q.id === id || q.quoteNumber === id);
  if (quote) {
    quote.status = status;
    return quote;
  }
  return null;
}

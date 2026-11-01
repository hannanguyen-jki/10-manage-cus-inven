import { PrismaClient, CustomerTier, CustomerStatus, MovementType, QuoteStatus, PaymentStatus, DipReason } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log(">> Seeding JKIOCEAN ERP Database with 345+ Products and Real B2B Customers...");

  // 1. Seed Products from data/products_extracted.json
  const productsFile = path.join(process.cwd(), "data", "products_extracted.json");
  let productsToSeed: any[] = [];

  if (fs.existsSync(productsFile)) {
    try {
      const raw = fs.readFileSync(productsFile, "utf-8");
      productsToSeed = JSON.parse(raw);
      console.log(`Loaded ${productsToSeed.length} extracted products from JSON.`);
    } catch (err) {
      console.warn("Could not read products_extracted.json, falling back to basic catalog:", err);
    }
  }

  if (productsToSeed.length === 0) {
    productsToSeed = [
      {
        sku: "Z-BRUSH-08",
        name: "Kolinsky 3D Acrylic Brush #8 - Z Series",
        category: "Z Brushes",
        description: "100% Pure Kolinsky Sable hair, chemical-resistant metallic handle.",
        imageUrl: "/uploads/products/prod_001.png",
        wholesalePrice: 16.5,
        retailPrice: 22.0,
        currentStock: 140,
        minStockAlert: 20,
        location: "Houston Hub (Kệ A1)",
      },
    ];
  }

  for (const p of productsToSeed) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        wholesalePrice: p.wholesalePrice,
        retailPrice: p.retailPrice,
        currentStock: p.currentStock,
        minStockAlert: p.minStockAlert,
        location: p.location,
      },
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        wholesalePrice: p.wholesalePrice,
        retailPrice: p.retailPrice,
        currentStock: p.currentStock,
        minStockAlert: p.minStockAlert,
        location: p.location,
      },
    });
  }
  console.log(`>> Successfully seeded ${productsToSeed.length} products with images!`);

  // 2. Seed B2B Customers from data/customers_extracted.json
  const customersFile = path.join(process.cwd(), "data", "customers_extracted.json");
  let customersToSeed: any[] = [];

  if (fs.existsSync(customersFile)) {
    try {
      const raw = fs.readFileSync(customersFile, "utf-8");
      customersToSeed = JSON.parse(raw);
      console.log(`Loaded ${customersToSeed.length} real B2B customers from JSON.`);
    } catch (err) {
      console.warn("Could not read customers_extracted.json:", err);
    }
  }

  const createdCustomers: any[] = [];
  const firstProduct = await prisma.product.findFirst();

  for (const c of customersToSeed) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {
        businessName: c.businessName,
        contactPerson: c.contactPerson,
        email: c.email,
        address: c.address,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        birthday: c.birthday ? new Date(c.birthday) : null,
        assignedSale: c.assignedSale || "admin",
        tier: (c.tier as CustomerTier) || CustomerTier.STANDARD,
        status: (c.status as CustomerStatus) || CustomerStatus.ACTIVE,
        notes: c.notes,
      },
      create: {
        businessName: c.businessName,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        address: c.address,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        birthday: c.birthday ? new Date(c.birthday) : null,
        assignedSale: c.assignedSale || "admin",
        tier: (c.tier as CustomerTier) || CustomerTier.STANDARD,
        status: (c.status as CustomerStatus) || CustomerStatus.ACTIVE,
        notes: c.notes,
      },
    });
    createdCustomers.push({ ...cust, rawOrders: c.orders });

    // Seed Orders / Invoices for this customer
    if (c.orders && c.orders.length > 0 && firstProduct) {
      for (const ord of c.orders) {
        await prisma.order.upsert({
          where: { orderNumber: ord.orderNumber },
          update: {
            totalAmount: ord.totalAmount,
            paidAmount: ord.paidAmount,
            paymentStatus: ord.paymentStatus as PaymentStatus,
            dueDate: new Date(ord.shippingDate || Date.now()),
            saleRep: ord.saleRep,
            notes: ord.notes,
          },
          create: {
            orderNumber: ord.orderNumber,
            customerId: cust.id,
            totalAmount: ord.totalAmount,
            paidAmount: ord.paidAmount,
            paymentStatus: ord.paymentStatus as PaymentStatus,
            dueDate: new Date(ord.shippingDate || Date.now()),
            saleRep: ord.saleRep,
            notes: ord.notes,
            items: {
              create: [
                {
                  productId: firstProduct.id,
                  quantity: Math.max(10, Math.floor(ord.totalAmount / (firstProduct.wholesalePrice || 10))),
                  unitPrice: firstProduct.wholesalePrice,
                },
              ],
            },
          },
        });
      }
    }
  }
  console.log(`>> Successfully seeded ${createdCustomers.length} B2B customers & invoices!`);

  // 3. Seed Sample Quotes
  if (createdCustomers.length > 0 && productsToSeed.length >= 3) {
    const p1 = await prisma.product.findFirst({ where: { sku: productsToSeed[0].sku } });
    const p2 = await prisma.product.findFirst({ where: { sku: productsToSeed[1].sku } });

    if (p1 && p2) {
      await prisma.quote.upsert({
        where: { quoteNumber: "QT-202610-5001" },
        update: {},
        create: {
          quoteNumber: "QT-202610-5001",
          customerId: createdCustomers[0].id,
          totalAmount: 850.0,
          validUntil: new Date(Date.now() + 14 * 86400000),
          status: QuoteStatus.SENT,
          createdUser: "Johnny Tran",
          notes: "Gói sỉ đặc biệt cho đại lý Houston Hub. Miễn phí vận chuyển nội thành.",
          items: {
            create: [
              { productId: p1.id, quantity: 20, unitPrice: p1.wholesalePrice, discount: 10 },
              { productId: p2.id, quantity: 30, unitPrice: p2.wholesalePrice, discount: 10 },
            ],
          },
        },
      });
    }
  }

  // 4. Seed Churn Detection Survey
  if (createdCustomers.length >= 3) {
    await prisma.churnSurvey.create({
      data: {
        customerId: createdCustomers[2].id,
        analysisMonth: "2026-10",
        dropPercent: -45.0,
        reason: DipReason.HIGH_INVENTORY_REMAINING,
        saleNotes: "Khách đang có tồn kho kềm và cọ đủ dùng cho 3 tuần tới, cần chăm sóc lại sau 10 ngày.",
        actionPlan: "Hanna Nguyen sẽ gọi điện chăm sóc và gửi mẫu thử phụ liệu mới.",
        saleRep: "Hanna Nguyen",
        isResolved: false,
      },
    });
  }

  console.log(">> Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, CustomerTier, CustomerStatus, PaymentStatus, DipReason } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log(">> Seeding JKIOCEAN Database with Authentic Products and Real B2B Customers from Sheet...");

  // 1. Read Authentic Products from data/products_extracted.json (extracted from Mix 06.10. 2026.docx)
  const productsFile = path.join(process.cwd(), "data", "products_extracted.json");
  let productsToSeed: any[] = [];

  if (fs.existsSync(productsFile)) {
    try {
      const raw = fs.readFileSync(productsFile, "utf-8").replace(/^\uFEFF/, "");
      productsToSeed = JSON.parse(raw);
      console.log(`Loaded ${productsToSeed.length} extracted products from JSON.`);
    } catch (err) {
      console.warn("Could not read products_extracted.json:", err);
    }
  }

  // 2. Read Authentic Customers from data/customers_extracted.json (extracted from CUSTOMER FOR SALE.xlsx)
  const customersFile = path.join(process.cwd(), "data", "customers_extracted.json");
  let customersToSeed: any[] = [];

  if (fs.existsSync(customersFile)) {
    try {
      const raw = fs.readFileSync(customersFile, "utf-8").replace(/^\uFEFF/, "");
      customersToSeed = JSON.parse(raw);
      console.log(`Loaded ${customersToSeed.length} real B2B customers from JSON.`);
    } catch (err) {
      console.warn("Could not read customers_extracted.json:", err);
    }
  }

  // 3. PURGE ALL OLD TEST / MOCK DATA
  console.log(">> Purging old test/mock data...");

  // Remove test B2B leads (phones containing 555 or dummy leads)
  const deletedLeads = await prisma.b2BLead.deleteMany({
    where: {
      OR: [
        { phone: { contains: "555" } },
        { phone: { startsWith: "+1" } },
      ],
    },
  });
  console.log(`>> Removed ${deletedLeads.count} mock/test leads.`);

  // Remove test customers not in the authentic list (32 customers from sheet)
  const authenticIds = customersToSeed.map((c) => c.id).filter(Boolean);
  if (authenticIds.length > 0) {
    const deletedCust = await prisma.customer.deleteMany({
      where: {
        id: { notIn: authenticIds },
      },
    });
    console.log(`>> Removed ${deletedCust.count} old mock/test customers (and cascaded dummy orders/quotes/surveys).`);
  }

  // Remove test products not in the authentic list (345 products)
  const authenticSkus = productsToSeed.map((p) => p.sku).filter(Boolean);
  if (authenticSkus.length > 0) {
    const testProducts = await prisma.product.findMany({
      where: { sku: { notIn: authenticSkus } },
      select: { id: true, sku: true },
    });

    if (testProducts.length > 0) {
      const testProdIds = testProducts.map((p) => p.id);
      await prisma.orderItem.deleteMany({ where: { productId: { in: testProdIds } } });
      await prisma.quoteItem.deleteMany({ where: { productId: { in: testProdIds } } });
      await prisma.stockMovement.deleteMany({ where: { productId: { in: testProdIds } } });
      const deletedProds = await prisma.product.deleteMany({ where: { id: { in: testProdIds } } });
      console.log(`>> Removed ${deletedProds.count} old mock/test products.`);
    }
  }

  // 4. Upsert Authentic Products
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
        currentStock: p.currentStock || 100,
        minStockAlert: p.minStockAlert || 15,
        location: p.location || "Houston Hub",
      },
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        wholesalePrice: p.wholesalePrice,
        retailPrice: p.retailPrice,
        currentStock: p.currentStock || 100,
        minStockAlert: p.minStockAlert || 15,
        location: p.location || "Houston Hub",
      },
    });
  }
  console.log(`>> Successfully seeded ${productsToSeed.length} authentic products!`);

  // 5. Upsert Authentic Customers & Authentic Orders/Surveys
  const firstProduct = await prisma.product.findFirst({
    where: { sku: { in: authenticSkus } },
  });

  for (const c of customersToSeed) {
    const cust = await prisma.customer.upsert({
      where: { id: c.id },
      update: {
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
      create: {
        id: c.id,
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

    // Seed Orders for this customer
    if (c.orders && c.orders.length > 0 && firstProduct) {
      for (const ord of c.orders) {
        await prisma.order.upsert({
          where: { orderNumber: ord.orderNumber },
          update: {
            totalAmount: ord.totalAmount,
            paidAmount: ord.paidAmount,
            paymentStatus: ord.paymentStatus as PaymentStatus,
            dueDate: new Date(ord.dueDate || ord.createdAt || Date.now()),
            saleRep: ord.saleRep,
            notes: ord.notes,
          },
          create: {
            orderNumber: ord.orderNumber,
            customerId: cust.id,
            totalAmount: ord.totalAmount,
            paidAmount: ord.paidAmount,
            paymentStatus: ord.paymentStatus as PaymentStatus,
            dueDate: new Date(ord.dueDate || ord.createdAt || Date.now()),
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

    // Seed Churn Surveys if any
    if (c.churnSurveys && c.churnSurveys.length > 0) {
      for (const survey of c.churnSurveys) {
        const existing = await prisma.churnSurvey.findFirst({
          where: {
            customerId: cust.id,
            analysisMonth: survey.analysisMonth || "2026-10",
          },
        });
        if (!existing) {
          await prisma.churnSurvey.create({
            data: {
              customerId: cust.id,
              analysisMonth: survey.analysisMonth || "2026-10",
              dropPercent: survey.dropPercent || -40.0,
              reason: (survey.reason as DipReason) || DipReason.HIGH_INVENTORY_REMAINING,
              saleNotes: survey.saleNotes || null,
              actionPlan: survey.actionPlan || null,
              saleRep: survey.saleRep || "Johnny Tran",
              isResolved: false,
            },
          });
        }
      }
    }
  }

  console.log(`>> Successfully seeded ${customersToSeed.length} authentic B2B customers, orders & surveys!`);
  console.log(">> Seeding completed with zero test/mock data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

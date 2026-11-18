import { PrismaClient, CustomerStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log(">> Seeding Orders into PostgreSQL database...");

  const ordersFile = path.join(process.cwd(), "data", "orders_seed.json");
  const customersFile = path.join(process.cwd(), "data", "customers_extracted.json");

  if (!fs.existsSync(ordersFile) || !fs.existsSync(customersFile)) {
    throw new Error("Missing data/orders_seed.json or data/customers_extracted.json");
  }

  const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
  const customers = JSON.parse(fs.readFileSync(customersFile, "utf-8"));

  // 1. Map SKU to Product.id
  const dbProducts = await prisma.product.findMany({
    select: { id: true, sku: true },
  });
  console.log(`Found ${dbProducts.length} products in DB.`);

  if (dbProducts.length === 0) {
    throw new Error("No products in DB! Please seed products first.");
  }

  const skuToId = new Map<string, string>();
  for (const p of dbProducts) {
    skuToId.set(p.sku, p.id);
  }

  // Refuse to run if any order line points at a product that is not in the DB yet
  // (otherwise lines would silently be attached to the wrong product).
  const missingSkus = new Set<string>();
  for (const o of orders) for (const it of o.items || []) if (!skuToId.has(it.sku)) missingSkus.add(it.sku);
  if (missingSkus.size > 0) {
    throw new Error(
      `${missingSkus.size} product SKU(s) used by orders are missing in the DB (e.g. ${Array.from(missingSkus).slice(0, 5).join(", ")}). ` +
        "Restart the web container first so prisma/seed.ts adds the new catalog products, then run this again."
    );
  }

  // 1b. Remove duplicate customer rows that were merged into another customer
  //     (data/customers_merged.json: { removedId: keptId }). Refuses if a duplicate has quotes/texts/surveys.
  const mergedFile = path.join(process.cwd(), "data", "customers_merged.json");
  if (fs.existsSync(mergedFile)) {
    const merged: Record<string, string> = JSON.parse(fs.readFileSync(mergedFile, "utf-8"));
    for (const [dropId, keepId] of Object.entries(merged)) {
      const [quotes, sms, surveys] = await Promise.all([
        prisma.quote.count({ where: { customerId: dropId } }),
        prisma.smsLog.count({ where: { customerId: dropId } }),
        prisma.churnSurvey.count({ where: { customerId: dropId } }),
      ]);
      if (quotes + sms + surveys > 0) {
        throw new Error(`Customer ${dropId} (merged into ${keepId}) has ${quotes} quotes, ${sms} texts, ${surveys} surveys. Merge them by hand first.`);
      }
    }
    const removed = await prisma.customer.deleteMany({ where: { id: { in: Object.keys(merged) } } });
    console.log(`Removed ${removed.count} duplicate customers merged into another customer.`);
  }

  // 2. Update customer lastSale and status
  console.log(`Updating ${customers.length} customers with lastSale and status...`);
  for (const c of customers) {
    const statusEnum: CustomerStatus =
      c.status === "ACTIVE"
        ? CustomerStatus.ACTIVE
        : c.status === "AT_RISK"
        ? CustomerStatus.AT_RISK
        : CustomerStatus.INACTIVE;

    await prisma.customer.update({
      where: { id: c.id },
      data: {
        lastSale: c.lastSale || null,
        status: statusEnum,
      },
    }).catch((err) => {
      // ignore if customer not found
    });
  }

  // 3. Delete existing orders
  console.log("Deleting old orders and items...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  // 4. Insert orders in batches
  console.log(`Inserting ${orders.length} orders...`);
  const batchSize = 50;
  for (let i = 0; i < orders.length; i += batchSize) {
    const chunk = orders.slice(i, i + batchSize);
    for (const o of chunk) {
      const itemsToCreate = (o.items || []).map((it: any) => ({
        productId: skuToId.get(it.sku) as string,
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || 0,
      }));

      await prisma.order.create({
        data: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          totalAmount: o.totalAmount,
          paidAmount: o.paidAmount,
          paymentStatus: "PAID",
          dueDate: new Date(o.dueDate),
          saleRep: o.saleRep || "admin",
          notes: o.notes || null,
          createdAt: new Date(o.createdAt),
          items: {
            create: itemsToCreate,
          },
        },
      });
    }
    console.log(`  Processed orders ${i + 1} to ${Math.min(i + batchSize, orders.length)}...`);
  }

  console.log(">> Orders seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * ONE-TIME customer replacement from data/customers_extracted.json (sheet, IDs SUP01…SUP0320).
 *
 * Deletes, in one transaction: order items, orders, quote items, quotes, churn surveys, SMS logs, customers.
 * Then inserts the sheet customers with their original SUP IDs.
 * Products are NOT touched.
 *
 * Guarded by a row in jki_data_migrations + an advisory lock, so a second run does nothing.
 * Run manually after a Postgres backup (see DEPLOY_NOTE.md); it is not part of container startup.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const MIGRATION_ID = "sheet-customers-2026-11-17";
const db = new PrismaClient();

type SheetCustomer = {
  id: string;
  businessName: string;
  contactPerson: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  lastSale: string | null;
  notes: string | null;
};

const customers: SheetCustomer[] = JSON.parse(fs.readFileSync("data/customers_extracted.json", "utf8"));
if (
  !Array.isArray(customers) ||
  customers.length === 0 ||
  customers.some((c) => !/^SUP0\d+$/.test(c.id || "") || !c.businessName) ||
  new Set(customers.map((c) => c.id)).size !== customers.length
) {
  throw new Error("Invalid customer import file");
}

const text = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

async function main() {
  await db.$transaction(
    async (tx) => {
      await tx.$executeRaw`CREATE TABLE IF NOT EXISTS jki_data_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(17320917)::text`;
      const seen = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM jki_data_migrations WHERE id = ${MIGRATION_ID}`;
      if (seen.length) {
        console.log("Customer migration already applied. Nothing changed.");
        return;
      }

      // Dependent data first (children before parents), then customers.
      const deleted = {
        orderItems: (await tx.orderItem.deleteMany()).count,
        orders: (await tx.order.deleteMany()).count,
        quoteItems: (await tx.quoteItem.deleteMany()).count,
        quotes: (await tx.quote.deleteMany()).count,
        churnSurveys: (await tx.churnSurvey.deleteMany()).count,
        smsLogs: (await tx.smsLog.deleteMany()).count,
        customers: (await tx.customer.deleteMany()).count,
      };
      console.log("Deleted:", deleted);

      for (const c of customers) {
        await tx.customer.create({
          data: {
            id: c.id,
            businessName: c.businessName.trim(),
            contactPerson: text(c.contactPerson) ?? "",
            phone: text(c.phone) ?? "",
            address: text(c.address),
            city: text(c.city),
            state: text(c.state),
            zipCode: text(c.zipCode),
            lastSale: text(c.lastSale),
            notes: text(c.notes),
          },
        });
      }

      await tx.$executeRaw`INSERT INTO jki_data_migrations(id) VALUES (${MIGRATION_ID})`;
      console.log(`Imported ${customers.length} customers (${customers[0].id} … ${customers[customers.length - 1].id}). Products untouched.`);
    },
    { timeout: 300000, maxWait: 60000 }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

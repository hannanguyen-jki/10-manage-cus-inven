/**
 * Runs on every container start (see docker-entrypoint.sh), so it must be SAFE TO RE-RUN:
 *  - it only inserts records that are missing,
 *  - it never deletes or overwrites data people changed in the app
 *    (customers, payment status, product prices / images, new products).
 *
 * Customer replacement is an explicit one-time operation; catalog seeding only adds missing SKUs.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function readJson(file: string): any {
  const full = path.join(process.cwd(), "data", file);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf-8").replace(/^﻿/, ""));
  } catch (err) {
    console.warn(`Could not read ${file}:`, err);
    return null;
  }
}

type CatalogProduct = { sku: string; name: string; category: string; wholesalePrice: number; imageUrl: string | null; sortOrder: number };

async function migrateCatalog(catalog: CatalogProduct[]) {
  // Keep existing products, images and order/quote references intact on every start.
  const existing = new Set((await prisma.product.findMany({ select: { sku: true } })).map((p) => p.sku));
  const missing = catalog.filter((p) => !existing.has(p.sku));
  if (missing.length) await prisma.product.createMany({ data: missing.map(toProductData), skipDuplicates: true });
  console.log(`>> Catalog checked (${missing.length} products missing by SKU).`);
}

function toProductData(p: CatalogProduct) {
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
    wholesalePrice: Number(p.wholesalePrice) || 0,
    sortOrder: p.sortOrder,
  };
}

async function main() {
  console.log(">> Seeding JKIOCEAN database (insert-only)...");

  const catalog = readJson("catalog.json");
  if (catalog?.products?.length) await migrateCatalog(catalog.products);

  // Customer import is an explicit migration, never part of container startup.

  console.log(">> Seeding done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

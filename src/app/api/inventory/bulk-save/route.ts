import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product list is empty" },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: Array<{ sku: string; error: string }> = [];

    // Process each product sequentially or in transaction to preserve data integrity
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      let sku = p.sku?.trim().toUpperCase();

      if (!sku) {
        sku = `JKI-IMP-${Date.now().toString().slice(-4)}-${String(i + 1).padStart(3, "0")}`;
      }

      const name = p.name?.trim() || `Product ${sku}`;
      const category = p.category?.trim() || "Acrylic Brushes";
      const wholesalePrice = Math.max(0, parseFloat(String(p.wholesalePrice)) || 0);
      const retailPrice =
        p.retailPrice !== undefined && p.retailPrice !== null && !isNaN(parseFloat(String(p.retailPrice)))
          ? Math.max(0, parseFloat(String(p.retailPrice)))
          : null;
      const currentStock = Math.max(0, parseInt(String(p.currentStock), 10) || 0);
      const minStockAlert = Math.max(0, parseInt(String(p.minStockAlert), 10) || 10);
      const location = p.location?.trim() || "Houston Hub";
      const description = p.description?.trim() || null;
      const imageUrl = p.imageUrl?.trim() || null;

      try {
        await prisma.$transaction(async (tx) => {
          const existing = await tx.product.findUnique({
            where: { sku },
          });

          if (existing) {
            // Update existing product
            await tx.product.update({
              where: { id: existing.id },
              data: {
                name,
                category,
                description: description || existing.description,
                imageUrl: imageUrl || existing.imageUrl,
                wholesalePrice: wholesalePrice > 0 ? wholesalePrice : existing.wholesalePrice,
                retailPrice: retailPrice !== null ? retailPrice : existing.retailPrice,
                currentStock: currentStock > 0 ? existing.currentStock + currentStock : existing.currentStock,
                minStockAlert,
                location,
              },
            });

            // If stock was added, log an inbound movement
            if (currentStock > 0) {
              await tx.stockMovement.create({
                data: {
                  productId: existing.id,
                  type: "INBOUND",
                  quantity: currentStock,
                  referenceNo: "DOCX-IMPORT",
                  notes: `Incremental stock import from Word catalog (+${currentStock})`,
                  createdUser: "admin",
                },
              });
            }

            updatedCount++;
          } else {
            // Create new product
            const created = await tx.product.create({
              data: {
                sku,
                name,
                category,
                description,
                imageUrl,
                wholesalePrice,
                retailPrice,
                currentStock,
                minStockAlert,
                location,
              },
            });

            if (currentStock > 0) {
              await tx.stockMovement.create({
                data: {
                  productId: created.id,
                  type: "INBOUND",
                  quantity: currentStock,
                  referenceNo: "DOCX-IMPORT",
                  notes: `Initial stock import from Word catalog (+${currentStock})`,
                  createdUser: "admin",
                },
              });
            }

            createdCount++;
          }
        });
      } catch (err: any) {
        console.error(`Error saving product ${sku}:`, err);
        errors.push({ sku, error: err.message || "Error saving product" });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${createdCount + updatedCount} products`,
      totalProcessed: products.length,
      createdCount,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error bulk saving products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error bulk saving products" },
      { status: 500 }
    );
  }
}

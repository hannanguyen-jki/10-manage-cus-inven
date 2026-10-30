import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SAMPLE_CUSTOMERS, SAMPLE_PRODUCTS } from "@/lib/quotesData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let customers: any[] = [];
    let products: any[] = [];

    // Attempt to query real DB customers
    try {
      customers = await prisma.customer.findMany({
        select: {
          id: true,
          businessName: true,
          contactPerson: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          tier: true,
        },
        orderBy: { businessName: "asc" },
      });
    } catch {
      // Prisma not ready
    }

    // Attempt to query real DB products
    try {
      products = await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          category: true,
          description: true,
          imageUrl: true,
          wholesalePrice: true,
          retailPrice: true,
          currentStock: true,
          location: true,
        },
        orderBy: { name: "asc" },
      });
    } catch {
      // Prisma not ready
    }

    if (!customers || customers.length === 0) {
      customers = SAMPLE_CUSTOMERS;
    }

    if (!products || products.length === 0) {
      products = SAMPLE_PRODUCTS;
    }

    return NextResponse.json({
      success: true,
      customers,
      products,
    });
  } catch (error) {
    console.error("Quotes Options Error:", error);
    return NextResponse.json({
      success: true,
      customers: SAMPLE_CUSTOMERS,
      products: SAMPLE_PRODUCTS,
    });
  }
}

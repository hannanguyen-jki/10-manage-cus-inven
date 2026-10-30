import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const location = searchParams.get("location")?.trim() || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All" && category !== "all") {
      where.category = category;
    }

    if (location && location !== "All" && location !== "all") {
      where.location = location;
    }

    // Fetch all products matching basic criteria to compute accurate metrics & status filtering
    const allMatchingProducts = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        stockMovements: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Compute metrics
    const totalSkus = allMatchingProducts.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;
    let houstonHubStock = 0;

    const allCategories = new Set<string>();

    allMatchingProducts.forEach((p) => {
      const stock = p.currentStock || 0;
      const alert = p.minStockAlert || 10;
      const price = p.wholesalePrice || 0;

      totalStockValue += price * stock;

      if (p.category) {
        allCategories.add(p.category);
      }

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= alert) {
        lowStockCount++;
        inStockCount++;
      } else {
        inStockCount++;
      }

      if (p.location?.toLowerCase().includes("houston")) {
        houstonHubStock += stock;
      }
    });

    // Filter by status if requested
    let filteredProducts = allMatchingProducts;
    if (status === "in-stock") {
      filteredProducts = allMatchingProducts.filter((p) => p.currentStock > 0);
    } else if (status === "low-stock") {
      filteredProducts = allMatchingProducts.filter(
        (p) => p.currentStock > 0 && p.currentStock <= (p.minStockAlert || 10)
      );
    } else if (status === "out-of-stock") {
      filteredProducts = allMatchingProducts.filter((p) => p.currentStock <= 0);
    }

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      metrics: {
        totalSkus,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        lowStockCount,
        outOfStockCount,
        inStockCount,
        houstonHubStock,
      },
      categories: Array.from(allCategories),
    });
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy dữ liệu kho hàng" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      category = "Z Brushes",
      description,
      imageUrl,
      wholesalePrice,
      retailPrice,
      currentStock = 0,
      minStockAlert = 10,
      location = "Houston Hub",
    } = body;

    if (!sku?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Mã SKU và Tên sản phẩm là bắt buộc" },
        { status: 400 }
      );
    }

    if (wholesalePrice === undefined || wholesalePrice === null || isNaN(Number(wholesalePrice))) {
      return NextResponse.json(
        { success: false, error: "Giá sỉ (Wholesale Price) không hợp lệ" },
        { status: 400 }
      );
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check unique SKU
    const existing = await prisma.product.findUnique({
      where: { sku: cleanSku },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Mã SKU '${cleanSku}' đã tồn tại trong hệ thống` },
        { status: 409 }
      );
    }

    const initialStock = Math.max(0, parseInt(String(currentStock), 10) || 0);

    // Create product and initial stock movement in transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: cleanSku,
          name: name.trim(),
          category: category.trim(),
          description: description?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          wholesalePrice: Number(wholesalePrice),
          retailPrice: retailPrice !== undefined && retailPrice !== null && !isNaN(Number(retailPrice))
            ? Number(retailPrice)
            : null,
          currentStock: initialStock,
          minStockAlert: Math.max(0, parseInt(String(minStockAlert), 10) || 10),
          location: location?.trim() || "Houston Hub",
        },
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: "INBOUND",
            quantity: initialStock,
            referenceNo: "INIT-STOCK",
            notes: "Tồn kho ban đầu khi tạo sản phẩm",
            createdUser: "admin",
          },
        });
      }

      return product;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo sản phẩm thành công",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tạo sản phẩm" },
      { status: 500 }
    );
  }
}

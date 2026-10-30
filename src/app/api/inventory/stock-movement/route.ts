import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId")?.trim();
    const type = searchParams.get("type")?.trim();
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (productId) where.productId = productId;
    if (type && ["INBOUND", "OUTBOUND", "ADJUSTMENT"].includes(type)) {
      where.type = type;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            currentStock: true,
            imageUrl: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      movements,
    });
  } catch (error: any) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy lịch sử xuất nhập kho" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      type, // 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT'
      quantity,
      targetStock,
      referenceNo,
      notes,
      createdUser = "admin",
      allowNegative = false,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Vui lòng chọn sản phẩm" },
        { status: 400 }
      );
    }

    if (!type || !["INBOUND", "OUTBOUND", "ADJUSTMENT"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Loại giao dịch không hợp lệ (INBOUND, OUTBOUND, hoặc ADJUSTMENT)" },
        { status: 400 }
      );
    }

    const parsedQty = parseInt(String(quantity), 10);

    // In a Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Không tìm thấy sản phẩm trong hệ thống");
      }

      let newStock = product.currentStock;
      let recordedQuantity = 0;
      let finalNotes = notes?.trim() || "";

      if (type === "INBOUND") {
        if (isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error("Số lượng nhập kho phải lớn hơn 0");
        }
        recordedQuantity = parsedQty;
        newStock = product.currentStock + parsedQty;
        if (!finalNotes) finalNotes = `Nhập kho +${parsedQty} sp`;
      } else if (type === "OUTBOUND") {
        if (isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error("Số lượng xuất kho phải lớn hơn 0");
        }
        if (!allowNegative && product.currentStock < parsedQty) {
          throw new Error(
            `Không đủ tồn kho để xuất. Hiện còn: ${product.currentStock}, yêu cầu xuất: ${parsedQty}`
          );
        }
        recordedQuantity = parsedQty;
        newStock = product.currentStock - parsedQty;
        if (!finalNotes) finalNotes = `Xuất kho -${parsedQty} sp`;
      } else if (type === "ADJUSTMENT") {
        // Can be given as targetStock (actual physical count) or difference quantity
        if (targetStock !== undefined && targetStock !== null && !isNaN(Number(targetStock))) {
          const target = Math.max(0, parseInt(String(targetStock), 10));
          const diff = target - product.currentStock;
          recordedQuantity = Math.abs(diff);
          newStock = target;
          if (!finalNotes) {
            finalNotes = `Kiểm kê kho: Từ ${product.currentStock} -> ${target} (${diff >= 0 ? `+${diff}` : diff})`;
          }
        } else {
          if (isNaN(parsedQty)) {
            throw new Error("Vui lòng cung cấp số lượng kiểm kê hoặc số tồn thực tế");
          }
          recordedQuantity = Math.abs(parsedQty);
          newStock = Math.max(0, product.currentStock + parsedQty);
          if (!finalNotes) {
            finalNotes = `Điều chỉnh kiểm kê: ${parsedQty >= 0 ? `+${parsedQty}` : parsedQty}`;
          }
        }
      }

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          type,
          quantity: recordedQuantity,
          referenceNo: referenceNo?.trim() || null,
          notes: finalNotes,
          createdUser: createdUser || "admin",
        },
      });

      // Update current stock
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newStock },
      });

      return { movement, product: updatedProduct };
    });

    return NextResponse.json({
      success: true,
      message: `Đã thực hiện ${
        type === "INBOUND" ? "Nhập kho" : type === "OUTBOUND" ? "Xuất kho" : "Kiểm kê kho"
      } thành công`,
      movement: result.movement,
      product: result.product,
    });
  } catch (error: any) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi ghi nhận xuất nhập kho" },
      { status: 400 }
    );
  }
}

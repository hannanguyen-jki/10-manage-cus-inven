import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
      include: {
        stockMovements: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            orderItems: true,
            quoteItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tải chi tiết sản phẩm" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm để cập nhật" },
        { status: 404 }
      );
    }

    const {
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
    } = body;

    // Check SKU conflict if changed
    if (sku && sku.trim().toUpperCase() !== existingProduct.sku) {
      const cleanSku = sku.trim().toUpperCase();
      const duplicate = await prisma.product.findUnique({
        where: { sku: cleanSku },
      });
      if (duplicate && duplicate.id !== existingProduct.id) {
        return NextResponse.json(
          { success: false, error: `Mã SKU '${cleanSku}' đã được sử dụng bởi sản phẩm khác` },
          { status: 409 }
        );
      }
    }

    const newStock =
      currentStock !== undefined && currentStock !== null && !isNaN(Number(currentStock))
        ? Math.max(0, parseInt(String(currentStock), 10))
        : existingProduct.currentStock;

    const stockDiff = newStock - existingProduct.currentStock;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Record adjustment movement if currentStock changed directly via product edit
      if (stockDiff !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: existingProduct.id,
            type: "ADJUSTMENT",
            quantity: Math.abs(stockDiff),
            referenceNo: "MANUAL-EDIT",
            notes: `Điều chỉnh tồn kho thủ công: ${existingProduct.currentStock} -> ${newStock} (${
              stockDiff > 0 ? `+${stockDiff}` : stockDiff
            })`,
            createdUser: "admin",
          },
        });
      }

      return tx.product.update({
        where: { id: existingProduct.id },
        data: {
          ...(sku ? { sku: sku.trim().toUpperCase() } : {}),
          ...(name ? { name: name.trim() } : {}),
          ...(category ? { category: category.trim() } : {}),
          description: description !== undefined ? description?.trim() || null : existingProduct.description,
          imageUrl: imageUrl !== undefined ? imageUrl?.trim() || null : existingProduct.imageUrl,
          ...(wholesalePrice !== undefined && !isNaN(Number(wholesalePrice))
            ? { wholesalePrice: Number(wholesalePrice) }
            : {}),
          retailPrice:
            retailPrice !== undefined
              ? retailPrice === null || isNaN(Number(retailPrice))
                ? null
                : Number(retailPrice)
              : existingProduct.retailPrice,
          currentStock: newStock,
          ...(minStockAlert !== undefined && !isNaN(Number(minStockAlert))
            ? { minStockAlert: Math.max(0, parseInt(String(minStockAlert), 10)) }
            : {}),
          ...(location !== undefined ? { location: location?.trim() || "Houston Hub" } : {}),
        },
        include: {
          stockMovements: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi cập nhật sản phẩm" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm để xóa" },
        { status: 404 }
      );
    }

    // Check if product is in orders or quotes
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: existingProduct.id },
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa vì sản phẩm đang nằm trong ${orderItemsCount} đơn hàng. Bạn có thể cập nhật tồn kho về 0 thay vì xóa.`,
        },
        { status: 400 }
      );
    }

    // Delete product (cascade will delete stockMovements)
    await prisma.product.delete({
      where: { id: existingProduct.id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa sản phẩm ${existingProduct.sku} - ${existingProduct.name}`,
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa sản phẩm" },
      { status: 500 }
    );
  }
}

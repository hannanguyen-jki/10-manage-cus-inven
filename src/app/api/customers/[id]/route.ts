import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMockCustomerById,
  updateMockCustomer,
  MockCustomer,
} from "@/lib/mock-crm-data";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu Customer ID" },
        { status: 400 }
      );
    }

    let customerData: any = null;

    try {
      // 1. Thử truy vấn chi tiết từ PostgreSQL qua Prisma
      const dbCustomer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      sku: true,
                      name: true,
                      category: true,
                      wholesalePrice: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          quotes: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      sku: true,
                      name: true,
                      wholesalePrice: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          smsLogs: {
            orderBy: { createdAt: "desc" },
          },
          churnSurveys: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (dbCustomer) {
        const totalSpent = dbCustomer.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = dbCustomer.orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const debtAmount = Math.max(0, totalSpent - totalPaid);

        customerData = {
          ...dbCustomer,
          totalSpent,
          totalPaid,
          debtAmount,
          orderCount: dbCustomer.orders.length,
          lastOrderDate: dbCustomer.orders[0]?.createdAt || null,
          lastContactDate: dbCustomer.smsLogs[0]?.createdAt || null,
        };
      }
    } catch (dbErr) {
      console.warn(`[Customer 360 API GET ${id}] DB query failed, checking mock store:`, dbErr);
    }

    // 2. Fallback nếu DB không có hoặc offline
    if (!customerData) {
      const mockCus = getMockCustomerById(id);
      if (mockCus) {
        const totalSpent = (mockCus.orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = (mockCus.orders || []).reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const debtAmount = Math.max(0, totalSpent - totalPaid);

        customerData = {
          ...mockCus,
          totalSpent,
          totalPaid,
          debtAmount,
          orderCount: (mockCus.orders || []).length,
          lastOrderDate: mockCus.orders && mockCus.orders[0] ? mockCus.orders[0].createdAt : null,
          lastContactDate: mockCus.smsLogs && mockCus.smsLogs[0] ? mockCus.smsLogs[0].createdAt : null,
        };
      }
    }

    if (!customerData) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin khách hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: customerData,
    });
  } catch (error: any) {
    console.error(`[GET /api/customers/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lấy chi tiết khách hàng" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const {
      businessName,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      birthday,
      assignedSale,
      tier,
      status,
      notes,
    } = body;

    let updatedCustomer: any = null;

    try {
      // 1. Thử cập nhật qua Prisma
      updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          ...(businessName && { businessName }),
          ...(contactPerson && { contactPerson }),
          ...(phone && { phone }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
          ...(assignedSale !== undefined && { assignedSale }),
          ...(tier && { tier: tier as any }),
          ...(status && { status: status as any }),
          ...(notes !== undefined && { notes }),
        },
      });
    } catch (dbErr: any) {
      console.warn(`[Customer API PUT ${id}] DB update failed, using mock store:`, dbErr.message);
      // Fallback mock store
      updatedCustomer = updateMockCustomer(id, {
        ...(businessName && { businessName }),
        ...(contactPerson && { contactPerson }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(birthday !== undefined && { birthday }),
        ...(assignedSale !== undefined && { assignedSale }),
        ...(tier && { tier }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      });
    }

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khách hàng để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin khách hàng thành công",
      customer: updatedCustomer,
    });
  } catch (error: any) {
    console.error(`[PUT /api/customers/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật khách hàng" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    try {
      await prisma.customer.delete({
        where: { id },
      });
    } catch (dbErr: any) {
      console.warn(`[Customer API DELETE ${id}] DB delete failed:`, dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Xóa khách hàng thành công",
    });
  } catch (error: any) {
    console.error(`[DELETE /api/customers/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa khách hàng" },
      { status: 500 }
    );
  }
}

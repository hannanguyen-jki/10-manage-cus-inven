import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMockCustomers,
  addMockCustomer,
  MockCustomer,
} from "@/lib/mock-crm-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const tier = searchParams.get("tier");
    const state = searchParams.get("state");
    const assignedSale = searchParams.get("assignedSale");
    const status = searchParams.get("status");

    let customersData: any[] = [];

    try {
      // 1. Thử lấy từ PostgreSQL qua Prisma
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { businessName: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      if (tier && tier !== "ALL") {
        whereClause.tier = tier;
      }

      if (state && state !== "ALL") {
        whereClause.state = state;
      }

      if (assignedSale && assignedSale !== "ALL") {
        whereClause.assignedSale = assignedSale;
      }

      if (status && status !== "ALL") {
        whereClause.status = status;
      }

      const dbCustomers = await prisma.customer.findMany({
        where: whereClause,
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              paidAmount: true,
              paymentStatus: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          quotes: {
            select: {
              id: true,
              quoteNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          smsLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          churnSurveys: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbCustomers && dbCustomers.length > 0) {
        customersData = dbCustomers.map((c) => {
          const totalSpent = c.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          const totalPaid = c.orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
          const lastOrderDate = c.orders[0]?.createdAt || null;
          const lastContactDate = c.smsLogs[0]?.createdAt || null;

          return {
            ...c,
            totalSpent,
            totalPaid,
            debtAmount: Math.max(0, totalSpent - totalPaid),
            orderCount: c.orders.length,
            lastOrderDate,
            lastContactDate,
          };
        });
      }
    } catch (dbErr) {
      console.warn("[CRM API] Prisma DB query error/offline, using fallback store:", dbErr);
    }

    // 2. Nếu DB rỗng hoặc offline, dùng Mock Data Store
    if (customersData.length === 0) {
      const mockList = getMockCustomers();
      let filtered = [...mockList];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.businessName.toLowerCase().includes(s) ||
            c.contactPerson.toLowerCase().includes(s) ||
            c.phone.toLowerCase().includes(s)
        );
      }

      if (tier && tier !== "ALL") {
        filtered = filtered.filter((c) => c.tier === tier);
      }

      if (state && state !== "ALL") {
        filtered = filtered.filter((c) => c.state === state);
      }

      if (assignedSale && assignedSale !== "ALL") {
        filtered = filtered.filter((c) => c.assignedSale === assignedSale);
      }

      if (status && status !== "ALL") {
        filtered = filtered.filter((c) => c.status === status);
      }

      customersData = filtered.map((c) => {
        const totalSpent = (c.orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = (c.orders || []).reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const lastOrderDate = c.orders && c.orders[0] ? c.orders[0].createdAt : null;
        const lastContactDate = c.smsLogs && c.smsLogs[0] ? c.smsLogs[0].createdAt : null;

        return {
          ...c,
          totalSpent,
          totalPaid,
          debtAmount: Math.max(0, totalSpent - totalPaid),
          orderCount: (c.orders || []).length,
          lastOrderDate,
          lastContactDate,
        };
      });
    }

    return NextResponse.json({
      success: true,
      customers: customersData,
      total: customersData.length,
    });
  } catch (error: any) {
    console.error("[GET /api/customers] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy danh sách khách hàng" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessName,
      contactPerson,
      phone,
      email,
      address,
      city,
      state = "TX",
      zipCode,
      birthday,
      assignedSale = "admin",
      tier = "STANDARD",
      status = "ACTIVE",
      notes,
    } = body;

    if (!businessName || !contactPerson || !phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Tên Salon, Người đại diện và Số điện thoại" },
        { status: 400 }
      );
    }

    let createdCustomer: any = null;

    try {
      // 1. Lưu vào PostgreSQL qua Prisma
      createdCustomer = await prisma.customer.create({
        data: {
          businessName,
          contactPerson,
          phone,
          email: email || null,
          address: address || null,
          city: city || null,
          state: state || "TX",
          zipCode: zipCode || null,
          birthday: birthday ? new Date(birthday) : null,
          assignedSale: assignedSale || "admin",
          tier: tier as any,
          status: status as any,
          notes: notes || null,
        },
      });
    } catch (dbErr: any) {
      console.warn("[CRM API POST] DB write failed, storing into mock store:", dbErr.message);
      // Kiểm tra trùng số điện thoại trong mock store
      const existing = getMockCustomers().find((c) => c.phone === phone);
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Số điện thoại này đã tồn tại trong hệ thống" },
          { status: 400 }
        );
      }

      createdCustomer = addMockCustomer({
        businessName,
        contactPerson,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        birthday: birthday || null,
        assignedSale,
        tier,
        status,
        notes,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tạo khách hàng mới thành công",
      customer: createdCustomer,
    });
  } catch (error: any) {
    console.error("[POST /api/customers] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tạo khách hàng" },
      { status: 500 }
    );
  }
}

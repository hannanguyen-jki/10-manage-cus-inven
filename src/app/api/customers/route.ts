import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMockCustomers,
  addMockCustomer,
  MockCustomer,
} from "@/lib/mock-crm-data";
import { summarizeOrders } from "@/lib/payments";

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
      // 1. Query from PostgreSQL via Prisma
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
      // Prisma DB query offline, proceed to fallback store
    }

    // 2. If DB is empty or offline, use authentic customer store
    if (customersData.length === 0) {
      const mockList = getMockCustomers();
      let filtered = [...mockList];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.businessName.toLowerCase().includes(s) ||
            c.contactPerson.toLowerCase().includes(s) ||
            c.phone.toLowerCase().includes(s) ||
            (c.city && c.city.toLowerCase().includes(s))
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
        const totalSpent = c.totalSpent !== undefined ? c.totalSpent : (c.orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = c.totalPaid !== undefined ? c.totalPaid : (c.orders || []).reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const debtAmount = c.debtAmount !== undefined ? c.debtAmount : Math.max(0, totalSpent - totalPaid);
        const lastOrderDate = c.lastOrderDate || (c.orders && c.orders[0] ? c.orders[0].createdAt : null);
        const lastContactDate = c.lastContactDate || (c.smsLogs && c.smsLogs[0] ? c.smsLogs[0].createdAt : null);

        return {
          ...c,
          totalSpent,
          totalPaid,
          debtAmount,
          orderCount: c.orderCount !== undefined ? c.orderCount : (c.orders || []).length,
          lastOrderDate,
          lastContactDate,
        };
      });
    }

    customersData = customersData.map((c) => {
      const { totalSpent, totalPaid, debtAmount, profit, aov, rev2024, rev2025, rev2026, orders, quotes, smsLogs, churnSurveys, ...rest } = c;
      return {
        ...rest,
        ...summarizeOrders(orders || []),
        quoteCount: (quotes || []).length,
        lastContactDate: c.lastContactDate || null,
      };
    });

    return NextResponse.json({
      success: true,
      customers: customersData,
      total: customersData.length,
    });
  } catch (error: any) {
    console.error("[GET /api/customers] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
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
      state,
      zipCode,
      birthday,
      assignedSale = "admin",
      tier = "STANDARD",
      status = "ACTIVE",
      notes,
    } = body;

    if (!businessName || !contactPerson || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (businessName, contactPerson, phone)" },
        { status: 400 }
      );
    }

    let createdCustomer: any = null;

    try {
      createdCustomer = await prisma.customer.create({
        data: {
          businessName,
          contactPerson,
          phone,
          email: email || null,
          address: address || null,
          city: city || "Houston",
          state: state || "TX",
          zipCode: zipCode || "77036",
          birthday: birthday ? new Date(birthday) : null,
          assignedSale: assignedSale || "admin",
          tier: tier || "STANDARD",
          status: status || "ACTIVE",
          notes: notes || null,
        },
      });
    } catch (dbErr) {
      // In-memory fallback
      createdCustomer = addMockCustomer({
        businessName,
        contactPerson,
        phone,
        email,
        address,
        city: city || "Houston",
        state: state || "TX",
        zipCode: zipCode || "77036",
        birthday,
        assignedSale,
        tier,
        status,
        notes,
      });
    }

    return NextResponse.json({
      success: true,
      customer: createdCustomer,
    });
  } catch (error: any) {
    console.error("[POST /api/customers] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

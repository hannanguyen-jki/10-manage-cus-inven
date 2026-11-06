import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMockCustomerById,
  updateMockCustomer,
  MockCustomer,
} from "@/lib/mock-crm-data";
import { summarizeOrders } from "@/lib/payments";
import { getQuotesList } from "@/lib/quotesData";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing Customer ID" },
        { status: 400 }
      );
    }

    let customerData: any = null;

    try {
      // 1. Query details from PostgreSQL via Prisma
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
      // DB query offline, checking mock store
    }

    // 2. Fallback if DB is empty or offline
    if (!customerData) {
      const mockCus = getMockCustomerById(id);
      if (mockCus) {
        const totalSpent = mockCus.totalSpent !== undefined ? mockCus.totalSpent : (mockCus.orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = mockCus.totalPaid !== undefined ? mockCus.totalPaid : (mockCus.orders || []).reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const debtAmount = mockCus.debtAmount !== undefined ? mockCus.debtAmount : Math.max(0, totalSpent - totalPaid);

        customerData = {
          ...mockCus,
          totalSpent,
          totalPaid,
          debtAmount,
          orderCount: mockCus.orderCount !== undefined ? mockCus.orderCount : (mockCus.orders || []).length,
          lastOrderDate: mockCus.lastOrderDate || (mockCus.orders && mockCus.orders[0] ? mockCus.orders[0].createdAt : null),
          lastContactDate: mockCus.lastContactDate || (mockCus.smsLogs && mockCus.smsLogs[0] ? mockCus.smsLogs[0].createdAt : null),
        };
      }
    }

    if (!customerData) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Include quotes created in this app for the customer (not always stored on the customer record)
    try {
      const known = new Set((customerData.quotes || []).map((q: any) => q.id));
      const extra = (await getQuotesList())
        .filter((q) => q.customerId === id && !known.has(q.id))
        .map((q) => ({ id: q.id, quoteNumber: q.quoteNumber, status: q.status, createdAt: q.createdAt }));
      customerData.quotes = [...extra, ...(customerData.quotes || [])];
    } catch {
      // quotes are optional here
    }

    return NextResponse.json({
      success: true,
      customer: { ...customerData, ...summarizeOrders(customerData.orders || []) },
    });
  } catch (error: any) {
    console.error(`[GET /api/customers/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve customer details" },
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
      updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          businessName,
          contactPerson,
          phone,
          email,
          address,
          city,
          state,
          zipCode,
          birthday: birthday ? new Date(birthday) : null,
          assignedSale,
          tier,
          status,
          notes,
        },
      });
    } catch (dbErr) {
      // In-memory fallback
      updatedCustomer = updateMockCustomer(id, {
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
      });
    }

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error: any) {
    console.error(`[PUT /api/customers/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}

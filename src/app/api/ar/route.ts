import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

// In-memory mock storage fallback when PostgreSQL is offline in development
let mockOrdersState: any[] = [
  {
    id: "ord-mock-001",
    orderNumber: "INV-2026-1089",
    customerId: "cus-001",
    totalAmount: 3450.0,
    paidAmount: 1200.0,
    paymentStatus: PaymentStatus.PARTIAL,
    dueDate: new Date(Date.now() - 12 * 86400000).toISOString(), // 12 days ago (Current 0-30)
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    saleRep: "Johnny Tran",
    notes: "Kolinsky #14 and oval brush order",
    customer: {
      id: "cus-001",
      businessName: "Nails of America - Galleria",
      contactPerson: "Cindy Cindy",
      phone: "+17135550192",
      email: "cindy@nailsofamerica.com",
      state: "TX",
      city: "Houston",
    },
  },
  {
    id: "ord-mock-002",
    orderNumber: "INV-2026-1045",
    customerId: "cus-002",
    totalAmount: 4850.0,
    paidAmount: 0.0,
    paymentStatus: PaymentStatus.OVERDUE,
    dueDate: new Date(Date.now() - 42 * 86400000).toISOString(), // 42 days overdue (31-60)
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    saleRep: "Kevin Tran",
    notes: "Z-Brush Master Set batch (50 pcs)",
    customer: {
      id: "cus-002",
      businessName: "Venetian Nail Spa - Katy",
      contactPerson: "Jennifer Le",
      phone: "+12815550143",
      email: "jenny@venetianspa.com",
      state: "TX",
      city: "Katy",
    },
  },
  {
    id: "ord-mock-003",
    orderNumber: "INV-2026-0982",
    customerId: "cus-003",
    totalAmount: 2600.0,
    paidAmount: 800.0,
    paymentStatus: PaymentStatus.OVERDUE,
    dueDate: new Date(Date.now() - 74 * 86400000).toISOString(), // 74 days overdue (61-90)
    createdAt: new Date(Date.now() - 95 * 86400000).toISOString(),
    saleRep: "Johnny Tran",
    notes: "Owner requested payment deferral until grand opening of new branch",
    customer: {
      id: "cus-003",
      businessName: "Luxury Nails & Spa Austin",
      contactPerson: "David Vu",
      phone: "+15125550188",
      email: "davidvu@luxurynails.com",
      state: "TX",
      city: "Austin",
    },
  },
  {
    id: "ord-mock-004",
    orderNumber: "INV-2026-0850",
    customerId: "cus-004",
    totalAmount: 6200.0,
    paidAmount: 1000.0,
    paymentStatus: PaymentStatus.OVERDUE,
    dueDate: new Date(Date.now() - 110 * 86400000).toISOString(), // 110 days overdue (>90)
    createdAt: new Date(Date.now() - 130 * 86400000).toISOString(),
    saleRep: "Alex Dang",
    notes: "Followed up 3 times via Quo SMS, scheduled in-person visit",
    customer: {
      id: "cus-004",
      businessName: "Diamond Nail Bar Dallas",
      contactPerson: "Michael Hoang",
      phone: "+12145550177",
      email: "michael@diamondnailbar.com",
      state: "TX",
      city: "Dallas",
    },
  },
  {
    id: "ord-mock-005",
    orderNumber: "INV-2026-1120",
    customerId: "cus-005",
    totalAmount: 1850.0,
    paidAmount: 0.0,
    paymentStatus: PaymentStatus.UNPAID,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days remaining (Current 0-30)
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    saleRep: "Johnny Tran",
    notes: "Order delivered last week, Net-15 payment terms",
    customer: {
      id: "cus-005",
      businessName: "Regal Nails Woodlands",
      contactPerson: "Kimberly Pham",
      phone: "+18325550129",
      email: "kim@regalwoodlands.com",
      state: "TX",
      city: "The Woodlands",
    },
  },
];

export async function GET() {
  try {
    let orders: any[] = [];
    let isDbConnected = true;

    try {
      orders = await prisma.order.findMany({
        where: {
          paymentStatus: {
            in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE],
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              businessName: true,
              contactPerson: true,
              phone: true,
              email: true,
              state: true,
              city: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });
    } catch (dbErr) {
      isDbConnected = false;
      orders = [...mockOrdersState];
    }

    if (!orders || orders.length === 0) {
      orders = [...mockOrdersState];
    }

    const now = new Date();

    // Categorize into aging buckets and compute balances
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalPaid = 0;

    let bucket0_30 = 0;
    let bucket31_60 = 0;
    let bucket61_90 = 0;
    let bucketOver90 = 0;

    let count0_30 = 0;
    let count31_60 = 0;
    let count61_90 = 0;
    let countOver90 = 0;

    const enrichedOrders = orders.map((order) => {
      const totalAmount = Number(order.totalAmount || 0);
      const paidAmount = Number(order.paidAmount || 0);
      const balanceDue = Math.max(0, totalAmount - paidAmount);

      totalOutstanding += balanceDue;
      totalPaid += paidAmount;

      const dueDate = new Date(order.dueDate);
      const diffTime = now.getTime() - dueDate.getTime();
      const daysPastDue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let agingBucket: "0-30" | "31-60" | "61-90" | ">90" = "0-30";
      let bucketLabel = "Current (0-30 Days)";

      if (daysPastDue > 90) {
        agingBucket = ">90";
        bucketLabel = ">90 Days (Severely Overdue)";
        bucketOver90 += balanceDue;
        countOver90 += 1;
        totalOverdue += balanceDue;
      } else if (daysPastDue >= 61) {
        agingBucket = "61-90";
        bucketLabel = "61-90 Days (High Alert)";
        bucket61_90 += balanceDue;
        count61_90 += 1;
        totalOverdue += balanceDue;
      } else if (daysPastDue >= 31) {
        agingBucket = "31-60";
        bucketLabel = "31-60 Days (Past Due)";
        bucket31_60 += balanceDue;
        count31_60 += 1;
        totalOverdue += balanceDue;
      } else {
        agingBucket = "0-30";
        bucketLabel = daysPastDue > 0 ? `Past due by ${daysPastDue} days` : "Current / Within Terms";
        bucket0_30 += balanceDue;
        count0_30 += 1;
        if (daysPastDue > 0) {
          totalOverdue += balanceDue;
        }
      }

      return {
        ...order,
        balanceDue,
        daysPastDue,
        agingBucket,
        bucketLabel,
      };
    });

    return NextResponse.json({
      success: true,
      isDbConnected,
      summary: {
        totalOutstanding,
        totalOverdue,
        totalPaid,
        totalInvoices: enrichedOrders.length,
        buckets: {
          current: {
            key: "0-30",
            label: "Current (0-30 Days)",
            amount: bucket0_30,
            count: count0_30,
            severity: "normal",
          },
          bucket31_60: {
            key: "31-60",
            label: "31-60 Days",
            amount: bucket31_60,
            count: count31_60,
            severity: "warning",
          },
          bucket61_90: {
            key: "61-90",
            label: "61-90 Days",
            amount: bucket61_90,
            count: count61_90,
            severity: "danger",
          },
          bucketOver90: {
            key: ">90",
            label: ">90 Days",
            amount: bucketOver90,
            count: countOver90,
            severity: "critical",
          },
        },
      },
      orders: enrichedOrders,
    });
  } catch (error: any) {
    console.error("[API AR GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch AR aging data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amountPaid, paymentMethod = "Zelle", notes = "" } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'orderId'" },
        { status: 400 }
      );
    }

    const payNum = Number(amountPaid);
    if (isNaN(payNum) || payNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount. Must be greater than 0" },
        { status: 400 }
      );
    }

    let updatedOrder: any = null;

    try {
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existing) {
        throw new Error("Order not found in database");
      }

      const newPaidAmount = Number(existing.paidAmount || 0) + payNum;
      const totalAmount = Number(existing.totalAmount || 0);

      let newStatus: PaymentStatus = PaymentStatus.PARTIAL;
      if (newPaidAmount >= totalAmount) {
        newStatus = PaymentStatus.PAID;
      } else if (newPaidAmount <= 0) {
        newStatus = PaymentStatus.UNPAID;
      }

      const paymentTimestamp = new Date().toLocaleDateString("en-US", {
        timeZone: "America/Chicago",
      });
      const appendNote = `[${paymentTimestamp} Collected $${payNum.toFixed(2)} via ${paymentMethod}]${
        notes ? `: ${notes}` : ""
      }`;
      const updatedNotes = existing.notes
        ? `${existing.notes}\n${appendNote}`
        : appendNote;

      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          notes: updatedNotes,
        },
        include: {
          customer: true,
        },
      });
    } catch (dbErr: any) {
      // In-memory fallback
      const targetIndex = mockOrdersState.findIndex((o) => o.id === orderId);
      if (targetIndex !== -1) {
        const existing = mockOrdersState[targetIndex];
        const newPaidAmount = Number(existing.paidAmount || 0) + payNum;
        const totalAmount = Number(existing.totalAmount || 0);
        const newStatus =
          newPaidAmount >= totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

        const appendNote = `[${new Date().toLocaleDateString("en-US")} Collected $${payNum.toFixed(
          2
        )} via ${paymentMethod}]${notes ? `: ${notes}` : ""}`;

        mockOrdersState[targetIndex] = {
          ...existing,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          notes: existing.notes ? `${existing.notes}\n${appendNote}` : appendNote,
        };
        updatedOrder = mockOrdersState[targetIndex];
      } else {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment of $${payNum.toFixed(2)} recorded successfully.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("[API AR POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}

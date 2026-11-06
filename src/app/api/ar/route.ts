import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import rawCustomers from "../../../../data/customers_extracted.json";

// Initialize mock orders state directly from authentic customers extracted from sheet
const initialOrders: any[] = [];
(rawCustomers as any[]).forEach((c) => {
  if (c.orders && c.orders.length > 0) {
    c.orders.forEach((o: any) => {
      if (o.totalAmount > o.paidAmount || o.paymentStatus !== "PAID") {
        initialOrders.push({
          ...o,
          customerId: c.id,
          customer: {
            id: c.id,
            businessName: c.businessName,
            contactPerson: c.contactPerson,
            phone: c.phone,
            email: c.email,
            state: c.state,
            city: c.city,
          },
        });
      }
    });
  }
});

let mockOrdersState: any[] = initialOrders;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterBucket = searchParams.get("bucket"); // "all", "0-30", "31-60", "61-90", "90+"
    const search = searchParams.get("search")?.toLowerCase().trim();

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
      const balance = Math.max(0, totalAmount - paidAmount);

      totalOutstanding += balance;
      totalPaid += paidAmount;

      const due = new Date(order.dueDate || order.createdAt);
      const diffTime = now.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let agingBucket = "0-30";
      let isOverdue = false;

      if (diffDays <= 0) {
        agingBucket = "0-30";
      } else if (diffDays <= 30) {
        agingBucket = "0-30";
        isOverdue = true;
      } else if (diffDays <= 60) {
        agingBucket = "31-60";
        isOverdue = true;
      } else if (diffDays <= 90) {
        agingBucket = "61-90";
        isOverdue = true;
      } else {
        agingBucket = "90+";
        isOverdue = true;
      }

      if (isOverdue && balance > 0) {
        totalOverdue += balance;
      }

      if (agingBucket === "0-30") {
        bucket0_30 += balance;
        count0_30++;
      } else if (agingBucket === "31-60") {
        bucket31_60 += balance;
        count31_60++;
      } else if (agingBucket === "61-90") {
        bucket61_90 += balance;
        count61_90++;
      } else {
        bucketOver90 += balance;
        countOver90++;
      }

      return {
        ...order,
        totalAmount,
        paidAmount,
        balance,
        daysOverdue: Math.max(0, diffDays),
        agingBucket,
        isOverdue: isOverdue && balance > 0,
      };
    });

    // Apply filters
    let filteredOrders = enrichedOrders;

    if (filterBucket && filterBucket !== "all") {
      filteredOrders = filteredOrders.filter(
        (o) => o.agingBucket === filterBucket
      );
    }

    if (search) {
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customer?.businessName?.toLowerCase().includes(search) ||
          o.customer?.contactPerson?.toLowerCase().includes(search) ||
          o.customer?.phone?.includes(search)
      );
    }

    // Sort: highest balance first
    filteredOrders.sort((a, b) => b.balance - a.balance);

    return NextResponse.json({
      success: true,
      isDbConnected,
      summary: {
        totalOutstanding,
        totalOverdue,
        totalPaid,
        agingBuckets: {
          "0-30": { amount: bucket0_30, count: count0_30 },
          "31-60": { amount: bucket31_60, count: count31_60 },
          "61-90": { amount: bucket61_90, count: count61_90 },
          "90+": { amount: bucketOver90, count: countOver90 },
        },
      },
      orders: filteredOrders,
    });
  } catch (error: any) {
    console.error("[API AR GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch AR records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amountPaid, paymentMethod = "Zelle", notes = "" } = body;

    if (!orderId || amountPaid === undefined) {
      return NextResponse.json(
        { success: false, error: "Order ID and amountPaid are required" },
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

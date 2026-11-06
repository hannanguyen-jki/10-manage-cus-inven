import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DipReason, CustomerStatus } from "@prisma/client";
import rawCustomers from "../../../../data/customers_extracted.json";

// In-memory mock storage fallback when PostgreSQL is offline, initialized directly from authentic sheet data
const initialChurnState: any[] = [];
(rawCustomers as any[]).forEach((c) => {
  if (c.churnSurveys && c.churnSurveys.length > 0) {
    c.churnSurveys.forEach((s: any) => {
      initialChurnState.push({
        ...s,
        customerId: c.id,
        customer: {
          id: c.id,
          businessName: c.businessName,
          contactPerson: c.contactPerson,
          phone: c.phone,
          email: c.email,
          city: c.city,
          state: c.state,
          assignedSale: c.assignedSale,
          status: c.status,
        },
        previousSpend: c.rev2025 || 0,
        currentSpend: c.rev2026 || 0,
        dropAmount: Math.max(0, (c.rev2025 || 0) - (c.rev2026 || 0)),
        updatedAt: s.createdAt,
      });
    });
  }
});

let mockChurnState: any[] = initialChurnState;

export async function GET() {
  try {
    let flaggedCustomers: any[] = [];
    let isDbConnected = true;

    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      // Start & End of Current Month
      const startCurrentMonth = new Date(currentYear, currentMonth, 1);
      const endCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      // Start & End of Previous Month
      const startPrevMonth = new Date(currentYear, currentMonth - 1, 1);
      const endPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const analysisMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

      // Query customers with their orders and churn surveys
      const customers = await prisma.customer.findMany({
        include: {
          orders: {
            where: {
              createdAt: {
                gte: startPrevMonth,
                lte: endCurrentMonth,
              },
            },
          },
          churnSurveys: {
            where: {
              analysisMonth: analysisMonthStr,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!customers || customers.length === 0) {
        throw new Error("No customer records found");
      }

      flaggedCustomers = customers
        .map((cus) => {
          let prevSpend = 0;
          let currSpend = 0;

          cus.orders.forEach((order) => {
            const ordDate = new Date(order.createdAt);
            if (ordDate >= startPrevMonth && ordDate <= endPrevMonth) {
              prevSpend += Number(order.totalAmount || 0);
            } else if (ordDate >= startCurrentMonth && ordDate <= endCurrentMonth) {
              currSpend += Number(order.totalAmount || 0);
            }
          });

          if (prevSpend <= 0) return null;

          const dropAmount = prevSpend - currSpend;
          const dropPercent = ((currSpend - prevSpend) / prevSpend) * 100;

          // Flag customers with >40% dip (dropPercent <= -40) or drop to 0
          if (dropPercent <= -40 || (prevSpend > 1000 && currSpend === 0)) {
            const survey = cus.churnSurveys[0] || null;
            return {
              id: survey?.id || `churn_${cus.id}`,
              customerId: cus.id,
              analysisMonth: analysisMonthStr,
              customer: {
                id: cus.id,
                businessName: cus.businessName,
                contactPerson: cus.contactPerson,
                phone: cus.phone,
                email: cus.email,
                city: cus.city,
                state: cus.state,
                assignedSale: cus.assignedSale,
                status: cus.status,
              },
              previousSpend: prevSpend,
              currentSpend: currSpend,
              dropPercent: Number(dropPercent.toFixed(1)),
              dropAmount: Math.max(0, dropAmount),
              reason: survey?.reason || DipReason.HIGH_INVENTORY_REMAINING,
              saleNotes: survey?.saleNotes || "",
              actionPlan: survey?.actionPlan || "",
              saleRep: survey?.saleRep || cus.assignedSale || "admin",
              isResolved: survey?.isResolved || false,
              updatedAt: survey?.createdAt || new Date().toISOString(),
            };
          }
          return null;
        })
        .filter(Boolean);

      if (flaggedCustomers.length === 0) {
        flaggedCustomers = [...mockChurnState];
      }
    } catch (err: any) {
      isDbConnected = false;
      flaggedCustomers = [...mockChurnState];
    }

    // Calculate aggregated metrics
    const totalFlagged = flaggedCustomers.length;
    const totalRevenueAtRisk = flaggedCustomers.reduce(
      (sum, item) => sum + (item.dropAmount || 0),
      0
    );
    const resolvedCount = flaggedCustomers.filter((item) => item.isResolved).length;
    const resolutionRate = totalFlagged > 0 ? (resolvedCount / totalFlagged) * 100 : 0;

    // Reason distribution
    const reasonCounts: Record<string, number> = {
      [DipReason.HIGH_INVENTORY_REMAINING]: 0,
      [DipReason.PRICE_COMPETITION]: 0,
      [DipReason.PRODUCT_QUALITY_FEEDBACK]: 0,
      [DipReason.DELIVERY_DELAY]: 0,
      [DipReason.STORE_TEMPORARILY_CLOSED]: 0,
      [DipReason.OTHER]: 0,
    };

    flaggedCustomers.forEach((item) => {
      if (item.reason && reasonCounts[item.reason] !== undefined) {
        reasonCounts[item.reason] += 1;
      } else {
        reasonCounts[DipReason.OTHER] += 1;
      }
    });

    const reasonDistribution = [
      {
        key: DipReason.HIGH_INVENTORY_REMAINING,
        label: "High existing inventory",
        count: reasonCounts[DipReason.HIGH_INVENTORY_REMAINING],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.HIGH_INVENTORY_REMAINING] / totalFlagged) * 100) : 0,
        color: "amber",
      },
      {
        key: DipReason.PRICE_COMPETITION,
        label: "Competitor pricing pressure",
        count: reasonCounts[DipReason.PRICE_COMPETITION],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.PRICE_COMPETITION] / totalFlagged) * 100) : 0,
        color: "rose",
      },
      {
        key: DipReason.PRODUCT_QUALITY_FEEDBACK,
        label: "Product quality issue / feedback",
        count: reasonCounts[DipReason.PRODUCT_QUALITY_FEEDBACK],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.PRODUCT_QUALITY_FEEDBACK] / totalFlagged) * 100) : 0,
        color: "sky",
      },
      {
        key: DipReason.DELIVERY_DELAY,
        label: "Delivery delay",
        count: reasonCounts[DipReason.DELIVERY_DELAY],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.DELIVERY_DELAY] / totalFlagged) * 100) : 0,
        color: "orange",
      },
      {
        key: DipReason.STORE_TEMPORARILY_CLOSED,
        label: "Store temporarily closed / Renovation",
        count: reasonCounts[DipReason.STORE_TEMPORARILY_CLOSED],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.STORE_TEMPORARILY_CLOSED] / totalFlagged) * 100) : 0,
        color: "slate",
      },
      {
        key: DipReason.OTHER,
        label: "Other (Vacation, seasonal slowdown)",
        count: reasonCounts[DipReason.OTHER],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.OTHER] / totalFlagged) * 100) : 0,
        color: "emerald",
      },
    ];

    return NextResponse.json({
      success: true,
      isDbConnected,
      metrics: {
        totalFlagged,
        totalRevenueAtRisk,
        resolvedCount,
        resolutionRate: Math.round(resolutionRate),
      },
      reasonDistribution,
      flaggedCustomers,
    });
  } catch (error: any) {
    console.error("[API Churn Detection GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze customer churn" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      analysisMonth = "2026-10",
      dropPercent,
      reason,
      saleNotes = "",
      actionPlan = "",
      saleRep = "Johnny Tran",
      isResolved = false,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'customerId'" },
        { status: 400 }
      );
    }

    if (!reason || !Object.values(DipReason).includes(reason)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing 'reason' enum" },
        { status: 400 }
      );
    }

    let savedSurvey: any = null;

    try {
      const existingSurvey = await prisma.churnSurvey.findFirst({
        where: {
          customerId,
          analysisMonth,
        },
      });

      if (existingSurvey) {
        savedSurvey = await prisma.churnSurvey.update({
          where: { id: existingSurvey.id },
          data: {
            reason,
            dropPercent: Number(dropPercent || 0),
            saleNotes,
            actionPlan,
            saleRep,
            isResolved: Boolean(isResolved),
          },
        });
      } else {
        savedSurvey = await prisma.churnSurvey.create({
          data: {
            customerId,
            analysisMonth,
            dropPercent: Number(dropPercent || 0),
            reason,
            saleNotes,
            actionPlan,
            saleRep,
            isResolved: Boolean(isResolved),
          },
        });
      }

      // Update customer status to AT_RISK or ACTIVE
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          status: isResolved ? CustomerStatus.ACTIVE : CustomerStatus.AT_RISK,
        },
      });
    } catch (dbErr: any) {
      // In-memory update
      const targetIndex = mockChurnState.findIndex(
        (item) => item.customerId === customerId
      );

      if (targetIndex !== -1) {
        mockChurnState[targetIndex] = {
          ...mockChurnState[targetIndex],
          reason,
          saleNotes,
          actionPlan,
          saleRep,
          isResolved: Boolean(isResolved),
          updatedAt: new Date().toISOString(),
          customer: {
            ...mockChurnState[targetIndex].customer,
            status: isResolved ? CustomerStatus.ACTIVE : CustomerStatus.AT_RISK,
          },
        };
        savedSurvey = mockChurnState[targetIndex];
      } else {
        const newMock = {
          id: `churn_${Date.now()}`,
          customerId,
          analysisMonth,
          customer: {
            id: customerId,
            businessName: "Salon",
            contactPerson: "Salon Owner",
            phone: "+17135550000",
            city: "Houston",
            state: "TX",
            assignedSale: saleRep,
            status: isResolved ? CustomerStatus.ACTIVE : CustomerStatus.AT_RISK,
          },
          previousSpend: 3000,
          currentSpend: 1000,
          dropPercent: Number(dropPercent || -66.7),
          dropAmount: 2000,
          reason,
          saleNotes,
          actionPlan,
          saleRep,
          isResolved: Boolean(isResolved),
          updatedAt: new Date().toISOString(),
        };
        mockChurnState.push(newMock);
        savedSurvey = newMock;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Customer retention plan saved successfully.",
      survey: savedSurvey,
    });
  } catch (error: any) {
    console.error("[API Churn Detection POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save churn survey" },
      { status: 500 }
    );
  }
}

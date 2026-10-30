import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DipReason, CustomerStatus } from "@prisma/client";

// In-memory mock storage fallback when PostgreSQL is offline in development
let mockChurnState: any[] = [
  {
    id: "churn-mock-001",
    customerId: "cus-002",
    analysisMonth: "2026-10",
    customer: {
      id: "cus-002",
      businessName: "Venetian Nail Spa - Katy",
      contactPerson: "Jennifer Lê",
      phone: "+12815550143",
      email: "jenny@venetianspa.com",
      city: "Katy",
      state: "TX",
      assignedSale: "Kevin Trần",
      status: CustomerStatus.AT_RISK,
    },
    previousSpend: 5400.0,
    currentSpend: 1200.0,
    dropPercent: -77.8,
    dropAmount: 4200.0,
    reason: DipReason.HIGH_INVENTORY_REMAINING,
    saleNotes: "Chủ salon chia sẻ: Lô cọ Kolinsky 60 cây tháng trước thợ dùng bền, hiện vẫn còn tồn kho khoảng 25 cây chưa khui.",
    actionPlan: "Tạm dừng chào mua cọ Kolinsky, chuyển sang tư vấn dòng phụ trợ: Nước rửa cọ Brush Cleaner chuyên dụng và Liquid Monomer.",
    saleRep: "Kevin Trần",
    isResolved: false,
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "churn-mock-002",
    customerId: "cus-006",
    analysisMonth: "2026-10",
    customer: {
      id: "cus-006",
      businessName: "Milano Nail Spa Houston Heights",
      contactPerson: "Tony Hoàng",
      phone: "+17135550133",
      email: "tony@milanonails.com",
      city: "Houston",
      state: "TX",
      assignedSale: "Sơn Nguyễn",
      status: CustomerStatus.AT_RISK,
    },
    previousSpend: 4250.0,
    currentSpend: 0.0,
    dropPercent: -100.0,
    dropAmount: 4250.0,
    reason: DipReason.PRICE_COMPETITION,
    saleNotes: "Bị đối thủ địa phương chào dòng cọ nhái với giá thấp hơn 15%. Tiệm đang dùng thử hàng đối thủ.",
    actionPlan: "Sơn Nguyễn đã gửi tin nhắn Quo SMS và mang trực tiếp set cọ Z-Brush Master tới salon demo độ bền lông cọ thật; áp dụng chính sách tặng kèm 5 cây cọ khi đặt sỉ 30 cây.",
    saleRep: "Sơn Nguyễn",
    isResolved: false,
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "churn-mock-003",
    customerId: "cus-007",
    analysisMonth: "2026-10",
    customer: {
      id: "cus-007",
      businessName: "Nails of America - Sugar Land",
      contactPerson: "Lisa Trần",
      phone: "+12815550181",
      email: "lisa@noasugarland.com",
      city: "Sugar Land",
      state: "TX",
      assignedSale: "Sơn Nguyễn",
      status: CustomerStatus.AT_RISK,
    },
    previousSpend: 3800.0,
    currentSpend: 1450.0,
    dropPercent: -61.8,
    dropAmount: 2350.0,
    reason: DipReason.PRODUCT_QUALITY_FEEDBACK,
    saleNotes: "Hai thợ bột kỳ cựu phản ánh cán cọ đợt trước hơi nhẹ so với thói quen cầm tay, lông cọ hơi cứng hơn thông thường.",
    actionPlan: "Đã đổi miễn phí 5 cây cọ dòng lông siêu mềm Z-Brush Series II, thợ đã hài lòng. Tiệm chuẩn bị lên đơn bổ sung vào tuần tới.",
    saleRep: "Sơn Nguyễn",
    isResolved: true,
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "churn-mock-004",
    customerId: "cus-008",
    analysisMonth: "2026-10",
    customer: {
      id: "cus-008",
      businessName: "Diamond Nail Bar Dallas",
      contactPerson: "Michael Hoàng",
      phone: "+12145550177",
      email: "michael@diamondnailbar.com",
      city: "Dallas",
      state: "TX",
      assignedSale: "Alex Đặng",
      status: CustomerStatus.AT_RISK,
    },
    previousSpend: 3100.0,
    currentSpend: 0.0,
    dropPercent: -100.0,
    dropAmount: 3100.0,
    reason: DipReason.STORE_TEMPORARILY_CLOSED,
    saleNotes: "Tiệm đang đóng cửa sửa chữa và tân trang lại sàn và bàn nail trong 3 tuần.",
    actionPlan: "Đặt lịch hẹn chúc mừng Grand Reopening vào ngày 05/11 với gói ưu đãi quà tặng cho 20 thợ nail của tiệm.",
    saleRep: "Alex Đặng",
    isResolved: false,
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "churn-mock-005",
    customerId: "cus-009",
    analysisMonth: "2026-10",
    customer: {
      id: "cus-009",
      businessName: "Queen Nails Austin Downtown",
      contactPerson: "Amanda Võ",
      phone: "+15125550199",
      email: "amanda@queennails.com",
      city: "Austin",
      state: "TX",
      assignedSale: "Kevin Trần",
      status: CustomerStatus.ACTIVE,
    },
    previousSpend: 2900.0,
    currentSpend: 1300.0,
    dropPercent: -55.2,
    dropAmount: 1600.0,
    reason: DipReason.OTHER,
    saleNotes: "Chủ salon về thăm gia đình ở Việt Nam 4 tuần, quản lý tạm thời chỉ nhập bổ sung đồ lặt vặt.",
    actionPlan: "Đã gửi SMS qua Quo chào mừng chủ tiệm quay lại Mỹ, chuẩn bị đơn hàng đắp bột mùa lễ hội cuối năm.",
    saleRep: "Kevin Trần",
    isResolved: true,
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

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
        label: "Tồn kho còn nhiều (High Inventory)",
        count: reasonCounts[DipReason.HIGH_INVENTORY_REMAINING],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.HIGH_INVENTORY_REMAINING] / totalFlagged) * 100) : 0,
        color: "amber",
      },
      {
        key: DipReason.PRICE_COMPETITION,
        label: "Cạnh tranh giá đối thủ (Price Competition)",
        count: reasonCounts[DipReason.PRICE_COMPETITION],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.PRICE_COMPETITION] / totalFlagged) * 100) : 0,
        color: "rose",
      },
      {
        key: DipReason.PRODUCT_QUALITY_FEEDBACK,
        label: "Phản hồi chất lượng sản phẩm (Quality Feedback)",
        count: reasonCounts[DipReason.PRODUCT_QUALITY_FEEDBACK],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.PRODUCT_QUALITY_FEEDBACK] / totalFlagged) * 100) : 0,
        color: "sky",
      },
      {
        key: DipReason.DELIVERY_DELAY,
        label: "Chậm trễ giao hàng (Delivery Delay)",
        count: reasonCounts[DipReason.DELIVERY_DELAY],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.DELIVERY_DELAY] / totalFlagged) * 100) : 0,
        color: "orange",
      },
      {
        key: DipReason.STORE_TEMPORARILY_CLOSED,
        label: "Tiệm tạm đóng cửa / Sửa tiệm (Store Closed)",
        count: reasonCounts[DipReason.STORE_TEMPORARILY_CLOSED],
        percent: totalFlagged ? Math.round((reasonCounts[DipReason.STORE_TEMPORARILY_CLOSED] / totalFlagged) * 100) : 0,
        color: "slate",
      },
      {
        key: DipReason.OTHER,
        label: "Lý do khác (Về VN, đổi quản lý...)",
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
      saleRep = "Sơn Nguyễn",
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
            contactPerson: "Chủ Salon",
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
      message: "Kế hoạch giữ chân khách hàng đã được lưu thành công.",
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

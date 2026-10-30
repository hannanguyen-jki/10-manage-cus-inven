import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMockLeads,
  addMockLead,
  updateMockLead,
  addMockCustomer,
  MockLead,
} from "@/lib/mock-crm-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const status = searchParams.get("status");
    const state = searchParams.get("state");
    const minScore = searchParams.get("minScore");

    let leadsData: any[] = [];

    try {
      // 1. Thử truy vấn Prisma
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { salonName: { contains: search, mode: "insensitive" } },
          { ownerName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status && status !== "ALL") {
        whereClause.status = status;
      }

      if (state && state !== "ALL") {
        whereClause.state = state;
      }

      if (minScore) {
        whereClause.icpScore = { gte: parseInt(minScore, 10) };
      }

      const dbLeads = await prisma.b2BLead.findMany({
        where: whereClause,
        orderBy: [{ icpScore: "desc" }, { createdAt: "desc" }],
      });

      if (dbLeads && dbLeads.length > 0) {
        leadsData = dbLeads;
      }
    } catch (dbErr) {
      console.warn("[Leads API GET] DB offline/empty, using mock store:", dbErr);
    }

    // 2. Fallback mock store
    if (leadsData.length === 0) {
      let filtered = [...getMockLeads()];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.salonName.toLowerCase().includes(s) ||
            (l.ownerName && l.ownerName.toLowerCase().includes(s)) ||
            l.phone.toLowerCase().includes(s) ||
            (l.city && l.city.toLowerCase().includes(s))
        );
      }

      if (status && status !== "ALL") {
        filtered = filtered.filter((l) => l.status === status);
      }

      if (state && state !== "ALL") {
        filtered = filtered.filter((l) => l.state === state);
      }

      if (minScore) {
        const min = parseInt(minScore, 10);
        filtered = filtered.filter((l) => l.icpScore >= min);
      }

      leadsData = filtered.sort((a, b) => b.icpScore - a.icpScore);
    }

    return NextResponse.json({
      success: true,
      leads: leadsData,
      total: leadsData.length,
    });
  } catch (error: any) {
    console.error("[GET /api/leads] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy danh sách Leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      salonName,
      ownerName,
      phone,
      city = "Houston",
      state = "TX",
      address,
      googleReviewCount = 0,
      rating = 4.5,
      icpScore = 75,
      personalizedHook,
      status = "NEW",
      assignedSale = "admin",
    } = body;

    if (!salonName || !phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Tên Salon và Số điện thoại Lead" },
        { status: 400 }
      );
    }

    let createdLead: any = null;

    try {
      createdLead = await prisma.b2BLead.create({
        data: {
          salonName,
          ownerName: ownerName || null,
          phone,
          city: city || null,
          state: state || "TX",
          address: address || null,
          googleReviewCount: Number(googleReviewCount) || 0,
          rating: Number(rating) || 0,
          icpScore: Number(icpScore) || 50,
          personalizedHook: personalizedHook || null,
          status,
          assignedSale: assignedSale || "admin",
        },
      });
    } catch (dbErr: any) {
      console.warn("[Leads API POST] DB write failed, saving to mock store:", dbErr.message);
      // Fallback mock store
      createdLead = addMockLead({
        salonName,
        ownerName,
        phone,
        city,
        state,
        address,
        googleReviewCount: Number(googleReviewCount) || 0,
        rating: Number(rating) || 0,
        icpScore: Number(icpScore) || 50,
        personalizedHook,
        status: status as any,
        assignedSale,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thêm B2B Lead mới thành công",
      lead: createdLead,
    });
  } catch (error: any) {
    console.error("[POST /api/leads] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi thêm B2B Lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, action, assignedSale } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu Lead ID" },
        { status: 400 }
      );
    }

    // 1. Chuyển đổi Lead thành Customer chính thức trong DB
    if (action === "CONVERT_TO_CUSTOMER" || status === "CONVERTED") {
      let leadInfo: any = null;

      try {
        leadInfo = await prisma.b2BLead.findUnique({ where: { id } });
      } catch (err) {
        // fallback
        leadInfo = getMockLeads().find((l) => l.id === id);
      }

      if (!leadInfo) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy Lead để chuyển đổi" },
          { status: 404 }
        );
      }

      let createdCustomer: any = null;

      try {
        // Tạo customer trong Prisma
        createdCustomer = await prisma.customer.create({
          data: {
            businessName: leadInfo.salonName,
            contactPerson: leadInfo.ownerName || "Chủ Tiệm",
            phone: leadInfo.phone,
            city: leadInfo.city || "Houston",
            state: leadInfo.state || "TX",
            address: leadInfo.address || null,
            assignedSale: leadInfo.assignedSale || assignedSale || "admin",
            tier: "STANDARD",
            status: "ACTIVE",
            notes: `Chuyển đổi từ B2B Lead AI. ICP Score: ${leadInfo.icpScore}đ. Hook: ${leadInfo.personalizedHook || "N/A"}`,
          },
        });

        // Cập nhật trạng thái lead thành CONVERTED
        await prisma.b2BLead.update({
          where: { id },
          data: { status: "CONVERTED" },
        });
      } catch (dbErr: any) {
        console.warn("[Leads Convert] DB write failed, performing conversion in mock store:", dbErr.message);
        createdCustomer = addMockCustomer({
          businessName: leadInfo.salonName,
          contactPerson: leadInfo.ownerName || "Chủ Tiệm",
          phone: leadInfo.phone,
          city: leadInfo.city || "Houston",
          state: leadInfo.state || "TX",
          address: leadInfo.address || null,
          assignedSale: leadInfo.assignedSale || assignedSale || "admin",
          tier: "STANDARD",
          status: "ACTIVE",
          notes: `Chuyển đổi từ B2B Lead AI. ICP Score: ${leadInfo.icpScore}đ.`,
        });

        updateMockLead(id, { status: "CONVERTED" });
      }

      return NextResponse.json({
        success: true,
        message: `Đã chuyển đổi thành công Salon "${leadInfo.salonName}" thành Khách Hàng B2B!`,
        leadId: id,
        customerId: createdCustomer.id,
        customer: createdCustomer,
      });
    }

    // 2. Cập nhật trạng thái Lead bình thường (NEW, CONTACTED, QUALIFIED, REJECTED)
    let updatedLead: any = null;

    try {
      updatedLead = await prisma.b2BLead.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(assignedSale && { assignedSale }),
        },
      });
    } catch (dbErr: any) {
      console.warn("[Leads API PATCH] DB update failed, using mock store:", dbErr.message);
      updatedLead = updateMockLead(id, {
        ...(status && { status }),
        ...(assignedSale && { assignedSale }),
      });
    }

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Lead để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái Lead thành công",
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("[PATCH /api/leads] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi cập nhật Lead" },
      { status: 500 }
    );
  }
}

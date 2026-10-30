import { NextResponse } from "next/server";
import { getQuoteDetail, updateQuoteStatus, QuoteData } from "@/lib/quotesData";

export const dynamic = "force-dynamic";

// GET /api/quotes/[id] - Get detail of a quote
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const quote = await getQuoteDetail(id);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy báo giá" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error(`GET /api/quotes/${params.id} Error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi lấy chi tiết báo giá" },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes/[id] - Update quote status or notes
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const validStatuses: QuoteData["status"][] = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Trạng thái không hợp lệ (DRAFT, SENT, ACCEPTED, REJECTED)" },
        { status: 400 }
      );
    }

    const updated = await updateQuoteStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy báo giá để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái báo giá thành ${status}`,
      quote: updated,
    });
  } catch (error: any) {
    console.error(`PATCH /api/quotes/${params.id} Error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi cập nhật trạng thái báo giá" },
      { status: 500 }
    );
  }
}

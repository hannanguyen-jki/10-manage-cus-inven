import { NextRequest, NextResponse } from "next/server";
import { listPaymentOrders, setOrderPayStatus, OrderPayStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await listPaymentOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("[GET /api/payments]", error);
    return NextResponse.json({ success: false, error: "Không tải được danh sách thanh toán" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    const allowed: OrderPayStatus[] = ["PAID", "PARTIAL", "UNPAID"];
    if (!orderId || !allowed.includes(status)) {
      return NextResponse.json({ success: false, error: "Thiếu mã đơn hoặc trạng thái không hợp lệ" }, { status: 400 });
    }
    const updated = await setOrderPayStatus(orderId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/payments]", error);
    return NextResponse.json({ success: false, error: "Không cập nhật được trạng thái" }, { status: 500 });
  }
}

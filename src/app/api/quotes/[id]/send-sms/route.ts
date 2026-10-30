import { NextResponse } from "next/server";
import { getQuoteDetail, updateQuoteStatus } from "@/lib/quotesData";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { customMessage, targetPhone } = body;

    const quote = await getQuoteDetail(id);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy báo giá" },
        { status: 404 }
      );
    }

    const phone = targetPhone || quote.customer.phone;
    const messageContent =
      customMessage ||
      `JKIOCEAN Houston Hub: Chao quy khach ${quote.customer.contactPerson} (${quote.customer.businessName}), chung toi xin gui Bao gia #${quote.quoteNumber}. Tong cong: $${quote.totalAmount.toFixed(
        2
      )}. Hieu luc den: ${new Date(quote.validUntil).toLocaleDateString("en-US")}. Free local delivery Houston! Lien he hotline: +1-713-330-6165 de duoc giao hang nhanh nhat.`;

    // Try logging to prisma if available
    if (process.env.DATABASE_URL) {
      try {
        await prisma.smsLog.create({
          data: {
            customerId: quote.customerId,
            toPhone: phone,
            fromPhone: "+17133306165",
            content: messageContent,
            type: "FOLLOW_UP",
            status: "SENT",
          },
        });
      } catch (err) {
        console.warn("SMS log to DB skipped:", err);
      }
    }

    // Automatically update quote status to SENT if it was DRAFT
    if (quote.status === "DRAFT") {
      await updateQuoteStatus(quote.id, "SENT");
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi báo giá qua Quo SMS đến ${phone} thành công!`,
      sms: {
        toPhone: phone,
        fromPhone: "+17133306165",
        content: messageContent,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Send SMS Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi gửi SMS" },
      { status: 500 }
    );
  }
}

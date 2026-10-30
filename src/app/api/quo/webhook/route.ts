import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatUsPhone } from "@/lib/quo";
import { SmsType } from "@prisma/client";

interface QuoWebhookPayload {
  event?: string;
  type?: string;
  data?: {
    id?: string;
    from?: string;
    to?: string;
    body?: string;
    content?: string;
    createdAt?: string;
  };
  // Or direct payload
  id?: string;
  from?: string;
  to?: string;
  content?: string;
  body?: string;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody: QuoWebhookPayload = await req.json();

    // Extract fields from nested data or root
    const eventType = rawBody.event || rawBody.type || "message.received";
    const messageData = rawBody.data || rawBody;
    const providerId = messageData.id || `quo_in_${Date.now()}`;
    const rawFrom = messageData.from || "";
    const rawTo = messageData.to || process.env.QUO_PHONE_NUMBER || "+17133306165";
    const textContent = (messageData.content || messageData.body || "").trim();

    if (!rawFrom) {
      return NextResponse.json(
        { success: false, error: "Missing sender phone ('from')" },
        { status: 400 }
      );
    }

    const formattedFrom = formatUsPhone(rawFrom);
    const last10Digits = rawFrom.replace(/\D/g, "").slice(-10);

    // 1. Identify Customer by Phone Number
    let customer: any = null;
    try {
      if (last10Digits.length === 10) {
        customer = await prisma.customer.findFirst({
          where: {
            phone: {
              contains: last10Digits,
            },
          },
          select: {
            id: true,
            businessName: true,
            contactPerson: true,
            phone: true,
            tier: true,
            assignedSale: true,
          },
        });
      }
    } catch (err: any) {
      console.warn("[Quo Webhook] Customer lookup skipped:", err?.message);
    }

    // 2. Log Inbound SMS to SmsLog
    let logId = `sms_log_${Date.now()}`;
    try {
      const createdLog = await prisma.smsLog.create({
        data: {
          customerId: customer?.id || null,
          toPhone: formatUsPhone(rawTo),
          fromPhone: formattedFrom,
          content: textContent,
          type: SmsType.FOLLOW_UP,
          status: "RECEIVED",
          providerId,
        },
      });
      logId = createdLog.id;
    } catch (dbErr: any) {
      console.warn("[Quo Webhook] SmsLog DB insert skipped:", dbErr?.message);
    }

    // 3. Generate Suggested Smart Reply based on available stock and wholesale pricing
    let topProducts: Array<{ name: string; wholesalePrice: number; currentStock: number; sku: string }> = [];
    try {
      topProducts = await prisma.product.findMany({
        where: {
          currentStock: {
            gt: 0,
          },
        },
        orderBy: {
          currentStock: "desc",
        },
        take: 3,
        select: {
          name: true,
          wholesalePrice: true,
          currentStock: true,
          sku: true,
        },
      });
    } catch (prodErr: any) {
      console.warn("[Quo Webhook] Product lookup skipped:", prodErr?.message);
    }

    // Fallback default in-stock items if DB has no products
    if (!topProducts || topProducts.length === 0) {
      topProducts = [
        { name: "JKI Kolinsky Acrylic Brush #14", wholesalePrice: 28.5, currentStock: 150, sku: "JKI-BR-14" },
        { name: "JKI Kolinsky Oval Brush #16", wholesalePrice: 32.0, currentStock: 110, sku: "JKI-BR-16" },
        { name: "JKI Precision 3D Art Brush #8", wholesalePrice: 19.5, currentStock: 85, sku: "JKI-ART-08" },
      ];
    }

    const greetingName = customer?.contactPerson
      ? customer.contactPerson
      : customer?.businessName
      ? customer.businessName
      : "anh/chị";

    const lowerText = textContent.toLowerCase();
    let replyIntent = "general";

    if (lowerText.includes("giá") || lowerText.includes("price") || lowerText.includes("quote") || lowerText.includes("báo giá")) {
      replyIntent = "pricing";
    } else if (lowerText.includes("còn hàng") || lowerText.includes("stock") || lowerText.includes("brush") || lowerText.includes("cọ")) {
      replyIntent = "inventory";
    } else if (lowerText.includes("trả tiền") || lowerText.includes("chuyển khoản") || lowerText.includes("pay") || lowerText.includes("zelle")) {
      replyIntent = "payment";
    }

    const productBullets = topProducts
      .map(
        (p) =>
          `• ${p.name} (${p.sku}): $${p.wholesalePrice.toFixed(2)}/cây (Sẵn kho: ${p.currentStock} pcs)`
      )
      .join("\n");

    let smartReply = "";
    if (replyIntent === "pricing" || replyIntent === "inventory") {
      smartReply = `Dạ em chào ${greetingName}! Em là đại diện từ JKIOCEAN Houston.\nHiện tại kho bên em đang có sẵn các mẫu cọ bán chạy nhất với giá sỉ tốt cho salon:\n${productBullets}\nAnh/chị cần lấy mấy set để bên em giữ hàng và chuẩn bị xuất kho gửi UPS ngay hôm nay ạ?`;
    } else if (replyIntent === "payment") {
      smartReply = `Dạ em chào ${greetingName}! Dạ JKIOCEAN nhận thanh toán qua Zelle số +1(713) 330-6165 (Tên: JKIOCEAN LLC) hoặc Check. Khi gửi xong anh/chị nhắn giúp em biên nhận để kế toán gạch sổ công nợ ngay nhé. Em cảm ơn anh/chị nhiều!`;
    } else {
      smartReply = `Dạ em chào ${greetingName}! Em đã nhận được tin nhắn từ anh/chị qua hotline JKIOCEAN Houston (+1 713-330-6165). Anh/chị cần bên em hỗ trợ tư vấn dòng sản phẩm cọ đắp bột Kolinsky hay đặt thêm đơn hàng mới cho salon ạ?`;
    }

    return NextResponse.json({
      success: true,
      event: eventType,
      logId,
      customer: customer
        ? {
            id: customer.id,
            businessName: customer.businessName,
            contactPerson: customer.contactPerson,
            phone: customer.phone,
          }
        : null,
      incomingMessage: textContent,
      suggestedReply: smartReply,
    });
  } catch (error: any) {
    console.error("[API Quo Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

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
      : "valued customer";

    const lowerText = textContent.toLowerCase();
    let replyIntent = "general";

    if (
      lowerText.includes("price") ||
      lowerText.includes("quote") ||
      lowerText.includes("cost") ||
      lowerText.includes("rate") ||
      lowerText.includes("gia") ||
      lowerText.includes("bao gia")
    ) {
      replyIntent = "pricing";
    } else if (
      lowerText.includes("stock") ||
      lowerText.includes("inventory") ||
      lowerText.includes("brush") ||
      lowerText.includes("available") ||
      lowerText.includes("con hang") ||
      lowerText.includes("co")
    ) {
      replyIntent = "inventory";
    } else if (
      lowerText.includes("pay") ||
      lowerText.includes("payment") ||
      lowerText.includes("zelle") ||
      lowerText.includes("check") ||
      lowerText.includes("invoice") ||
      lowerText.includes("tra tien") ||
      lowerText.includes("chuyen khoan")
    ) {
      replyIntent = "payment";
    }

    const productBullets = topProducts
      .map(
        (p) =>
          `• ${p.name} (${p.sku}): $${p.wholesalePrice.toFixed(2)}/pc (In Stock: ${p.currentStock} pcs)`
      )
      .join("\n");

    let smartReply = "";
    if (replyIntent === "pricing" || replyIntent === "inventory") {
      smartReply = `Hi ${greetingName}! This is Johnny from JKIOCEAN Houston.\nWe currently have our top-selling professional brushes in stock with exclusive wholesale pricing for your salon:\n${productBullets}\nHow many sets would you like us to reserve and prepare for UPS dispatch today?`;
    } else if (replyIntent === "payment") {
      smartReply = `Hi ${greetingName}! JKIOCEAN accepts payments via Zelle to +1(713) 330-6165 (JKIOCEAN LLC) or Company Check. Please reply with your transaction reference once sent so our accounting team can update your ledger immediately. Thank you!`;
    } else {
      smartReply = `Hi ${greetingName}! We received your message via JKIOCEAN Houston hotline (+1 713-330-6165). How can we assist you today with Kolinsky acrylic brushes or placing a new wholesale order for your salon?`;
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

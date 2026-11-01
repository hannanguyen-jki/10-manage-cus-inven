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
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    const phone = targetPhone || quote.customer.phone;
    const messageContent =
      customMessage ||
      `JKIOCEAN Houston Hub: Hi ${quote.customer.contactPerson} (${quote.customer.businessName}), here is your official wholesale quote #${quote.quoteNumber}. Total: $${quote.totalAmount.toFixed(
        2
      )}. Valid until: ${new Date(quote.validUntil).toLocaleDateString("en-US")}. Free local Houston delivery included. Call us at +1-713-330-6165 to confirm your order.`;

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
      message: `Quote sent successfully via Quo SMS to ${phone}!`,
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
      { success: false, error: error?.message || "Error sending SMS" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendQuoSms } from "@/lib/quo";
import { SmsType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, content, type, customerId } = body;

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid recipient phone number ('to')" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or empty SMS message content ('content')" },
        { status: 400 }
      );
    }

    // Validate sms type enum
    let validSmsType: SmsType = SmsType.FOLLOW_UP;
    if (type && Object.values(SmsType).includes(type)) {
      validSmsType = type as SmsType;
    }

    const result = await sendQuoSms({
      to: to.trim(),
      content: content.trim(),
      type: validSmsType,
      customerId: customerId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch SMS" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: "SMS sent successfully via Quo gateway",
    });
  } catch (error: any) {
    console.error("[API Quo Send-SMS Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

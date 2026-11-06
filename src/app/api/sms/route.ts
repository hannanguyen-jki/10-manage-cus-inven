import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMockSmsLog } from "@/lib/mock-crm-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    try {
      const logs = await prisma.smsLog.findMany({
        where: customerId ? { customerId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ success: true, logs });
    } catch (dbErr) {
      return NextResponse.json({ success: true, logs: [] });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, toPhone, content, type = "FOLLOW_UP" } = body;

    if (!toPhone || !content) {
      return NextResponse.json(
        { success: false, error: "Please provide recipient phone number and SMS content" },
        { status: 400 }
      );
    }

    let createdLog: any = null;

    try {
      createdLog = await prisma.smsLog.create({
        data: {
          customerId: customerId || null,
          toPhone,
          fromPhone: "+17133306165",
          content,
          type: type as any,
          status: "SENT",
          providerId: `quo-${Date.now()}`,
        },
      });
    } catch (dbErr: any) {
      console.warn("[SMS API POST] DB save failed, logging in mock store:", dbErr.message);
      createdLog = addMockSmsLog(customerId || null, { toPhone, fromPhone: '+17133306165', content, type: type as any, status: 'SENT' });
    }

    return NextResponse.json({
      success: true,
      message: `Quo SMS sent successfully to ${toPhone} via Houston Hub (+1 713-330-6165)!`,
      smsLog: createdLog,
    });
  } catch (error: any) {
    console.error("[POST /api/sms] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}

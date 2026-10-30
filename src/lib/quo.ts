import { prisma } from "./prisma";
import { SmsType } from "@prisma/client";

export interface SendQuoSmsParams {
  to: string;
  content: string;
  type?: SmsType;
  customerId?: string;
}

export interface QuoSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Clean & normalize phone number to E.164 US format (+1XXXXXXXXXX)
 */
export function formatUsPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  if (phone.startsWith("+")) {
    return phone;
  }
  return `+1${digits}`;
}

/**
 * Sends an SMS message through the Quo (OpenPhone) REST API and logs it to Prisma smsLog.
 */
export async function sendQuoSms({
  to,
  content,
  type = SmsType.FOLLOW_UP,
  customerId,
}: SendQuoSmsParams): Promise<QuoSmsResponse> {
  const apiKey = process.env.QUO_API_KEY;
  const fromPhone = process.env.QUO_PHONE_NUMBER || "+17133306165";
  const formattedTo = formatUsPhone(to);

  let providerMessageId = `quo_msg_${Date.now()}`;
  let isSuccess = false;
  let errorMessage: string | undefined;

  try {
    // If API Key is configured and not in purely local demo mock mode
    if (apiKey && !apiKey.includes("demo_key")) {
      const response = await fetch("https://api.quo.com/v1/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromPhone,
          to: formattedTo,
          content,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || `Quo API responded with status ${response.status}`
        );
      }

      providerMessageId = data?.id || data?.data?.id || providerMessageId;
      isSuccess = true;
    } else {
      // In development / demo environment without live Quo credentials, simulate successful delivery
      console.log(`[Quo SMS Simulated] To: ${formattedTo} | Content: "${content}"`);
      providerMessageId = `sim_quo_${Date.now()}`;
      isSuccess = true;
    }
  } catch (err: any) {
    console.error("[Quo SMS Error]:", err?.message || err);
    isSuccess = false;
    errorMessage = err?.message || "Failed to send SMS via Quo gateway";
  }

  // Persist to Prisma smsLog with error resilience
  try {
    await prisma.smsLog.create({
      data: {
        customerId: customerId || null,
        toPhone: formattedTo,
        fromPhone,
        content,
        type,
        status: isSuccess ? "SENT" : "FAILED",
        providerId: providerMessageId,
      },
    });
  } catch (dbErr: any) {
    console.warn("[Quo SMS] DB logging skipped or failed:", dbErr?.message || dbErr);
  }

  if (isSuccess) {
    return {
      success: true,
      messageId: providerMessageId,
    };
  } else {
    return {
      success: false,
      error: errorMessage,
    };
  }
}

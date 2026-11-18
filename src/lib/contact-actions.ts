/**
 * Contact buttons for a customer ("Message via Quo" and "Email").
 *
 * PLACEHOLDERS: neither integration is connected yet, so both functions only tell the user that.
 * When the APIs are ready, put the real calls in here - the buttons on the customer list and the
 * customer page already call these functions and show the returned `message` in a toast.
 *   - Quo (OpenPhone) text: see src/app/api/quo/send-sms/route.ts and QUO_API_KEY in .env
 *   - Email: not built yet
 */
export interface ContactTarget {
  id: string;
  businessName: string;
  phone?: string | null;
  email?: string | null;
}

export interface ContactResult {
  ok: boolean;
  message: string;
}

export async function sendQuoMessage(target: ContactTarget): Promise<ContactResult> {
  // TODO: connect the Quo API here (send / open a text thread to target.phone).
  return { ok: false, message: `Quo messaging is not connected yet (${target.businessName}).` };
}

export async function sendEmail(target: ContactTarget): Promise<ContactResult> {
  // TODO: connect the email service here (send / compose an email to target.email).
  return { ok: false, message: `Email is not connected yet (${target.businessName}).` };
}

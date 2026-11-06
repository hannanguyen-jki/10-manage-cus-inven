"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Loader2, HandHeart, BellRing, Gift, Cake } from "lucide-react";
import { Modal, cn } from "@/components/ui";

export type SmsTemplate = "FOLLOW_UP" | "AR_REMINDER" | "PROMOTION" | "BIRTHDAY";

const TEMPLATES: { id: SmsTemplate; label: string; icon: any; build: (name: string, shop: string) => string }[] = [
  {
    id: "FOLLOW_UP",
    label: "Check in",
    icon: HandHeart,
    build: (n, s) =>
      `Hi ${n}, this is JKIOCEAN. How is the last order working out at ${s}? Text us anytime you need more brushes, tools or supplies!`,
  },
  {
    id: "AR_REMINDER",
    label: "Payment reminder",
    icon: BellRing,
    build: (n, s) =>
      `Hi ${n}, this is JKIOCEAN. ${s} has an order that is still unpaid. Could you please send payment by Zelle or check when you can? Thank you!`,
  },
  {
    id: "PROMOTION",
    label: "New arrivals",
    icon: Gift,
    build: (n, s) =>
      `Hi ${n}, new products just arrived at our Houston warehouse. We have a special offer for ${s}. Reply and we will send you a quote!`,
  },
  {
    id: "BIRTHDAY",
    label: "Birthday",
    icon: Cake,
    build: (n, s) => `Happy birthday ${n}! Wishing you great health and a busy year ahead at ${s}. – JKIOCEAN 🎉`,
  },
];

export default function SmsModal({
  open,
  onClose,
  customer,
  initialTemplate = "FOLLOW_UP",
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  customer: { id: string; businessName: string; contactPerson: string; phone: string } | null;
  initialTemplate?: SmsTemplate;
  onSent?: (ok: boolean, message: string) => void;
}) {
  const [type, setType] = useState<SmsTemplate>(initialTemplate);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && customer) {
      setType(initialTemplate);
      setContent(TEMPLATES.find((t) => t.id === initialTemplate)!.build(customer.contactPerson, customer.businessName));
    }
  }, [open, customer, initialTemplate]);

  const pick = (id: SmsTemplate) => {
    if (!customer) return;
    setType(id);
    setContent(TEMPLATES.find((t) => t.id === id)!.build(customer.contactPerson, customer.businessName));
  };

  const send = async () => {
    if (!customer || !content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, toPhone: customer.phone, content, type }),
      });
      const data = await res.json();
      onSent?.(!!data.success, data.success ? "Message sent" : data.error || "Could not send message");
      if (data.success) onClose();
    } catch {
      onSent?.(false, "Connection error, please try again");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send a text"
      icon={MessageSquare}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={send} disabled={sending || !content.trim()} className="btn-primary">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </>
      }
    >
      {customer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900 truncate">{customer.businessName}</p>
              <p className="text-xs text-ink-500">{customer.contactPerson}</p>
            </div>
            <span className="text-sm font-mono font-semibold text-brand-700">{customer.phone}</span>
          </div>

          <div>
            <p className="label">Template</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                const on = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pick(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all",
                      on ? "border-brand-400 bg-brand-50 text-brand-700 shadow-glow" : "border-ink-200 text-ink-600 hover:border-brand-200"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="label">Message</p>
            <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} className="input resize-none" />
            <p className="mt-1 text-right text-[11px] text-ink-400">{content.length} characters</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

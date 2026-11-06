"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Loader2, HandHeart, BellRing, Gift, Cake } from "lucide-react";
import { Modal, cn } from "@/components/ui";

export type SmsTemplate = "FOLLOW_UP" | "AR_REMINDER" | "PROMOTION" | "BIRTHDAY";

const TEMPLATES: { id: SmsTemplate; label: string; icon: any; build: (name: string, shop: string) => string }[] = [
  {
    id: "FOLLOW_UP",
    label: "Hỏi thăm",
    icon: HandHeart,
    build: (n, s) =>
      `JKIOCEAN thăm hỏi ${n}: Anh/chị dùng đợt hàng vừa rồi ở ${s} thế nào ạ? Khi cần thêm cọ, kềm hay phụ liệu cứ nhắn em nhé!`,
  },
  {
    id: "AR_REMINDER",
    label: "Nhắc thanh toán",
    icon: BellRing,
    build: (n, s) =>
      `JKIOCEAN xin chào ${n}: Tiệm ${s} còn đơn hàng chưa thanh toán. Nhờ anh/chị hỗ trợ thanh toán qua Zelle/Check giúp bên em nhé. Cảm ơn anh/chị!`,
  },
  {
    id: "PROMOTION",
    label: "Hàng mới",
    icon: Gift,
    build: (n, s) =>
      `JKIOCEAN: Xin chào ${n}, hàng mới vừa về kho Houston. Bên em gửi ưu đãi riêng cho ${s}, anh/chị nhắn lại để em gửi báo giá nhé!`,
  },
  {
    id: "BIRTHDAY",
    label: "Sinh nhật",
    icon: Cake,
    build: (n, s) => `JKIOCEAN chúc ${n} sinh nhật vui vẻ, nhiều sức khỏe và tiệm ${s} ngày càng đông khách! 🎉`,
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
      onSent?.(!!data.success, data.success ? "Đã gửi tin nhắn" : data.error || "Không gửi được tin nhắn");
      if (data.success) onClose();
    } catch {
      onSent?.(false, "Lỗi kết nối, thử lại sau");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gửi tin nhắn"
      icon={MessageSquare}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Hủy
          </button>
          <button onClick={send} disabled={sending || !content.trim()} className="btn-primary">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Gửi
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
            <p className="label">Chọn mẫu</p>
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
            <p className="label">Nội dung</p>
            <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} className="input resize-none" />
            <p className="mt-1 text-right text-[11px] text-ink-400">{content.length} ký tự</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

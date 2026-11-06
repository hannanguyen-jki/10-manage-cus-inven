"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserPen, Loader2, Save } from "lucide-react";
import { Modal, cn } from "@/components/ui";

export const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  ACTIVE: { label: "Active", cls: "text-emerald-700", dot: "bg-emerald-500" },
  AT_RISK: { label: "Needs follow-up", cls: "text-amber-700", dot: "bg-amber-500" },
  INACTIVE: { label: "Inactive", cls: "text-ink-500", dot: "bg-ink-300" },
};

const EMPTY = {
  businessName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "Houston",
  state: "TX",
  zipCode: "",
  birthday: "",
  assignedSale: "Johnny Tran",
  tier: "STANDARD",
  status: "ACTIVE",
  notes: "",
};

export type CustomerForm = typeof EMPTY;

export default function CustomerFormModal({
  open,
  onClose,
  initial,
  customerId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CustomerForm> | null;
  customerId?: string;
  onSaved?: (ok: boolean, message: string) => void;
}) {
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const editing = !!customerId;

  useEffect(() => {
    if (open) setForm({ ...EMPTY, ...(initial || {}) } as CustomerForm);
    // Only reset when the dialog opens, not on every parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof CustomerForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactPerson.trim() || !form.phone.trim()) {
      onSaved?.(false, "Shop name, contact person and phone are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/customers/${customerId}` : "/api/customers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      onSaved?.(!!data.success, data.success ? (editing ? "Changes saved" : "Customer added") : data.error || "Could not save");
      if (data.success) onClose();
    } catch {
      onSaved?.(false, "Connection error, please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit customer" : "Add customer"}
      icon={editing ? UserPen : UserPlus}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" form="customer-form" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </>
      }
    >
      <form id="customer-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Shop name *" className="sm:col-span-2">
            <input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. Glamour Nail Supply" />
          </Field>
          <Field label="Contact person *">
            <input className="input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Owner / manager" />
          </Field>
          <Field label="Phone *">
            <input className="input font-mono" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="1 713-330-6165" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Birthday">
            <input className="input" type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <input className="input uppercase" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
            </Field>
            <Field label="Zip">
              <input className="input" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Status">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STATUS_META).map(([k, m]) => (
              <button
                key={k}
                type="button"
                onClick={() => set("status", k)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-all",
                  form.status === k ? "border-brand-400 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600 hover:border-brand-200"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", m.dot)} />
                {m.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notes">
          <textarea rows={3} className="input resize-none" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

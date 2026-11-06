import { prisma } from "@/lib/prisma";
import { getMockCustomers } from "@/lib/mock-crm-data";

export type OrderPayStatus = "PAID" | "PARTIAL" | "UNPAID";
export type CustomerPayStatus = "PAID" | "OWING" | "NONE";

export function normalizeOrderStatus(s?: string | null): OrderPayStatus {
  if (s === "PAID") return "PAID";
  if (s === "PARTIAL") return "PARTIAL";
  return "UNPAID"; // UNPAID + OVERDUE
}

/** Payment summary for one customer, without any money figures. */
export function summarizeOrders(orders: any[] = []) {
  let paidOrders = 0;
  let unpaidOrders = 0;
  let oldestUnpaid: string | null = null;
  let lastOrderDate: string | null = null;

  for (const o of orders) {
    const st = normalizeOrderStatus(o.paymentStatus);
    const created = o.createdAt ? new Date(o.createdAt).toISOString() : null;
    if (created && (!lastOrderDate || created > lastOrderDate)) lastOrderDate = created;
    if (st === "PAID") paidOrders++;
    else {
      unpaidOrders++;
      if (created && (!oldestUnpaid || created < oldestUnpaid)) oldestUnpaid = created;
    }
  }

  const payStatus: CustomerPayStatus = orders.length === 0 ? "NONE" : unpaidOrders > 0 ? "OWING" : "PAID";
  return { paidOrders, unpaidOrders, payStatus, oldestUnpaid, lastOrderDate, orderCount: orders.length };
}

export interface PaymentOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderPayStatus;
  itemCount: number;
  customer: {
    id: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    city: string | null;
    state: string | null;
    tier: string;
  };
}

function toPaymentOrder(o: any, c: any): PaymentOrder {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: new Date(o.createdAt).toISOString(),
    status: normalizeOrderStatus(o.paymentStatus),
    itemCount: Array.isArray(o.items) ? o.items.length : o._count?.items ?? 0,
    customer: {
      id: c.id,
      businessName: c.businessName,
      contactPerson: c.contactPerson,
      phone: c.phone,
      city: c.city ?? null,
      state: c.state ?? null,
      tier: c.tier || "STANDARD",
    },
  };
}

/** All orders with customer info – from Postgres when available, otherwise the in-memory store. */
export async function listPaymentOrders(): Promise<PaymentOrder[]> {
  try {
    if (process.env.DATABASE_URL) {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      if (orders.length > 0) return orders.map((o) => toPaymentOrder(o, o.customer));
    }
  } catch {
    // fall through to in-memory data
  }

  const result: PaymentOrder[] = [];
  for (const c of getMockCustomers() as any[]) {
    for (const o of c.orders || []) result.push(toPaymentOrder(o, c));
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Set an order's payment status. PAID also settles the paid amount so totals stay consistent. */
export async function setOrderPayStatus(orderId: string, status: OrderPayStatus) {
  try {
    if (process.env.DATABASE_URL) {
      const existing = await prisma.order.findUnique({ where: { id: orderId } });
      if (existing) {
        const paidAmount =
          status === "PAID" ? existing.totalAmount : status === "UNPAID" ? 0 : existing.paidAmount;
        return await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: status, paidAmount },
        });
      }
    }
  } catch {
    // fall through to in-memory data
  }

  for (const c of getMockCustomers() as any[]) {
    const o = (c.orders || []).find((x: any) => x.id === orderId);
    if (o) {
      o.paymentStatus = status;
      if (status === "PAID") o.paidAmount = o.totalAmount;
      if (status === "UNPAID") o.paidAmount = 0;
      return o;
    }
  }
  return null;
}

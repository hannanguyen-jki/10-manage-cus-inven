import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockCustomers } from "@/lib/mock-crm-data";
import { summarizeOrders, normalizeOrderStatus } from "@/lib/payments";
import { getQuotesList } from "@/lib/quotesData";
import { listProducts } from "@/lib/products";
import { recencyStatus } from "@/lib/inactivity";

export const dynamic = "force-dynamic";

async function loadCustomers(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await prisma.customer.findMany({
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              paymentStatus: true,
              totalAmount: true,
              createdAt: true,
              items: {
                select: {
                  id: true,
                  quantity: true,
                  unitPrice: true,
                  product: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (rows.length > 0) return rows;
    }
  } catch {
    // fall back to in-memory data
  }
  return getMockCustomers() as any[];
}

export async function GET() {
  try {
    const customers = await loadCustomers();

    const tiers = { VIP: 0, WHOLESALE: 0, STANDARD: 0 };
    const statuses = { ACTIVE: 0, AT_RISK: 0, INACTIVE: 0 };
    const states: Record<string, number> = {};
    const orderStatus = { PAID: 0, PARTIAL: 0, UNPAID: 0 };
    let customersPaid = 0;
    let customersOwing = 0;
    let customersNoOrder = 0;
    let productsSold = 0; // total units sold across all orders (same total as the sheet's PIVOT)
    const toRemind: any[] = [];
    const recentOrders: any[] = [];

    for (const c of customers) {
      tiers[(c.tier as keyof typeof tiers) || "STANDARD"] = (tiers[c.tier as keyof typeof tiers] || 0) + 1;
      // green <= 3 months, yellow 3-6 months, red > 6 months or no purchase on record (relative to today)
      statuses[recencyStatus(c.lastOrderDate || c.orders?.[0]?.createdAt || c.lastSale)]++;
      const st = (c.state || "Other").toUpperCase();
      states[st] = (states[st] || 0) + 1;

      const sum = summarizeOrders(c.orders || []);
      if (sum.payStatus === "PAID") customersPaid++;
      else if (sum.payStatus === "OWING") customersOwing++;
      else customersNoOrder++;

      for (const o of c.orders || []) {
        for (const it of o.items || []) productsSold += Number(it.quantity) || 0;
        const s = normalizeOrderStatus(o.paymentStatus);
        orderStatus[s]++;
        const topProduct = o.items?.[0]?.product?.name || o.items?.[0]?.productName || null;
        recentOrders.push({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          totalAmount: Number(o.totalAmount) || 0,
          itemCount: o.items?.length || 0,
          topProduct,
          status: s,
          customerId: c.id,
          businessName: c.businessName,
        });
      }

      if (sum.unpaidOrders > 0) {
        toRemind.push({
          id: c.id,
          businessName: c.businessName,
          contactPerson: c.contactPerson,
          phone: c.phone,
          tier: c.tier,
          unpaidOrders: sum.unpaidOrders,
          oldestUnpaid: sum.oldestUnpaid,
        });
      }
    }

    toRemind.sort((a, b) => String(a.oldestUnpaid).localeCompare(String(b.oldestUnpaid)));
    recentOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let quotes: any[] = [];
    try {
      quotes = (await getQuotesList()) || [];
    } catch {
      quotes = [];
    }
    const quoteStatus = { DRAFT: 0, SENT: 0, ACCEPTED: 0, REJECTED: 0 };
    for (const q of quotes) quoteStatus[q.status as keyof typeof quoteStatus]++;

    let productsCount = 0;
    try {
      const prods = await listProducts();
      productsCount = prods.length;
    } catch {
      productsCount = 0;
    }

    return NextResponse.json({
      success: true,
      totals: {
        customers: customers.length,
        activeCustomers: statuses.ACTIVE,
        atRiskCustomers: statuses.AT_RISK,
        inactiveCustomers: statuses.INACTIVE,
        products: productsCount,
        orders: recentOrders.length,
        productsSold,
        customersPaid,
        customersOwing,
        customersNoOrder,
        quotes: quotes.length,
      },
      tiers,
      statuses,
      states: Object.entries(states)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count),
      orderStatus,
      quoteStatus,
      toRemind: toRemind.slice(0, 6),
      recentOrders: recentOrders.slice(0, 6),
      recentQuotes: quotes.slice(0, 5).map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        status: q.status,
        createdAt: q.createdAt,
        businessName: q.customer?.businessName,
        itemCount: q.items?.length || 0,
      })),
    });
  } catch (error: any) {
    console.error("[Dashboard API Error]:", error);
    return NextResponse.json({ success: false, error: "Could not load overview" }, { status: 500 });
  }
}

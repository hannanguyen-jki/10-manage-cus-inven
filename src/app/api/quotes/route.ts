import { NextResponse } from "next/server";
import { getQuotesList, createNewQuote, QuoteData } from "@/lib/quotesData";
import { prisma } from "@/lib/prisma";
import { addMockCustomer } from "@/lib/mock-crm-data";

/** Save a customer typed in by hand on the quote builder and return its id + details. */
async function createCustomerFromQuote(nc: any) {
  const data = {
    businessName: String(nc.businessName || "").trim(),
    contactPerson: String(nc.contactPerson || "").trim(),
    phone: String(nc.phone || "").trim(),
    email: nc.email?.trim() || null,
    address: nc.address?.trim() || null,
    city: nc.city?.trim() || null,
    state: (nc.state?.trim() || "TX").toUpperCase(),
    zipCode: nc.zipCode?.trim() || null,
  };
  if (process.env.DATABASE_URL) {
    try {
      const created = await prisma.customer.create({ data });
      return { ...data, id: created.id };
    } catch {
      // fall back to in-memory store
    }
  }
  const created = addMockCustomer(data);
  return { ...data, id: created.id };
}

export const dynamic = "force-dynamic";

// GET /api/quotes - List quotes with search and status filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const quotes = await getQuotesList(search, status);

    // Calculate aggregated summary statistics for header dashboard
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const thisMonthQuotes = quotes.filter((q) => q.createdAt.startsWith(currentMonthPrefix));
    const totalAmountThisMonth = thisMonthQuotes.reduce((sum, q) => sum + q.totalAmount, 0);

    const pendingQuotes = quotes.filter((q) => q.status === "DRAFT" || q.status === "SENT");
    const acceptedQuotes = quotes.filter((q) => q.status === "ACCEPTED");
    const closedAmount = acceptedQuotes.reduce((sum, q) => sum + q.totalAmount, 0);

    return NextResponse.json({
      success: true,
      quotes,
      stats: {
        totalQuotesCount: quotes.length,
        totalQuotesThisMonth: thisMonthQuotes.length,
        totalAmountThisMonth: Number(totalAmountThisMonth.toFixed(2)),
        pendingCount: pendingQuotes.length,
        acceptedCount: acceptedQuotes.length,
        closedAmount: Number(closedAmount.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error("GET /api/quotes Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve quotes" },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Create a new quote with items
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { items, validUntil, notes, paymentTerms, status, createdUser, newCustomer } = body;
    let { customerId, customer } = body;

    if (!customerId && newCustomer) {
      if (!newCustomer.businessName?.trim() || !newCustomer.contactPerson?.trim() || !newCustomer.phone?.trim()) {
        return NextResponse.json(
          { success: false, error: "Shop name, contact person and phone are required" },
          { status: 400 }
        );
      }
      customer = await createCustomerFromQuote(newCustomer);
      customerId = customer.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Please select or provide customer information" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Quote must include at least one product" },
        { status: 400 }
      );
    }

    // Default validUntil is 14 days from now if not specified
    const targetValidUntil =
      validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const newQuote = await createNewQuote({
      customerId,
      customer,
      items,
      validUntil: targetValidUntil,
      notes: notes || "Free local delivery for wholesale orders in Greater Houston Hub.",
      paymentTerms: paymentTerms || "Zelle / Check / Card",
      status: (status as QuoteData["status"]) || "DRAFT",
      createdUser: createdUser || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Quote created successfully",
      quote: newQuote,
    });
  } catch (error: any) {
    console.error("POST /api/quotes Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create new quote" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getQuotesList, createNewQuote, QuoteData } from "@/lib/quotesData";

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

    const { customerId, customer, items, validUntil, notes, paymentTerms, status } = body;

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

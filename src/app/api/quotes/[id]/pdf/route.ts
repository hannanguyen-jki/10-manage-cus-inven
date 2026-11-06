import { NextResponse } from "next/server";
import { getQuoteDetail, QuoteData } from "@/lib/quotesData";
import fs from "fs";
import path from "path";

// JKI OCEAN logo embedded as a data URI so Puppeteer never needs network access
function logoDataUri(): string {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "logo-full.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export const dynamic = "force-dynamic";

// Helper to launch Puppeteer with Chrome / Edge or @sparticuz/chromium
async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;

  // 1. Explicit env path
  if (process.env.CHROME_EXECUTABLE_PATH && fs.existsSync(process.env.CHROME_EXECUTABLE_PATH)) {
    return await puppeteer.launch({
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }

  // 2. Standard Windows / Edge / Chrome paths
  const standardPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const path of standardPaths) {
    if (fs.existsSync(path)) {
      return await puppeteer.launch({
        executablePath: path,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
    }
  }

  // 3. Fallback to @sparticuz/chromium (Linux VPS / Serverless)
  try {
    const chromium = (await import("@sparticuz/chromium")).default;
    const execPath = await chromium.executablePath();
    if (execPath && fs.existsSync(execPath)) {
      return await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: execPath,
        headless: chromium.headless,
      });
    }
  } catch (err) {
    console.warn("Sparticuz chromium fallback failed:", err);
  }

  throw new Error("Headless browser (Chrome/Edge) not found for PDF rendering");
}

// Generate the high-end branded HTML template for JKIOCEAN
function renderQuoteHtml(quote: QuoteData): string {
  const logo = logoDataUri();
  const formattedCreated = new Date(quote.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedValid = new Date(quote.validUntil).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rowsHtml = quote.items
    .map(
      (item, idx) => `
    <tr class="item-row">
      <td class="text-center text-slate-400 font-semibold" style="width: 40px;">${idx + 1}</td>
      <td style="width: 90px; text-align: center;">
        <div class="product-thumb-wrapper">
          <img 
            src="${item.imageUrl || "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=300"}" 
            alt="${item.productName}" 
            class="product-thumb"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=300';"
          />
        </div>
      </td>
      <td>
        <div class="font-bold text-slate-900 text-sm">${item.productName}</div>
        <div class="flex items-center gap-2 mt-1">
          <span class="sku-badge font-mono font-bold">${item.sku}</span>
          ${item.category ? `<span class="category-pill">${item.category}</span>` : ""}
        </div>
      </td>
      <td class="text-center font-bold text-slate-800 text-sm" style="width: 70px;">${item.quantity}</td>
      <td class="text-right font-medium text-slate-700 text-sm" style="width: 100px;">$${item.unitPrice.toFixed(2)}</td>
      <td class="text-right font-bold text-slate-900 text-sm" style="width: 110px;">$${item.lineTotal.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OFFICIAL WHOLESALE PRICE QUOTE - ${quote.quoteNumber}</title>
  <style>
    @page {
      size: letter;
      margin: 10mm 12mm 12mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      max-width: 850px;
      margin: 0 auto;
      padding: 12px;
      background: #ffffff;
    }
    
    /* Strict page break protections */
    .avoid-break, .item-row, .summary-box, .terms-box, .signature-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }

    /* Brand Header */
    .brand-header {
      background: #ffffff;
      color: #111318;
      padding: 8px 0 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 4px solid #039dd5;
    }
    .brand-logo {
      height: 64px;
      width: auto;
      display: block;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-slogan {
      font-size: 12px;
      font-style: italic;
      color: #027fb3;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .hub-badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.2);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #7dd3fc;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .hub-contact {
      text-align: right;
      font-size: 11px;
      color: #51596a;
      line-height: 1.6;
    }
    .hub-contact strong {
      color: #111318;
      font-size: 12px;
    }
    .contact-highlight {
      color: #039dd5;
      font-weight: 700;
      font-family: monospace;
      font-size: 12px;
    }

    /* Meta Info Grid */
    .info-grid {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
    }
    .customer-name {
      font-size: 16px;
      font-weight: 800;
      color: #056690;
      margin-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #1e293b;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .status-ACCEPTED { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-SENT { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
    .status-DRAFT { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .status-REJECTED { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }

    /* Items Table */
    .quote-table {
      margin-bottom: 24px;
    }
    .quote-table th {
      background: #056690;
      color: #ffffff;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .quote-table th:first-child { border-top-left-radius: 8px; }
    .quote-table th:last-child { border-top-right-radius: 8px; }
    .quote-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .quote-table tr:nth-child(even) td {
      background-color: #fafbfc;
    }
    .product-thumb-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }
    .product-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sku-badge {
      font-size: 11px;
      background: #f1f5f9;
      color: #334155;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
    .category-pill {
      font-size: 10px;
      background: #eff6ff;
      color: #056690;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Calculation & Summary */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      gap: 24px;
      margin-bottom: 24px;
    }
    .notes-card {
      flex: 1.2;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .totals-card {
      flex: 0 0 320px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 12px;
      color: #475569;
    }
    .total-row.grand-total {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 2px solid #056690;
      font-size: 16px;
      font-weight: 800;
      color: #056690;
    }
    .grand-badge {
      background: #056690;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 17px;
      font-weight: 900;
    }

    /* Payment Terms & Houston Delivery */
    .terms-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-size: 11.5px;
      color: #1e3a8a;
    }
    .terms-box h4 {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 6px;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Signature & Stamp Section */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      margin-top: 55px;
      border-bottom: 1px dashed #64748b;
      padding-bottom: 4px;
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
    .signature-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .footer-notice {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Brand Header -->
    <div class="brand-header">
      <div>
        ${logo ? `<img class="brand-logo" src="${logo}" alt="JKI OCEAN" />` : `<div class="brand-title"><span>JKIOCEAN</span></div>`}
        <div class="brand-slogan">Let Beauty Begin</div>
      </div>
      <div class="hub-contact">
        <strong>JKIOCEAN GLOBAL LLC</strong><br>
        10606 Bellaire Blvd, Suite 108<br>
        Houston, TX 77036<br>
        Tel: <span class="contact-highlight">+1 (713) 330-6165</span><br>
        Email: <span class="contact-highlight">support@jkiocean.com</span><br>
        Web: <strong>www.jkioceanhub.com</strong>
      </div>
    </div>

    <!-- Quotation Title & Meta -->
    <div class="info-grid">
      <!-- Bill To -->
      <div class="info-card">
        <div class="card-title">Prepared For (B2B Customer / Salon)</div>
        <div class="customer-name">${quote.customer.businessName}</div>
        <div class="info-row">
          <span class="info-label">Contact Person:</span>
          <span class="info-value">${quote.customer.contactPerson}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value font-mono font-bold">${quote.customer.phone}</span>
        </div>
        ${quote.customer.email ? `
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${quote.customer.email}</span>
        </div>` : ""}
        <div class="info-row">
          <span class="info-label">Salon Address:</span>
          <span class="info-value">${[quote.customer.address, quote.customer.city, [quote.customer.state, quote.customer.zipCode].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—"}</span>
        </div>
      </div>

      <!-- Quote Meta -->
      <div class="info-card">
        <div class="card-title">Quote Details</div>
        <div class="info-row">
          <span class="info-label">Quote #:</span>
          <span class="info-value font-mono font-bold" style="color: #056690;">${quote.quoteNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Issue Date:</span>
          <span class="info-value">${formattedCreated}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valid Until:</span>
          <span class="info-value font-bold" style="color: #b45309;">${formattedValid}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Sales Representative:</span>
          <span class="info-value">${quote.createdUser || "Johnny Tran"} (Houston Hub)</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="quote-table">
      <thead>
        <tr>
          <th style="text-align: center;">Item #</th>
          <th style="text-align: center;">Image</th>
          <th style="text-align: left;">Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Total -->
    <div class="summary-section">
      <div class="totals-card">
        <div class="total-row grand-total">
          <span>Total (USD):</span>
          <span class="grand-badge">$${quote.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer-notice">
      Thank you for your business! This official wholesale price quote is generated by JKIOCEAN LLC - Houston Distribution Hub • Tel: +1 (713) 330-6165 • Email: support@jkiocean.com
    </div>
  </div>
</body>
</html>
  `;
}

// GET /api/quotes/[id]/pdf
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format"); // 'html' or 'pdf' (default)

    const quote = await getQuoteDetail(id);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    const htmlContent = renderQuoteHtml(quote);

    // If HTML format requested or printable preview
    if (format === "html") {
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Try Puppeteer PDF rendering
    try {
      const browser = await launchBrowser();
      const page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 1600 });
      await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 25000 });

      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
      });

      await browser.close();

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="JKIOCEAN_Quotation_${quote.quoteNumber}.pdf"`,
          "Cache-Control": "public, max-age=60",
        },
      });
    } catch (puppeteerErr: any) {
      console.warn("Headless PDF rendering fallback to printable HTML:", puppeteerErr.message);

      // Graceful fallback to HTML print response with auto-print
      const autoPrintHtml = htmlContent.replace(
        "</body>",
        `<script>window.onload = function() { window.print(); }</script></body>`
      );

      return new NextResponse(autoPrintHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
  } catch (error: any) {
    console.error(`PDF Generation Error for ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate PDF quotation" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createProduct, listProducts, orderedCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

const MAX_IMAGE_CHARS = 1_500_000; // ~1.1 MB once decoded; the page resizes images before upload

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json({ success: true, categories: orderedCategories(products), products });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ success: false, error: "Could not load products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const price = Number(body.wholesalePrice);
    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null;

    if (!name || !category) {
      return NextResponse.json({ success: false, error: "Name and category are required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ success: false, error: "Price must be a number of 0 or more" }, { status: 400 });
    }
    if (imageUrl && (!imageUrl.startsWith("data:image/") || imageUrl.length > MAX_IMAGE_CHARS)) {
      return NextResponse.json({ success: false, error: "Image is invalid or too large" }, { status: 400 });
    }

    const product = await createProduct({ name, category, wholesalePrice: Math.round(price * 100) / 100, imageUrl });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ success: false, error: "Could not add product" }, { status: 500 });
  }
}

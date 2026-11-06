import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

const MAX_IMAGE_CHARS = 1_500_000;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const patch: Record<string, any> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ success: false, error: "Name cannot be empty" }, { status: 400 });
      patch.name = name;
    }
    if (body.category !== undefined) {
      const category = String(body.category).trim();
      if (!category) return NextResponse.json({ success: false, error: "Category cannot be empty" }, { status: 400 });
      patch.category = category;
    }
    if (body.wholesalePrice !== undefined) {
      const price = Number(body.wholesalePrice);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ success: false, error: "Price must be a number of 0 or more" }, { status: 400 });
      }
      patch.wholesalePrice = Math.round(price * 100) / 100;
    }
    if (body.imageUrl !== undefined) {
      const img = body.imageUrl;
      if (img !== null && (typeof img !== "string" || !img.startsWith("data:image/") || img.length > MAX_IMAGE_CHARS)) {
        return NextResponse.json({ success: false, error: "Image is invalid or too large" }, { status: 400 });
      }
      patch.imageUrl = img;
    }

    const product = await updateProduct(params.id, patch);
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("[PATCH /api/products]", error);
    return NextResponse.json({ success: false, error: "Could not save product" }, { status: 500 });
  }
}

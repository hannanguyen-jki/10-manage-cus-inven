import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out successfully" });
  response.cookies.delete("jki_erp_token");
  return response;
}

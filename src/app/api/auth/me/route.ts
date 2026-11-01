import { NextResponse } from "next/server";
import { getSessionUser, sanitizeFullName } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  user.fullName = sanitizeFullName(user.fullName);
  return NextResponse.json({ authenticated: true, user });
}

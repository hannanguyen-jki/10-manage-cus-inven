import { NextResponse } from "next/server";
import { signUserToken, sanitizeFullName, UserSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { identifier, password, rememberMe = true } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter your Email / Employee ID and Password" },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();
    let authUser: UserSession | null = null;

    // 1. Attempt authentication via JKIOCEAN Attendance SSO (attendance.jkioceanhub.com)
    const ssoUrl = process.env.ATTENDANCE_SSO_URL || "https://attendance.jkioceanhub.com/api/auth/verify";
    try {
      const ssoRes = await fetch(ssoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed, password }),
        signal: AbortSignal.timeout(4000), // timeout 4s
      });

      if (ssoRes.ok) {
        const data = await ssoRes.json();
        if (data.valid && data.user) {
          authUser = {
            userId: data.user.id,
            email: data.user.email,
            employeeCode: data.user.employeeCode || "EMP",
            fullName: sanitizeFullName(data.user.fullName),
            role: data.user.role || "EMPLOYEE",
            department: data.user.department || "Sales",
          };
        }
      }
    } catch (ssoErr) {
      console.warn("[SSO Bridge] Could not connect to Attendance SSO, falling back to local credentials:", ssoErr);
    }

    // 2. Local fallback credentials
    if (!authUser) {
      const lower = trimmed.toLowerCase();
      // Standard JKIOCEAN accounts
      const validCreds: Record<string, { pass: string; name: string; role: string; code: string; dept: string }> = {
        admin: { pass: "3846ffbeb28841019aed", name: "System Administrator", role: "ADMIN", code: "JKI00", dept: "BOD" },
        johnny: { pass: "Admin@123456", name: "Johnny Tran", role: "ADMIN", code: "JKI01", dept: "BOD" },
        alice: { pass: "Hr@123456", name: "Alice Nguyen", role: "HR_MANAGER", code: "JKI02", dept: "Accounting" },
        hanna: { pass: "Nv@123456", name: "Hanna Nguyen", role: "EMPLOYEE", code: "JKI03", dept: "Sales" },
        tan: { pass: "Nv@123456", name: "Tan Ho", role: "EMPLOYEE", code: "JKI04", dept: "IT" },
        kate: { pass: "Nv@123456", name: "Kate", role: "EMPLOYEE", code: "JKI05", dept: "Marketing" },
      };

      const userKey = Object.keys(validCreds).find(
        (k) => lower === k || lower === `${k}@jkiocean.com`
      );

      if (userKey && validCreds[userKey].pass === password) {
        const u = validCreds[userKey];
        authUser = {
          userId: `u_${userKey}`,
          email: `${userKey}@jkiocean.com`,
          employeeCode: u.code,
          fullName: sanitizeFullName(u.name),
          role: u.role,
          department: u.dept,
        };
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Double check sanitization before token signing
    authUser.fullName = sanitizeFullName(authUser.fullName);

    // Create JWT Token
    const token = signUserToken(authUser, rememberMe ? "365d" : "1d");
    const maxAge = rememberMe ? 365 * 24 * 60 * 60 : 24 * 60 * 60;

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: authUser,
    });

    response.cookies.set("jki_erp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "System error during login" }, { status: 500 });
  }
}

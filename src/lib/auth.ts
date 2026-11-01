import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "jki-erp-manage-secret-key-2026-very-secure";

export interface UserSession {
  userId: string;
  email: string;
  employeeCode: string;
  fullName: string;
  role: string;
  department?: string;
}

export function sanitizeFullName(name?: string): string {
  if (!name) return "";
  return name
    .replace(/\s*\([Ss][ếe]p\)/gi, "")
    .replace(/\s*[Ss]ếp/gi, "")
    .trim();
}

export function signUserToken(user: UserSession, expiresIn = "30d"): string {
  const sanitizedUser: UserSession = {
    ...user,
    fullName: sanitizeFullName(user.fullName),
  };
  return jwt.sign(sanitizedUser, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyUserToken(token: string): UserSession | null {
  try {
    const user = jwt.verify(token, JWT_SECRET) as UserSession;
    if (user && user.fullName) {
      user.fullName = sanitizeFullName(user.fullName);
    }
    return user;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("jki_erp_token")?.value;
  if (!token) return null;
  const user = verifyUserToken(token);
  if (user && user.fullName) {
    user.fullName = sanitizeFullName(user.fullName);
  }
  return user;
}

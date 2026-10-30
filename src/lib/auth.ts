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

export function signUserToken(user: UserSession, expiresIn = "30d"): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyUserToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("jki_erp_token")?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

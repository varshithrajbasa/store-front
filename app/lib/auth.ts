import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 10;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nextstore_default_fallback_secret_key_change_in_production"
);

export const AUTH_COOKIE_NAME = "nextstore_session";

/**
 * Hash a plain text password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Validate email format using regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Generate a signed JWT session token.
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT session token and return the payload.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Helper to verify an incoming NextRequest has an active Admin session.
 */
export async function verifyAdminSession(request: NextRequest): Promise<{
  authorized: boolean;
  payload: JWTPayload | null;
  errorResponse?: NextResponse;
}> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return {
      authorized: false,
      payload: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) {
    return {
      authorized: false,
      payload: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Invalid session: Please sign in again" },
        { status: 401 }
      ),
    };
  }

  if (payload.role !== "admin") {
    return {
      authorized: false,
      payload,
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    payload,
  };
}

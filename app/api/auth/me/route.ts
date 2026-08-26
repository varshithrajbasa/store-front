import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: "No active session" },
        { status: 200 }
      );
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      const response = NextResponse.json(
        { success: false, user: null, message: "Invalid or expired session" },
        { status: 200 }
      );
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { success: false, user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

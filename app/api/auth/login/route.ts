import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyPassword, isValidEmail, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
import { User, UserSafe } from "@/types/user";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload in request body" },
        { status: 400 }
      );
    }

    const identifier = (body.email || body.username || "").trim();
    const password = body.password;

    // Validation
    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide your email or username" },
        { status: 400 }
      );
    }

    if (identifier.includes("@") && !isValidEmail(identifier)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide your password" },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.toLowerCase();

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    // Find user by email or username
    const user = await usersCollection.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
        { email: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your username/email and password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your username/email and password." },
        { status: 401 }
      );
    }

    const userId = user._id ? user._id.toString() : "";
    const safeUser: UserSafe = {
      id: userId,
      name: user.name || user.username || "Test User",
      email: user.email || user.username || identifier,
      username: user.username,
      role: user.role || "user",
      createdAt: user.createdAt,
    };

    // Generate JWT token
    const token = await signJWT({
      id: userId,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
        user: safeUser,
      },
      { status: 200 }
    );

    // Set HTTP-only session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Internal server error occurred during login",
      },
      { status: 500 }
    );
  }
}

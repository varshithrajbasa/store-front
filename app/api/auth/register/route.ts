import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, isValidEmail, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
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

    const { name, email, password } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user document
    const newUser: Omit<User, "_id"> = {
      name: trimmedName,
      email: normalizedEmail,
      password_hash,
      role: "user",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as User);
    const userId = result.insertedId.toString();

    const safeUser: UserSafe = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
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
        message: "User registered successfully",
        user: safeUser,
      },
      { status: 201 }
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
    console.error("User registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Internal server error occurred during registration",
      },
      { status: 500 }
    );
  }
}

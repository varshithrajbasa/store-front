import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { User, UserSafe } from "@/types/user";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const safeUsers: UserSafe[] = users.map((u) => ({
      id: u._id ? u._id.toString() : "",
      name: u.name,
      email: u.email,
      role: u.role || "user",
      phone: u.phone || "",
      address: u.address || "",
      city: u.city || "",
      postalCode: u.postalCode || "",
      country: u.country || "",
      createdAt: u.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        users: safeUsers,
        total: safeUsers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

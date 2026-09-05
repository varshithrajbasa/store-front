import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Filter } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyJWT, hashPassword, verifyPassword, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
import { User, UserSafe } from "@/types/user";
import { Order } from "@/types/order";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

/**
 * GET /api/user/profile
 * Returns the profile details and order statistics for the logged-in user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Invalid session: Please log in again" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");
    const ordersCollection = db.collection<Order>("orders");

    const userQuery: Filter<User> = ObjectId.isValid(payload.id)
      ? { $or: [{ _id: new ObjectId(payload.id) }, { email: payload.email }] }
      : { email: payload.email };

    const user = await usersCollection.findOne(userQuery);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get order statistics
    const userOrders = await ordersCollection
      .find({
        $or: [{ userId: payload.id }, { userEmail: payload.email }],
      })
      .toArray();

    const stats = {
      totalOrders: userOrders.length,
      activeOrders: userOrders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.status)).length,
      completedOrders: userOrders.filter((o) => o.status === "Delivered").length,
      cancelledOrders: userOrders.filter((o) => o.status === "Cancelled").length,
    };

    const safeUser: UserSafe = {
      id: user._id ? user._id.toString() : payload.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      country: user.country || "",
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Updates user profile details or changes password.
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Invalid session: Please log in again" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection<User>("users");

    const userQuery: Filter<User> = ObjectId.isValid(payload.id)
      ? { $or: [{ _id: new ObjectId(payload.id) }, { email: payload.email }] }
      : { email: payload.email };

    const user = await usersCollection.findOne(userQuery);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Restrict test role from modifying personal info or password
    if (user.role === "test" || payload.role === "test") {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied: The test user account is in read-only mode. Personal information and password changes are disabled.",
        },
        { status: 403 }
      );
    }

    const updateFields: Partial<User> = {
      updatedAt: new Date(),
    };

    // 1. Handle profile details update
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Name must be at least 2 characters long" },
          { status: 400 }
        );
      }
      updateFields.name = body.name.trim();
    }

    if (body.phone !== undefined) updateFields.phone = String(body.phone).trim();
    if (body.address !== undefined) updateFields.address = String(body.address).trim();
    if (body.city !== undefined) updateFields.city = String(body.city).trim();
    if (body.postalCode !== undefined) updateFields.postalCode = String(body.postalCode).trim();
    if (body.country !== undefined) updateFields.country = String(body.country).trim();

    // 2. Handle password change if requested
    if (body.currentPassword && body.newPassword) {
      if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const isCurrentPasswordCorrect = await verifyPassword(
        body.currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordCorrect) {
        return NextResponse.json(
          { success: false, error: "Current password does not match our records" },
          { status: 400 }
        );
      }

      updateFields.password_hash = await hashPassword(body.newPassword);
    }

    await usersCollection.updateOne(userQuery, { $set: updateFields });

    const updatedUser = await usersCollection.findOne(userQuery);
    const safeUser: UserSafe = {
      id: updatedUser?._id ? updatedUser._id.toString() : payload.id,
      name: updatedUser?.name || payload.name,
      email: updatedUser?.email || payload.email,
      role: updatedUser?.role || "user",
      phone: updatedUser?.phone || "",
      address: updatedUser?.address || "",
      city: updatedUser?.city || "",
      postalCode: updatedUser?.postalCode || "",
      country: updatedUser?.country || "",
      createdAt: updatedUser?.createdAt || user.createdAt,
    };

    // Re-sign token if name changed so session displays updated info immediately
    const newToken = await signJWT({
      id: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: body.currentPassword
          ? "Password and profile updated successfully!"
          : "Profile details updated successfully!",
        user: safeUser,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

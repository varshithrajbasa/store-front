import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { User } from "@/types/user";
import { AdminStats } from "@/types/admin";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection<Order>("orders");
    const productsCollection = db.collection<Product>("products");
    const usersCollection = db.collection<User>("users");

    const [orders, totalProducts, totalUsers] = await Promise.all([
      ordersCollection.find({}).sort({ createdAt: -1 }).toArray(),
      productsCollection.countDocuments({}),
      usersCollection.countDocuments({}),
    ]);

    const nonCancelledOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const stats: AdminStats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "Pending").length,
      processingOrders: orders.filter((o) => o.status === "Processing").length,
      shippedOrders: orders.filter((o) => o.status === "Shipped").length,
      deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
      cancelledOrders: orders.filter((o) => o.status === "Cancelled").length,
      totalProducts,
      totalUsers,
    };

    const formattedRecentOrders = orders.slice(0, 5).map((o) => ({
      ...o,
      _id: o._id ? o._id.toString() : undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        stats,
        recentOrders: formattedRecentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load admin stats" },
      { status: 500 }
    );
  }
}

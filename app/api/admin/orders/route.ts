import { NextRequest, NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { Order, OrderStatus } from "@/types/order";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    const query: Filter<Order> = {};

    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter as OrderStatus;
    }

    if (searchQuery && searchQuery.trim()) {
      const term = searchQuery.trim();
      const orConditions: Filter<Order>[] = [
        { userEmail: { $regex: term, $options: "i" } },
        { "shippingAddress.fullName": { $regex: term, $options: "i" } },
        { "shippingAddress.city": { $regex: term, $options: "i" } },
      ];

      if (ObjectId.isValid(term)) {
        orConditions.push({ _id: new ObjectId(term) });
      }

      query.$or = orConditions;
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection<Order>("orders");

    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();

    const formattedOrders = orders.map((order) => ({
      ...order,
      _id: order._id ? order._id.toString() : undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders,
        total: formattedOrders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

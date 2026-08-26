import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Filter } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
import { Order } from "@/types/order";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleCancelOrder(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    const query: Filter<Order> = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : ({ _id: id } as unknown as Filter<Order>);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection<Order>("orders");

    const order = await ordersCollection.findOne(query);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const isOwner = order.userId === payload.id || order.userEmail === payload.email;
    if (!isOwner && payload.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to cancel this order" },
        { status: 403 }
      );
    }

    // Check cancellation eligibility
    if (order.status === "Cancelled") {
      return NextResponse.json(
        { success: false, error: "This order has already been cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "Delivered") {
      return NextResponse.json(
        { success: false, error: "Delivered orders cannot be cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "Shipped") {
      return NextResponse.json(
        { success: false, error: "Shipped orders cannot be cancelled directly. Please contact support for returns." },
        { status: 400 }
      );
    }

    let cancellationReason = "Cancelled by user";
    try {
      const body = await request.json();
      if (body.reason && typeof body.reason === "string") {
        cancellationReason = body.reason.trim();
      }
    } catch {
      // Body is optional
    }

    const updateResult = await ordersCollection.findOneAndUpdate(
      query,
      {
        $set: {
          status: "Cancelled",
          cancellationReason,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    const updatedDoc = updateResult;
    const formattedOrder = updatedDoc
      ? {
          ...updatedDoc,
          _id: updatedDoc._id ? updatedDoc._id.toString() : id,
        }
      : null;

    return NextResponse.json(
      {
        success: true,
        message: `Order #${id.slice(-6).toUpperCase()} has been cancelled successfully.`,
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, segmentData: RouteParams) {
  return handleCancelOrder(request, segmentData);
}

export async function PATCH(request: NextRequest, segmentData: RouteParams) {
  return handleCancelOrder(request, segmentData);
}

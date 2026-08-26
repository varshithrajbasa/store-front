import { NextRequest, NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { Order, OrderStatus } from "@/types/order";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

async function updateOrderStatusHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
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

    const { status, note } = body;

    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const query: Filter<Order> = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : ({ _id: id } as unknown as Filter<Order>);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection<Order>("orders");

    const existingOrder = await ordersCollection.findOne(query);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const updateFields: Partial<Order> = {
      status: status as OrderStatus,
      updatedAt: new Date(),
    };

    if (status === "Cancelled" && note) {
      updateFields.cancellationReason = String(note).trim();
    }

    const updatedDoc = await ordersCollection.findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: "after" }
    );

    const formattedOrder = updatedDoc
      ? {
          ...updatedDoc,
          _id: updatedDoc._id ? updatedDoc._id.toString() : id,
        }
      : null;

    return NextResponse.json(
      {
        success: true,
        message: `Order status updated to "${status}" successfully.`,
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, segmentData: RouteParams) {
  return updateOrderStatusHandler(request, segmentData);
}

export async function PUT(request: NextRequest, segmentData: RouteParams) {
  return updateOrderStatusHandler(request, segmentData);
}

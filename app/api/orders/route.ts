import { NextRequest, NextResponse } from "next/server";
import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
import { Order, OrderItem, ShippingAddress } from "@/types/order";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

/**
 * GET /api/orders
 * Returns all orders for the currently authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in to view orders" },
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
    const ordersCollection = db.collection<Order>("orders");

    // Match by user id or fallback by user email
    const orders = await ordersCollection
      .find({
        $or: [{ userId: payload.id }, { userEmail: payload.email }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id to string for serialization
    const formattedOrders = orders.map((order) => ({
      ...order,
      _id: order._id ? order._id.toString() : undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Creates a new order for the currently authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in to complete checkout" },
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
        { success: false, error: "Invalid JSON payload in request body" },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod } = body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty. Please add items to checkout." },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid shipping address" },
        { status: 400 }
      );
    }

    const { fullName, phone, address, city, postalCode, country } = shippingAddress as ShippingAddress;

    if (!fullName?.trim() || !phone?.trim() || !address?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please fill out all required shipping address fields" },
        { status: 400 }
      );
    }

    // Validate and clean order items
    const sanitizedItems: OrderItem[] = items.map((item: OrderItem) => ({
      id: Number(item.id),
      title: String(item.title || "Product"),
      price: Number(item.price) || 0,
      image: String(item.image || ""),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    // Calculate total amount
    const totalAmount = sanitizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection<Order>("orders");

    const newOrder: Order = {
      userId: payload.id,
      userEmail: payload.email,
      items: sanitizedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: "Pending",
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
      paymentMethod: paymentMethod || "Credit / Debit Card",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(newOrder as OptionalUnlessRequiredId<Order>);

    const createdOrder = {
      ...newOrder,
      _id: result.insertedId.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to place order" },
      { status: 500 }
    );
  }
}

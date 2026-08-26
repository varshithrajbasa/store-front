import { NextRequest, NextResponse } from "next/server";
import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { Product } from "@/types/product";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

/**
 * GET /api/admin/products
 * Fetch all products from MongoDB.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsCollection = db.collection<Product>("products");

    const products = await productsCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ id: -1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        products,
        total: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Creates a new product in the MongoDB products collection.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
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

    const { title, price, description, category, image, rating } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Product title must be at least 2 characters long" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid price greater than 0" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Product description must be at least 5 characters long" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid product category" },
        { status: 400 }
      );
    }

    if (!image || typeof image !== "string" || !image.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid image URL" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsCollection = db.collection<Product>("products");

    // Find the current highest id to assign the next sequential id
    const highestProduct = await productsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    const nextId = highestProduct.length > 0 && typeof highestProduct[0].id === "number"
      ? highestProduct[0].id + 1
      : 101;

    const newProduct: Product = {
      id: nextId,
      title: title.trim(),
      price: Math.round(numericPrice * 100) / 100,
      description: description.trim(),
      category: category.trim().toLowerCase(),
      image: image.trim(),
      rating: {
        rate: rating?.rate ? Number(rating.rate) : 4.5,
        count: rating?.count ? Number(rating.count) : 1,
      },
    };

    await productsCollection.insertOne(newProduct as OptionalUnlessRequiredId<Product>);

    return NextResponse.json(
      {
        success: true,
        message: `Product "${newProduct.title}" added to catalog successfully!`,
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to add product" },
      { status: 500 }
    );
  }
}

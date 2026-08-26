import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/auth";
import { Product } from "@/types/product";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/products/[id]
 * Updates an existing product.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
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

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsCollection = db.collection<Product>("products");

    const existingProduct = await productsCollection.findOne({ id: numericId });
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updateFields: Partial<Product> = {};

    if (body.title !== undefined) updateFields.title = String(body.title).trim();
    if (body.price !== undefined) {
      const priceNum = Number(body.price);
      if (!isNaN(priceNum) && priceNum > 0) {
        updateFields.price = Math.round(priceNum * 100) / 100;
      }
    }
    if (body.description !== undefined) updateFields.description = String(body.description).trim();
    if (body.category !== undefined) updateFields.category = String(body.category).trim().toLowerCase();
    if (body.image !== undefined) updateFields.image = String(body.image).trim();

    await productsCollection.updateOne({ id: numericId }, { $set: updateFields });

    const updatedProduct = await productsCollection.findOne(
      { id: numericId },
      { projection: { _id: 0 } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully!",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Deletes a product by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsCollection = db.collection<Product>("products");

    const result = await productsCollection.deleteOne({ id: numericId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product #${numericId} deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

import clientPromise from "@/lib/mongodb";
import { Product } from "@/types/product";

const DB_NAME = process.env.MONGODB_DB || "nextstore_db";

async function getCollection() {
  const client = await clientPromise;
  return client.db(DB_NAME).collection("products");
}

// 1. Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const collection = await getCollection();
    const products = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    return products as unknown as Product[];
  } catch (error) {
    console.error("MongoDB getAllProducts error:", error);
    return [];
  }
}

// 2. Get featured products
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const collection = await getCollection();
    const products = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ "rating.rate": -1 })
      .limit(limit)
      .toArray();

    return products as unknown as Product[];
  } catch (error) {
    console.error("MongoDB getFeaturedProducts error:", error);
    return [];
  }
}

// 3. Get single product by ID
export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const numericId = Number(id);
    const collection = await getCollection();
    const product = await collection.findOne(
      { id: numericId },
      { projection: { _id: 0 } }
    );

    return (product as unknown as Product) || null;
  } catch (error) {
    console.error(`MongoDB getProductById error for ${id}:`, error);
    return null;
  }
}

// 4. Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  try {
    const collection = await getCollection();
    const categories = await collection.distinct("category");
    return categories as string[];
  } catch (error) {
    console.error("MongoDB getAllCategories error:", error);
    return [];
  }
}

// 5. Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const collection = await getCollection();
    const products = await collection
      .find({ category }, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    return products as unknown as Product[];
  } catch (error) {
    console.error(`MongoDB getProductsByCategory error for ${category}:`, error);
    return [];
  }
}
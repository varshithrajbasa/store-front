import { Product } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";

// Fetch all products
export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`, {
    next: { revalidate: 3600 }, // Cache and revalidate hourly
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

// Fetch featured/limited products
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch featured products");
  }

  return res.json();
}

// Fetch single product by ID
export async function getProductById(id: string | number): Promise<Product | null> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// Fetch all category names
export async function getAllCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/products/categories`, {
    next: { revalidate: 86400 }, // Revalidate daily
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

// Fetch products by specific category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(category)}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products for category: ${category}`);
  }

  return res.json();
}
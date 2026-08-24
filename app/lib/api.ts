import { Product } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";

const FALLBACK_CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

// Fetch all categories with fallback
export async function getAllCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/products/categories`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn("Categories fetch returned non-200, using fallback");
      return FALLBACK_CATEGORIES;
    }

    return await res.json();
  } catch (error) {
    console.warn("Failed to reach Fake Store API during build, using fallback categories:", error);
    return FALLBACK_CATEGORIES;
  }
}

// Fetch all products with safe error handling
export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn("Failed to fetch products:", error);
    return [];
  }
}

// Fetch featured products
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=${limit}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn("Failed to fetch featured products:", error);
    return [];
  }
}

// Fetch single product by ID
export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

// Fetch products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(category)}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn(`Failed to fetch category ${category}:`, error);
    return [];
  }
}
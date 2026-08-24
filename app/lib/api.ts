import { Product } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

const FALLBACK_CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

export async function getAllCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/products/categories`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return FALLBACK_CATEGORIES;
    return await res.json();
  } catch (error) {
    console.error("Categories fetch failed:", error);
    return FALLBACK_CATEGORIES;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Products fetch failed:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=${limit}`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Featured products fetch failed:", error);
    return [];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Product ${id} fetch failed:`, error);
    return null;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(category)}`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Category ${category} fetch failed:`, error);
    return [];
  }
}
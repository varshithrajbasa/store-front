import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getProductsByCategory } from "@/lib/api";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// 1. Static Site Generation for all categories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    category: encodeURIComponent(cat),
  }));
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return {
    title: `${decodedCategory.toUpperCase()} | NextStore`,
    description: `Shop the latest in ${decodedCategory} at NextStore.`,
  };
}

// 3. Category Page Component
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  let products = [];
  try {
    products = await getProductsByCategory(decodedCategory);
  } catch {
    notFound();
  }

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="border-b border-neutral-200 pb-6">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-3 capitalize">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition">Categories</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{decodedCategory}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 capitalize">
            {decodedCategory}
          </h1>
          <p className="text-sm text-neutral-500">
            {products.length} {products.length === 1 ? "Item" : "Items"} Found
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
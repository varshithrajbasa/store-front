import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getAllCategories, getProductsByCategory } from "@/lib/api";
import { Product } from "@/types/product";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category: activeCategory } = await searchParams;

  // Fetch categories and products in parallel
  const [categories, products]: [string[], Product[]] = await Promise.all([
    getAllCategories(),
    activeCategory ? getProductsByCategory(activeCategory) : getAllProducts(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 capitalize">
            {activeCategory ? activeCategory : "All Products"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Showing {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !activeCategory
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition ${
                activeCategory === cat
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 text-lg">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
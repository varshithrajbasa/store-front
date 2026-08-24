import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getAllCategories } from "@/lib/api";

// Ensures this page runs at runtime on the server (SSR) instead of build time (SSG)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(4),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-neutral-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
            Spring Collection 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            Minimalist Design, Maximum Impact.
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg">
            Discover curated apparel, fine jewelery, and everyday tech essentials.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-full transition duration-200"
            >
              Explore Full Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-medium text-blue-600 hover:underline">
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${encodeURIComponent(category)}`}
              className="group p-6 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[110px]"
            >
              <span className="capitalize font-semibold text-neutral-800 group-hover:text-blue-600 transition-colors">
                {category}
              </span>
              <span className="text-xs text-neutral-400 mt-1">Explore items →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Trending Items</h2>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:underline">
            See all →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl">
            <p className="text-neutral-500 text-sm">No featured products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
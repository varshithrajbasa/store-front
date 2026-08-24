import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getAllCategories } from "@/lib/api";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(4),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
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
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-full transition duration-200 shadow-sm"
            >
              Explore Full Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Category Cards Section (Updated Styling) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:underline">
            View all products →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${encodeURIComponent(category)}`}
              className="group p-6 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[110px]"
            >
              <span className="capitalize font-semibold text-neutral-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                {category}
              </span>
              <span className="text-xs text-neutral-400 mt-1">Explore items →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Trending Items</h2>
            <p className="text-sm text-neutral-500">Popular picks selected for you</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:underline">
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Value Highlights */}
      <section className="max-w-7xl mx-auto px-4 border-t border-neutral-100 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4 rounded-xl bg-neutral-50 space-y-2">
            <h3 className="font-bold text-neutral-900">Fast & Free Delivery</h3>
            <p className="text-xs text-neutral-500">Free shipping on all eligible orders worldwide.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 space-y-2">
            <h3 className="font-bold text-neutral-900">30-Day Money-Back</h3>
            <p className="text-xs text-neutral-500">Simple return policy with zero hassle guaranteed.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 space-y-2">
            <h3 className="font-bold text-neutral-900">24/7 Dedicated Support</h3>
            <p className="text-xs text-neutral-500">Instant answers and friendly support anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
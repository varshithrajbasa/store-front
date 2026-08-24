import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/api";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await getProductsByCategory(decodedCategory);

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-3 capitalize">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-black transition">Categories</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{decodedCategory}</span>
        </nav>

        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 capitalize">
            {decodedCategory}
          </h1>
          <p className="text-sm text-neutral-500">
            {products.length} {products.length === 1 ? "Item" : "Items"} Found
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
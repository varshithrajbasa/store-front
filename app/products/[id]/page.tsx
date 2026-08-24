import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getProductById } from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// 1. Static Site Generation (SSG): Fetch all IDs at build time
export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found | NextStore",
    };
  }

  return {
    title: `${product.title} | NextStore`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

// 3. Main Server Component Page
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 capitalize">
        <Link href="/" className="hover:text-black transition">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black transition">Products</Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-black transition"
        >
          {product.category}
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Image Canvas */}
        <div className="relative w-full h-[400px] sm:h-[480px] bg-white rounded-3xl border border-neutral-200 p-8 flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            className="object-contain p-6 hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-sm font-bold text-amber-900">
              <span>★</span>
              <span>{product.rating.rate}</span>
            </div>
            <span className="text-sm text-neutral-500">
              Based on {product.rating.count} customer reviews
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-black text-neutral-900">
            ${product.price.toFixed(2)}
          </div>

          {/* Description */}
          <div className="border-t border-b border-neutral-200 py-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Description
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Interactive Action */}
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
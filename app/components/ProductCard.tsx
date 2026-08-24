import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative w-full h-52 mb-4 bg-white rounded-xl overflow-hidden p-4">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <span className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold mb-1">
          {product.category}
        </span>
        <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Footer: Price & Rating */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100">
          <span className="text-lg font-bold text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-md">
            <span className="text-amber-500">★</span>
            <span>{product.rating.rate}</span>
            <span className="text-neutral-400 font-normal">({product.rating.count})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
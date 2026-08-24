import Link from "next/link";
import { getAllCategories } from "@/lib/api";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
          Browse Categories
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Explore items tailored across our specialized departments.
        </p>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
  key={category}
  href={`/category/${encodeURIComponent(category)}`}
  className="group p-8 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[140px]"
>
  <h2 className="text-xl font-bold capitalize text-neutral-900 group-hover:text-blue-600 transition-colors">
    {category}
  </h2>
  
  <div className="flex items-center text-xs font-semibold text-neutral-500 group-hover:text-neutral-900 transition-colors mt-4">
    <span>Shop collection</span>
    <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
  </div>
</Link>
        ))}
      </div>
    </main>
  );
}
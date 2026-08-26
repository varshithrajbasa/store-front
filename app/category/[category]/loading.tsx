export default function CategoryLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      {/* Category Header Skeleton */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-10 bg-neutral-200 rounded" />
          <div className="h-3 w-2 bg-neutral-200 rounded" />
          <div className="h-3 w-16 bg-neutral-200 rounded" />
          <div className="h-3 w-2 bg-neutral-200 rounded" />
          <div className="h-3 w-24 bg-neutral-200 rounded" />
        </div>

        <div className="flex items-baseline justify-between">
          <div className="h-9 w-48 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-neutral-200 rounded-xl p-4 flex flex-col justify-between bg-white space-y-4 shadow-sm"
          >
            {/* Product Image Box Skeleton */}
            <div className="w-full h-48 bg-neutral-100 rounded-lg" />

            {/* Title & Category Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-16 bg-neutral-200 rounded" />
              <div className="h-4 w-full bg-neutral-200 rounded" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
            </div>

            {/* Price & Rating Skeleton */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 w-16 bg-neutral-200 rounded" />
              <div className="h-4 w-12 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
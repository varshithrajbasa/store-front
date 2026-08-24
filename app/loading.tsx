export default function HomeLoading() {
  return (
    <div className="space-y-16 pb-16 animate-pulse">
      {/* 1. Hero Skeleton */}
      <section className="bg-neutral-900 py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center space-y-4">
          <div className="h-4 w-32 bg-neutral-800 rounded-full" />
          <div className="h-10 sm:h-14 w-3/4 bg-neutral-800 rounded-xl" />
          <div className="h-4 w-1/2 bg-neutral-800 rounded" />
          <div className="h-12 w-48 bg-neutral-800 rounded-full mt-4" />
        </div>
      </section>

      {/* 2. Category Pills Skeleton */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="h-6 w-44 bg-neutral-200 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 border border-neutral-200 rounded-xl bg-neutral-100 flex items-center justify-center"
            >
              <div className="h-4 w-24 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-36 bg-neutral-200 rounded" />
          <div className="h-4 w-16 bg-neutral-200 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border border-neutral-200 rounded-xl p-4 flex flex-col justify-between bg-white space-y-4"
            >
              {/* Product Image Box */}
              <div className="w-full h-48 bg-neutral-100 rounded-lg" />

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-neutral-200 rounded" />
                <div className="h-4 w-full bg-neutral-200 rounded" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded" />
              </div>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-16 bg-neutral-200 rounded" />
                <div className="h-4 w-12 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
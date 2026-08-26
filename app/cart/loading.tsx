export default function CartLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div className="h-9 w-48 bg-neutral-200 rounded-lg" />
        <div className="h-4 w-16 bg-neutral-200 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List Skeleton */}
        <div className="lg:col-span-2 divide-y divide-neutral-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-6 flex gap-6 items-center">
              {/* Item Thumbnail */}
              <div className="w-20 h-20 bg-neutral-100 border border-neutral-200 rounded-xl flex-shrink-0" />

              {/* Item Info */}
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                <div className="h-3 w-20 bg-neutral-200 rounded" />

                {/* Quantity Controls Skeleton */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-8 w-24 bg-neutral-200 rounded-lg" />
                  <div className="h-3 w-12 bg-neutral-200 rounded" />
                </div>
              </div>

              {/* Price Skeleton */}
              <div className="text-right">
                <div className="h-5 w-16 bg-neutral-200 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar Skeleton */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-6">
          <div className="h-6 w-36 bg-neutral-200 rounded" />

          <div className="space-y-3 border-b border-neutral-200 pb-4">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-neutral-200 rounded" />
              <div className="h-4 w-12 bg-neutral-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-neutral-200 rounded" />
              <div className="h-4 w-10 bg-neutral-200 rounded" />
            </div>
          </div>

          <div className="flex justify-between">
            <div className="h-5 w-12 bg-neutral-200 rounded" />
            <div className="h-5 w-16 bg-neutral-200 rounded" />
          </div>

          <div className="h-12 w-full bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </main>
  );
}

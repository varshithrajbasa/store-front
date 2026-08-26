export default function OrdersLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:py-12 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-72 bg-neutral-100 rounded" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-20 bg-neutral-200 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Orders Cards Skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-neutral-200 rounded-2xl bg-white p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div className="flex gap-6">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
                <div className="h-4 w-24 bg-neutral-100 rounded" />
                <div className="h-4 w-28 bg-neutral-100 rounded hidden sm:block" />
              </div>
              <div className="h-6 w-24 bg-neutral-200 rounded-full" />
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                <div className="h-3 w-1/4 bg-neutral-100 rounded" />
              </div>
              <div className="h-5 w-16 bg-neutral-200 rounded" />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
              <div className="h-3 w-64 bg-neutral-100 rounded" />
              <div className="h-7 w-24 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

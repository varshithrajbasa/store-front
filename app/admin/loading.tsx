export default function AdminLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 sm:py-12 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-96 bg-neutral-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-neutral-200 rounded-xl" />
          <div className="h-9 w-28 bg-neutral-200 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="h-3 w-20 bg-neutral-200 rounded" />
            <div className="h-7 w-24 bg-neutral-200 rounded-lg" />
            <div className="h-2.5 w-32 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-neutral-200 pb-3">
        <div className="h-7 w-44 bg-neutral-200 rounded-lg" />
        <div className="h-7 w-40 bg-neutral-200 rounded-lg" />
        <div className="h-7 w-40 bg-neutral-200 rounded-lg" />
      </div>

      {/* Table / List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="h-4 w-48 bg-neutral-200 rounded" />
              <div className="h-6 w-20 bg-neutral-200 rounded-full" />
            </div>
            <div className="h-12 bg-neutral-50 rounded-xl" />
          </div>
        ))}
      </div>
    </main>
  );
}

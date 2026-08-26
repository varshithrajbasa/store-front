export default function CheckoutLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 sm:py-12 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-36 bg-neutral-200 rounded" />

      {/* Title */}
      <div className="h-8 w-56 bg-neutral-200 rounded-lg" />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1 */}
          <div className="border border-neutral-200 rounded-2xl bg-white p-6 space-y-6">
            <div className="h-6 w-48 bg-neutral-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 h-11 bg-neutral-100 rounded-xl" />
              <div className="h-11 bg-neutral-100 rounded-xl" />
              <div className="h-11 bg-neutral-100 rounded-xl" />
              <div className="sm:col-span-2 h-11 bg-neutral-100 rounded-xl" />
              <div className="h-11 bg-neutral-100 rounded-xl" />
              <div className="h-11 bg-neutral-100 rounded-xl" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="border border-neutral-200 rounded-2xl bg-white p-6 space-y-4">
            <div className="h-6 w-40 bg-neutral-200 rounded" />
            <div className="h-20 bg-neutral-100 rounded-xl" />
            <div className="h-14 bg-neutral-100 rounded-xl" />
          </div>
        </div>

        {/* Right Summary */}
        <div className="border border-neutral-200 rounded-2xl bg-neutral-50 p-6 space-y-5">
          <div className="h-6 w-44 bg-neutral-200 rounded" />
          <div className="space-y-3">
            <div className="h-12 bg-white rounded-lg" />
            <div className="h-12 bg-white rounded-lg" />
          </div>
          <div className="h-20 bg-neutral-200/60 rounded-xl" />
          <div className="h-12 bg-neutral-300 rounded-xl" />
        </div>
      </div>
    </main>
  );
}

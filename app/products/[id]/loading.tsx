export default function ProductDetailLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image Box Skeleton */}
        <div className="w-full h-[450px] bg-neutral-100 rounded-3xl border border-neutral-200" />

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-neutral-200 rounded-full" />
            <div className="h-8 w-full bg-neutral-200 rounded-lg" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded-lg" />
          </div>

          <div className="h-6 w-32 bg-neutral-200 rounded-md" />
          <div className="h-10 w-28 bg-neutral-200 rounded-lg" />

          <div className="space-y-2 pt-4 border-t border-neutral-100">
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-2/3 bg-neutral-200 rounded" />
          </div>

          <div className="h-12 w-full bg-neutral-200 rounded-xl mt-6" />
        </div>
      </div>
    </main>
  );
}
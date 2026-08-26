export default function ProfileLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 sm:py-12 animate-pulse space-y-8">
      {/* Top Banner Skeleton */}
      <div className="h-56 bg-neutral-900 rounded-3xl p-8 flex flex-col justify-between">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-neutral-800 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-neutral-800 rounded-lg" />
            <div className="h-4 w-36 bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-neutral-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-neutral-800/60 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-neutral-200 pb-3">
        <div className="h-6 w-48 bg-neutral-200 rounded" />
        <div className="h-6 w-36 bg-neutral-200 rounded" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-44 bg-neutral-200 rounded" />
          <div className="h-4 w-72 bg-neutral-100 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-11 bg-neutral-100 rounded-xl" />
          <div className="h-11 bg-neutral-100 rounded-xl" />
          <div className="h-11 bg-neutral-100 rounded-xl" />
          <div className="h-11 bg-neutral-100 rounded-xl" />
        </div>
        <div className="h-11 w-40 bg-neutral-200 rounded-xl ml-auto" />
      </div>
    </main>
  );
}

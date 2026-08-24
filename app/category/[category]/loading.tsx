export default function CategoryLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      <div className="space-y-2 border-b border-neutral-200 pb-6">
        <div className="h-4 w-32 bg-neutral-200 rounded" />
        <div className="h-8 w-48 bg-neutral-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between bg-white space-y-4"
          >
            <div className="w-full h-52 bg-neutral-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-neutral-200 rounded" />
              <div className="h-4 w-full bg-neutral-200 rounded" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="h-6 w-16 bg-neutral-200 rounded" />
              <div className="h-5 w-12 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
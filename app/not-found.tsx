import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="text-7xl font-black text-neutral-200">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900">Page Not Found</h1>
        <p className="text-sm text-neutral-500">
          The page or product you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-6 py-3 rounded-xl transition"
      >
        Back to Home
      </Link>
    </main>
  );
}
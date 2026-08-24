import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <span className="text-lg font-black tracking-tight">
              NEXT<span className="text-blue-600">STORE</span>
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A modern e-commerce storefront powered by Next.js and the Fake Store API.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/" className="hover:text-black">All Items</Link></li>
              <li><Link href="/electronics" className="hover:text-black">Electronics</Link></li>
              <li><Link href="/jewelery" className="hover:text-black">Jewelery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/cart" className="hover:text-black">My Cart</Link></li>
              <li><Link href="/orders" className="hover:text-black">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              About
            </h4>
            <p className="text-xs text-neutral-500">
              Built to explore App Router, Server Components, and API routes in Next.js.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} NextStore. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-neutral-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
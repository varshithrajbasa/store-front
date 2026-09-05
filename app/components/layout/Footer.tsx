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
              Developer & Source
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 mb-3">
              <li>
                <Link href="/about" id="footer-about-link" className="font-semibold text-blue-600 hover:text-blue-700">
                  About Architecture →
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/varshithrajbasa/store-front"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition flex items-center gap-1"
                >
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a
                  href="http://varshithrajbasa-prod.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 transition flex items-center gap-1"
                >
                  Developer Portfolio ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/basavarshithraj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition flex items-center gap-1"
                >
                  LinkedIn Profile ↗
                </a>
              </li>
            </ul>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Engineered by <span className="font-semibold text-neutral-700">Varshith Raj Basa</span> with Next.js, React 19, and Gemini AI.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>
            <p>© {new Date().getFullYear()} NextStore. Crafted by{" "}
              <a
                href="https://www.linkedin.com/in/basavarshithraj/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-800 hover:text-blue-600 transition"
              >
                Varshith Raj Basa
              </a>
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Portfolio Demo • Never charges users • Never ships items.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <a
              href="https://github.com/varshithrajbasa/store-front"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-black transition"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/basavarshithraj/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-blue-600 transition"
            >
              LinkedIn
            </a>
            <a
              href="http://varshithrajbasa-prod.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-purple-600 transition"
            >
              Portfolio
            </a>
            <Link href="/about" className="hover:text-neutral-800">About</Link>
            <Link href="/products" className="hover:text-neutral-800">Catalog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
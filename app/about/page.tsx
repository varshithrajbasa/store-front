import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About NextStore | Full-Stack Portfolio Showcase",
  description:
    "NextStore is an interactive demonstration e-commerce storefront engineered to showcase modern web development skills with Next.js, MongoDB, React 19, TypeScript, and Tailwind CSS.",
};

export default function AboutPage() {
  const techStack = [
    {
      name: "Next.js 16 (App Router)",
      category: "Framework & SSR",
      description:
        "Leveraging Server Components (RSC), Suspense streaming, dynamic segment routes, and optimized metadata for stellar performance and SEO.",
      icon: "⚡",
      badge: "App Router",
      gradient: "from-blue-600/10 to-indigo-600/10 border-blue-200/60",
      accent: "text-blue-600",
    },
    {
      name: "MongoDB & Native Driver",
      category: "Database & Pooling",
      description:
        "High-performance document storage with connection pooling singleton, transactional updates, and strict indexing across products, users, and orders collections.",
      icon: "🍃",
      badge: "NoSQL Database",
      gradient: "from-emerald-600/10 to-teal-600/10 border-emerald-200/60",
      accent: "text-emerald-600",
    },
    {
      name: "React 19 & Context API",
      category: "Client Architecture",
      description:
        "Component-driven design with reactive state hooks, custom providers, and persistent synchronization with browser localStorage for the cart engine.",
      icon: "⚛️",
      badge: "Modern React",
      gradient: "from-cyan-600/10 to-blue-600/10 border-cyan-200/60",
      accent: "text-cyan-600",
    },
    {
      name: "TypeScript",
      category: "Type Safety",
      description:
        "End-to-end type safety across database entities, API request/response payloads, order lifecycle states, and interactive client components.",
      icon: "🛡️",
      badge: "Strict Typing",
      gradient: "from-sky-600/10 to-blue-700/10 border-sky-200/60",
      accent: "text-sky-600",
    },
    {
      name: "Tailwind CSS v4",
      category: "Design System",
      description:
        "Clean, responsive, neutral-themed styling with subtle micro-interactions, responsive grid layouts, and glassmorphic navigation headers.",
      icon: "🎨",
      badge: "Utility CSS",
      gradient: "from-teal-600/10 to-emerald-600/10 border-teal-200/60",
      accent: "text-teal-600",
    },
    {
      name: "JWT & Bcrypt Security",
      category: "Auth & Roles",
      description:
        "Stateless session management using signed HTTP-only cookies via Jose, salted password hashing, and role-based guards (Admin, Test User, Customer).",
      icon: "🔒",
      badge: "RBAC Security",
      gradient: "from-purple-600/10 to-violet-600/10 border-purple-200/60",
      accent: "text-purple-600",
    },
  ];

  const architecturalHighlights = [
    {
      title: "Interactive Cart & State Sync",
      description:
        "A client-side cart system providing real-time quantity modifiers, price calculations, and seamless localStorage synchronization across tab sessions.",
      step: "01",
    },
    {
      title: "Simulated Checkout Flow",
      description:
        "Intuitive multi-step checkout with address autofill, pre-fill toggles, simulated payment options, and instant order creation with tracking IDs.",
      step: "02",
    },
    {
      title: "Order Lifecycle Management",
      description:
        "Dedicated customer dashboard with real-time status tracking (Pending → Processing → Shipped → Delivered) and user-driven cancellation confirmation modals.",
      step: "03",
    },
    {
      title: "Admin Command Center",
      description:
        "Restricted management portal featuring revenue analytics, KPI counters, order status transitions, and full product catalog CRUD operations.",
      step: "04",
    },
    {
      title: "Role-Based Demonstration Profiles",
      description:
        "Built-in role segregation supporting Customers, Administrators, and a dedicated Read-Only Test User (`role: test`) for risk-free exploration.",
      step: "05",
    },
    {
      title: "Resilient Error & Fallback UI",
      description:
        "Custom branded 404 error page, animated loading skeletons, empty states, and toast-style feedback banners across all major user touchpoints.",
      step: "06",
    },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 text-white py-20 sm:py-28 px-4">
        {/* Subtle decorative background ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Developer Portfolio & Technical Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Engineered with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Next.js & MongoDB</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong>NextStore</strong>. This project was conceived and built from the ground up to showcase modern full-stack web engineering, resilient database architecture, and polished user experiences.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              id="about-explore-catalog-btn"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-blue-500/25 hover:shadow-lg"
            >
              Explore Catalog
            </Link>
            <Link
              href="/login"
              id="about-try-test-btn"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 active:bg-white/15 text-white text-sm font-semibold rounded-xl transition backdrop-blur-sm border border-white/15"
            >
              Try Test Account (Demo)
            </Link>
          </div>
        </div>
      </section>

      {/* Critical Legal / Demonstration Disclaimer Callout */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white border-2 border-amber-300/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-300/60 text-amber-700 flex items-center justify-center text-2xl shrink-0">
              ⚠️
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Important Notice: Demonstration Project Only
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  Non-Commercial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                This website is <strong>strictly a portfolio and skill-demonstration application</strong>. It is not an active retail business or commercial storefront. Please take note of the following safeguards:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-100">
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <span>💳</span>
                <h3>Zero Charges Ever</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This store <strong>never charges users</strong> real money. Real payment fields are intentionally disabled. No billing credentials or payment gateway connections exist.
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <span>📦</span>
                <h3>Zero Physical Shipments</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The product catalog consists of mock demonstration items. This website <strong>never ships physical items</strong> to any entered delivery address.
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <span>🧪</span>
                <h3>Simulated Sandbox</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Feel free to test creating accounts, placing simulated orders, and navigating the dashboards. All features are fully functional simulations designed for portfolio review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-20 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Technology Stack
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Modern Tools Chosen for Speed & Scalability
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            A comprehensive look into the core libraries, protocols, and architectural decisions underpinning this storefront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((item) => (
            <div
              key={item.name}
              className={`p-6 rounded-3xl border bg-white shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{item.name}</h3>
                  <p className="text-xs font-semibold text-neutral-400">{item.category}</p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architectural Features */}
      <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-20 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            Key Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            End-to-End E-Commerce Implementation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            From product discovery to admin order dispatching, every phase was handcrafted to mirror production-grade e-commerce standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {architecturalHighlights.map((feat) => (
            <div
              key={feat.title}
              className="p-6 rounded-3xl bg-neutral-50/70 border border-neutral-200/80 hover:bg-white hover:border-neutral-300 transition duration-150 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {feat.step}
                </span>
                <span className="w-2 h-2 rounded-full bg-neutral-300" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">{feat.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try the Test Account Callout */}
      <section className="max-w-4xl mx-auto px-4 pt-16 sm:pt-20">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
              <span>⚡</span>
              <span>Instant Demonstration Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Want to test without registering?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg leading-relaxed">
              Use the built-in <strong>Login as Test</strong> feature on the sign-in page to explore orders and checkout with read-only profile protection (<span className="font-mono font-semibold">role: test</span>).
            </p>
          </div>

          <Link
            href="/login"
            id="about-login-test-cta"
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm whitespace-nowrap text-center"
          >
            Go to Test Login →
          </Link>
        </div>
      </section>
    </main>
  );
}

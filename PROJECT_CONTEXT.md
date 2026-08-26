# Project: NextStore (E-Commerce Web App)

## Tech Stack
- **Framework:** Next.js (App Router, Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (via native `mongodb` driver & connection pooling in `lib/mongodb.ts`)
- **State Management:** React Context API (`CartContext.tsx` with `localStorage` sync)
- **Deployment:** Vercel

---

## Completed Milestones
1. **Catalog & Navigation:**
   - Landing page with dynamic featured products (`app/page.tsx`).
   - Catalog view with category filters (`app/products/page.tsx`).
   - Dynamic product detail routes (`app/products/[id]/page.tsx`).
   - Department categories overview & dedicated routes (`app/categories/` & `app/category/[category]/`).
2. **Database Integration:**
   - Products collection seeded in MongoDB.
   - Server-side data fetching helper functions in `lib/api.ts`.
3. **Cart System:**
   - Client-side shopping cart with dynamic badge in Navbar, quantity modifiers, and subtotal calculation (`app/cart/page.tsx`).
4. **Authentication & User Profile Management:**
   - Users collection in MongoDB with bcrypt password hashing and JWT session cookies (`app/lib/auth.ts`).
   - Sign-in (`app/login/page.tsx`) & Sign-up (`app/register/page.tsx`).
   - User Profile management dashboard (`app/profile/page.tsx`) with editable personal/shipping information, password updates, and order statistics.
   - Skeletons and loader states (`app/profile/loading.tsx`).
5. **Checkout & Orders System:**
   - Orders collection in MongoDB with status indicators (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
   - Seamless checkout flow (`app/checkout/page.tsx`) with address form, prefill, payment options, and cart clearing.
   - Orders tracking dashboard (`app/orders/page.tsx`) with filtering, order details, and interactive Order Cancellation with confirmation modal (`app/components/orders/CancelOrderModal.tsx`).
   - Dedicated loaders and skeletons (`app/checkout/loading.tsx`, `app/orders/loading.tsx`).
6. **Admin Command Center & Store Management:**
   - Admin role-based authentication and route guards (`verifyAdminSession`).
   - Auto-seeded default admin account (`admin@nextstore.com` / `Admin@123456`) with quick-fill login helper.
   - Admin command center (`app/admin/page.tsx`) with store performance KPI analytics (Total revenue, pending approvals, order breakdown, catalog counts, users).
   - Order lifecycle management with one-click status transitions (Accept / Approve Order, Dispatch Shipped, Mark Delivered, Cancel Order).
   - Full Product Catalog CRUD: Add new products with live preview, edit existing products, and delete products from MongoDB.
   - Customer accounts registry view (`/admin`).
   - Dedicated skeleton loader (`app/admin/loading.tsx`).

---

## Coding Rules & Conventions
- Prefer **Server Components** by default; use `'use client'` only for interactive state, context hooks, or browser event listeners.
- Use strict TypeScript types (place shared types in `types/`).
- Handle database operations safely with `try/catch` and appropriate error responses.
- Maintain responsive Tailwind CSS layouts matching the existing neutral/minimalist theme.
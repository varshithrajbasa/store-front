"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

export default function Navbar() {
  const { totalItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-tight hover:opacity-80">
          NEXT<span className="text-blue-600">STORE</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <Link href="/products" className="hover:text-black transition">
            All Products
          </Link>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link
              href="/categories"
              className="flex items-center gap-1 hover:text-black transition py-2"
            >
              Categories
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="/categories"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-xs font-bold uppercase text-blue-600 hover:bg-neutral-50 border-b border-neutral-100"
                >
                  View All Categories →
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${encodeURIComponent(cat)}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 capitalize hover:bg-neutral-50 hover:text-black transition"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Cart Icon CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-neutral-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-6 h-6 text-neutral-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in fade-in zoom-in">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
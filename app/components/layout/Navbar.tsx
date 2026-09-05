"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            ref={categoriesDropdownRef}
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link
              href="/categories"
              onClick={() => setDropdownOpen((prev) => !prev)}
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
              <div className="absolute top-full left-0 pt-1.5 w-48 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-lg py-2 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
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
              </div>
            )}
          </div>

          <Link href="/about" id="navbar-about-link" className="hover:text-black transition">
            About
          </Link>

          {/* Admin Direct Portal Link */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              id="navbar-admin-link"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold transition text-xs border border-purple-200/80"
            >
              <span>👑</span>
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right CTA Area: Cart + Auth State */}
        <div className="flex items-center gap-3">
          {/* Cart Icon CTA */}
          <Link
            href="/cart"
            id="navbar-cart-btn"
            className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-neutral-100 transition"
            aria-label="View Shopping Cart"
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

          {/* Auth State */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : user ? (
            <div
              ref={userDropdownRef}
              className="relative"
              onMouseEnter={() => setUserDropdownOpen(true)}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <button
                id="user-profile-menu-button"
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition"
              >
                <div
                  className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center uppercase ${
                    user.role === "admin" ? "bg-purple-600" : user.role === "test" ? "bg-amber-600" : "bg-blue-600"
                  }`}
                >
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <span className="text-xs font-medium text-neutral-800 max-w-[100px] truncate hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-56 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-xl py-2 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700 font-bold"
                            : user.role === "test"
                            ? "bg-amber-100 text-amber-800 font-bold border border-amber-200"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 border-b border-neutral-100">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          id="navbar-dropdown-admin-link"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-semibold transition"
                        >
                          <span>👑</span>
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        id="navbar-user-profile-link"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-black transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Profile Settings
                      </Link>

                      <Link
                        href="/orders"
                        id="navbar-user-orders-link"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-black transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        My Orders
                      </Link>
                    </div>

                    <button
                      id="logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="navbar-login-link"
                className="text-xs sm:text-sm font-medium text-neutral-700 hover:text-black px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                id="navbar-register-link"
                className="text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-black text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
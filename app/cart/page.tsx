"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Your cart is empty</h1>
        <p className="text-neutral-500 mb-8">Looks like you haven&apos;t added any items yet.</p>
        <Link
          href="/products"
          className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-6 py-3 rounded-xl transition"
        >
          Explore Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 divide-y divide-neutral-200">
          {cart.map((item) => (
            <div key={item.id} className="py-6 flex gap-6 items-center">
              <div className="relative w-20 h-20 bg-white border border-neutral-200 rounded-xl p-2 flex-shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-contain" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900 truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5">${item.price.toFixed(2)} each</p>

                <div className="flex items-center gap-3 mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 rounded-l-lg transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 rounded-r-lg transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-neutral-400 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-neutral-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">Order Summary</h2>

          <div className="space-y-2 text-sm text-neutral-600 border-b border-neutral-200 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
          </div>

          <div className="flex justify-between text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            id="cart-checkout-btn"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-center block text-sm"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
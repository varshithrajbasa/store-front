"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShippingAddress } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [customAddress, setCustomAddress] = useState<Partial<ShippingAddress>>({});

  const formData: ShippingAddress = {
    fullName: customAddress.fullName ?? (user?.name || ""),
    phone: customAddress.phone ?? (user?.phone || ""),
    address: customAddress.address ?? (user?.address || ""),
    city: customAddress.city ?? (user?.city || ""),
    postalCode: customAddress.postalCode ?? (user?.postalCode || ""),
    country: customAddress.country ?? (user?.country || "United States"),
  };

  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");
  const cardNumber = "•••• •••• •••• 4242";
  const cardExpiry = "12/28";
  const cardCvc = "•••";

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your contact phone number.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage("Please enter your delivery street address.");
      return;
    }
    if (!formData.city.trim() || !formData.postalCode.trim() || !formData.country.trim()) {
      setErrorMessage("Please complete all city, postal code, and country fields.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        })),
        shippingAddress: formData,
        paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order. Please try again.");
      }

      // If user opted to save address to profile, update profile (skipped for test role)
      if (saveAddressToProfile && user && user.role !== "test") {
        fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          }),
        }).catch((err) => console.error("Failed to update profile address:", err));
      }

      // Clear cart
      clearCart();

      // Redirect to orders page with success notification
      router.push("/orders?success=true");
    } catch (err) {
      setErrorMessage((err as Error).message || "An unexpected error occurred during checkout.");
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-8 w-48 bg-neutral-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-neutral-100 rounded-2xl" />
          <div className="h-80 bg-neutral-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  // Not signed in state
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Account Required for Checkout</h1>
        <p className="text-sm text-neutral-500 mb-8 max-w-md mx-auto">
          Please sign in to your NextStore account to securely complete your purchase and track your order in real time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?redirect=/checkout"
            id="checkout-login-btn"
            className="w-full sm:w-auto bg-neutral-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-sm"
          >
            Sign In to Checkout
          </Link>
          <Link
            href="/register?redirect=/checkout"
            id="checkout-register-btn"
            className="w-full sm:w-auto bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-sm font-semibold px-6 py-3 rounded-xl transition"
          >
            Create New Account
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Your Cart is Empty</h1>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm mx-auto">
          You don&apos;t have any products in your cart to checkout.
        </p>
        <Link
          href="/products"
          className="inline-block bg-neutral-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-sm"
        >
          Explore Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-6">
        <Link href="/cart" className="hover:text-neutral-900 transition flex items-center gap-1">
          <span>← Back to Cart</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-900">Secure Checkout</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-8">
        Checkout & Payment
      </h1>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-3 animate-in fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Shipping Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Country / Region *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <label
                className={`inline-flex items-center gap-2 text-xs ${
                  user?.role === "test"
                    ? "text-neutral-400 cursor-not-allowed"
                    : "cursor-pointer text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={user?.role === "test"}
                  checked={user?.role === "test" ? false : saveAddressToProfile}
                  onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span>
                  Save this address to my profile as default{" "}
                  {user?.role === "test" && "(Disabled for test user)"}
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Card */}
              <label
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "Credit / Debit Card"
                    ? "border-blue-600 bg-blue-50/20 shadow-xs"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Credit / Debit Card"
                  checked={paymentMethod === "Credit / Debit Card"}
                  onChange={() => setPaymentMethod("Credit / Debit Card")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">Credit / Debit Card</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        Demo Only
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">VISA</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">MC</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">AMEX</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">Simulated instant card checkout</p>

                  {paymentMethod === "Credit / Debit Card" && (
                    <div className="mt-4 pt-3 border-t border-neutral-200/60 space-y-3">
                      {/* Security / Demo Disclaimer */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5">
                          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold text-amber-950">Card Fields Disabled for Demo Safety</p>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            Card inputs are intentionally locked so users never input real payment credentials. This portfolio store <strong>never charges cards</strong> and <strong>never ships items</strong>. You can safely place a simulated order using the prefilled dummy data.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-2 sm:col-span-3">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-neutral-500">
                              Card Number (Disabled)
                            </label>
                            <span className="text-[10px] text-neutral-400 font-mono">Simulated</span>
                          </div>
                          <input
                            type="text"
                            disabled
                            value={cardNumber}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                            Expires (Disabled)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={cardExpiry}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                            CVC (Disabled)
                          </label>
                          <input
                            type="password"
                            disabled
                            value={cardCvc}
                            placeholder="CVC"
                            className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "Cash on Delivery (COD)"
                    ? "border-blue-600 bg-blue-50/20 shadow-xs"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery (COD)"
                  checked={paymentMethod === "Cash on Delivery (COD)"}
                  onChange={() => setPaymentMethod("Cash on Delivery (COD)")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-bold text-neutral-900">Cash on Delivery (COD)</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Pay in cash when your order is delivered</p>
                </div>
              </label>

              {/* Option 3: UPI / Instant Digital Transfer */}
              <label
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "UPI / Digital Wallet"
                    ? "border-blue-600 bg-blue-50/20 shadow-xs"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI / Digital Wallet"
                  checked={paymentMethod === "UPI / Digital Wallet"}
                  onChange={() => setPaymentMethod("UPI / Digital Wallet")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-bold text-neutral-900">UPI / Digital Wallet</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Instant checkout with Apple Pay, Google Pay, or UPI</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sticky Order Summary */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-200">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            {/* Cart Preview List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-200/60">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 bg-white border border-neutral-200 rounded-lg p-1 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
                    <p className="text-neutral-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-neutral-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-200 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free Express</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="text-neutral-900">$0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-neutral-900">Total</span>
              <span className="text-xl font-extrabold text-neutral-900">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              id="place-order-btn"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Placing Your Order...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Place Order • ${totalPrice.toFixed(2)}</span>
                </>
              )}
            </button>

            {/* Demo Security Note */}
            <div className="space-y-1 pt-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Simulated Checkout • 100% Free Demo</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Zero charges will be billed and no real items will be shipped.
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

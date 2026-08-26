"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Order, OrderStatus } from "@/types/order";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

function OrdersContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isJustPlaced = searchParams.get("success") === "true";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Delivered" | "Cancelled">("All");

  // Modal State
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(
    isJustPlaced ? "Your order was placed successfully! Thank you for shopping with us." : null
  );

  useEffect(() => {
    let active = true;

    if (!authLoading) {
      if (user) {
        fetch("/api/orders")
          .then((res) => res.json())
          .then((data) => {
            if (active) {
              if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders);
              } else if (data.error) {
                setFetchError(data.error);
              }
              setLoading(false);
            }
          })
          .catch((err) => {
            if (active) {
              setFetchError(err.message || "Failed to load orders");
              setLoading(false);
            }
          });
      } else {
        const timer = setTimeout(() => {
          if (active) setLoading(false);
        }, 0);
        return () => {
          clearTimeout(timer);
        };
      }
    }

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Handle Order Cancellation
  const handleOpenCancelModal = (order: Order) => {
    setSelectedOrderForCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (orderId: string, reason: string) => {
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => {
            const currentId = o._id?.toString();
            return currentId === orderId ? { ...o, ...data.order } : o;
          })
        );
        setIsCancelModalOpen(false);
        setSelectedOrderForCancel(null);
        setToastMessage(data.message || "Order cancelled successfully.");
      } else {
        alert(data.error || "Failed to cancel order. Please try again.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while cancelling the order.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return orders;
    if (activeTab === "Active") {
      return orders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.status));
    }
    if (activeTab === "Delivered") {
      return orders.filter((o) => o.status === "Delivered");
    }
    if (activeTab === "Cancelled") {
      return orders.filter((o) => o.status === "Cancelled");
    }
    return orders;
  }, [orders, activeTab]);

  // Helper function for status badges
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Pending Confirmation
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  // Not signed in state
  if (!authLoading && !user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Sign in to view your orders</h1>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto text-sm">
          Please log in to track your past purchases, view order details, or manage active orders.
        </p>
        <Link
          href="/login?redirect=/orders"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-medium px-6 py-3 rounded-xl transition shadow-sm text-sm"
        >
          Sign In to Your Account
        </Link>
      </main>
    );
  }

  // Loading skeleton state
  if (loading || authLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-44 bg-neutral-200 rounded-lg" />
            <div className="h-4 w-64 bg-neutral-100 rounded" />
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-20 bg-neutral-200 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-2xl bg-white p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-neutral-200 rounded" />
                  <div className="h-3 w-24 bg-neutral-100 rounded" />
                </div>
                <div className="h-6 w-24 bg-neutral-200 rounded-full" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                  <div className="h-3 w-1/4 bg-neutral-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Fetch Error Notification */}
      {fetchError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{fetchError}</span>
          </div>
          <button
            onClick={() => setFetchError(null)}
            className="text-red-600 hover:text-red-900 text-xs font-semibold p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">My Orders</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your purchases, check shipment statuses, and track your orders.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(["All", "Active", "Delivered", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              id={`orders-tab-${tab.toLowerCase()}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab}
              {tab === "All" && orders.length > 0 && ` (${orders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="border border-neutral-200 border-dashed rounded-2xl p-12 text-center bg-neutral-50/50">
          <div className="w-14 h-14 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-400 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">
            {activeTab === "All" ? "No orders placed yet" : `No ${activeTab.toLowerCase()} orders found`}
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            {activeTab === "All"
              ? "Looks like you haven't placed any orders yet. Discover our latest products and start shopping!"
              : `You do not have any orders matching the "${activeTab}" status at this time.`}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Explore Catalog →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const orderIdStr = order._id ? order._id.toString() : "";
            const displayId = orderIdStr ? orderIdStr.slice(-8).toUpperCase() : "ORD-UNKNOWN";
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            const canCancel = order.status === "Pending" || order.status === "Processing";

            return (
              <div
                key={orderIdStr}
                id={`order-card-${orderIdStr}`}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Order Card Header */}
                <div className="bg-neutral-50/80 px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                    <div>
                      <span className="text-neutral-500">Order ID: </span>
                      <span className="font-mono font-bold text-neutral-900">#{displayId}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Placed: </span>
                      <span className="font-semibold text-neutral-900">{dateStr}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Payment: </span>
                      <span className="font-semibold text-neutral-900">{order.paymentMethod || "Credit Card"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Total: </span>
                      <span className="font-bold text-neutral-900">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                {/* Order Items */}
                <div className="p-6 divide-y divide-neutral-100">
                  {order.items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <div className="relative w-16 h-16 bg-white border border-neutral-200 rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.id}`}
                          className="text-sm font-semibold text-neutral-900 hover:text-blue-600 transition truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Qty: <span className="font-medium text-neutral-800">{item.quantity}</span> × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-neutral-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer with Shipping details & Actions */}
                <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="text-neutral-600 space-y-0.5">
                    <span className="font-semibold text-neutral-800">Ship to: </span>
                    <span>
                      {order.shippingAddress.fullName} — {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </span>
                    {order.shippingAddress.phone && (
                      <span className="text-neutral-400 ml-1">({order.shippingAddress.phone})</span>
                    )}
                    {order.status === "Cancelled" && order.cancellationReason && (
                      <p className="text-red-600 font-medium pt-1">
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {canCancel && (
                    <button
                      onClick={() => handleOpenCancelModal(order)}
                      id={`cancel-order-btn-${orderIdStr}`}
                      className="px-3.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100 font-semibold rounded-lg transition text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={selectedOrderForCancel}
        isLoading={isCancelling}
        onClose={() => {
          if (!isCancelling) {
            setIsCancelModalOpen(false);
            setSelectedOrderForCancel(null);
          }
        }}
        onConfirm={handleConfirmCancel}
      />
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 w-44 bg-neutral-200 rounded-lg" />
          <div className="h-40 bg-neutral-100 rounded-2xl" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

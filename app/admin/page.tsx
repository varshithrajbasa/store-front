"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Order, OrderStatus } from "@/types/order";
import { Product } from "@/types/product";
import { UserSafe } from "@/types/user";
import { AdminStats, CreateProductInput } from "@/types/admin";

const CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const ORDER_STATUS_TABS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

function AdminDashboardContent() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">("orders");
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<CreateProductInput>({
    title: "",
    price: 0,
    description: "",
    category: "electronics",
    image: "",
    rating: { rate: 4.5, count: 1 },
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Users State
  const [usersList, setUsersList] = useState<UserSafe[]>([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let active = true;

    if (!authLoading) {
      if (user && user.role === "admin") {
        Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/orders").then((r) => r.json()),
          fetch("/api/admin/products").then((r) => r.json()),
          fetch("/api/admin/users").then((r) => r.json()),
        ])
          .then(([statsRes, ordersRes, productsRes, usersRes]) => {
            if (active) {
              if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
              if (ordersRes.success && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
              if (productsRes.success && Array.isArray(productsRes.products)) setProducts(productsRes.products);
              if (usersRes.success && Array.isArray(usersRes.users)) setUsersList(usersRes.users);
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("Failed to load admin data:", err);
            if (active) {
              setToastMessage({ text: "Failed to fetch admin data.", type: "error" });
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

  // Refresh handler for button
  const handleRefreshData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ])
      .then(([statsRes, ordersRes, productsRes, usersRes]) => {
        if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
        if (ordersRes.success && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
        if (productsRes.success && Array.isArray(productsRes.products)) setProducts(productsRes.products);
        if (usersRes.success && Array.isArray(usersRes.users)) setUsersList(usersRes.users);
        setLoading(false);
        showToast("Admin data refreshed!");
      })
      .catch(() => {
        setLoading(false);
        showToast("Failed to refresh data", "error");
      });
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id?.toString() === orderId ? { ...o, ...data.order } : o))
        );
        showToast(`Order status updated to "${newStatus}"!`);

        // Refresh stats
        fetch("/api/admin/stats")
          .then((r) => r.json())
          .then((s) => s.success && setStats(s.stats));
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (err) {
      showToast((err as Error).message || "An error occurred", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Product Modal Open
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: "",
      price: 29.99,
      description: "",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      rating: { rate: 4.8, count: 24 },
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      rating: product.rating,
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim() || productForm.price <= 0 || !productForm.description.trim()) {
      showToast("Please fill in all required product fields with valid values.", "error");
      return;
    }

    try {
      setIsSavingProduct(true);
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `/api/admin/products/${editingProduct!.id}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (data.success && data.product) {
        if (isEditing) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct!.id ? data.product : p))
          );
          showToast(`Product "${data.product.title}" updated successfully!`);
        } else {
          setProducts((prev) => [data.product, ...prev]);
          showToast(`Product "${data.product.title}" added to catalog!`);
        }
        setIsProductModalOpen(false);
      } else {
        showToast(data.error || "Failed to save product", "error");
      }
    } catch (err) {
      showToast((err as Error).message || "An unexpected error occurred", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm(`Are you sure you want to delete product #${productId}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingProductId(productId);
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast(`Product #${productId} removed from catalog.`);
      } else {
        showToast(data.error || "Failed to delete product", "error");
      }
    } catch (err) {
      showToast((err as Error).message || "Failed to delete product", "error");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Filtered Orders Memo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "All" || order.status === orderStatusFilter;

      const orderIdStr = order._id?.toString() || "";
      const query = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        orderIdStr.toLowerCase().includes(query) ||
        order.userEmail.toLowerCase().includes(query) ||
        order.shippingAddress.fullName.toLowerCase().includes(query) ||
        order.shippingAddress.city.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearchQuery.toLowerCase().trim();
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toString().includes(q)
      );
    });
  }, [products, productSearchQuery]);

  // Non-admin / not logged in state
  if (!authLoading && (!user || user.role !== "admin")) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Administrator Access Required</h1>
        <p className="text-sm text-neutral-500 mb-8 max-w-md mx-auto">
          This portal is restricted to authorized store administrators. Please sign in with an administrative account to manage orders and catalog products.
        </p>
        <Link
          href="/login?redirect=/admin"
          id="admin-portal-login-btn"
          className="inline-block bg-neutral-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-sm"
        >
          Sign In as Administrator
        </Link>
      </main>
    );
  }

  // Skeleton state
  if (authLoading || loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-neutral-200 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-neutral-200 rounded-2xl p-5" />
          ))}
        </div>
        <div className="h-96 bg-white border border-neutral-200 rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === "success"
              ? "bg-neutral-900 text-white border border-neutral-800"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Admin Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Administrator
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Accept/Approve customer orders, dispatch shipments, manage products, and monitor sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshData}
            id="admin-refresh-data-btn"
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>

          <Link
            href="/products"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            View Live Store →
          </Link>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Total Revenue</span>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1.5">
            ${stats.totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            From {stats.totalOrders - stats.cancelledOrders} paid orders
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Pending Approval</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1.5">
            {stats.pendingOrders}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
            Needs admin acceptance
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Processing / Shipped</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1.5">
            {stats.processingOrders + stats.shippedOrders}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">
            {stats.processingOrders} in prep, {stats.shippedOrders} on route
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Active Products</span>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1.5">
            {stats.totalProducts}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">
            In store catalog
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-neutral-500">Registered Users</span>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1.5">
            {stats.totalUsers}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">
            Platform accounts
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-8 pb-1">
        <button
          onClick={() => setActiveTab("orders")}
          id="admin-tab-orders"
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          Order Management ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("products")}
          id="admin-tab-products"
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "products"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          id="admin-tab-users"
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "users"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Customer Accounts ({usersList.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDER MANAGEMENT                                                   */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {ORDER_STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOrderStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    orderStatusFilter === tab
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search by email, name, ID..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="border border-neutral-200 border-dashed rounded-3xl p-12 text-center bg-neutral-50/50">
              <p className="text-base font-bold text-neutral-800">No orders match your filter</p>
              <p className="text-xs text-neutral-500 mt-1">Try selecting a different status tab or clearing the search query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderIdStr = order._id?.toString() || "";
                const displayId = orderIdStr ? orderIdStr.slice(-8).toUpperCase() : "ORD-UNKNOWN";
                const isUpdating = updatingOrderId === orderIdStr;

                return (
                  <div
                    key={orderIdStr}
                    className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:border-neutral-300 transition"
                  >
                    {/* Order Header */}
                    <div className="bg-neutral-50/80 px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                        <div>
                          <span className="text-neutral-500">Order: </span>
                          <span className="font-mono font-bold text-neutral-900">#{displayId}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Customer: </span>
                          <span className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</span>
                          <span className="text-neutral-400 ml-1">({order.userEmail})</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Date: </span>
                          <span className="text-neutral-800">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recently"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Total: </span>
                          <span className="font-bold text-neutral-900">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status & Action Buttons */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.status === "Pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : order.status === "Processing"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : order.status === "Shipped"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {order.status}
                        </span>

                        {/* Quick Action: Approve / Accept Order (Pending -> Processing) */}
                        {order.status === "Pending" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(orderIdStr, "Processing")}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                          >
                            {isUpdating ? "Saving..." : "✓ Approve / Accept"}
                          </button>
                        )}

                        {/* Quick Action: Mark Shipped (Processing -> Shipped) */}
                        {order.status === "Processing" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(orderIdStr, "Shipped")}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                          >
                            {isUpdating ? "Saving..." : "🚚 Mark Shipped"}
                          </button>
                        )}

                        {/* Quick Action: Mark Delivered (Shipped -> Delivered) */}
                        {order.status === "Shipped" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(orderIdStr, "Delivered")}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                          >
                            {isUpdating ? "Saving..." : "✓ Mark Delivered"}
                          </button>
                        )}

                        {/* Cancel Action (Available for non-delivered, non-cancelled) */}
                        {order.status !== "Delivered" && order.status !== "Cancelled" && (
                          <button
                            onClick={() => {
                              const reason = prompt("Enter administrative cancellation reason (optional):");
                              handleUpdateOrderStatus(orderIdStr, "Cancelled", reason || "Cancelled by admin");
                            }}
                            disabled={isUpdating}
                            className="px-2.5 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Items */}
                      <div className="md:col-span-2 space-y-2">
                        <span className="font-semibold text-neutral-700 block uppercase tracking-wider text-[10px]">
                          Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)} total)
                        </span>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-neutral-50 p-2 rounded-xl">
                              <div className="relative w-10 h-10 bg-white rounded-lg p-1 border border-neutral-200 flex-shrink-0">
                                <Image src={item.image} alt={item.title} fill sizes="40px" className="object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
                                <p className="text-neutral-500">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <span className="font-bold text-neutral-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment summary */}
                      <div className="bg-neutral-50/60 p-4 rounded-xl space-y-2 border border-neutral-100">
                        <span className="font-semibold text-neutral-700 block uppercase tracking-wider text-[10px]">
                          Delivery & Payment
                        </span>
                        <p className="text-neutral-800 font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-neutral-600">{order.shippingAddress.address}</p>
                        <p className="text-neutral-600">
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        <p className="text-neutral-500">Phone: {order.shippingAddress.phone || "N/A"}</p>
                        <div className="pt-2 border-t border-neutral-200 text-neutral-700 font-medium">
                          Method: {order.paymentMethod || "Credit Card"}
                        </div>
                        {order.cancellationReason && (
                          <p className="text-red-600 font-semibold pt-1">
                            Cancel Reason: {order.cancellationReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCT CATALOG MANAGEMENT                                         */}
      {/* ========================================================================= */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products by title, category, or ID..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={handleOpenAddProduct}
              id="admin-add-product-btn"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              + Add New Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="relative w-full h-44 bg-white border border-neutral-100 rounded-xl p-2 flex items-center justify-center">
                  <Image src={prod.image} alt={prod.title} fill sizes="200px" className="object-contain p-2" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-900 text-white">
                    #{prod.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                  <h3 className="text-xs font-bold text-neutral-900 truncate" title={prod.title}>
                    {prod.title}
                  </h3>
                  <p className="text-sm font-extrabold text-neutral-900">${prod.price.toFixed(2)}</p>
                  <p className="text-[11px] text-neutral-500 line-clamp-2">{prod.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    disabled={deletingProductId === prod.id}
                    className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {deletingProductId === prod.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMER ACCOUNTS OVERVIEW                                         */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Registered Store Accounts</h2>
              <p className="text-xs text-neutral-500">View customer identities and roles.</p>
            </div>
            <span className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700">
              Total Users: {usersList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Shipping Address</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-3.5 font-semibold text-neutral-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "test"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600">
                      {u.address ? `${u.address}, ${u.city || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600">{u.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-neutral-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL                                                  */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">
                {editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="99.99"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                {productForm.image && (
                  <div className="mt-2 w-16 h-16 relative bg-white border border-neutral-200 rounded-lg p-1">
                    <Image src={productForm.image} alt="Preview" fill sizes="64px" className="object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed description of features, specs, and materials..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 font-semibold rounded-xl text-xs hover:bg-neutral-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isSavingProduct ? "Saving Product..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 w-44 bg-neutral-200 rounded-lg" />
          <div className="h-40 bg-neutral-100 rounded-2xl" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

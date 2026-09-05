"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage, ChatOrderSummary } from "@/types/chat";
import { OrderStatus } from "@/types/order";

export default function StoreChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<ChatOrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ChatOrderSummary | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, selectedOrder]);

  // Initial load: fetch welcome message and orders
  useEffect(() => {
    async function initChat() {
      try {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.orders)) {
            setRecentOrders(data.orders);
          }
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            const welcome =
              data.welcomeMessage ||
              "Hello! I am your NextStore shopping assistant. You can check your recent orders, track delivery status, or manage your account.";
            setMessages([
              {
                id: "msg-init",
                role: "assistant",
                content: welcome,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    }
    initChat();
  }, [user]);

  // Clear chat conversation in MongoDB and reset local state
  const handleResetChat = async () => {
    setSelectedOrder(null);
    try {
      await fetch("/api/chat", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: "assistant",
        content:
          "Hello! Chat history cleared. How can I help you today with your orders, store products, or account settings?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Send message to backend
  const handleSendMessage = async (textToSend?: string, specificOrderId?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Auto-clear selected order if the user is asking a broad question or requesting all orders
    const lower = query.toLowerCase();
    if (
      !specificOrderId &&
      (
        lower.includes("all") ||
        lower.includes("other") ||
        lower.includes("list") ||
        lower.includes("recent") ||
        lower.includes("orders") ||
        lower.includes("show orders") ||
        lower.includes("browse") ||
        lower.includes("product") ||
        lower.includes("password") ||
        lower.includes("profile") ||
        lower === "hi" ||
        lower === "hello" ||
        lower === "hey"
      )
    ) {
      setSelectedOrder(null);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      // Build history for API
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history,
          selectedOrderId: specificOrderId || (selectedOrder ? selectedOrder.id : undefined),
        }),
      });

      const data = await res.json();

      if (data.orders && Array.isArray(data.orders)) {
        setRecentOrders(data.orders);
      }

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content:
          data.reply ||
          (data.error
            ? `Notice: ${data.error}`
            : "Hello! How can I help you today with your orders, store products, or account settings?"),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I encountered an issue retrieving that information. Please try again or check your /orders page.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order selection (clicking selected order toggles it off)
  const handleSelectOrder = (order: ChatOrderSummary) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      return;
    }
    setSelectedOrder(order);
    handleSendMessage(
      `Show me the details and status for Order #${order.shortId}`,
      order.id
    );
  };

  // Handle order cancellation from chat
  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId) return;
    setIsCancellingOrder(true);

    try {
      const res = await fetch(`/api/orders/${cancelModalOrderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();

      if (data.success) {
        // Update order list
        setRecentOrders((prev) =>
          prev.map((o) =>
            o.id === cancelModalOrderId
              ? { ...o, status: "Cancelled", canCancel: false, cancellationReason: cancelReason }
              : o
          )
        );

        if (selectedOrder && selectedOrder.id === cancelModalOrderId) {
          setSelectedOrder((prev) =>
            prev
              ? { ...prev, status: "Cancelled", canCancel: false, cancellationReason: cancelReason }
              : null
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `asst-cancel-${Date.now()}`,
            role: "assistant",
            content: `✅ Order #${cancelModalOrderId.slice(-6).toUpperCase()} has been successfully cancelled. Reason: "${cancelReason}".`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("An unexpected error occurred while cancelling your order.");
    } finally {
      setIsCancellingOrder(false);
      setCancelModalOrderId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open NextStore AI Support Assistant"
            className="group relative flex items-center justify-center w-14 h-14 bg-neutral-900 hover:bg-black text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-neutral-300"
          >
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="NextStore Support Chat"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-neutral-900 text-white flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-900"></span>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                  NextStore Assistant
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono">
                    AI
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">Orders, Profile & Store Support</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat History & Deselect Order"
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Action Shortcuts Bar */}
          <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none flex-shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  handleSendMessage("Show my recent orders");
                }}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full font-medium text-neutral-700 whitespace-nowrap shadow-xs transition"
              >
                📦 My Recent Orders
              </button>
            ) : (
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full font-medium text-neutral-700 whitespace-nowrap shadow-xs transition"
              >
                📦 My Recent Orders
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full font-medium text-neutral-700 whitespace-nowrap shadow-xs transition"
            >
              🔑 Manage Profile / Password
            </Link>

            {user ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  handleSendMessage("What are the latest products and updates in the store?");
                }}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full font-medium text-neutral-700 whitespace-nowrap shadow-xs transition"
              >
                🛍️ Store Products
              </button>
            ) : (
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full font-medium text-neutral-700 whitespace-nowrap shadow-xs transition"
              >
                🛍️ Store Products
              </Link>
            )}
          </div>

          {/* Messages & Interactive Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white rounded-br-xs"
                      : "bg-white text-neutral-800 border border-neutral-200 rounded-bl-xs leading-relaxed"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="text-neutral-800 space-y-1.5">
                      <ReactMarkdown
                        components={{
                          strong: ({ ...props }) => <strong className="font-semibold text-neutral-900" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 my-1.5" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 my-1.5" {...props} />,
                          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                          p: ({ ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                          code: ({ ...props }) => (
                            <code className="px-1.5 py-0.5 bg-neutral-100 text-neutral-900 font-mono text-[11px] rounded border border-neutral-200" {...props} />
                          ),
                          a: ({ href, children, ...props }) => {
                            const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
                            if (isInternal) {
                              return (
                                <Link
                                  href={href}
                                  onClick={() => setIsOpen(false)}
                                  className="text-neutral-900 font-semibold underline hover:text-black"
                                  {...props}
                                >
                                  {children}
                                </Link>
                              );
                            }
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline font-medium hover:text-blue-800"
                                {...props}
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {/* Guest State when user is not logged in */}
            {!user && (
              <div className="my-2 bg-white rounded-xl border border-neutral-200 p-3.5 text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-1.5 text-sm">
                  👋
                </div>
                <div className="text-xs font-semibold text-neutral-900">Welcome, Guest Shopper!</div>
                <p className="text-[11px] text-neutral-500 mt-1 mb-2.5 max-w-[260px] mx-auto">
                  Log in to track your past purchases, view order details, or manage your account.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href="/login?redirect=/orders"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg transition shadow-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg transition"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            )}

            {/* Empty Orders State when user has 0 orders */}
            {recentOrders.length === 0 && user && (
              <div className="my-2 bg-white rounded-xl border border-dashed border-neutral-300 p-3.5 text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-1.5 text-sm">
                  📦
                </div>
                <div className="text-xs font-semibold text-neutral-800">No recent orders yet</div>
                <p className="text-[11px] text-neutral-500 mt-1 mb-2.5 max-w-[260px] mx-auto">
                  You haven&apos;t placed any orders yet. Once you complete checkout, your 3 most recent orders will appear here for one-click tracking and cancellation.
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg transition shadow-xs"
                >
                  <span>🛍️</span>
                  <span>Explore Products</span>
                </Link>
              </div>
            )}

            {/* Recent Orders List (When no specific order is active) */}
            {recentOrders.length > 0 && !selectedOrder && (
              <div className="my-2 bg-white rounded-xl border border-neutral-200 p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1">
                    <span>📦</span> Recent Orders ({recentOrders.length})
                  </span>
                  <span className="text-[10px] text-neutral-500">Click an order to inspect</span>
                </div>

                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className="cursor-pointer rounded-lg p-2.5 border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                          <span>#{order.shortId}</span>
                          <span className="text-neutral-400 font-normal">
                            ({order.itemsCount} {order.itemsCount === 1 ? "item" : "items"})
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                        <span>${order.totalAmount.toFixed(2)}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* When an Order is Selected: Show Breadcrumb & Active Order Inspector Card */}
            {selectedOrder && (
              <div className="my-2 space-y-2 animate-in fade-in duration-200">
                {/* Switcher bar: Allows switching back to all orders */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 rounded-lg border border-neutral-200 text-xs text-neutral-700">
                  <span className="font-medium flex items-center gap-1">
                    <span>🔎</span> Viewing #{selectedOrder.shortId}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="text-neutral-900 font-semibold underline text-xs hover:text-black flex items-center gap-1"
                  >
                    <span>← All Orders ({recentOrders.length})</span>
                  </button>
                </div>

                {/* The Active Order Inspector Card */}
                <div className="bg-neutral-900 text-white rounded-xl p-3.5 shadow-md text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Active Order Inspector
                      </span>
                      <span className="font-bold text-sm text-white">Order #{selectedOrder.shortId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                      {/* Close button to dismiss the card */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        aria-label="Close Order Inspector"
                        className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-xs"
                        title="Close details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1 text-neutral-300">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Purchased Items:
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="truncate max-w-[200px] text-neutral-200">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="text-neutral-400 font-mono">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-1 text-neutral-200 font-semibold text-xs">
                      <span>Total:</span>
                      <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    {selectedOrder.canCancel && (
                      <button
                        onClick={() => setCancelModalOrderId(selectedOrder.id)}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel Order
                      </button>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setIsOpen(false)}
                      className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs transition flex items-center gap-1"
                    >
                      View in Orders →
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg text-xs transition ml-auto"
                    >
                      ✕ Close Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-2xl w-16 border border-neutral-200 shadow-xs">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Profile Prompt Helper */}
          <div className="px-3 py-1.5 bg-neutral-100/70 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600">
            <span>Need to update password or address?</span>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-neutral-900 font-semibold underline hover:text-black"
            >
              Go to Profile
            </Link>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about orders, delivery status, or store..."
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              aria-label="Send message"
              className="p-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          {/* AI Disclaimer */}
          <div className="py-1.5 px-3 bg-neutral-50 border-t border-neutral-100 text-center flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-neutral-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>NextStore AI can make mistakes. Please verify important order details.</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Direct Order Cancellation from Chat */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-neutral-200 space-y-3">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <span className="text-red-600">⚠️</span> Cancel Order #{cancelModalOrderId.slice(-6).toUpperCase()}
            </h4>
            <p className="text-xs text-neutral-500">
              Are you sure you want to cancel this order? This action cannot be reversed.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 block">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={isCancellingOrder}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-800"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrderId(null)}
                disabled={isCancellingOrder}
                className="flex-1 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancellingOrder}
                className="flex-1 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs flex items-center justify-center gap-1"
              >
                {isCancellingOrder ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

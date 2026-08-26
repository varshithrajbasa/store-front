"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types/order";

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => Promise<void>;
}

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Need to modify shipping address / items",
  "Other reason",
];

export default function CancelOrderModal({
  isOpen,
  order,
  isLoading,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customNote, setCustomNote] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderIdDisplay = order._id
    ? typeof order._id === "string"
      ? order._id.slice(-6).toUpperCase()
      : order._id.toString().slice(-6).toUpperCase()
    : "ORDER";

  const fullOrderId = order._id ? order._id.toString() : "";

  const handleConfirm = async () => {
    const reason = selectedReason === "Other reason" && customNote.trim()
      ? `Other: ${customNote.trim()}`
      : selectedReason;
    await onConfirm(fullOrderId, reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          id="cancel-modal-close-btn"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Alert Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h2 id="cancel-dialog-title" className="text-xl font-bold text-neutral-900 tracking-tight">
              Cancel Order #{orderIdDisplay}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Are you sure you want to cancel this order? This action cannot be reversed.
            </p>
          </div>
        </div>

        {/* Order Details Preview */}
        <div className="bg-neutral-50 rounded-xl p-3.5 mb-5 border border-neutral-100 text-xs text-neutral-600 space-y-1.5">
          <div className="flex justify-between font-medium text-neutral-800">
            <span>Items ({order.items.reduce((s, i) => s + i.quantity, 0)} total):</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-neutral-500 truncate">
            {order.items.map((item) => `${item.quantity}x ${item.title}`).join(", ")}
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-3 mb-6">
          <label htmlFor="cancel-reason-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Reason for cancellation
          </label>
          <select
            id="cancel-reason-select"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isLoading}
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {selectedReason === "Other reason" && (
            <textarea
              rows={2}
              placeholder="Please specify why you are cancelling..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              disabled={isLoading}
              className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            id="cancel-modal-keep-btn"
            className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition text-sm disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            id="cancel-modal-confirm-btn"
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Yes, Cancel Order</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

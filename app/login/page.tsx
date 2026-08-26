"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect
  if (user && !isSubmitting && !success) {
    const destination = redirectTarget || (user.role === "admin" ? "/admin" : "/");
    router.push(destination);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          const destination = redirectTarget || (email.toLowerCase().includes("admin") ? "/admin" : "/");
          router.push(destination);
          router.refresh();
        }, 600);
      } else {
        // If admin login fails because seed hasn't run, trigger seed & retry once
        if (email.trim().toLowerCase() === "admin@nextstore.com") {
          try {
            await fetch("/api/seed");
            const retryRes = await login(email.trim(), password);
            if (retryRes.success) {
              setSuccess(true);
              setTimeout(() => {
                router.push(redirectTarget || "/admin");
                router.refresh();
              }, 600);
              return;
            }
          } catch {
            // Ignore retry error
          }
        }
        setError(res.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-black tracking-tight hover:opacity-80 inline-block">
            NEXT<span className="text-blue-600">STORE</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-500">
            Sign in to access your account, orders, or admin dashboard
          </p>
        </div>

        {error && (
          <div
            id="login-error-banner"
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            id="login-success-banner"
            className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3 animate-in fade-in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-green-600 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Signed in successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
              disabled={isSubmitting || success}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
              >
                Password
              </label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
              disabled={isSubmitting || success}
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting || success}
            className="w-full mt-2 py-3 px-4 bg-neutral-900 hover:bg-black text-white font-medium rounded-xl transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100">
          <p className="text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              id="login-to-register-link"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

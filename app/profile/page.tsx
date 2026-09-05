"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserSafe } from "@/types/user";

interface ProfileStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"details" | "security">("details");
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileData, setProfileData] = useState<UserSafe | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTestUser = profileData?.role === "test" || authUser?.role === "test";

  useEffect(() => {
    let active = true;

    if (!authLoading) {
      if (authUser) {
        fetch("/api/user/profile")
          .then((res) => res.json())
          .then((data) => {
            if (active && data.success && data.user) {
              setProfileData(data.user);
              setName(data.user.name || "");
              setPhone(data.user.phone || "");
              setAddress(data.user.address || "");
              setCity(data.user.city || "");
              setPostalCode(data.user.postalCode || "");
              setCountry(data.user.country || "United States");

              if (data.stats) {
                setStats(data.stats);
              }
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("Failed to load profile:", err);
            if (active) setLoading(false);
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
  }, [authUser, authLoading]);

  // Handle Details Update
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (isTestUser) {
      setErrorMessage("The test user account is in read-only mode. Personal details cannot be modified.");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Please enter a valid full name (at least 2 characters).");
      return;
    }

    try {
      setSavingDetails(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile details.");
      }

      setProfileData(data.user);
      updateUser(data.user);
      setSuccessMessage("Your profile and shipping details have been updated successfully!");
    } catch (err) {
      setErrorMessage((err as Error).message || "An unexpected error occurred while saving profile.");
    } finally {
      setSavingDetails(false);
    }
  };

  // Handle Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (isTestUser) {
      setErrorMessage("The test user account is in read-only mode. Password changes are disabled.");
      return;
    }

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Your password has been changed successfully!");
    } catch (err) {
      setErrorMessage((err as Error).message || "An error occurred while updating password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Not signed in state
  if (!authLoading && !authUser) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Sign in to view your profile</h1>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm mx-auto">
          Please sign in to your NextStore account to manage your profile and shipping preferences.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="inline-block bg-neutral-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-sm"
        >
          Sign In
        </Link>
      </main>
    );
  }

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-12 animate-pulse space-y-8">
        <div className="h-44 bg-neutral-100 rounded-2xl" />
        <div className="h-10 w-64 bg-neutral-200 rounded-xl" />
        <div className="h-96 bg-white border border-neutral-200 rounded-2xl p-6" />
      </main>
    );
  }

  const userInitial = profileData?.name ? profileData.name.charAt(0).toUpperCase() : "U";
  const joinedDate = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 sm:py-12">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-white text-2xl sm:text-3xl font-extrabold flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0 ${
              profileData?.role === "admin"
                ? "bg-purple-600"
                : isTestUser
                ? "bg-amber-600"
                : "bg-blue-600"
            }`}>
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {profileData?.name || authUser?.name}
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                  profileData?.role === "admin"
                    ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                    : isTestUser
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                }`}>
                  {profileData?.role || (isTestUser ? "test" : "user")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">{profileData?.email || authUser?.email}</p>
              <p className="text-xs text-neutral-500 mt-1">Member since {joinedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/orders"
              id="profile-my-orders-btn"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition backdrop-blur-sm border border-white/10"
            >
              My Orders ({stats.totalOrders})
            </Link>
            <button
              onClick={() => logout()}
              id="profile-logout-btn"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-xl transition border border-red-500/30"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2.5">
            <p className="text-lg font-bold text-white">{stats.totalOrders}</p>
            <p className="text-[11px] text-neutral-400">Total Orders</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <p className="text-lg font-bold text-blue-400">{stats.activeOrders}</p>
            <p className="text-[11px] text-neutral-400">In Progress</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <p className="text-lg font-bold text-emerald-400">{stats.completedOrders}</p>
            <p className="text-[11px] text-neutral-400">Delivered</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <p className="text-lg font-bold text-neutral-400">{stats.cancelledOrders}</p>
            <p className="text-[11px] text-neutral-400">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Test Account Read-Only Notice Banner */}
      {isTestUser && (
        <div className="mb-6 p-4.5 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl flex items-start gap-3.5 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="font-bold block text-sm text-amber-900">Test Account (Read-Only Mode)</span>
            <span className="text-xs text-amber-800 leading-relaxed block mt-0.5">
              You are signed in with the test demonstration account (<span className="font-mono font-semibold">role: test</span>). For integrity, personal details, delivery addresses, and password modification are restricted. You can still explore the catalog, add products to cart, and test simulated orders.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-8 pb-1">
        <button
          onClick={() => {
            setActiveTab("details");
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          id="tab-profile-details"
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "details"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Personal & Shipping Details
        </button>

        <button
          onClick={() => {
            setActiveTab("security");
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          id="tab-profile-security"
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Security & Password
        </button>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold p-1">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 text-xs font-semibold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Personal & Shipping Details Form */}
      {activeTab === "details" && (
        <form onSubmit={handleSaveDetails} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Personal Information</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isTestUser
                ? "Information editing is locked for the test demo account."
                : "Update your personal display name and default delivery address."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                id="profile-name-input"
                required
                disabled={isTestUser || savingDetails}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profileData?.email || ""}
                  className="w-full px-3.5 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isTestUser ? "Test Account" : "Verified"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                id="profile-phone-input"
                disabled={isTestUser || savingDetails}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Country
              </label>
              <select
                id="profile-country-input"
                disabled={isTestUser || savingDetails}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
                <option value="Germany">Germany</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-800 mb-3">Default Shipping Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="profile-address-input"
                    disabled={isTestUser || savingDetails}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                      isTestUser
                        ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                        : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      id="profile-city-input"
                      disabled={isTestUser || savingDetails}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                        isTestUser
                          ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                          : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      id="profile-postal-input"
                      disabled={isTestUser || savingDetails}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                        isTestUser
                          ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                          : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              type="submit"
              disabled={savingDetails || isTestUser}
              id="save-profile-btn"
              className={`w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
                isTestUser
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75"
              }`}
            >
              {savingDetails ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving Changes...</span>
                </>
              ) : isTestUser ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  <span>Editing Disabled for Test User</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security / Password Form */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Change Password</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isTestUser
                ? "Password modification is disabled for the demo test account."
                : "Ensure your account is using a long, secure password."}
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                id="current-password-input"
                required
                disabled={isTestUser || savingPassword}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isTestUser ? "••••••••" : "Enter current password"}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                New Password (min 6 characters) *
              </label>
              <input
                type="password"
                id="new-password-input"
                required
                disabled={isTestUser || savingPassword}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isTestUser ? "••••••••" : "Enter new password"}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirm-password-input"
                required
                disabled={isTestUser || savingPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isTestUser ? "••••••••" : "Re-type new password"}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition ${
                  isTestUser
                    ? "bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-neutral-100">
            <button
              type="submit"
              disabled={savingPassword || isTestUser}
              id="change-password-btn"
              className={`w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
                isTestUser
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-neutral-900 hover:bg-black active:bg-neutral-800 disabled:opacity-75"
              }`}
            >
              {savingPassword ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : isTestUser ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  <span>Password Changes Disabled for Test User</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

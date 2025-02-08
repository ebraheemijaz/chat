// src/components/Header.jsx
"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useContext(AuthContext);

  console.log(
    "HEADER AUTH STATUS:",
    isAuthenticated,
    "USER:",
    user,
    "LOADING:",
    loading
  );

  return (
    <header className="w-full py-4 px-10 text-white">
      <nav className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="coursebuddy logo" className="h-10 w-auto" />
        </Link>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/learnmore"
            className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
          >
            How it Works
          </Link>

          {/* If loading, show nothing or a loader */}
          {loading && <span className="text-gray-300">Loading...</span>}

          {/* If not authenticated and not loading, show Sign In / Sign Up */}
          {!isAuthenticated && !loading && (
            <>
              <Link
                href="/signin"
                className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* If authenticated, show Profile and Sign Out and Browse Profiles */}
          {isAuthenticated && !loading && (
            <>
              <Link
                href="/profile"
                className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
              >
                My Profile
              </Link>

              <Link
                href="/chat"
                className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
              >
                Chat
              </Link>

              <Link
                href="/browseprofiles"
                className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
              >
                Browse Profiles
              </Link>

              <button
                onClick={logout}
                className="cta-button bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

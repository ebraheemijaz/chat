// app/context/AuthContext.jsx
"use client";

import { useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Add user state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on component mount by calling the /api/auth/me endpoint
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies
        });

        if (!res.ok) {
          throw new Error("Failed to fetch authentication status");
        }

        const data = await res.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user); // Set user data
        } else {
          setIsAuthenticated(false);
          setUser(null);
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    console.log("userData", userData);
    setIsAuthenticated(true);
    setUser({ ...userData, _id: userData?.id }); // Update user state with user data
  };

  const logout = () => {
    // Call the logout API endpoint to clear the authToken cookie
    const performLogout = async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.error("Failed to logout");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    performLogout();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// app/components/ProtectedRoute.jsx
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter }from "next/navigation"; // Correct import for App Router

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to signin page if not authenticated
        router.push("/signin");
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return children;
}

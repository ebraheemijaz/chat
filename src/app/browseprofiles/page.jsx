// app/search/page.jsx
"use client";

import { useEffect, useState, useContext } from "react";
import UserProfile from "../components/UserCard";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SearchPage() {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  // Function to fetch profiles
  const fetchProfiles = async (url) => {
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      });

      if (res.status === 401) {
        // Unauthorized - session expired
        setErrorMsg("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        setErrorMsg(errData.message || "Failed to fetch profiles.");
        return;
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setErrorMsg("Error fetching profiles.");
    }
  };

  // 1) On mount, fetch all profiles (no search term)
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles("/api/profiles/search");
    }
  }, [isAuthenticated]);

  // 2) When user clicks Search, call the same endpoint with `q` if present
  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResults([]);

    const url = searchTerm
      ? `/api/profiles/search?q=${encodeURIComponent(searchTerm)}`
      : "/api/profiles/search";

    await fetchProfiles(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">
          <strong>Search</strong>
        </h1>

        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            placeholder="Search for a course, college or course code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-2 py-1 mr-2 text-gray-800 w-96 rounded-xl pl-3"
          />
          <button
            type="submit"
            className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
          >
            Search
          </button>
        </form>

        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

        {/* 3) Display results (all or filtered) */}
        {results.length === 0 && !errorMsg ? (
          <p>No profiles found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((profile) => (
              <div key={profile._id}>
                {/* Display the card */}
                <UserProfile
                  isMyCourse={profile.userId === user?._id}
                  courseOwnerId={profile.userId}
                  name={profile.name}
                  course={profile.course}
                  college={profile.college}
                  code={profile.code}
                  advice={profile.advice}
                  description={profile.description}
                  bio={profile.bio}
                  isVerified={profile.isVerified}
                  profileImage={profile.profileImage} // <-- add this line
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

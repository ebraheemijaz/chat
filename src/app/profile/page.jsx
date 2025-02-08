// src/app/profile/page.jsx
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const { isAuthenticated, user, loading, logout } = useContext(AuthContext);

  // Profile states
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Form fields
  const [courseName, setCourseName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [advice, setAdvice] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(""); // Base64 string

  useEffect(() => {
    if (loading || !isAuthenticated) {
      setLoadingProfile(false);
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include", // Include cookies
        });
        if (!res.ok) {
          const errorData = await res.json();
          setFetchError(errorData.message || "Failed to fetch profile");
          setLoadingProfile(false);
          return;
        }
        const data = await res.json();
        setProfile(data);

        // Populate form fields
        setCourseName(data.courseName || "");
        setCollegeName(data.collegeName || "");
        setCourseCode(data.courseCode || "");
        setAdvice(data.advice || "");
        setDescription(data.description || "");
        setBio(data.bio || "");
        setProfileImage(data.profileImage || ""); // If no image, stays empty
      } catch (error) {
        console.error("Error fetching profile:", error);
        setFetchError("Failed to fetch profile");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, loading]);

  // Handle file input change -> convert to Base64
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result); // This is a Base64 data URL
    };
    reader.readAsDataURL(file);
  }

  // Submitting the updated profile
  async function handleUpdateProfile(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName,
          collegeName,
          courseCode,
          advice,
          description,
          bio,
          profileImage, // include the base64 image data
        }),
        credentials: "include", // Include cookies
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "Profile update failed"}`);
        return;
      }

      const updatedData = await res.json();
      alert("Profile updated successfully!");

      // Update local profile state with the updated data
      setProfile(updatedData);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile");
    }
  }

  if (loading || loadingProfile) {
    return <div className="p-4">Loading your profile...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-4">Please sign in to view your profile.</div>;
  }

  if (fetchError) {
    return <div className="p-4 text-red-600">Error: {fetchError}</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl mb-4 text-gray-800">Your Profile</h2>
      {profile && (
        <div className="mb-6">
          <p className="text-gray-800">
            <strong>Name:</strong> {profile.name || "Not set"}
          </p>

          {/* Display the user's image if available */}
          {profile.profileImage && (
            <div className="mt-4">
              <img
                src={profile.profileImage}
                alt="Profile"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-800">
            Course Name
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Enter your course name"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-800">
            College Name
          </label>
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Enter your college"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-800">
            Course Code
          </label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Enter your course code"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-800">
            Advice
          </label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Share your advice"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-800">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Describe yourself"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-800">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pl-2"
            placeholder="Include a short bio"
          />
        </div>

        {/* Image field */}
        <div>
          <label className="block font-medium text-gray-800">
            Profile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block text-gray-800"
          />
        </div>

        <button
          type="submit"
          className="cta-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition shadow"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}

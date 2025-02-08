// src/components/SignupForm.jsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    // Send POST request to the signup API route
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
    } else {
      setMessage("User created successfully!");
      // Optionally, redirect to sign-in page or automatically sign in
      setEmail("");
      setPassword("");
      setName("");
      router.push("/signin"); // Redirect to sign-in page
    }
  };

  return (
    <form onSubmit={handleSignup} className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl text-black">
      <h2></h2>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-3">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 pl-4 border rounded-full text-gray-700"
          placeholder="Just your firstname..."
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-3">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 pl-4 border rounded-full text-gray-700 text-gray-700"
          placeholder="john@example.com"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-3">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 pl-4 border rounded-full text-gray-700"
          placeholder="Your password"
        />
      </div>

      <div className="mb-4">
        <label>Student?</label>
        <input
        type="checkbox">

        </input>
      </div>

      <button
        type="submit"
        className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
      >
        Sign Up
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </form>
  );
};

export default SignupForm;

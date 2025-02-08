// app/components/SigninForm.jsx

"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext"; // Ensure the path is correct

const SigninForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // { text: "", type: "error" | "success" }
  const router = useRouter();
  const { login } = useContext(AuthContext); // Utilize AuthContext's login function

  const handleSignin = async (e) => {
    e.preventDefault();

    setMessage({ text: "", type: "" }); // Reset message

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If response is not ok, set error message
        setMessage({
          text: data.message || "Something went wrong.",
          type: "error",
        });
      } else {
        // If login is successful
        setMessage({ text: "Signed in successfully!", type: "success" });
        login(data?.user); // Update AuthContext's state
        router.push("/profile"); // Redirect to a protected route
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSignin}
      className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl mb-4 text-black">Sign In</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-3">
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-xl text-gray-700"
          placeholder="Your email"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-3">
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border rounded-xl text-gray-700"
          placeholder="Your password"
        />
      </div>
      <button
        type="submit"
        className="cta-button bg-white text-[#32064A] px-6 py-2 rounded-full shadow hover:bg-[#32064A] hover:text-white transition"
      >
        Sign In
      </button>
      {message.text && (
        <p
          className={`mt-4 ${
            message.type === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
};

export default SigninForm;

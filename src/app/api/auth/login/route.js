// app/api/auth/login/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { ObjectId } from "mongodb"; // Properly import ObjectId

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

// Initialize RateLimiter
const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of allowed attempts
  duration: 60, // Per 60 seconds
});

const getUserByEmail = async (email) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db().collection("users");
    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
};

export async function POST(request) {
  try {
    // Retrieve IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.ip ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate Limiting
    try {
      await rateLimiter.consume(ip);
    } catch (rlRejected) {
      // Rate limit exceeded
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Ensure the request has the correct content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Invalid content type" },
        { status: 400 }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Retrieve user from the database
    const user = await getUserByEmail(email);
    if (!user) {
      console.log(`Login failed: User with email ${email} not found.`);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}.`);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT payload
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };

    // Sign JWT
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Create response with HTTP-only cookie and user data
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
    response.cookies.set("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour in seconds
    });

    console.log(`User ${email} logged in successfully.`);

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

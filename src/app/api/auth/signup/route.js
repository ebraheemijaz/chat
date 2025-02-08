// app/api/auth/signup/route.js

import { hash } from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Basic validation
    if (!email || !email.includes("@") || !password || password.length < 6) {
      return new Response(JSON.stringify({ message: "Invalid input." }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const usersCollection = client.db().collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists." }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
    });

    return new Response(
      JSON.stringify({ message: "User created successfully!", user: { id: result.insertedId, email, name } }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

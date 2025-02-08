// app/api/auth/me/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb"; // Properly import ObjectId

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export async function GET(request) {
  try {
    // Retrieve cookies from the request
    const cookies = request.cookies;
    const token = cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Fetch user from the database
    const client = await clientPromise;
    const usersCollection = client.db().collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) }, // Use imported ObjectId
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Return user data
    return NextResponse.json({ authenticated: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

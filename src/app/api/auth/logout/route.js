// app/api/auth/logout/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    // Clear the authToken cookie
    response.cookies.set("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0), // Expire the cookie immediately
    });

    return response;
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

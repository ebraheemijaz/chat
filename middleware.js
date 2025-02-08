// middleware.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your environment variables

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware running for pathname: ${pathname}`);

  // Define routes that require authentication
  const protectedRoutes = ["/browseprofiles"];

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get("authToken")?.value;
    console.log(`Protected route accessed. Token: ${token}`);

    if (!token) {
      console.log("No token found. Redirecting to /login.");
      // Redirect to login if no token is found
      const loginUrl = new URL("/signin", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the JWT token
      jwt.verify(token, JWT_SECRET);
      console.log("Token is valid. Proceeding with the request.");
      // Token is valid, proceed with the request
      return NextResponse.next();
    } catch (error) {
      console.error("Token verification failed:", error);
      // Redirect to login if token is invalid or expired
      const loginUrl = new URL("/signin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/browseprofiles"],
};

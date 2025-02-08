// app/api/profile/route.js

import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

/**
 * Helper function to authenticate the user by verifying the JWT in cookies.
 * @param {Request} request - The incoming request object.
 * @returns {string|null} - Returns the userId if authenticated, otherwise null.
 */
export async function authenticate(request) {
  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    console.warn("Authentication failed: No authToken cookie found.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      console.warn("Authentication failed: userId not found in token.");
      return null;
    }
    return decoded.userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * GET: Fetch user's profile from "profiles" collection
 */
export async function GET(request) {
  console.log("----- GET /api/profile START -----");

  const userId = await authenticate(request);

  if (!userId) {
    console.warn("Unauthorized access attempt to GET /api/profile.");
    return NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const profilesCollection = db.collection("profiles");
    const usersCollection = db.collection("users");

    const userObjectId = new ObjectId(userId);

    // Verify user exists
    const user = await usersCollection.findOne({ _id: userObjectId });
    if (!user) {
      console.warn(`User with ID ${userId} not found.`);
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch existing profile or use defaults
    const profile = (await profilesCollection.findOne({
      userId: userObjectId,
    })) ?? {
      courseName: "",
      collegeName: "",
      courseCode: "",
      advice: "",
      description: "",
      bio: "",
      profileImage: "", // default empty if no image
      email: "",
    };

    // Combine name + profile fields
    const combinedData = {
      name: user.name ?? "",
      email: user.email,
      courseName: profile.courseName,
      collegeName: profile.collegeName,
      courseCode: profile.courseCode,
      advice: profile.advice,
      description: profile.description,
      bio: profile.bio,
      profileImage: profile.profileImage, // include image in response
    };

    console.log(`Profile fetched for user ID ${userId}.`);

    return NextResponse.json(combinedData, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * PUT: Update (or create) user's profile (including base64 image)
 */
export async function PUT(request) {
  const userId = await authenticate(request);

  if (!userId) {
    console.warn("Unauthorized access attempt to PUT /api/profile.");
    return NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let parsedBody;
  try {
    parsedBody = await request.json();
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Destructure the new "profileImage" field along with the others
  const {
    courseName,
    collegeName,
    courseCode,
    advice,
    description,
    bio,
    profileImage,
  } = parsedBody;

  // Validate input
  if (
    typeof courseName !== "string" ||
    typeof collegeName !== "string" ||
    typeof courseCode !== "string" ||
    typeof advice !== "string" ||
    typeof description !== "string" ||
    typeof bio !== "string" ||
    (profileImage && typeof profileImage !== "string")
  ) {
    console.warn("Invalid input data provided for profile update.");
    return NextResponse.json(
      { message: "Invalid input data" },
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const profilesCollection = db.collection("profiles");
    const usersCollection = db.collection("users");

    const userObjectId = new ObjectId(userId);

    // Verify user exists
    const user = await usersCollection.findOne({ _id: userObjectId });
    if (!user) {
      console.warn(`User with ID ${userId} not found during profile update.`);
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if there's an existing profile
    const existingProfile = await profilesCollection.findOne({
      userId: userObjectId,
    });

    const updateDoc = {
      courseName,
      collegeName,
      courseCode,
      advice,
      description,
      bio,
      // email
    };

    // Only store the image if provided
    if (profileImage) {
      updateDoc.profileImage = profileImage;
    }

    if (existingProfile) {
      // Update existing profile
      const updateResult = await profilesCollection.updateOne(
        { userId: userObjectId },
        { $set: updateDoc }
      );

      if (updateResult.modifiedCount === 0) {
        console.warn(`No changes made to profile for user ID ${userId}.`);
        return NextResponse.json(
          { message: "No changes made to profile" },
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(`Profile updated for user ID ${userId}.`);

      // Fetch the updated profile
      const updatedProfile = await profilesCollection.findOne(
        { userId: userObjectId },
        { projection: { _id: 0, userId: 0 } } // Exclude internal fields
      );

      // Combine name + profile fields
      const combinedData = {
        name: user.name ?? "",
        email: user.email,
        courseName: updatedProfile.courseName,
        collegeName: updatedProfile.collegeName,
        courseCode: updatedProfile.courseCode,
        advice: updatedProfile.advice,
        description: updatedProfile.description,
        bio: updatedProfile.bio,
        profileImage: updatedProfile.profileImage,
      };

      return NextResponse.json(combinedData, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Create new profile
      const insertResult = await profilesCollection.insertOne({
        userId: userObjectId,
        courseName,
        collegeName,
        courseCode,
        advice,
        description,
        bio,
        profileImage: profileImage || "",
        // email,
      });

      console.log(`Profile created for user ID ${userId}.`);

      // Prepare the created profile data
      const createdProfile = {
        name: user.name ?? user.email ?? "",
        courseName,
        collegeName,
        courseCode,
        advice,
        description,
        bio,
        profileImage: profileImage || "",
        // email,
      };

      return NextResponse.json(createdProfile, {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

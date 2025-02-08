// app/api/profiles/search/route.js
import clientPromise from "../../../../lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    const client = await clientPromise;
    const db = client.db();
    const profilesCollection = db.collection("profiles");
    const usersCollection = db.collection("users");

    let query = {};

    if (q.length > 0) {
      // If there's a search term, do a $regex on multiple fields
      query = {
        $or: [
          { courseName: { $regex: q, $options: "i" } },
          { collegeName: { $regex: q, $options: "i" } },
          { courseCode: { $regex: q, $options: "i" } },
          { advice: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },  
        ],
      };
    } 
    // If q is empty,  = {} means “fetch all profiles”

    const profiles = await profilesCollection.find(query).limit(50).toArray();

    // Combine with user data
    const results = [];
    for (const profile of profiles) {
      const user = await usersCollection.findOne({ _id: profile.userId });
      if (!user) continue;

      results.push({
        _id: profile._id.toString(),
        userId: profile.userId.toString(),
        name: user.name || user.email,
        course: profile.courseName,
        college: profile.collegeName,
        code: profile.courseCode,
        advice: profile.advice,
        description: profile.description,
        bio: profile.bio,
        isVerified: !!user.isVerified,
      });
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Error searching profiles:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

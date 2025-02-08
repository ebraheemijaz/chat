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

    // Filter only by courseName
    let query = {};
    if (q.length > 0) {
      const searchTerms = q.split(' ').map(term => term.trim());
    
      query = {
        $and: searchTerms.map(term => ({
          $or: [
            { courseName: { $regex: term, $options: "i" } },
            { courseCode: { $regex: term, $options: "i" } },
            { collegeName: { $regex: term, $options: "i" } },
          ]
        }))
      };
    }

    const profiles = await profilesCollection.find(query).limit(50).toArray();

    const results = [];
    for (const profile of profiles) {
      // Optionally join with users collection to get user name, verified status, etc.
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
        email: profile.email,
        isVerified: !!user.isVerified,
        profileImage: profile.profileImage || "", // Include the image field
      });
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Error searching profiles:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

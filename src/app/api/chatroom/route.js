import { authenticate } from "../profile/route";
import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const userId = await authenticate(req);

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
  try {
    const { courseOwnerId } = await req.json();

    const participants = [userId, courseOwnerId].sort();

    const client = await clientPromise;
    const db = client.db();
    const existingRoom = await db.collection("chatRooms").findOne({
      participants: { $all: participants },
    });

    if (existingRoom) {
      return Response.json({
        roomId: existingRoom._id,
        message: "Chat room already exists",
      });
    }

    const newRoom = await db.collection("chatRooms").insertOne({
      participants,
      createdAt: new Date(),
    });

    return Response.json({
      roomId: newRoom.insertedId,
      message: "Chat room created successfully",
    });
  } catch (error) {
    console.error("Chat room creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const userId = await authenticate(req);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  try {
    const chatRooms = await db
      .collection("chatRooms")
      .aggregate([
        {
          $match: {
            participants: {
              $in: [userId],
            },
          },
        },
        {
          $unwind: {
            path: "$participants",
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              participantId: "$participants",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$_id",
                      {
                        $toObjectId: "$$participantId",
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
            as: "participantInfo",
          },
        },
        {
          $lookup: {
            from: "profiles",
            let: {
              participantId: "$participants",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$userId",
                      {
                        $toObjectId: "$$participantId",
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  profileImage: 1,
                },
              },
            ],
            as: "image",
          },
        },
        {
          $unwind: {
            path: "$image",
          },
        },
        {
          $unwind: {
            path: "$participantInfo",
          },
        },
        {
          $addFields: {
            participantInfo: {
              image: "$image.profileImage",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            participantDetails: {
              $push: "$participantInfo",
            },
          },
        },
      ])
      .toArray();

    console.log("Chat rooms with participants:", chatRooms); // Debug log

    return NextResponse.json({ data: chatRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

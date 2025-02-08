import { NextResponse } from "next/server";
import Pusher from "pusher";
import { authenticate } from "../profile/route";
import clientPromise from "../../../lib/mongodb";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "mt1",
  useTLS: true,
});

// Helper function to create a consistent chat room ID for two users
function getChatRoomId(userId1, userId2) {
  // Sort IDs to ensure same room ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `chat-${sortedIds[0]}-${sortedIds[1]}`;
}

export async function POST(req, res) {
  try {
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

    const body = await req.json();
    const { roomId, text } = body;

    if (!text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = {
      roomId,
      senderId: userId,
      text,
      timestamp: new Date().toISOString(),
    };

    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db();
    await db.collection("messages").insertOne(message);

    // Trigger Pusher event using the unique chat room ID
    await pusher.trigger(roomId, "new-message", message);

    return NextResponse.json({});
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send message",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Add an endpoint to get chat history
export async function GET(req) {
  try {
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

    const { searchParams } = new URL(req.url);
    const chatRoomId = searchParams.get("chatRoomId");

    const client = await clientPromise;
    const db = client.db();

    const messages = await db
      .collection("messages")
      .find({ roomId: chatRoomId })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({
      messages,
      success: true,
    });
  } catch (error) {
    console.error("Chat History Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

"use client";

import { useRouter } from "next/navigation";

export default function ChatRequest({ courseId, receiverId, courseOwnerId }) {
  const router = useRouter();

  const initializeChatRoom = async () => {
    try {
      const response = await fetch("/api/chatroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseOwnerId, // Make sure this matches your data structure
        }),
      });
      const data = await response.json();
      router.push("/chat");
      //   const chatRoomId = data?.roomId;
      //   if (chatRoomId) {
      //     pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      //       cluster: "mt1",
      //     });
      //   }
      //   const channel = pusher.subscribe(chatRoomId);
      //   channel.bind("new-message", (data) => {
      //     setMessages((prev) => [...prev, data]);
      //   });
    } catch (error) {
      console.error("Error initializing chat room:", error);
    } finally {
    }
  };

  return (
    <>
      <button
        onClick={initializeChatRoom}
        className="bg-[#32064A] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
      >
        Send Chat Request
      </button>
    </>
  );
}

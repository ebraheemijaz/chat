"use client";

import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Pusher from "pusher-js";
import Image from "next/image";

export default function ChatPage() {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const lastChatRef = useRef(null);
  const pusherRef = useRef(null);

  console.log("user", { isAuthenticated, user, loading });
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(`/api/chatroom`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { data } = await response.json();
        if (data) {
          setChatRooms(data);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      } finally {
        setChatLoading(false);
      }
    };

    if (user) {
      fetchChatRooms();
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    // Initialize Pusher
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "mt1",
    });

    // Cleanup on component unmount
    return () => {
      if (lastChatRef.current) {
        pusherRef.current.unsubscribe(lastChatRef.current);
      }
      pusherRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    // Unsubscribe from previous chat if exists
    if (lastChatRef.current) {
      pusherRef.current.unsubscribe(lastChatRef.current);
    }

    // Subscribe to new chat
    const chatRoomId = selectedChat._id;
    const channel = pusherRef.current.subscribe(chatRoomId);

    channel.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Update ref to current chat
    lastChatRef.current = chatRoomId;

    // Fetch messages for new chat
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat?chatRoomId=${chatRoomId}`);
        const data = await response.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Cleanup function
    return () => {
      if (chatRoomId) {
        pusherRef.current.unsubscribe(chatRoomId);
      }
    };
  }, [selectedChat]);

  const messagesEndRef = useRef(null); // Add ref for auto-scrolling

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isAuthenticated) {
    return <div className="p-4">Please sign in to view your chats.</div>;
  }

  if (chatLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#32064A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "long" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat?._id) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: selectedChat._id,
          text: newMessage,
        }),
      });
      setNewMessage("");
      //   setMessages(prev => [...prev, { text: newMessage, sender: 'you', timestamp: new Date() }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm flex h-[600px]">
          {/* Left sidebar - Chat List */}
          <div className="w-1/3 border-r">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            </div>

            <div className="divide-y overflow-y-auto h-[calc(100%-88px)]">
              {chatRooms?.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer flex items-center space-x-4 ${
                    selectedChat?._id === chat._id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="relative">
                    <Image
                      src={
                        chat?.participantDetails[0]?._id === user?._id
                          ? chat?.participantDetails[1]?.image ||
                            "/default-avatar.png"
                          : chat?.participantDetails[0]?.image ||
                            "/default-avatar.png"
                      }
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {chat?.participantDetails[0]?._id === user?._id
                            ? chat?.participantDetails[1]?.name
                            : chat?.participantDetails[0]?.name}
                        </h3>
                      </div>
                      <div className="text-right"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate"></p>
                  </div>
                </div>
              ))}

              {chatRooms.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No chat rooms found
                </div>
              )}
            </div>
          </div>

          {/* Right side - Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={
                          selectedChat?.participantDetails[0]?._id === user?._id
                            ? selectedChat?.participantDetails[1]?.image ||
                              "/default-avatar.png"
                            : selectedChat?.participantDetails[0]?.image ||
                              "/default-avatar.png"
                        }
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {selectedChat?.participantDetails[0]?._id === user?._id
                          ? selectedChat?.participantDetails[1]?.name
                          : selectedChat?.participantDetails[0]?.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Sender Message (right-aligned) */}
                  {messages.map((each) => (
                    <div
                      className={`flex justify-${
                        each?.senderId === user?._id ? "end" : "start"
                      }`}
                    >
                      <div
                        className={`bg-[#32064A]  max-w-[70%] rounded-lg p-3 ${
                          each?.senderId === user?._id
                            ? "bg-[#32064A] text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {each?.senderId === user?._id
                              ? "You"
                              : selectedChat?.participantDetails[0]?._id ===
                                user?._id
                              ? selectedChat?.participantDetails[1]?.name
                              : selectedChat?.participantDetails[0]?.name}
                          </span>
                          <span> - </span>
                          <span className="text-xs opacity-75">
                            {formatTimestamp(each?.timestamp)}
                          </span>
                        </div>
                        <p>{each?.text}</p>
                      </div>
                    </div>
                  ))}
                  {/* <div ref={messagesEndRef} /> */}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-[#32064A] text-black"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-[#32064A] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { signIn, useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Sidebar from "@/assets/components/chats/chatSidebar";
import Topbar from "@/assets/components/chats/chatTopbar";
import { usechatSidebarContext } from "@/assets/components/chats/chatSiderbarContext";

interface ChatMessage {
  text: string;
  timestamp: string;
  to: string;
  from: string;
  pending?: boolean;
  failed?: boolean;
}

interface User {
  id: string;
  username?: string;
  isOnline?: boolean;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export default function OptimizedChatPage() {
  const { data: session } = useSession();
  const memoizedSession = useMemo(() => session, [session]);

  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Context from sidebar
  const { isShrunk, selectedUser, isLoadingUsers, refreshUsers } =
    usechatSidebarContext();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Socket connection management
  const connectSocket = useCallback(() => {
    if (!memoizedSession?.user?.username || socketRef.current?.connected) {
      return;
    }

    console.log(`Connecting as ${memoizedSession.user.username}...`);
    setConnectionStatus("connecting");
    setErrorMessage(null);

    const socket = io("http://localhost:4000", {
      auth: { username: memoizedSession.user.username },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      setConnectionStatus("connected");
      setErrorMessage(null);
      setIsReconnecting(false);

      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Disconnected: ${reason}`);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") {
        setErrorMessage("Server disconnected. Attempting to reconnect...");
        setIsReconnecting(true);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setConnectionStatus("disconnected");
      setErrorMessage(`Connection failed: ${error.message}`);
    });

    // Authentication events
    socket.on("authenticated", (data: { username: string }) => {
      console.log(`🔐 Authenticated as ${data.username}`);
    });

    // User list events
    socket.on("usersList", (data: { users: string[] }) => {
      console.log("👥 Users list updated:", data.users);
      setActiveUsers(data.users);
      refreshUsers();
    });

    // Message events
    socket.on("privateMessage", (msg: ChatMessage) => {
      console.log("💬 Received message:", msg);
      setMessages((prev) => [...prev, { ...msg, pending: false }]);
    });

    // Error handling
    socket.on("error", (error: string) => {
      console.error("Socket error:", error);
      setErrorMessage(error);
    });

    socketRef.current = socket;
  }, [refreshUsers, memoizedSession]);

  // Initialize socket connection
  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSocket]);

  // Handle reconnection
  useEffect(() => {
    if (
      connectionStatus === "disconnected" &&
      !isReconnecting &&
      memoizedSession?.user?.username
    ) {
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");
        setIsReconnecting(true);
        connectSocket();
      }, 3000);
    }
  }, [
    connectionStatus,
    isReconnecting,
    memoizedSession?.user?.username,
    connectSocket,
  ]);

  const sendMessage = useCallback(() => {
    const socket = socketRef.current;

    if (
      !socket?.connected ||
      !selectedUser ||
      !messageInput.trim() ||
      !memoizedSession?.user?.username
    ) {
      return;
    }

    const messageId = `${Date.now()}-${Math.random()}`;
    const newMessage: ChatMessage = {
      text: messageInput.trim(),
      timestamp: new Date().toISOString(),
      to: selectedUser.id,
      from: memoizedSession.user.username,
      pending: true,
    };

    // Add message optimistically
    setMessages((prev) => [...prev, { ...newMessage }]);
    setMessageInput("");

    // Send to server with callback
    socket.emit(
      "privateMessage",
      {
        to: selectedUser.id,
        text: newMessage.text,
        timestamp: newMessage.timestamp,
      },
      (response: { success?: boolean; error?: string; timestamp?: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.timestamp === newMessage.timestamp &&
            msg.from === newMessage.from
              ? {
                  ...msg,
                  pending: false,
                  failed: !!response.error,
                  timestamp: response.timestamp || msg.timestamp,
                }
              : msg,
          ),
        );

        if (response.error) {
          console.error("Message send failed:", response.error);
          setErrorMessage(response.error);
        } else {
          console.log("✅ Message sent successfully");
        }
      },
    );
  }, [selectedUser, messageInput, memoizedSession?.user?.username]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const retryFailedMessage = useCallback((failedMessage: ChatMessage) => {
    if (!socketRef.current?.connected || !failedMessage.failed) return;

    // Remove failed flag and mark as pending
    setMessages((prev) =>
      prev.map((msg) =>
        msg === failedMessage ? { ...msg, pending: true, failed: false } : msg,
      ),
    );

    // Retry sending
    socketRef.current.emit(
      "privateMessage",
      {
        to: failedMessage.to,
        text: failedMessage.text,
        timestamp: failedMessage.timestamp,
      },
      (response: { success?: boolean; error?: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.timestamp === failedMessage.timestamp
              ? { ...msg, pending: false, failed: !!response.error }
              : msg,
          ),
        );
      },
    );
  }, []);

  // Show sign-in if not authenticated
  if (!memoizedSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
          Please sign in to access the chat.
        </p>
        <Button
          onClick={() => signIn("github")}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  // Filter messages for current conversation
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.from === memoizedSession.user?.username &&
        msg.to === selectedUser?.id) ||
      (msg.from === selectedUser?.id &&
        msg.to === memoizedSession.user?.username),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isShrunk ? "ml-20" : "ml-64",
        )}
      >
        <Topbar />

        <main className="flex-1 flex flex-col p-4 pt-[70px]">
          {/* Status indicators */}
          {errorMessage && (
            <div className="p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300 flex justify-between items-center">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          <div
            className={cn(
              "p-2 mb-3 text-sm rounded-md flex items-center",
              connectionStatus === "connected"
                ? "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300"
                : connectionStatus === "connecting" || isReconnecting
                  ? "text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
                  : "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300",
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full mr-2",
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting" || isReconnecting
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500",
              )}
            />
            {connectionStatus === "connected" && "Connected"}
            {(connectionStatus === "connecting" || isReconnecting) &&
              "Connecting..."}
            {connectionStatus === "disconnected" &&
              !isReconnecting &&
              "Disconnected"}
          </div>

          {/* Main content */}
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <Image
                src={theme === "dark" ? "/astro-dark.svg" : "/astro.svg"}
                alt="Select a user"
                width={200}
                height={200}
                className="mb-4"
              />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Select a user to start chatting
              </p>
              {isLoadingUsers && (
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              )}
            </div>
          ) : (
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat header */}
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">{selectedUser.id}</h2>
                  <p className="text-sm">
                    {activeUsers.includes(selectedUser.id) ? (
                      <span className="text-green-500 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        Online
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
                        Offline
                      </span>
                    )}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    conversationMessages.map((msg, index) => (
                      <div
                        key={`${msg.timestamp}-${index}`}
                        className={cn(
                          "flex flex-col max-w-[75%] p-3 rounded-lg shadow-sm",
                          msg.from === memoizedSession.user?.username
                            ? "ml-auto bg-blue-500 text-white"
                            : "mr-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        <div className="mt-1 text-xs opacity-75 self-end flex items-center">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.pending && <span className="ml-1">⏳</span>}
                          {msg.failed && (
                            <button
                              onClick={() => retryFailedMessage(msg)}
                              className="ml-1 text-red-300 hover:text-red-100"
                              title="Click to retry"
                            >
                              ⚠️
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <Separator />

                {/* Message input */}
                <div className="p-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder={`Message ${selectedUser.username || selectedUser.id}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={connectionStatus !== "connected"}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={
                        !messageInput.trim() || connectionStatus !== "connected"
                      }
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                    >
                      Send
                    </Button>
                  </div>

                  {selectedUser && !activeUsers.includes(selectedUser.id) && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      ⚠️ User appears offline. Messages may not be delivered
                      immediately.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

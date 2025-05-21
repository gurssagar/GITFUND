"use client";
import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/assets/components/chats/chatSidebar";
import Topbar from "@/assets/components/chats/chatTopbar";
import { usechatSidebarContext } from "@/assets/components/chats/chatSiderbarContext";
import { Suspense } from "react";
import { useSession, SessionContextValue } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface ChatMessage {
  text: string;
  timestamp: string;
  to: string;
  from: string;
  pending?: boolean; // Added for local message status
}

interface SessionUser {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null; // Assuming id is part of your user object
    username?: string | null; // Assuming username is part of your user object
  };
  // Potentially add other session properties like accessToken if needed
  accessToken?: string;
}

// New component to encapsulate the layout and use the context
function ChatPageLayout() {
  const { data: session } = useSession() as { data: SessionUser | null }; // Use SessionUser type
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const { isShrunk, setIsShrunk, selectedUser, filteredUsers, refreshUsers, isLoadingUsers } = usechatSidebarContext();
  // Using context for user data instead of local state
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when chatMessages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Not needed anymore as we're using the context for user data

  // Initialize socket without connecting
  useEffect(() => {
    if (!session?.user?.username) return; // Ensure username exists before proceeding

    // Create socket but don't connect yet
    const newSocket = io("https://octopus-app-pcmuh.ondigitalocean.app/", {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    // Set up event listeners
    newSocket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      setErrorMessage(null);
      console.log("Socket connected");
      
      // Refresh users after connection
      refreshUsers();
    });

    newSocket.on("connecting", () => {
      setConnectionStatus("connecting");
      console.log("Socket connecting...");
    });

    newSocket.on("reconnect_attempt", (attempt: number) => {
      setConnectionStatus("connecting");
      console.log(`Socket reconnection attempt ${attempt}`);
    });

    newSocket.on("authenticated", (data: { username: string }) => {
      console.log(`Socket authenticated as ${data.username}`);
      setConnectionStatus("connected");
      setErrorMessage(null);
    });

    newSocket.on("auth_error", (error: { message: string } | string) => { // More specific error type
      const errorMessageText = typeof error === 'string' ? error : error.message;
      if (errorMessageText === "User already connected") {
        setErrorMessage(
          "You are already connected from another tab or device. Please close other sessions and try again."
        );
      } else {
        setErrorMessage(`Authentication error: ${errorMessageText}`);
        console.error("Authentication error:", errorMessageText);
      }
      setConnectionStatus("disconnected");
    });

    newSocket.on("error", (error: { message: string } | string) => { // More specific error type
      const errorMessageText = typeof error === 'string' ? error : error.message;
      if (errorMessageText === "Recipient not available") {
        setErrorMessage("The user you are trying to message is not online.");
      } else if (errorMessageText === "Unauthorized message attempt") {
        setErrorMessage("You are not authorized to send this message.");
      } else if (errorMessageText === "Communication not allowed") {
        setErrorMessage("Communication with this user is not allowed.");
      } else {
        setErrorMessage(`Socket error: ${errorMessageText}`);
        console.error("Socket error:", errorMessageText);
      }
    });

    newSocket.on("privateMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("messageDelivered", (data: { to: string; timestamp: string }) => {
      console.log(`Message delivered to ${data.to} at ${data.timestamp}`);
      // You could update the message state to show "delivered" status
      // or add a visual indicator next to messages that have been delivered
    });

    newSocket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        setErrorMessage("Disconnected by server. Trying to reconnect...");
        newSocket.connect();
      } else if (reason === "transport close") {
        // connection was closed (e.g., user lost internet)
        setErrorMessage("Connection lost. Trying to reconnect...");
      } else {
        setErrorMessage(`Disconnected: ${reason}`);
      }
    });

    newSocket.on("reconnect", (attemptNumber: number) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setErrorMessage(null);
    });

    newSocket.on("reconnect_failed", () => {
      setErrorMessage(
        "Failed to reconnect to the chat server. Please refresh the page."
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  // Function to handle username selection and connect
  const onUsernameSelection = (username: string) => {
    if (!socket || !username) return;

    setUsernameAlreadySelected(true);
    setConnectionStatus("connecting");

    // Set auth before connection, as the server uses handshake.auth
    socket.auth = { username };

    try {
      socket.connect();
      console.log(`Connecting as ${username}...`);
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage(`Failed to connect: ${error}`);
      setConnectionStatus("disconnected");
    }
  };

  // Auto-connect when session is available
  useEffect(() => {
    if (session?.user?.username && socket && !usernameAlreadySelected) {
      const username = session.user.username; // Username is confirmed to exist here
      if (username) {
        console.log(`Auto-connecting as ${username}`);
        onUsernameSelection(username);
      }
    }
  }, [session, socket, usernameAlreadySelected]); // Removed onUsernameSelection from deps as it's stable

  const sendMessage = () => {
    if (!socket || !selectedUser || !messageInput.trim() || !session?.user?.username) return;

    const localMsg: ChatMessage = {
      text: messageInput,
      timestamp: new Date().toISOString(),
      to: selectedUser.username,
      from: session.user.username, // Username is confirmed to exist here
      pending: true,
    };
    setMessages((prev) => [...prev, localMsg]);

    socket.emit(
      "privateMessage",
      {
        to: selectedUser.username,
        text: messageInput,
      },
      (ack: { error?: string; messageId?: string }) => {
        if (ack.error) {
          console.error("Message send error:", ack.error);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.timestamp === localMsg.timestamp
                ? { ...msg, pending: false, error: ack.error } // Add error to message
                : msg
            )
          );
          setErrorMessage(`Failed to send message: ${ack.error}`);
        } else {
          console.log("Message sent and acknowledged by server, id:", ack.messageId);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.timestamp === localMsg.timestamp
                ? { ...msg, pending: false, id: ack.messageId } // Add server ID, remove pending
                : msg
            )
          );
        }
      }
    );
    setMessageInput("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
          Please sign in to access the chat.
        </p>
        <Button onClick={() => signIn("github")} className="bg-blue-500 hover:bg-blue-600">
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isShrunk ? "ml-[5rem] w-[calc(100%_-_5rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"
        )}
      >
        <Topbar />
        <main className="flex-1 flex flex-col p-4 pt-[70px] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300">
              {errorMessage}
            </div>
          )}
          {connectionStatus === "connecting" && (
            <div className="p-3 mb-3 text-sm text-yellow-700 bg-yellow-100 rounded-md dark:bg-yellow-900 dark:text-yellow-300">
              Connecting to chat server...
            </div>
          )}
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <Image
                src={theme === "dark" ? "/astro-dark.svg" : "/astro.svg"}
                alt="Select a user to start chatting"
                width={200}
                height={200}
                className="mb-4"
              />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Select a user from the sidebar to start a conversation.
              </p>
              {isLoadingUsers && <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Loading users...</p>}
            </div>
          ) : (
            <Card className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Chat with {selectedUser.username}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.isOnline ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-red-500">Offline</span>
                    )}
                  </p>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {messages
                    .filter(
                      (msg) =>
                        (msg.from === session?.user?.username && msg.to === selectedUser.username) ||
                        (msg.from === selectedUser.username && msg.to === session?.user?.username)
                    )
                    .map((msg, index) => (
                      <div
                        key={index} // Consider using a more stable key if messages have unique IDs
                        className={cn(
                          "flex flex-col max-w-[75%] p-3 rounded-lg shadow",
                          msg.from === session?.user?.username
                            ? "ml-auto bg-blue-500 text-white dark:bg-blue-600"
                            : "mr-auto bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className="mt-1 text-xs opacity-75 self-end">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.pending && <span className="ml-1">(sending...)</span>}
                          {'error' in msg && <span className="ml-1 text-red-300">(failed)</span>} {/* Display error status */}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                </div>
                <Separator className="my-0" />
                <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`Message ${selectedUser.username}...`}
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled={!isConnected || !selectedUser.isOnline}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!isConnected || !messageInput.trim() || !selectedUser.isOnline}
                      className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Send
                    </Button>
                  </div>
                  {!selectedUser.isOnline && isConnected && (
                     <p className="text-xs text-red-500 mt-1">{selectedUser.username} is currently offline. Messages will not be delivered.</p>
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

// Main page component that wraps the layout with Suspense
export default function GitFundChatPage() {
  return (
    <Suspense fallback={<div>Loading Chat...</div>}> {/* Ensure fallback UI is meaningful */}
      <ChatPageLayout />
    </Suspense>
  );
}

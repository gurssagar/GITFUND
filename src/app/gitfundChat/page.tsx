"use client";
import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/assets/components/chats/chatSidebar";
import Topbar from "@/assets/components/chats/chatTopbar";
import { usechatSidebarContext } from "@/assets/components/chats/chatSiderbarContext";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
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
}

// New component to encapsulate the layout and use the context
function ChatPageLayout() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const { isShrunk, setIsShrunk, selectedUser, filteredUsers, refreshUsers, isLoadingUsers } = usechatSidebarContext();
  // Using context for user data instead of local state
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
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
    if (!session?.user) return;

    // Create socket but don't connect yet
    const newSocket = io("https://gitfund-chat-8uaxx.ondigitalocean.app/", {
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

    newSocket.on("reconnect_attempt", (attempt) => {
      setConnectionStatus("connecting");
      console.log(`Socket reconnection attempt ${attempt}`);
    });

    newSocket.on("authenticated", (data) => {
      console.log(`Socket authenticated as ${data.username}`);
      setConnectionStatus("connected");
      setErrorMessage(null);
    });

    newSocket.on("auth_error", (error) => {
      if (error === "User already connected") {
        setErrorMessage(
          "You are already connected from another tab or device. Please close other sessions and try again.",
        );
      } else {
        setErrorMessage(`Authentication error: ${error}`);
        console.error("Authentication error:", error);
      }
      setConnectionStatus("disconnected");
    });

    newSocket.on("error", (error) => {
      if (error === "Recipient not available") {
        setErrorMessage("The user you are trying to message is not online.");
      } else if (error === "Unauthorized message attempt") {
        setErrorMessage("You are not authorized to send this message.");
      } else if (error === "Communication not allowed") {
        setErrorMessage("Communication with this user is not allowed.");
      } else {
        setErrorMessage(`Socket error: ${error}`);
        console.error("Socket error:", error);
      }
    });

    newSocket.on("privateMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("messageDelivered", (data) => {
      console.log(`Message delivered to ${data.to} at ${data.timestamp}`);
      // You could update the message state to show "delivered" status
      // or add a visual indicator next to messages that have been delivered
    });

    newSocket.on("disconnect", (reason) => {
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

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setErrorMessage(null);
    });

    newSocket.on("reconnect_failed", () => {
      setErrorMessage(
        "Failed to reconnect to the chat server. Please refresh the page.",
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
    if (session?.user && socket && !usernameAlreadySelected) {
      const username = (session?.user as any)?.username;
      if (username) {
        console.log(`Auto-connecting as ${username}`);
        onUsernameSelection(username);
      }
    }
  }, [session, socket, usernameAlreadySelected]);
  
  // Debug logging for users from context
  useEffect(() => {
    console.log("Filtered users from context:", filteredUsers);
  }, [filteredUsers]);

  const sendMessage = () => {
    if (messageInput.trim() && socket && selectedUser && isConnected) {
      const username = (session?.user as any)?.username;
      if (!username) {
        setErrorMessage("You must be logged in to send messages");
        return;
      }

      const msg: ChatMessage = {
        text: messageInput,
        timestamp: new Date().toISOString(),
        to: selectedUser.id,
        from: username,
      };

      // Add pending status to local message
      const localMsg = { ...msg, pending: true };
      setMessages((prev) => [...prev, localMsg]);

      try {
        socket.emit("privateMessage", msg, (ack: any) => {
          if (ack && ack.error) {
            console.error("Message error:", ack.error);
            setErrorMessage(`Failed to send message: ${ack.error}`);
          }
        });
        setMessageInput("");
      } catch (error) {
        console.error("Send message error:", error);
        setErrorMessage(`Failed to send message: ${error}`);
      }
    } else if (!isConnected) {
      setErrorMessage("You are not connected to the chat server");
    }
  };

  // Filter messages for the active chat
  const chatMessages = messages.filter(
    (msg) =>
      selectedUser &&
      ((msg.from === (session?.user as any)?.username &&
        msg.to === selectedUser.id) ||
        (msg.to === (session?.user as any)?.username &&
          msg.from === selectedUser.id)),
  );

  // Using filtered users from context instead of filtering locally

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex">
        <Sidebar />
        <div
          className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
        >
          <Topbar />

          {/* Integrated Chat UI */}
          <div className="p-6 mt-16">
            <div className=" mx-auto">
              <div className="h-screen p-4 space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Chat</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshUsers}
                    disabled={isLoadingUsers}
                  >
                    {isLoadingUsers ? (
                      <>
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Users
                      </>
                    )}
                  </Button>
                  {filteredUsers.length === 0 && (
                    <div className="text-center text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg mt-2">
                      No users available for chat. Try refreshing the user list.
                    </div>
                  )}
                </div>
                
                {connectionStatus !== "connected" && (
                  <div
                    className={`text-center p-4 rounded-lg mb-4 ${
                      connectionStatus === "connecting"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-yellow-100 dark:bg-yellow-900"
                    }`}
                  >
                    <p className="font-medium">
                      {connectionStatus === "connecting"
                        ? "Connecting to chat server..."
                        : "Not connected to chat server"}
                    </p>
                    {connectionStatus === "disconnected" && (
                      <Button
                        onClick={() =>
                          onUsernameSelection((session?.user as any)?.username)
                        }
                        className="mt-2"
                      >
                        Connect as {(session?.user as any)?.username}
                      </Button>
                    )}
                  </div>
                )}

                {errorMessage && (
                  <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg mb-4">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {errorMessage}
                    </p>
                    <Button
                      onClick={() => setErrorMessage(null)}
                      variant="outline"
                      className="mt-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Messages */}
                <div className="h-[calc(100vh-250px)] bg-muted/40 rounded-lg p-4 overflow-y-auto space-y-3 relative">
                  {!selectedUser ? (
                    <div className="text-center text-muted-foreground py-8">
                      Please select a user from the sidebar to start chatting.
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation with {selectedUser.fullName || selectedUser.username || selectedUser.id}!
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const isSelf =
                        msg.from === (session?.user as any)?.username;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "max-w-sm z-10 p-3 rounded-lg shadow-sm text-sm relative",
                            isSelf
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-accent text-accent-foreground",
                          )}
                        >
                          {msg.text}
                          <div className="flex justify-end items-center gap-1 text-xs text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isSelf && (msg as any).pending && (
                              <span title="Sending...">⏳</span>
                            )}
                            {isSelf && !(msg as any).pending && (
                              <span title="Delivered">✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {selectedUser && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-3 pt-2"
                  >
                    <Input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={
                        !isConnected
                          ? "Connect to send messages..."
                          : selectedUser
                            ? `Message to ${selectedUser.name || selectedUser.id}...`
                            : "Select a user to message..."
                      }
                      autoFocus
                      className="bg-background text-foreground placeholder-muted-foreground"
                      disabled={!isConnected || !selectedUser}
                    />
                    <Button
                      type="submit"
                      disabled={
                        !isConnected || !messageInput.trim() || !selectedUser
                      }
                    >
                      {connectionStatus === "connecting"
                        ? "Connecting..."
                        : "Send"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function Home() {
  return <ChatPageLayout />;
}

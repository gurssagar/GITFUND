'use client'
import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/assets/components/chats/chatSidebar';
import Topbar from '@/assets/components/chats/chatTopbar';
import { usechatSidebarContext } from '@/assets/components/chats/chatSiderbarContext';
// import ChatPage from '@/assets/components/chatPage'; // Remove this line
import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client'; // Added import
import Image from 'next/image'; // Added import
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils" // Optional utility for conditional classes
import { useRef } from "react"

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
    const [messageInput, setMessageInput] = useState('');
    const { isShrunk, setIsShrunk, selectedUser } = usechatSidebarContext(); // Destructure selectedUser and setSelectedUser
    console.log("Selected User:", selectedUser);

    // const [isOpen, setIsOpen] = useState(false); // This might not be needed if chat is always part of the layout
    const [users, setUsers] = useState<any>([]);
    const [userData, setUserData] = useState<any>([]);
    const [activeUserFullName, setActiveUserFullName] = useState<string>(''); // REMOVE THIS LINE
    const { theme } = useTheme()
    const messagesEndRef = useRef<HTMLDivElement>(null)
  
    // Auto-scroll to bottom when chatMessages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    // const [activeUsers, setActiveUsers] = useState<string[]>([]); // This state seems unused in ChatPage.tsx logic
    const fetchAssignedUsers = async () => {
        try {
         await fetch('/api/assignedIssue',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
         }).then(response => response.json())
            .then(data => {
                setUsers(data.assignedIssues || []);
                console.log("Assigned users:", data.assignedIssues);
            })
        }
        catch (error) {
            console.error("Error fetching assigned users:", error);
        }
    }
    
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/signup', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setUserData(data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    useEffect(() => {
        // Only create socket and fetch users after session is available
        if (!session?.user) return;

        // Create socket connection
        const newSocket = io('https://gitfund-chat-8uaxx.ondigitalocean.app/', {
            reconnectionAttempts: 3, // Reduce attempts to pace reloads
            reconnectionDelay: 2000, // Increase delay to pace reloads
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            // Authenticate after connection is established
            newSocket.emit('authenticate', {
                username: (session?.user as any)?.username,
                token: (session?.user as any)?.username
            });
        });

        newSocket.on('authenticated', () => {
            // Fetch users only after authentication
            fetchUsers();
            fetchAssignedUsers();
        });

        newSocket.on('auth_error', (error) => {
            if (error === 'User already connected') {
                alert('You are already connected from another tab or device. Please close other sessions and try again.');
            } else {
                console.error("Authentication error:", error);
            }
        });

        newSocket.on('error', (error) => {
            if (error === 'Recipient not available') {
                alert('The user you are trying to message is not online.');
            } else {
                console.error("Socket error:", error);
            }
        });

        newSocket.on('privateMessage', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });

        newSocket.on('messageDelivered', (data) => {
            // Optionally handle delivery confirmation
        });

        newSocket.on('error', (error) => {
            console.error("Socket error:", error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [session]); // Remove userData from dependency array

    const sendMessage = () => {
        if (messageInput.trim() && socket && selectedUser) {
            const msg: ChatMessage = {
                text: messageInput,
                timestamp: new Date().toISOString(),
                to: selectedUser.id, // Use username from the selectedUser object
                from: (session?.user as any)?.username
            };
            socket.emit('privateMessage', msg);
            setMessages(prev => [...prev, msg]);
            setMessageInput('');
        }
    };
    
    // Filter messages for the active chat
    const chatMessages = messages.filter(msg => 
        selectedUser &&
        ((msg.from === (session?.user as any)?.username && msg.to === selectedUser.id) || 
        (msg.to === (session?.user as any)?.username && msg.from === selectedUser.id))
    );
    
    // Filter users based on your project's requirements
    const filteredUsers = userData.filter((user: any) => 
        users?.some((contributor: any) => contributor.Contributor_id === user.id)
    );
    return (
        <Suspense fallback={<div>Loading...</div>}>
           
        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar/>

                {/* Integrated Chat UI */}
                <div className="p-6 mt-16">
      <div className=" mx-auto">
        <div className="h-screen p-4 space-y-5">

        

          {/* Messages */}
    <div className="h-[calc(100vh-200px)] bg-muted/40 rounded-lg p-4 overflow-y-auto space-y-3 relative">
        {chatMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
            </div>
        ) : (
            chatMessages.map((msg, index) => {
                const isSelf = msg.from === (session?.user as any)?.username
                return (
                    <div
                        key={index}
                        className={cn(
                            "max-w-sm z-10 p-3 rounded-lg shadow-sm text-sm relative",
                            isSelf
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-accent text-accent-foreground"
                        )}
                    >
                        {msg.text}
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )
            })
        )}
        <div ref={messagesEndRef} />
    </div>

          {/* Input */}
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-3 pt-2"
            >
              <Input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                autoFocus
                className="bg-background text-foreground placeholder-muted-foreground"
              />
              <Button
                type="submit"
                disabled={!isConnected || !messageInput.trim()}
              >
                Send
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
    return (
      
            <ChatPageLayout />
    )
}
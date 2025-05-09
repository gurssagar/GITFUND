'use client';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Filter } from 'lucide-react';

interface ChatMessage {
  text: string;
  timestamp: string;
  to: string;
  from: string;
}

const ChatPage = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<any>([]);
    const [userData, setUserData] = useState<any>([]);
    const [activeChatUser, setActiveChatUser] = useState<any>(null);
    const [activeUserFullName, setActiveUserFullName] = useState<string>(''); // Add this state for display purposes
    const [activeUsers, setActiveUsers] = useState<string[]>([]);

    useEffect(() => {

        // Create socket connection
        const newSocket = io('http://64.227.156.174', {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');
            
            // Authenticate after connection is established
            if (session?.user) {
                newSocket.emit('authenticate', {
                    username: (session?.user as any)?.username,
                    token: (session?.user as any)?.username
                });
            }
        });

        newSocket.on('authenticated', (data) => {
            console.log('Socket authentication successful:', data);
            // Fetch active users or other initialization after authentication
            fetchUsers();
            fetchAssignedUsers()
        });
        
        newSocket.on('auth_error', (error) => {
            console.error("Authentication error:", error);
        });

        newSocket.on('privateMessage', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            console.log("Received private message:", msg);
        });

        newSocket.on('messageDelivered', (data) => {
            console.log("Message delivered to:", data.to, "at", data.timestamp);
        });

        newSocket.on('error', (error) => {
            console.error("Socket error:", error);
        });

        setSocket(newSocket);
        
        // Only try to connect user if we have session data
        return () => {
            newSocket.disconnect();
        };
    }, [session]);

    // Fetch users from your database or API

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
    console.log("Users:", userData);

    // Modify the sendMessage function to use username instead of fullName
    const sendMessage = () => {
        if (messageInput.trim() && socket && activeChatUser) {
            const msg: ChatMessage = {
                text: messageInput,
                timestamp: new Date().toISOString(),
                to: activeChatUser, // This should be the username, not fullName
                from: (session?.user as any)?.username || ''
            };
            socket.emit('privateMessage', msg);
            
            // Add the message to our local state as well
            setMessages(prev => [...prev, msg]);
            setMessageInput('');
        }
    };
    
    // Filter messages for the active chat
    const chatMessages = messages.filter(msg => 
        (msg.from === (session?.user as any)?.username && msg.to === activeChatUser) || 
        (msg.to === (session?.user as any)?.username && msg.from === activeChatUser)
    );
    
    // Filter users based on your project's requirements
    const filteredUsers = userData.filter((user: any) => 
        users?.some((contributor: any) => contributor.Contributor_id === user.id)
    );
    
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 p-3 bg-[#212124] rounded-full shadow-lg hover:bg-[#212124] transition-all transform hover:scale-110 z-50"
                aria-label="Toggle chat"
            >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
            </button>
            
            {isOpen && (
                <div className="fixed bottom-20 right-4 w-full max-w-md z-40 animate-fade-in-up">
                    <div className="chat-container p-4 bg-gray-900 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <div className="connection-status text-sm">
                                Status: {isConnected ? (
                                    <span className="text-green-400">Connected</span>
                                ) : (
                                    <span className="text-red-400">Disconnected</span>
                                )}
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        
                        {!activeChatUser ? (
                            // User selection view
                            <div className="messages bg-gray-800 text-gray-100 space-y-2 mb-4 h-64 overflow-y-auto p-3 rounded-lg">
                                <h3 className="font-medium text-lg mb-2">Select a user to chat with</h3>
                                <div className='my-1'>
                                    {filteredUsers.map((user: any) => (
                                        <div 
                                            key={user.id}
                                            onClick={() => {
                                                setActiveChatUser(user.id); // Store user ID instead of fullName
                                                setActiveUserFullName(user.fullName); // Store fullName separately for display
                                            }} 
                                            className="flex justify-between items-center py-2 px-3 my-1 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <Image 
                                                    src={user.image_url} 
                                                    width={36} 
                                                    height={36} 
                                                    className="rounded-full border border-gray-600" 
                                                    alt='profile'
                                                />
                                                <span className="font-medium text-gray-100">{user.fullName}</span>
                                            </div>
                                            <div className="text-gray-400 hover:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 24">
                                                    <path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"/>
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Chat view
                            <>
                                <div className="flex items-center mb-3 pb-2 border-b border-gray-700">
                                    <button 
                                        onClick={() => {
                                            setActiveChatUser(null);
                                            setActiveUserFullName('');
                                        }}
                                        className="mr-2 text-gray-400 hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                                        </svg>
                                    </button>
                                    <span className="font-medium">{activeUserFullName}</span>
                                </div>
                                
                                <div className="messages bg-gray-800 text-gray-100 space-y-2 mb-4 h-64 overflow-y-auto p-3 rounded-lg">
                                    {chatMessages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-4">
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, index) => (
                                            <div 
                                                key={index} 
                                                className={`message p-3 rounded-lg max-w-xs ${
                                                    msg.from === (session?.user as any)?.username 
                                                        ? 'bg-blue-600 ml-auto' 
                                                        : 'bg-gray-700'
                                                }`}
                                            >
                                                {msg.text}
                                                <div className="text-xs text-gray-300 mt-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        
                        {activeChatUser && (
                            <div className="message-input flex gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    disabled={!isConnected}
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPage;
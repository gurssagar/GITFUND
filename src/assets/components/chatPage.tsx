'use client';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Filter } from 'lucide-react';
const ChatPage = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<{text: string, timestamp: string}[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<any>([]);
    const [userData,setUserData]=useState<any>([]);
    useEffect(() => {
        const chatUsers = async() => {
            if (!session?.user) return;
            
            try {
                const response = await fetch(`/api/chatUsers/?projectOwner=${(session.user as any)?.username}`);
                const data = await response.json();
                setUsers(data.assignments);
                console.log(data, "hello");
            } catch(err) {
                
                console.error("Error fetching chat users:", err);
            }
        };

        const fetchUserData=async() => {
            if (!session?.user) return;

            try {
                
                await fetch('/api/signup',{
                    method:'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                ).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    return res.json();
                }).then((data) => {
                    setUserData(data.users);
                    console.log("User data fetched successfully:", data);
                });
            }
            catch(err) {
                console.error("Error fetching user data:", err);
            }
        }
        fetchUserData();
        chatUsers();

        const newSocket = io('http://localhost:4000', {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        });

        newSocket.on('message2', (data) => {
            setMessages(prev => [...prev, data]);
            console.log("Received from server:", data);
        });

        newSocket.on('error', (error) => {
            console.error("Socket error:", error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [session]);

    const sendMessage = () => {
        if (messageInput.trim() && socket) {
            socket.emit('message', { 
                text: messageInput,
                timestamp: new Date().toISOString()
            });
            setMessageInput('');
        }
    };
    
    const filtreredUsers=userData.filter((user: any) => users?.some((contributor: any) => contributor.Contributor === user.id));
    console.log(filtreredUsers,"fileyetess");
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
                <>
                
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
                        
                        <div className="messages bg-gray-800 text-gray-100 space-y-2 mb-4 h-64 overflow-y-auto p-3 rounded-lg">
                            <div className="">
                                {}
                            </div>
                            <div>
                                    {filtreredUsers.map( (user: any) => {
                                        return (
                                            <>
                                            <div className="flex gap-4">
                                                <Image src={user.image_url} width={50} height={50} className="rounded rounded-xl" alt='profile'/>
                                                {user.fullName}
                                            </div>
                                            </>
                                        )
                                    })}
                                    </div>
                            {messages.map((msg, index) => (
                                <div key={index} className="message p-3 bg-gray-700 text-gray-100 rounded-lg max-w-xs">
                                    {msg.text}
                                </div>
                            ))}
                        </div>

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
                    </div>
                </div>
                </>
               
            )}
        </>
    );
};

export default ChatPage;
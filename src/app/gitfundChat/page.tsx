'use client'
import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/assets/components/chats/chatSidebar';
import Topbar from '@/assets/components/chats/chatTopbar';
import { usechatSidebarContext } from '@/assets/components/chats/chatSiderbarContext';
import ChatPage from '@/assets/components/chatPage'; // Import the ChatPage component
import { Suspense } from 'react';

// New component to encapsulate the layout and use the context
function ChatPageLayout() {
    const {isShrunk}=usechatSidebarContext();
    return (
        <Suspense fallback={<div>Loading...</div>}>
           
        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar/>
                {/* You can add more chat-specific content here */}
                <ChatPage /> {/* Render the ChatPage component here */}
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
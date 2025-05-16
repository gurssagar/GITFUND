'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usechatSidebarContext } from './chatSiderbarContext';
import React, { useEffect, useState } from 'react'; // Added React, useEffect, useState

export default function Sidebar() {
    const { 
        isShrunk, 
        setIsShrunk, 
        selectedUser, 
        setSelectedUser,
        filteredUsers,
        refreshUsers,
        isLoadingUsers
    } = usechatSidebarContext();

    // Refresh users when the component mounts
    useEffect(() => {
        refreshUsers();
    }, []);

    return (
        <div>
        <div
            className={
                (isShrunk
                    ? 'w-[4rem] mx-auto px-1'
                    : 'w-[16rem] px-4'
                ) +
                ' top-0 z-50 bg-white dark:bg-black fixed h-screen border-r-[1px] border-gray-800 py-4 transition-all duration-400 ease-in-out'
            }
            style={{ transitionProperty: 'width, padding' }}
        >
            {isShrunk ? 
                <>
                    <Image className='dark:block hidden' src="/gitfund-white-icon.webp" alt="Gitfund logo" width={isShrunk ? 40 : 100} height={isShrunk ? 40 : 100}></Image>
                    <Image className='dark:hidden block' src="/gitfund-black-icon.webp" alt="Gitfund logo" width={isShrunk ? 40 : 100} height={isShrunk ? 40 : 100}></Image>
                </>
                :
                <>
                    <Image className='dark:block hidden' src="/gitfund-white.webp" alt="Gitfund logo" width={isShrunk ? 40 : 100} height={isShrunk ? 40 : 100}></Image>
                    <Image className='dark:hidden block' src="/gitfund.webp" alt="Gitfund logo" width={isShrunk ? 40 : 100} height={isShrunk ? 40 : 100}></Image>
                </>
            }
           

                <div>
                

                {/* Display Users Section */}
                <div className='pt-7'>
                    {!isShrunk && <div className='text-[13px] text-gray-400 py-2'>Messages</div>}
                    {isLoadingUsers && (
                        <div className='text-xs text-gray-500 px-2 py-1'>Loading users...</div>
                    )}
                    {!isLoadingUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((user: any) => (
                            <div 
                                key={user.id}
                                onClick={() => {
                                    setSelectedUser(user); // Update the selected user
                                }} 
                                className='rounded-lg gap-4 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex items-center cursor-pointer'
                                // onClick={() => { /* TODO: Implement chat opening logic if needed */ }}
                            >
                                <Image 
                                    className={`rounded-full`} 
                                    src={user.image_url || ''} // Provide a fallback avatar
                                    alt={user.fullName || 'User'} 
                                    width={isShrunk ? 28 : 24} // Slightly larger avatar when shrunk
                                    height={isShrunk ? 28 : 24} 
                                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }} // Fallback for broken images
                                />
                                {!isShrunk && <span className="ml-2 truncate" title={user.fullName}>{user.fullName}</span>}
                            </div>
                        ))
                    ) : (
                        !isLoadingUsers && !isShrunk && (
                            <div className='text-xs text-gray-500 px-2 py-1'>
                                No users to display.
                                <button 
                                    onClick={refreshUsers}
                                    className="ml-2 text-blue-500 hover:underline"
                                >
                                    Refresh
                                </button>
                            </div>
                        )
                    )}
                </div>

                <div className='pt-7'>
                    <div 
                        onClick={refreshUsers}
                        className='rounded-lg flex justify-between gap-4 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex items-center cursor-pointer'>
                        {!isShrunk && <span className="ml-2">Refresh Users</span>}
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M7.5 11.173a3.673 3.673 0 1 1 0-7.346a3.673 3.673 0 0 1 0 7.346zm-5.567-1.8a6.2 6.2 0 0 0 5.567 3.527a6.2 6.2 0 0 0 5.567-3.527H15L12 8.6l-3 .773h2.493A4.675 4.675 0 0 1 7.5 12.7A4.675 4.675 0 0 1 3.507 9.9H6L3 8.6L0 9.373h1.933z"/></svg>
                    </div>
                    <Link href="/homepage">
                    <div className='rounded-lg flex justify-between gap-4 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a]  px-2 py-2 flex items-center'>
                        {/* Placeholder for Discover icon, you can use a specific one */}
                        {!isShrunk && <span className="ml-2">Exit Chat</span>}
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M8.293 2.293a1 1 0 0 1 1.414 0l4.5 4.5a1 1 0 0 1 0 1.414l-4.5 4.5a1 1 0 0 1-1.414-1.414L11 8.5H1.5a1 1 0 0 1 0-2H11L8.293 3.707a1 1 0 0 1 0-1.414"/></svg>
                    </div></Link>
                </div>

            </div>
        </div>
        </div>
    )
}
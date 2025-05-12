'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usechatSidebarContext } from './chatSiderbarContext';
import React, { useEffect, useState } from 'react'; // Added React, useEffect, useState

export default function Sidebar() {
    const { isShrunk } = usechatSidebarContext();
    const [allUsersData, setAllUsersData] = useState<any[]>([]);
    const [assignedUsersData, setAssignedUsersData] = useState<any[]>([]);
    const [displayableUsers, setDisplayableUsers] = useState<any[]>([]);

    const fetchAllUsersFromDB = async () => {
        try {
            const response = await fetch('/api/signup', { // Assuming this endpoint provides all users
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log(data.users)
            setAllUsersData(data.users || []);
        } catch (error) {
            console.error("Error fetching all users for sidebar:", error);
        }
    };

    const fetchAssignedIssuesDetails = async () => {
        try {
         await fetch('/api/assignedIssue',{ // Assuming this endpoint provides users linked to issues
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
         }).then(response => response.json())
            .then(data => {
                setAssignedUsersData(data.assignedIssues || []);
            })
        }
        catch (error) {
            console.error("Error fetching assigned users for sidebar:", error);
        }
    };

    useEffect(() => {
        fetchAllUsersFromDB();
        fetchAssignedIssuesDetails();
    }, []);

    useEffect(() => {
        if (allUsersData.length > 0 && assignedUsersData.length > 0) {
            const filtered = allUsersData.filter((user: any) =>
                assignedUsersData.some((contributor: any) => contributor.Contributor_id === user.id)
            );
            setDisplayableUsers(filtered);
        } else {
            setDisplayableUsers([]);
        }
    }, [allUsersData, assignedUsersData]);

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
                <div className='pt-7'>
                    {!isShrunk && <div className='text-[13px] text-gray-400 py-2'>Explore</div>}
                    <Link href="/homepage">
                    <div className='rounded-lg gap-4 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a]  px-2 py-2 flex items-center'>
                        {/* Placeholder for Discover icon, you can use a specific one */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        {!isShrunk && <span className="ml-2">Discover</span>}
                    </div></Link>
                </div>

                {/* Display Users Section */}
                <div className='pt-7'>
                    {!isShrunk && <div className='text-[13px] text-gray-400 py-2'>Messages</div>}
                    {displayableUsers.length > 0 ? (
                        displayableUsers.map((user: any) => (
                            <div 
                                key={user.id} 
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
                        !isShrunk && <div className='text-xs text-gray-500 px-2 py-1'>No users to display.</div>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}
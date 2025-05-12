'use client'
import React, { useEffect, useState, Suspense } from 'react' // Ensure Suspense is imported
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import { useSession } from "next-auth/react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSidebarContext } from '@/assets/components/SidebarContext';

interface UserProfile {
    name: string;
    // Add other editable fields here if needed
}

// This component will contain the actual content and logic of your settings page
function SettingsContent() {
    const { data: sessionData, status } = useSession();
    const { isShrunk } = useSidebarContext();
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
    });
    const [initialProfile, setInitialProfile] = useState<UserProfile>({
        name: '',
    });

    useEffect(() => {
        if (sessionData?.user) {
            const userData = {
                name: sessionData.user.name || '',
            };
            setProfile(userData);
            setInitialProfile(userData);
        }
    }, [sessionData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving profile:", profile);
        setInitialProfile(profile);
        alert("Profile changes saved (logged to console)!");
    };

    const handleCancelChanges = () => {
        setProfile(initialProfile);
    };

    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);

    if (status === "loading") {
        return (
            <div>
                <Sidebar />
                <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                    <Topbar />
                    <div className='mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]'>
                        <p>Loading settings content...</p> {/* More specific loading message */}
                    </div>
                </div>
            </div>
        );
    }

    if (!sessionData?.user) {
        return (
            <div>
                <Sidebar />
                <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                    <Topbar />
                    <div className='mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]'>
                        <p>Please log in to view settings.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // The Suspense boundary was here, but it's more effective at the page root.
        // The content itself is now wrapped by the Page default export's Suspense.
        <div>
            <Sidebar />
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar />
                <div className='mt-[80px] px-[2vw] py-8'>
                    <h1 className='text-3xl font-semibold mb-8'>Settings</h1>

                    {/* Profile Section */}
                    <section className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-medium mb-6">Profile Information</h2>
                        <div className='flex flex-col md:flex-row gap-8 items-start'>
                            <div className="flex-shrink-0">
                                {sessionData.user.image && (
                                    <Image 
                                        src={sessionData.user.image} 
                                        width={150} 
                                        height={150} 
                                        className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" 
                                        alt='profile'
                                    />
                                )}
                                {/* <Button variant="outline" className="mt-4 w-full">Change Picture</Button> */}
                            </div>
                            
                            <form onSubmit={handleSaveProfile} className='flex-grow space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div>
                                        <label htmlFor="username" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Username</label>
                                        <input
                                            id="username"
                                            type='text'
                                            className='border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-800 bg-gray-50 py-2 text-[16px] rounded-md w-full text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            value={(sessionData.user as any)?.username || sessionData.user.email?.split('@')[0] || "N/A"}
                                            readOnly
                                        /> 
                                    </div>
                                    <div>
                                        <label htmlFor="name" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Full Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type='text'
                                            placeholder='Your full name'
                                            className='border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                                            value={profile.name}
                                            onChange={handleInputChange}
                                        /> 
                                    </div>
                                    <div>
                                        <label htmlFor="email" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email</label>
                                        <input
                                            id="email"
                                            type='email'
                                            className='border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-800 bg-gray-50 py-2 text-[16px] rounded-md w-full text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            value={sessionData.user.email || "N/A"}
                                            readOnly
                                        /> 
                                    </div>
                                </div>
                                {/* Add more profile fields here, e.g., bio, location */}
                                {/* <div>
                                    <label htmlFor="bio" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Bio</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={3}
                                        placeholder='Tell us a bit about yourself'
                                        className='border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                                        // value={profile.bio}
                                        // onChange={handleInputChange}
                                    />
                                </div> */}
                                {hasChanges && (
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button type="button" variant="outline" onClick={handleCancelChanges}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </form> 
                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-medium mb-6">Appearance</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Theme preferences (Light/Dark/System) can be adjusted using the theme toggle button in the top navigation bar.
                        </p>
                    </section>

                    {/* Account Section */}
                    <section className="p-6 border border-red-300 dark:border-red-700 rounded-lg shadow-sm bg-red-50 dark:bg-red-900/20">
                        <h2 className="text-2xl font-medium mb-6 text-red-700 dark:text-red-400">Account Management</h2>
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and data.</p>
                            <Button 
                                variant="destructive" 
                                onClick={() => alert("Delete account functionality not yet implemented. This would typically require confirmation and an API call.")}
                            >
                                Delete Account
                            </Button>
                            <p className="text-sm text-red-600 dark:text-red-500">
                                Warning: Deleting your account is irreversible and will remove all your data.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// Default export for the page, wrapping the content component with Suspense
export default function Page() {
    return (
        <Suspense fallback={
            // You can provide a more sophisticated skeleton loader here if desired
            <div>
                {/* Minimal layout during page suspense */}
                {/* <Sidebar />  Consider if Sidebar/Topbar should be part of this root fallback */}
                {/* <div className='ml-[16em]'> */}
                    {/* <Topbar /> */}
                    <div className='mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]'>
                        <p>Loading settings page...</p>
                    </div>
                {/* </div> */}
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
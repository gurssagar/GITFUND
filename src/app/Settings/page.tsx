'use client'
import React, { useEffect, useState } from 'react'
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import { useSession } from "next-auth/react";
import Image from 'next/image';
export default function Page() {
    const session = useSession();
    console.log(session.data)
    return (
        <>
        <div>
            <Sidebar />
				<div className='ml-[16em]'>
					<Topbar/>
                    <div className='mt-[80px] px-[2vw]'>
                        {
                            session?
                            <>
                                <div className='flex gap-6 '>
                                    <div>
                                        <Image src={session?.data?.user?.image} width={200} height={200} className="rounded rounded-xl" alt='profile'/>

                                    </div>
                                    
                                    <div className='w-[calc(100%_-200px)] text-xl'>
                                        <div>
                                            <h1 className='text-3xl font-semibold mb-4'>Settings</h1>
                                        </div>
                                        <form className='grid grid-cols-2 gap-6'>
                                            <div className=''>
                                                <div className='my-1 text-sm'>Username</div>
                                                <input
                                                    type='text'
                                                    placeholder='name'
                                                    className='border border-gray-800 px-2 bg-black py-2 text-[16px] rounded-md p-1 w-full'
                                                    value={(session?.data?.user as any)?.username || ""}
                                                    readOnly
                                                /> 
                                            </div>
                                            <div className=''>
                                                <div className='my-1 text-sm'>Name</div>
                                                <input
                                                    type='text'
                                                    placeholder='name'
                                                    className='border border-gray-800 px-2 bg-black py-2 text-[16px] rounded-md p-1 w-full'
                                                    value={session?.data?.user?.name || ""}
                                                    readOnly
                                                /> 
                                            </div>
                                            <div className=''>
                                                <div className='my-1 text-sm'>Email</div>
                                                <input
                                                    type='text'
                                                    placeholder='name'
                                                    className='border border-gray-800 px-2 text-[16px] bg-black py-2 rounded-md p-1 w-full'
                                                    value={session?.data?.user?.email || ""}
                                                    readOnly
                                                /> 
                                            </div>
                                            
                                        </form>
                                    </div> 

                                </div>
                                   
                            </>:
                            <>
                            </>
                        }
                       
                        <div>                            
                        </div>
                    
                    </div>
                </div>
        </div>
        
        </>
    )
}
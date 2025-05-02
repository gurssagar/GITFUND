'use client'
import React, { useEffect, useState } from 'react'
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
export default function page() {
    const session = useSession();
    console.log(session.data)
    useEffect(() => {
        const git=async()=>{
        }
    })
    return (
        <>
        <div>
            <Sidebar />
				<div className='mx-[16em]'>
					<Topbar/>
                    <div className='mt-[80px] ml-[2vw]'>
                        <Image src={session?.data?.user?.image} width={200} height={200} className="rounded rounded-xl" alt='profile'/>
                        <div className='text-xl'>
                            {session?.data?.user?.name} 
                        </div>
                    </div>
                </div>

        </div>
        
        </>
    )
}
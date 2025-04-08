'use client'
import { useSession } from 'next-auth/react';
import { useState,useEffect } from 'react'

import { signOut } from "next-auth/react"
import Image from "next/image";
import Link from 'next/link';
import { useWeb3 } from "./web3Context";
export default function Topbar(  ) {
  const { account, connectWallet } = useWeb3();
  const session = useSession()
  const [visible, setVisible] = useState(false)
  const [image,updateImage]=useState('')
  useEffect(()=>{
      if(session?.data?.user?.image){
          updateImage(session?.data?.user?.image)
      }
  },[session?.data?.user?.image])
  return(
    <>
    <div className=' dark:bg-[#0a0a0a] bg-white fixed top-0 px-5 py-4 border-b-[1px] border-gray-600 w-[calc(100%_-_16rem)]'>
                    <div className='flex justify-between'>
                        <div className='flex'>
                        <div className='pr-2 border-r-1 border-gray-800'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>
                        </div>
                        <p className='pl-4'> </p>
                        </div>
                        <div className="flex space-x-4 ">
                            {account ? (
                                <p>Connected: {account}</p>
                            ) : (
                                <button onClick={connectWallet} className="px-4 py-2 bg-gray-900 text-white rounded">
                                Connect Wallet
                                </button>
                            )}
                            {
                                session?.data?.user?.image?
                                <>
                                        <Image onClick={() =>{
                                        setVisible(!visible)
                                    }} src={image} alt="" width={26} height={26} className='rounded'></Image>
                                </>:
                                <>
                                <Link href={`/Login`}>
                                <button  className='px-4 py-1 text-[12px] rounded-lg text-black bg-white'>Login</button>

                                </Link>
                                </>
                            }
                            
                        </div>
                        {
                            visible ? 
                            <>
                            <div className='fixed top-16 right-5 bg-white dark:bg-black border-[1px] pl-4 pr-20 py-2 rounded-[10px] dark:border-gray-700 text-bold'>
                                <div><Link href={``} className='pb-1 text-[14px] pt-1'>Settings</Link></div>
                                <div><Link  href={``} className='pb-1  text-[14px] pt-1'>Support</Link></div>
                                <button 
                                    className='pb-1 text-[14px] pt-1 bg-black text-white dark:bg-white dark:text-black w-full rounded px-3 py-2 mt-2' 
                                    onClick={() => signOut()}
                                >
                                    Sign out
                                </button>
                            </div>
                            </>:
                            <></>
                        }
                    </div>
                   
                </div>
    </>
  )

}

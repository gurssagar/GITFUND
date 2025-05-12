'use client'
import { useSession } from 'next-auth/react';
import { useState,useEffect } from 'react'
import { useSidebarContext } from './SidebarContext';
import { signOut } from "next-auth/react"
import Image from "next/image";
import Link from 'next/link';
import { useWeb3 } from "./web3Context";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import SearchModal from './SearchModal';
import { useSearch } from './SearchContext'; 
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export default function Topbar(  ) {
const { isSearchOpen, toggleSearchModal, closeSearchModal } = useSearch();
  const router = useRouter();
  const { setTheme } = useTheme()
  const pathname = usePathname();
  console.log(pathname)
  const searchParams = useSearchParams();
  console.log(searchParams)
  const { account, connectWallet } = useWeb3();
  const session = useSession()
  const [visible, setVisible] = useState(false)
  const [image,updateImage]=useState('')
  const { isShrunk, setIsShrunk } = useSidebarContext();
  useEffect(()=>{
      if(session?.data?.user?.image){
          updateImage(session?.data?.user?.image)
      }
  },[session?.data?.user?.image])
  return(
    <>
    <Suspense fallback={<div>Loading...</div>}>
    <div className={`dark:bg-[#0a0a0a] bg-white fixed top-0 px-5 py-4 border-b-[1px] border-gray-600 ${isShrunk ? 'w-[calc(100%_-_4rem)]' : 'w-[calc(100%_-_16rem)]'} transition-all duration-400 ease-in-out` } style={{ transitionProperty: 'width, padding' }}>
        <div className='flex justify-between'>
            <div className='flex items-center'> {/* Added items-center for better vertical alignment */}
                <div className='pr-2 border-r-1 border-gray-800' onClick={() => setIsShrunk(!isShrunk)} style={{ cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>
                </div>
                {/* Display breadcrumbs based on the current path */}
                <div className='pl-4 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                    {pathname === '/' ? (
                        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
                    ) : (
                        pathname.split('/').filter(part => part.length > 0).map((part, index, arr) => (
                            <span key={part + index}> {/* Added index to key for robustness */}
                                <Link href={`/${arr.slice(0, index + 1).join('/')}`} className="hover:text-gray-700 dark:hover:text-gray-200">
                                    {/* Capitalize first letter and replace hyphens for display */}
                                    {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
                                </Link>
                                {index < arr.length - 1 && <span className="mx-2">/</span>}
                            </span>
                        ))
                    )}
                </div>
            </div>
            <div className="flex space-x-4 ">
                            {account ? (
                                <p>Wallet Connected</p>
                            ) : (
                                <button onClick={connectWallet} className="px-4 text-[14px] py-1 bg-gray-900 text-white rounded">
                                Connect Wallet
                                </button>
                            )}
                                                        <div>
                                <button onClick={toggleSearchModal} className="flex items-center space-x-2 dark:bg-[#1a1a1a] bg-[#dedede] dark:hover:bg-[#2a2a2a] hover:bg-[#cccccc] text-gray-900 dark:text-gray-300 px-3 py-1.5 rounded-md text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <span>Search</span>
                                    <span className="text-xs bg-[#d6d6d6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">⌘K</span>
                                </button>
                            </div>
                            
                            {
                                session?.data?.user?.image?
                                <>
                                        <Image onClick={() =>{
                                        setVisible(!visible)
                                    }} src={image} alt="" width={26} height={26} className='rounded'></Image>
                                </>:
                                <>
                                <Link href={`/Login`}>
                                <button  className='px-4 py-2 text-[14px] rounded-lg dark:text-black text-white bg-black dark:bg-white'>Login</button>

                                </Link>
                                </>
                            }
                             <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                            
                        </div>
                        {
                            visible ? 
                            <>
                            <div className='fixed top-16 right-5 bg-white dark:bg-black border-[1px] pl-4 pr-20 py-2 rounded-[10px] dark:border-gray-700 text-bold'>
                                <div onClick={() => {router.push('/Settings'); setVisible(false);}} className='pb-1 text-[14px] pt-1 cursor-pointer hover:text-gray-400'>Settings</div>
                                <div onClick={() => {router.push('/support'); setVisible(false);}} className='pb-1 text-[14px] pt-1 cursor-pointer hover:text-gray-400'>Support</div>
                                <button 
                                    className='pb-1 text-[14px] pt-1 bg-black text-white dark:bg-white dark:text-black w-full rounded px-3 py-2 mt-2 text-left' 
                                    onClick={() => {signOut(); setVisible(false);}}
                                >
                                    Sign out
                                </button>
                            </div>
                            </>:
                            <></>
                        }
                        
                    </div>
                   
                   
                </div>
                </Suspense>
    </>
  )

}

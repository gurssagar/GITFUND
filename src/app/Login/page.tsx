'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { signIn } from "next-auth/react"
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShootingStarBorder from "@/components/border";
import { Icon } from '@iconify/react'
import { useAccount } from 'wagmi'
interface User {
  username?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionData {
  user?: User;
}

interface Session {
  data?: SessionData | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
}

interface ApiError {
  message: string;
  status?: number;
}

interface SignupApiResponse {
  users?: Array<{
    id: string;
    name: string;
    email: string;
    // Add other user properties as needed
  }>;
  error?: ApiError;
}

export default function Login() {
    const session: Session = useSession();
    const { address, isConnected } = useAccount();
    const truncateAddress = (addr: string) => {
      if (!addr) return "";
      return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
    };
    const [userData, changeUserData] = useState<SignupApiResponse | null>(null);
    const [isMobileNavOpen,setMobileNavOpen] = useState(false);
    
    const getData = async (): Promise<void> => {
        try {
            const response = await fetch('/api/signup');
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const data: SignupApiResponse = await response.json();
            changeUserData(data);
        } catch (error) {
            console.error('Error fetching signup data:', error);
        }
    };
    useEffect(() => {
        getData();
    }, []);

    return (
       <>
       <Suspense fallback={<div>Loading...</div>}> {/* Added fallback for Suspense */}

       <>
       <header className="fixed bg-black top-0 left-0 right-0 z-50 border border-b-1 h-16   md:top-4 md:left-4 md:right-4 md:border-none">
                     <div className="md:max-w-7xl w-full mx-auto md:bg-black md:dark:bg-[#1A1A1A]/80 md:backdrop-blur-md md:rounded-full md:border md:dark:border-custom-dark-gray/50">
                       <div className="flex justify-between items-center px-4 py-3 md:px-6">
                   <div>
                     <Image
                       src="/gitfund-white.webp"
                       alt="GitFund logo"
                       width={120}
                       height={40}
                     />
                   </div>
                   <nav className="hidden md:flex items-center space-x-2">
                     <Link
                       href="/"
                       className="px-3 py-2 text-sm text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                     >
                       Home
                     </Link>
                     <Link
                       href="/Browse"
                       className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                     >
                       Projects
                     </Link>
                     <Link
                       href="/homepage"
                       className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                     >
                       Dashboard
                     </Link>
                     <Link
                       href="/create-project"
                       className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                     >
                       Submit Project
                     </Link>
                   </nav>
                   <div className="flex items-center space-x-4 hidden md:flex">
                     <ShootingStarBorder href="/Login">Sign In</ShootingStarBorder>
                   </div>
                   <div className="md:hidden">
                     <div
                       
                       className="text-white focus:outline-none"
                     >
                       {
         isMobileNavOpen ? (
           <button
             onClick={() => setMobileNavOpen(false)}
             aria-label="Close navigation menu"
             className="p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <Icon icon="maki:cross" width="24" height="24" />
           </button>
         ) : (
           <button
             onClick={() => setMobileNavOpen(true)}
             aria-label="Open navigation menu"
             className="p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <Icon icon="fluent:navigation-16-filled" width="24" height="24" />
           </button>
         )
       }
       
                       
                     </div>
                   </div>
                 </div>
               </div>
             </header>
       
             {
               isMobileNavOpen?
               <>
                 <div className="mt-16 z-50 bg-white   dark:bg-black fixed h-[calc(100%-_64px)] w-full">
                                     <div>
                                       <div className="px-4 flex flex-col h-[calc(100%-_64px)] justify-between">
                                                 <div className="">
                                                   
                                                   <div>
                                                     <div className="pt-4">
                                                       <div className="text-[13px] text-gray-400 ">Explore</div>
                                                       <Link href="/homepage">
                                                         <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="20"
                                                             height="20"
                                                             viewBox="0 0 24 24"
                                                           >
                                                             <g
                                                               fill="none"
                                                               stroke="currentColor"
                                                               stroke-linecap="round"
                                                               stroke-linejoin="round"
                                                               stroke-width="2"
                                                             >
                                                               <circle cx="12" cy="12" r="9" />
                                                               <path d="M11.307 9.739L15 9l-.739 3.693a2 2 0 0 1-1.568 1.569L9 15l.739-3.693a2 2 0 0 1 1.568-1.568" />
                                                             </g>
                                                           </svg>
                                                           Discover
                                                         </div>
                                                       </Link>
                                       
                                                       <Link href={`/Browse`}>
                                                         <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="20"
                                                             height="20"
                                                             viewBox="0 0 24 24"
                                                           >
                                                             <path
                                                               fill="none"
                                                               stroke="currentColor"
                                                               stroke-linecap="round"
                                                               stroke-linejoin="round"
                                                               stroke-width="1.5"
                                                               d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424"
                                                               color="currentColor"
                                                             />
                                                           </svg>
                                                           Browse
                                                         </div>
                                                       </Link>
                                                       <Link href="/GitBot">
                                                         <div className="rounded-lg text-sm active:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="20"
                                                             height="20"
                                                             viewBox="0 0 24 24"
                                                           >
                                                             <path
                                                               fill="currentColor"
                                                               d="M12 2.5c-3.81 0-6.5 2.743-6.5 6.119c0 1.536.632 2.572 1.425 3.56c.172.215.347.422.527.635l.096.112c.21.25.427.508.63.774c.404.531.783 1.128.995 1.834a.75.75 0 0 1-1.436.432c-.138-.46-.397-.89-.753-1.357a18 18 0 0 0-.582-.714l-.092-.11c-.18-.212-.37-.436-.555-.667C4.87 12.016 4 10.651 4 8.618C4 4.363 7.415 1 12 1s8 3.362 8 7.619c0 2.032-.87 3.397-1.755 4.5c-.185.23-.375.454-.555.667l-.092.109c-.21.248-.405.481-.582.714c-.356.467-.615.898-.753 1.357a.751.751 0 0 1-1.437-.432c.213-.706.592-1.303.997-1.834c.202-.266.419-.524.63-.774l.095-.112c.18-.213.355-.42.527-.634c.793-.99 1.425-2.025 1.425-3.561C18.5 5.243 15.81 2.5 12 2.5M8.75 18h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5m.75 3.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75"
                                                             />
                                                           </svg>
                                                           Recommendations
                                                         </div>
                                                       </Link>
                                                     </div>
                                                     <div className="pt-3">
                                                       <div className="text-[13px] text-gray-400 py-2">
                                                         Contributor
                                                       </div>
                                                       
                                                       <Link href={{
                                                         pathname: '/userProfile',
                                                         query: {
                                                           user: (session?.data?.user as any)?.username,
                                                         },
                                                       }}>
                                                         <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z" clip-rule="evenodd"/></svg>
                                                           User Profile
                                                         </div>
                                                       </Link>
                                                       <Link href="/assignedProjects" className="">
                                                         <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="20"
                                                             height="20"
                                                             viewBox="0 0 48 48"
                                                           >
                                                             <defs>
                                                               <mask id="ipSSeoFolder0">
                                                                 <g fill="none" stroke-width="4">
                                                                   <path
                                                                     fill="#fff"
                                                                     stroke="#fff"
                                                                     stroke-linejoin="round"
                                                                     d="M5 8a2 2 0 0 1 2-2h12l5 6h17a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"
                                                                   />
                                                                   <path
                                                                     stroke="#000"
                                                                     stroke-linecap="round"
                                                                     stroke-linejoin="round"
                                                                     d="m14 22l5 5l-5 5"
                                                                   />
                                                                   <path
                                                                     stroke="#000"
                                                                     stroke-linecap="round"
                                                                     d="M26 32h8"
                                                                   />
                                                                 </g>
                                                               </mask>
                                                             </defs>
                                                             <path
                                                               fill="currentColor"
                                                               d="M0 0h48v48H0z"
                                                               mask="url(#ipSSeoFolder0)"
                                                             />
                                                           </svg>
                                                           Projects
                                                         </div>
                                                       </Link>
                                                       <a href="Rewards">
                                                         <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="20"
                                                             height="20"
                                                             viewBox="0 0 12 12"
                                                           >
                                                             <path
                                                               fill="currentColor"
                                                               d="M2.25 1C1.56 1 1 1.56 1 2.25v1.162a1.5 1.5 0 0 0 .772 1.31l2.876 1.599a3 3 0 1 0 2.704 0l2.877-1.598A1.5 1.5 0 0 0 11 3.412V2.25C11 1.56 10.44 1 9.75 1zM2 2.25A.25.25 0 0 1 2.25 2H4v2.817l-1.743-.968A.5.5 0 0 1 2 3.412zm3 3.122V2h2v3.372l-1 .556zm3-.555V2h1.75a.25.25 0 0 1 .25.25v1.162a.5.5 0 0 1-.257.437zM8 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0"
                                                             />
                                                           </svg>
                                                           Rewards
                                                         </div>
                                                       </a>
                                                     </div>
                                                     <div className="pt-3">
                                                       <div className="text-[13px] text-gray-400 py-2">
                                                         Maintainer
                                                       </div>
                                                       <Link href="/contributorRequests">
                                                         <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             width="20"
                                                             className="my-auto mr-2"
                                                             height="20"
                                                             viewBox="0 0 24 24"
                                                           >
                                                             <path
                                                               fill="none"
                                                               stroke="currentColor"
                                                               stroke-linecap="round"
                                                               stroke-linejoin="round"
                                                               stroke-width="1.5"
                                                               d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3"
                                                               color="currentColor"
                                                             />
                                                           </svg>
                                                           Contribution Requests
                                                         </div>
                                                       </Link>
                                       
                                                       <Link href="/myProjects">
                                                         <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                           <svg
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             className="my-auto mr-2"
                                                             width="16"
                                                             height="16"
                                                             viewBox="0 0 16 16"
                                                           >
                                                             <path
                                                               fill="currentColor"
                                                               d="M13.5 5.88c-.28 0-.5-.22-.5-.5V1.5c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v2c0 .28-.22.5-.5.5S2 3.78 2 3.5v-2C2 .67 2.67 0 3.5 0h9c.83 0 1.5.67 1.5 1.5v3.88c0 .28-.22.5-.5.5"
                                                             />
                                                             <path
                                                               fill="currentColor"
                                                               d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-10C0 3.67.67 3 1.5 3h4.75c.16 0 .31.07.4.2L8 5h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5M1.5 4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H7.75a.48.48 0 0 1-.4-.2L6 4z"
                                                             />
                                                             <path
                                                               fill="currentColor"
                                                               d="M5.5 13h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5"
                                                             />
                                                           </svg>
                                                           My Projects
                                                         </div>
                                                       </Link>
                                                       <Link href="/PullRequests" >
                                                         <div className="rounded-lg gap-2 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path d="M37 44a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM11 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm0 32a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"/><path stroke-linecap="round" d="M11 12v24m13-26h9a4 4 0 0 1 4 4v22"/><path stroke-linecap="round" d="m30 16l-6-6l6-6"/></g></svg>
                                                           Pull Requests
                                                         </div>
                                                       </Link>
                                                       <Link href="/gitfundChat">
                                                         <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] pl-1 pr-4 py-2 flex">
                                                           <div className="flex gap-1">
                                                             <svg
                                                               xmlns="http://www.w3.org/2000/svg"
                                                               width="24"
                                                               height="24"
                                                               viewBox="0 0 24 24"
                                                             >
                                                               <g fill="none" stroke="currentColor" stroke-width="1">
                                                                 <path d="M4 12a8 8 0 1 1 16 0v5.09c0 .848 0 1.27-.126 1.609a2 2 0 0 1-1.175 1.175C18.36 20 17.937 20 17.09 20H12a8 8 0 0 1-8-8Z" />
                                                                 <path
                                                                   stroke-linecap="round"
                                                                   stroke-linejoin="round"
                                                                   d="M9 11h6m-3 4h3"
                                                                 />
                                                               </g>
                                                             </svg>
                                                             Gitfund Chat
                                                           </div>
                                                         </div>
                                                       </Link>
                                                     </div>
                                                   </div>{" "}
                                                   {/* End of wrapper for top content */}
                                                   <div
                                                     onClick={() => open()}
                                                     className=" px-4 py-2 dark:bg-custom-dark-gray bg-gray-200 dark:text-white text-black  rounded-lg cursor-pointer text-center mb-4"
                                                   >
                                                     {isConnected ? (
                                                       <div
                                                         onClick={() => {
                                                           open;
                                                         }}
                                                       >
                                                         <div className="flex gap-2">
                                                           <div>
                                                             <svg
                                                               xmlns="http://www.w3.org/2000/svg"
                                                               width="20"
                                                               height="20"
                                                               viewBox="0 0 24 24"
                                                               className="mx-auto"
                                                             >
                                                               <path
                                                                 fill="currentColor"
                                                                 d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                                                               />
                                                             </svg>
                                                           </div>
                                                           {truncateAddress(address as string)}
                                                         </div>
                                                       </div>
                                                     ) : (
                                                       "Connect Wallet"
                                                     )}
                                                   </div>
                                                 </div>{" "}
                                                 {/* End of flex container */}
                                               </div>
                                     </div>
                         
                                   </div>
               </>
               :
               <></>
             }
       </>
        <div>
            <div className='block lg:flex'>
                <div className='lg:w-1/2'>
                    <img src="/signup.jpg" alt="Signup illustration" /> {/* Added alt text */}
                </div>
                <div className='lg:w-1/2 my-auto px-20'>
                    <div className='text-4xl font-bold py-4'>Welcome to GitFund</div>
                    <hr className='text-gray-800'></hr>
                    
                    <div className=' py-5'>
                        <h2 className='text-xl font-bold'>Login / Sign up</h2>
                        <p className='text-[14px] pt-3'>Create your account or Login to collaborate on cutting-edge projects, join thriving ecosystems, and bring your ideas to life.</p>
                        <p className='text-[14px] my-2 text-gray-400'>Login / Create an account</p>
                        <button  onClick={
                            () => {
                                signIn("github")
                                
                            }
                            } className='flex text-[14px] text-white bg-[#212124] rounded-lg px-3 py-2 '><img src="/github-mark-white.svg" className='w-5 h-5 my-auto mr-2' alt="GitHub logo" />Continue with Github</button> {/* Added alt text */}
                    </div>
                    <div className=''>
                        <div className='pt-[20%] flex justify-between'>
                            <a href="#terms"><p>Terms & conditions</p></a> {/* Assuming #terms is an anchor */}
                            <div className='flex space-x-4'>
                                <a href="#linkedin" aria-label="LinkedIn"><svg className='border rounded dark:border-custom-dark-gray p-2 hover:bg-gray-600' xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg></a> {/* Added href and aria-label */}
                                <a href="#twitter" aria-label="Twitter"><svg className='border rounded dark:border-custom-dark-gray p-2 hover:bg-gray-600'  xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0.08rem" ><path d="M18.2048 2.25H21.5128L14.2858 10.51L22.7878 21.75H16.1308L10.9168 14.933L4.95084 21.75H1.64084L9.37084 12.915L1.21484 2.25H8.04084L12.7538 8.481L18.2048 2.25ZM17.0438 19.77H18.8768L7.04484 4.126H5.07784L17.0438 19.77Z"></path></svg></a> {/* Added href and aria-label */}
                            </div>
                        </div>
                    </div>
                </div>
                

            </div>
            
        </div>
        </Suspense>
       </> 
    )

}
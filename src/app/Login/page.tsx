'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { signIn } from "next-auth/react"
import { Suspense } from 'react'

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
    const [userData, changeUserData] = useState<SignupApiResponse | null>(null);
    
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
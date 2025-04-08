'use client'
import {useState,useEffect} from 'react'
import { useSession } from 'next-auth/react'
import { signIn } from "next-auth/react"
import Router from 'next/router'

export default function Login(){
    const session=useSession()
    const id = (session?.data?.user as any)?.username;
    const [userData,changeUserData]=useState<any>()
    const getData = async () => {
        try {
            const response = await fetch('/api/signup');
            const data = await response.json();
            changeUserData(data);
            console.log(data);
        } catch (error) {
            console.error('Error checking cookie:', error);
        }
    };
    useEffect(() => {
        getData();
    }, []);

    return (
       <>
        <div>
            <div className='block lg:flex'>
                <div className='w-1/2'>
                    <img src="/signup.jpg"></img>
                </div>
                <div className='w-1/2 my-auto px-20'>
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
                            } className='flex text-[14px] text-white bg-[#212124] rounded-lg px-3 py-2 '><img src="/github-mark-white.svg" className='w-5 h-5 my-auto mr-2' ></img>Continue with Github</button>
                    </div>
                    <div className=''>
                        <div className='pt-[20%] flex justify-between'>
                            <a ><p>Terms & conditions</p></a>
                            <div className='flex space-x-4'>
                                <a><svg className='border rounded border-gray-800 p-2 hover:bg-gray-600' xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
                                <a><svg className='border rounded border-gray-800 p-2 hover:bg-gray-600'  xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="currentColor" stroke-width="0.08rem" ><path d="M18.2048 2.25H21.5128L14.2858 10.51L22.7878 21.75H16.1308L10.9168 14.933L4.95084 21.75H1.64084L9.37084 12.915L1.21484 2.25H8.04084L12.7538 8.481L18.2048 2.25ZM17.0438 19.77H18.8768L7.04484 4.126H5.07784L17.0438 19.77Z"></path></svg></a>
                            </div>
                        </div>
                    </div>
                </div>
                

            </div>
            
        </div>
       </> 
    )

}
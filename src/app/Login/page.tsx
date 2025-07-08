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
import { SignInPage } from "@/components/sign-in-flow-1";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

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



    const testimonials = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

    return (
       <>
       <Suspense fallback={<div>Loading...</div>}> {/* Added fallback for Suspense */}

       
        <div>
            <div className='block lg:flex'>
                <div className='lg:w-1/2 lg:block hidden bg-black'>
                     <InfiniteMovingCards
                      items={testimonials}
                      direction="top"
                      speed="slow"
                    />
                </div>
                <div className='lg:w-1/2 my-auto '>
                    <SignInPage />
                </div>
                

            </div>
            
        </div>


        
                            

        </Suspense>
       </> 
    )

}
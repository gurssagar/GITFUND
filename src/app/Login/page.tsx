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


    const testimonials =[
  {
    key: "1",
    repoName: "gitfund-web",
    repoTitle: "GitFund Platform",
    personName: "alice",
    date: "2025-07-01"
  },
  {
    key: "2",
    key: "2",
    repoName: "api-gateway",
    repoTitle: "API Gateway Service",
    personName: "bob-engineer",
    date: "2025-07-05"
  },
  {
    key: "3",
    repoName: "auth-service",
    repoTitle: "Authentication Service",
    personName: "carol-security",
    date: "2025-07-07"
  },
  {
    key: "4",
    repoName: "database-migrator",
    repoTitle: "Database Migration Tool",
    personName: "dave-dba",
    date: "2025-07-09"
  }
]
  const testimonials1=[
    {
    key: "4",
    repoName: "data-visualizer",
    repoTitle: "Data Visualization Toolkit",
    personName: "dana-analyst",
    date: "2025-07-10"
  },
  {
    key: "5",
    repoName: "mobile-app",
    repoTitle: "Mobile Application",
    personName: "emma-dev",
    date: "2025-07-12"
  },
  {
  key: "6",
  repoName: "ai-assistant",
  repoTitle: "AI Coding Assistant",
  personName: "frank-ai",
  date: "2025-07-15"
},
{
  key: "8",
  repoName: "ui-library",
  repoTitle: "Component UI Library",
  personName: "henry-designer",
  date: "2025-07-20"
}


  
  ]
  const testiomials2=[
    {
    key: "3",
    repoName: "perf-optimizer",
    repoTitle: "Performance Optimizer",
    personName: "charlie-ops",
    date: "2025-07-08"
  },
  {
  key: "10",
  repoName: "test-automation",
  repoTitle: "Test Automation Framework",
  personName: "jack-qa",
  date: "2025-07-25"
},
{
  key: "9",
  repoName: "api-docs",
  repoTitle: "API Documentation Generator",
  personName: "ivy-techwriter",
  date: "2025-07-22"
}



  
  ]

    return (
       <>
       <Suspense fallback={<div>Loading...</div>}> {/* Added fallback for Suspense */}

       
        <div>
            <div className='block lg:flex bg-black'>
                <div className='my-auto lg:flex hidden bg-black'>
                     <InfiniteMovingCards
                      items={testimonials}
                      direction="top"
                      speed="slow"
                    />
                     <InfiniteMovingCards
                      items={testimonials1}
                      direction="top"
                      speed="slow"
                    />
                     <InfiniteMovingCards
                      items={testiomials2}
                      direction="top"
                      speed="slow"
                    />
                </div>
                <div className='lg:w-[50%] my-auto '>
                    <SignInPage />
                </div>
                

            </div>
            
        </div>


        
                            

        </Suspense>
       </> 
    )

}
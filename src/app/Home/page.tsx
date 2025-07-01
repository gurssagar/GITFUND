'use client'
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
}

interface CustomSession extends Session {
  accessToken?: string;
  user?: User;
}

interface CheckCookieResponse {
  exists: boolean;
}

export default function Home() {
    const router = useRouter();
    const [hasHttpOnlyCookie, setHasHttpOnlyCookie] = useState<boolean>(false);
    const { data: session } = useSession() as { data: CustomSession | null };
    
    const name = session?.user?.name;
    const userImg = session?.user?.image;
    const githubAccessToken = session?.accessToken;

    useEffect(() => {
        const checkCookie = async () => {
            try {
                const response = await fetch('/api/check-cookie');
                const data: CheckCookieResponse = await response.json();
                setHasHttpOnlyCookie(data.exists);
            } catch (error) {
                console.error('Error checking cookie:', error);
            }
        };
        checkCookie();
    }, []);

    return(
        <>
        <Suspense fallback={<div>Loading...</div>}>
        <div className="fixed top-10 left-0 right-0 z-50 w-max-[50%] mx-40">
      <div className=" flex justify-between py-4 px-10 bg-black dark:bg-transparent  dark:backdrop-blur-[10px] rounded-full">
        <div>
          <img
            src="/gitfund-white.webp"
            alt="logo"
            className="h-14 object-contain "
          />
        </div>
        <div className="flex space-x-4">
          <button className="text-white " onClick={() => router.push("/")}>
            Home
          </button>
          {githubAccessToken ? (
              <>
                <button
                    className="text-white "
                    onClick={() => router.push("/AddBounties")}
                >
                    AddBounties
                </button>
              
              <button
                className="text-white "
                onClick={() => router.push("/Requests")}
              >
                Requests
              </button>
              
              <button
                className="text-white "
                onClick={() => router.push("/Acceptpr")}
              >
                Accept PR
              </button>
              <button
                className="text-white "
                onClick={() => router.push("/PullRequests")}
              >
                View PR
              </button>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className="flex space-x-4">
          {
            githubAccessToken ? <>
            <div className="flex space-x-8 my-auto">
              
              <div className="flex ">
                <div>
                  
                </div>
                <button
                  className="rounded-full  dark:text-black px-4  py-2 bg-gray-100 dark:bg-white "
                  onClick={() => {
                    signOut();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
            </>:
            <>
             <button
                className="rounded-full  dark:text-black px-4  py-2 bg-gray-100 dark:bg-white "
                onClick={() => signIn("github")}
              >
                Login With Github
              </button>
              </>
          }
            
         
            
             
            
          <div>
            <div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
        </>
    )
}
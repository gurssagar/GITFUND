'use client'
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from 'next/link'
export default function SignUp() {
    const session = useSession();
    const [walletAddress, setWalletAddress] = useState<any>("");
    const [isLoading, setIsLoading] = useState(false);

interface SessionUser {
    username: string;
}

const id = (session?.data?.user as SessionUser)?.username;
    const email = session?.data?.user?.email;
    const name = session?.data?.user?.name;
        const avail = async () => {
        try {
            const response = await fetch('/api/user-exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ compare: id }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.users && data.users.length > 0;
        }
        catch (error) {
            console.error('Error checking user:', error);
            return false;
        }
    }
    const [userExist,changeUserExist]=useState(false)
    useEffect(() => {
        const checkUser = async () => {
            const userExists = await avail();
            
            if (userExists) {
                // Handle case where user already exists
                changeUserExist(true)
            }
        };
        checkUser();
    }, [id]);

    




    
    
    
    

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    email,
                    name,
                    walletAddress
                }),
            });

            if (response.ok) {
                console.log("Data added successfully");
                // Handle successful signup (e.g., redirect)
            } else {
                console.error("Failed to add data");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        {userExist?
        <>
        <div>
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-[900px] w-[40rem] p-6 rounded-lg shadow-md border-1 border-gray-600">
                <h1 className="text-2xl font-bold mb-6">Sorry</h1>
                <p className="mb-4">User Already Exists</p>
                <form className="space-y-4" >
                    <div>
                        <p>Continue to the homepage to continue</p>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                        type="submit"
                        href="/homepage"
                        className="w-full flex text-white bg-black dark:text-black justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium dark:bg-white hover:bg-white disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Continue'}
                    </Link>
                    </div>
                    
                </form>
            </div>
        </div>
        </div>
        </>:
        <>
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-[900px] w-[40rem] p-6 rounded-lg shadow-md border-1 border-gray-600">
                <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
                <p className="mb-4">Fill In the Details Below to Complete The Sign up</p>
                <form className="space-y-4" onSubmit={handleSignUp}>
                    <div>
                        <label htmlFor="metaMask" className="block text-sm font-medium text-gray-200">
                            MetaMask Address
                        </label>
                        <input
                            onChange={(e) => setWalletAddress(e.target.value)}
                            value={walletAddress}
                            type="text"
                            id="metaMask"
                            name="metaMask"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your MetaMask address"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex text-white bg-black dark:text-black justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium dark:bg-white hover:bg-white disabled:opacity-50"
                        onClick={async (e) => {
                            await handleSignUp(e);
                            if (!isLoading) {
                                window.location.href = '/homepage';
                            }
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Complete Sign Up'}
                    </button>
                </form>
            </div>
        </div>
        </>}
        
        </>
    );
}
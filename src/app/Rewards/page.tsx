'use client'
import { useState, useEffect, ChangeEvent } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
import Topbar from '@/assets/components/topbar';
import Sidebar from '@/assets/components/sidebar';
import { useSidebarContext } from '@/assets/components/SidebarContext';
import { Suspense } from 'react';
// Removed unused useSearchParams for now
// Consider adding an icon library like react-icons if needed: npm install react-icons
// import { FiFilter, FiSearch } from 'react-icons/fi'; // Example icon import
// import { BsTable, BsGrid } from 'react-icons/bs'; // Example icon import

// Define an interface for reward transaction data (adjust fields as needed)
interface RewardTransaction {
    id: string;
    date: string; 
    Contributor_id: string;
    issue: string;
    value: string; 
    projectName: string;
}

interface RewardsApiResponse {
    Rewards: RewardTransaction[];
    // Add other potential properties from the API response if any
}

interface CustomUser {
    username?: string;
    // Add other user properties if they exist
}

interface CustomSessionData {
    user?: CustomUser & {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    // Add other session properties if they exist
}

interface CustomSession {
    data?: CustomSessionData | null;
}

export default function Rewards() {
    const { data: session }: CustomSession = useSession(); 
    const [rewards, setRewards] = useState<RewardTransaction[]>([]); 
    const [loading, setLoading] = useState<boolean>(true); 
    const [error, setError] = useState<string | null>(null); 
    const [searchTerm, setSearchTerm] = useState<string>(''); 
    const { isShrunk } = useSidebarContext(); 
    
    useEffect(() => {
        const fetchRewards = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/rewards');
                if (!response.ok) throw new Error('Failed to fetch rewards');
                const data: RewardsApiResponse = await response.json();
                const allRewards = data.Rewards;
                setRewards(allRewards);
                console.log('Fetched rewards:', allRewards);
            } catch (err: any) { // Catch block error typed as any or unknown
                console.error('Error fetching rewards:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        
        fetchRewards();
    }, [session]); // session dependency is fine, ensures re-fetch if session changes
    
    console.log('Rewards:', rewards); // Corrected typo from Rewardss to Rewards
    
    const filteredRewards = rewards.filter(reward => {
        if (!reward || typeof reward.projectName !== 'string' || typeof reward.Contributor_id !== 'string') {
            return false;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = reward.projectName.toLowerCase().includes(searchTermLower) ||
                             reward.Contributor_id.toLowerCase().includes(searchTermLower);

        if (!matchesSearch) {
            return false;
        }

        const currentUsername: string | undefined = session?.user?.username;
        if (currentUsername) {
            return reward.Contributor_id.toLowerCase() === currentUsername.toLowerCase();
        }

        return true;
    });
    console.log('Filtered rewards:', filteredRewards);
    
    let totalRewarded: number = 0;
    for (let i=0; i<filteredRewards.length; i++){
        totalRewarded += parseFloat(filteredRewards[i].value);
    }
    
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen">
            <Sidebar />
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto  mt-[60px]"> 
                    <div className="container mx-auto px-6 py-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            
                            <div className="rounded-lg shadow-md p-6 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-dark dark:text-white relative">
                                <h3 className="text-sm font-medium text-gray-100">Rewarded amount</h3>
                                <p className="text-3xl font-semibold text-white mt-1">{totalRewarded.toLocaleString()} PHAROS</p> {/* Added toLocaleString for formatting */}
                                <button className="absolute bottom-4 right-4 hover:text-dark text-white">
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            
                            <div className="rounded-lg shadow-md p-6 bg-gray-50 dark:bg-gray-800  relative">
                                <h3 className="text-sm font-medium text-gray-400">Paid</h3>
                                <p className="text-3xl font-semibold mt-1 text-dark dark:text-dark dark:text-white">{totalRewarded.toLocaleString()} PHAROS</p> {/* Added toLocaleString */}
                                 <button className="absolute bottom-4 right-4 text-gray-400 hover:text-dark dark:text-white">
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            
                            <div className="rounded-lg shadow-md p-6 bg-gray-50 dark:bg-gray-800 ">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Rewards Charts</h3>
                                
                                <div className="flex justify-around items-end h-20">
                                    {(() => {
                                        
                                        const monthMap: { [key: string]: number } = {};
                                        let minDate: Date | null = null;
                                        let maxDate: Date | null = null;
                                        filteredRewards.forEach(reward => {
                                            
                                            let dateObj: Date;
                                            if (reward.date.includes("-")) {
                                                const parts = reward.date.split("-");
                                                if (parts[2]?.length === 4) {
                                                    
                                                    dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                                } else {
                                                    
                                                    dateObj = new Date(reward.date);
                                                }
                                            } else {
                                                dateObj = new Date(reward.date);
                                            }
                                            if (isNaN(dateObj.getTime())) { // Check for invalid date
                                                console.warn(`Invalid date string for reward: ${reward.id}, date: ${reward.date}`);
                                                return; // Skip this reward if date is invalid
                                            }
                                            if (!minDate || dateObj < minDate) minDate = dateObj;
                                            if (!maxDate || dateObj > maxDate) maxDate = dateObj;
                                            const monthYear = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
                                            monthMap[monthYear] = (monthMap[monthYear] || 0) + parseFloat(reward.value);
                                        });
                                        
                                        
                                        const months: string[] = [];
                                        if (minDate && maxDate) {
                                            let current = new Date((minDate as any)?.getFullYear() ?? 0,(minDate as any)?.getMonth() ?? 0, 1);
                                            const end = new Date((maxDate as any).getFullYear(), (maxDate as any).getMonth(), 1);
                                            while (current <= end) {
                                                const monthYear = current.toLocaleString("default", { month: "short", year: "2-digit" });
                                                months.push(monthYear);
                                                current.setMonth(current.getMonth() + 1);
                                            }
                                        }
                                        
                                        
                                        if (months.length === 0) {
                                            const now = new Date();
                                            for (let i = 5; i >= 0; i--) {
                                                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                                                months.push(d.toLocaleString("default", { month: "short", year: "2-digit" }));
                                            }
                                        }
                                        
                                        
                                        const maxValue = Math.max(...months.map(m => monthMap[m] || 0), 1);
                                        return months.map((month, i) => (
                                            <div key={month + i} className="text-center">
                                                <div
                                                    className="w-4 bg-gray-600 rounded-t mx-auto"
                                                    style={{
                                                        height: `${((monthMap[month] || 0) / maxValue) * 60}px`, 
                                                        minHeight: "8px"
                                                    }}
                                                    title={`${monthMap[month] || 0} PHAROS`}
                                                ></div>
                                                <span className="text-xs text-gray-500 mt-1 block">{month}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        
                        <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800  p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <button className="p-2 rounded text-gray-400 hover:bg-gray-700 hover:text-dark dark:text-white">
                                    {/* Placeholder for Filter Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-6.586L4.293 6.707A1 1 0 014 6V4z" /></svg>
                                </button>
                                <div className="relative">
                                    {/* Placeholder for Search Icon */}
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-300 dark:bg-gray-700 text-dark dark:text-white placeholder-gray-500 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <button className="p-2 rounded text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-dark dark:text-white">
                                {/* Placeholder for View Toggle Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg> {/* Example Table Icon */}
                            </button>
                        </div>

                        {/* Rewards Table */}
                        <div className="overflow-x-auto bg-gray-50 dark:bg-gray-800  rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800 ">
                                    <tr>
                                        {/* Add sort icons/functionality later */}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contributions</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-50 dark:bg-gray-800  divide-y divide-gray-700">
                                    {loading && (
                                        <tr><td colSpan={7} className="text-center py-4 text-gray-500">Loading...</td></tr>
                                    )}
                                    {error && (
                                        <tr><td colSpan={7} className="text-center py-4 text-red-500">Error: {error}</td></tr>
                                    )}
                                    {!loading && !error && filteredRewards.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-10 text-gray-500">No items found.</td></tr>
                                    )}
                                    {!loading && !error && filteredRewards.map((reward) => (
                                        <tr key={reward.id} className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-gray-300">{reward.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-white">{reward.projectName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-white">{reward.Contributor_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-white">{reward.issue}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-gray-300">{reward.value} PHAROS</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                Complete
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
        </Suspense>
    );
}
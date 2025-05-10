'use client' // Corrected typo 'cliemt' to 'client'
import { useState, useEffect } from 'react'; // Added useState
import { useSession } from 'next-auth/react';
import Topbar from '@/assets/components/topbar';
import Sidebar from '@/assets/components/sidebar';
import { useSidebarContext } from '@/assets/components/SidebarContext';

// Removed unused useSearchParams for now
// Consider adding an icon library like react-icons if needed: npm install react-icons
// import { FiFilter, FiSearch } from 'react-icons/fi'; // Example icon import
// import { BsTable, BsGrid } from 'react-icons/bs'; // Example icon import

// Define an interface for reward transaction data (adjust fields as needed)
interface RewardTransaction {
    id: string;
    date: string; // Or Date object
    Contributor: string;
    issue: string;
    value: string; // Amount in PHAROS
    projectName: string;
}

export default function Rewards() {
    const { data: session } = useSession(); // Get session data
    const [rewards, setRewards] = useState<RewardTransaction[]>([]); // State for reward transactions
    const [loading, setLoading] = useState(false); // Example loading state
    const [error, setError] = useState<string | null>(null); // Example error state
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const { isShrunk } = useSidebarContext(); // Assuming you have a SidebarContext
    // Placeholder summary data - fetch this from your API
    const totalPaid = 0;

     useEffect(() => {
        // For testing: add a sample reward transaction
        setRewards([
            {
                id: "test-1",
                projectName: "ethapp",
                Contributor: "gurssagar",
                issue: "3",
                value: "0.002",
                date: "10-05-2025"
            }
        ]);
        // Comment out the fetch for now if you want to test local data only
        // const fetchRewards = async () => {
        //     setLoading(true);
        //     setError(null);
        //     try {
        //         const response = await fetch('/api/rewards');
        //         if (!response.ok) throw new Error('Failed to fetch rewards');
        //         const data = await response.json();
        //         setRewards(data.Rewards || []);
        //     } catch (err) {
        //         setError(err instanceof Error ? err.message : 'An unknown error occurred');
        //         setRewards([]);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchRewards();
     }, []);
     const filteredRewards = rewards.filter(reward =>
        (reward.projectName.toLowerCase().includes(searchTerm.toLowerCase())) && reward.Contributor===session?.user?.username
    );
     let totalRewarded= 0;
     for (let i=0;i<filteredRewards.length;i++){
        totalRewarded+=parseFloat(filteredRewards[i].value);
     }

    // Filtered rewards based on search term (simple example)
    

    return (
        <div className="flex h-screen text-gray-200">
            <Sidebar />
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto  mt-[60px]"> {/* Adjust margin based on actual Topbar height */}
                    <div className="container mx-auto px-6 py-8">
                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Rewarded Amount Card */}
                            <div className="rounded-lg shadow-md p-6 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white relative">
                                <h3 className="text-sm font-medium text-gray-100">Rewarded amount</h3>
                                <p className="text-3xl font-semibold mt-1">{totalRewarded} PHAROS</p>
                                <button className="absolute bottom-4 right-4 text-gray-200 hover:text-white">
                                    {/* Placeholder for arrow icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            {/* Paid Card */}
                            <div className="rounded-lg shadow-md p-6 bg-gray-800 relative">
                                <h3 className="text-sm font-medium text-gray-400">Paid</h3>
                                <p className="text-3xl font-semibold mt-1 text-white">{totalRewarded} PHAROS</p>
                                 <button className="absolute bottom-4 right-4 text-gray-400 hover:text-white">
                                    {/* Placeholder for arrow icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            {/* Rewards Charts Card */}
                            <div className="rounded-lg shadow-md p-6 bg-gray-800">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Rewards Charts</h3>
                                {/* Chart based on reward dates */}
                                <div className="flex justify-around items-end h-20">
                                    {(() => {
                                        // Group rewards by month-year and sum values
                                        const monthMap: { [key: string]: number } = {};
                                        let minDate: Date | null = null;
                                        let maxDate: Date | null = null;
                                        filteredRewards.forEach(reward => {
                                            // Parse date string (assumes format "DD-MM-YYYY" or "YYYY-MM-DD")
                                            let dateObj: Date;
                                            if (reward.date.includes("-")) {
                                                const parts = reward.date.split("-");
                                                if (parts[2]?.length === 4) {
                                                    // "DD-MM-YYYY"
                                                    dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                                } else {
                                                    // "YYYY-MM-DD"
                                                    dateObj = new Date(reward.date);
                                                }
                                            } else {
                                                dateObj = new Date(reward.date);
                                            }
                                            if (!minDate || dateObj < minDate) minDate = dateObj;
                                            if (!maxDate || dateObj > maxDate) maxDate = dateObj;
                                            const monthYear = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
                                            monthMap[monthYear] = (monthMap[monthYear] || 0) + parseFloat(reward.value);
                                        });
                                        
                                        // Generate all months between minDate and maxDate
                                        const months: string[] = [];
                                        if (minDate && maxDate) {
                                            let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                                            const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                                            while (current <= end) {
                                                const monthYear = current.toLocaleString("default", { month: "short", year: "2-digit" });
                                                months.push(monthYear);
                                                current.setMonth(current.getMonth() + 1);
                                            }
                                        }
                                        
                                        // If no rewards, show last 6 months as default
                                        if (months.length === 0) {
                                            const now = new Date();
                                            for (let i = 5; i >= 0; i--) {
                                                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                                                months.push(d.toLocaleString("default", { month: "short", year: "2-digit" }));
                                            }
                                        }
                                        
                                        // Find max value for scaling
                                        const maxValue = Math.max(...months.map(m => monthMap[m] || 0), 1);
                                        return months.map((month, i) => (
                                            <div key={month + i} className="text-center">
                                                <div
                                                    className="w-4 bg-gray-600 rounded-t mx-auto"
                                                    style={{
                                                        height: `${((monthMap[month] || 0) / maxValue) * 60}px`, // scale to max 60px
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

                        {/* Filter and Search Bar */}
                        <div className="flex items-center justify-between mb-4 bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <button className="p-2 rounded text-gray-400 hover:bg-gray-700 hover:text-white">
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
                                        className="bg-gray-700 text-white placeholder-gray-500 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <button className="p-2 rounded text-gray-400 hover:bg-gray-700 hover:text-white">
                                {/* Placeholder for View Toggle Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg> {/* Example Table Icon */}
                            </button>
                        </div>

                        {/* Rewards Table */}
                        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        {/* Add sort icons/functionality later */}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contributions</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
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
                                        <tr key={reward.id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{reward.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{reward.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{reward.projectName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{reward.Contributor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{reward.issue}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{reward.value} PHAROS</td>
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
    );
}
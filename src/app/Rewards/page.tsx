'use client' // Corrected typo 'cliemt' to 'client'
import { useState, useEffect } from 'react'; // Added useState
import { useSession } from 'next-auth/react';
import Topbar from '@/assets/components/topbar';
import Sidebar from '@/assets/components/sidebar';
// Removed unused useSearchParams for now
// Consider adding an icon library like react-icons if needed: npm install react-icons
// import { FiFilter, FiSearch } from 'react-icons/fi'; // Example icon import
// import { BsTable, BsGrid } from 'react-icons/bs'; // Example icon import

// Define an interface for reward transaction data (adjust fields as needed)
interface RewardTransaction {
    id: string | number;
    date: string; // Or Date object
    projectId: string;
    projectName: string;
    fromUser: string; // Or user object
    contributionsLink?: string; // Link to contributions
    amount: number;
    currency: string; // e.g., 'PHAROS'
    status: 'Pending' | 'Paid' | 'Processing'; // Example statuses
}

export default function Rewards() {
    const { data: session } = useSession(); // Get session data
    const [rewards, setRewards] = useState<RewardTransaction[]>([]); // State for reward transactions
    const [loading, setLoading] = useState(false); // Example loading state
    const [error, setError] = useState<string | null>(null); // Example error state
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    // Placeholder summary data - fetch this from your API
    const totalRewarded = 0;
    const totalPaid = 0;

    // useEffect(() => {
    //     // TODO: Fetch reward data from your API when the component mounts
    //     const fetchRewards = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             // const response = await fetch('/api/rewards'); // Your API endpoint
    //             // if (!response.ok) throw new Error('Failed to fetch rewards');
    //             // const data = await response.json();
    //             // setRewards(data.transactions || []);
    //             setRewards([]); // Set to empty array for now
    //         } catch (err) {
    //             setError(err instanceof Error ? err.message : 'An unknown error occurred');
    //             setRewards([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchRewards();
    // }, []);

    // Filtered rewards based on search term (simple example)
    const filteredRewards = rewards.filter(reward =>
        reward.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.fromUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.id.toString().includes(searchTerm)
    );

    return (
        <div className="flex h-screen text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-[192px]"> {/* Adjust margin based on actual Sidebar width */}
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
                                <p className="text-3xl font-semibold mt-1 text-white">{totalPaid} PHAROS</p>
                                 <button className="absolute bottom-4 right-4 text-gray-400 hover:text-white">
                                    {/* Placeholder for arrow icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            {/* Rewards Charts Card */}
                            <div className="rounded-lg shadow-md p-6 bg-gray-800">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Rewards Charts</h3>
                                {/* Placeholder for chart */}
                                <div className="flex justify-around items-end h-20">
                                    {['May', 'Jul', 'Sep', 'Nov', 'Jan', 'Mar', 'May'].map((month, i) => (
                                        <div key={month + i} className="text-center">
                                            <div className={`w-4 bg-gray-600 rounded-t ${[10, 30, 20, 50, 40, 60, 25][i]}% h-full`}></div> {/* Example heights */}
                                            <span className="text-xs text-gray-500 mt-1">{month}</span>
                                        </div>
                                    ))}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(reward.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{reward.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{reward.projectName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{reward.fromUser}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline">
                                                {/* Placeholder for link */}
                                                <a href={reward.contributionsLink || '#'} target="_blank" rel="noopener noreferrer">View</a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{reward.amount} {reward.currency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* Example status badge */}
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    reward.status === 'Paid' ? 'bg-green-900 text-green-300' :
                                                    reward.status === 'Pending' ? 'bg-yellow-900 text-yellow-300' :
                                                    'bg-gray-700 text-gray-300' // Processing or other
                                                }`}>
                                                    {reward.status}
                                                </span>
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
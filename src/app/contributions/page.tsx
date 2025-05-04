'use client'
import { useState, useEffect } from 'react';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar'
import { useSession } from 'next-auth/react';

// Define the interface for the applied issue data
interface AppliedIssue {
    projectName: string;
    Contributor_id: string;
    issue: string;
    image_url: string;
    name: string;
    description: string;
    id?: string | number; // Optional unique ID
}

export default function Contributions() {
    const session = useSession();
    console.log(session)
    // Use the interface with useState for type safety
    const [applied, changeApplied] = useState<AppliedIssue[]>([]); // Initialize with empty array

    useEffect(() => {
        const issues = async () => {
            try { // Add error handling
                const response = await fetch('/api/requestIssue', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Assuming data.assignments is an array of AppliedIssue
                changeApplied(data.assignments || []); // Ensure it's an array
                console.log(data.assignments);
            } catch (error) {
                console.error("Failed to fetch applied issues:", error);
                // Optionally, set an error state here to display to the user
            }
        }

        const assignedIssue=async()=>{
            try { // Add error handling
                const response = await fetch('/api/assignedIssue', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                }
                catch (error) {
                    console.error("Failed to fetch assigned issues:", error);
                    // Optionally, set an error state here to display to the user
                }
            }
        assignedIssue()
        issues()
    }, []) // Empty dependency array means this runs once on mount

    // Filter applications to show only those by the current user
    const userAppliedIssues = applied.filter(issue =>
        (session?.data?.user as any)?.username && issue.Contributor_id ===(session?.data?.user as any)?.username
        // Using === for strict comparison, ensure session.data.user.id is the correct comparable value (e.g., string username)
    );

    return (
        <>
            <div>
                <Sidebar />
                <div className='mx-[16em]'>
                    <Topbar />
                    <div className={`flex w-[calc(100vw_-_17em)] my-[70px] px-4 gap-4`}>
                        {/* Applied Issues Column - Filtered */}
                        <div className='min-h-[100vh] w-1/3 py-4 px-3 rounded border border-gray-800 overflow-y-auto bg-gray-900 text-gray-200'> {/* Adjusted background/text */}
                            <h3 className='font-bold text-lg mb-4 px-2'>My Applied Issues</h3>
                            {/* Check if the filtered array is not empty before mapping */}
                            {userAppliedIssues.length > 0 ? (
                                userAppliedIssues.map((issue, index) => { // Map over the filtered array
                                    const key = issue.id || `${issue.Contributor_id}-${issue.issue}-${index}`;
                                    // Clean up image URL (remove backticks and trim whitespace)
                                    const imageUrl = issue.image_url.trim().replace(/`/g, '');
                                    return (
                                        // Main card container
                                        <div key={key} className='border border-gray-700 bg-gray-800 rounded p-3 mb-3 flex flex-col gap-2'>
                                            {/* Top row: Project Name and Issue Number */}
                                            <div className="flex justify-between items-center">
                                                <h3 className='font-semibold text-md'>{issue.projectName}</h3>
                                                {/* Placeholder for Issue Number Circle - styling needed */}
                                                <span className="bg-green-700 text-green-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                    #{issue.issue}
                                                </span>
                                            </div>

                                            {/* Placeholder for Time Ago */}
                                            {/* <p className="text-xs text-gray-400"><ClockIcon className="h-3 w-3 inline mr-1"/> 26 days ago</p> */}

                                            {/* Applicant Info */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <img src={imageUrl} alt={issue.name} className="w-6 h-6 rounded-full" />
                                                <span className="text-sm">{issue.name}</span>
                                            </div>

                                            {/* Placeholder for Tags */}
                                            {/* <div className="mt-1">
                                                <span className="bg-gray-600 text-gray-200 text-xs font-medium px-2 py-0.5 rounded">
                                                    <TagIcon className="h-3 w-3 inline mr-1" /> bug
                                                </span>
                                            </div> */}

                                            {/* Bottom row: See Application Button and GitHub Link */}
                                            <div className="flex justify-between items-center mt-2">
                                                {/* Placeholder Button */}
                                                
                                                {/* Placeholder GitHub Icon Link */}
                                                <a href="#" title="View on GitHub" className="text-gray-400 hover:text-white">
                                                    {/* You would use an actual GitHub icon component/SVG here */}
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                                                    </svg>
                                                </a>
                                            </div>
                                             {/* Displaying the original message for context */}
                                             <p className="text-xs text-gray-400 mt-1">Message: {issue.description}</p>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-gray-400 px-2">You have not applied for any issues yet.</p> // Updated message for clarity
                            )}
                        </div>

                        {/* Assigned Issue Column */}
                        <div className='min-h-[100vh] py-4 px-3 w-1/3 rounded border border-gray-800'>
                            <h3 className='font-bold'>Assigned Issue</h3>
                            {/* Content for Assigned Issues */}
                        </div>

                        {/* Pending Review Column */}
                        <div className='min-h-[100vh] py-4 px-3 w-1/3 rounded border border-gray-800'>
                            <h3 className='font-bold'>Pending Review</h3>
                            {/* Content for Pending Review */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
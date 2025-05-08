'use client'
import { useState, useEffect } from 'react';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar'
import { useSession } from 'next-auth/react';
import { useSidebarContext } from '@/assets/components/SidebarContext';
// Define the interface for the issue data (can be used for both applied and assigned)
interface IssueData {
    projectName: string;
    Contributor_id: string;
    issue: string; // Assuming issue number/ID is a string
    image_url: string;
    name: string;
    description: string;
    id?: string | number; // Optional unique ID from the database
}

export default function Contributions() {
    const session = useSession();
    const { isShrunk } = useSidebarContext();
    const currentUser = (session?.data?.user as any)?.username; // Get current user's identifier

    // State for applied issues (from requestIssue)
    const [applied, setApplied] = useState<IssueData[]>([]);
    // State for assigned issues (from assignedIssue)
    const [assigned, setAssigned] = useState<IssueData[]>([]);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await fetch('/api/requestIssue', { /* ... headers ... */ });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setApplied(data.assignments || []); // Update applied issues state
            } catch (error) {
                console.error("Failed to fetch applied issues:", error);
                setApplied([]); // Set to empty array on error
            }
        }

        const fetchAssignedIssues = async () => {
            try {
                // Construct the URL to fetch only issues assigned to the current user
                // Adjust the query parameter if your API uses a different field name
                const url = currentUser ? `/api/assignedIssue?Contributor_id=${encodeURIComponent(currentUser)}` : '/api/assignedIssue';
                const response = await fetch(url, { /* ... headers ... */ });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                // Ensure the response structure is correct, expecting data.assignedIssues
                setAssigned(data.assignedIssues || []); // Update assigned issues state
            } catch (error) {
                console.error("Failed to fetch assigned issues:", error);
                setAssigned([]); // Set to empty array on error
            }
        }

        fetchIssues();
        fetchAssignedIssues();

    }, [currentUser]); // Re-run effect if the user changes

    // Create a Set of keys for assigned issues for efficient lookup
    // Using projectName and issue number as a composite key
    const assignedIssueKeys = new Set(
        assigned.map(a => `${a.projectName}-${a.issue}`)
    );

    // Filter applied list: show only those applied by the user AND NOT present in the assigned list
    const userAppliedOnlyIssues = applied.filter(issue =>
        currentUser &&
        issue.Contributor_id === currentUser &&
        !assignedIssueKeys.has(`${issue.projectName}-${issue.issue}`) // Exclude if assigned
    );

    // The 'assigned' state already contains issues assigned to the user (fetched via API filter or filtered here if API doesn't support it)
    // If your API doesn't filter by Contributor_id, you'd filter 'assigned' here:
    // const userAssignedIssues = assigned.filter(issue => currentUser && issue.Contributor_id === currentUser);
    // Since we assume the API filters or the fetchAssignedIssues function handles it, we can use 'assigned' directly.
    const userAssignedIssues = assigned; // Use the state directly if API filtered

    // --- Helper function to render an issue card ---
    const renderIssueCard = (issue: IssueData, index: number) => {
        const key = issue.id || `${issue.Contributor_id}-${issue.issue}-${index}`;
        const imageUrl = issue.image_url?.trim().replace(/`/g, '') || ''; // Handle potentially missing/empty URL

        return (
            <div key={key} className='border border-gray-700 bg-[#181a1f] rounded p-3 mb-3 flex flex-col gap-2'>
                {/* Top row: Project Name and Issue Number */}
                <div className="flex justify-between items-center">
                    <h3 className='font-semibold text-md'>{issue.projectName}</h3>
                    <span className="bg-blue-700 text-blue-100 text-xs font-semibold px-2 py-0.5 rounded-full"> {/* Changed color for assigned */}
                        #{issue.issue}
                    </span>
                </div>
                {/* Applicant/Assignee Info */}
                <div className="flex items-center gap-2 mt-1">
                    {imageUrl && <img src={imageUrl} alt={issue.name} className="w-6 h-6 rounded-full" />}
                    <span className="text-sm">{issue.name}</span>
                </div>
                {/* GitHub Link */}
                <div className="flex justify-end items-center mt-2"> {/* Adjusted alignment */}
                    <a href={`https://github.com/${issue.projectName}/issues/${issue.issue}`} target="_blank" rel="noopener noreferrer" title="View on GitHub" className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                    </a>
                </div>
                 {/* Displaying the original message/description */}
                 {issue.description && <p className="text-xs text-gray-400 mt-1">Description: {issue.description}</p>}
            </div>
        );
    };


    return (
        <>
            <div>
                <Sidebar />
                <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                    <Topbar />
                    <div className={`flex w-[calc(100vw_-_17em)] my-[70px] px-4 gap-4`}>
                        {/* Applied Issues Column - Filtered */}
                        <div className='min-h-[100vh] w-1/3 py-4 px-3 rounded border border-gray-800 overflow-y-auto  text-gray-200'>
                            <h3 className='font-bold text-lg mb-4 px-2'>My Applied Issues</h3>
                            {userAppliedOnlyIssues.length > 0 ? (
                                userAppliedOnlyIssues.map(renderIssueCard) // Use the helper function
                            ) : (
                                <p className="text-gray-400 px-2">You have not applied for any issues yet, or all your applications are assigned.</p>
                            )}
                        </div>

                        {/* Assigned Issue Column */}
                        <div className='min-h-[100vh] py-4 px-3 w-1/3 rounded border border-gray-800 overflow-y-auto  text-gray-200'> {/* Added styles */}
                            <h3 className='font-bold text-lg mb-4 px-2'>My Assigned Issues</h3> {/* Adjusted text */}
                            {userAssignedIssues.length > 0 ? (
                                userAssignedIssues.map(renderIssueCard) // Use the helper function
                            ) : (
                                <p className="text-gray-400 px-2">You have not been assigned any issues yet.</p>
                            )}
                        </div>

                        {/* Pending Review Column */}
                        <div className='min-h-[100vh] py-4 px-3 w-1/3 rounded border border-gray-800 overflow-y-auto text-gray-200'> {/* Added styles */}
                            <h3 className='font-bold text-lg mb-4 px-2'>Pending Review</h3> {/* Adjusted text */}
                            {/* Content for Pending Review - Add logic similar to above */}
                             <p className="text-gray-400 px-2">No issues pending review.</p> {/* Placeholder */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
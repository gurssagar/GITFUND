'use client'
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import { useSearchParams } from 'next/navigation';
import { AnyARecord } from 'dns';
import { Suspense } from 'react';
import { useSidebarContext } from '@/assets/components/SidebarContext';

export default function AssignIssues() {
    const { data: session } = useSession();
    const { isShrunk } = useSidebarContext();
    const [assignments, setAssignments] = useState([]);
    const searchParams = useSearchParams();
    const issueNumber = searchParams?.get('issueNumber');
    const repo = searchParams?.get('repo');
    console.log(repo,"testa")
    console.log(issueNumber)
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch(`/api/requestIssueBasedonProj?${searchParams}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log(`/api/requestIssueBasedonProj/${searchParams}`,'tedsjnadjha')
                console.log('Assignments:', data);
                setAssignments(data.result || []);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            }
        };

        fetchAssignments();
    }, []);
    const [isAdding, setIsAdding] = useState<string | null>(null); // Store the ID of the item being added

    // Update function to accept the full assignment object
    const addContributor = async (assignment: any) => {
        // Use a unique identifier for loading state, e.g., contributor + issue
        const loadingKey = `${assignment.Contributor_id}-${assignment.issue}`;
        setIsAdding(loadingKey);
        try {
            const octokit = new Octokit({
                auth: (session as any)?.accessToken
            });

            // Assign on GitHub first
            const githubResponse = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
                owner: (session?.user as any)?.username, // Ensure this is the correct owner
                repo: assignment.projectName, // Use projectName directly if it's owner/repo format
                issue_number: parseInt(assignment.issue),
                assignees: [assignment.Contributor_id]
            });

            // Check if GitHub assignment was successful (optional, based on Octokit response)
            if (githubResponse.status === 201) { // 201 Created is typical for successful assignment
                // Then, call your internal API
                const internalApiResponse = await fetch('/api/assignedIssue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectName: assignment.projectName,
                        Contributor_id: assignment.Contributor_id,
                        issue: assignment.issue,
                        // Include other fields from the assignment object as needed by your API
                        image_url: assignment.image_url,
                        name: assignment.name,
                        description: assignment.description
                    })
                });
                const internalApiPayload = {
                    projectName: assignment.projectName,
                    Contributor_id: assignment.Contributor_id,
                    issue: assignment.issue,
                    image_url: assignment.image_url,
                    name: assignment.name,
                    description: assignment.description
                };
                // Log the object being sent to the internal API
                console.log("Payload for internal API:", internalApiPayload);

                if (!internalApiResponse.ok) {
                    // Handle internal API error
                    const errorData = await internalApiResponse.json();
                    throw new Error(`Failed to update internal database: ${errorData.message || internalApiResponse.statusText}`);
                }

                alert('Contributor added successfully on GitHub and database updated!');
                // Optionally: Refresh assignments list or update UI state
                // fetchAssignments(); // Example: Re-fetch assignments

            } else {
                // Handle non-successful GitHub response status
                 throw new Error(`GitHub API responded with status: ${githubResponse.status}`);
            }

        } catch (error: any) {
            console.error('Error adding contributor:', error);
            alert(`Failed to add contributor: ${error.message}`);
        } finally {
            setIsAdding(null); // Reset loading state
        }
    };

    return (
        <>
        <Suspense fallback={<div>Loading...</div>}>
        <div className='flex'>
            <Sidebar />
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar />
                <div className='mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-10'> {/* Responsive grid */}
                    {/* Ensure assignments state uses the Assignment interface */}
                    {assignments.map((assignment: any) => {
                         // Define unique key for loading state check
                        const loadingKey = `${assignment.Contributor_id}-${assignment.issue}`;
                        return (
                            <div key={`${assignment.projectName}-${assignment.issue}-${assignment.Contributor_id}`} className="border border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div> {/* Content wrapper */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <img
                                            className="w-10 h-10 rounded-full object-cover border-2 dark:border-gray-600 border-gray-100" // Added border
                                            src={assignment.image_url?.trim().replace(/`/g, '')} // Clean URL
                                            alt={assignment.Contributor_id}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-black dark:text-gray-100">{assignment.projectName}</h3> {/* Adjusted text color */}
                                            <p className="text-sm text-gray-800 dark:text-gray-400">@{assignment.Contributor_id}</p> {/* Adjusted text color */}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium  text-black dark:text-gray-100 mr-2">Issue:</span> {/* Adjusted text color */}
                                            <span className="text-sm  text-gray-800 dark:text-gray-400">#{assignment.issue}</span> {/* Adjusted text color */}
                                        </div>
                                        <p className="text-sm  text-gray-800 dark:text-gray-400 line-clamp-3"> {/* Adjusted text color & line-clamp */}
                                            {assignment.description || 'No description provided'}
                                        </p>
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => addContributor(assignment)} // Pass the whole assignment object
                                    disabled={isAdding === loadingKey} // Disable only the specific button being processed
                                    className="mt-auto w-full dark:text-black dark:bg-white bg-black text-white dark:hover:bg-gray-200 hover:bg-gray-900 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" // Added full width and disabled style
                                >
                                    {isAdding === loadingKey ? 'Adding...' : 'Add Contributor'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
        </Suspense>
    </>
    )
}
interface CustomSession {
  user?: {
    username: string;
    // Add other user properties as needed
  };
  accessToken?: string;
}

interface Assignment {
  Contributor_id: string;
  projectName: string;
  issue: string;
  image_url?: string;
  name?: string;
  description?: string;
}

interface ApiResponse {
  result?: Assignment[];
  error?: string;
}

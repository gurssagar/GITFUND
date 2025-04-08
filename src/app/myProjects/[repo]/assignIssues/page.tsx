'use client'
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import { useSearchParams } from 'next/navigation';

export default function AssignIssues() {
    const { data: session } = useSession();
    const [assignments, setAssignments] = useState([]);
    const searchParams = useSearchParams();
    const issueNumber = searchParams.get('issueNumber');
    const repo = searchParams.get('repo');
    console.log(repo,"testa")
    console.log(issueNumber)
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch('/api/requestIssue');
                const data = await response.json();
                console.log('Assignments:', data);
                setAssignments(data.assignments || []);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            }
        };

        fetchAssignments();
    }, []);
    const [isAdding, setIsAdding] = useState(false);

    





    const addContributor = async (repo: string, issueNumber: string, contributor: string) => {
        setIsAdding(true);
        try {
            const octokit = new Octokit({
                auth: (session as any)?.accessToken
            });

            const [owner, repoName] = repo.split('/');
            
            await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees',{
                owner:(session?.user as any)?.username,
                repo: repo,
                issue_number: parseInt(issueNumber),
                assignees: [contributor]
            });

            alert('Contributor added successfully!');
        } catch (error) {
            console.error('Error adding contributor:', error);
            alert('Failed to add contributor');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
        <div className='flex'>
            <Sidebar/>
            <div className='w-[85%] mt-24'>
                <Topbar nav={Issue}/>
                <div className='grid grid-cols-3 gap-6 mx-10'>
                    {assignments.map((assignment: any) => (
                       // ... existing code ...
                        <div key={assignment.issue} className="border border-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-3">
                                <img 
                                    className="w-10 h-10 rounded-full object-cover" 
                                    src={assignment.image_url} 
                                    alt={assignment.Contributor_id}
                                />
                                <div>
                                    <h3 className="font-bold text-gray-400">{assignment.projectName}</h3>
                                    <p className="text-sm text-gray-500">@{assignment.Contributor_id}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-400 mr-2">Issue:</span>
                                    <span className="text-sm text-gray-400">#{assignment.issue}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {assignment.description || 'No description provided'}
                                </p>
                            </div>

                            <button 
                                onClick={() => addContributor(assignment.projectName, assignment.issue, assignment.Contributor_id)}
                                disabled={isAdding}
                                className="text-black bg-white hover:bg-gray-200  py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isAdding ? 'Adding...' : 'Add Contributor'}
                            </button>
                        </div>
// ... existing code ...
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}
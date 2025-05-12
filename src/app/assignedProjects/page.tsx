'use client'
import { useEffect, useState } from 'react';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import { useSession } from 'next-auth/react';
import Image from 'next/image'; // Import Image for project icons/avatars
import { useSidebarContext } from '@/assets/components/SidebarContext';
import { Suspense } from 'react';
// Define interfaces for the data structures - ADD fields based on image
interface Project {
    id: number | string;
    project_name: string;
    project_repository: string;
    project_description: string;
    project_icon_url?: string; // Optional: URL for the project icon
    project_leads?: { name: string; avatar_url?: string }[]; // Array of leads
    contributors_count?: number; // Number of contributors
    available_issues_count?: number | string; // Count or '-'
    languages?: string[]; // Array of languages
    // Add other relevant project fields based on image columns
}

interface AssignedIssue {
    id: number | string;
    projectName: string;
    Contributor_id: string;
    issue: string;
    image_url: string; // Likely contributor avatar
    name: string; // Likely contributor name
    description: string;
}

// Placeholder data - replace with actual user-specific data fetching if needed
interface UserContributionData {
    contributions_count?: number;
    rewards_usd?: number;
}

export default function AssignedProjects() {
    const session = useSession();
    const currentUser = (session?.data?.user as any)?.username; // Example: Get current user
    const { isShrunk } = useSidebarContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([]);
    // Placeholder for user-specific data - fetch this separately if needed
    const [userContributionData, setUserContributionData] = useState<UserContributionData>({
        contributions_count: 9, // Example data based on image
        rewards_usd: 0 // Example data based on image
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch both datasets concurrently
                const [projectsResponse, assignedIssuesResponse] = await Promise.all([
                    fetch('/api/add-issues', { // Assuming this fetches PROJECTS
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }),
                    fetch('/api/assignedIssue', { // Fetch ALL assigned issues for filtering/display
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    })
                ]);

                if (!projectsResponse.ok) {
                    throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
                }
                if (!assignedIssuesResponse.ok) {
                    throw new Error(`Failed to fetch assigned issues: ${assignedIssuesResponse.statusText}`);
                }

                const projectsData = await projectsResponse.json();
                const assignedIssuesData = await assignedIssuesResponse.json();

                // Assuming the API returns { projects: [...] } for /api/add-issues
                // Add dummy data for missing fields for demonstration
                const enrichedProjects = (projectsData.projects || []).map((p: any) => ({
                    ...p,
                    project_icon_url: '/gitfund-white.webp', // Placeholder icon
                    project_leads: [{ name: 'gurssagar', avatar_url: p.image_url || '/default-avatar.png' }], // Placeholder lead
                    contributors_count: 3, // Placeholder count
                    available_issues_count: '-', // Placeholder
                    languages: ['TypeScript'], // Placeholder language
                }));
                setProjects(enrichedProjects);

                // Assuming the API returns { assignedIssues: [...] } for /api/assignedIssue
                setAssignedIssues(assignedIssuesData.assignedIssues || []);

                // TODO: Fetch user-specific contribution/reward data if needed
                // setUserContributionData(...)

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setProjects([]); // Clear data on error
                setAssignedIssues([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Filtering Logic ---
    // Filter assigned issues for the current user
    const userAssignedIssues = assignedIssues.filter(issue => issue.Contributor_id === currentUser);
    // Get a unique list of project names from the issues assigned to the CURRENT USER
    const assignedProjectNamesForUser = new Set(userAssignedIssues.map(issue => issue.projectName));

    // Filter the projects list to show only those where the current user has assigned issues
    const filteredProjects = projects.filter(project =>
        assignedProjectNamesForUser.has(project.project_repository)
    );
    console.log(filteredProjects)

    return (
        <>
        <Suspense fallback={<div>Loading...</div>}>
           
            <div>
                <Sidebar />
                <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar />
                    <div className='mt-[70px] px-4'>
                        <div className="text-2xl font-bold mb-6"> {/* Increased margin-bottom */}
                            My Assigned Projects
                        </div>
                        <div>
                            {loading && <p className="text-gray-400">Loading projects...</p>}
                            {error && <p className="text-red-500">Error: {error}</p>}
                            {!loading && !error && (
                                <div className='overflow-x-auto'> {/* Added for horizontal scrolling on small screens */}
                                    {filteredProjects.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-100 text-black  dark:bg-black">
                                                <tr>
                                                    {/* Define Table Headers based on image */}
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold  text-black dark:text-gray-300 sm:pl-6">Project name</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">Project leads</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">Contributors</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">Available issues</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">My contributions</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">My rewards</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">Languages</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-gray-300">Repositories</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-950 ">
                                                {filteredProjects.map((project) => (
                                                    <tr key={project.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                                        {/* Project Name */}
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black dark:text-white sm:pl-6 flex items-center gap-2">
                                                            {project.project_icon_url && <Image src={project.project_icon_url} alt="" width={24} height={24} className="rounded" />}
                                                            {project.project_repository}
                                                        </td>
                                                        {/* Project Leads */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-gray-300">
                                                            <div className='flex items-center gap-1'>
                                                                <span>{project.project_leads?.[0]?.name || '-'}</span>
                                                            </div>
                                                        </td>
                                                        {/* Contributors */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-gray-300">
                                                            <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-xs font-medium text-gray-200'>
                                                                {project.contributors_count ?? '-'}
                                                            </span>
                                                        </td>
                                                        {/* Available Issues */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-gray-300">{project.available_issues_count ?? '-'}</td>
                                                        {/* My Contributions (User Specific) */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-gray-300">
                                                            <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-xs font-medium text-gray-200'>
                                                                {userContributionData.contributions_count ?? '-'}
                                                            </span>
                                                        </td>
                                                        {/* My Rewards (User Specific) */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm ">
                                                            <span className='inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-600'>
                                                                {userContributionData.rewards_usd ?? 0} USD
                                                            </span>
                                                        </td>
                                                        {/* Languages */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm ">
                                                            {project.languages?.map(lang => (
                                                                <span key={lang} className='inline-flex items-center rounded-md bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-700 mr-1'>
                                                                    {/* Add language icon if available */} {lang}
                                                                </span>
                                                            ))}
                                                        </td>
                                                        {/* Repositories */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                            <a href={`https://github.com/${project.project_repository}`} target="_blank" rel="noopener noreferrer" className='inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-600'>
                                                                {/* Add repo icon */} {project.project_repository}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">You are not assigned to any issues in projects yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </Suspense>
        </>
    );
}
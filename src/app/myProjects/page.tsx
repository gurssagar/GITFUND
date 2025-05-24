'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';
import { useSidebarContext } from '@/assets/components/SidebarContext';
import Topbar from '@/assets/components/topbar';
import Sidebar from '@/assets/components/sidebar';
import Link from 'next/link';
interface Contributor {
  id: string;
  name: string;
  avatar_url?: string;
  contributions?: number;
}

interface Language {
  name: string;
  percentage: number;
}

interface Project {
  projectName: string;
  projectOwner: string;
  project_repository: string;
  project_issues?: string;
  image_url?: string;
  shortdes?: string;
  stars?: number;
  forks?: number;
  contributors?: Contributor[];
  languages?: Language[];
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  projects: Project[];
  error?: {
    message: string;
    status?: number;
  };
}

interface UserSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  };
  expires: string;
}

export default function MyProject() {
    const { data: session, status } = useSession() as { data: UserSession | null; status: string };
    const { isShrunk } = useSidebarContext();
    const [repoData, setRepoData] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') {
            setIsLoading(true); // Keep loading if session is still loading
            return;
        }
        if (!session?.user) {
            setIsLoading(false); // Not loading if no session
            setRepoData([]); // Clear data if no user
            return;
        }

        const fetchData = async () => {
            setIsLoading(true); // Start loading before fetch
            try {
                const response = await fetch(`/api/manageProjects?projectOwner=${session?.user?.username}`, { // Assuming this API returns all projects
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API Response:', data);
                
                // Ensure data.projects exists and is an array
                if (data && Array.isArray(data.project)) {
                    const userProjects = data.project.filter(
                        (projects: Project) => projects.projectOwner === (session?.user as any)?.username
                    );
                    setRepoData(userProjects);
                } else {
                    console.error('Fetched data is not in the expected format:', data);
                    setRepoData([]);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setRepoData([]); // Set to empty array on error
            } finally {
                setIsLoading(false); // Stop loading after fetch (success or error)
            }
        };
    
        fetchData();
    }, [session, status]); // Add status to dependency array

    return (
        <>
        <Suspense fallback={<div>Loading...</div>}>
            
        <div className='flex min-h-screen '>
            <Sidebar/>
            <div className={`flex-grow transition-all duration-300 ease-in-out ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar/>
                <main className='pt-24 px-6 md:px-10 pb-10'>
                    <div className='flex justify-between'>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white ">Projects</h1>
                        <p className='mb-8  text-[14px] mt-2 text-custom-dark-gray dark:text-custom-gray'>Manage your GitHub projects and rewards.</p>
                    </div>
                    <div>
                        <Link href="/create-project">
                        <button className="bg-black dark:bg-white dark:text-black text-white rounded-lg px-4 py-2">
                            + Add Project
                        </button>
                        </Link>
                    </div>

                    </div>
                    
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Skeleton Loaders */}
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-lg animate-pulse">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md mr-4"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                                    <div className="flex gap-4">
                                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/2"></div>
                                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && repoData.length === 0 && (
                        <div className="text-center py-10">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                You haven't created or been assigned to any projects yet.
                            </p>
                            {/* Optional: Add a button to create a new project if applicable */}
                            {/* <div className="mt-6">
                                <Link href="/create-project">
                                    <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Create new project
                                    </a>
                                </Link>
                            </div> */}
                        </div>
                    )}

                    {!isLoading && repoData.length > 0 && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {repoData.map((repo:Project) => {
                                // Skip rendering if essential data like projectName is missing
                                if (!repo.projectName) return null; 
                                
                                // Provide default values for stats if they are undefined
                                const stars = repo.stars ?? 0;
                                const forks = repo.forks ?? 0;
                                const contributorsCount = Array.isArray(repo.contributors) ? repo.contributors.length : 0;

                                return (
                                    <Link href={`/myProjects/${repo.project_repository}`}>
                                    <div key={repo.projectName} className="border-white border-1 dark:border-[#171717] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">                            
                                        <div className="p-5 flex-grow">
                                            <div className="flex items-start mb-4">
                                                {repo.image_url ? (
                                                    <Image src={repo.image_url} className="rounded-md object-cover" width={56} height={56} alt={`${repo.projectName} logo`} />
                                                ) : (
                                                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                    </div>
                                                )}
                                                <div className="ml-4 flex-1">
                                                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate' title={repo.projectName}>
                                                        {repo.projectName}
                                                    </h3>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525-.2t-.575-.15z"/></svg>
                                                            <span>{stars}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5a3 3 0 1 0-4 2.816V11H6V7.816a3 3 0 1 0-2 0V11a2 2 0 0 0 2 2h5v4.184a3 3 0 1 0 2 0V13h5a2 2 0 0 0 2-2V7.816A2.99 2.99 0 0 0 22 5"/></svg>                        
                                                            <span>{forks}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0"/></svg>                       
                                                            <span>{contributorsCount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {repo.shortdes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300  line-clamp-2" title={repo.shortdes}>
                                                    {repo.shortdes}
                                                </p>
                                            )}
                                        </div>
                                        <div className='px-4 pb-4'>
                                        {
                                            repo?.languages &&
                                            Object.keys(repo.languages).map((lang) => (
                                                <span key={lang} className="mr-2 px-3 py-2 pb-1 bg-custom-gray text-white dark:text-white dark:bg-custom-dark-gray rounded-full text-xs">
                                                    {lang}
                                                </span>
                                            ))
                                        }
                                        </div>
                                    </div>
                                    </Link>
                                );
                            })}
                        </div>
                        
                    )}
                </main>
            </div>
        </div>
        </Suspense>
        </>
    )
}
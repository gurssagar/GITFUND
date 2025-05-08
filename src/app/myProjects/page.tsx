'use client'
import {useState,useEffect} from'react'
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import {useSidebarContext} from '@/assets/components/SidebarContext'
export default function MyProject() {  // Changed from myProject to MyProject
    const session = useSession();
    console.log(session.data)
    const {isShrunk}=useSidebarContext()
    const [image,updateImage]=useState('')
    const [visible,setVisible]=useState(null)
    const [repoData,setRepoData]=useState<any>([])
    const [projImage,setProjImage]=useState<any>(null)
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(false);
                const response = await fetch('/api/add-issues', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                
                const data = await response.json();
                
                // Filter projects to only show those owned by current user
                const userProjects = data.projects.filter(
                    (project: any) => project.projectOwner === (session?.data?.user as any)?.username
                );
                
                setRepoData(userProjects);
                setIsLoading(true);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [session]);
    console.log(repoData)
    return (
        <>
        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar/>
                <div className='pt-20 grid grid-cols-3 gap-6 mx-10'>
                    {repoData.map((repo:any) => {
                        if (!repo.image_url?.trim()) return null;
                        
                        return (
                            <div key={repo.projectName} className="hover:scale-[1.02] transition-transform duration-200">
                                    <div className="border-1 rounded-xl border-gray-400 dark:border-gray-800">                            
                                     <div className="p-4 rounded-xl ">
            <div className="flex">
                <div className="mr-4">
                    <img src={repo.image_url} className="rounded" width={48} height={48} alt="avatar" />
                </div>
                <div>
                    <h3>
                    {repo.projectName}
                    </h3>
                    <div className="flex">
                        <div className="flex text-gray-400 px-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/></svg>
                        <p className="text-[15px]">{42}</p>
                        </div>
                        <div className="flex px-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto"  width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5a3 3 0 1 0-4 2.816V11H6V7.816a3 3 0 1 0-2 0V11a2 2 0 0 0 2 2h5v4.184a3 3 0 1 0 2 0V13h5a2 2 0 0 0 2-2V7.816A2.99 2.99 0 0 0 22 5"/></svg>                        
                        <p className="text-[15px]">{128}</p>
                        </div>
                        <div className="flex px-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0"/></svg>                       
                        <p className="text-[15px]">{8}</p>
                        </div>
                    </div>
                </div>
                
            </div>
            <div className="pt-5">
                    <div>
                        <h3 className="text-[13px] text-gray-400">
                            {repo.shortdes}
                        </h3>
                    </div>
                </div>
                <div>

            </div>
                                    </div>
                                    <div className='flex gap-4 px-4 pb-4'>
                                    <Link href={{
                                    pathname: `/myProjects/${repo.project_repository}/assignIssues`,
                                    query: {
                                        owner:repo.projectOwner,
                                        repo: repo.project_repository,
                                        issueNumber: repo.issue_number || '1' // Default to 1 if not available
                                    }
                                }}>
                                    <button className='hover:scale-1.05 bg-white text-black px-3 py-2 rounded-xl'>Issues</button>
                                </Link>
                                <Link href={{
                                    pathname: `/myProjects/${repo.project_repository}/Contributions`,
                                    query: {
                                        owner:repo.projectOwner,
                                        repo: repo.project_repository,
                                        issueNumber: repo.issue_number || '1' // Default to 1 if not available
                                    }
                                }}>
                                    <button className='hover:scale-1.05 bg-white text-black px-3 py-2 rounded-xl'>Contributions</button>
                                </Link>
                                </div>  


                                    </div>
                                
                            </div>
                        );
                    })}
                </div>
                
            </div>
        </div>
        </>
    )
}
'use client'
import {useState,useEffect} from'react'
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
export default function MyProject() {  // Changed from myProject to MyProject
    const session = useSession();
    console.log(session.data)
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
            <div className='w-[85%] mt-24'>
                <Topbar nav={Issue}/>
                <div className='grid grid-cols-3 gap-6 mx-10'>
                    {repoData.map((repo:any) => {
                        if (!repo.image_url?.trim()) return null;
                        
                        return (
                            <div key={repo.projectName} className="hover:scale-[1.02] transition-transform duration-200">
                                <Link href={{
                                    pathname: `/myProjects/${repo.project_repository}/assignIssues`,
                                    query: {
                                        owner:repo.projectOwner,
                                        repo: repo.project_repository,
                                        issueNumber: repo.issue_number || '1' // Default to 1 if not available
                                    }
                                }}>
                                    <Issue 
                                        image={repo.image_url || 'back_2.jpg'}
                                        Project={repo.projectName}
                                        Fork={42}
                                        Stars={128}
                                        Contributors={8}
                                        shortDescription={repo.shortdes}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>
                
            </div>
        </div>
        </>
    )
}
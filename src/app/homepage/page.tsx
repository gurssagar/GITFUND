'use client'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSidebarContext } from '@/assets/components/SidebarContext';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    useMatches,
    NO_GROUP
  } from "kbar";
interface Project {
  projectName: string;
  shortdes: string;
  image_url?: string;
  forks?: number;
  stars?: number;
  contributors?: {
    collabs?: Record<string, unknown>;
  };
  languages?: string[];
  project_repository: string;
}

interface ProjectsResponse {
  projects: Project[];
}

export default function Home() {
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredRepos, setFilteredRepos] = useState<Project[]>([]);
    const { isShrunk } = useSidebarContext();
    
    const [image, updateImage] = useState<string>('');
    const [repoData, setRepoData] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const router = useRouter();
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(prevState => !prevState);
            } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredRepos(repoData);
        } else {
            const filtered = repoData.filter((repo: any) => 
                repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRepos(filtered);
        }
    }, [searchTerm, repoData]);
    useEffect(()=>{
        const fetchData=async()=>{
           await fetch('/api/add-issues',
            {
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                },
            }
           ).then((res)=>res.json())
           .then((data)=>{
                setRepoData(data.projects)
                setIsLoading(true);
           })
           
        }
        fetchData();
        if(repoData.length>0){
            
            const getImage=async()=>
                {
                    await fetch(`/api/s3?fileName={}`,{
                        
                    }
                )
                }
        }
    },[])

    useEffect(()=>{
        if(session?.data?.user?.image){
            updateImage(session?.data?.user?.image)
        }
    },[session?.data?.user?.image])
    console.log(repoData)
    return(
        <>
        
        
      
        <Suspense>
        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar/>
                
                <div className='flex pt-20'>
                    <div className='w-1/2 px-4' >
                    <div className='pt-3  text-center dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-3xl font-bold'>
                        Start Contributing
                        </div>
                        <div className='text-center dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-3xl font-bold'>
                            Begin Earning
                        </div>
                        <h4 className="text-center pt-4 dark:text-gray-400 text-[15px]">
                        Get recommendations based on your profile and past contributions.
                        </h4>
                        <h4 className="text-center pt-2 dark:text-gray-400 text-[15px]">
                        Didn’t find what you’re looking for?
                        </h4>
                        <div className='flex mt-4 space-x-5'>
                            <div className='w-1/2'>
                        <a href="/Browse">
                        <div className='p-4  rounded-xl border-gray-400 dark:dark:border-custom-dark-gray border-2'>
                            <h3 className='text-[14px] flex'><svg xmlns="http://www.w3.org/2000/svg" className="my-auto mr-3" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424" color="currentColor"></path></svg>Browse</h3>
                            <p className='text-gray-500 text-[14px] pt-2'>Browse Projects and Dive into world of hidden rewards.</p>
                        </div>
                        </a>
                        </div>
                        <div className='w-1/2'>
                        <a href="/chats">
                        <div className='p-4 rounded-xl border-gray-400 dark:dark:border-custom-dark-gray border-2'>
                            <h3 className='text-[14px] flex'><svg xmlns="http://www.w3.org/2000/svg" className="mr-3" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2m-7-1v2m-6-2v2"/></g></svg>GitBot</h3>
                            <p className='text-gray-500 text-[14px] pt-2'>Can't find Interting projects.Try our AI Bot to find porjects that you love.</p>
                        </div>
                        </a>
                        </div>
                    </div>
                    </div>
                    <div className='w-1/2 rounded-xl px-4 '>
                        <img 
                            src='/home_back.jpg' 
                            alt=""  
                            className='rounded-2xl h-[20em] object-cover w-full '
                        />
                    </div>
                    
                    
                       
                </div>
                <div className='mt-10 mx-4'>
                        <div>
                            <h1 className='pt-3 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-3xl font-bold'>Projects in your favorite languages </h1>
                            <p className='pt-2 dark:text-gray-400 text-[15px]'>Discover projects that match the languages you love to code in.</p>
                            <div className=' py-5 grid grid-cols-3 gap-4'>
                            {
                                isLoading?
                                <>
                                {repoData.map((repo:any) => {
                        if (!repo.image_url?.trim()) return null;
                        
                        return (
                            <div key={repo.projectName} className="hover:scale-[1.02] transition-transform duration-200">
                                <a href={`/projects/${repo.project_repository}`}>
                                <Issue 
                                    image={repo.image_url || 'back_2.jpg'}
                                    Project={repo.projectName}
                                    Fork={repo.forks?repo.forks:0}
                                    Stars={repo.stars?repo.stars:0}
                                    Contributors={
                                        repo.contributors && repo.contributors.collabs
                                            ? Object.keys(repo.contributors.collabs).length
                                            : 0
                                    }
                                    shortDescription={repo.shortdes}
                                    languages={repo.languages}
                                />
                                </a>
                            </div>
                        );
                    })}
                            
                                </>:
                                <></>
                            }
                           
                            </div>
                            
                        </div>
                </div>
            </div>
        </div>

        </Suspense>
        </>
    )

}
'use client'
import { useSession } from 'next-auth/react';
import {useEffect, useState} from'react';
import { useSidebarContext } from '@/assets/components/SidebarContext';

import {useRouter} from 'next/navigation'
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
export default function Home(){
    const session=useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRepos, setFilteredRepos] = useState<any>([]);
    const {isShrunk}=useSidebarContext()
    //kbar

    
    console.log(session)
    const id=session?.data?.user?.id
    const [image,updateImage]=useState('')
    const [visible,setVisible]=useState(null)
    const [repoData,setRepoData]=useState<any>([])
    const [projImage,setProjImage]=useState<any>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openSearch,setSearchOpen]=useState(false)
    const router=useRouter()
    
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
        
        
      

        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar/>
                
                <div className='flex pt-16'>
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
                        <div className='p-4  rounded-xl border-gray-400 dark:border-gray-800 border-1'>
                            <h3 className='text-[14px] flex'><svg xmlns="http://www.w3.org/2000/svg" className="my-auto mr-3" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424" color="currentColor"></path></svg>Browse</h3>
                            <p className='text-gray-500 text-[14px] pt-2'>Browse Projects and Dive into world of hidden rewards.</p>
                        </div>
                        </a>
                        </div>
                        <div className='w-1/2'>
                        <a href="/chats">
                        <div className='p-4 rounded-xl border-gray-400 dark:border-gray-800 border-1'>
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
                                        Fork={42}
                                        Stars={128}
                                        Contributors={8}
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

        {isSearchOpen && (
            <div className='z-50 mt-10 fixed ml-[20vw] mr-[20vw] top-[10%] bg-black rounded-xl border-3 border-[#1a1a1c] max-h-[30vw] overflow-hidden'>
                <div className="h-full overflow-y-auto relative">
                    {/* Close button */}
                    <div 
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#1a1a1c] cursor-pointer z-10"
                        onClick={() => {
                            setIsSearchOpen(false);
                            setSearchOpen(false);
                            setSearchTerm('');
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-gray-400">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </div>
                    
                    {/* Add search input */}
                    <div className="w-[60vw] mx-auto">
                    <div className="relative">
                        {/* Search Icon */}
                        <span className="absolute inset-y-0 left-3 flex items-center">
                        <Image
                            src="/icons8-search.svg"
                            alt="Search"
                            width={20}
                            height={20}
                            className="text-gray-400"
                        />
                        </span>
                       
                        {/* Input Field */}
                        <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 w-full border border-[#0a0a0a] focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSearchOpen(true);
                        }}
                        />
                    </div>
                    </div>

                    <div className='space-y-4 max-h-[calc(60vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
                        {isLoading && openSearch ? (
                            <>
                                {filteredRepos.map((repo: any) => {
                                    if (!repo.image_url?.trim()) return null;
                                    return (
                                        <div key={repo.projectName} className="p-4 transition-transform duration-200">
                                            <a href={`/projects/${repo.project_repository}`}>
                                            <div className="p-4 rounded-sm  hover:bg-[#1a1a1c] ">
                                            <div className="flex justify-between">
                                                
                                                <div>
                                                    <h3 className='text-2xl mb-2'>
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
                                                {repo.languages && Object.keys(repo.languages).map((language:string) => {
                                                    return(
                                                        <div key={language} className="inline-block bg-[#1a1a1c] text-[12px] text-white rounded px-2 py-1 mr-2">
                                                            {language}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div>

                                            </div>
                                        </div>
                                               
                                            </a>
                                        </div>
                                    );
                                })}
                            </>
                        ) : null}
                    </div>
                    {/* Removed the asterisk close button since we now have a proper X button */}
                </div>
            </div>
        )}
        </>
    )

}
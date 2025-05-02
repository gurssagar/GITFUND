'use client'
import { useSession } from 'next-auth/react';
import {useEffect, useState} from'react'
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openSearch,setSearchOpen]=useState(false)
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
    //kbar

    const actions = [
        {
          id: "blog",
          name: "Blog",
          shortcut: ["b"],
          keywords: "writing words",
          perform: () => (window.location.pathname = "blog"),
        },
        {
          id: "contact",
          name: "Contact",
          shortcut: ["c"],
          keywords: "email",
          perform: () => (window.location.pathname = "contact"),
        },
      ]

    
    console.log(session)
    const id=session?.data?.user?.id
    const [image,updateImage]=useState('')
    const [visible,setVisible]=useState(null)
    const [repoData,setRepoData]=useState<any>([])
    const [projImage,setProjImage]=useState<any>(null)
    const [isLoading, setIsLoading] = useState(false);


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
            <div className='ml-[12em] w-[calc(100%_-_12em)]'>
                <Topbar/>
                
                
                <div className='mt-20 mx-4'>
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
            <div className='mt-10 mx-4 fixed left-[30vw] top-[10%] bg-black  rounded-xl max-h-[60vh] overflow-hidden'>
                <div className="h-full overflow-y-auto">
                    {/* Add search input */}
                    <div className="w-[60vw] ">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="p-2 w-[100%] border border-gray-300 rounded  "
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value);setSearchOpen(true)}}
                        />
                    </div>

                    <div className=' space-y-4 max-h-[calc(60vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
                        {isLoading && openSearch ? (
                            <>
                                {filteredRepos.map((repo: any) => {
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
                                                />
                                            </a>
                                        </div>
                                    );
                                })}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        )}
        </>
    )

}
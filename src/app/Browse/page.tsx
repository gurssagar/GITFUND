'use client'
import { useSession, SessionContextValue } from 'next-auth/react'; // Added SessionContextValue
import {useEffect, useState} from'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import { useSidebarContext } from '@/assets/components/SidebarContext';
import {Suspense} from'react';
import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    useMatches,
    NO_GROUP
  } from "kbar";

interface Repo {
    projectName: string;
    shortdes?: string;
    languages?: Record<string, number>; // e.g., { TypeScript: 12345, JavaScript: 67890 }
    image_url?: string;
    project_repository?: string;
    forks?: number | string;
    stars?: number | string;
    contributors?: { collabs: string[] };
    // Add other properties as needed
}

interface ProjectData {
    project: Repo[];
}

interface CustomSession {
    data?: {
        user?: {
            id?: string;
            image?: string;
            usrename?: string;
            email?: string;
            // Add other user properties if they exist
        };
        // Add other session properties if they exist
    } ;
}

export default function Home(){
    const session = useSession();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [openSearch,setSearchOpen]=useState<boolean>(false)
    const {isShrunk}=useSidebarContext()
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]); 

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
    

    
    console.log(session)
    const id: string | undefined = session?.data?.user?.id;
    const [image,updateImage]=useState<string>('')
    const [visible,setVisible]=useState<null | any>(null) // Consider a more specific type if possible
    const [repoData,setRepoData]=useState<Repo[]>([])
    const [projImage,setProjImage]=useState<any>(null) // Consider a more specific type if possible
    const [isLoading, setIsLoading] = useState<boolean>(false);


    useEffect(() => {
        let tempFilteredRepos: Repo[] = repoData;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            tempFilteredRepos = tempFilteredRepos.filter((repo: Repo) => 
                repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (repo.shortdes && repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by selected language
        if (selectedLanguage) { 
            tempFilteredRepos = tempFilteredRepos.filter((repo: Repo) => {
                if (repo.languages && typeof repo.languages === 'object') {
                    return repo.languages.hasOwnProperty(selectedLanguage);
                }
                return false;
            });
        }

        setFilteredRepos(tempFilteredRepos);
    }, [searchTerm, repoData, selectedLanguage]); 

    useEffect(()=>{
        const fetchData=async()=>{
           await fetch('/api/add-projects',
            {
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                },
            }
           ).then((res)=>res.json() as Promise<ProjectData>)
           .then((data)=>{
                setRepoData(data.project);
                console.log(data.project,"pewiedajsdja")
                const allLangs = new Set<string>();
                data.project.forEach((projects: Repo) => {
                    if (projects.languages && typeof projects.languages === 'object') {
                        Object.keys(projects.languages).forEach(lang => allLangs.add(lang));
                    }
                });
                console.log(allLangs,"all langs")
                setAvailableLanguages(Array.from(allLangs));
                console.log(availableLanguages,"available languages")
                setIsLoading(true);
           })
           
        }
        fetchData();
    },[])

    useEffect(()=>{
        if(session?.data?.user?.image){
            updateImage(session.data.user.image)
        }
    },[session?.data?.user?.image])
    console.log(repoData)

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => { 
        setSelectedLanguage(event.target.value);
        if (isSearchOpen) { 
            setSearchOpen(true);
        }
    };

    return(
        <>
        
        
      <Suspense fallback={<div>Loading...</div>}>
        

        <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar/>
                
               
                <div className='mt-20 mx-4'>
                        <div>
                            <h1 className='pt-3 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-3xl font-bold'>Projects in your favorite languages </h1>
                            <p className='pt-2 dark:text-gray-400 text-[15px]'>Discover projects that match the languages you love to code in.</p>
                             <div className="mt-4 flex mx-4">
                                <input
                                    type="text"
                                    placeholder="Search projects by name or description..."
                                    className="px-2 w-2/3 w-full bg-white dark:bg-custom-dark-gray border border-gray-300 dark:border-gray-600 rounded bg-[#191919] dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
                                />
                                <div className=" mx-4 w-1/3">
                                    <label htmlFor="language-select-main" className="sr-only">Filter by language</label>
                                    <select
                                        id="language-select-main"
                                        value={selectedLanguage}
                                        onChange={handleLanguageChange}
                                        className="p-2   w-full bg-white text-black  border border-gray-300 dark:border-gray-600 rounded dark:bg-[#191919] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">All Languages</option>
                                        {availableLanguages.map(lang => (
                                            <option key={`main-${lang}`} value={lang}>
                                                {lang}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Language Filter Dropdown */}
                            
                            <div className=' py-5 grid grid-cols-3 gap-4'>
                            {
                                isLoading?
                                <>
                                {filteredRepos.map((repo: Repo) => {
                                    if (!repo.image_url?.trim()) return null;
                                    const stars = typeof repo.stars === 'number' ? repo.stars : (repo.stars ? parseInt(String(repo.stars), 10) : 0);
                                    const forks = typeof repo.forks === 'number' ? repo.forks : (repo.forks ? parseInt(String(repo.forks), 10) : 0);
                                    const contributorsCount = repo.contributors && Array.isArray(repo.contributors.collabs) ? repo.contributors.collabs.length : 0;


                                    return (
                                        <div key={repo.projectName} className="hover:scale-[1.02] transition-transform duration-200">
                                            <a href={`/projects/${repo.project_repository}`}>
                                            <Issue 
                                                image={repo.image_url || 'back_2.jpg'}
                                                Project={repo.projectName}
                                                Fork={forks}
                                                Stars={stars}
                                                Contributors={contributorsCount}
                                                shortDescription={repo.shortdes || ''}
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
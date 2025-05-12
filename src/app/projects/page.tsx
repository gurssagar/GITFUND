'use client'
import { useSession } from 'next-auth/react';
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
export default function Home(){
    const session=useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRepos, setFilteredRepos] = useState<any>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openSearch,setSearchOpen]=useState(false)
    const {isShrunk}=useSidebarContext()
    const [selectedLanguage, setSelectedLanguage] = useState<string>(''); // Changed from selectedLanguages
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
    const id=session?.data?.user?.id
    const [image,updateImage]=useState('')
    const [visible,setVisible]=useState(null)
    const [repoData,setRepoData]=useState<any>([])
    const [projImage,setProjImage]=useState<any>(null)
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        let tempFilteredRepos = repoData;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            tempFilteredRepos = tempFilteredRepos.filter((repo: any) => 
                repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (repo.shortdes && repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by selected language
        if (selectedLanguage) { // Updated condition
            tempFilteredRepos = tempFilteredRepos.filter((repo: any) => {
                if (repo.languages && typeof repo.languages === 'object') {
                    // Check if the selected language is a key in the repo's languages object
                    return repo.languages.hasOwnProperty(selectedLanguage);
                }
                return false;
            });
        }

        setFilteredRepos(tempFilteredRepos);
    }, [searchTerm, repoData, selectedLanguage]); // Add selectedLanguage to dependencies, remove selectedLanguages

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
                setRepoData(data.projects);
                // Extract unique languages from projects
                const allLangs = new Set<string>();
                data.projects.forEach((project: any) => {
                    if (project.languages && typeof project.languages === 'object') {
                        Object.keys(project.languages).forEach(lang => allLangs.add(lang));
                    }
                });
                setAvailableLanguages(Array.from(allLangs));
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

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => { // New handler
        setSelectedLanguage(event.target.value);
        if (isSearchOpen) { // Keep search results visible in modal when changing filter
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
                                    className="px-2 w-2/3 w-full border border-gray-600 rounded bg-[#191919] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                                <div className="mt-4 mx-4 w-1/3">
                                    <label htmlFor="language-select-main" className="sr-only">Filter by language</label>
                                    <select
                                        id="language-select-main"
                                        value={selectedLanguage}
                                        onChange={handleLanguageChange}
                                        className="p-2 w-full border border-gray-600 rounded bg-[#191919] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                {filteredRepos.map((repo: any) => {
                                    if (!repo.image_url?.trim()) return null;
                                    // Ensure stars and forks are numbers, provide default if not
                                    const stars = typeof repo.stars === 'number' ? repo.stars : (repo.stars ? parseInt(repo.stars, 10) : 0);
                                    const forks = typeof repo.forks === 'number' ? repo.forks : (repo.forks ? parseInt(repo.forks, 10) : 0);
                                    const contributors = repo.contributors && Array.isArray(repo.contributors.collabs) ? repo.contributors.collabs.length : 0;


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
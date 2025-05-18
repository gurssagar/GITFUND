'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearch } from './SearchContext'; // Import the context hook



export default function SearchModal(/* Remove props: { isOpen, onClose }: SearchModalProps */) {
  const { isSearchOpen, closeSearchModal } = useSearch(); // Use the context
  const [searchTerm, setSearchTerm] = useState('');
  const [repoData, setRepoData] = useState<any[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSearchOpen) { // Use isSearchOpen from context
      const findRecords = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/add-issues');
          const data = await response.json();
          setRepoData(data.projects || []);
        } catch (error) {
          console.error("Failed to fetch projects:", error);
          setRepoData([]);
        }
        setIsLoading(false);
      };
      findRecords();
    }
  }, [isSearchOpen]); // Depend on isSearchOpen from context

  useEffect(() => {
    if (!isSearchOpen) { // Use isSearchOpen from context
      setSearchTerm('');
      setFilteredRepos([]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredRepos(repoData);
    } else {
      setFilteredRepos(
        repoData.filter((repo: any) =>
          (repo.projectName && repo.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (repo.shortdes && repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, repoData, isSearchOpen]); // Depend on isSearchOpen from context

  if (!isSearchOpen) return null; // Use isSearchOpen from context

  return (
    <div className='z-50 fixed inset-0  bg-opacity-50 flex items-start justify-center pt-[10vh]'>
      <div className='bg-white dark:bg-black rounded-xl border border-gray-700 dark:border-[#1a1a1c] w-[50vw] max-h-[70vh] overflow-hidden flex flex-col shadow-2xl'>
        <div className="relative p-2">
          <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Image
              src="/icons8-search.svg" // Ensure this path is correct
              alt="Search"
              className='text-black'
              width={20}
              height={20}
            />
          </span>
          <input
            type="text"
            placeholder="Search projects by name or description..."
            className="pl-12 pr-10 py-3 w-full bg-[#eeeee] text-black dark:text-white dark:bg-black  placeholder-gray-500 focus:outline-none border-b border-gray-700 dark:border-[#1a1a1c]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button
            className="absolute top-1/2 right-3 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700 dark:hover:bg-[#1a1a1c] cursor-pointer text-gray-400"
            onClick={closeSearchModal} // Use closeSearchModal from context
            aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className='flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-2 space-y-1'>
          
          <div className='text-xl px-3 font-bold flex gap-4 '>
            Projects
            <div className='border-2 px-3 text-custom-gray py-[2px] rounded-lg border-custom-dark-gray text-sm font-normal my-auto'>
              {filteredRepos.length}
            </div>
          </div>
          {isLoading && <p className="text-center text-gray-400 py-4">Loading...</p>}
          {!isLoading && filteredRepos.length === 0 && searchTerm.length > 0 && (
            <p className="text-center text-gray-200 py-4">No projects found for "{searchTerm}".</p>
          )}
          {!isLoading && filteredRepos.length === 0 && searchTerm.length === 0 && repoData.length > 0 && (
             <p className="text-center text-gray-200 py-4">Type to search projects.</p>
          )}
          {!isLoading &&
            filteredRepos.map((repo: any) => {
              if (!repo.projectName) return null; // Basic validation
              const stars = typeof repo.stars === 'number' ? repo.stars : (repo.stars ? parseInt(repo.stars, 10) : 0);
              const forks = typeof repo.forks === 'number' ? repo.forks : (repo.forks ? parseInt(repo.forks, 10) : 0);
              const contributors = repo.contributors && Array.isArray(repo.contributors.collabs) ? repo.contributors.collabs.length : 0;

              return (
                
                <Link key={repo.projectName} href={`/projects/${repo.project_repository}`} passHref>
                  <div onClick={closeSearchModal} className="hover:bg-custom-dark-gray block p-3 rounded-md  transition-colors duration-150"> {/* Use closeSearchModal from context */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className='text-lg font-semibold dark:text-white text-gray-900 mb-1'>
                          {repo.projectName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 my-1 text-xs dark:text-custom-gray text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z" /></svg>
                            <span>{stars}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5a3 3 0 1 0-4 2.816V11H6V7.816a3 3 0 1 0-2 0V11a2 2 0 0 0 2 2h5v4.184a3 3 0 1 0 2 0V13h5a2 2 0 0 0 2-2V7.816A2.99 2.99 0 0 0 22 5" /></svg>
                            <span>{forks}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0" /></svg>
                            <span>{contributors}</span>
                          </div>
                        </div>
                        {repo.shortdes && (
                          <p className="text-sm dark:text-gray-200 text-gray-600 mb-2 line-clamp-2">
                            {repo.shortdes}
                          </p>
                        )}
                        
                      </div>
                      {repo.image_url && (
                        <Image src={repo.image_url} alt={repo.projectName} width={64} height={64} className="rounded object-cover ml-4 flex-shrink-0" />
                      )}
                    </div>
                    {repo.languages && Object.keys(repo.languages).length > 0 && (
                      <div className="">
                        {Object.keys(repo.languages).slice(0, 5).map((language: string) => ( // Show max 5 languages
                          <span key={language} className="inline-block bg-gray-700 dark:bg-[#2a2a2a] text-[11px] text-gray-300 dark:text-gray-400 rounded-full px-2 py-0.5 mr-1.5 mb-1">
                            {language}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
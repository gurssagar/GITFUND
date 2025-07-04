"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import Issue from "@/assets/components/issue";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";

interface Repo {
  projectName: string;
  shortdes?: string;
  languages?: Record<string, number>;
  image_url?: string;
  project_repository?: string;
  forks?: number | string;
  stars?: number | string;
  contributors?: { collabs: string[] };
}

interface ProjectData {
  project: Repo[];
}

export default function Home() {
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [openSearch, setSearchOpen] = useState<boolean>(false);
  const { isShrunk } = useSidebarContext();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prevState) => !prevState);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const id: string | undefined = session?.data?.user?.id;
  const [image, updateImage] = useState<string>("");
  const [visible, setVisible] = useState<null | any>(null);
  const [repoData, setRepoData] = useState<Repo[]>([]);
  const [projImage, setProjImage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let tempFilteredRepos: Repo[] = repoData;

    // Filter by search term
    if (searchTerm.trim() !== "") {
      tempFilteredRepos = tempFilteredRepos.filter(
        (repo: Repo) =>
          repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.shortdes &&
            repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected language
    if (selectedLanguage) {
      tempFilteredRepos = tempFilteredRepos.filter((repo: Repo) => {
        if (repo.languages && typeof repo.languages === "object") {
          return repo.languages.hasOwnProperty(selectedLanguage);
        }
        return false;
      });
    }

    setFilteredRepos(tempFilteredRepos);
  }, [searchTerm, repoData, selectedLanguage]);

  useEffect(() => {
    const fetchData = async () => {
      await fetch("/api/add-projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json() as Promise<ProjectData>)
        .then((data) => {
          setRepoData(data.project);
          console.log(data.project, "pewiedajsdja");

          const allLangs = new Set<string>();
          data.project.forEach((projects: Repo) => {
            if (projects.languages && typeof projects.languages === "object") {
              Object.keys(projects.languages).forEach((lang) =>
                allLangs.add(lang)
              );
            }
          });

          console.log(allLangs, "all langs");
          setAvailableLanguages(Array.from(allLangs));
          setIsLoading(true);
        });
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (session?.data?.user?.image) {
      updateImage(session.data.user.image);
    }
  }, [session?.data?.user?.image]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedLanguage(event.target.value);
    if (isSearchOpen) {
      setSearchOpen(true);
    }
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div
            className={`
              flex-1 transition-all duration-300 ease-in-out
              ${
                isMobile
                  ? "ml-0 w-full"
                  : isShrunk
                  ? "ml-16 w-[calc(100%-4rem)]"
                  : "ml-64 w-[calc(100%-16rem)]"
              }
            `}
          >
            <Topbar />

            <div className="mt-16 md:mt-20 mx-4 lg:mx-6">
              <div>
                {/* Header Section */}
                <div className="mb-6 lg:mb-8">
                  <h1 className="dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-2xl md:text-3xl lg:text-4xl font-bold">
                    Projects in your favorite languages
                  </h1>
                  <p className="pt-2 dark:text-gray-400 text-sm md:text-base">
                    Discover projects that match the languages you love to code
                    in.
                  </p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <label htmlFor="search-input" className="sr-only">
                        Search projects
                      </label>
                      <input
                        id="search-input"
                        type="text"
                        placeholder="Search projects by name or description..."
                        className="
                          w-full px-3 py-2 text-sm md:text-base
                          bg-white dark:bg-custom-dark-gray 
                          border border-gray-300 dark:border-gray-600 
                          rounded-lg
                          dark:text-white placeholder-gray-500 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-colors duration-200
                        "
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(e.target.value)
                        }
                      />
                    </div>

                    {/* Language Filter */}
                    <div className="w-full sm:w-64">
                      <label htmlFor="language-select-main" className="sr-only">
                        Filter by language
                      </label>
                      <select
                        id="language-select-main"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="
                          w-full px-3 py-2 text-sm md:text-base
                          bg-white text-black dark:bg-custom-dark-gray dark:text-white
                          border border-gray-300 dark:border-gray-600 
                          rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-colors duration-200
                        "
                      >
                        <option value="">All Languages</option>
                        {availableLanguages.map((lang) => (
                          <option key={`main-${lang}`} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results Count */}
                  {isLoading && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {filteredRepos.length} project
                      {filteredRepos.length !== 1 ? "s" : ""} found
                      {selectedLanguage && ` in ${selectedLanguage}`}
                    </div>
                  )}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                  {isLoading ? (
                    <>
                      {filteredRepos.length > 0 ? (
                        filteredRepos.map((repo: Repo) => {
                          if (!repo.image_url?.trim()) return null;

                          const stars =
                            typeof repo.stars === "number"
                              ? repo.stars
                              : repo.stars
                              ? Number.parseInt(String(repo.stars), 10)
                              : 0;

                          const forks =
                            typeof repo.forks === "number"
                              ? repo.forks
                              : repo.forks
                              ? Number.parseInt(String(repo.forks), 10)
                              : 0;

                          const contributorsCount =
                            repo.contributors &&
                            Array.isArray(repo.contributors.collabs)
                              ? repo.contributors.collabs.length
                              : 0;

                          return (
                            <div
                              key={repo.projectName}
                              className="hover:scale-[1.02] transition-transform duration-200"
                            >
                              <a href={`/projects/${repo.project_repository}`}>
                                <Issue
                                  image={repo.image_url || "back_2.jpg"}
                                  Project={repo.projectName}
                                  Fork={forks}
                                  Stars={stars}
                                  Contributors={contributorsCount}
                                  shortDescription={repo.shortdes || ""}
                                  languages={repo.languages}
                                />
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <div className="text-gray-500 dark:text-gray-400">
                            <svg
                              className="mx-auto h-12 w-12 mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">
                              No projects found
                            </h3>
                            <p className="text-sm">
                              {searchTerm || selectedLanguage
                                ? "Try adjusting your search or filter criteria."
                                : "No projects available at the moment."}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-full flex justify-center items-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Loading projects...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}

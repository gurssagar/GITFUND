"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import Issue from "@/assets/components/issue";

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
  project: Project[];
}

export default function Home() {
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRepos, setFilteredRepos] = useState<Project[]>([]);
  const { isShrunk } = useSidebarContext();
  const [image, updateImage] = useState<string>("");
  const [repoData, setRepoData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();

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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRepos(repoData);
    } else {
      const filtered = repoData.filter(
        (repo: any) =>
          repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRepos(filtered);
    }
  }, [searchTerm, repoData]);

  useEffect(() => {
    const fetchData = async () => {
      await fetch("/api/add-projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setRepoData(data.project);
          console.log(data.project, "data.project");
          setIsLoading(true);
        });
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (session?.data?.user?.image) {
      updateImage(session?.data?.user?.image);
    }
  }, [session?.data?.user?.image]);

  return (
    <>
      <Suspense>
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

            {/* Hero Section */}
            <div className="pt-16 md:pt-20">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
                {/* Left Content */}
                <div className="w-full lg:w-1/2 px-4 lg:px-6">
                  <div className="pt-3 text-center lg:text-left">
                    <h1 className="dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-2xl md:text-3xl lg:text-4xl font-bold">
                      Start Contributing
                    </h1>
                    <h1 className="dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-2xl md:text-3xl lg:text-4xl font-bold">
                      Begin Earning
                    </h1>
                  </div>

                  <div className="text-center lg:text-left pt-4 space-y-2">
                    <p className="dark:text-gray-400 text-sm md:text-base">
                      Get recommendations based on your profile and past
                      contributions.
                    </p>
                    <p className="dark:text-gray-400 text-sm md:text-base">
                      Didn't find what you're looking for?
                    </p>
                  </div>

                  {/* Action Cards */}
                  <div className="flex flex-col sm:flex-row mt-6 gap-4">
                    <div className="flex-1">
                      <Link href="/Browse">
                        <div className="p-4 rounded-xl border-gray-400 dark:border-custom-dark-gray border-2 hover:border-gray-500 dark:hover:border-gray-300 transition-colors cursor-pointer">
                          <h3 className="text-sm md:text-base flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-3 flex-shrink-0"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424"
                                color="currentColor"
                              />
                            </svg>
                            Browse
                          </h3>
                          <p className="text-gray-500 text-xs md:text-sm pt-2">
                            Browse Projects and Dive into world of hidden
                            rewards.
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="flex-1">
                      <Link href="/GitBot">
                        <div className="p-4 rounded-xl border-gray-400 dark:border-custom-dark-gray border-2 hover:border-gray-500 dark:hover:border-gray-300 transition-colors cursor-pointer">
                          <h3 className="text-sm md:text-base flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-3 flex-shrink-0"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                            >
                              <g
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              >
                                <path d="M12 8V4H8" />
                                <rect
                                  width="16"
                                  height="12"
                                  x="4"
                                  y="8"
                                  rx="2"
                                />
                                <path d="M2 14h2m16 0h2m-7-1v2m-6-2v2" />
                              </g>
                            </svg>
                            GitBot
                          </h3>
                          <p className="text-gray-500 text-xs md:text-sm pt-2">
                            Can't find interesting projects? Try our AI Bot to
                            find projects that you love.
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Image */}
                <div className="w-full lg:w-1/2 px-4 lg:px-6">
                  <div className="relative">
                    <img
                      src="/home_back.jpg"
                      alt="Dashboard illustration"
                      className="rounded-2xl h-48 sm:h-64 lg:h-80 xl:h-96 object-cover w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mt-8 lg:mt-12 mx-4 lg:mx-6">
              <div>
                <h2 className="dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-2xl md:text-3xl font-bold">
                  Projects in your favorite languages
                </h2>
                <p className="pt-2 dark:text-gray-400 text-sm md:text-base">
                  Discover projects that match the languages you love to code
                  in.
                </p>

                {/* Responsive Grid */}
                <div className="py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {isLoading ? (
                    <>
                      {repoData.map((repo: any) => {
                        if (!repo.image_url?.trim()) return null;

                        return (
                          <div
                            key={repo.projectName}
                            className="hover:scale-[1.02] transition-transform duration-200"
                          >
                            <Issue
                              image={repo.image_url || "back_2.jpg"}
                              Project={repo.projectName}
                              Fork={repo.forks ? repo.forks : 0}
                              Stars={repo.stars ? repo.stars : 0}
                              Contributors={
                                repo.contributors && repo.contributors.collabs
                                  ? Object.keys(repo.contributors.collabs)
                                      .length
                                  : 0
                              }
                              shortDescription={repo.shortdes}
                              languages={repo.languages}
                              activeUser={session?.data?.user?.username || ""}
                              Tag={repo.Tag ? repo.Tag : "General"}
                            />
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="col-span-full flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
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

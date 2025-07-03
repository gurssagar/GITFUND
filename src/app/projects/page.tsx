"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import Issue from "@/assets/components/issue";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
export default function Home() {
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isShrunk } = useSidebarContext();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [repoData, setRepoData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setUserImage] = useState("");

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Use useMemo to filter repositories based on search term and selected language
  const filteredRepos = useMemo(() => {
    let tempFilteredRepos = repoData;

    // Filter by search term
    if (searchTerm.trim() !== "") {
      tempFilteredRepos = tempFilteredRepos.filter(
        (repo: any) =>
          repo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.shortdes &&
            repo.shortdes.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Filter by selected language
    if (selectedLanguage) {
      tempFilteredRepos = tempFilteredRepos.filter((repo: any) => {
        if (repo.languages && typeof repo.languages === "object") {
          return repo.languages.hasOwnProperty(selectedLanguage);
        }
        return false;
      });
    }

    return tempFilteredRepos;
  }, [searchTerm, repoData, selectedLanguage]);

  // Combined useEffect for data fetching and user image updating
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(false);
        const response = await fetch("/api/add-issues", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch projects");

        const data = await response.json();
        setRepoData(data.projects);

        // Extract unique languages from projects
        const allLangs = new Set<string>();
        data.projects.forEach((project: any) => {
          if (project.languages && typeof project.languages === "object") {
            Object.keys(project.languages).forEach((lang) =>
              allLangs.add(lang),
            );
          }
        });
        setAvailableLanguages(Array.from(allLangs));
        setIsLoading(true);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setIsLoading(true); // Set to true to avoid showing loading indefinitely
      }
    };

    fetchData();

    // Update user image when session changes
    if (session?.data?.user?.image) {
      setUserImage(session.data.user.image);
    }
  }, [session?.data?.user?.image]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex">
          <Sidebar />
          <div
            className={` ${isShrunk ? "md:ml-[4rem] md:w-[calc(100%_-_4rem)]" : "md:ml-[16rem] md:w-[calc(100%_-_16rem)]"}`}
          >
            <Topbar />

            <div className="mt-20 mx-4">
              <div>
                <h1 className="pt-3 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-white to-gray-500 text-3xl font-bold">
                  Projects in your favorite languages{" "}
                </h1>
                <p className="pt-2 dark:text-gray-400 text-[15px]">
                  Discover projects that match the languages you love to code
                  in.
                </p>
                <div className="mt-4 flex mx-4">
                  <input
                    type="text"
                    placeholder="Search projects by name or description..."
                    className="px-2 w-full border border-gray-600 rounded bg-[#191919] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="mt-4 mx-4 w-1/3">
                    <label htmlFor="language-select-main" className="sr-only">
                      Filter by language
                    </label>
                    <select
                      id="language-select-main"
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className="p-2 w-full border border-gray-600 rounded bg-[#191919] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                {/* Language Filter Dropdown */}

                <div className=" py-5 grid grid-cols-3 gap-4">
                  {isLoading ? (
                    <>
                      {filteredRepos.map((repo: any) => {
                        if (!repo.image_url?.trim()) return null;

                        return (
                          <div
                            key={repo.projectName}
                            className="hover:scale-[1.02] transition-transform duration-200"
                          >
                            <a href={`/projects/${repo.project_repository}`}>
                              <Issue
                                image={repo.image_url || "back_2.jpg"}
                                Project={repo.projectName}
                                Fork={Number(repo.forks) || 0}
                                Stars={Number(repo.stars) || 0}
                                Contributors={
                                  repo.contributors && repo.contributors.collabs
                                    ? Object.keys(repo.contributors.collabs)
                                        .length
                                    : 0
                                }
                                shortDescription={repo.shortdes}
                                languages={repo.languages}
                              />
                            </a>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-gray-400">Loading projects...</p>
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

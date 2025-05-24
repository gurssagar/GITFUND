"use client";
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import Topbar from "@/assets/components/topbar";
import Sidebar from "@/assets/components/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
interface Project {
  projectName: string;
  aiDescription: string;
  projectOwner: string;
  shortdes: string;
  longdis: string;
  image_url: string;
  project_repository: string;
  contributors: any; // Use a more specific type if available
  languages: any; // Use a more specific type if available
  stars: string;
}
// Dummy component for showing loading state
const DummyProjectData = () => {
  return (
    <div className="animate-pulse z-10">
      <div className="flex justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
        <div>
          <div className="flex gap-3 mt-6">
            <div className="h-10 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-10 w-36 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="w-[70%] border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray">
          <div className="mb-4">
            <div className="h-6 w-40 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded dark:bg-gray-700 mb-4"></div>

            <div className="flex items-center space-x-4 mt-4">
              <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
        <div className="w-[30%]">
          <div className="border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
          </div>
          <div className="border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray">
            <div className="h-6 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-20 w-full bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-6 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray"
            >
              <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Proj() {
  const { isShrunk } = useSidebarContext();
  const [repoData, setRepoData] = useState<any>([]);
  const [issues, setIssues] = useState<any>([]);
  const [isIssues, setIsIssues] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const segments = pathname.split("/");
  const repoParam =
    segments[segments.length - 1] || segments[segments.length - 2];
  useEffect(() => {
    const fetchData = async () => {
      await fetch(`/api/specific-repo?project_repository=${repoParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.project, "contyri");
          setRepoData(data.project);
          setIsLoading(false);
        });
    };

    const fetchIssues = async () => {
      await fetch(`/api/add-issues?project_repository=${repoParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setIssues(data.projects);
          console.log(data, "issues");
        });
    };
    fetchIssues();
    fetchData();
  }, []);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex min-h-screen ">
          <Sidebar />
          <div
            className={`flex-grow transition-all duration-300 ease-in-out ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
          >
            <Topbar />
            <div className="mt-24 px-4 w-[80%] mx-auto">
              {isLoading ? (
                <DummyProjectData />
              ) : (
                repoData.map((repo: any) => (
                  <>
                    <div className=" ">
                      <div className="flex justify-between">
                        <div>
                          <h1 className="text-xl font-bold">
                            {repo.projectName}
                          </h1>
                          <p className="text-[14px] dark:text-custom-gray text-custom-dark-gray">
                            {repo.shortdes}
                          </p>
                        </div>
                        <div>
                          <div className="flex gap-3 mt-6">
                            <a href={`/create-issues`} target="_blank" rel="">
                              <button className="flex items-center px-5 py-2 bg-black text-white rounded-md font-medium dark:bg-white dark:text-black  hover:bg-gray-800 transition">
                                <span className="mr-2 text-lg">+</span>
                                Add Issue
                              </button>
                            </a>
                            <a
                              href={`https://github.com/${repo.projectOwner}/${repo.project_repository}`}
                              target="_blank"
                              rel=""
                              className="flex items-center px-5 py-2 border border-gray-300 rounded-md font-medium hover:dark:text-black hover:dark:bg-white  transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-5 h-5 mr-2"
                              >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                              </svg>
                              View on GitHub
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-[70%] mt-4 border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray">
                          <div className="mb-2">
                            <h2 className="text-xl font-bold">
                              Project Details
                            </h2>
                            <p className="text-[14px] dark:text-custom-gray text-custom-dark-gray">
                              Information about the project & repository
                            </p>
                          </div>
                          <div>
                            <h3 className="text-[18px] font-bold">
                              Description
                            </h3>
                            <p className="text-[14px] dark:text-custom-gray text-custom-dark-gray">
                              {repo.longdis}
                            </p>
                            <div className="flex items-center space-x-4 text-sm mt-2">
                              <span className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1 text-yellow-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                                </svg>
                                {repo.stars} stars
                              </span>
                              <span className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm10 2v10H5V5h10zm-2 3a1 1 0 10-2 0 1 1 0 002 0zm-1 2a3 3 0 100 6 3 3 0 000-6z" />
                                </svg>
                                {repo.forks} forks
                              </span>
                              <span>
                                Owner:{" "}
                                <span className="font-semibold">
                                  {repo.projectOwner}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-[18px] font-bold">Languages</h3>
                            <div className="flex gap-3 pt-1">
                              {Object.keys(repo.languages).map((key, index) => (
                                <p className="text-sm px-3 rounded-full text-gray-100 dark:text-white bg-custom-dark-gray dark:bg-custom-gray-dark dark:text-custom-gray text-custom-dark-gray">
                                  {key}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-[18px] font-bold">
                              Contributors
                            </h3>
                            <div className="flex gap-3">
                              {repo.contributors?.map((collab: any) => {
                                return (
                                  <>
                                    <div
                                      key={collab.id}
                                      className="flex items-center"
                                    >
                                      <img
                                        src={collab.avatar_url}
                                        alt={collab.login}
                                        className="w-7 h-7 rounded-full"
                                      />
                                      <p className="px-3">{collab.login}</p>
                                    </div>
                                  </>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="w-[30%] mt-4 border-1 p-4 border-gray-200 rounded-lg dark:border-custom-dark-gray">
                          <div className="mb-2">
                            <h2 className="text-xl font-bold">Stats</h2>
                            <p className="text-[14px] dark:text-custom-gray text-custom-dark-gray">
                              Project Statistics
                            </p>
                          </div>
                          <div className="grid grid-cols-2  gap-12 mt-8">
                            <div>
                              <div className="text-lg">Total Issues</div>
                              <div className="text-5xl font-bold">2</div>
                            </div>
                            <div>
                              <div className="text-lg">Total Rewards</div>
                              <div className="text-5xl font-bold">$22</div>
                            </div>
                            <div>
                              <div className="text-lg mt-4">Average Reward</div>
                              <div className="text-5xl font-bold">$199</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ))
              )}

              <>
                <div className="mt-10 flex p-2 dark:bg-custom-dark-gray bg-gray-100 rounded-md w-fit">
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${isIssues ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setIsIssues(true)}
                  >
                    Issues
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${!isIssues ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setIsIssues(false)}
                  >
                    Contributors
                  </button>
                </div>
                {isIssues ? (
                  <>
                    <div className="border-1 border-gray-100 dark:border-custom-dark-gray rounded-xl border p-6 mt-6 mb-20">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h2 className="text-xl font-semibold">Issues</h2>
                          <p className="text-sm text-gray-500">
                            Manage issues and rewards for this project
                          </p>
                        </div>
                        <a href={`/create-issues`} target="_blank" rel="">

                        <button className="flex items-center px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-custom-dark-gray transition">
                          <span className="mr-2 text-lg">+</span> Add Issue
                        </button>
                        </a>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-2 px-4 font-medium">Issue</th>
                              <th className="py-2 px-4 font-medium">
                                Difficulty
                              </th>
                              <th className="py-2 px-4 font-medium">
                                Priority
                              </th>
                              <th className="py-2 px-4 font-medium">Date</th>
                              <th className="py-2 px-4 font-medium">Reward</th>
                              <th className="py-2 px-4"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {issues.map((issue, idx) => (
                              <tr
                                key={idx}
                                className="border-t hover:dark:bg-custom-dark-gray hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  <div className="font-medium">
                                    {issue.issue_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {issue.description}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${issue.Difficulty === "medium" ? "bg-yellow-100 text-yellow-700" : issue.Difficulty === "low" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {issue.Difficulty}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${issue.priority === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                                  >
                                    {issue.priority}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {new Date(
                                    issue.issue_date,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </td>
                                <td className="py-3 px-4 font-bold">
                                  {issue.rewardAmount} BNB
                                </td>
                                <td className="py-3 px-4 text-right">...</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-1 dark:border-custom-dark-gray border-dark-gray rounded-xl border p-6 mt-6 mb-20">
                      <h2 className="text-xl font-semibold">Contributors</h2>
                      <p className="text-sm text-gray-500 mb-6">
                        People who have contributed to this project
                      </p>
                      <div className="grid grid-cols-3 gap-6">
                        {repoData.map((repo: any) => {
                          return (
                            <>
                              {repo.contributors.map((contributor, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 min-w-[260px] max-w-sm border rounded-lg p-6"
                                >
                                  <div className="font-semibold text-lg mb-2">
                                    {contributor.login}
                                  </div>
                                  <div className="text-sm dark:text-gray-100 text-gray-700">
                                    Contributions: {contributor.contributions}
                                  </div>
                                  <div className="text-sm dark:text-gray-100 text-gray-700">
                                    Issues solved: {contributor.issuesSolved}
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}

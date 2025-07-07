"use client";

import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useState, useEffect, useCallback } from "react";
import { Octokit } from "octokit";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface ProjectData {
  projectOwner: string;
  project_repository: string;
}

export default function Project() {
  const { data: session } = useSession();
  const params = useParams();
  const Repo = params?.Repo as string;
  const { isShrunk } = useSidebarContext();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // State declarations
  const [aiReply, setAiReply] = useState("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [retryAfter, setRetryAfter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [repoData, setRepoData] = useState<any>([]);
  const [projects, setProjects] = useState<any>([]);
  const [issues, setIssues] = useState<any>([]);
  const [repoValue, setRepoValue] = useState<any>([]);
  const [contributors, setContributors] = useState<any>([]);
  const [languages, setLanguages] = useState<any>({});
  const [commitData, setCommitData] = useState<any>([]);
  const [collabs, setCollabs] = useState<any>([]);
  const [width, setWidth] = useState("300px");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIssue, setIssue] = useState<boolean>(false);
  const [isIssueNumber, setIssueNumber] = useState<string>();
  const [issueData, setIssueData] = useState<string>(" ");
  const [status, setStatus] = useState<string>();
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);

  // Create octokit instance with timeout
  const octokit = new Octokit({
    auth: (session as any)?.accessToken,
  });

  console.log("Session Data:", session);

  // Fetch repo data
  useEffect(() => {
    const fetchRepoData = async () => {
      if (!Repo) return;
      setIsLoading(true);

      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const [repoResponse, issuesResponse] = await Promise.all([
          fetch(`/api/specific-repo?project_repository=${Repo}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal,
          }),
          fetch(`/api/add-issues?project_repository=${Repo}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal,
          }),
        ]);

        console.log(repoResponse, "repoResponse");

        if (!repoResponse.ok) {
          throw new Error(`HTTP error! status: ${repoResponse.status}`);
        }

        const repoData = await repoResponse.json();
        console.log(repoData, "repoDatassss");
        const issuesData = await issuesResponse.json();

        const processedRepoData =
          repoData.project && repoData.project.length > 0
            ? repoData.project[0]
            : repoData.project || null;

        setRepoData(processedRepoData);
        setIssues(issuesData.projects || []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setRepoData(null);
          setIssues([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepoData();
  }, [Repo]);

  // Helper Functions
  const fetchWithRetry = useCallback(
    async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
      try {
        return await fn();
      } catch (error: any) {
        if (error.status === 429 && retries > 0) {
          const retryAfter = Number.parseInt(
            error.response.headers["retry-after"] || "1",
            10
          );
          setRetryAfter(retryAfter);
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          return fetchWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
      }
    },
    []
  );

  const handleResize = () => {
    if (isExpanded) {
      setWidth("300px");
    } else {
      setWidth("80%");
    }
    setIsExpanded(!isExpanded);
  };

  const formatCommitDate = (dateString: any) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd MMM.");
  };

  const getCommitColor = (sha: any) => {
    const colors = ["bg-green-200", "bg-purple-200", "bg-blue-200"];
    return colors[sha.charCodeAt(0) % colors.length];
  };

  // Fetch project data
  // Use repoData to set project data
  useEffect(() => {
    if (!repoData) return;

    // Set the project from repoData
    setProjects([repoData]);

    // Set project data directly from repoData
    setProjectData({
      projectOwner: session?.user?.username,
      project_repository: repoData.project_repository,
    });
  }, [repoData]);

  // Fetch repository details, contributors, languages, readme, and commits in one useEffect
  useEffect(() => {
    if (!repoData || !octokit) return;

    const fetchRepositoryDetails = async () => {
      try {
        try {
          await octokit.request("GET /user");
        } catch (error: any) {
          return;
        }

        const headers = { "X-GitHub-Api-Version": "2022-11-28" };
        const baseParams = {
          owner: session?.user?.username,
          repo: repoData.project_repository,
          headers,
        };

        const [
          contributorsResponse,
          languagesResponse,
          commitsResponse,
          readmeResponse,
        ] = await Promise.all([
          octokit.request(
            `GET /repos/${session?.user?.username}/${repoData.project_repository}/collaborators`,
            {
              owner: session?.user?.username,
              repo: repoData.project_repository,
            }
          ),
          octokit.request(
            `/repos/${session?.user?.username}/${repoData.project_repository}/languages`,
            {
              owner: session?.user?.username,
              repo: repoData.project_repository,
            }
          ),
          octokit.request(
            `/repos/${session?.user?.username}/${repoData.project_repository}/commits`,
            {
              owner: session?.user?.username,
              repo: repoData.project_repository,
            }
          ),
          octokit.request(
            `/repos/${session?.user?.username}/${repoData.project_repository}/readme`,
            {
              owner: session?.user?.username,
              repo: repoData.project_repository,
              headers,
            }
          ),
        ]);

        setContributors(contributorsResponse.data);
        console.log(
          repoData.contributors.filter(
            (collab: any) =>
              collab.permissions?.admin === true ||
              collab.permissions?.maintain === true
          ),
          "dhasadhsdhashda"
        );

        setLanguages(languagesResponse.data);

        const readmeContent = Buffer.from(
          readmeResponse.data.content,
          "base64"
        ).toString("utf-8");
        setRepoValue([
          {
            ...readmeResponse.data,
            content: readmeContent,
            __html: readmeContent,
          },
        ]);

        setCommitData(commitsResponse.data);
      } catch (error: any) {
        if (error.status === 429) {
          setRateLimitExceeded(true);
          const retry = error.response?.headers?.["retry-after"] || 60;
          setRetryAfter(Number.parseInt(retry, 10));
        }
      }
    };

    fetchRepositoryDetails();
  }, [repoData, octokit]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(
          `/api/likes?userId=${session?.user?.username}&projectName=${Repo}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Fetched likes data:", data);
        if (data && data.projects) {
          setLikes(data.projects.length);
          setLiked(
            data.projects.some(
              (like: any) => like.userId === session?.user?.username
            )
          );
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [likes, session, Repo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            isMobile
              ? "ml-0 w-full"
              : isShrunk
              ? "md:ml-[4rem] md:w-[calc(100%_-_4rem)]"
              : "md:ml-[16rem] md:w-[calc(100%_-_16rem)]"
          }`}
        >
          <Topbar />
          <div className="px-4 py-8 flex pt-20 flex-col lg:flex-row">
            <div className={`${isMobile ? "w-full mb-6" : "w-[300px]"}`}>
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-2 flex space-x-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="w-16 h-4 ml-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-2 w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="w-12 h-4 ml-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                isMobile ? "w-full" : "w-[calc(98%_-_320px)] pt-4 ml-[20px]"
              }`}
            >
              <div className="space-y-6">
                <div>
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-4 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-2 h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                <div className="p-4 border-2 dark:border-custom-dark-gray rounded-md">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                  <div className="mt-3 h-4 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                <div className="border-2 dark:border-custom-dark-gray rounded-xl p-4">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 border-2 dark:border-custom-dark-gray rounded-xl"
                      >
                        <div className="flex justify-between">
                          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="flex">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="w-6 h-6 -ml-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-300 dark:border-custom-dark-gray rounded-lg p-4">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                          <div className="ml-3 h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!repoData) {
    return <div>Project not found</div>;
  }

  const assignIssue = async (comment: string, skills: string) => {
    const owner = repoData?.projectOwner;
    const repo = repoData?.project_repository;

    alert(`${owner},${repo},${skills},${comment}`);

    try {
      await octokit.request(
        `POST /repos/${owner}/${repo}/issues/${isIssueNumber}/comments`,
        {
          owner,
          repo,
          issue_number: Number.parseInt(isIssueNumber as string),
          body: comment,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
    } finally {
      if (session) {
        alert(`Request Details:
              • Repository: ${repo}
              • Username: ${(session?.user as any)?.username}
              • Issue Number: ${isIssueNumber}
              • Status: pending
              • Skills: ${JSON.stringify(skills)}
              • Project Owner: ${repoData?.projectOwner}
              • Email: ${(session?.user as any)?.email}
              • Request Date: ${new Date().toISOString()}
              • Avatar: ${(session?.user as any)?.image}
              • Project Name: ${repoData.projectName}
              • Comment: ${comment}
              • Test: TESTING`);

        await fetch("/api/contributorRequests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: repo,
            Contributor_id: (session?.user as any)?.username as string,
            issue: isIssueNumber,
            status: "pending",
            skills: skills,
            projectOwner: repoData?.projectOwner,
            contributor_email: (session?.user as any)?.email as string,
            requestDate: new Date().toISOString(),
            image_url: (session?.user as any)?.image as string,
            name: repoData.projectName,
            description: comment,
          }),
        });
      }
    }
  };

  const totalBytes = repoData?.languages
    ? Object.values(repoData?.languages).reduce(
        (acc: number, bytes) =>
          acc + (typeof bytes === "number" ? bytes : Number(bytes) || 0),
        0
      )
    : 0;

  const languagePercentages: { [key: string]: number } = {};
  if (repoData?.languages && Object.keys(repoData?.languages).length > 0) {
    for (const [lang, bytes] of Object.entries(repoData?.languages)) {
      const byteValue = typeof bytes === "number" ? bytes : Number(bytes) || 0;
      languagePercentages[lang] = Number.parseFloat(
        ((byteValue / totalBytes) * 100).toFixed(1)
      );
    }
  }

  const addLikes = async () => {
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.username,
          projectName: Repo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add like");
      }

      const data = await response.json();
      console.log("Like added successfully:", data);
      setLikes(likes + 1);
      setLiked(true);
    } catch (error) {
      console.error("Error adding likes:", error);
    }
  };

  const deleteLike = async () => {
    try {
      const response = await fetch("/api/likes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.username,
          projectName: Repo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete like");
      }

      const data = await response.json();
      console.log("Like deleted successfully:", data);
      setLikes(likes - 1);
      setLiked(false);
    } catch (error) {
      console.error("Error deleting like:", error);
    }
  };

  const handleLikeClick = () => {
    if (liked) {
      setLikes(likes - 1);
      deleteLike();
    } else {
      setLikes(likes + 1);
      addLikes();
    }
    setLiked(!liked);
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {rateLimitExceeded && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 dark:text-white text-black p-4 text-center z-50">
            Rate limit exceeded. Please wait {retryAfter} seconds before trying
            again.
          </div>
        )}
        <div className="flex min-h-screen">
          <Sidebar />
          <div
            className={`flex-1 transition-all duration-300 ${
              isMobile
                ? "ml-0 w-full"
                : isShrunk
                ? "md:ml-[4rem] md:w-[calc(100%_-_4rem)]"
                : "md:ml-[16rem] md:w-[calc(100%_-_16rem)]"
            }`}
          >
            <Topbar />
            <div
              className={`px-4 py-8 pt-20 ${
                isIssue && !isMobile ? `pr-[22%]` : ``
              } flex flex-col lg:flex-row`}
            >
              <div className={`${isMobile ? "w-full mb-6" : "w-[300px]"}`}>
                <div>
                  <img
                    src={repoData?.image_url || "/placeholder.svg"}
                    className="w-full rounded-xl"
                    alt="Project"
                  />
                  <hr className="text-gray-800 mt-4"></hr>
                  <div>
                    <h2 className="text-xl font-bold pt-4">Owner</h2>
                    <div className="flex pt-2 space-x-2 flex-wrap">
                      {repoData?.contributors
                        ?.filter(
                          (collab: any) =>
                            collab.permissions?.admin === true ||
                            collab.permissions?.maintain === true
                        )
                        ?.map((collab: any) => (
                          <div
                            key={collab.id}
                            className="flex items-center mb-2"
                          >
                            <img
                              src={collab.avatar_url || "/placeholder.svg"}
                              alt={collab.login}
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="px-3 text-sm">{collab.login}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <hr className="text-gray-800 mt-4"></hr>
                  <div>
                    <h2 className="text-xl font-bold pt-4">Contributors</h2>
                    <div className="pt-2 space-x-2">
                      <div className="flex space-x-2 flex-wrap">
                        {repoData?.contributors?.map((collab: any) => {
                          return (
                            <>
                              <div key={collab.id} className="flex">
                                <img
                                  src={collab.avatar_url || "/placeholder.svg"}
                                  alt={collab.login}
                                  className="w-7 h-7 rounded-full"
                                />
                              </div>
                            </>
                          );
                        })}
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {repoData?.contributors
                          ?.slice(0, isMobile ? 2 : 3)
                          .map((collab: any) => {
                            return (
                              <>
                                <div key={collab.id} className="flex">
                                  <p className="text-gray-700 dark:text-gray-100 text-[12px]">
                                    {collab.login}
                                  </p>
                                </div>
                              </>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  <hr className="text-gray-800 mt-4"></hr>
                  <div>
                    <h2 className="text-xl font-bold pt-4">Languages</h2>
                    <div className="pt-2 space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2 flex">
                        {languagePercentages &&
                          Object.entries(languagePercentages).map(
                            ([lang, percentage]: [string, number]) => {
                              let barColor;
                              switch (lang.toLowerCase()) {
                                case "typescript":
                                  barColor = "bg-blue-600";
                                  break;
                                case "javascript":
                                  barColor = "bg-yellow-400";
                                  break;
                                case "css":
                                  barColor = "bg-purple-600";
                                  break;
                                default:
                                  barColor = "bg-gray-500";
                              }

                              return (
                                <div
                                  key={lang}
                                  className={`h-2.5 ${barColor}`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${lang}: ${percentage}%`}
                                ></div>
                              );
                            }
                          )}
                      </div>
                      <div className="flex flex-wrap">
                        {languagePercentages &&
                          Object.entries(languagePercentages).map(
                            ([lang, percentage]: [string, number]) => {
                              let textColor, dotColor;
                              switch (lang.toLowerCase()) {
                                case "typescript":
                                  textColor =
                                    "text-blue-700 dark:text-blue-400";
                                  dotColor = "bg-blue-600";
                                  break;
                                case "javascript":
                                  textColor =
                                    "text-yellow-500 dark:text-yellow-300";
                                  dotColor = "bg-yellow-400";
                                  break;
                                case "css":
                                  textColor =
                                    "text-purple-700 dark:text-purple-400";
                                  dotColor = "bg-purple-600";
                                  break;
                                case "python":
                                  textColor =
                                    "text-green-600 dark:text-green-400";
                                  dotColor = "bg-green-500";
                                  break;
                                case "java":
                                  textColor = "text-red-600 dark:text-red-400";
                                  dotColor = "bg-red-500";
                                  break;
                                case "c++":
                                case "cpp":
                                  textColor =
                                    "text-pink-600 dark:text-pink-400";
                                  dotColor = "bg-pink-500";
                                  break;
                                case "c#":
                                case "csharp":
                                  textColor =
                                    "text-indigo-600 dark:text-indigo-400";
                                  dotColor = "bg-indigo-500";
                                  break;
                                case "ruby":
                                  textColor = "text-red-800 dark:text-red-500";
                                  dotColor = "bg-red-700";
                                  break;
                                case "go":
                                  textColor =
                                    "text-cyan-600 dark:text-cyan-400";
                                  dotColor = "bg-cyan-500";
                                  break;
                                case "swift":
                                  textColor =
                                    "text-orange-600 dark:text-orange-400";
                                  dotColor = "bg-orange-500";
                                  break;
                                case "kotlin":
                                  textColor =
                                    "text-purple-500 dark:text-purple-300";
                                  dotColor = "bg-purple-400";
                                  break;
                                case "html":
                                  textColor =
                                    "text-orange-700 dark:text-orange-500";
                                  dotColor = "bg-orange-600";
                                  break;
                                case "php":
                                  textColor =
                                    "text-indigo-500 dark:text-indigo-300";
                                  dotColor = "bg-indigo-400";
                                  break;
                                case "shell":
                                case "bash":
                                  textColor =
                                    "text-lime-600 dark:text-lime-400";
                                  dotColor = "bg-lime-500";
                                  break;
                                default:
                                  textColor =
                                    "text-gray-600 dark:text-gray-400";
                                  dotColor = "bg-gray-500";
                              }

                              return (
                                <div
                                  key={lang}
                                  className="flex items-center mr-4 mb-1"
                                >
                                  <div className="rounded-xl">
                                    <span
                                      className={`h-2.5 w-2.5 ${dotColor} rounded-full mr-1.5`}
                                    ></span>
                                  </div>
                                  <div
                                    className={`overflow-hidden text-sm rounded-full font-medium dark:text-white text-custom-gray`}
                                  >
                                    <span
                                      className={`${textColor} text-xl rounded-full mr-1.5`}
                                    >
                                      •
                                    </span>
                                    <span className="text-[14px]">{lang}</span>{" "}
                                    <span className="dark:text-custom-gray text-[14px] text-custom-gray">
                                      {percentage}%
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isMobile ? "w-full" : "w-[calc(98%_-_320px)] pt-4 ml-[20px]"
                }`}
              >
                <div>
                  <div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold break-words">
                          {repoData?.project_repository}
                        </h1>
                        <div
                          onClick={handleLikeClick}
                          className="flex items-center cursor-pointer shrink-0"
                        >
                          {liked ? (
                            <>
                              <Icon
                                icon="mdi:heart"
                                className="dark:text-red-300 text-red-800"
                                width="24"
                                height="24"
                              />
                            </>
                          ) : (
                            <Icon
                              icon="mdi:heart-outline"
                              className="text-neutral-400"
                              width="24"
                              height="24"
                            />
                          )}
                          <p className="text-xl ml-2">{likes}</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`dark:text-gray-300 text-gray-600 pt-4 h-[${width}] overflow-hidden`}
                    >
                      {repoData?.longdis}
                    </div>
                    <div className="mt-6 p-4 border-2 dark:border-custom-dark-gray rounded-md">
                      <h3 className="text-lg font-semibold mb-2">
                        AI Generated Project Summary:
                      </h3>
                      <div className="text-sm whitespace-pre-wrap">
                        <ReactMarkdown>
                          {isExpanded
                            ? repoData?.aiDescription || aiReply
                            : (repoData?.aiDescription || aiReply)?.slice(
                                0,
                                isMobile ? 150 : 250
                              ) +
                              ((repoData?.aiDescription || aiReply)?.length >
                              (isMobile ? 150 : 250)
                                ? "..."
                                : "")}
                        </ReactMarkdown>
                      </div>
                      <div className="text-center">
                        <button
                          onClick={handleResize}
                          className="text-center mt-3 text-blue-500 dark:text-blue-100 rounded px-2 py-1"
                        >
                          {isExpanded ? "Show Less" : "Show More"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-gray-300 dark:border-custom-dark-gray border-2 rounded-xl p-4 mt-7">
                    <div className="flex gap-2 my-auto">
                      <Icon
                        icon="mdi:alert-circle-outline"
                        width={24}
                        height={24}
                      />
                      <h1 className="text-xl font-bold">Issues</h1>
                    </div>
                    {issues && issues.length > 0 ? (
                      <>
                        {issues.map((issue: any) => (
                          <div
                            key={issue.id}
                            className="mt-2 p-4 border-gray-300 dark:border-custom-dark-gray border-2 rounded-xl"
                          >
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex   gap-2">
                                  <a
                                        href={`https://github.com/${projects[0]?.projectOwner}/${projects[0]?.project_repository}/issues/${issue.project_issues}`}
                                        className="bg-gray-100 dark:bg-custom-dark-gray rounded-full px-2 py-1 inline-flex items-center"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 16 16"
                                        >
                                          <path
                                            fill="currentColor"
                                            d="M8 6.1a.31.31 0 0 0-.45.32a2.47 2.47 0 0 0 .51 1.22l.15.13A3 3 0 0 1 9.08 10a3.63 3.63 0 0 1-3.55 3.44a3 3 0 0 1-2.11-.85a3 3 0 0 1-.85-2.22A3.55 3.55 0 0 1 3.63 8a3.66 3.66 0 0 1 1.5-.91A5.2 5.2 0 0 1 5 6v-.16a4.84 4.84 0 0 0-2.31 1.3a4.5 4.5 0 0 0-.2 6.37a4.16 4.16 0 0 0 3 1.22a4.8 4.8 0 0 0 3.38-1.42a4.52 4.52 0 0 0 .21-6.38A4.2 4.2 0 0 0 8 6.1"
                                          />
                                          <path
                                            fill="currentColor"
                                            d="M13.46 2.54a4.16 4.16 0 0 0-3-1.22a4.8 4.8 0 0 0-3.37 1.42a4.52 4.52 0 0 0-.21 6.38A4.2 4.2 0 0 0 8 9.9a.31.31 0 0 0 .45-.31a2.4 2.4 0 0 0-.52-1.23l-.15-.13A3 3 0 0 1 6.92 6a3.63 3.63 0 0 1 3.55-3.44a3 3 0 0 1 2.11.85a3 3 0 0 1 .85 2.22A3.55 3.55 0 0 1 12.37 8a3.66 3.66 0 0 1-1.5.91a5.2 5.2 0 0 1 .13 1.14v.16a4.84 4.84 0 0 0 2.31-1.3a4.5 4.5 0 0 0 .15-6.37"
                                          />
                                        </svg>
                                      </a>
                                  <h1 className="text-[18px] font-bold break-words">
                                    {issue.issue_name}
                                  </h1>
                                  {issue.priority && (
                                      <span
                                        className={` h-fit px-2 py-1 rounded-full text-xs font-medium ${
                                          issue.priority.toLowerCase() ===
                                          "hard"
                                            ? "bg-red-100 text-red-800"
                                            : issue.priority.toLowerCase() ===
                                              "medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {issue.priority}
                                      </span>
                                    )}
                                  <div className="flex gap-2 flex-wrap">
                                    
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {projects && issues ? (
                                    <>
                                    <div className="text-neutral-700 dark:text-neutral-300">
                                    {Math.floor(
                                      (new Date().getTime() -
                                        new Date(issue.issue_date).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days ago
                                    <p className="text-neutral-700 dark:text-neutral-300">
                                    Assigned to{" "}
                                    {issue.assignees &&
                                    issue.assignees.length > 0
                                      ? issue.assignees
                                          .slice(0, 2)
                                          .map(
                                            (assignee: any, index: number) => (
                                              <span key={assignee.id}>
                                                {index > 0 && ", "}
                                                <span className="px-[3px]">
                                                  {assignee.login}
                                                </span>
                                              </span>
                                            )
                                          )
                                      : "no one"}
                                    {issue.assignees &&
                                      issue.assignees.length > 2 &&
                                      "..."}
                                  </p>
                                  </div>
                                     
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                  {issue.assignees &&
                                  Array.isArray(issue.assignees)
                                    ? issue.assignees.map((assignee: any) => (
                                        <img
                                          key={assignee.id}
                                          src={
                                            assignee.avatar_url ||
                                            "/placeholder.svg"
                                          }
                                          alt={assignee.login}
                                          className="-mr-1 w-6 h-6 rounded-full"
                                        />
                                      ))
                                    : null}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                                  
                                  <div className="text-center sm:text-right flex">
                                    <Image src="/pharos_small.png" alt="Pharos Logo" width={24} height={24} className="mr-2" />
                                    <div className="dark:text-gray-300 text-xl text-gray-900 font-bold">
                                      {issue.rewardAmount} 
                                    </div>
                                     
                                  </div>
                                  
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  
                                  <div
                                    onClick={() => {
                                      setIssue(true);
                                      setIssueNumber(issue.project_issues);
                                    }}
                                  >
                                    <button className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded w-full sm:w-auto">
                                      Contribute Now
                                    </button>
                                  </div>
                                  
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No issues found for this repository.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 w-full border border-gray-300 dark:border-custom-dark-gray rounded-lg p-4">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-black">
                      Recent Activity
                    </h2>
                    {repoData?.comits &&
                    Array.isArray(repoData?.comits) &&
                    repoData?.comits.length > 0 ? (
                      <div className="space-y-2">
                        {repoData?.comits
                          .slice(0, isMobile ? 5 : 10)
                          .map((commit: any, index: number) => (
                            <div
                              key={commit.sha}
                              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 rounded"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <div
                                  className={`${getCommitColor(
                                    commit.sha
                                  )} dark:text-white text-black px-2 py-1 rounded-md mr-3 shrink-0`}
                                >
                                  <span className="text-xs text-white dark:text-black">
                                    {index + 2970}
                                  </span>
                                </div>
                                <a
                                  href={commit.html_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dark:text-white text-black hover:underline truncate"
                                >
                                  {commit.commit?.message?.split("\n")[0] ||
                                    "No commit message"}
                                </a>
                              </div>
                              <div className="text-gray-400 text-sm shrink-0">
                                {formatCommitDate(
                                  commit.commit?.committer?.date ||
                                    commit.commit?.author?.date ||
                                    new Date().toISOString()
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No recent commits found</p>
                    )}
                  </div>

                  {isIssue ? (
                    <>
                      <div
                        className={`dark:bg-[#0a0a0a] bg-white border-l border-custom-gray dark:border-custom-dark-gray fixed right-0 top-17 h-full p-6 shadow-lg z-40 ${
                          isMobile ? "w-full" : "w-[20%]"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold dark:text-white">
                            Get Assigned
                          </h3>
                          <button
                            onClick={() => setIssue(false)}
                            className="text-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const email = (e.target as HTMLFormElement).email
                              .value;
                            const skillsJson = JSON.stringify(skills);
                            assignIssue(`${email}`, skillsJson);
                          }}
                        >
                          <div>
                            <label
                              htmlFor="Comment"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Comment
                            </label>
                            <textarea
                              id="email"
                              name="email"
                              placeholder="Why Should We assign you the issue"
                              className="w-full bg-gray-200 dark:bg-[#0a0a0a] text-black dark:text-white border border-gray-700 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="skills"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Skills
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                id="skillInput"
                                placeholder="Add a skill"
                                className="flex-1 bg-gray-200 dark:bg-[#0a0a0a] border border-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const skillInput = document.getElementById(
                                    "skillInput"
                                  ) as HTMLInputElement;
                                  if (skillInput.value.trim()) {
                                    setSkills([
                                      ...skills,
                                      skillInput.value.trim(),
                                    ]);
                                    skillInput.value = "";
                                  }
                                }}
                                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                +
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm flex items-center"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSkills(
                                        skills.filter((_, i) => i !== index)
                                      )
                                    }
                                    className="ml-1 text-gray-400 hover:text-white focus:outline-none"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-custom-dark-gray dark:bg-gray-100 dark:text-black text-white px-4 py-2 rounded-md hover:bg-custom-dark-gray/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <></>
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

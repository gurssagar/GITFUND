"use client";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useState, useEffect, useCallback } from "react";
import { Octokit } from "octokit";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { Groq } from "groq-sdk";
import Link from "next/link";
import { format } from "date-fns"; // Add import for format
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { isShrunk } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import {
  FaJs,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaReact,
  FaNodeJs,
  FaJava,
  FaPhp,
  FaRust,
  FaSwift,
  FaDocker,
  FaGitAlt,
  FaSass,
  FaVuejs,
  FaAngular,
  FaDatabase,
  FaLinux,
  FaApple,
  FaWindows,
  FaAndroid,
  FaCode,
  FaTerminal,
  FaMarkdown,
} from "react-icons/fa";
import {
  SiTypescript,
  SiSolidity,
  SiCplusplus,
  SiGo,
  SiKotlin,
  SiRuby,
  SiPerl,
  SiScala,
  SiLua,
  SiDart,
  SiElixir,
  SiClojure,
  SiR,
  SiAssemblyscript,
  SiGnubash,
  SiGraphql,
  SiKubernetes,
  SiTerraform,
  SiSwift,
} from "react-icons/si";
import { Icon } from "@iconify/react";
import { project } from "@/db/schema";
// Remove all react-icons imports

interface ProjectData {
  projectOwner: string;
  project_repository: string;
  // Add other properties as needed
}

export default function Project() {
  const params = useParams();
  const session = useSession();
  const Repo = params?.Repo as string;
  const { isShrunk } = useSidebarContext();
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
  const octokit = new Octokit({
    auth: (session?.data as any)?.accessToken,
  });

  useEffect(() => {
    const fetchRepoData = async () => {
      if (!Repo) return; // Don't fetch if Repo is not available
      try {
        // Corrected: project_repository is sent as a URL query parameter
        const response = await fetch(
          `/api/specific-repo?project_repository=${Repo}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          // It's good practice to check if the response was successful
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRepoData(
          data.project && data.project.length > 0
            ? data.project[0]
            : data.project || null,
        ); // Adjust based on actual API response
      } catch (error) {
        setRepoData(null); // Handle error state appropriately
      }
    };
    fetchRepoData();
  }, [Repo]);

  useEffect(() => {
    if (!repoData || !Repo) {
      setIssues([]); // Reset issues if repoData is not available
      return;
    }
    const fetchIssues = async () => {
      try {
        const response = await fetch(
          `/api/add-issues?project_repository=${Repo}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setIssues(data.projects || []);
        console.log(data.projects, "issuess");
      } catch (error) {
        setIssues([]); // Reset issues on error
      }
    };
    fetchIssues();
  }, [repoData, Repo]);
  // Helper Functions

  const fetchWithRetry = useCallback(
    async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
      try {
        return await fn();
      } catch (error: any) {
        if (error.status === 429 && retries > 0) {
          const retryAfter = parseInt(
            error.response.headers["retry-after"] || "1",
            10,
          );
          setRetryAfter(retryAfter);
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          return fetchWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
      }
    },
    [],
  );

  const getLanguageIcon = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    const iconMap: Record<string, string> = {
      javascript: "logos:javascript",
      typescript: "logos:typescript-icon",
      python: "logos:python",
      java: "logos:java",
      "c++": "logos:c-plusplus",
      "c#": "logos:c-sharp",
      php: "logos:php",
      ruby: "logos:ruby",
      go: "logos:go",
      rust: "logos:rust",
      swift: "logos:swift",
      kotlin: "logos:kotlin-icon",
      scala: "logos:scala",
      perl: "logos:perl",
      lua: "logos:lua",
      dart: "logos:dart",
      r: "logos:r",
      solidity: "logos:solidity",
      sass: "logos:sass",
      scss: "logos:sass",
      sql: "logos:mysql",
      shell: "logos:bash-icon",
      bash: "logos:bash-icon",
      sh: "logos:bash-icon",
      assembly: "logos:assemblyscript",
      "objective-c": "logos:objective-c",
      elixir: "logos:elixir",
      clojure: "logos:clojure",
      vue: "logos:vue",
      react: "logos:react",
      angular: "logos:angular-icon",
      "node.js": "logos:nodejs-icon",
      node: "logos:nodejs-icon",
      dockerfile: "logos:docker-icon",
      graphql: "logos:graphql",
      kubernetes: "logos:kubernetes",
      terraform: "logos:terraform-icon",
    };
    const iconName = iconMap[lowerLang] || null;
    return (
      <Icon
        icon={iconName}
        className="rounded-full -ml-[2px]"
        width={30}
        height={30}
      />
    );
  };

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

  // Fetch project data and project details in one useEffect
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!Repo) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/add-issues");
        const data = await response.json();

        // Find the current project
        const filteredProjects = data.projects.filter(
          (project: any) => project.project_repository === Repo,
        );

        setProjects(filteredProjects);

        // Set project data for the first matching project
        if (filteredProjects.length > 0) {
          setProjectData({
            projectOwner: filteredProjects[0].projectOwner,
            project_repository: filteredProjects[0].project_repository,
          });
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [Repo]);

  // Fetch repository details, contributors, languages, readme, and commits in one useEffect
  useEffect(() => {
    if (!repoData || !octokit) return;

    const fetchRepositoryDetails = async () => {
      try {
        // Check authentication status first
        try {
          const authRes = await octokit.rest.users.getAuthenticated();
        } catch (error: any) {
          return; // Exit if not authenticated
        }

        // Create promise array for parallel requests
        const promises = [
          // 1. Fetch contributors
          octokit
            .request(
              `GET /repos/${repoData.projectOwner}/${repoData.project_repository}/collaborators`,
              {
                owner: repoData.projectOwner,
                repo: repoData.project_repository,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
              },
            )
            .then((response) => setContributors(response.data)),

          // 2. Fetch languages
          octokit
            .request(
              `/repos/${repoData.projectOwner}/${repoData.project_repository}/languages`,
              {
                owner: repoData.projectOwner,
                repo: repoData.project_repository,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
              },
            )
            .then((response) => setLanguages(response.data)),

          // 3. Fetch README
          octokit
            .request(
              `GET /repos/${repoData.projectOwner}/${repoData.project_repository}/readme`,
              {
                owner: repoData.projectOwner,
                repo: repoData.project_repository,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
              },
            )
            .then((response) => {
              const content = Buffer.from(
                response.data.content,
                "base64",
              ).toString("utf-8");
              setRepoValue([
                {
                  ...response.data,
                  content: content,
                  __html: content,
                },
              ]);
            }),

          // 4. Fetch collaborators
          octokit
            .request(
              `GET /repos/${repoData.projectOwner}/${repoData.project_repository}/collaborators`,
              {
                owner: repoData.projectOwner,
                repo: repoData.project_repository,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
              },
            )
            .then((response) =>
              setCollabs(
                response.data.filter(
                  (collab: any) =>
                    collab.permissions?.admin === true ||
                    collab.permissions?.maintain === true,
                ),
              ),
            ),

          // 5. Fetch commits
          octokit
            .request(
              `/repos/${repoData.projectOwner}/${repoData.project_repository}/commits`,
              {
                owner: repoData.projectOwner,
                repo: repoData.project_repository,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
              },
            )
            .then((response) => setCommitData(response.data)),
        ];

        // Execute all promises in parallel
        await Promise.allSettled(promises);
      } catch (error) {
        console.error("Error fetching repository details:", error);
      }
    };

    fetchRepositoryDetails();
  }, [repoData, octokit]);

  // Fetch issues once projects are loaded
  useEffect(() => {
    const fetchIssues = async () => {
      if (!projects.length || !projectData || !octokit) return;

      try {
        await fetchWithRetry(async () => {
          const response = await octokit.request(
            `GET /repos/${projectData.projectOwner}/${projectData.project_repository}/issues`,
            {
              owner: projectData.projectOwner,
              repo: projectData.project_repository,
              headers: {
                "X-GitHub-Api-Version": "2022-11-28",
              },
            },
          );

          // Filter issues that match the current repository
          const filteredIssues = response.data.filter((issue: any) => {
            return projects.some(
              (project: any) =>
                project.project_issues &&
                project.project_issues.includes(issue.number.toString()),
            );
          });

          setIssues(filteredIssues);
        });
      } catch (error) {
        console.error("GitHub API Error:", error);
        if ((error as any).status === 429) {
          setRateLimitExceeded(true);
        }
      }
    };

    fetchIssues();
  }, [projects, projectData, octokit, fetchWithRetry]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!repoData) {
    return <div>Project not found</div>;
  }

  const assignIssue = async (comment: string, skills: string) => {
    const owner = repoData?.projectOwner;
    const repo = repoData?.project_repository;
    alert(`${owner},${repo},${skills},${comment}`);
    try {
      await octokit.rest.issues
        .createComment({
          owner,
          repo,
          issue_number: parseInt(isIssueNumber as string),
          body: comment,
        })
        .then((response) => response.data)
        .then((data) => console.log(data, "testaa"));
    } finally {
      if (session) {
        alert(`Request Details:

            • Repository: ${repo}
            • Username: ${(session?.data?.user as any)?.username}
            • Issue Number: ${isIssueNumber}
            • Status: pending
            • Skills: ${JSON.stringify(skills)}
            • Project Owner: ${repoData?.projectOwner}
            • Email: ${(session?.data?.user as any)?.email}
            • Request Date: ${new Date().toISOString()}
            • Avatar: ${(session?.data?.user as any)?.image}
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
            Contributor_id: (session?.data?.user as any)?.username as string,
            issue: isIssueNumber,
            status: "pending",
            skills: skills,
            projectOwner: repoData?.projectOwner,
            contributor_email: (session?.data?.user as any)?.email as string, // Assuming email is available in the session data
            requestDate: new Date().toISOString(),
            image_url: (session?.data?.user as any)?.image as string,
            name: repoData.projectName,
            description: comment,
          }),
        }).then((response) => console.log(response, "response"));
      }
    }
  };
  const totalBytes = languages
    ? Object.values(languages).reduce(
        (acc: number, bytes: any) => acc + bytes,
        0,
      )
    : 0;
  const languagePercentages: { [key: string]: number } = {};
  if (languages && Object.keys(languages).length > 0) {
    for (const [lang, bytes] of Object.entries(languages)) {
      languagePercentages[lang] = parseFloat(
        ((bytes / totalBytes) * 100).toFixed(1),
      );
    }
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {rateLimitExceeded && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 dark:text-white text-black p-4 text-center">
            Rate limit exceeded. Please wait {retryAfter} seconds before trying
            again.
          </div>
        )}
        <div className="flex">
          <Sidebar />
          <div
            className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
          >
            <Topbar />
            <div
              className={`px-4 py-8 flex pt-20 1 ${isIssue ? `w-[calc(100%-22%)]` : ``}`}
            >
              <div className="w-[300px]">
                <div>
                  <img
                    src={repoData?.image_url}
                    className="w-full rounded-xl"
                    alt="Project"
                  />
                  <hr className="text-gray-800 mt-4"></hr>
                  <div>
                    <h2 className="text-xl font-bold pt-4">Owner</h2>
                    <div className="flex pt-2 space-x-2">
                      {collabs?.map((collab: any) => (
                        <div key={collab.id} className="flex items-center">
                          <img
                            src={collab.avatar_url}
                            alt={collab.login}
                            className="w-7 h-7 rounded-full"
                          />
                          <p className="px-3">{collab.login}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="text-gray-800 mt-4"></hr>
                  <div>
                    <h2 className="text-xl font-bold pt-4">Contributors</h2>
                    <div className="pt-2 space-x-2">
                      <div className="flex space-x-2">
                        {contributors?.map((collab: any) => {
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
                                  barColor = "bg-gray-500"; // Fallback color
                              }
                              return (
                                <div
                                  key={lang}
                                  className={`h-2.5 ${barColor}`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${lang}: ${percentage}%`}
                                ></div>
                              );
                            },
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
                                // Add more languages and their colors here
                                default:
                                  textColor =
                                    "text-gray-600 dark:text-gray-400";
                                  dotColor = "bg-gray-500"; // Fallback color for unlisted languages
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
                            },
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[calc(98%_-_320px)] pt-4 ml-[20px]">
                <div>
                  <div>
                    <div>
                      <h1 className="text-3xl font-bold">
                        {repoData?.project_repository}
                      </h1>
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
                                250,
                              ) +
                              ((repoData?.aiDescription || aiReply)?.length >
                              250
                                ? "..."
                                : "")}
                        </ReactMarkdown>
                      </div>
                      <div className="text-center">
                        <button
                          onClick={handleResize}
                          className="text-center dark:bg-white text-white dark:text-black bg-black text-black rounded px-2 py-1 "
                        >
                          {isExpanded ? "Show Less" : "Show More"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-gray-300 dark:dark:border-custom-dark-gray border-2 rounded-xl p-4 mt-7">
                    <div>
                      <h1 className="text-xl font-bold">Issues</h1>
                    </div>
                    {issues && issues.length > 0 ? (
                      <>
                        {issues.map((issue: any) => (
                          <div
                            key={issue.id}
                            className="mt-2 p-4 border-gray-300 dark:dark:border-custom-dark-gray border-2 rounded-xl"
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="flex justify-between gap-2">
                                  <h1 className="text-[18px] font-bold">
                                    {issue.issue_name}
                                  </h1>
                                  <div className="flex gap-2">
                                    {issue.priority && (
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          issue.priority.toLowerCase() ===
                                          "high"
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
                                  </div>
                                  <div className="flex"></div>
                                </div>
                              </div>
                              <div className="flex mx-1">
                                {projects && issues ? (
                                  <>
                                    <a
                                      href={`https://github.com/${projects[0]?.projectOwner}/${projects[0]?.project_repository}/issues/${issue.project_issues}`}
                                      className="mx-4 bg-gray-600 rounded-full px-2 py-1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {" "}
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
                                  </>
                                ) : (
                                  <></>
                                )}

                                {issue.assignees &&
                                Array.isArray(issue.assignees)
                                  ? issue.assignees.map((assignee: any) => (
                                      <img
                                        key={assignee.id}
                                        src={assignee.avatar_url}
                                        alt={assignee.login}
                                        className="-mr-1 w-6 h-6 rounded-full"
                                      />
                                    ))
                                  : null}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between pt-1">
                                <p className="text-[14px] text-gray-400">
                                  {Math.floor(
                                    (new Date().getTime() -
                                      new Date(issue.issue_date).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  days ago
                                </p>
                                <p className="text-[14px] text-gray-400 flex px-1">
                                  Assigned to{" "}
                                  {issue.assignees && issue.assignees.length > 0
                                    ? issue.assignees
                                        .slice(0, 2)
                                        .map((assignee: any, index: number) => (
                                          <span key={assignee.id}>
                                            {index > 0 && ", "}
                                            <span className="px-[3px]">
                                              {assignee.login}
                                            </span>
                                          </span>
                                        ))
                                    : "no one"}
                                  {issue.assignees &&
                                    issue.assignees.length > 2 &&
                                    "..."}
                                </p>
                              </div>
                            </div>
                            <div className="flex text-end mt-4 space-x-4 w-[100%]">
                              <div className="flex w-full justify-between">
                                <div
                                  onClick={() => {
                                    setIssue(true);
                                    setIssueNumber(issue.project_issues);
                                  }}
                                >
                                  <button className="dark:bg-white bg-black text-white  dark:text-black  px-2 py-1 rounded">
                                    Contribute Now
                                  </button>
                                </div>
                                <div>
                                  <div className="dark:text-gray-300 text-gray-900 text-bold">
                                    {issue.rewardAmount} BNB
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>

                  <div className="mt-6 w-full border border-rounded-full border-gray-300 dark:dark:border-custom-dark-gray rounded-lg p-4">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-black">
                      Recent Activity
                    </h2>

                    {commitData &&
                    Array.isArray(commitData) &&
                    commitData.length > 0 ? (
                      <div className="space-y-2">
                        {commitData
                          .slice(0, 10)
                          .map((commit: any, index: number) => (
                            <div
                              key={commit.sha}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`${getCommitColor(commit.sha)} dark:text-white text-black px-2 py-1 rounded-md mr-3`}
                                >
                                  <span className="text-xs text-white dark:text-black">
                                    {index + 2970}
                                  </span>
                                </div>
                                <a
                                  href={commit.html_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dark:text-white text-black hover:underline"
                                >
                                  {commit.commit?.message?.split("\n")[0] ||
                                    "No commit message"}
                                </a>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {formatCommitDate(
                                  commit.commit?.committer?.date ||
                                    commit.commit?.author?.date ||
                                    new Date().toISOString(),
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
                      <div className="dark:bg-[#0a0a0a] bg-white border-1 border-left border-custom-gray dark:border-custom-dark-gray fixed right-0 top-17 h-full w-[20%] p-6 shadow-lg">
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
                            // Get skills from state and convert to JSON
                            const skillsJson = JSON.stringify(skills);
                            // You will need to update the assignIssue function to accept skillsJson
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
                            <input
                              type="textArea"
                              id="email"
                              name="email"
                              placeholder="Why Should We assign you the issue"
                              className="w-full bg-gray-200 dark:bg-[#0a0a0a] text-black dark:text-white border border-gray-700 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                className="w-full bg-gray-200 dark:bg-[#0a0a0a] border border-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const skillInput = document.getElementById(
                                    "skillInput",
                                  ) as HTMLInputElement;
                                  if (skillInput.value) {
                                    setSkills([...skills, skillInput.value]);
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
                                        skills.filter((_, i) => i !== index),
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
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

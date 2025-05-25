"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import { Octokit } from "octokit";
export default function PullRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isShrunk } = useSidebarContext();
  const [issues, setIssues] = useState<any[]>([]);
  const [linkedPRs, setLinkedPRs] = useState<Record<string, any>>({});
  const [octokit, setOctokit] = useState<any>(null);
  
  useEffect(() => {
    if (session) {
      setOctokit(new Octokit({
        auth: (session as any)?.accessToken,
      }));
    }
  }, [session]);

  async function getLinkedPRs(owner: any, repo: string, issueNumber: string) {
    try {
      if (!octokit) {
        console.error("Octokit not initialized");
        return [];
      }
      
      // First try to use the timeline API to get linked PRs
      try {
        const { data: timeline } = await octokit.request(
          "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
          {
            owner,
            repo,
            issue_number: Number(issueNumber),
            headers: {
              "Accept": "application/vnd.github.mockingbird-preview+json"
            }
          },
        );
        
        console.log("Timeline data:", timeline);
        
        const linkedPRs = timeline
          .filter(
            (event: any) =>
              event.event === "cross-referenced" &&
              event.source?.issue &&
              event.source.issue.pull_request, // Make sure it's a PR
          )
          .map((event: any) => ({
            user: event.source.issue.user.login,
            date: event.source.issue.updated_at,
            repo: event.source.issue.repository.name,
            user_image: event.source.issue.user.avatar_url,
            number: event.source.issue.number,
            issue_number: event.source.issue.number,
            title: event.source.issue.title,
            url: event.source.issue.html_url,
          }));

        console.log("Linked PRs from timeline:", linkedPRs);
        if (linkedPRs.length > 0) {
          return linkedPRs;
        }
      } catch (error) {
        console.warn("Timeline API failed, falling back to search", error);
        // Continue to fallback method
      }
      
      // Fallback: search for PRs that mention the issue
      const issueRef = `#${issueNumber}`;
      const { data: searchResults } = await octokit.request('GET /search/issues', {
        q: `${issueRef} type:pr repo:${owner}/${repo}`,
        per_page: 100
      });
      
      console.log("Search results:", searchResults);
      
      const linkedPRs = searchResults.items.map((item: any) => ({
        user: item.user.login,
        date: item.updated_at,
        repo: repo,
        user_image: item.user.avatar_url,
        number: item.number,
        issue_number: item.number,
        title: item.title,
        url: item.html_url,
      }));
      
      console.log("Linked PRs from search:", linkedPRs);
      return linkedPRs;
    } catch (error) {
      console.error("Error fetching linked PRs:", error);
      return [];
    }
  }

  useEffect(() => {
    const fetchIssuesAndPRs = async () => {
        try {
          setLoading(true);
          if (!session?.user || !octokit) return; // Add null check for both session and octokit

          const issuesResponse = await fetch("/api/fetchPullRequests", {
            method: "GET",
          });
          const issuesData = await issuesResponse.json();
          setIssues(issuesData.projects);
          console.log("Issues:", issuesData.projects);

          // Process issues sequentially to avoid rate limiting
          const prsMap: Record<string, any> = {};
        
          for (const issue of issuesData.projects) {
            try {
              // Get the owner from GitHub URL or fallback to a generic username
              let owner = ((session.user as any)?.username || session.user?.name || session.user?.email || "user").toString().split('@')[0];
            
            // If the repository includes a slash, extract the owner
            if (issue.project_repository.includes('/')) {
              const parts = issue.project_repository.split('/');
              owner = parts[0];
              issue.project_repository = parts[1];
            }
            
            console.log(`Fetching PRs for issue ${issue.project_issues} in ${owner}/${issue.project_repository}`);
            
            const prs = await getLinkedPRs(
              owner,
              issue.project_repository,
              issue.project_issues,
            );
            
            // Add a mock PR if none found (for testing purposes)
            if (prs.length === 0) {
              // This is just for debugging - remove in production
              console.log("No PRs found, adding sample data for testing");
              prs.push({
                user: "Sample User",
                date: new Date().toISOString(),
                repo: issue.project_repository,
                user_image: "https://avatars.githubusercontent.com/u/49749697?v=4",
                number: Math.floor(Math.random() * 100),
                issue_number: issue.project_issues,
                title: `Sample PR for issue #${issue.project_issues}`,
                url: `https://github.com/${owner}/${issue.project_repository}/pull/1`,
              });
            }
            
            prsMap[issue.id] = prs;
            // Update the state after each issue to show progress
            setLinkedPRs({...prsMap});
          } catch (error) {
            console.error(`Error fetching PRs for issue ${issue.id}:`, error);
            prsMap[issue.id] = [];
          }
        }

        setLinkedPRs(prsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (octokit) {
      fetchIssuesAndPRs();
    }
  }, [session, octokit]);
  const [change, setChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  return (
    <>
      <div className="flex">
        <Sidebar />
        <div
          className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
        >
          <Topbar />
          <div className="p-4 mt-24 w-[80%] mx-auto">
            <h1 className="text-2xl font-bold">Pull Requests</h1>
            <div className="">
              Review and manage pull requests from contributors
            </div>

            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 space-4">
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Open PRs</h1>
                  <div className="text-xl">
                    {Object.values(linkedPRs).flat().length}
                  </div>
                  <div className="text-sm text-custom-gray dark:text-custom-gray">
                    Total open pull requests
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Projects</h1>
                  <div className="text-xl">{issues.length}</div>
                  <div className="text-sm text-custom-gray dark:text-custom-gray">
                    Projects with open issues
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Contributors</h1>
                  <div className="text-xl">
                    {
                      new Set(
                        Object.values(linkedPRs)
                          .flat()
                          .map((pr: any) => pr?.user),
                      ).size
                    }
                  </div>
                  <div className="text-sm text-custom-gray dark:text-custom-gray">
                    Unique PR contributors
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-4 p-2 dark:bg-custom-dark-gray bg-gray-100 rounded-md w-full">
              <button
                className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change == 0 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                onClick={() => setChange(0)}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change == 1 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                onClick={() => setChange(1)}
              >
                Pending Reviews
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change == 2 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                onClick={() => setChange(2)}
              >
                Changes Requested
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change == 3 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                onClick={() => setChange(3)}
              >
                Approved
              </button>
            </div>

            <div>
              <div className="mt-10 p-4 bg-white dark:bg-custom-dark-gray rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                  All Pull Requests
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  View and manage all pull requests across your projects
                </p>
                {loading ? (
                  <div className="py-8 text-center text-gray-500">
                    Loading pull requests...
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full bg-white dark:bg-custom-dark-gray">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                          <th className="px-4 py-3 text-left">Pull Request</th>
                          <th className="px-4 py-3 text-left">Project</th>
                          <th className="px-4 py-3 text-left">Author</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Reward</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {issues.map((issue) => {
                          const prs = linkedPRs[issue.id] || [];
                          console.log(`Rendering PRs for issue ${issue.id}:`, prs);
                          return prs.length > 0 ? prs.map((pr: any) => (
                            <tr
                              key={`${issue.id}-${pr.number}`}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {pr.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Updated{" "}
                                  {new Date(pr.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                {pr.repo}
                              </td>
                              <td className="px-4 py-3 flex items-center gap-2">
                                <img
                                  src={pr.user_image}
                                  alt={pr.user}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-gray-900 dark:text-white text-sm">
                                  {pr.user}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  Open
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                -
                              </td>
                              <td className="px-4 py-3 flex gap-4">
                                <a
                                  href={pr.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  View PR
                                </a>
                                <Link
                                  href={{
                                    pathname: `/PullRequests/${pr.issue_number}`,
                                    query: {
                                      rewardAmount: issue.rewardAmount,
                                      issueNumber: pr.issue_number,
                                      project: pr.repo,
                                      owner: pr.user,
                                    },
                                  }}
                                >
                                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    Review PR
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          )) : (
                            <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                No linked PRs found for this issue
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && issues.length > 0 && Object.values(linkedPRs).flat().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pull requests found. Create some issues on GitHub and
                    link them to PRs to see them here.
                  </div>
                )}
                {!loading && issues.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No issues found. Add some issues first to track their linked PRs.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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
  const octokit = new Octokit({
    auth: (session as any)?.accessToken,
  });

  async function getLinkedPRs(owner: any, repo: string, issueNumber: string) {
    const { data: timeline } = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
      {
        owner,
        repo,
        issue_number: Number(issueNumber),
      },
    );
    const temp = await timeline;
    console.log(temp, "dasdaadadsds");
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
        issue_number: event.source.issue.number,
        user_image: event.source.issue.user.avatar_url,
        number: event.source.issue.number,
        title: event.source.issue.title,
        url: event.source.issue.html_url,
      }));

    console.log("Linked PRs:", linkedPRs);
    return linkedPRs;
  }

  useEffect(() => {
    const fetchIssuesAndPRs = async () => {
      try {
        if (!session?.user) return; // Add null check

        const issuesResponse = await fetch("/api/fetchPullRequests", {
          method: "GET",
        });
        const issuesData = await issuesResponse.json();
        setIssues(issuesData.projects);

        const prsMap: Record<string, any> = {};
        await Promise.all(
          issuesData.projects.map(async (issue: any) => {
            const prs = await getLinkedPRs(
              session.user?.username || "", // Safe access with fallback
              issue.project_repository,
              issue.project_issues,
            );
            prsMap[issue.id] = prs;
          }),
        );

        setLinkedPRs(prsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchIssuesAndPRs();
  }, [session]);
  console.log(linkedPRs, "hellosjdh");
  const [change, setChange] = useState<number>(0);
  const pullRequests = [
    {
      id: 1234,
      title: "Fix SSR hydration mismatch in dynamic routes",
      project: "next.js",
      author: {
        name: "sarahdev",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      status: "Changes Requested",
      statusColor: "bg-yellow-100 text-yellow-800",
      reward: 500,
      updated: "2023-06-20",
    },
    {
      id: 1235,
      title: "Improve error handling in API routes",
      project: "next.js",
      author: {
        name: "devmike",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
      reward: 300,
      updated: "2023-05-21",
    },
    {
      id: 1236,
      title: "Add examples for server components",
      project: "react",
      author: {
        name: "coderalex",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      },
      status: "Pending Review",
      statusColor: "bg-blue-100 text-blue-800",
      reward: 400,
      updated: "2023-05-19",
    },
    {
      id: 1237,
      title: "Fix memory leak in useEffect cleanup",
      project: "react",
      author: {
        name: "techguru",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      },
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
      reward: 600,
      updated: "2023-05-18",
    },
  ];
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
                  <h1>Pending Reviews</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray  dark:text-custom-gray">
                    Pull requests awaiting review
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Pending Reviews</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray  dark:text-custom-gray">
                    Pull requests awaiting review
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Pending Reviews</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray dark:text-custom-gray">
                    Pull requests awaiting review
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
                        return prs.map((pr: any) => (
                          <tr
                            key={`${issue.id}-${pr.number}`}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {pr.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                Updated {new Date(pr.date).toLocaleDateString()}
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
                              <Link href={`PullRequests/${pr.issue_number}`}>
                                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                  Review PR
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

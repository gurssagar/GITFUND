"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Octokit } from "octokit";

export default function PullRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isShrunk } = useSidebarContext();
  const [repoData, setRepoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoize username to prevent unnecessary re-renders
  const username = useMemo(
    () => (session?.user as any)?.username,
    [session?.user]
  );

  // Memoize Octokit instance to prevent recreation on every render
  const octokit = useMemo(() => {
    if (!(session as any)?.accessToken) return null;
    return new Octokit({
      auth: (session as any)?.accessToken,
    });
  }, [(session as any)?.accessToken]);

  // Memoize date formatting options
  const dateFormatOptions = useMemo(
    () =>
      ({
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      } as Intl.DateTimeFormatOptions),
    []
  );

  // Memoized fetch function to prevent recreation on every render
  const fetchData = useCallback(async () => {
    if (!username || isLoading) return;
    setIsLoading(false);
    try {
      const response = await fetch(
        `/api/contributorRequests/?projectOwner=${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRepoData(data.project);
      console.log(data.project, "repoDatas");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [username, isLoading]);

  // Use useEffect with proper dependencies to prevent infinite loops
  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username, fetchData]);

  // Memoized update function
  const updateRequestStatus = useCallback(
    async (id: number, newStatus: string) => {
      try {
        const response = await fetch("/api/contributorRequests", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            status: newStatus,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
        const result = await response.json();
        // Update local state to reflect the change immediately
        setRepoData((prevData) => prevData.filter((item) => item.id !== id));
        return result;
      } catch (error) {
        console.error("Error updating status:", error);
        throw error;
      }
    },
    []
  );

  // Memoized assignees function
  const assignees = useCallback(
    async (
      owner: string,
      repo: string,
      issue_number: string,
      assignees: string
    ) => {
      if (!octokit) return;
      console.log(owner, repo, issue_number, assignees, "starts");
      try {
        const response = await octokit.request(
          "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
          {
            owner,
            repo,
            issue_number: Number.parseInt(issue_number, 10),
            assignees: [assignees],
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
        console.log(response, "assigneddsds");
      } catch (error) {
        console.error("Error assigning user:", error);
      }
    },
    [octokit]
  );

  // Memoized stats calculations
  const stats = useMemo(() => {
    const pendingRequests = repoData.filter(
      (req) => req.status === "pending"
    ).length;
    const approvedThisMonth = repoData.filter((req) => {
      const requestDate = new Date(req.requestDate);
      const now = new Date();
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      return req.status === "approved" && requestDate >= monthAgo;
    }).length;
    // Calculate rejection rate (placeholder logic)
    const rejectionRate =
      repoData.length > 0
        ? Math.round(
            (repoData.filter((req) => req.status === "rejected").length /
              repoData.length) *
              100
          )
        : 0;
    return {
      pending: pendingRequests,
      approved: approvedThisMonth,
      rejectionRate: rejectionRate,
    };
  }, [repoData]);

  // Memoized container class
  const containerClass = useMemo(
    () =>
      `${
        isMobile
          ? "ml-0 w-full"
          : isShrunk
          ? "ml-[4rem] w-[calc(100%_-_4rem)]"
          : "ml-[16rem] w-[calc(100%_-_16rem)]"
      }`,
    [isShrunk, isMobile]
  );

  // Memoized action handlers
  const handleApprove = useCallback(
    (req: any) => {
      updateRequestStatus(req.id, "assigned");
      assignees(
        req.projectOwner,
        req.projectName,
        req.issue,
        req.Contributor_id
      );
    },
    [updateRequestStatus, assignees]
  );

  const handleReject = useCallback(
    (req: any) => {
      updateRequestStatus(req.id, "rejected");
    },
    [updateRequestStatus]
  );

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className={containerClass}>
          <Topbar />
          <div className="p-4 sm:p-6 lg:p-8 mt-16 md:mt-24 w-full max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Contributor Requests
            </h1>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Review and approve requests from developers who want to contribute
              to your projects.
            </div>
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-100 dark:border-neutral-700 p-4 lg:p-5">
                  <h1 className="text-sm lg:text-base font-medium">
                    Pending Requests
                  </h1>
                  <div className="text-xl lg:text-2xl font-bold mt-1">
                    {stats.pending}
                  </div>
                  <div className="text-xs lg:text-sm text-custom-neutral dark:text-custom-neutral mt-1">
                    Requests awaiting your approval
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-100 dark:border-neutral-700 p-4 lg:p-5">
                  <h1 className="text-sm lg:text-base font-medium">
                    Approved This Month
                  </h1>
                  <div className="text-xl lg:text-2xl font-bold mt-1">
                    {stats.approved}
                  </div>
                  <div className="text-xs lg:text-sm text-custom-neutral dark:text-custom-neutral mt-1">
                    Contributors added in the last 30 days
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-100 dark:border-neutral-700 p-4 lg:p-5 sm:col-span-2 lg:col-span-1">
                  <h1 className="text-sm lg:text-base font-medium">
                    Rejection Rate
                  </h1>
                  <div className="text-xl lg:text-2xl font-bold mt-1">
                    {stats.rejectionRate}%
                  </div>
                  <div className="text-xs lg:text-sm text-custom-neutral dark:text-custom-neutral mt-1">
                    Based on the last 50 requests
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="mt-6 lg:mt-10 p-4 lg:p-6 bg-white dark:bg-black dark:border-neutral-900 border rounded-xl shadow-sm">
                <h2 className="text-lg lg:text-xl font-semibold mb-1 dark:text-white">
                  Pending Contributor Requests
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  Review and manage requests from developers who want to join
                  your projects
                </p>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-neutral-500">Loading...</div>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-4">
                      {repoData.map((req) => (
                        <div
                          key={req.id}
                          className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-800"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={req.image_url || "/placeholder.svg"}
                              alt={req.Contributor_id}
                              className="w-10 h-10 rounded-full bg-neutral-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-neutral-900 dark:text-white truncate">
                                {req.Contributor_id}
                              </div>
                              <div className="text-xs text-neutral-500 truncate">
                                {req.contributor_email}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-500">
                                Project:
                              </span>
                              <span className="text-sm font-medium text-neutral-900 dark:text-white truncate ml-2">
                                {req.projectName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-neutral-500">
                                Date:
                              </span>
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                {req.requestDate && (
                                  <span>
                                    {new Date(
                                      req.requestDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-sm text-neutral-500 mb-2">
                              Skills:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {req.skills.map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded-full p-2"
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(req)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-2"
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-2">
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-900">
                      <table className="min-w-full bg-white dark:bg-neutral">
                        <thead>
                          <tr className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900">
                            <th className="px-4 py-3 text-left">Contributor</th>
                            <th className="px-4 py-3 text-left">Project</th>
                            <th className="px-4 py-3 text-left">
                              Request Date
                            </th>
                            <th className="px-4 py-3 text-left">Skills</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                          {repoData.map((req) => (
                            <tr
                              key={req.id}
                              className="hover:bg-neutral-50 dark:bg-neutral-800"
                            >
                              <td className="px-4 py-3 flex items-center gap-3">
                                <img
                                  src={req.image_url || "/placeholder.svg"}
                                  alt={req.Contributor_id}
                                  className="w-8 h-8 rounded-full bg-neutral-200"
                                />
                                <div>
                                  <div className="font-medium text-neutral-900 dark:text-white">
                                    {req.Contributor_id}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {req.contributor_email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                                {req.projectName}
                              </td>
                              <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                                {req.requestDate && (
                                  <span>
                                    {new Date(
                                      req.requestDate
                                    ).toLocaleDateString(
                                      "en-US",
                                      dateFormatOptions
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {req.skills.map(
                                    (skill: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded-full text-xs font-medium"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(req)}
                                  className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded-full p-1"
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleReject(req)}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-1"
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1">
                                  <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

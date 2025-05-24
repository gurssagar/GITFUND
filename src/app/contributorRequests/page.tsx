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
import React from "react";
import { ConsoleLogWriter } from "drizzle-orm";
import { Octokit } from "octokit";
export default function PullRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isShrunk } = useSidebarContext();
  const [repoData, setRepoData] = useState<any[]>([]);
  const username = (session?.user as any)?.username;
  console.log(username, "sessisda");
  const octokit = new Octokit({
    auth: (session as any)?.accessToken,
  });
  const [change, setChange] = useState<number>(0);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/api/contributorRequests/?projectOwner=${(session?.user as any)?.username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setRepoData(data.project);
      console.log(repoData, "repoDatas");
      setChange(data.project.length);
    }
    fetchData();
  });

  const updateRequestStatus = async (id: number, newStatus: string) => {
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

      return await response.json();
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  // Format the date using JavaScript Date object
  const dateStr = "2025-05-23T16:26:35.883Z";
  const date = new Date(dateStr);

  // Format options
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions;

  const formattedDate = date.toLocaleDateString("en-US", options);
  // Output: "May 23, 2025, 04:26 PM"
  //
  //

  const assignees = async (
    owner: string,
    repo: string,
    issue_number: string,
    assignees: string,
  ) => {
    console.log(owner, repo, issue_number, assignees,"starts");
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
      {
        owner,
        repo,
        issue_number: parseInt(issue_number, 10),
        assignees: [assignees],
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    ).then(response => console.log(response,"assigneddsds"));
  };
  return (
    <>
      <div className="flex">
        <Sidebar />
        <div
          className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
        >
          <Topbar />
          <div className="p-4 mt-24 w-[80%] mx-auto">
            <h1 className="text-2xl font-bold">Contributor Requests</h1>
            <div className="">
              Review and approve requests from developers who want to contribute
              to your projects.
            </div>

            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 space-4">
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Pending Requests</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray  dark:text-custom-gray">
                    Requests awaiting your approval
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Approved This Month</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray  dark:text-custom-gray">
                    Contributors added in the last 30 days
                  </div>
                </div>
                <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                  <h1>Rejection Rate</h1>
                  <div className="text-xl ">1</div>
                  <div className="text-sm text-custom-gray dark:text-custom-gray">
                    Based on the last 50 requests
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mt-10 p-4 bg-white dark:bg-custom-dark-gray rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                  Pending Contributor Requests
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Review and manage requests from developers who want to join
                  your projects
                </p>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full bg-white dark:bg-custom-dark-gray">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left">Contributor</th>
                        <th className="px-4 py-3 text-left">Project </th>
                        <th className="px-4 py-3 text-left">Request Date </th>
                        <th className="px-4 py-3 text-left">Skills</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {repoData.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img
                              src={req.image_url}
                              alt={req.Contributor_id}
                              className="w-8 h-8 rounded-full bg-gray-200"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {req.Contributor_id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {req.contributor_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {req.projectName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {req.requestDate && (
                              <span>
                                {new Date(req.requestDate).toLocaleDateString(
                                  "en-US",
                                  options,
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {req.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                updateRequestStatus(req.id, "assigned");
                                assignees(
                                  req.projectOwner,
                                  req.projectName,
                                  req.issue,
                                  req.Contributor_id,
                                );
                              }}
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
                              onClick={() => {
                                updateRequestStatus(req.id, "rejected");
                              }}
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
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

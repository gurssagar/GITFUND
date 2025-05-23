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

export default function PullRequestsPage() {
  const session = useSession();
  const router = useRouter();
  const { isShrunk } = useSidebarContext();

  const [change, setChange] = useState<number>(0);
  
  const contributorRequests = [
    {
      id: 1,
      name: "sarahdev",
      email: "sarah@example.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      project: "next.js",
      date: "2023-05-20",
      skills: ["React", "TypeScript", "+1"],
    },
    {
      id: 2,
      name: "devmike",
      email: "mike@example.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      project: "react",
      date: "2023-05-18",
      skills: ["JavaScript", "React", "+1"],
    },
    {
      id: 3,
      name: "coderalex",
      email: "alex@example.com",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      project: "next.js",
      date: "2023-05-15",
      skills: ["Documentation", "Next.js", "+1"],
    },
  ];
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
                    {contributorRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3 flex items-center gap-3">
                            <img src={req.avatar} alt={req.name} className="w-8 h-8 rounded-full bg-gray-200" />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                <div className="text-xs text-gray-500">{req.email}</div>
                            </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{req.project}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{req.date}</td>
                            <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                                {req.skills.map((skill, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                                ))}
                            </div>
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2">
                            <button className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded-full p-1">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            </button>
                            <button className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-1">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
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





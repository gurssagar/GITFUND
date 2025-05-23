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

export default function PullRequestsPage() {
  const session = useSession();
  const router = useRouter();
  const { isShrunk } = useSidebarContext();
  
  const[change,setChange]=useState<number>(0)
  const pullRequests = [
    {
      id: 1234,
      title: "Fix SSR hydration mismatch in dynamic routes",
      project: "next.js",
      author: { name: "sarahdev", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      status: "Changes Requested",
      statusColor: "bg-yellow-100 text-yellow-800",
      reward: 500,
      updated: "2023-06-20",
    },
    {
      id: 1235,
      title: "Improve error handling in API routes",
      project: "next.js",
      author: { name: "devmike", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
      reward: 300,
      updated: "2023-05-21",
    },
    {
      id: 1236,
      title: "Add examples for server components",
      project: "react",
      author: { name: "coderalex", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
      status: "Pending Review",
      statusColor: "bg-blue-100 text-blue-800",
      reward: 400,
      updated: "2023-05-19",
    },
    {
      id: 1237,
      title: "Fix memory leak in useEffect cleanup",
      project: "react",
      author: { name: "techguru", avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
      reward: 600,
      updated: "2023-05-18",
    },
  ];
  return (
    <>
      <div className="flex">
      <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar/>
          <div className="p-4 mt-24 w-[80%] mx-auto">
            <h1 className="text-2xl font-bold">Pull Requests</h1>
            <div className="">Review and manage pull requests from contributors</div>

            <div className='py-4'>
              <div className='grid grid-cols-3 gap-4 space-4'>
                    <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                      <h1>Pending Reviews</h1>
                      <div className="text-xl ">1</div>
                      <div className="text-sm text-custom-gray  dark:text-custom-gray">Pull requests awaiting review</div>
                    </div>
                    <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                      <h1>Pending Reviews</h1>
                      <div className="text-xl ">1</div>
                      <div className="text-sm text-custom-gray  dark:text-custom-gray">Pull requests awaiting review</div>
                    </div>
                    <div className="rounded-lg border-1 border-gray-100 dark:border-custom-dark-gray p-5">
                      <h1>Pending Reviews</h1>
                      <div className="text-xl ">1</div>
                      <div className="text-sm text-custom-gray dark:text-custom-gray">Pull requests awaiting review</div>
                    </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-4 p-2 dark:bg-custom-dark-gray bg-gray-100 rounded-md w-full">
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change==0 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setChange(0)}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change==1 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setChange(1)}
                  >
                    Pending Reviews
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change==2 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setChange(2)}
                  >
                    Changes Requested
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none transition ${change==3 ? "bg-white dark:bg-black dark:text-white shadow text-black" : "text-gray-500"}`}
                    onClick={() => setChange(3)}
                  >
                    Approved
                  </button>
                  
            </div>

            <div>
            <div className="mt-10 p-4 bg-white dark:bg-custom-dark-gray rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">All Pull Requests</h2>
                <p className="text-sm text-gray-500 mb-4">View and manage all pull requests across your projects</p>
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
                      {pullRequests.map((pr) => (
                        <tr key={pr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{pr.title}</div>
                            <div className="text-xs text-gray-500">#{pr.id} · Updated {pr.updated}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.project}</td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <img src={pr.author.avatar} alt={pr.author.name} className="w-6 h-6 rounded-full" />
                            <span className="text-gray-900 dark:text-white text-sm">{pr.author.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pr.statusColor}`}>{pr.status}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">${pr.reward}</td>
                          <td className="px-4 py-3">
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
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

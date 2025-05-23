"use client"

import React from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
export default function PullRequestDetails() {
    const {isShrunk} = useSidebarContext();
  return (
    <div className="flex">
    <Sidebar/>
          <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
          <Topbar/>
            <div className="p-4 mt-24 w-[80%] mx-auto">
                <div className="max-w-5xl mx-auto mt-8">
                <div className="mb-4">
                    <a href="/PullRequests" className="text-sm text-gray-500 hover:underline">&larr; Back to Pull Requests</a>
                </div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fix SSR hydration mismatch in dynamic routes</h1>
                    <div className="text-sm text-gray-500 mt-1">#1234 opened by sarahdev on 2023-05-18</div>
                    </div>
                    <a href="#" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">View on GitHub</a>
                </div>
                <div className="flex gap-6 mt-6">
                    {/* Left: PR Details */}
                    <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M16 17v1a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1"/><path d="M9 12h12l-3-3m0 6l3-3"/></svg>
                        Pull Request Details
                        </h2>
                        <div className="text-gray-700 mb-3">This PR fixes the hydration mismatch that occurs when using dynamic routes with SSR.</div>
                        <div className="flex items-center gap-6 mb-2">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Status:</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">Open</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Review:</span>
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Changes Requested</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Project:</span>
                            <span className="text-gray-800">next.js</span>
                        </div>
                        </div>
                        <hr className="my-4" />
                        <div>
                        <div className="font-medium mb-2">Associated Issue</div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="font-semibold text-gray-900 mb-1">Fix SSR hydration mismatch</div>
                            <div className="text-sm text-gray-600 mb-2">There's a hydration mismatch when using dynamic data with SSR</div>
                            <div className="flex gap-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">Medium Difficulty</span>
                            <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs">High Priority</span>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">Reward: $500</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    {/* Right: Review Actions */}
                    <div className="w-80 flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                        <div className="font-semibold mb-3">Review Actions</div>
                        <div className="flex flex-col gap-2 mb-4">
                        <button className="w-full bg-black text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            Approve
                        </button>
                        <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 10.5V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-4.5"/><path d="M15 12l2-2-2-2"/></svg>
                            Request Changes
                        </button>
                        <button className="w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            Reject
                        </button>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 text-sm">
                        <div className="font-medium">Reward: $500</div>
                        <div className="text-gray-500">Will be paid upon merge</div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                {/* Tabs for Files Changed and Comments */}
                <div className="bg-white border border-gray-200 rounded-xl p-0 mb-6">
                  <div className="flex border-b border-gray-200">
                    <button className="flex-1 py-3 text-center font-medium text-gray-900 bg-gray-100 rounded-tl-xl focus:outline-none">Files Changed</button>
                    <button className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-900 focus:outline-none">Comments</button>
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-bold mb-1">Files Changed</div>
                    <div className="text-gray-500 text-sm mb-6">75 changes in 3 files</div>
                    {/* File Cards */}
                    <div className="space-y-6">
                      {/* File 1 */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                          packages/next/src/server/render.tsx
                          <span className="absolute right-4 top-4 bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">Modified</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span className="text-green-600 flex items-center gap-1"><span className="text-lg">+</span>15 additions</span>
                          <span className="text-red-500 flex items-center gap-1"><span className="text-lg">-</span>5 deletions</span>
                        </div>
                        <a href="#" className="text-blue-600 text-sm hover:underline mt-1">View changes on GitHub</a>
                      </div>
                      {/* File 2 */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                          packages/next/src/client/index.tsx
                          <span className="absolute right-4 top-4 bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">Modified</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span className="text-green-600 flex items-center gap-1"><span className="text-lg">+</span>8 additions</span>
                          <span className="text-red-500 flex items-center gap-1"><span className="text-lg">-</span>2 deletions</span>
                        </div>
                        <a href="#" className="text-blue-600 text-sm hover:underline mt-1">View changes on GitHub</a>
                      </div>
                      {/* File 3 */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                          test/integration/ssr-hydration/test/index.test.js
                          <span className="absolute right-4 top-4 bg-green-100 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">Added</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span className="text-green-600 flex items-center gap-1"><span className="text-lg">+</span>45 additions</span>
                          <span className="text-red-500 flex items-center gap-1"><span className="text-lg">-</span>0 deletions</span>
                        </div>
                        <a href="#" className="text-blue-600 text-sm hover:underline mt-1">View changes on GitHub</a>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
    </div>
  );
}
                
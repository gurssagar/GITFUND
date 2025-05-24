"use client";

import React from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { useSearchParams } from "next/navigation";
import { Octokit } from "octokit";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { config } from "@/config";

import { Session } from "next-auth"; // Import Session type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";

const contractAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "getUsernameBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "usernameToAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "usernameToBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const; // Example: [{ "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "username", "type": "string" } ], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }] as const;
const contractAddress =
  "0xf213a3ac05EA11Ec4C6fEcAf2614893A84ccb8dD" as `0x${string}`;

export default function PullRequestDetails() {
  const { data: session } = useSession();
  const [repoData, setRepoData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState("0.1");
  const [username, setUsername] = useState("");
  const [transactionState, setTransactionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null,
  );
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  //Get Contract Balance
  const { data: contractBalance, refetch: refetchContractBalance } =
    useReadContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "getBalance",
    });

  // Get username balance
  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getUsernameBalance",
    args: [username || ""],
    enabled: !!username,
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: transactionHash,
    });

  useEffect(() => {
    const req = async () => {
      await fetch("/api/signup", {
        method: "GET",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Failed to fetch data");
        })
        .then((data) => {
          for(i=0; i<data.length; i++){
            if(data[i].id===session?.user?.id){
              setWalletAddress(data[i].walletAddress);
            }
          }
         
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };
  }, []);

  
  const walletAddress = user?.map((user: any) => user.walletAddress);
  console.log(walletAddress);

  const octokit = new Octokit({
    auth: (session as any)?.accessToken,
  });
  const { isShrunk } = useSidebarContext();
  const searchParams = useSearchParams();
  const issueNumber = searchParams?.get("issueNumber");
  const project = searchParams?.get("project");
  const owner = searchParams?.get("owner");
  console.log(issueNumber);

  useEffect(() => {
    const fetchPRDetails = async () => {
      try {
        setLoading(true);
        const request = await octokit.request(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}",
          {
            owner: owner as string,
            repo: project as string,
            pull_number: parseInt(issueNumber as string),
          },
        );

        const response = await request;
        setRepoData(response.data);
        console.log(response.data, "whdashdhas");
      } catch (err) {
        console.error("Error fetching PR details:", err);
        setError("Failed to load pull request details");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && owner && project && issueNumber) {
      fetchPRDetails();
    }
  }, [session, owner, project, issueNumber, octokit]);

  // Your component JSX goes her

  return (
    <div className="flex">
      <Sidebar />
      <div
        className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
      >
        <Topbar />
        <div className="p-4 mt-24 w-[80%] mx-auto">
          <div className="max-w-5xl mx-auto mt-8">
            <div className="mb-4">
              <a
                href="/PullRequests"
                className="text-sm text-gray-500 hover:underline"
              >
                &larr; Back to Pull Requests
              </a>
            </div>

            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {repoData?.title}
                </h1>
                <div className="text-sm text-gray-500 mt-1">
                  #{repoData?.number} opened by {repoData?.user?.login} on{" "}
                  {new Date(repoData?.created_at).toLocaleDateString()}{" "}
                </div>
              </div>
              <a
                href="#"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                View on GitHub
              </a>
            </div>
            <div className="flex gap-6 mt-6">
              {/* Left: PR Details */}
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                  <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      className="text-gray-400"
                    >
                      <path d="M16 17v1a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1" />
                      <path d="M9 12h12l-3-3m0 6l3-3" />
                    </svg>
                    Pull Request Details
                  </h2>
                  <div className="text-gray-700 mb-3">
                    {repoData?.body || "No description provided"}
                  </div>
                  <div className="flex items-center gap-6 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          repoData?.state === "open"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {repoData?.state === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Merged:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          repoData?.merged
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {repoData?.merged ? "Merged" : "Not Merged"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Project:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {repoData?.head?.repo?.name}
                      </span>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div>
                    <div className="font-medium mb-2">Associated Issue</div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {repoData?.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {repoData?.body || "No description provided"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs">
                          Changes: {repoData?.changed_files} files
                        </span>
                        <span className="bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full text-xs">
                          +{repoData?.additions} additions
                        </span>
                        <span className="bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded-full text-xs">
                          -{repoData?.deletions} deletions
                        </span>
                        <span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
                          Commits: {repoData?.commits}
                        </span>
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
                    <a
                      href={`${repoData?.html_url}#submit-review`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-black text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium dark:bg-white dark:text-black"
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
                      Approve
                    </a>
                    <a
                      href={`${repoData?.html_url}#submit-review`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 font-medium dark:border-gray-600 dark:text-gray-300"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 10.5V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-4.5" />
                        <path d="M15 12l2-2-2-2" />
                      </svg>
                      Request Changes
                    </a>
                    <Link
                      href="/PullRequests"
                      className="w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-red-600"
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
                      Back to List
                    </Link>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <div className="font-medium">PR Stats</div>
                    <div className="text-gray-500">
                      Commits: {repoData?.commits}
                    </div>
                    <div className="text-gray-500">
                      Comments: {repoData?.comments}
                    </div>
                    <div className="text-gray-500">
                      Created:{" "}
                      {new Date(repoData?.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      Last Updated:{" "}
                      {new Date(repoData?.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs for Files Changed and Comments */}
          <div className="bg-white border border-gray-200 rounded-xl p-0 mb-6">
            <div className="flex border-b border-gray-200">
              <button className="flex-1 py-3 text-center font-medium text-gray-900 bg-gray-100 rounded-tl-xl focus:outline-none">
                Files Changed
              </button>
              <button className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-900 focus:outline-none">
                Comments
              </button>
            </div>
            <div className="p-6">
              <div className="text-xl font-bold mb-1">Files Changed</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {`${repoData?.changed_files} ${repoData?.changed_files === 1 ? "file" : "files"} changed with ${repoData?.additions} addition${repoData?.additions === 1 ? "" : "s"} and ${repoData?.deletions} deletion${repoData?.deletions === 1 ? "" : "s"}`}
              </div>
              {/* File Cards */}
              <div className="space-y-6">
                {/* Show real file changes if available */}
                {repoData?.changed_files > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 flex flex-col gap-2 relative">
                    <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <svg
                        className="w-5 h-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 4h16v16H4z" />
                      </svg>
                      README.md
                      <span className="absolute right-4 top-4 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                        Modified
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="text-lg">+</span>
                        {repoData?.additions} additions
                      </span>
                      <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                        <span className="text-lg">-</span>
                        {repoData?.deletions} deletions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`${repoData?.html_url}/files`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1"
                      >
                        View changes on GitHub
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                    No file changes available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

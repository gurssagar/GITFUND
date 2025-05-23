"use client";
import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSession } from "next-auth/react";
import { Octokit } from "octokit";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
// import { ethers } from 'ethers'; // ethers is still used by Octokit, but not directly for wallet interactions
// import { useWeb3 } from "../../assets/components/web3Context"; // Removed
// import { getContract } from "../../assets/components/contract"; // Removed
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"; // Added Wagmi hooks
import { parseEther } from "viem";
import { Session } from "next-auth"; // Import Session type

import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";

// !!! IMPORTANT: Define your contract ABI and address here !!!
const contractAbi = [
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
] as const; // Example: [{ "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "username", "type": "string" } ], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }] as const;
const contractAddress =
  "0x3710CA089C0dE6c871a9326602d86Fa68aDCDCad" as `0x${string}`;

// Define a custom session type that includes accessToken and a more specific user type
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null; // Assuming username might be part of the user object
  id?: string; // Or whatever type your user ID is
}

interface CustomSession extends Session {
  accessToken?: string;
  user?: CustomUser;
}

// Define interfaces for better type safety with Octokit and session data
interface GitHubUser {
  login: string;
  id: number;
  // Add other relevant user properties if needed
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  // Add other relevant repo properties
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  // Add other relevant issue properties
}

interface LanguageData {
  [language: string]: number;
}

interface Collaborator {
  login: string;
  id: number;
  // Add other relevant collaborator properties
}

interface SessionData {
  accessToken?: string;
  user?: {
    username?: string;
    email?: string;
    // Add other user properties from session if needed
  };
}

export default function Project() {
  const session = useSession();
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<string | undefined>();
  const [selectedRepo, setSelectedRepo] = useState<string | undefined>(); // Changed from any to string | undefined
  const [data, setData] = useState<Repo[]>([]); // Typed as an array of Repo objects
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedissue,setSelectedIssue]=useState<string| null>(); // Typed as an array of Issue objects
  const { isShrunk } = useSidebarContext();
  const { address, isConnected } = useAccount();
  const [issueTitle, setIssueTitle] = useState<string>(""); // Unused
  const [issueDescription, setIssueDescription] = useState<string>(""); // Unused
  const [issueCreatedAt, setIssueCreatedAt] = useState<string>(""); // Unused
  // const [contractBalance, setContractBalance] = useState<string>("0"); // Unused
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [issueData, setIssueData] = useState<any>(null);
  const octokit = new Octokit({ auth: token });

  // const [languages, setLanguages] = useState<LanguageData | undefined>(); // Removed
  // const [stars, setStars] = useState<number>(0); // Removed
  // const [forks, setForks] = useState<number>(0); // Removed
  // const [page,setPage]=useState<number>(1) // Unused
  // const [selectedRepos, setSelectedRepos] = useState<string[]>([]); // Removed, using selectedRepo for single selection
  const {
    data: writeData,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Set token and user from session
  useEffect(() => {
    if (session.data) {
      const sessionInfo = session.data as SessionData;
      setToken(sessionInfo.accessToken || "");
      setUser(sessionInfo.user?.username);
    }
  }, [session.data]);

  // Fetch repositories
  useEffect(() => {
    if (!token) return;

    const fetchRepos = async () => {
      try {
        // const octokit = new Octokit({ auth: token }); // Octokit not needed if fetching from own API
        const response = await fetch("/api/add-projects", { // Removed leading space
          method: "GET",
        });

        const responseData = await response.json();
        if (response.ok) {
          setData(responseData.project as Repo[]); // Cast to Repo[]
          console.log(responseData.project, "repos"); // Corrected log key
        } else {
          console.error("Error fetching repositories:", responseData.error || response.statusText);
          setData([]); // Set to empty array on error
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setData([]); // Set to empty array on error
      }
    };

    fetchRepos();
    // Removed fetchRepoLanguages as languages state is removed
  }, [token]); // Removed user and selectedRepo as dependencies as they are not used in this specific fetchRepos

  //fetch readme.md - REMOVED
  // const [repoValue, setRepoValue] = useState<string | undefined>(); 
  // useEffect(() => { ... });

  //ai reply - REMOVED
  // const [aiReply, setAiReply] = useState<string | undefined>();
  // useEffect(() => { ... });

  // Fetch issues for selected repo
  useEffect(() => {
    if (!token || !user || !selectedRepo) return;

    const fetchIssues = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues`,
          {
            owner: user, // Added owner explicitly, though often included in user/repo format
            repo: selectedRepo,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        );
        console.log(response.data, "issuess"); // Corrected log key for issue
        setIssues(response.data as Issue[]); // Cast to Issue[]
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]); // Set to empty array on error
      }
    };
    fetchIssues();
  }, [token, user, selectedRepo]);

 
  useEffect(()=> {
    const fetchIssueData = async () => {
      const response = await octokit.request(`GET /repos/${user}/${selectedRepo}/issues/${selectedissue}`, {
        owner:user,
        repo:selectedRepo,
        issue_number: selectedissue,
      });
      const issue = response.data;
      setIssueTitle(issue.title);
      setIssueDescription(issue.body);
      setIssueCreatedAt(issue.created_at);
      console.log("Issue Data:", issue);
      
    }
    fetchIssueData();
  },[selectedissue])
  console.log("Issue Title:", issueTitle);
  console.log("Issue Description:", issueDescription);
  console.log("Issue Created At:", issueCreatedAt);
  useEffect(() => {
    if (isConfirmed) {
      setAlertMessage("Deposit successful and project creation initiated!");
      // Potentially trigger the rest of the project creation logic here if it depends on successful deposit
      // For now, assuming the API call for add-issues will be part of the form submission logic after deposit.
      // fetchBalance(); // Re-fetch balance if implemented
    }
    if (confirmationError) {
      // Type assertion for error to access message property safely
      setAlertMessage(
        `Deposit failed: ${(confirmationError as Error).message}`,
      );
    }
    if (writeError) {
      setAlertMessage(
        `Transaction submission failed: ${(writeError as Error).message}`,
      );
    }
  }, [isConfirmed, confirmationError, writeError]);

  const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    // const fileInput = formData.get("projectImage") as File; // Removed, no image upload for issues

    // if (!repoValue) { // Removed, repoValue is removed
    //   console.error("Repository content is not available");
    //   setAlertMessage("Repository content is not available");
    //   return;
    // }
    if (
      !rewardAmount ||
      isNaN(Number(rewardAmount)) ||
      Number(rewardAmount) <= 0
    ) {
      setAlertMessage("Please enter a valid positive reward amount");
      return;
    }

    if (!isConnected || !address) {
      setAlertMessage("Connect your wallet first!");
      return;
    }

    if (
      !contractAddress ||
      !contractAbi ||
      (contractAbi as readonly any[]).length === 0
    ) {
      setAlertMessage("Contract address or ABI is not configured.");
      console.error("Contract address or ABI is not configured.");
      return;
    }

    try {
      const currentSession = session.data as CustomSession; // Use CustomSession type
      const username: string | undefined = currentSession?.user?.username;
      if (!username) {
        setAlertMessage("User session not found.");
        return;
      }

      console.log("Attempting to deposit with Wagmi...");
      console.log("Contract Address:", contractAddress);
      console.log("Reward Amount (string):", rewardAmount);
      console.log("Username:", username);

      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "deposit",
        args: [username],
        value: parseEther(rewardAmount),
      });

      if (isWritePending) {
        setAlertMessage("Processing deposit...");
      }

      


      await fetch("/api/add-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_name: issueTitle,
          issue_description: issueDescription,
          issue_date: issueCreatedAt,
          difficulty: formData.get("difficulty") as string,
          project_issues: formData.get("projectIssue") as string, // Corrected: form field name is projectIssue
          rewardAmount: rewardAmount, // This is from state, ensure it's what you intend
          priority: formData.get("priority") as string,
          project_repository: selectedRepo, // Use selectedRepo (single string) instead of selectedRepos (array)
          email: currentSession?.user?.email,
        }),
      });
      // Removed console.log with unused variables
      setAlertMessage("Issue submitted (after deposit initiated)!"); // Update message
    } catch (error) {
      console.error("Error in project creation or deposit:", error);
      // Check if error is an instance of Error to safely access message
      if (error instanceof Error) {
        setAlertMessage(`Error: ${error.message}`);
      } else {
        setAlertMessage(
          "An unexpected error occurred during project creation.",
        );
      }
    }
  };

  //collab - REMOVED
  // const [collabs, setCollabs] = useState<Collaborator[] | undefined>();
  // useEffect(() => { ... });

  // console.log(collabs, "collabs"); // Removed

  // const handleRepoSelection = (repoName: string) => { // Removed, as selectedRepos (plural) is removed
  //   setSelectedRepos(prevSelectedRepo =>
  //     prevSelectedRepo.includes(repoName)
  //       ? prevSelectedRepo.filter(name => name !== repoName)
  //       : [...prevSelectedRepo, repoName]
  //   );
  // };
  // Add selectedRepo as a dependency to log it whenever it change

  return (
    <>
      <Suspense>
        
        <div className="fixed bottom-20 right-10 z-[100]">
          {" "}
          {/* Ensure alert is on top */}
          {alertMessage && (
            <Alert
              className={
                isConfirmed
                  ? "bg-green-100 border-green-400 text-green-700"
                  : confirmationError || writeError
                    ? "bg-red-100 border-red-400 text-red-700"
                    : ""
              }
            >
              <AlertTitle>
                {isConfirmed
                  ? "Success"
                  : confirmationError || writeError
                    ? "Error"
                    : "Notice"}
              </AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}
          {(isWritePending || isConfirming) && (
            <Alert className="bg-blue-100 border-blue-400 text-blue-700">
              <AlertTitle>Processing Transaction</AlertTitle>
              <AlertDescription>
                {isWritePending &&
                  !isConfirming &&
                  "Please confirm in your wallet..."}
                {isConfirming && "Waiting for transaction confirmation..."}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex">
          <Sidebar />
          <div
            className={`transition-all duration-300 ease-in-out ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
          >
            <Topbar />
            
            <div className="mt-20 justify-center">
            <form onSubmit={addProject} className="p-10 mx-auto space-y-4">
                <div className="text-3xl mb-6">Issue Information</div>
                
                <div className="space-y-2 flex gap-4">
                  <div className="space-y-2 w-1/3">
                    <label className="text-[14px]" htmlFor="difficulty">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      className="dark:bg-[#0a0a0a] text-[14px] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      required
                    >
                      <option value="">Select difficulty</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2 w-1/3">
                    <label className="text-[14px]" htmlFor="priority">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      required
                    >
                      <option value="">Select The Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="w-1/3">
                    <label className="text-[14px]" htmlFor="rewardAmount">
                      Reward Amount in Pharos
                    </label>{" "}
                    {/* Changed htmlFor to rewardAmount to match id */}
                    <input
                      id="rewardAmount" // Changed id to rewardAmount
                      name="rewardAmount" // Changed name to rewardAmount
                      type="text" // Keep as text to allow decimal input, validation handles number conversion
                      className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="e.g., 10.5"
                      required
                    />
                  </div>

                  
                </div>

                <div className="flex gap-4 ">
                  
                  <div className="space-y-2  w-1/3">
                    <label className="text-[14px]" htmlFor="projectRepo">
                      Project Repository
                    </label>
                    <select
                      id="projectRepo"
                      name="projectRepo"
                      className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      onChange={(e) => setSelectedRepo(e.target.value)} // This sets selectedRepo (singular)
                      value={selectedRepo || ""} // Ensure value is not undefined
                      required
                    >
                      <option value="">Select a repository</option>
                      {data?.map((repo: any) => ( // data here refers to the list of projects/repos fetched from /api/add-projects
                        <option value={repo.name} key={repo.id}> 
                          {repo.project_repository} 
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2  w-1/3">
                    <label className="text-[14px]" htmlFor="projectIssue">
                      Select Issue
                    </label>
                    <select
                      id="projectIssue" // This is the ID for the issue dropdown
                      name="projectIssue" // This is the name attribute for FormData
                      className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      onChange={(e) => setSelectedIssue(e.target.value)}
                      required
                    >
                      <option value="">Select an issue</option>
                      {issues?.map((issue: any) => (
                        <option value={issue.number} key={issue.id}>
                          {issue.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#29292c] text-white p-2 rounded-md hover:bg-[#222225] px-4 disabled:opacity-50"
                    disabled={isWritePending || isConfirming}
                  >
                    {isWritePending || isConfirming
                      ? "Processing..."
                      : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
      </Suspense>
    </>
  );
}

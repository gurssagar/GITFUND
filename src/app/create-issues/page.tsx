"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSession } from "next-auth/react";
import { Octokit } from "octokit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import type { Session } from "next-auth";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";

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
] as const;

const contractAddress =
  "0xf213a3ac05EA11Ec4C6fEcAf2614893A84ccb8dD" as `0x${string}`;

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  id?: string;
}

interface CustomSession extends Session {
  accessToken?: string;
  user?: CustomUser;
}

interface GitHubUser {
  login: string;
  id: number;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  number: number;
  body: string;
  created_at: string;
}

interface SessionData {
  accessToken?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export default function Project() {
  const session = useSession();
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<string | undefined>();
  const [selectedRepo, setSelectedRepo] = useState<string | undefined>();
  const [data, setData] = useState<Repo[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedissue, setSelectedIssue] = useState<string | null>();
  const { isShrunk } = useSidebarContext();
  const { address, isConnected } = useAccount();
  const [issueTitle, setIssueTitle] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [issueCreatedAt, setIssueCreatedAt] = useState<string>("");
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [issueData, setIssueData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  console.log(selectedRepo, "SelectedRepo");
  const octokit = new Octokit({ auth: token });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        const response = await fetch("/api/add-projects", {
          method: "GET",
        });
        const responseData = await response.json();
        if (response.ok) {
          setData(responseData.project as Repo[]);
          console.log(responseData.project, "repos");
        } else {
          console.error(
            "Error fetching repositories:",
            responseData.error || response.statusText
          );
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setData([]);
      }
    };

    fetchRepos();
  }, [token]);

  // Fetch issues for selected repo
  useEffect(() => {
    if (!token || !user || !selectedRepo) return;

    const fetchIssues = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues`,
          {
            owner: user,
            repo: selectedRepo,
            state: "open",
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
        console.log(response.data, "issuess");
        setIssues(response.data as Issue[]);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      }
    };

    fetchIssues();
  }, [token, user, selectedRepo]);

  useEffect(() => {
    if (!selectedissue || !user || !selectedRepo) return;

    const fetchIssueData = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues/${selectedissue}`,
          {
            owner: user,
            repo: selectedRepo,
            issue_number: Number.parseInt(selectedissue),
          }
        );

        const issue = response.data;
        setIssueTitle(issue.title);
        setIssueDescription(issue.body || "");
        setIssueCreatedAt(issue.created_at);
        console.log("Issue Data:", issue);
      } catch (error) {
        console.error("Error fetching issue data:", error);
      }
    };

    fetchIssueData();
  }, [selectedissue, user, selectedRepo]);

  useEffect(() => {
    if (isConfirmed) {
      setAlertMessage("Deposit successful and project creation initiated!");
    }
    if (confirmationError) {
      setAlertMessage(
        `Deposit failed: ${(confirmationError as Error).message}`
      );
    }
    if (writeError) {
      setAlertMessage(
        `Transaction submission failed: ${(writeError as Error).message}`
      );
    }
  }, [isConfirmed, confirmationError, writeError]);

  const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    if (!difficulty || !priority || !selectedRepo || !selectedissue) {
      setAlertMessage("Please fill in all required fields");
      return;
    }

    try {
      const currentSession = session.data as CustomSession;
      const username: string = currentSession?.user?.username as string;

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
          difficulty: difficulty,
          project_issues: selectedissue,
          rewardAmount: rewardAmount,
          priority: priority,
          project_repository: selectedRepo,
          email: currentSession?.user?.email,
        }),
      });

      setAlertMessage("Issue submitted (after deposit initiated)!");
    } catch (error) {
      console.error("Error in project creation or deposit:", error);
      if (error instanceof Error) {
        setAlertMessage(`Error: ${error.message}`);
      } else {
        setAlertMessage(
          "An unexpected error occurred during project creation."
        );
      }
    }
  };

  return (
    <>
      <Suspense>
        {/* Alert Messages - Responsive positioning */}
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full">
          {alertMessage && (
            <Alert
              className={`mb-2 ${
                isConfirmed
                  ? "bg-green-100 border-green-400 text-green-700"
                  : confirmationError || writeError
                  ? "bg-red-100 border-red-400 text-red-700"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {isConfirmed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : confirmationError || writeError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle className="text-sm">
                  {isConfirmed
                    ? "Success"
                    : confirmationError || writeError
                    ? "Error"
                    : "Notice"}
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm mt-1">
                {alertMessage}
              </AlertDescription>
            </Alert>
          )}
          {(isWritePending || isConfirming) && (
            <Alert className="bg-blue-100 border-blue-400 text-blue-700">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle className="text-sm">
                  Processing Transaction
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm mt-1">
                {isWritePending &&
                  !isConfirming &&
                  "Please confirm in your wallet..."}
                {isConfirming && "Waiting for transaction confirmation..."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex min-h-screen">
          <Sidebar />
          <div
            className={`
              flex-1 transition-all duration-300 ease-in-out
              ${
                isMobile
                  ? "ml-0 w-full"
                  : isShrunk
                  ? "ml-16 w-[calc(100%-4rem)]"
                  : "ml-64 w-[calc(100%-16rem)]"
              }
            `}
          >
            <Topbar />

            <div className="mt-16 md:mt-20 p-4 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    Create Issue Bounty
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Set up a reward for contributors to solve your GitHub issues
                  </p>
                </div>

                {/* Wallet Connection Status */}
                {!isConnected && (
                  <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Wallet Not Connected
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Please connect your wallet to create issue bounties
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Issue Information
                    </CardTitle>
                    <CardDescription>
                      Fill in the details for your issue bounty
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addProject} className="space-y-6">
                      {/* Repository and Issue Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="projectRepo"
                            className="text-sm font-medium"
                          >
                            Project Repository *
                          </Label>
                          <select
                            id="projectRepo"
                            name="projectRepo"
                            className="dark:bg-neutral-800 w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                            onChange={(e) => setSelectedRepo(e.target.value)} // This sets selectedRepo (singular)
                            value={selectedRepo || ""} // Ensure value is not undefined
                            required
                          >
                            <option value="">Select a repository</option>
                            {data?.map(
                              (
                                repo: any // data here refers to the list of projects/repos fetched from /api/add-projects
                              ) => (
                                <option value={repo.name} key={repo.id}>
                                  {repo.project_repository}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="projectIssue"
                            className="text-sm font-medium"
                          >
                            Select Issue *
                          </Label>
                          <Select
                            value={selectedissue || ""}
                            onValueChange={(value) => setSelectedIssue(value)}
                            disabled={!selectedRepo}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an issue" />
                            </SelectTrigger>
                            <SelectContent>
                              {issues?.map((issue: any) => (
                                <SelectItem
                                  value={issue.number.toString()}
                                  key={issue.id}
                                >
                                  {issue.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Difficulty, Priority, and Reward */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="difficulty"
                            className="text-sm font-medium"
                          >
                            Difficulty *
                          </Label>
                          <Select
                            value={difficulty}
                            onValueChange={setDifficulty}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="priority"
                            className="text-sm font-medium"
                          >
                            Priority *
                          </Label>
                          <Select
                            value={priority}
                            onValueChange={setPriority}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                          <Label
                            htmlFor="rewardAmount"
                            className="text-sm font-medium"
                          >
                            Reward Amount (PHAROS) *
                          </Label>
                          <Input
                            id="rewardAmount"
                            name="rewardAmount"
                            type="text"
                            className="w-full"
                            value={rewardAmount}
                            onChange={(e) => setRewardAmount(e.target.value)}
                            placeholder="e.g., 10.5"
                            required
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            By creating this bounty, you agree to deposit the
                            reward amount to the smart contract. The funds will
                            be released when the issue is successfully resolved.
                          </p>
                        </div>
                        <Button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2"
                          disabled={
                            isWritePending || isConfirming || !isConnected
                          }
                        >
                          {isWritePending || isConfirming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Create Bounty"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Help Section */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      How it works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        1
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Select a repository and issue from your GitHub projects
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        2
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Set the difficulty, priority, and reward amount for the
                        issue
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        3
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Deposit the reward amount to the smart contract
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        4
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contributors can work on the issue and submit pull
                        requests
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}

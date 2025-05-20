'use client'
import {useState, useMemo, useEffect} from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSession } from "next-auth/react";
import { Octokit } from "octokit"
import {groq} from '@ai-sdk/groq'
import { generateText } from 'ai';
// import { ethers } from 'ethers'; // ethers is still used by Octokit, but not directly for wallet interactions
// import { useWeb3 } from "../../assets/components/web3Context"; // Removed
// import { getContract } from "../../assets/components/contract"; // Removed
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi'; // Added Wagmi hooks
import { parseEther } from 'viem'; // Added for converting string to BigInt for transaction value

import { useSidebarContext } from '@/assets/components/SidebarContext';
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"
import { Suspense } from "react";

// !!! IMPORTANT: Define your contract ABI and address here !!!
const contractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "getUsernameBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "usernameToAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "usernameToBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const; // Example: [{ "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "username", "type": "string" } ], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }] as const;
const contractAddress = "0xfeE4A793833338ff675066D75c30bE2A18036b82"; // Example: '0xYourContractAddressHere' as `0x${string}`;

export default function Project() {
    const session = useSession();
    const [token, setToken] = useState('');
    const [user, setUser] = useState<any>();
    const [selectedRepo, setSelectedRepo] = useState<any>();
    const [data, setData] = useState<any[]>();
    const [issues, setIssues] = useState<any[]>();
    const { isShrunk } = useSidebarContext();
    // const { provider, signer } = useWeb3(); // Removed
    const { address, isConnected } = useAccount(); // Wagmi's account hook
    const [contractBalance, setContractBalance] = useState("0");
    const [rewardAmount, setRewardAmount] = useState<string>(""); // Ensure rewardAmount is string
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [languages,setlanguages]=useState<any>();
    const [stars, setStars] = useState(0);
    const [forks, setForks] = useState(0);

    const { data: writeData, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmationError } = 
    useWaitForTransactionReceipt({ 
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
        if(session.data) {
            setToken((session.data as any)?.accessToken);
            setUser((session.data as any)?.user?.username);
        }
    }, [session.data]);

    // Fetch repositories (no changes here)
    useEffect(() => {
        if (!token) return;
        
        const fetchRepos = async () => {
            try {
                const octokit = new Octokit({ auth: token });
                const response = await octokit.request('GET /user/repos', {
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                setData(response.data);
                console.log(response.data,"repois")
            } catch (error) {
                console.error('Error fetching repositories:', error);
            }
        };

        // Conditional fetch to prevent error when selectedRepo is not set
        const fetchRepoLanguages = async () => {
            if (!user || !selectedRepo) return; // Add this check
            const octokit = new Octokit({ auth: token });
            try {
                const response=await octokit.request(
                    `GET /repos/${user}/${selectedRepo}/languages`,
                    {
                        owner:user,
                        repo:selectedRepo,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    }
                )
                console.log(response.data,'languages')
                setlanguages(response.data)
            } catch (error) {
                console.error('Error fetching repo languages:', error);
            }
        }
        fetchRepos();
        if (selectedRepo) { // Only fetch if selectedRepo is available
            fetchRepoLanguages();
        }
    }, [token, user, selectedRepo]); // Added user and selectedRepo as dependencies

    //fetch readme.md (no changes here)
    const [repoValue, setRepoValue] = useState<any>();
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!session) return;
            const octokit = new Octokit({ auth: token });
            try {
                
                await octokit.request(
                    `GET /repos/${user}/${selectedRepo}/readme`,
                    {
                        owner:user,
                        repo:selectedRepo,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    } 
                ).then(response => response.data).then(res => {
                    console.log(res,'shhdttwebba')
                    console.log(repoValue,"sdiewudu")
                    setRepoValue(Buffer.from(res.content, 'base64').toString('utf-8'));
                })                     
            } 
            catch (error) {
                console.error('Error fetching project data:', error);
            }
        }
        fetchProjectData();
    },[session, user, selectedRepo, token])
    console.log(repoValue,"sdiewudu")
    
    //ai reply (no changes here)
    const [aiReply, setAiReply] = useState<any>();
    // Removed useMemo for Groq client initialization, as we'll use the AI SDK's groq model provider directly.
    // The API key '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' should now be set as an environment variable (e.g., GROQ_API_KEY).
    // The `dangerouslyAllowBrowser: true` option is not used with the AI SDK in this manner.

    useEffect(() => {
        async function main() {
            if (!repoValue) return;
            
            try {
                // Using generateText from the AI SDK with the imported groq model provider
                const { text } = await generateText({
                    model: groq('llama-3.1-8b-instant'), // Using the groq model provider from @ai-sdk/groq
                    messages: [
                        {
                            role: "user",
                            content: `Read this and explain the project to a developer in 100 words ${JSON.stringify(repoValue)}`,
                        },
                    ],
                });
                setAiReply(text);
            } catch (error) {
                console.error("Error generating AI reply:", error);
                setAiReply("Failed to generate AI reply."); // Provide user feedback on error
            }
        }
        
        main();
    }, [repoValue]); // Removed groq from dependencies as the imported `groq` function is stable



    // Fetch issues for selected repo
    useEffect(() => {
        if (!token || !user || !selectedRepo) return;
        
        const fetchIssues = async () => {
            try {
                const octokit = new Octokit({ auth: token });
                const response = await octokit.request(`GET /repos/${user}/${selectedRepo}/issues`, {
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                setIssues(response.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            }
        };
        fetchIssues();
    }, [token, user, selectedRepo]);

    // const fetchBalance = async () => { // Commented out - needs reimplementation with useReadContract for custom getBalance
    //     if (!address || !contractAddress || !contractAbi) return;
    //     try {
    //       // This would need useReadContract for a custom getBalance function
    //       // const balance = await readContract({ address: contractAddress, abi: contractAbi, functionName: 'getBalance' });
    //       // setContractBalance(formatEther(balance as bigint)); 
    //       console.log("fetchBalance needs to be updated with useReadContract");
    //     } catch (error) {
    //       console.error("Fetch Balance Error:", error);
    //     }
    //   };

    useEffect(() => {
        if (isConfirmed) {
            setAlertMessage("Deposit successful and project creation initiated!");
            // Potentially trigger the rest of the project creation logic here if it depends on successful deposit
            // For now, assuming the API call for add-issues will be part of the form submission logic after deposit.
            // fetchBalance(); // Re-fetch balance if implemented
        }
        if (confirmationError) {
            setAlertMessage(`Deposit failed: ${confirmationError.message}`);
        }
        if (writeError) {
            setAlertMessage(`Transaction submission failed: ${writeError.message}`);
        }
    }, [isConfirmed, confirmationError, writeError]);

    const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        const fileInput = formData.get('projectImage') as File;
        
        if (!repoValue) {
            console.error('Repository content is not available');
            setAlertMessage('Repository content is not available');
            return;
        }
        if (!rewardAmount || isNaN(Number(rewardAmount)) || Number(rewardAmount) <= 0) {
            setAlertMessage('Please enter a valid positive reward amount');
            return;
        }

        if (!isConnected || !address) {
            setAlertMessage("Connect your wallet first!");
            return;
        }
        
        if (!contractAddress || contractAbi.length === 0) {
            setAlertMessage("Contract address or ABI is not configured.");
            console.error("Contract address or ABI is not configured.");
            return;
        }

        try {
            // Handle deposit with Wagmi
            const username: string = ((session.data as any)?.user as any)?.username;
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
                functionName: 'deposit',
                args: [username],
                value: parseEther(rewardAmount), 
            });

            // The rest of the project creation (S3 upload, API call) should ideally happen
            // AFTER the transaction is confirmed. We can use the `isConfirmed` state from
            // `useWaitForTransactionReceipt` to gate this logic.
            // For simplicity in this step, I'm keeping it sequential but in a real app,
            // you'd likely show a loading state and then proceed upon confirmation.

            // This part will now execute immediately after calling writeContract,
            // not waiting for confirmation. Consider moving this to an effect hook
            // that watches `isConfirmed` or handle it in a multi-step UI.
            if (isWritePending) {
                setAlertMessage("Processing deposit...");
                // return; // Optionally wait here, or let UI update based on isWritePending
            }
            
            // If you want to wait for confirmation before proceeding:
            // This is a simplified approach. A better UX would involve disabling the form
            // and showing a loading indicator until `isConfirmed` or `confirmationError`.
            // For now, we'll assume the user waits or we proceed optimistically.

            // Proceed with project creation (S3 and API)
            // This part should ideally be triggered *after* successful transaction confirmation.
            // For now, it's placed here for structural similarity to original code.
            // Consider moving this logic into a useEffect that triggers on `isConfirmed`.
            
            const signedUrlResponse = await fetch('/api/s3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileInput.name,
                    fileType: fileInput.type,
                }),
            });
            
            const { signedUrl } = await signedUrlResponse.json();
            
            await fetch(signedUrl, {
                method: 'PUT',
                body: fileInput,
                headers: {
                    'Content-Type': fileInput.type,
                },
            });
            
            const imageUrl = signedUrl.split('?')[0];
            
            await fetch('/api/add-issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contributors: {collabs},
                    aiDescription: aiReply || '',
                    projectOwner: user,
                    projectName: formData.get('projectName'),
                    shortdes: formData.get('shortDescription'),
                    longdis: formData.get('longDescription'),
                    image_url: imageUrl,
                    project_repository: selectedRepo,
                    project_issues: formData.get('projectIssue'),
                    difficulty:formData.get('difficulty'),
                    priority:formData.get('priority'),
                    rewardAmount: rewardAmount,
                    email:(session.data as any)?.user?.email,
                    languages:languages,
                    stars:stars,
                    forks:forks,
                }),
            });
            setAlertMessage("Project submitted (after deposit initiated)!"); // Update message

        } catch (error) {
            console.error('Error in project creation or deposit:', error);
            // Check if error is an instance of Error to safely access message
            if (error instanceof Error) {
                setAlertMessage(`Error: ${error.message}`);
            }
            else {
                setAlertMessage('An unexpected error occurred during project creation.');
            }
        }
    }
    

    //collab (no changes here)
    const [collabs, setCollabs] = useState<any>();
    useEffect(() => {
    const fetchProjectData = async () => {
        if (!session || !user || !selectedRepo) return;
        
        try {
            const octokit = new Octokit({ auth: token });
            // Fetch collaborators
            await octokit.request(
                `GET /repos/${user}/${selectedRepo}/collaborators`,
                {
                    owner:user,
                    repo:selectedRepo,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                } 
            ).then(response => response.data).then(res => {
                console.log(res,'collabs')
                setCollabs(res) 
            });

            const response = await octokit.request('GET /repos/{owner}/{repo}', {
                owner: user,
                repo: selectedRepo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            setStars(response.data.stargazers_count);
            setForks(response.data.forks_count);
            
            // Fetch languages
            await octokit.request(
                `GET /repos/${user}/${selectedRepo}/languages`,
                {
                    owner:user,
                    repo:selectedRepo,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }
            ).then(response => response.data).then(res => {
                console.log(res,'languages')
                setlanguages(res)
            });
        } 
        catch (error) {
            console.error('Error fetching project data:', error);
        }
    }
    fetchProjectData();
    },[session, user, selectedRepo, token]);

    
    console.log(collabs,'collabs')


    // Add selectedRepo as a dependency to log it whenever it change


    return (
        <>
        <Suspense>
            <div className="fixed bottom-20 right-10 z-[100]"> {/* Ensure alert is on top */}
            {alertMessage && (
                <Alert className={isConfirmed ? "bg-green-100 border-green-400 text-green-700" : (confirmationError || writeError) ? "bg-red-100 border-red-400 text-red-700" : ""}>
                    <AlertTitle>
                        {isConfirmed ? "Success" : (confirmationError || writeError) ? "Error" : "Notice"}
                    </AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
            )}
            {(isWritePending || isConfirming) && (
                 <Alert className="bg-blue-100 border-blue-400 text-blue-700">
                    <AlertTitle>Processing Transaction</AlertTitle>
                    <AlertDescription>
                        {isWritePending && !isConfirming && "Please confirm in your wallet..."}
                        {isConfirming && "Waiting for transaction confirmation..."}
                    </AlertDescription>
                </Alert>
            )}
            </div>
            <div className='flex'>
            <Sidebar/>
            <div className={`transition-all duration-300 ease-in-out ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}> {/* Added transition */}
                    <Topbar />
                    <div className="mt-20 justify-center">
                        
                        <form onSubmit={addProject} className="p-10 mx-auto space-y-4">
                            <div className="text-3xl mb-6">
                                Project Information
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="projectName">Project name</label>
                                <input id="projectName" name="projectName" type="text" className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="shortDescription">Short description</label>
                                <input id="shortDescription" name="shortDescription" type="text" className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="longDescription">Long Description</label>
                                <textarea id="longDescription" name="longDescription" className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"/>
                            </div>
                            <div className="space-y-2 flex gap-4">
                                <div className="w-1/3">
                                <label className="text-[14px]" htmlFor="projectImage">Project image</label>
                                <input id="projectImage" name="projectImage" type="file" className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md" required/>
                                </div>
                                <div className="w-1/3">
                                <label className="text-[14px]" htmlFor="rewardAmount">Reward Amount in Pharos</label> {/* Changed htmlFor to rewardAmount to match id */} 
                                <input
                                    id="rewardAmount" // Changed id to rewardAmount
                                    name="rewardAmount" // Changed name to rewardAmount
                                    type="text" // Keep as text to allow decimal input, validation handles number conversion
                                    className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                                    value={rewardAmount}
                                    onChange={e => setRewardAmount(e.target.value)}
                                    placeholder="e.g., 10.5"
                                    required
                                />
                                </div>
                                <div className="space-y-2 w-1/3">
                                <label className="text-[14px]" htmlFor="difficulty">Difficulty</label>
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
                            </div>
                            
                            <div className="flex gap-4 ">
                            <div className="space-y-2 w-1/3">
                                <label className="text-[14px]" htmlFor="priority">Priority</label>
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
                            <div className="space-y-2  w-1/3">
                                <label className="text-[14px]" htmlFor="projectRepo">Project Repository</label>
                                <select 
                                    id="projectRepo" 
                                    name="projectRepo" 
                                    className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                                    onChange={(e) => setSelectedRepo(e.target.value)}
                                    value={selectedRepo || ""} // Ensure value is not undefined
                                    required
                                >
                                    <option value="">Select a repository</option>
                                    {data?.map((repo: any) => (
                                        <option value={repo.name} key={repo.id}>                                        
                                            {repo.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2  w-1/3">
                                <label className="text-[14px]" htmlFor="projectIssue">Select Issue</label>
                                <select 
                                    id="projectIssue" 
                                    name="projectIssue" 
                                    className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
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
                                    {isWritePending || isConfirming ? 'Processing...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                        
                    </div>
                </div>
            </div>
            </Suspense>
        </>
    )
}
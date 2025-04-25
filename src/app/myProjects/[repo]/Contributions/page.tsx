'use client'
import { useSession } from 'next-auth/react';
import {useEffect, useState} from'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image';
import { Octokit } from 'octokit';
import Link from 'next/link';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import { useSearchParams } from 'next/navigation';
import { ethers } from 'ethers';
import { useWeb3 } from "../../../../assets/components/web3Context";
import { getContract } from "../../../../assets/components/contract";
export default function Contributions() {
    const session=useSession();
    const searchParams = useSearchParams();
    const repo = searchParams.get('repo');
    const issueNumber = searchParams.get('issueNumber');
    const owner=searchParams.get('owner');
    const octokit = new Octokit({
        auth: (session?.data as any)?.accessToken,
    });
    const [constributions, setContributions] = useState<any>([]);
    const [registeredUser, setRegisteredUser] = useState<any>([]);
    const [filteredContributions, setFilteredContributions] = useState<any>([]);
    const [repoData, setRepoData] = useState<any>([]);

    //for web3

    const { provider, signer, account } = useWeb3();
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [contractBalance, setContractBalance] = useState("0");

    const fetchBalance = async () => {
        if (!provider) return;
        try {
          const contract = getContract(provider);
          const balance = await contract.getBalance();
          setContractBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error("Fetch Balance Error:", error);
        }
      };

      // ... existing code ...
      
        const handleWithdraw = async (rewardAmount: string) => {
            if (!signer) return alert("Connect your wallet first!");
            try {
                // Validate and format the amount
                const amount = parseFloat(rewardAmount);
                if (isNaN(amount) || amount <= 0) {
                    return alert("Invalid reward amount");
                }
                
                const contract = getContract(signer);
                const tx = await contract.withdraw(
                    account, 
                    ethers.parseEther(`0.002`)
                );
                await tx.wait();
                alert(`Withdrawn ${amount} ETH to ${account}`);
                fetchBalance();
            } catch (error) {
                console.error("Withdraw Error:", error);
                alert("Withdraw failed! " + (error as Error).message);
            }
        };

// ... rest of the code ...

        const handleSubmit = async (pullNumber: string,rewardAmount:string) => {
            try {
                console.log(rewardAmount)
                handleWithdraw(rewardAmount).then((withdrawSuccess:any) => {
                    if (withdrawSuccess) {
                        return octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
                            owner: owner as string,
                            repo: repo as string,
                            pull_number: Number(pullNumber),
                            commit_title: 'Commit Merged successfully',
                            commit_message: 'Commit merged to the main repo',
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        }).then(response => {
                            console.log('Merge successful:', response.data);
                            return response.data;
                        });
                    } else {
                        throw new Error('Withdrawal failed');
                    }
                }).catch(error => {
                    console.error('Merge failed:', error);
                    throw error;
                });
            } catch (error) {
                console.error('Merge failed:', error);
                throw error;
            }
        }

    useEffect(() => {
        try{


            const fetchRegistered = async () => {
                const response = await fetch('/api/requestIssue', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
                
                // Filter response to only include items matching current repo
                
                setRegisteredUser(response);
                console.log(response);
            }

            const fetchDatas = async () => {
                const response = await fetch('/api/add-issues', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
                setRepoData(response.projects);
                console.log(response,"dartas")
            }
            fetchDatas()

            fetchRegistered()
            const fetchData = async () => {
                const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
                    owner: owner as string,
                    repo: repo as string,
                    headers: {
                      'X-GitHub-Api-Version': '2022-11-28'
                    }
                  })
                console.log(response.data)
                setContributions(response.data)
            };
            fetchData()
        }
        catch(err){
            
        }
    },[])
    console.log(constributions)
    console.log(registeredUser)
    useEffect(() => {
        if (Array.isArray(constributions) && registeredUser && repoData) {
            const filtered = constributions.filter((pr: any) => 
                Array.isArray(registeredUser.assignments) && 
                registeredUser.assignments.some((assignment: any) => {
                    const matchingRepo = repoData.find((repo: any) => 
                        repo.project_repository === assignment.projectName
                    );
                    if (matchingRepo) {
                        pr.rewardAmount = matchingRepo.rewardAmount;
                    }
                    return assignment.Contributor_id === pr.user?.login;
                })
            );
            setFilteredContributions(filtered);
        } else {
            setFilteredContributions(constributions || []);
        }
    }, [constributions, registeredUser, repoData]);
    return(
        <>
        <div className='flex'>
            <Sidebar/>
            <div className='ml-[12em] w-[calc(100%_-_12em)]'>
                    <Topbar/>
                    <div className="px-4 py-8 pt-20">
                        <h1 className="text-2xl font-bold mb-6">Pull Requests for {repo}</h1>
                        <div className="space-y-4">
                            {filteredContributions.map((pr: any) => (
                                <div key={pr.id} className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-4">
                                            <img 
                                                src={pr.user?.avatar_url} 
                                                alt={pr.user?.login}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <h2 className="text-lg font-semibold">
                                                    <a 
                                                        href={pr.html_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        {pr.title}
                                                    </a>
                                                </h2>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    #{pr.number} opened by {pr.user?.login}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            pr.state === 'open' 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-500 text-gray-200'
                                        }`}>
                                            {pr.state}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                    <div className="mt-3 flex items-center text-sm text-gray-400">
                                        <span className="mr-4">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            {new Date(pr.created_at).toLocaleDateString()}
                                        </span>
                                        <span>
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                                            </svg>
                                            {pr.comments} comments
                                        </span>
                                        <div>
    {pr.rewardAmount && (
        <span className="text-yellow-400">
            Reward: {pr.rewardAmount} ETH
        </span>
    )}
</div>
                                    </div>
                                    <div>
                                        <button onClick={() => handleSubmit(pr.number.toString(),pr.rewardAmount)} className='text-black bg-white  rounded px-4 py-2 hover:bg-gray-300 hover:scale-[90%]'>
                                            Merge Pull Request
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
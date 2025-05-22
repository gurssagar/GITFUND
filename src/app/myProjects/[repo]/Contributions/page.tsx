'use client'
import { useSession } from 'next-auth/react';
import {useEffect, useState} from'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Octokit } from 'octokit';
import Link from 'next/link';
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import Issue from '@/assets/components/issue';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'

import { useCompletion } from '@ai-sdk/react';
import { ethers } from 'ethers';
import { useWeb3 } from "../../../../assets/components/web3Context";
import { getContract } from "../../../../assets/components/contract";
import { useSidebarContext } from '@/assets/components/SidebarContext';
export default function Contributions() {
    const session=useSession();
    const {isShrunk}=useSidebarContext()

    const searchParams = useSearchParams();
    const repo = searchParams?.get('repo');
    const issueNumber = searchParams?.get('issueNumber');
    const owner=searchParams?.get('owner');
    const { completion, complete } = useCompletion({
        api: '/api/completion',
      });
    const [showReview, setShowReview] = useState(true);

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

      const handleWithdraw = async (rewardAmount: string): Promise<boolean> => { // Ensure return type is Promise<boolean>
          if (!signer || !provider) { // Also check for provider
              alert("Connect your wallet first!");
              return false;
          }
          if (!account) {
              alert("Wallet connected, but account address is missing.");
              return false;
          }
          try {
              // Validate and format the amount
              const amount = parseFloat(rewardAmount);
              if (isNaN(amount) || amount <= 0) {
                  alert(`Invalid reward amount provided: ${rewardAmount}`);
                  return false;
              }

              const contract = getContract(signer); // Use signer for transaction
              const contractWithProvider = getContract(provider); // Use provider for read-only calls
              const amountInWei = ethers.parseEther(rewardAmount); // Use the dynamic reward amount string

              // *** Check Contract Balance Before Attempting Withdrawal ***
              console.log("Checking contract balance...");
              const currentContractBalanceWei = await contractWithProvider.getBalance();
              console.log(`Contract Balance: ${ethers.formatEther(currentContractBalanceWei)} PHAROS`);
              console.log(`Required Amount:  ${rewardAmount} PHAROS`);

              if (currentContractBalanceWei < amountInWei) {
                  alert(`Withdrawal failed: Insufficient funds in the contract. Balance: ${ethers.formatEther(currentContractBalanceWei)} PHAROS, Required: ${rewardAmount} PHAROS`);
                  console.error(`Insufficient contract balance. Has ${currentContractBalanceWei.toString()} wei, needs ${amountInWei.toString()} wei.`);
                  return false;
              }
              // *** End Balance Check ***

              console.log(`Attempting to withdraw ${rewardAmount} PHAROS (${amountInWei.toString()} wei) to recipient: ${account}`);

              // *** Estimate Gas ***
              console.log("Estimating gas for withdrawal...");
              

              // Ensure 'account' is the intended RECIPIENT address.
              // If the contributor should receive the funds directly, 'account' might need to be replaced
              // with the contributor's wallet address if available.
              const user:string=(session?.data?.user as any)?.username
              const tx = await contract.withdraw(
                  account, // The recipient of the funds
                  amountInWei,
                  user,
                  { gasLimit: 3000000 } // Pass the calculated gas limit
              );

              console.log("Withdraw transaction sent:", tx.hash);
              await tx.wait(); // Wait for the transaction to be mined

              console.log("Withdraw transaction confirmed.");
              // Use rewardAmount for the alert to show the intended amount
              alert(`Successfully withdrawn ${rewardAmount} PHAROS to ${account}`);
              fetchBalance(); // Refresh balance after successful withdrawal
              return true; // Indicate success
          } catch (error: any) { // Catch specific error type if possible
              console.error("Withdraw Error Details:", error);
              // Try to extract a more specific reason if available in the error object
              const reason = error?.reason || error?.message || "Unknown error";
              // Check if the error indicates a specific revert reason not caught before
              if (error.code === 'CALL_EXCEPTION' && error.reason) {
                 alert(`Withdraw failed! Contract Reverted: ${error.reason}`);
              } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                 alert(`Withdraw failed! Could not estimate gas. The transaction might fail or require manual gas limit.`);
                 console.error("Gas estimation failed. This often indicates an issue that would cause the transaction to revert.");
              } else {
                 alert(`Withdraw failed!`);
              }
              // Log the arguments again in case of failure
              console.error(`Failed withdrawal attempt: Recipient=${account}, Amount=${rewardAmount} PHAROS`);
              return false; // Indicate failure
          }
      };

      const handleSubmit = async (pr: any) => {
          const pullNumber = pr.number.toString();
          console.log(pullNumber,"pullNumber")
          // Ensure rewardAmount is treated as a string for ethers.parseEther
          const rewardAmount = pr.rewardAmount ? String(pr.rewardAmount) : null;
          console.log(rewardAmount,"rewardAmount")
          const contributorLogin = pr.user?.login;
          console.log(contributorLogin,"contributorLogin")

          if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
              alert("Cannot merge: Invalid or missing reward amount for this PR.");
              return;
          }
          if (!contributorLogin) {
              alert("Contributor information is missing for this pull request.");
              return;
          }

          try {
              // Step 0: Check if PR is mergeable
              const prDetails = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
                  owner: owner as string,
                  repo: repo as string,
                  pull_number: Number(pullNumber),
                  headers: {
                      'X-GitHub-Api-Version': '2022-11-28'
                  }
              });
              // The mergeable property can be true, false, or null (if not yet computed)
              if (prDetails.data.mergeable === false) {
                  alert(`PR #${pullNumber} is not mergeable. Please resolve conflicts or check PR status.`);
                  return;
              }
              if (prDetails.data.mergeable === null) {
                  alert(`PR #${pullNumber} mergeability is unknown. Please try again in a few seconds.`);
                  return;
              }

              console.log(`Starting process for PR #${pullNumber} with reward ${rewardAmount} PHAROS`);

              // Step 1: Attempt Withdrawal
              const withdrawSuccess = await handleWithdraw(rewardAmount);

              if (withdrawSuccess) {
                  console.log(`Withdrawal successful for PR #${pullNumber}. Proceeding to merge...`);

                  // Step 2: Merge Pull Request
                  const mergeResponse = await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
                      owner: owner as string,
                      repo: repo as string,
                      pull_number: Number(pullNumber),
                      commit_title: `Merge pull request #${pullNumber}`,
                      commit_message: `Merged contribution from ${contributorLogin} (PR #${pullNumber}) after reward payout.`,
                      headers: {
                          'X-GitHub-Api-Version': '2022-11-28'
                      }
                  });
                  console.log('Merge successful:', mergeResponse.data);

                  // Step 3: Record Reward Transaction
                  console.log(`Recording reward for PR #${pullNumber}...`);
                  const rewardData = {
                      projectName: repo,
                      Contributor: contributorLogin,
                      issue: pullNumber, // Using PR number as issue identifier
                      value: parseFloat(rewardAmount),
                      date: new Date().toISOString(),
                  };

                  const rewardResponse = await fetch('/api/rewards', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(rewardData)
                  });
                  const rewardResult = await rewardResponse.json();

                  if (rewardResponse.ok && rewardResult.success) {
                      console.log('Reward recorded successfully:', rewardResult);
                      alert(`Pull request #${pullNumber} merged and reward recorded successfully!`);
                  } else {
                      console.error('Failed to record reward:', rewardResult.error || 'Unknown API error');
                      // Alert user about merge success but recording failure
                      alert(`Merge successful for PR #${pullNumber}, but failed to record reward: ${rewardResult.error || 'Unknown API error'}`);
                  }

              } else {
                  // Withdrawal failed
                  console.error(`Withdrawal failed for PR #${pullNumber}. Merge aborted.`);
                  // Alert is handled within handleWithdraw, no need for another one here.
              }
          } catch (error) {
              // Catch errors from merge or reward recording steps
              console.error(`Error during handleSubmit for PR #${pullNumber}:`, error);
              const errorMessage = (error as Error).message || "An unknown error occurred during the process.";
              // Provide context in the alert
              alert(`An error occurred while processing PR #${pullNumber}: ${errorMessage}`);
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
          <Suspense>
          <div className='flex'>
              <Sidebar/>
              <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
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
                                          <div className='flex gap-4'>
                                            <div>
                                              {pr.rewardAmount && (
                                                  <span className="text-xl font-bold text-black-400 dark:text-white">
                                                     {pr.rewardAmount} PHAROS
                                                  </span>
                                              )}
                                         
                                         </div>
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                              pr.state === 'open' 
                                                  ? 'bg-green-500 text-white' 
                                                  : 'bg-gray-500 text-gray-200'
                                          }`}>
                                              {pr.state}
                                          </span>
                                          </div>
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
                                          
                                      </div>
                                      
                                      <div className="flex gap-4">
                                          <div >
                                              <div
                                                  onClick={async () => {
                                                  setShowReview(true)
                                                  await complete(
                                                      `Analyze the changes made in a pull request https://github.com/${owner}/${repo}/pull/${pr.number}. Focus on a technical review: explain the purpose of the changes, evaluate the code quality, identify any potential issues or improvements, and assess if the modifications align with best coding practices. Assume the reader is familiar with programming concepts.`,
                                                  );
                                                  } }
                                                   className='text-white dark:hover:bg-[#0a0a0a] bg-black dark:text-black dark:bg-white  rounded px-4 py-2 dark:hover:bg-gray-300 hover:scale-[90%]'
                                              >
                                                  AI Review
                                              </div>
                                              </div>
                                          <div>
                                          <button onClick={() => handleSubmit(pr)} className='text-white dark:hover:bg-[#0a0a0a] bg-black dark:text-black dark:bg-white  rounded px-4 py-2 dark:hover:bg-gray-300 hover:scale-[90%]'
                                          >
                                              Merge Pull Request
                                          </button>
                                          </div>
                                      </div>
                                      </div>
                                      
                                      <div>
                                          
                                          <h2 className="mt-10 text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                                              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              AI Pull Request Review
                                          </h2>
                                          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent prose prose-invert max-w-none bg-transparent">
                                              <ReactMarkdown>
                                                  {completion || ''}
                                              </ReactMarkdown>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div>
                      
                  </div>
          </div>
          </Suspense>
          
          </>
      )
}
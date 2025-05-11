'use client'
import {useState,useMemo, useEffect} from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSession } from "next-auth/react";
import { Octokit } from "octokit"
import { Groq } from 'groq-sdk';
import { ethers } from 'ethers';
import { useWeb3 } from "../../assets/components/web3Context";
import { getContract } from "../../assets/components/contract";
import { useSidebarContext } from '@/assets/components/SidebarContext';
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"
export default function Project() {
    const session = useSession();
    const [token, setToken] = useState('');
    const [user, setUser] = useState<any>();
    const [selectedRepo, setSelectedRepo] = useState<any>();
    const [data, setData] = useState<any[]>();
    const [issues, setIssues] = useState<any[]>();
    const { isShrunk } = useSidebarContext();
    const { provider, signer } = useWeb3(); // Removed unused account
    const [contractBalance, setContractBalance] = useState("0");
    const [rewardAmount, setRewardAmount] = useState();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [languages,setlanguages]=useState<any>();

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

    // Fetch repositories
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


        const fetchRepoLanguages = async () => {
            const octokit = new Octokit({ auth: token });
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
        }
        fetchRepos();
        fetchRepoLanguages();
    }, [token]);

    //fetch readme.md 
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
    
    //ai reply
    const [aiReply, setAiReply] = useState<any>();
    const groq = useMemo(() => new Groq({ 
        apiKey: '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', 
        dangerouslyAllowBrowser: true 
    }), []);

    useEffect(() => {
        async function main() {
            if (!repoValue) return;
            
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: `Read this and explain the project to a developer in 100 words ${JSON.stringify(repoValue)}`,
                    },
                ],
                model: "llama-3.1-8b-instant",
            });
            setAiReply(chatCompletion.choices[0]?.message?.content || "");
        }
        
        main();
    }, [repoValue, groq]);



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


    

    const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        const fileInput = formData.get('projectImage') as File;
        
        // Validate inputs
        if (!repoValue) {
            console.error('Repository content is not available');
            setAlertMessage('Repository content is not available');
            return;
        }
        if (!rewardAmount || isNaN(Number(rewardAmount))) {
            setAlertMessage('Please enter a valid reward amount');
            return;
        }

        try {
            // Handle deposit first
            if (!signer) {
                setAlertMessage("Connect your wallet first!");
                return;
            }
            try {
                const contract = getContract(signer);
                const value=ethers.parseEther(rewardAmount)
                const username:string=((session.data as any)?.user as any)?.username
                const tx = await contract.deposit(
                    username,
                    { value }
                );           
                await tx.wait();
                await fetchBalance();
            } catch (error) {
                console.error("Deposit Error:");
                setAlertMessage("Failed to deposit funds");
                throw new Error("Failed to deposit funds");
            }

            // Then proceed with project creation
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
                    languages:languages
                }),
            });
        } catch (error) {
            console.error('Error in project creation:');
            setAlertMessage('Error in project creation');
        }
    }

    //collab
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
            <div className="fixed bottom-20 right-10">
            {alertMessage && (
                <Alert>
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
            )}
            </div>
            <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                    <Topbar />
                    <div className="mt-20  justify-center">
                        
                        <form onSubmit={addProject} className=" p-10 mx-auto space-y-4">
                            <div className="text-3xl mb-6">
                                Project Information
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="projectName">Project name</label>
                                <input id="projectName" name="projectName" type="text" className="w-full p-2 border-1 border-gray-800 rounded-md"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="shortDescription">Short description</label>
                                <input id="shortDescription" name="shortDescription" type="text" className="w-full p-2 border-1 border-gray-800 rounded-md"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px]" htmlFor="longDescription">Long Description</label>
                                <textarea id="longDescription" name="longDescription" className="w-full p-2 border-1 border-gray-800 rounded-md"/>
                            </div>
                            <div className="space-y-2 flex gap-4">
                                <div className="w-1/3">
                                <label className="text-[14px]" htmlFor="projectImage">Project image</label>
                                <input id="projectImage" name="projectImage" type="file" className="w-full p-2 border-1 border-gray-800 rounded-md"/>
                                </div>
                                <div className="w-1/3">
                                <label className="text-[14px]" htmlFor="projectImage">Reward Amount in Pharos</label>
                                <input
                                    id="reward"
                                    name="reward"
                                    type="text"
                                    className="w-full p-2 border-1 border-gray-800 rounded-md"
                                    value={rewardAmount}
                                    onChange={e => setRewardAmount(e.target.value as any)}
                                />
                                </div>
                                <div className="space-y-2 w-1/3">
                                <label className="text-[14px]" htmlFor="difficulty">Difficulty</label>
                                <select 
                                    id="difficulty" 
                                    name="difficulty" 
                                    className="bg-[#0a0a0a] text-[14px] w-full p-2 border-1 border-gray-800 rounded-md"
                                    
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
                                    className="bg-[#0a0a0a] w-full p-2 border-1 border-gray-800 rounded-md"
                                    
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
                                    className="bg-[#0a0a0a] w-full p-2 border-1 border-gray-800 rounded-md"
                                    onChange={(e) => setSelectedRepo(e.target.value)}
                                    value={selectedRepo}
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
                                    className="bg-[#0a0a0a] w-full p-2 border-1 border-gray-800 rounded-md"
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
                                <button type="submit" className="bg-[#29292c] text-white p-2 rounded-md hover:bg-[#222225] px-4">
                                    Publish
                                </button>
                            </div>
                        </form>
                        
                    </div>
                </div>
            </div>
        </>
    )
}
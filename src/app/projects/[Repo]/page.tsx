'use client'
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useState, useEffect } from "react";
import { Octokit } from "octokit";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { time } from "console";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { Groq } from 'groq-sdk';
import Link from 'next/link'


interface ProjectData {
    projectOwner: string;
    project_repository: string;
    // Add other properties as needed
}

export default function Project() {

    const groq = new Groq({ apiKey: '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', dangerouslyAllowBrowser: true });

    const params = useParams();
    const session = useSession();
    const Repo = params?.Repo as string;
    console.log(session)
    const [aiReply, setAiReply] = useState<any>();
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<any>([]);
    const [issues, setIssues] = useState<any>([]);
    const [repoValue,setRepoValue]=useState<any>([]);
    
    const octokit = new Octokit({
        auth: (session?.data as any)?.accessToken,
    });
    console.log(octokit)
    const [width, setWidth] = useState('300px');
    

    const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
        try {
            return await fn();
        } catch (error: any) {
            if (error.status === 429 && retries > 0) {
                const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
                setRetryAfter(retryAfter);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return fetchWithRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    };


    const [isExpanded, setIsExpanded] = useState(false);
    function handleResize() {
        if (isExpanded) {
            setWidth('300px');
        } else {
            setWidth('80%');
        }
        setIsExpanded(!isExpanded);
    }



    

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/add-issues');
                const data = await response.json();
                
                const foundProject = data.projects.find(
                    (project: ProjectData) => project.project_repository === Repo
                );
                
                if (foundProject) {
                    setProjectData(foundProject);
                }
            } catch (error) {
                console.error('Error fetching project data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (Repo) {
            fetchProjectData();
        }
    }, [Repo]);
    const [collab,setCollab]=useState<any>([]);
    useEffect(() => {
    const repoData = async () => {
        try {
            const response = await fetch('/api/add-issues', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            
            // Filter projects to match the current repository from URL
            const filteredProjects = data.projects.filter(
                (project: any) => project.project_repository === Repo
            );
            
            setProjects(filteredProjects);
        } catch (e) {
            console.error('Error fetching projects:', e);
        }
    };
    
    if (Repo) {
        repoData();
    }
}, [Repo]); // Add Repo as dependency



    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectData) return;

            try {
                
                await octokit.request(
                    `GET /repos/${projectData.projectOwner}/${projectData.project_repository}/readme`,
                    {
                        owner:projectData.projectOwner,
                        repo:projectData.project_repository,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    } 
                ).then(response => response.data).then(res => {
                    console.log(res,'shhdttwebba')

                    setRepoValue((prevValue:any) => [...prevValue, {
                        ...res,
                        content: Buffer.from(res.content, 'base64').toString('utf-8'),
                        __html: Buffer.from(res.content, 'base64').toString('utf-8')
                    }])
                })     
            } 
            catch (error) {
                console.error('Error fetching project data:', error);
            }
        }
        fetchProjectData();
    },[projectData])

    useEffect(() =>
        {
            async function main() {
                const completion = await groq.chat.completions
                  .create({
                    messages: [
                      {
                        role: "user",
                        content: `Read this and tell a explain the project to a developer about the project in 100 words ${JSON.stringify(repoValue)}`,
                      },
                    ],
                    model: "llama-3.2-1b-preview",
                  })
                  .then((chatCompletion) => {
                    setAiReply(chatCompletion.choices[0]?.message?.content || "");
                  });
              }
              
              main();
        }
    ,[repoValue])




        const simpleMarkdownToHtml = (markdown: string) => {
        return markdown
            .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mb-2">$1</h2>')
            .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mb-4">$1</h1>') // Headers
             // Subheaders
             .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') // Bold
             .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') // Italic
             .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-600 underline">$1</a>') // Links
             .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>') // Inline code
             .replace(/\n/g, '<br class="mb-1">'); // Line breaks
    };


    const [collabs,setCollabs]=useState<any>([]);



       useEffect(() => {

        async function checkAuth() {
            try {
              const res = await octokit.rest.users.getAuthenticated();
              console.log("✅ Authenticated as:", res.data.login);
            } catch (error:any) {
              console.error("❌ Not authenticated:", error.message);
            }
          }
          
          checkAuth();

        const fetchProjectData = async () => {
            if (!projectData) return;
            
            try {
                await octokit.request(
                    `GET /repos/${projectData.projectOwner}/${projectData.project_repository}/collaborators`,
                    {
                        owner:projectData.projectOwner,
                        repo:projectData.project_repository,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    } 
                ).then(response => response.data).then(res => {
                    console.log(res,'collabs')
                    setCollabs(res) 
                })     
            } 
            catch (error) {
                console.error('Error fetching project data:', error);
            }
        }
        fetchProjectData();
    },[projectData]); // Changed from [collabs] to [projectData]

    // ... existing code ...
    console.log(projects,)
    useEffect(() => {
    const fetchRepoDetails = async () => {
        if (!projectData) return;

        try {
            await fetchWithRetry(async () => {
                const response = await octokit.request(
                    `GET /repos/${projectData.projectOwner}/${projectData.project_repository}/issues`,
                    {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    }
                );
                console.log(response,"yesh")
                
                // FFilter issues that match the current repository
                const filteredIssues = response.data.filter((issue: any) => {
                    console.log(`Issue #${issue.number} comparing with:`, 
                      projects.map((p:any) => p.project_issues));
                    return projects.some((project: any) => 
                        project.project_issues && 
                        project.project_issues.includes(issue.number.toString())
                    );
                });
                console.log("issuess",filteredIssues)
                setIssues(filteredIssues);
            });
        } catch (error) {
            console.error('GitHub API Error:', error);
            if ((error as any).status === 429) {
                setRateLimitExceeded(true);
            }
        }
        };

        fetchRepoDetails();
    }, [projects]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!projectData) {
        return <div>Project not found</div>;
    }
    console.log(issues,'test')

    return (
        <>
            {rateLimitExceeded && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 text-center">
                    Rate limit exceeded. Please wait {retryAfter} seconds before trying again.
                </div>
            )}
            <div className='flex'>
            <Sidebar/>
            <div className='w-[85%]'>
                <Topbar nav="projects"/>
                <div className="px-4 py-8 flex pt-20">
                    <div className="w-[300px]">
                        <div>
                            <img src={projects[0]?.image_url} className="w-full rounded-xl"></img>
                            <hr className="text-gray-800 mt-4"></hr>
                            <div>
                                <h2 className="text-xl font-bold pt-4">Owner</h2>
                                <div className="flex pt-2 space-x-2">
                                    {projects[0]?.contributors?.collabs?.map((collab: any) => (
                                        <div key={collab.id} className="flex items-center">
                                            {
                                                collab.permissions?.admin==true ? 
                                                <>
                                                      <img 
                                                        src={collab.avatar_url} 
                                                        alt={collab.login}
                                                        className="w-7 h-7 rounded-full"
                                                        />
                                                        <p className="px-3">{collab.login}</p>
                                                </>:
                                                <></>
                                                    
                                                
                                            }
                                            
                                        </div>
                                    ))}
                                
                                </div>
                            </div>
                            <hr className="text-gray-800 mt-4"></hr>
                            <div>
                                <h2 className="text-xl font-bold pt-4">Contributors</h2>
                                <div className=" pt-2 space-x-2">
                                    <div className="flex space-x-2">
                                    {projects[0]?.contributors?.collabs?.map((collab: any) => (
                                        <div key={collab.id} className="flex items-center">
                                            <img 
                                                src={collab.avatar_url} 
                                                alt={collab.login}
                                                className="w-7 h-7 rounded-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[calc(98%_-_320px)] pt-4 ml-[20px]">
                        <div>
                            <div>
                            <div>
                                    <h1 className="text-3xl font-bold">
                                        {projects[0]?.project_repository}
                                    </h1>
                            </div>
                            
                            <div className={`text-gray-400 pt-4 h-[${width}] overflow-hidden`}>
                                {projects[0]?.aiDescription}                         
                            </div>
                            <div className="text-center">
                                <button onClick={handleResize} className="text-center bg-white text-black rounded px-2 py-1 ">
                                    {isExpanded ? 'Show Less' : 'Show More'}
                                </button>
                            </div>
                            </div>
                            

                            <div className="border-gray-800 border-1 rounded-xl p-4 mt-7">
                                <div>
                                    <h1 className="text-xl font-bold">Issues</h1>
                                </div>
                                {
                                    issues.map((issue:any)=>{
                                        return(
                                           <>
                                                <div className="mt-2 p-4 border-gray-800 border-1 rounded-xl">
                                                <div className="flex justify-between"> 
                                                    <div>
                                                        <div className="flex justify-between">
                                                        <h1 className="text-[18px] font-bold">{issue.title}</h1>
                                                        <div className="flex ">
                                                       
                                                        </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex mx-1">
                                                    <a href={issue.html_url} className="mx-4 bg-gray-600 rounded-full px-2 py-1" key={issue.id} target="_blank" rel="noopener noreferrer">

                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 6.1a.31.31 0 0 0-.45.32a2.47 2.47 0 0 0 .51 1.22l.15.13A3 3 0 0 1 9.08 10a3.63 3.63 0 0 1-3.55 3.44a3 3 0 0 1-2.11-.85a3 3 0 0 1-.85-2.22A3.55 3.55 0 0 1 3.63 8a3.66 3.66 0 0 1 1.5-.91A5.2 5.2 0 0 1 5 6v-.16a4.84 4.84 0 0 0-2.31 1.3a4.5 4.5 0 0 0-.2 6.37a4.16 4.16 0 0 0 3 1.22a4.8 4.8 0 0 0 3.38-1.42a4.52 4.52 0 0 0 .21-6.38A4.2 4.2 0 0 0 8 6.1"/><path fill="currentColor" d="M13.46 2.54a4.16 4.16 0 0 0-3-1.22a4.8 4.8 0 0 0-3.37 1.42a4.52 4.52 0 0 0-.21 6.38A4.2 4.2 0 0 0 8 9.9a.31.31 0 0 0 .45-.31a2.4 2.4 0 0 0-.52-1.23l-.15-.13A3 3 0 0 1 6.92 6a3.63 3.63 0 0 1 3.55-3.44a3 3 0 0 1 2.11.85a3 3 0 0 1 .85 2.22A3.55 3.55 0 0 1 12.37 8a3.66 3.66 0 0 1-1.5.91a5.2 5.2 0 0 1 .13 1.14v.16a4.84 4.84 0 0 0 2.31-1.3a4.5 4.5 0 0 0 .15-6.37"/></svg>
                                                    </a>
                                                        {issue.assignees.map((assignee:any)=>{
                                                            return(
                                                                <>
                                                                    
                                                                    <img src={assignee.avatar_url} className="-mr-1 w-6 h-6 rounded-full"></img>
                                                                    
                                                                </>
                                                            )
                                                        })}

                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between pt-1">
                                                        <p className="text-[14px] text-gray-400">
                                                        {Math.floor((new Date().getTime() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                                        </p>
                                                        <p className="text-[14px] text-gray-400 flex px-1">
                                                            Assigned to {issue.assignees.slice(0, 2).map((assignee:any)=>{
                                                            return(
                                                                <>  
                                                                <div></div>
                                                                <div className="px-[3px]">{assignee.login}</div>
                                                                
                                                                </>
                                                            )
                                                            })}{issue.assignees.length > 2 && '...'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex text-end mt-4 space-x-4 w-[100%]">
                                                    <div className="flex w-full justify-between">
                                                        
                                                            <Link 
                                                                href={{
                                                                    pathname: `/projects/${projects[0]?.project_repository}/${issue.number}`,
                                                                    query: {
                                                                        collabs: JSON.stringify(projects[0]?.contributors?.collabs?.map((c: any) => ({
                                                                            login: c.login,
                                                                        })))
                                                                    }
                                                                }}
                                                            >
                                                                <button className="bg-white text-black px-2 py-1 rounded">Contribute Now</button>
                                                                
                                                            </Link>
                                                            <div>
                                                                {
                                                                    projects.map((project: any) => {
                                                                        if (project.project_issues.includes(issue.number.toString())) {
                                                                            return (
                                                                                <div key={project.id} className="text-gray-300 text-bold">{project.rewardAmount} ETH</div>
                                                                            );
                                                                        }
                                                                    })
                                                                }
                                                                
                                                            </div>
                                                            
                                                    </div>
                                                </div>
                                                </div>        
                                                   
                                           </> 
                                        ) 
                                    })

                                }
                                
                            </div>
                        
                        </div>
                    </div>
                </div>
            </div>
            </div>
            </>
    );
}

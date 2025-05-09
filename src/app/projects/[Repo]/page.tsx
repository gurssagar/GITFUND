'use client'
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useState, useEffect, useCallback } from "react";
import { Octokit } from "octokit";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { Groq } from 'groq-sdk';
import Link from 'next/link';
import { format } from 'date-fns'; // Add import for format
import { useSidebarContext } from '@/assets/components/SidebarContext';
import {isShrunk} from '@/assets/components/SidebarContext'
import {
    FaJs, FaPython, FaHtml5, FaCss3Alt, FaReact, FaNodeJs, FaJava, FaPhp, FaRust, FaSwift, FaDocker, FaGitAlt, FaSass, FaVuejs, FaAngular, FaDatabase, FaLinux, FaApple, FaWindows, FaAndroid, FaCode, FaTerminal, FaMarkdown
} from 'react-icons/fa';
import {
    SiTypescript, SiSolidity, SiCplusplus, SiGo, SiKotlin, SiRuby, SiPerl, SiScala, SiLua, SiDart, SiElixir, SiClojure, SiR, SiAssemblyscript, SiGnubash, SiGraphql, SiKubernetes, SiTerraform, SiSwift
} from 'react-icons/si';

interface ProjectData {
    projectOwner: string;
    project_repository: string;
    // Add other properties as needed
}

export default function Project() {
    const params = useParams();
    const session = useSession();
    const Repo = params?.Repo as string;
    const { isShrunk } = useSidebarContext();
    
    // State declarations
    const [aiReply, setAiReply] = useState("");
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<any>([]);
    const [issues, setIssues] = useState<any>([]);
    const [repoValue, setRepoValue] = useState<any>([]);
    const [contributors, setContributors] = useState<any>([]);
    const [languages, setLanguages] = useState<any>({});
    const [commitData, setCommitData] = useState<any>([]);
    const [collabs, setCollabs] = useState<any>([]);
    const [width, setWidth] = useState('300px');
    const [isExpanded, setIsExpanded] = useState(false);

    const octokit = new Octokit({
        auth: (session?.data as any)?.accessToken,
    });

    // Helper Functions
    const fetchWithRetry = useCallback(async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
        try {
            return await fn();
        } catch (error: any) {
            if (error.status === 429 && retries > 0) {
                const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
                setRetryAfter(retryAfter);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
                return fetchWithRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }, []);

    const getLanguageIcon = (lang: string) => {
        const lowerLang = lang.toLowerCase();
        // Prioritize specific languages first
        switch (lowerLang) {
            case 'javascript':
                return <FaJs className="mr-1" size={30} />;
            case 'typescript':
                return <SiTypescript className="mr-1" size={30} />;
            case 'python':
                return <FaPython className="mr-1" size={30} />;
            case 'java':
                return <FaJava className="mr-1" size={30} />;
            case 'c++': case 'cpp':
                return <SiCplusplus className="mr-1" size={30} />;
            case 'c': // Often just 'c'
                return <SiCplusplus className="mr-1" size={30} />; // Using C++ icon as a fallback
            case 'php':
                return <FaPhp className="mr-1" size={30} />;
            case 'ruby':
                return <SiRuby className="mr-1" size={30} />;
            case 'go': case 'golang':
                return <SiGo className="mr-1" size={30} />;
            case 'rust':
                return <FaRust className="mr-1" size={30} />;
            case 'swift':
                return <SiSwift className="mr-1" size={30} />;
            case 'kotlin':
                return <SiKotlin className="mr-1" size={30} />;
            case 'scala':
                return <SiScala className="mr-1" size={30} />;
            case 'perl':
                return <SiPerl className="mr-1" size={30} />;
            case 'lua':
                return <SiLua className="mr-1" size={30} />;
            case 'dart':
                return <SiDart className="mr-1" size={30} />;
            case 'r':
                return <SiR className="mr-1" size={30} />;
            case 'solidity':
                return <SiSolidity className="mr-1" size={30} />;
            case 'html': case 'html5':
                return <FaHtml5 className="mr-1" size={30} />;
            case 'css': case 'css3':
                return <FaCss3Alt className="mr-1" size={30} />;
            case 'sass': case 'scss':
                return <FaSass className="mr-1" size={30} />;
            case 'sql': // Generic SQL
                return <FaDatabase className="mr-1" size={30} />;
            case 'shell': case 'bash': case 'sh':
                return <SiGnubash className="mr-1" size={30} />; // Or FaTerminal
            case 'assembly': case 'asm':
                return <SiAssemblyscript className="mr-1" size={30} />; // Using AssemblyScript icon
            case 'objective-c': // Often 'objective-c'
                return <FaApple className="mr-1" size={30} />; // Using Apple icon as fallback
            case 'elixir':
                return <SiElixir className="mr-1" size={30} />;
            case 'clojure':
                return <SiClojure className="mr-1" size={30} />;
            case 'vue': case 'vue.js':
                return <FaVuejs className="mr-1" size={30} />;
            case 'react': case 'react.js':
                return <FaReact className="mr-1" size={30} />;
            case 'angular': case 'angular.js':
                return <FaAngular className="mr-1" size={30} />;
            case 'node.js': case 'node':
                return <FaNodeJs className="mr-1" size={30} />;
            case 'dockerfile':
                return <FaDocker className="mr-1" size={30} />;
            case 'graphql':
                return <SiGraphql className="mr-1" size={30} />;
            case 'kubernetes': case 'k8s':
                return <SiKubernetes className="mr-1" size={30} />;
            case 'terraform':
                return <SiTerraform className="mr-1" size={30} />;
            case 'markdown': case 'md':
                return <FaMarkdown className="mr-1" size={30} />;
            // Default fallback icon
            default:
                return <FaCode className="mr-1" size={30} />; // Generic code icon
        }
    };

    const handleResize = () => {
        if (isExpanded) {
            setWidth('300px');
        } else {
            setWidth('80%');
        }
        setIsExpanded(!isExpanded);
    };

    const formatCommitDate = (dateString: any) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM.');
    };

    const getCommitColor = (sha: any) => {
        const colors = ['bg-green-600', 'bg-purple-600', 'bg-blue-600'];
        return colors[sha.charCodeAt(0) % colors.length];
    };

    // Fetch project data and project details in one useEffect
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!Repo) return;
            
            try {
                setIsLoading(true);
                const response = await fetch('/api/add-issues');
                const data = await response.json();
                
                // Find the current project
                const filteredProjects = data.projects.filter(
                    (project: any) => project.project_repository === Repo
                );
                
                setProjects(filteredProjects);
                
                // Set project data for the first matching project
                if (filteredProjects.length > 0) {
                    setProjectData({
                        projectOwner: filteredProjects[0].projectOwner,
                        project_repository: filteredProjects[0].project_repository
                    });
                }
            } catch (error) {
                console.error('Error fetching project data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [Repo]);

    // Fetch repository details, contributors, languages, readme, and commits in one useEffect
    useEffect(() => {
        if (!projectData || !octokit) return;

        const fetchRepositoryDetails = async () => {
            try {
                // Check authentication status first
                try {
                    const authRes = await octokit.rest.users.getAuthenticated();
                    console.log("✅ Authenticated as:", authRes.data.login);
                } catch (error: any) {
                    console.error("❌ Not authenticated:", error.message);
                    return; // Exit if not authenticated
                }

                // Create promise array for parallel requests
                const promises = [
                    // 1. Fetch contributors
                    octokit.request(`GET /repos/${projectData.projectOwner}/${projectData.project_repository}/contributors`, {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
                    }).then(response => setContributors(response.data)),
                    
                    // 2. Fetch languages
                    octokit.request(`/repos/${projectData.projectOwner}/${projectData.project_repository}/languages`, {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
                    }).then(response => setLanguages(response.data)),
                    
                    // 3. Fetch README
                    octokit.request(`GET /repos/${projectData.projectOwner}/${projectData.project_repository}/readme`, {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
                    }).then(response => {
                        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                        setRepoValue([{
                            ...response.data,
                            content: content,
                            __html: content
                        }]);
                    }),
                    
                    // 4. Fetch collaborators
                    octokit.request(`GET /repos/${projectData.projectOwner}/${projectData.project_repository}/collaborators`, {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
                    }).then(response => setCollabs(response.data)),
                    
                    // 5. Fetch commits
                    octokit.request(`/repos/${projectData.projectOwner}/${projectData.project_repository}/commits`, {
                        owner: projectData.projectOwner,
                        repo: projectData.project_repository,
                        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
                    }).then(response => setCommitData(response.data))
                ];

                // Execute all promises in parallel
                await Promise.allSettled(promises);
                
            } catch (error) {
                console.error('Error fetching repository details:', error);
            }
        };

        fetchRepositoryDetails();
    }, [projectData, octokit]);

    // Fetch issues once projects are loaded
    useEffect(() => {
        const fetchIssues = async () => {
            if (!projects.length || !projectData || !octokit) return;
            
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
                    
                    // Filter issues that match the current repository
                    const filteredIssues = response.data.filter((issue: any) => {
                        return projects.some((project: any) => 
                            project.project_issues && 
                            project.project_issues.includes(issue.number.toString())
                        );
                    });
                    
                    setIssues(filteredIssues);
                });
            } catch (error) {
                console.error('GitHub API Error:', error);
                if ((error as any).status === 429) {
                    setRateLimitExceeded(true);
                }
            }
        };

        fetchIssues();
    }, [projects, projectData, octokit, fetchWithRetry]);


    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!projectData) {
        return <div>Project not found</div>;
    }

    return (
        <>
            {rateLimitExceeded && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 dark:text-white text-black p-4 text-center">
                    Rate limit exceeded. Please wait {retryAfter} seconds before trying again.
                </div>
            )}
            <div className='flex'>
            <Sidebar/>
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
            <Topbar/>
                <div className="px-4 py-8 flex pt-20">
                    <div className="w-[300px]">
                        <div>
                            <img src={projects[0]?.image_url} className="w-full rounded-xl" alt="Project" />
                            <hr className="text-gray-800 mt-4"></hr>
                            <div>
                                <h2 className="text-xl font-bold pt-4">Owner</h2>
                                <div className="flex pt-2 space-x-2">
                                    {projects[0]?.contributors?.collabs?.map((collab: any) => (
                                        collab.permissions?.admin === true && (
                                            <div key={collab.id} className="flex items-center">
                                                <img 
                                                    src={collab.avatar_url} 
                                                    alt={collab.login}
                                                    className="w-7 h-7 rounded-full"
                                                />
                                                <p className="px-3">{collab.login}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                            <hr className="text-gray-800 mt-4"></hr>
                            <div>
                                <h2 className="text-xl font-bold pt-4">Contributors</h2>
                                <div className="pt-2 space-x-2">
                                    <div className="flex space-x-2">
                                    {contributors.map((collab: any) => (
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
                            <hr className="text-gray-800 mt-4"></hr>
                            <div>
                                <h2 className="text-xl font-bold pt-4">Languages</h2>
                                <div className="pt-2 space-x-2">
                                    <div className="flex space-x-2">
                                    {Object.keys(languages).map((lang: any) => (
                                        <div key={lang} className="flex items-center">
                                            {getLanguageIcon(lang)}
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
                                {projects[0]?.aiDescription || aiReply}                         
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
                                {issues.map((issue: any) => (
                                    <div key={issue.id} className="mt-2 p-4 border-gray-800 border-1 rounded-xl">
                                        <div className="flex justify-between"> 
                                            <div>
                                                <div className="flex justify-between gap-2">
                                                    <h1 className="text-[18px] font-bold">{issue.title}</h1>
                                                    <div className="flex gap-2">
                                                        {projects[0].priority && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                projects[0].priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                                                projects[0].priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {projects[0].priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex"></div>
                                                </div>
                                            </div>
                                            <div className="flex mx-1">
                                                <a href={issue.html_url} className="mx-4 bg-gray-600 rounded-full px-2 py-1" target="_blank" rel="noopener noreferrer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                                                        <path fill="currentColor" d="M8 6.1a.31.31 0 0 0-.45.32a2.47 2.47 0 0 0 .51 1.22l.15.13A3 3 0 0 1 9.08 10a3.63 3.63 0 0 1-3.55 3.44a3 3 0 0 1-2.11-.85a3 3 0 0 1-.85-2.22A3.55 3.55 0 0 1 3.63 8a3.66 3.66 0 0 1 1.5-.91A5.2 5.2 0 0 1 5 6v-.16a4.84 4.84 0 0 0-2.31 1.3a4.5 4.5 0 0 0-.2 6.37a4.16 4.16 0 0 0 3 1.22a4.8 4.8 0 0 0 3.38-1.42a4.52 4.52 0 0 0 .21-6.38A4.2 4.2 0 0 0 8 6.1"/>
                                                        <path fill="currentColor" d="M13.46 2.54a4.16 4.16 0 0 0-3-1.22a4.8 4.8 0 0 0-3.37 1.42a4.52 4.52 0 0 0-.21 6.38A4.2 4.2 0 0 0 8 9.9a.31.31 0 0 0 .45-.31a2.4 2.4 0 0 0-.52-1.23l-.15-.13A3 3 0 0 1 6.92 6a3.63 3.63 0 0 1 3.55-3.44a3 3 0 0 1 2.11.85a3 3 0 0 1 .85 2.22A3.55 3.55 0 0 1 12.37 8a3.66 3.66 0 0 1-1.5.91a5.2 5.2 0 0 1 .13 1.14v.16a4.84 4.84 0 0 0 2.31-1.3a4.5 4.5 0 0 0 .15-6.37"/>
                                                    </svg>
                                                </a>
                                                {issue.assignees.map((assignee: any) => (
                                                    <img 
                                                        key={assignee.id}
                                                        src={assignee.avatar_url}
                                                        alt={assignee.login} 
                                                        className="-mr-1 w-6 h-6 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between pt-1">
                                                <p className="text-[14px] text-gray-400">
                                                    {Math.floor((new Date().getTime() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                                </p>
                                                <p className="text-[14px] text-gray-400 flex px-1">
                                                    Assigned to {issue.assignees.slice(0, 2).map((assignee: any, index: number) => (
                                                        <span key={assignee.id}>
                                                            {index > 0 && ", "}
                                                            <span className="px-[3px]">{assignee.login}</span>
                                                        </span>
                                                    ))}
                                                    {issue.assignees.length > 2 && '...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex text-end mt-4 space-x-4 w-[100%]">
                                            <div className="flex w-full justify-between">
                                                <Link 
                                                    href={{
                                                        pathname: `/projects/${projects[0]?.project_repository}/${issue.number}`,
                                                        query: {
                                                            collabs: JSON.stringify(projects[0]?.projectOwner)
                                                        }
                                                    }}
                                                >
                                                    <button className="dark:bg-white bg-black text-white  dark:text-black  px-2 py-1 rounded">Contribute Now</button>
                                                </Link>
                                                <div>
                                                    {projects.map((project: any) => (
                                                        project.project_issues && project.project_issues.includes(issue.number.toString()) && (
                                                            <div key={project.id} className="dark:text-gray-300  text-gray-900 text-bold">{project.rewardAmount} ETH</div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 w-full border border-rounded-full border-gray-800 rounded-lg p-4">
                                <h2 className="text-2xl font-bold mb-4 dark:text-white text-black">Recent Activity</h2>
                                
                                {commitData && commitData.length > 0 ? (
                                    <div className="space-y-2">
                                        {commitData.slice(0, 10).map((commit: any, index: number) => (
                                            <div key={commit.sha} className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className={`${getCommitColor(commit.sha)} dark:text-white text-black px-2 py-1 rounded-md mr-3`}>
                                                        <span className="text-xs">{index + 2970}</span>
                                                    </div>
                                                    <a 
                                                        href={commit.html_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="dark:text-white text-black hover:underline"
                                                    >
                                                        {commit.commit.message.split('\n')[0]}
                                                    </a>
                                                </div>
                                                <div className="text-gray-400 text-sm">
                                                    {formatCommitDate(commit.commit.committer?.date || commit.commit.author?.date)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No recent commits found</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}
'use client'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Calendar, User, GitPullRequest, WarehouseIcon as Repository } from "lucide-react"
import {useSession} from 'next-auth/react'
import { useSearchParams  } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { useSidebarContext } from "@/assets/components/SidebarContext"
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
interface RepositoryData {
  project_repository: string;
  projectOwner: string;
  projectName: string;
  aiDescription: string;
  stars: number;
  forks: number;
  contributors: string[];
}

interface IssueData {
  id: string;
  issue_name: string;
  priority: string;
  project_issues: string;
  rewardAmount: string;
  issue_description: string;
  publisher: string;
  issue_date: string;
  comments: number;
}

interface PageProps {
  params: { owner: string; name: string }
}


interface User {
  name?: string | null;
  email?: string | null;
  username?: string | null;
}

export default function RepositoryIssuesPage({ params }: PageProps) {
  const { isShrunk } = useSidebarContext();
  const {data:session} = useSession();
  const [repoData,setRepoData]=useState<RepositoryData | null>(null)
  const [issues,setIssues]=useState<IssueData[]>([]);
  useEffect(() => {
    fetchData();
  }, [session]);
  const searchParams=useSearchParams();
  const repository = searchParams?.get('repo');
  console.log(repository)

  const fetchData = async () => {
  const repositories = await fetch(`/api/manageProjects?projectOwner=${(session?.user as User)?.username}`,{
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const repositoryData=await repositories.json()
  for(let i=0;i<repositoryData.project.length;i++){
    if(repositoryData.project[i].project_repository==repository){
        setRepoData(repositoryData.project[i]);
        console.log(repositoryData.project[i])
    }
  }
  
  
  }
  
  
  useEffect(() => {
    const Issues=async() => {
        const response=await fetch(`/api/add-issues?project_repository=${repository}`,{
            method:'GET',

        })
        const ResposeData=await response.json();
        setIssues(ResposeData.projects)
    }
    Issues();
  },[])
  console.log(issues)

  const { owner, name } = params
  
  


  return (
    <div className="flex">
                  <Sidebar />
                  <div
                    className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
                  >
                    <Topbar />
                    {
                      !repoData ? (
                      <div className="container mx-auto mt-16 py-8 px-4">
                        <div className="mb-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>

                          <div className="flex justify-between items-center gap-3 mb-4">
                            <div>
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                              <div className="mt-2">
                                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 w-32 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex gap-3 mt-6">
                                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 mb-6">
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                            <div className="flex items-center gap-4">
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          </div>

                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
                              <div className="space-y-4">
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="flex gap-4">
                                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      ) : (<>

                      <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm" className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 text-black dark:text-white">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Repositories
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-center gap-3 mb-4">
          <div>
            <Repository className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">{repoData?.project_repository}</h1>
            <p className="text-muted-foreground">
              {repoData?.projectOwner}/{repoData?.projectName}
            </p>
          </div>
          </div>
          
          <div>
                          <div className="flex gap-3 mt-6">
                            <a href={`/create-issues`} target="_blank" rel="">
                              <button className="flex items-center px-5 py-2 bg-black text-white rounded-md font-medium dark:bg-white dark:text-black  hover:bg-gray-800 transition">
                                <span className="mr-2 text-lg">+</span>
                                Add Issue
                              </button>
                            </a>
                            <a
                              href={`https://github.com/${repoData.projectOwner}/${repoData.project_repository}`}
                              target="_blank"
                              rel=""
                              className="flex items-center px-5 py-2 border border-gray-300 rounded-md font-medium hover:dark:text-black hover:dark:bg-white  transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-5 h-5 mr-2"
                              >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                              </svg>
                              View on GitHub
                            </a>
                          </div>
                        </div>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">{repoData?.aiDescription}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>⭐ {repoData?.stars} stars</span>
            <span>🍴 {repoData?.forks} forks</span>
            <span>👁️ {repoData?.contributors?.length} watchers</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Issues ({issues.length})</h2>
      </div>

      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{issue.issue_name}</CardTitle>
                    <Badge
                      variant={issue.priority === "low" ? "destructive" : "secondary"}
                      className={issue.priority === "low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                    >
                      {issue.priority}
                    </Badge>
                  </div>
                  <CardDescription>Issue #{issue.project_issues}</CardDescription>
                </div>
                <div>
                    <div className="flex gap-1 text-neutral-300 font-bold text-xl">
                        <Image src={`/pharos_small.png`} alt="Pharos" width={20} height={20} />
                        {issue.rewardAmount} 
                    </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground h-12 line-clamp-2">{issue.issue_description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {issue.publisher}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(issue.issue_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {issue.comments} comments
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Button className="w-full">
                  <Link href={`/myProjects/Issues/pullRequests?issues=${issue.project_issues}&repo=${repository}`}>View Pull Requests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No issues found for this repository.</p>
        </div>
      )}
    </div>
                      </>)
                    }
    
    </div>
    </div>
  )
}

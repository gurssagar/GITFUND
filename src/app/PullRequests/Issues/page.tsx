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
interface PageProps {
  params: { owner: string; name: string }
}

export default function RepositoryIssuesPage({ params }: PageProps) {
  const { isShrunk } = useSidebarContext();
  const {data:session} = useSession();
  const [repoData,setRepoData]=useState([])
  const [issues,setIssues]=useState([]);
  useEffect(() => {
    fetchData();
  }, [session]);
  const searchParams=useSearchParams();
  const repository = searchParams?.get('repo');
  console.log(repository)

  const fetchData = async () => {
  const repositories = await fetch(`/api/manageProjects?projectOwner=${session?.user?.username}`,{
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

        <div className="flex items-center gap-3 mb-4">
          <Repository className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">{repoData?.project_repository}</h1>
            <p className="text-muted-foreground">
              {repoData?.projectOwner}/{repoData?.projectName}
            </p>
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
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{issue.issue_description}</p>

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
                  <Link href={`/PullRequests/Issues/pullRequests?issues=${issue.project_issues}&repo=${repository}`}>View Pull Requests</Link>
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
    </div>
    </div>
  )
}

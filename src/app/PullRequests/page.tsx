"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, Star, Eye, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import {useState,useEffect,useCallback} from "react"
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
export default function RepositoriesPage() {
  const {data:session} = useSession();
  const { isShrunk } = useSidebarContext();
  const [repoData,setRepoData]=useState([])
  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
  const repositories = await fetch(`/api/manageProjects?projectOwner=${session?.user?.username}`,{
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const repositoryData=await repositories.json()
  setRepoData(repositoryData.project);
  console.log(repositoryData.project)
  }
  
  

  return (
    <div className="flex">
              <Sidebar />
              <div
                className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
              >
                <Topbar />
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Repositories</h1>
        <p className="text-muted-foreground">Repositories with open issues and linked pull requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repoData.map((repo) => (
          <Card key={repo?.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{repo?.projectName}</CardTitle>
                  <CardDescription className="text-sm">
                    {repo?.projectOwner
                    }/{repo?.project_repository}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                {Object.keys(repo?.languages ?? []).map((language) => (
                    <span key={language}>{language}</span>
                  ))}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{repo?.longdis}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {repo?.stars}
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  {repo?.forks}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {repo?.contributors.length}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{repo?.openIssues} open issues</span>
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/pullRequests/Issues?repo=${repo?.project_repository}`}>View Issues</Link>
                </Button>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="flex gap-4 justify-center">
          {/* <Button asChild variant="outline" className="bg-white text-black">
            <Link href="/issues">View All Issues</Link>
          </Button>
          <Button asChild variant="outline" className="bg-white text-black">
            <Link href="/pull-requests">View All Pull Requests</Link>
          </Button> */}
        </div>
      </div>
    </div>
    <div>

    </div>
    </div>
    </div>
  )
}

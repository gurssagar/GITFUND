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

interface User {
  name?: string | null;
  email?: string | null;
  username?: string | null;
}

interface Repository {
  id: string;
  projectName: string;
  projectOwner: string;
  project_repository: string;
  languages: Record<string, number>;
  longdis: string;
  stars: number;
  forks: number;
  contributors: string[];
  openIssues: number;
}

export default function RepositoriesPage() {
  const {data:session} = useSession();
  const { isShrunk } = useSidebarContext();
  const [repoData,setRepoData]=useState<Repository[]>([])
  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (!session?.user) return;
    const repositories = await fetch(`/api/manageProjects?projectOwner=${(session.user as User)?.username}`,{
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
                className={` ${isShrunk ? "md:ml-[4rem] md:w-[calc(100%_-_4rem)]" : "md:ml-[16rem] md:w-[calc(100%_-_16rem)]"}`}
              >
                <Topbar />
    <div className="container mx-auto py-8 px-4 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-8 ">
        <h1 className="text-3xl font-bold mb-2">My Projects</h1>
        <p className="text-muted-foreground">Repositories with open issues and linked pull requests</p>
      </div>
      <div>
                              <Link href="/create-project">
                              <button className="bg-black dark:bg-white dark:text-black text-white rounded-lg px-4 py-2">
                                  + Add Project
                              </button>
                              </Link>
                          </div>
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
                  <Link href={`/myProjects/Issues?repo=${repo?.project_repository}`}>View Issues</Link>
                </Button>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {
        repoData.length === 0 && (
          <div className="text-center py-10">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                You haven't created or been assigned to any projects yet.
                            </p>
                            {/* Optional: Add a button to create a new project if applicable */}
                            {/* <div className="mt-6">
                                <Link href="/create-project">
                                    <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Create new project
                                    </a>
                                </Link>
                            </div> */}
                        </div>
        )
      }

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

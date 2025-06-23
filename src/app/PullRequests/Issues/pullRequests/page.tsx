'use client'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, GitPullRequest, Calendar, User, GitCommit, MessageSquare, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react";
import { Octokit } from "octokit"
import { useSearchParams  } from "next/navigation"
import { useMemo,useEffect,useState } from "react";
import { useSidebarContext } from "@/assets/components/SidebarContext"
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
interface PageProps {
  params: { owner: string; repository: string; issueNumber: string }
}

export default function IssuePullRequestsPage({ params }: PageProps) {
  const {data:session}=useSession();
  const searchParams = useSearchParams();
  const { isShrunk } = useSidebarContext();
  const repository=searchParams?.get('repo');;
  const issueNumber=searchParams?.get('issues');
  const [issue,setIssues]=useState();
  const [pullRequests,setPullRequests]=useState([]);
  const [PrUrls,setPrUrls]=useState([]);
  const owner=(session?.user as any)?.username;
  const octokit = useMemo(() => {
      if ((session as any)?.accessToken) {
        return new Octokit({
          auth: (session as any)?.accessToken,
        });
      }
      return null;
    }, [(session as any)?.accessToken]);
  console.log("Octokit:", session);
  
  //get issues
  useEffect(() => {
    const Issues=async() => {
        const response=await fetch(`/api/add-issues?project_repository=${repository}`,{
            method:'GET',

        })
        const ResposeData=await response.json();
        for(let i=0;i<ResposeData.projects.length;i++){
          if(ResposeData.projects[i].project_issues==issueNumber){
            setIssues(ResposeData.projects[i])
            console.log("tetsgsg",ResposeData.projects[i])
          }
        }
        
    }
    Issues();
  },[])
  console.log(issue)

  useEffect(() => {
    if (!octokit) {
      console.log("Octokit not initialized");
      return; // Explicit return (void)
    }
    else{
      const fetchData = async () => {
        try {
          const response = await octokit.request(
            `/repos/${owner}/${repository}/issues/${issueNumber}/timeline`,
            { owner, repo: repository, issue_number: issueNumber }
          );
          
          const pullRequestData=await response.data;
          const finalPR=pullRequestData.filter((item:any)=>item.event=="cross-referenced")
          for(let i=0;i<finalPR.length;i++){
            setPrUrls(prev => [...prev,finalPR[i]?.source?.issue?.pull_request?.html_url])
          }
          setPullRequests(finalPR)
          console.log("Response:", finalPR);
          // Handle response
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };
      fetchData();
    }
  }, [octokit, owner, repository, issueNumber]);
  console.log(PrUrls,"dshjdhshdsa")
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
          <Button variant="outline" size="sm" className="flex dark:bg-transparent dark:text-white  bg-white text-black">
            <Link href={`/repos/${owner}/${repository}/issues`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Issues</span>
            </Link>
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pull Requests</h1>
            <p className="text-muted-foreground">
              Pull requests linked to issue #{issueNumber} in {owner}/{issue?.project_repository}
            </p>
          </div>

          {/* Issue Summary Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg text-blue-900">{issue?.issue_name}</CardTitle>
                    {issue?.rewardAmount && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-400 font-semibold"
                      >
                        ${issue?.rewardAmount} Reward
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-blue-700">
                    Issue #{issue?.project_issues} • Opened by {issue?.publisher} on {new Date(issue?.issue_date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={issue?.high === "medium" ? "destructive" : "secondary"}
                  className={issue?.priority === "medium" ? "bg-green-100 text-green-800" : ""}
                >
                  {issue?.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 line-clamp-2">{issue?.issue_description}</p>
              
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Linked Pull Requests ({pullRequests.length})</h2>
      </div>

      <div className="space-y-4">
        {pullRequests.map((pr) => (
          <Card key={pr.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{pr.source.issue.title}</CardTitle>
                    <Badge
                      variant={pr.source.issue.state === "open" ? "default" : pr.source.issue.state === "merged" ? "secondary" : "destructive"}
                      className={
                        pr.source.issue.state === "open"
                          ? "bg-green-100 text-green-800"
                          : pr.source.issue.state === "merged"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {pr.source.issue.state}
                    </Badge>
                  </div>
                  <CardDescription>
                    Pull Request #{pr.source.issue.number} • {pr.baseBranch} ← {pr.headBranch}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{pr.source.issue.body}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {pr.source.issue.user.login}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(pr.source.issue.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {pr.source.issue.comments} comments
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">+{pr.additions}</span>
                <span className="text-red-600">-{pr.deletions}</span>
                <span className="text-muted-foreground">{pr.changedFiles} files changed</span>
              </div>

              

              <div className="border-t pt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  This pull request addresses issue #{issueNumber}: {issue?.project_repository}
                </div>
                <div>
                <a
                    href={pr.source.issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View PR
                  </a>
                  <Link
                    href={{
                      pathname: `/PullRequests/Issues/pullRequests/${pr.source.issue.number}`,
                      query: {
                        rewardAmount: issue?.rewardAmount,
                        issueNumber: pr.source.issue.number,
                        project: repository,
                        owner: owner,
                      },
                    }}
                  >
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      Review PR
                    </button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pullRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No pull requests are linked to this issue yet.</p>
            <p className="text-sm text-muted-foreground">
              Pull requests that reference issue #{issueNumber} will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  )
}

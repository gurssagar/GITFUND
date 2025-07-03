"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  GitPullRequest,
  WarehouseIcon as Repository,
  Plus,
  ExternalLink,
  Star,
  GitFork,
  Eye,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { RepositoryDescription } from "../../../components/repository-discription";

interface RepositoryData {
  project_repository: string;
  projectOwner: string;
  projectName: string;
  aiDescription: string;
  stars: number;
  forks: number;
  contributors: string[];
  languages?: Record<string, number>;
  longdis?: string;
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
  Difficulty?: string;
}

interface PageProps {
  params: { owner: string; name: string };
}

interface RepoUser {
  name?: string | null;
  email?: string | null;
  username?: string | null;
}

export default function RepositoryIssuesPage({ params }: PageProps) {
  const { isShrunk } = useSidebarContext();
  const { data: session } = useSession();
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const searchParams = useSearchParams();
  const repository = searchParams?.get("repo");

  // Generate intelligent description for repository
  const generateIntelligentDescription = useMemo(() => {
    if (!repoData) return "";

    if (repoData.aiDescription && repoData.aiDescription.trim()) {
      return repoData.aiDescription;
    }

    // Fallback: Generate description based on available data
    const languages = repoData.languages ? Object.keys(repoData.languages) : [];
    const primaryLanguage = languages.length > 0 ? languages[0] : "code";

    let description = `A ${primaryLanguage} project`;

    if (repoData.longdis && repoData.longdis.trim()) {
      description = repoData.longdis;
    } else {
      // Generate based on repository stats and context
      if (repoData.stars > 100) {
        description += " with a strong community following";
      }
      if (repoData.contributors && repoData.contributors.length > 5) {
        description += " actively maintained by multiple contributors";
      }
      if (languages.length > 1) {
        description += ` built with ${languages.slice(0, 3).join(", ")}`;
      }
      description += ". Open for contributions and collaboration.";
    }

    return description;
  }, [repoData]);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const repositories = await fetch(
        `/api/manageProjects?projectOwner=${
          (session?.user as RepoUser)?.username
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const repositoryData = await repositories.json();

      for (let i = 0; i < repositoryData.project.length; i++) {
        if (repositoryData.project[i].project_repository == repository) {
          setRepoData(repositoryData.project[i]);
          console.log(repositoryData.project[i]);
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching repository data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      if (!repository) return;

      try {
        const response = await fetch(
          `/api/add-issues?project_repository=${repository}`,
          {
            method: "GET",
          }
        );
        const responseData = await response.json();
        setIssues(responseData.projects || []);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      }
    };

    fetchIssues();
  }, [repository]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalRewardAmount = useMemo(() => {
    return issues.reduce(
      (sum, issue) => sum + Number.parseFloat(issue.rewardAmount || "0"),
      0
    );
  }, [issues]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${
            isMobile
              ? "ml-0 w-full"
              : isShrunk
              ? "ml-16 w-[calc(100%-4rem)]"
              : "ml-64 w-[calc(100%-16rem)]"
          }
        `}
      >
        <Topbar />

        {isLoading ? (
          // Loading State
          <div className="container mx-auto mt-16 md:mt-20 py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              {/* Header Skeleton */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Repository Info Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Issues Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4"
                  >
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !repoData ? (
          // Error State
          <div className="container mx-auto mt-16 md:mt-20 py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Repository className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Repository not found
              </h3>
              <p className="text-muted-foreground mb-4">
                The repository you're looking for doesn't exist or you don't
                have access to it.
              </p>
              <Button asChild>
                <Link href="/repositories">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Repositories
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Main Content
          <div className="container mx-auto mt-16 md:mt-20 py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 lg:mb-8">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 text-black dark:text-white"
              >
                <Link href="/repositories">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Repositories</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            </div>

            {/* Repository Info */}
            <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Repository className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {repoData.project_repository}
                      </h1>
                      <p className="text-sm lg:text-base text-muted-foreground truncate">
                        {repoData.projectOwner}/{repoData.projectName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                  <Link href="/create-issues" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="text-sm lg:text-base">Add Issue</span>
                    </Button>
                  </Link>
                  <a
                    href={`https://github.com/${repoData.projectOwner}/${repoData.project_repository}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="text-sm lg:text-base">
                        View on GitHub
                      </span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Repository Description Component */}
              <RepositoryDescription
                description={generateIntelligentDescription}
                repoData={repoData}
              />

              {/* Repository Stats */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm lg:text-base text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{repoData.stars || 0} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4 text-blue-500" />
                  <span>{repoData.forks || 0} forks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>{repoData.contributors?.length || 0} contributors</span>
                </div>
              </div>
            </div>

            {/* Issues Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-semibold">
                  Issues ({issues.length})
                </h2>
                {totalRewardAmount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Total rewards: {totalRewardAmount.toFixed(4)} PHAROS
                  </p>
                )}
              </div>
            </div>

            {/* Issues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2">
                            {issue.issue_name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs lg:text-sm">
                          Issue #{issue.project_issues}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-white dark:text-white font-bold text-sm lg:text-base">
                          <Image
                            src="/pharos_small.png"
                            alt="Pharos"
                            width={16}
                            height={16}
                            className="w-4 h-4 lg:w-5 lg:h-5"
                          />
                          {issue.rewardAmount}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 lg:space-y-4">
                    {/* Priority and Difficulty Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`text-xs ${getPriorityColor(
                          issue.priority
                        )}`}
                      >
                        {issue.priority?.charAt(0)?.toUpperCase() +
                          issue.priority?.slice(1)}{" "}
                        Priority
                      </Badge>
                      {issue.Difficulty && (
                        <Badge
                          className={`text-xs ${getDifficultyColor(
                            issue.Difficulty
                          )}`}
                        >
                          {issue.Difficulty?.charAt(0)?.toUpperCase() +
                            issue.Difficulty?.slice(1)}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs lg:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {issue.issue_description}
                    </p>

                    {/* Issue Meta Info */}
                    <div className="space-y-2 text-xs lg:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                        <span className="truncate">
                          Published by {issue.publisher}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                          <span>{formatDate(issue.issue_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                          <span>{issue.comments || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t">
                      <Button asChild className="w-full text-xs lg:text-sm">
                        <Link
                          href={`/myProjects/Issues/pullRequests?issues=${issue.project_issues}&repo=${repository}`}
                        >
                          <GitPullRequest className="h-4 w-4 mr-2" />
                          View Pull Requests
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {issues.length === 0 && (
              <div className="text-center py-12 lg:py-16">
                <div className="mx-auto max-w-md">
                  <MessageSquare className="h-12 w-12 lg:h-16 lg:w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">
                    No issues found
                  </h3>
                  <p className="text-sm lg:text-base text-muted-foreground mb-6">
                    This repository doesn't have any issues yet. Create your
                    first issue to get started.
                  </p>
                  <Link href="/create-issues">
                    <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Issue
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Calendar,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  User,
  GitBranch,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: number | string;
  projectName: string;
  shortdes: string;
  project_repository: string;
  project_description: string;
  project_icon_url?: string;
  project_leads?: { name: string; avatar_url?: string }[];
  contributors_count?: number;
  available_issues_count?: number | string;
  languages?: string[] | Record<string, number>;
  status: string;
  requestDate: string;
  name: string;
  description: string;
  image_url: string;
  projectOwner: string;
  skills: string[];
  issue: string;
}

interface AssignedIssue {
  id: number | string;
  projectName: string;
  Contributor_id: string;
  issue: string;
  image_url: string;
  name: string;
  description: string;
  rewardAmount: string;
  status: string;
  issue_date: string;
  issue_name: string;
  issue_description: string;
  priority: string;
  Difficulty: string;
  project_repository: string;
  publisher: string;
}

interface UserIssue {
  id: string;
  issue_name: string;
  publisher: string;
  issue_description: string;
  issue_date: string;
  Difficulty: string;
  priority: string;
  project_repository: string;
  project_issues: string;
  rewardAmount: string;
}

export default function Component() {
  const session = useSession();
  const currentUser = (session?.data?.user as any)?.username;
  const { isShrunk } = useSidebarContext();
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setAssignedIssues] = useState<AssignedIssue[]>([]);
  const [userIssues, setUserIssues] = useState<UserIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectsResponse, userIssues, assignedIssuesResponse] =
          await Promise.all([
            fetch("/api/add-projects", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }),
            fetch("/api/showIssues", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }),
            fetch(`/api/getContributions/?contributor=${currentUser}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }),
          ]);

        if (!userIssues.ok) {
          throw new Error(
            `Failed to fetch user contributor requests: ${userIssues.statusText}`
          );
        }

        if (!projectsResponse.ok) {
          throw new Error(
            `Failed to fetch projects: ${projectsResponse.statusText}`
          );
        }

        if (!assignedIssuesResponse.ok) {
          throw new Error(
            `Failed to fetch assigned issues: ${assignedIssuesResponse.statusText}`
          );
        }

        const projectsData = await projectsResponse.json();
        const assignedIssuesData = await assignedIssuesResponse.json();
        const issuesData = await userIssues.json();

        console.log("Issues Data:", issuesData);
        console.log("Assigned Issues Data:", assignedIssuesData);
        console.log("Projects Data:", projectsData);

        setUserIssues(issuesData.projects);
        setProjects(projectsData.project);
        setAssignedIssues(
          assignedIssuesData.project.filter(
            (issue: AssignedIssue) => issue.status === "assigned"
          ) || []
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setProjects([]);
        setAssignedIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, currentUser]);

  const filteredProjects = projects.filter((project) =>
    issues.some((issue) => issue.projectName === project.project_repository)
  );

  const filteredUserIssues = userIssues.filter((userIssue) =>
    issues.some(
      (issue) =>
        String(userIssue?.project_issues)?.trim()?.toLowerCase() ===
          String(issue?.issue)?.trim()?.toLowerCase() &&
        String(userIssue?.project_repository)?.trim()?.toLowerCase() ===
          String(issue?.projectName)?.trim()?.toLowerCase()
    )
  );

  const filteredIssues = issues.filter((issue) =>
    userIssues.some(
      (userIssue) =>
        String(userIssue?.project_issues)?.trim()?.toLowerCase() ===
          String(issue?.issue)?.trim()?.toLowerCase() &&
        String(userIssue?.project_repository)?.trim()?.toLowerCase() ===
          String(issue?.projectName)?.trim()?.toLowerCase()
    )
  );

  // Filter based on search and status
  const searchFilteredProjects = filteredProjects.filter((project) => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.shortdes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const searchFilteredIssues = filteredUserIssues.filter((issue) => {
    const matchesSearch =
      issue.issue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issue_description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "medium":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "low":
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Suspense>
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
            <div className="z-10 mt-16 bg-background p-4 lg:p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-600 rounded"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-600 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense>
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
          <div className="z-10 mt-16 bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4 lg:py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                      Assigned Projects & Issues
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Manage your projects and available bounty issues
                    </p>
                  </div>

                  {/* Search and Filter Section */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search projects or issues..."
                        className="pl-10 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 lg:py-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                          Total Projects
                        </p>
                        <p className="text-xl lg:text-2xl font-bold">
                          {searchFilteredProjects.length}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                          Available Issues
                        </p>
                        <p className="text-xl lg:text-2xl font-bold">
                          {searchFilteredIssues.length}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                          Total Rewards
                        </p>
                        <p className="text-lg lg:text-2xl font-bold">
                          {filteredUserIssues
                            .reduce(
                              (sum, issue) =>
                                sum + Number.parseFloat(issue.rewardAmount),
                              0
                            )
                            .toFixed(7)}{" "}
                          <span className="text-sm lg:text-base">PHAROS</span>
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Image
                          src="/pharos_small.png"
                          width={16}
                          height={16}
                          alt="Pharos Icon"
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                          In Progress
                        </p>
                        <p className="text-xl lg:text-2xl font-bold">
                          {
                            projects.filter((p) => p.status === "in-progress")
                              .length
                          }
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for Projects and Issues */}
              <Tabs defaultValue="projects" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-none lg:flex">
                  <TabsTrigger value="projects" className="text-xs sm:text-sm">
                    My Projects ({searchFilteredProjects.length})
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="text-xs sm:text-sm">
                    Available Issues ({searchFilteredIssues.length})
                  </TabsTrigger>
                </TabsList>

                {/* Projects Tab */}
                <TabsContent value="projects">
                  {searchFilteredProjects.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No projects found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "You haven't been assigned to any projects yet."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                      {searchFilteredProjects.map((project) => {
                        const daysAgo = getDaysAgo(project.requestDate);
                        return (
                          <Card
                            key={project.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2">
                                    {project.projectName}
                                  </CardTitle>
                                  <CardDescription className="text-xs lg:text-sm line-clamp-2">
                                    {project.shortdes}
                                  </CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 flex-shrink-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Contact Owner
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Leave Project
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 lg:space-y-4">
                              {/* Project Owner */}
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                                  <AvatarImage
                                    src={
                                      project.image_url || "/placeholder.svg"
                                    }
                                  />
                                  <AvatarFallback className="text-xs">
                                    {project.projectOwner
                                      ?.slice(0, 2)
                                      ?.toUpperCase() || "??"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs lg:text-sm text-muted-foreground truncate">
                                  Owner: {project.projectOwner}
                                </span>
                              </div>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-1">
                                {Object.keys(project.languages || {})
                                  .slice(0, 3)
                                  .map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {Object.keys(project.languages || {}).length >
                                  3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +
                                    {Object.keys(project.languages || {})
                                      .length - 3}
                                  </Badge>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <Link
                                  href={`/myProjects/Issues?repo=${project.project_repository}`}
                                  className="flex-1"
                                >
                                  <Button
                                    size="sm"
                                    className="w-full text-xs lg:text-sm"
                                  >
                                    View Project
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* Issues Tab */}
                <TabsContent value="issues">
                  {searchFilteredIssues.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No issues found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "No available issues at the moment."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                      {searchFilteredIssues.map((issue) => {
                        const daysAgo = getDaysAgo(issue.issue_date);
                        return (
                          <Card
                            key={issue.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2">
                                    {issue.issue_name}
                                  </CardTitle>
                                  <CardDescription className="text-xs lg:text-sm line-clamp-2">
                                    {issue.issue_description}
                                  </CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 flex-shrink-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      View Issue
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Apply to Work
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Contact Publisher
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Report Issue
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 lg:space-y-4">
                              {/* Priority and Difficulty */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  className={getPriorityColor(issue.priority)}
                                  variant="secondary"
                                >
                                  {issue.priority?.charAt(0)?.toUpperCase() +
                                    issue.priority?.slice(1) || "Unknown"}{" "}
                                  Priority
                                </Badge>
                                <Badge
                                  className={getDifficultyColor(
                                    issue.Difficulty
                                  )}
                                  variant="secondary"
                                >
                                  {issue.Difficulty?.charAt(0)?.toUpperCase() +
                                    issue.Difficulty?.slice(1) || "Unknown"}
                                </Badge>
                              </div>

                              {/* Reward Amount */}
                              <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                                <Image
                                  src="/pharos_small.png"
                                  width={24}
                                  height={24}
                                  alt="Pharos Icon"
                                  className="h-5 w-5 lg:h-6 lg:w-6"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs lg:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    Reward
                                  </p>
                                  <p className="text-sm lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                    {issue.rewardAmount} PHAROS
                                  </p>
                                </div>
                              </div>

                              {/* Repository Info */}
                              <div className="flex items-center gap-2 text-xs lg:text-sm">
                                <GitBranch className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Repository:
                                </span>
                                <span className="font-mono truncate">
                                  {issue.project_repository}
                                </span>
                              </div>

                              {/* Issue Date */}
                              <div className="flex items-center gap-2 text-xs lg:text-sm">
                                <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Posted:
                                </span>
                                <span className="truncate">
                                  {formatDate(issue.issue_date)} ({daysAgo} days
                                  ago)
                                </span>
                              </div>

                              {/* Publisher */}
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                                  <AvatarFallback className="text-xs">
                                    {issue.publisher
                                      ?.slice(0, 2)
                                      ?.toUpperCase() || "??"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs lg:text-sm text-muted-foreground truncate">
                                  Published by {issue.publisher}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button
                                  size="sm"
                                  className="flex-1 text-xs lg:text-sm"
                                >
                                  Apply to Work
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs lg:text-sm bg-transparent"
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

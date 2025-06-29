'use client'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Calendar, Clock, Filter, MoreHorizontal, Search, User, DollarSign, GitBranch, AlertCircle } from "lucide-react"
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import Link from "next/link";
interface Project {
    id: number | string;
    project_name: string;
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
    projectName: string;
    Contributor_id: string;
    contributor_email: string;
    requestDate: string;
    projectOwner: string | null;
    skills: string[];
    issue: string;
    image_url: string;
    name: string;
    description: string;
    status: string;
}

export default function Component() {
    const session = useSession();
    const currentUser = (session?.data?.user as any)?.username;
    const { isShrunk } = useSidebarContext();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [issues, setAssignedIssues] = useState<AssignedIssue[]>([]);
    const [userIssues, setUserIssues] = useState<UserIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [projectsResponse, userIssues, assignedIssuesResponse] = await Promise.all([
                    fetch("/api/add-projects", {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }),
                    fetch("/api/showIssues", {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }),
                    fetch(`/api/getContributions/?contributor=${currentUser}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    })
                ]);

                if (!userIssues.ok) {
                    throw new Error(`Failed to fetch user contributor requests: ${userIssues.statusText}`);
                }
                if (!projectsResponse.ok) {
                    throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
                }
                if (!assignedIssuesResponse.ok) {
                    throw new Error(`Failed to fetch assigned issues: ${assignedIssuesResponse.statusText}`);
                }

                const projectsData = await projectsResponse.json();
                const assignedIssuesData = await assignedIssuesResponse.json();
                const issuesData = await userIssues.json();
                console.log('Issues Data:', issuesData);
                console.log('Assigned Issues Data:', assignedIssuesData);
                console.log('Projects Data:', projectsData);
                setUserIssues(issuesData.projects);
                setProjects(projectsData.project);
                setAssignedIssues(assignedIssuesData.project.filter((issue: AssignedIssue) => issue.status === "assigned") || []);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setProjects([]);
                setAssignedIssues([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, currentUser]);
    
const filteredProjects = projects.filter(project => 
    issues.some(issue => issue.projectName === project.project_repository)
);


const filteredIssues = issues.filter(issue =>
    userIssues.some(assignedIssue => assignedIssue.project_issues === issue.issue && assignedIssue.projectName === issue.project_repository)
);
console.log('Filtered Projects:', filteredProjects);
console.log('Filtered Issues:', filteredIssues);
const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            case "in-progress":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "pending":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case "high":
            case "hard":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            case "medium":
                return "bg-orange-100 text-orange-800 hover:bg-orange-100"
            case "low":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case "hard":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            case "medium":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "low":
            case "easy":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const getDaysAgo = (dateString: string) => {
        const today = new Date()
        const date = new Date(dateString)
        const diffTime = today.getTime() - date.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <Suspense>
                <div className="flex">
                  <Sidebar />
                  <div
                    className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
                  >
                    <Topbar />
        <div className="mt-16 bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Assigned Projects & Issues</h1>
                            <p className="text-muted-foreground">Manage your projects and available bounty issues</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search projects or issues..." className="pl-10 w-64" />
                            </div>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-32">
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
            <main className="container mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                                    <p className="text-2xl font-bold">{projects.length}</p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available Issues</p>
                                    <p className="text-2xl font-bold">{issues.length}</p>
                                </div>
                                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                                    <p className="text-2xl font-bold">
                                        {issues.reduce((sum, issue) => sum + Number.parseFloat(issue.rewardAmount), 0).toFixed(3)} ETH
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold">{projects.filter((p) => p.status === "in-progress").length}</p>
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
                    <TabsList>
                        <TabsTrigger value="projects">My Projects ({projects.length})</TabsTrigger>
                        <TabsTrigger value="issues">Available Issues ({issues.length})</TabsTrigger>
                    </TabsList>

                    {/* Projects Tab */}
                    <TabsContent value="projects">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => {
                                const daysAgo = getDaysAgo(project.requestDate)
                                return (
                                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <CardTitle className="text-lg leading-tight">{project.projectName}</CardTitle>
                                                    <CardDescription className="text-sm line-clamp-2">{project.shortdes}</CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                                                        <DropdownMenuItem>Contact Owner</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">Leave Project</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            
                    

                                            {/* Project Owner */}
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={project.image_url || "/placeholder.svg"} />
                                                    <AvatarFallback className="text-xs">
                                                        {project.projectOwner?.slice(0, 2)?.toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">Owner: {project.projectOwner}</span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1">
                                                {Object.keys(project.languages || {}).map((skill, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Link href={`/myProjects/Issues?repo=${project.project_repository}`}>
                                                    <Button size="sm" className="flex-1">
                                                        View Project
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* Issues Tab */}
                    <TabsContent value="issues">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredIssues.map((issue) => {
                                const daysAgo = getDaysAgo(issue.issue_date)
                                return (
                                    <Card key={issue.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <CardTitle className="text-lg leading-tight">{issue.issue_name}</CardTitle>
                                                    <CardDescription className="text-sm line-clamp-2">{issue.issue_description}</CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Issue</DropdownMenuItem>
                                                        <DropdownMenuItem>Apply to Work</DropdownMenuItem>
                                                        <DropdownMenuItem>Contact Publisher</DropdownMenuItem>
                                                        <DropdownMenuItem>Report Issue</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Priority and Difficulty */}
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(issue.priority)}>
                                                    {issue.priority?.charAt(0)?.toUpperCase() + issue.priority?.slice(1) || 'Unknown'} Priority
                                                </Badge>
                                                <Badge className={getDifficultyColor(issue.Difficulty)}>
                                                    {issue.Difficulty?.charAt(0)?.toUpperCase() + issue.Difficulty?.slice(1) || 'Unknown'}
                                                </Badge>
                                            </div>

                                            {/* Reward Amount */}
                                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-800">Reward</p>
                                                    <p className="text-lg font-bold text-green-900">{issue.rewardAmount} ETH</p>
                                                </div>
                                            </div>

                                            {/* Repository Info */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Repository:</span>
                                                <span className="font-mono">{issue.project_repository}</span>
                                            </div>

                                            {/* Issue Date */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Posted:</span>
                                                <span>
                                                    {formatDate(issue.issue_date)} ({daysAgo} days ago)
                                                </span>
                                            </div>

                                            {/* Publisher */}
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {issue.publisher?.slice(0, 2)?.toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">Published by {issue.publisher}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" className="flex-1">
                                                    Apply to Work
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
        </div>
        </div>
    </Suspense>
    )
}

"use client";

import React, { useState, useEffect ,useMemo} from "react";
import { NextPage } from "next";
import {
  BarChart,
  Briefcase,
  CheckCircle,
  DollarSign,
  GitPullRequest,
  Star,
  User,
  MapPin,
  CalendarDays,
  Link as LinkIcon,
  Award,
  Activity as ActivityIcon,
} from "lucide-react"; // Example icons
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from 'next/navigation';
import { Octokit } from 'octokit';
import Image from "next/image";

// Add custom CSS for the contribution grid
import '@/app/userProfile/userProfile.css';
import { endOfYear } from "date-fns";

// GitHub contribution data interface
interface GitHubContribution {
  date: string;
  count: number;
  level: number;
  type?: string;
  repo?: string;
  description?: string;
  contributions?: Array<{
    type: string;
    repo: string;
    description: string;
    url?: string;
  }>;
}

interface GitHubStats {
  totalContributions: number;
  pullRequests: number;
  issues: number;
  repositories: number;
}

// Dummy data - replace with actual data fetching
const userData = {
  name: "Sarah Johnson",
  username: "@sarahdev",
  bio: "Full-stack developer passionate about React and TypeScript. Love contributing to open source projects.",
  email: "sarah@example.com",
  location: "San Francisco, CA",
  joinedDate: "2022-03-15",
  githubProfileUrl: "#",
  avatarUrl: "https://via.placeholder.com/150", // Replace with actual avatar URL
  rating: 4.8,
  skills: ["React", "TypeScript", "JavaScript", "Node.js", "Next.js", "Python"],
  totalEarnings: 2450,
  pullRequestsCount: 12,
  projectsContributed: 5,
  averageRating: 4.8,
};

const completedPRs = [
  {
    id: 1,
    title: "Fix SSR hydration mismatch in dynamic routes",
    project: "next.js",
    difficulty: "Medium",
    mergedDate: "2023-05-20",
    reward: 500,
    url: "#",
  },
  {
    id: 2,
    title: "Add TypeScript support for API routes",
    project: "next.js",
    difficulty: "Hard",
    mergedDate: "2023-05-15",
    reward: 350,
    url: "#",
  },
  {
    id: 3,
    title: "Improve error handling in useEffect",
    project: "react",
    difficulty: "Medium",
    mergedDate: "2023-05-10",
    reward: 400,
    url: "#",
  },
  {
    id: 4,
    title: "Add documentation for server components",
    project: "react",
    difficulty: "Easy",
    mergedDate: "2023-05-05",
    reward: 200,
    url: "#",
  },
];

const achievementsData = [
  {
    id: 1,
    title: "First Contribution",
    description: "Merged your first pull request",
    earnedDate: "2022-03-20",
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
  },
  {
    id: 2,
    title: "Big Earner",
    description: "Earned over $1000 in rewards",
    earnedDate: "2023-04-15",
    icon: <DollarSign className="w-8 h-8 text-yellow-500" />,
  },
  {
    id: 3,
    title: "Bug Hunter",
    description: "Fixed 10 critical bugs",
    earnedDate: "2023-05-01",
    icon: <Award className="w-8 h-8 text-blue-500" />,
  },
  {
    id: 4,
    title: "Team Player",
    description: "Contributed to 5 different projects",
    earnedDate: "2023-06-10",
    icon: <User className="w-8 h-8 text-purple-500" />,
  },
];

// Example data for contribution activity chart (replace with actual chart implementation)
const contributionActivityData = [
  { month: "Jan", contributions: 10, prs: 2, issues: 4, commits: 4 },
  { month: "Feb", contributions: 12, prs: 3, issues: 3, commits: 6 },
  { month: "Mar", contributions: 15, prs: 5, issues: 2, commits: 8 },
  { month: "Apr", contributions: 18, prs: 4, issues: 6, commits: 8 },
  { month: "May", contributions: 22, prs: 7, issues: 5, commits: 10 },
  { month: "Jun", contributions: 19, prs: 6, issues: 4, commits: 9 },
  { month: "Jul", contributions: 24, prs: 8, issues: 6, commits: 10 },
  { month: "Aug", contributions: 28, prs: 9, issues: 7, commits: 12 },
  { month: "Sep", contributions: 26, prs: 8, issues: 8, commits: 10 },
  { month: "Oct", contributions: 30, prs: 10, issues: 8, commits: 12 },
  { month: "Nov", contributions: 27, prs: 9, issues: 7, commits: 11 },
  { month: "Dec", contributions: 32, prs: 11, issues: 9, commits: 12 },
];

type TabName = "Overview" | "Pull Requests" | "Achievements" | "Activity";



// test


// Generate sample contribution data for the past ye




function Component() {
  interface RewardDay {
    date: string
    rewards: number
  }

  interface HoveredSquare {
    date: string
    rewards: number
    x: number
    y: number
  }

  interface PullRequest {
    rewardedAt: string
    projectName: string
    rewardAmount: number
    status: string
  }

  const [hoveredSquare, setHoveredSquare] = useState<HoveredSquare | null>(null)
  const [rewardData, setRewardData] = useState<PullRequest[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const searchParams = useSearchParams();
  const userFromQuery = searchParams?.get('user')

  // Track window size changes
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    handleResize() // Initial call
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch reward data
  useEffect(() => {
    async function fetchRewardData() {
      try {
        const userId = userFromQuery || 'current-user-id'
        const res = await fetch(`/api/handleReward?contributor=${userId}`)
        if (!res.ok) throw new Error('Failed to fetch reward data')
        
        const data = await res.json()
        if (!Array.isArray(data?.projects)) {
          throw new Error('Invalid reward data format')
        }
        const projects = data.projects
        setRewardData(projects)
      } catch (error) {
        console.error('Error fetching reward data:', error)
        setRewardData([])
      }
    }
    fetchRewardData()
  }, [userFromQuery])

  // Get color based on reward count
  const getContributionColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count < 2) return 'bg-green-200 dark:bg-green-900'
    if (count < 4) return 'bg-green-300 dark:bg-green-700'
    if (count < 6) return 'bg-green-400 dark:bg-green-600'
    return 'bg-green-500 dark:bg-green-500'
  }

  // Transform reward data into contribution format
  const contributionData: RewardDay[] = useMemo(() => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1) // January 1st of current year
    const endOfYear = new Date(now.getFullYear(), 11, 31) // December 31st of current year

    // Initialize empty contribution data for each day
    const result: RewardDay[] = []
    for (let d = new Date(startOfYear); d <= new Date(endOfYear); d.setDate(d.getDate() + 1)) {
      result.push({
        date: d.toISOString().split('T')[0],
        rewards: 0
      })
    }

    // Count rewards per day
    rewardData.forEach(reward => {
      if (!reward.rewardedAt) return
      
      try {
        const rewardDate = new Date(reward.rewardedAt)
        if (isNaN(rewardDate.getTime())) return
        
        const dateStr = rewardDate.toISOString().split('T')[0]
        const day = result.find(d => d.date === dateStr)
        if (day) day.rewards += 1
      } catch (e) {
        console.error('Invalid reward date format:', reward.rewardedAt)
      }
    })
    console.log(result, "result");
    return result
  }, [rewardData])

  // Group data by weeks (memoized)
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < contributionData.length; i += 7) {
      result.push(contributionData.slice(i, i + 7))
    }
    return result
  }, [contributionData])

  // Calculate total rewards
  const totalRewards = useMemo(() =>
    contributionData.reduce((sum, day) => sum + day.rewards, 0),
    [contributionData]
  )

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 bg-white dark:bg-neutral-900 rounded-lg border">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          <span className="block sm:inline">{totalRewards} rewards</span>
          <span className="block sm:inline sm:ml-1">in the last year</span>
        </h2>
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex mb-1 sm:mb-2 ml-6 sm:ml-8">
            {months.map((month, index) => (
              <div
                key={month}
                className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-left min-w-0"
                style={{
                  marginLeft: index === 0 ? "0" : "4px",
                  fontSize: windowWidth < 640 ? "10px" : "12px",
                }}
              >
                <span className="hidden sm:inline">{month}</span>
                <span className="sm:hidden">{month.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-1 sm:mr-2 text-xs text-gray-600 dark:text-gray-400">
              {/* Spacer for alignment */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div
                  key={day}
                  className="h-2  sm:h-3 flex items-center text-xs"
                  style={{
                    marginTop: index === 0 ? "0" : "4px",
                    fontSize: windowWidth < 640 ? "10px" : "12px",
                  }}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
              <div className="h-2 sm:h-3"></div> 
            </div>

            {/* Contribution grid */}
            <div className="flex gap-0.5 sm:gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                  {week.map((day: RewardDay, dayIndex: number) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-gray-400 ${getContributionColor(day.rewards)}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setHoveredSquare({
                          date: day.date,
                          rewards: day.rewards,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setHoveredSquare(null)}
                      onTouchStart={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setHoveredSquare({
                          date: day.date,
                          rewards: day.rewards,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onTouchEnd={() => {
                        setTimeout(() => setHoveredSquare(null), 2000)
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredSquare && (
            <div
              className="fixed z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none max-w-xs"
              style={{
                left: Math.min(Math.max(hoveredSquare.x, 10), windowWidth - 200),
                top: hoveredSquare.y - 50,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-medium whitespace-nowrap">
                {hoveredSquare.rewards} reward{hoveredSquare.rewards !== 1 ? "s" : ""}
              </div>
              <div className="text-gray-300 whitespace-nowrap">
                {new Date(hoveredSquare.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 text-xs text-gray-600 dark:text-gray-400 gap-2 sm:gap-0">
        <span className="text-xs sm:text-sm">Learn how we count contributions</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs">Less</span>
          <div className="flex gap-0.5 sm:gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
          </div>
          <span className="text-xs">More</span>
        </div>
      </div>
    </div>
  )
}





const UserProfilePage: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session, "session");
  // Define User interface to avoid type errors
  interface User {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    image_url?: string;
    Bio?: string;
    Location?: string;
    userName?: string;
    Linkedin?: string;
    Telegram?: string;
    Twitter?: string;
    [key: string]: any; // Allow for any additional properties
  }
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [contributionData, setContributionData] = useState<GitHubContribution[]>([]);
  const [TotalEarnings, updateEarnings] = useState<number | undefined>(undefined);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [rewardData, setRewardData] = useState<any[]>([]); // Adjust type as needed
  const [uniqueRewardDays, setUniqueRewardDays] = useState(0);

  const [githubStats, setGithubStats] = useState<GitHubStats>({
    totalContributions: 0,
    pullRequests: 0,
    issues: 0,
    repositories: 0
  });
  const [loadingContributions, setLoadingContributions] = useState(false);
  const searchParams = useSearchParams(); 
  const userFromQuery = searchParams?.get('user');


  useEffect(() => {
    const fetchEarnings = async () => {
      if (!userFromQuery) return;
      
      try {

        const rewards = await fetch(`/api/handleReward?contributor=${userFromQuery}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await fetch("/api/rewards", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (rewards.ok) {
          const data = await rewards.json();
          console.log(data, "rewards data");
          for(let i = 0; i < data.projects.length; i++) {
              setRewardAmount(prev => prev + (data.projects[i].rewardAmount || 0));
          }
          setRewardData(data.projects || []);

          // Calculate unique reward days from last 365 days
          const now = new Date();
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          
          const validDates = data.projects
            .map(pr => {
              if (!pr.rewardedAt) return null;
              try {
                const date = new Date(pr.rewardedAt);
                if (isNaN(date.getTime()) || date < oneYearAgo) return null;
                return date.toISOString().split('T')[0];
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[];
            
          setUniqueRewardDays(new Set(validDates).size);

          
          
          if (data.Rewards && Array.isArray(data.Rewards)) {
            // Filter and map rewards where Contributor_id matches userFromQuery
            const userRewards = data.Rewards
              .filter((reward: any) => reward.Contributor_id === userFromQuery)
              .map((reward: any) => Number(reward.value));
            
            // Calculate total earnings from filtered rewards
            const totalEarnings = userRewards.reduce((sum: number, value: number) => sum + value, 0);
            
            updateEarnings(totalEarnings);
          }
        } else {
          console.error('Failed to fetch earnings:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };
    
    fetchEarnings();
  }, [userFromQuery]);
  
  // console.log(userFromQuery, "userFromQuery");
  // console.log(TotalEarnings, "TotalEarnings");

  // Fetch GitHub contributions and stats
  const fetchGitHubData = async (username: string, accessToken?: string) => {
    if (!username) return;
    
    setLoadingContributions(true);
    try {
      const octokit = new Octokit({ 
        auth: accessToken || undefined
      });
      
      // Fetch user's events for contribution activity - get more items
      const { data: events } = await octokit.request('GET /users/{username}/events', {
        username: username,
        per_page: 100,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      
      // Fetch user's repositories
      const { data: repos } = await octokit.request('GET /users/{username}/repos', {
        username: username,
        per_page: 100,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      
      // Try to fetch contributor stats if available
      const contributorStats = [];
      try {
        // Get commit activity for user's owned repos
        for (const repo of repos.slice(0, 5)) { // Limit to first 5 repos to avoid rate limiting
          const { data: stats } = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
            owner: username,
            repo: repo.name,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          contributorStats.push({ repo: repo.name, stats });
        }
      } catch (error) {
        console.warn('Could not fetch contributor stats:', error);
      }
      
      // Process events to create contribution data for the last 365 days (full year)
      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);
      
      const contributionMap = new Map<string, {count: number, contributions: any[]}>();
      
      // Initialize all days in the last 365 days with 0 contributions
      for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        contributionMap.set(dateStr, {count: 0, contributions: []});
      }
      
      // Count contributions from events and store detailed information
      const relevantEvents = events.filter((event: any) => 
        ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'CommitCommentEvent', 'ReleaseEvent'].includes(event.type) &&
        new Date(event.created_at) >= yearAgo
      );
      
      relevantEvents.forEach((event: any) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (contributionMap.has(date)) {
          const current = contributionMap.get(date)!;
          current.count += 1;
          
          // Add detailed event information
          let description = '';
          const repo = event.repo?.name || '';
          
          switch (event.type) {
            case 'PushEvent':
              description = `Pushed ${event.payload?.commits?.length || 0} commit(s)`;
              break;
            case 'PullRequestEvent':
              description = `${event.payload?.action || ''} pull request: ${event.payload?.pull_request?.title || ''}`;
              break;
            case 'IssuesEvent':
              description = `${event.payload?.action || ''} issue: ${event.payload?.issue?.title || ''}`;
              break;
            case 'CreateEvent':
              description = `Created ${event.payload?.ref_type || ''}: ${event.payload?.ref || ''}`;
              break;
            case 'CommitCommentEvent':
              description = 'Commented on a commit';
              break;
            case 'ReleaseEvent':
              description = `Released ${event.payload?.release?.tag_name || ''}`;
              break;
            default:
              description = event.type;
          }
          
          current.contributions.push({
            type: event.type,
            repo,
            description,
            url: event.payload?.pull_request?.html_url || 
                 event.payload?.issue?.html_url || 
                 `https://github.com/${repo}`
          });
          
          contributionMap.set(date, current);
        }
      });
      
      // Convert to array and calculate levels
      const contributions: GitHubContribution[] = Array.from(contributionMap.entries())
        .map(([date, data]) => ({
          date,
          count: data.count,
          level: data.count === 0 ? 0 : data.count <= 2 ? 1 : data.count <= 5 ? 2 : data.count <= 10 ? 3 : 4,
          contributions: data.contributions
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setContributionData(contributions);
      
      // Calculate stats
      const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
      const pullRequests = relevantEvents.filter(e => e.type === 'PullRequestEvent').length;
      const issues = relevantEvents.filter(e => e.type === 'IssuesEvent').length;
      
      setGithubStats({
        totalContributions,
        pullRequests,
        issues,
        repositories: repos.length
      });
      
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
    } finally {
      setLoadingContributions(false);
    }
  };

  // Add an effect to fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch( `/api/publicProfile?username=${userFromQuery}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log(data, "datass");
          setUsers(data.user || []);
          
          // Find the current user from the query parameter
          if (userFromQuery && data.users) {
            const user = data.users.find((u: any) => u._id === userFromQuery);
            setCurrentUser(user as User || null);
          }
        } else {
          console.error('Failed to fetch users:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [session]);
  
  // Effect for fetching GitHub data
  useEffect(() => {
    if (currentUser?.userName) {
      fetchGitHubData(currentUser.userName as string);
    }
  }, [currentUser]);
  // console.log(TotalEarnings, "Earnings");
  // console.log(currentUser, "users");
  // console.log(users, "test users");
  

// Generate sample contribution data for the past year


  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                GitHub Contributions (Last Year)
              </h2>
              {loadingContributions ? (
                <div className="h-64 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                  <p className="text-neutral-500 dark:text-neutral-400">Loading contributions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {uniqueRewardDays} reward days in the last year
                    </p>
                    
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Component />
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{ rewardData.filter((pr) => pr.status === "completed").length}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Pull Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{new Set(rewardData.map((pr) => pr.issue)).size}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{new Set(rewardData.map((pr) => pr.repository)).size }</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Repositories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {new Set(rewardData.map((pr) => pr.rewardedAt)).size}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Days</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                Recent Pull Requests
              </h2>
              <ul className="space-y-3">
                {rewardData.slice(0, 3).map((pr) => (
                  <li key={pr.id} className="text-sm">
                    <a
                      href={pr.url}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {pr.title}
                    </a>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Project: {pr.projectName} | Reward: ${pr.rewardAmount}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "Pull Requests":
        return (
          <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
              Completed Pull Requests
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Pull Request
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Difficulty
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Merged Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Reward
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {completedPRs.map((pr) => (
                    <tr key={pr.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        {pr.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {pr.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pr.difficulty === "Hard" ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100" : pr.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100" : "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"}`}
                        >
                          {pr.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {pr.mergedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        ${pr.reward}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={pr.url}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4 inline" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Achievements":
        return (
          <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
              Achievements
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Badges and milestones you've unlocked
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievementsData.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg flex items-start space-x-4"
                >
                  <div>{ach.icon}</div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {ach.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {ach.description}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      Earned {ach.earnedDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Activity":
              return (
                <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                    Contribution Activity
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    Your contribution history over time
                  </p>
            
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                      <h3 className="text-md font-semibold mb-3 text-neutral-900 dark:text-white">
                        Monthly Contribution Breakdown
                      </h3>
                      <div className="h-80">
                        <div className="w-full h-full">
                          <div className="flex h-full items-end">
                            {contributionActivityData.map((month, index) => (
                              <div key={index} className="flex-1 flex flex-col items-center mx-0.5">
                                <div className="w-full flex flex-col-reverse h-[80%]">
                                  <div 
                                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t" 
                                    style={{ height: `${(month.prs / 12) * 100}%` }} 
                                    title={`${month.prs} PRs`}
                                  ></div>
                                  <div 
                                    className="w-full bg-yellow-500 dark:bg-yellow-600 rounded-t" 
                                    style={{ height: `${(month.issues / 12) * 100}%` }} 
                                    title={`${month.issues} Issues`}
                                  ></div>
                                  <div 
                                    className="w-full bg-green-500 dark:bg-green-600 rounded-t" 
                                    style={{ height: `${(month.commits / 15) * 100}%` }} 
                                    title={`${month.commits} Commits`}
                                  ></div>
                                </div>
                                <div className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">{month.month}</div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-500">{month.contributions}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm mr-1"></div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Commits</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-600 rounded-sm mr-1"></div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Issues</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-sm mr-1"></div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Pull Requests</span>
                        </div>
                      </div>
                    </div>
              
                    <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                      <h3 className="text-md font-semibold mb-3 text-neutral-900 dark:text-white">
                        Contribution Timeline
                      </h3>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto">
                        {contributionData
                          .filter(day => day.contributions && day.contributions.length > 0)
                          .slice(0, 20)
                          .map((day, idx) => (
                            <div key={idx} className="border-l-2 border-green-400 dark:border-green-600 pl-3">
                              <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                {day.count} contributions
                              </div>
                              <div className="space-y-1">
                                {day.contributions && day.contributions.slice(0, 4).map((contrib, i) => (
                                  <div key={i} className="text-xs text-neutral-600 dark:text-neutral-400">
                                    • {contrib.description} <span className="text-neutral-500">({contrib.repo})</span>
                                  </div>
                                ))}
                                {day.contributions && day.contributions.length > 4 && (
                                  <div className="text-xs text-neutral-500">+ {day.contributions.length - 4} more</div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
            
                  <div className="mt-6 bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-3 text-neutral-900 dark:text-white">
                      Contribution Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg text-center">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                          {githubStats.totalContributions}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Total Contributions</div>
                      </div>
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg text-center">
                        <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                          {githubStats.pullRequests}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Pull Requests</div>
                      </div>
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg text-center">
                        <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                          {githubStats.issues}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Issues</div>
                      </div>
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg text-center">
                        <div className="text-3xl font-bold text-green-500 dark:text-green-400">
                          {contributionData.filter(day => day.count > 0).length}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
      default:
        return null;
    }
  };
  const { isShrunk } = useSidebarContext();
  console.log(users, "usersss");
  return (
    <div>
      <Sidebar />
      <div
        className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
      >
        <Topbar />
        {users.length > 0 ? <>
        <div className="mt-20 z-10 min-h-screen  p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* User Info Header */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center">
                <img
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-neutral-200 dark:border-neutral-700"
                    src={(currentUser?.image_url as string) || users[0]?.image_url}
                    alt={(currentUser?.fullName as string) || users[0]?.id}
                  />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                    {(currentUser?.fullName as string) || users[0]?.fullName}
                  </h1>
                  <p className="text-md text-neutral-600 dark:text-neutral-400">
                    {(currentUser?.username as string) || users[0]?.id}
                  </p>
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xl">
                    { users[0]?.Bio}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" /> { users[0].email}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />{" "}
                      {(currentUser?.Location as string) || users[0].Location}
                    </span>
                    <span className="flex items-center">
                      <CalendarDays className="w-3 h-3 mr-1" /> Joined{" "}
                      {userData.joinedDate}
                    </span>
                    <a
                      href={users[0]?.userName ? `https://github.com/${users[0].id as string}` : userData.githubProfileUrl}
                      className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" /> GitHub Profile
                    </a>
                    {users[0]?.Linkedin && (
                      <a
                        href={users[0].Linkedin as string}
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" /> Linkedin Profile
                      </a>
                    )}
                    {users[0]?.Telegram && (
                      <a
                        href={`https://telegram.com/${users[0].Telegram as string}`}
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" /> Telegram
                      </a>
                    )}
                    {users[0]?.Twitter && (
                      <a
                        href={`https://twitter.com/${users[0].Twitter as string}`}
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" /> Twitter
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-center sm:justify-start">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {users[0].rating}/5.0 rating
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                   {users[0].skills?.languages?.map((lang: {name: string, proficiency: string, yearsOfExperience: number}) => (
                        <span
                          key={lang.name}
                          className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-700 rounded-full"
                          title={`${lang.proficiency} (${lang.yearsOfExperience} years)`}
                        >
                          {lang.name}
                        </span>
                      ))} 
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: <Image src="/pharos_small.png"width={40} height={40} className="w-6 h-6 " alt="Earnings" />,
                  label: "Total Earnings",
                  value: ` ${rewardAmount || 0}`,
                  subtext: "From completed pull requests",
                },
                {
                  icon: <GitPullRequest className="w-6 h-6 text-blue-500" />,
                  label: "Pull Requests",
                  value: rewardData.filter((pr) => pr.status === "completed").length,
                  subtext: "Successfully merged",
                },
                {
                  icon: <Briefcase className="w-6 h-6 text-purple-500" />,
                  label: "Projects",
                  value: new Set(rewardData.filter(r => r.status === "completed").map(r => r.issue)).size,
                  subtext: "Contributed to",
                },
                {
                  icon: <Star className="w-6 h-6 text-yellow-500" />,
                  label: "Average Rating",
                  value: `${users[0].rating}/5.0`,
                  subtext: "From maintainers",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Navigation */}
            <div className="mb-6">
              <div className="border-b border-neutral-200 dark:border-neutral-700">
                <nav
                  className="-mb-px flex space-x-4 sm:space-x-8"
                  aria-label="Tabs"
                >
                  {(
                    [
                      "Overview",
                      "Pull Requests",
                      "Achievements",
                      "Activity",
                    ] as TabName[]
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-600"
                    }
                  `}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div>{renderTabContent()}</div>
          </div>
        </div>
        </>:<div className="z-10 mt-20 min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* User Info Header */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                <div className="text-center sm:text-left w-full">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white animate-pulse">
                    <span className="inline-block h-6 w-48 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                  </h1>
                  <p className="text-md text-neutral-600 dark:text-neutral-400 animate-pulse mt-2">
                    <span className="inline-block h-4 w-32 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                  </p>
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xl animate-pulse">
                    <span className="inline-block h-4 w-full bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    <span className="inline-block h-4 w-3/4 bg-neutral-300 dark:bg-neutral-600 rounded mt-1"></span>
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="flex items-center animate-pulse">
                        <span className="inline-block h-3 w-3 bg-neutral-300 dark:bg-neutral-600 rounded-full mr-1"></span>
                        <span className="inline-block h-3 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-center sm:justify-start animate-pulse">
                    <span className="inline-block h-4 w-4 bg-neutral-300 dark:bg-neutral-600 rounded-full mr-1"></span>
                    <span className="inline-block h-4 w-24 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 animate-pulse">
                  <span className="inline-block h-4 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-700 rounded-full animate-pulse"
                    >
                      <span className="inline-block h-3 w-12 bg-blue-200 dark:bg-blue-600 rounded"></span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 flex items-start space-x-3 animate-pulse"
                >
                  <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                    <span className="inline-block h-6 w-6 bg-neutral-300 dark:bg-neutral-600 rounded-full"></span>
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      <span className="inline-block h-3 w-24 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      <span className="inline-block h-6 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="inline-block h-3 w-32 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Navigation */}
            <div className="mb-6 animate-pulse">
              <div className="border-b border-neutral-200 dark:border-neutral-700">
                <nav className="-mb-px flex space-x-4 sm:space-x-8">
                  {[...Array(4)].map((_, i) => (
                    <button
                      key={i}
                      className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm border-transparent"
                    >
                      <span className="inline-block h-4 w-20 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-700 rounded"></div>
            </div>
          </div>
        </div>}
        
      </div>
    </div>
  );
};

export default UserProfilePage;

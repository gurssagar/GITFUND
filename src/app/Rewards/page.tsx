"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/assets/components/topbar";
import Sidebar from "@/assets/components/sidebar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  CheckCircle,
} from "lucide-react";

// Define interfaces
interface RewardTransaction {
  id: string;
  date: string;
  Contributor_id: string;
  issue: string;
  value: string;
  projectName: string;
  rewardAmount: number;
}

interface RewardsApiResponse {
  Rewards: RewardTransaction[];
}

interface CustomUser {
  username?: string;
}

interface CustomSessionData {
  user?: CustomUser & {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface CustomSession {
  data?: CustomSessionData | null;
}

export default function Rewards() {
  const { data: session }: CustomSession = useSession();
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const { isShrunk } = useSidebarContext();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/rewards");
        if (!response.ok) throw new Error("Failed to fetch rewards");
        const data: RewardsApiResponse = await response.json();
        const allRewards = data.Rewards;
        setRewards(allRewards);
        console.log("Fetched rewards:", allRewards);
      } catch (err: any) {
        console.error("Error fetching rewards:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [session]);

  const filteredRewards = rewards.filter((reward) => {
    if (
      !reward ||
      typeof reward.projectName !== "string" ||
      typeof reward.Contributor_id !== "string"
    ) {
      return false;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      reward.projectName.toLowerCase().includes(searchTermLower) ||
      reward.Contributor_id.toLowerCase().includes(searchTermLower);

    if (!matchesSearch) {
      return false;
    }

    const currentUsername: string | undefined = session?.user?.username;
    if (currentUsername) {
      return (
        reward.Contributor_id.toLowerCase() === currentUsername.toLowerCase()
      );
    }

    return true;
  });

  const totalRewarded = filteredRewards.reduce(
    (sum, reward) => sum + reward.rewardAmount,
    0
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Generate chart data
  const generateChartData = () => {
    const monthMap: { [key: string]: number } = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    filteredRewards.forEach((reward) => {
      let dateObj: Date;
      if (reward.date.includes("-")) {
        const parts = reward.date.split("-");
        if (parts[2]?.length === 4) {
          dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          dateObj = new Date(reward.date);
        }
      } else {
        dateObj = new Date(reward.date);
      }

      if (isNaN(dateObj.getTime())) {
        console.warn(
          `Invalid date string for reward: ${reward.id}, date: ${reward.date}`
        );
        return;
      }

      if (!minDate || dateObj < minDate) minDate = dateObj;
      if (!maxDate || dateObj > maxDate) maxDate = dateObj;

      const monthYear = dateObj.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      monthMap[monthYear] =
        (monthMap[monthYear] || 0) + Number.parseFloat(reward.value);
    });

    const months: string[] = [];
    if (minDate && maxDate) {
      const current = new Date(
        (minDate as any)?.getFullYear() ?? 0,
        (minDate as any)?.getMonth() ?? 0,
        1
      );
      const end = new Date(
        (maxDate as any).getFullYear(),
        (maxDate as any).getMonth(),
        1
      );

      while (current <= end) {
        const monthYear = current.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        });
        months.push(monthYear);
        current.setMonth(current.getMonth() + 1);
      }
    }

    if (months.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(
          d.toLocaleString("default", { month: "short", year: "2-digit" })
        );
      }
    }

    const maxValue = Math.max(...months.map((m) => monthMap[m] || 0), 1);

    return { months, monthMap, maxValue };
  };

  const { months, monthMap, maxValue } = generateChartData();

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
            <div className="mt-16 p-4 lg:p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-600 rounded"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
          <main className="mt-16 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Rewards Dashboard
                </h1>
                <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                  Track your earnings and reward history
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Total Rewarded Card */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"></div>
                  <CardContent className="relative p-4 lg:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-purple-100">
                          Total Rewarded
                        </p>
                        <p className="text-xl lg:text-3xl font-bold">
                          {totalRewarded.toFixed(4)} PHAROS
                        </p>
                      </div>
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Paid Card */}
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Paid
                        </p>
                        <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                          {totalRewarded.toFixed(4)} PHAROS
                        </p>
                      </div>
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart Card */}
                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400">
                      Rewards Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0">
                    <div className="flex justify-around items-end h-16 lg:h-20">
                      {months.map((month, i) => (
                        <div
                          key={month + i}
                          className="text-center flex-1 max-w-8"
                        >
                          <div
                            className="w-3 lg:w-4 bg-gray-600 dark:bg-gray-400 rounded-t mx-auto"
                            style={{
                              height: `${
                                ((monthMap[month] || 0) / maxValue) *
                                (isMobile ? 48 : 60)
                              }px`,
                              minHeight: "6px",
                            }}
                            title={`${monthMap[month] || 0} PHAROS`}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate">
                            {isMobile ? month.slice(0, 3) : month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter Section */}
              <Card className="mb-6">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search projects or contributors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Filter</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">More</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">
                    Reward History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {error && (
                    <div className="p-6 text-center">
                      <p className="text-red-500">Error: {error}</p>
                    </div>
                  )}

                  {!error && filteredRewards.length === 0 && (
                    <div className="p-8 text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No rewards found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search criteria."
                          : "You haven't received any rewards yet."}
                      </p>
                    </div>
                  )}

                  {!error && filteredRewards.length > 0 && (
                    <>
                      {/* Mobile Card View */}
                      <div className="block md:hidden">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredRewards.map((reward) => (
                            <div
                              key={reward.id}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                  {reward.projectName}
                                </h3>
                                <Badge variant="secondary" className="ml-2">
                                  Complete
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center justify-between">
                                  <span>Amount:</span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reward.rewardAmount.toFixed(4)} PHAROS
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Date:</span>
                                  <span>{formatDate(reward.date)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>From:</span>
                                  <span className="truncate ml-2">
                                    {reward.Contributor_id}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">
                                    Issue:{" "}
                                  </span>
                                  <span className="text-xs">
                                    {reward.issue}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Project
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                From
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Contributions
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRewards.map((reward) => (
                              <tr
                                key={reward.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                  {formatDate(reward.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {reward.projectName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {reward.Contributor_id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                  <div
                                    className="max-w-xs truncate"
                                    title={reward.issue}
                                  >
                                    {reward.issue}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {reward.rewardAmount.toFixed(4)} PHAROS
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant="secondary">Complete</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}

"use client";

import { Check } from "lucide-react";
import Issue from "@/assets/components/issue";
import { useRef, useState, useEffect, use } from "react";
import {useSession} from "next-auth/react";
import ScrollVelocity from "@/blocks/TextAnimations/ScrollVelocity/ScrollVelocity";
import { motion } from "motion/react";
import GitHubIssueList from "../components/issue";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MetaMaskButton from "@/assets/components/metamask";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import heroImage from "@/assets/components/bg-1.jpg";
import MacbookScrollDemo from "@/assets/components/macbookscrool";
import ShootingStarBorder from "@/components/border";
import { LampContainer } from "@/components/ui/lamp";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { useAccount, useEnsName } from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppKit } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import {
  UsersIcon,
  GitPullRequestIcon,
  WalletIcon,
  LinkIcon,
  SearchIcon,
  CodeIcon,
  ZapIcon,
  ShieldCheckIcon,
  GitBranchIcon,
  AwardIcon,
  Link2Icon,
  CoinsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

import { Icon } from "@iconify/react";

// Define interfaces for data structures
interface RepoDataItem {
  id: string; // Or number, depending on your data
  title: string;
  repositoryName: string;
  repositoryOwner: string;
  fundingGoal: number;
  creatorUsername: string;
  issueTitle?: string;
  languages: string[];
  // Add other properties that come from your API
  image?: string; // Optional: if you plan to add images
}

interface Plan {
  name: string;
  description: string;
  price: number;
  features: string[];
  featured?: boolean;
}

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface GrowthDataPoint {
  name: string;
  value: number;
}

export default function LandingPage() {
  const { address, isConnected } = useAccount(); // Added isConnected here
  const {data:session}=useSession();
  const [isMobileNavOpen,setMobileNavOpen] = useState(false);
  const { data: ensName, error, status } = useEnsName({ address });
  const { open } = useAppKit();
   console.log(isMobileNavOpen, "isMobileNavOpen");
    const {
      data: balanceData,
      error: balanceError,
      isLoading: isBalanceLoading,
    } = useBalance({
      address: address,
    });

  const truncateAddress = (addr: string) => {
      if (!addr) return "";
      return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
    };
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );
  const [repoData, setRepoData] = useState<RepoDataItem[]>([]);
  const [screen, changeScreen] = useState<number>(10);

  useEffect(() => {
    const updateGridLength = () => {
      if (window.innerWidth <= 768) {
        changeScreen(10);
      } else if (window.innerWidth <= 1024) {
        changeScreen(16);
      } else if (window.innerWidth >= 1800) {
        changeScreen(30);
      } else {
        changeScreen(20);
      }
    };
    updateGridLength();
    window.addEventListener("resize", updateGridLength);
    return () => window.removeEventListener("resize", updateGridLength);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/add-projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data, "dsfhahsdas");
        setRepoData(data.project);
      } catch (fetchError: any) {
        console.error("Failed to fetch projects:", fetchError);
        // Optionally, set an error state here to display to the user
      }
    };
    fetchData();
  }, []); // Consider adding repoData.length to dependencies if you implement image fetching based on it, to avoid stale closures.

  const plans: Plan[] = [
    {
      name: "Contributor",
      description: "Start contributing to open-source with ease",
      price: billingCycle === "monthly" ? 0 : 0,
      features: [
        "Access to public repositories",
        "Submit up to 5 issues/month",
        "Join contributor leaderboard",
        "Basic contributor profile",
        "Community support",
      ],
    },
    {
      name: "Organization",
      description: "Best for larger teams or open-source organizations",
      price: billingCycle === "monthly" ? 99 : 990,
      features: [
        "Unlimited repositories & bounties",
        "Unlimited active bounty slots",
        "Team management tools",
        "Advanced insights & reporting",
        "Priority support",
        "Custom integrations (GitHub, Slack, etc.)",
      ],
      featured: true,
    },
  ];

  {
    /* Stats Section */
  }
  // Add these imports at the top

  // Add this data array before the Stats Section
  const growthData: GrowthDataPoint[] = [
    { name: "Sept 2023", value: 1000 },
    { name: "Oct 2023", value: 2000 },
    { name: "Nov 2023", value: 3000 },
    { name: "Dec 2023", value: 4000 },
    { name: "Jan 2024", value: 6000 },
    { name: "Feb 2024", value: 8000 },
    { name: "Mar 2024", value: 10000 },
  ];

  const testimonials: Testimonial[] = [
    {
      quote:
        "GitFund brought in top contributors within days and helped us resolve high-priority issues faster than ever—paid out automatically and securely.",
      name: "Sarah Chen",
      designation: "Project Maintainer at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The integration with GitHub and smart contracts is seamless. GitFund removes the friction of rewarding contributors in crypto—it's simply brilliant.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "GitFund completely changed the way we contribute to open source. Getting rewarded in crypto for merged PRs motivates us to do our best work.",
      name: "Emily Watson",
      designation: "Contributor at CloudScale",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The automated payout system is a game-changer. We no longer need to manually track and reward contributions—GitFund does it all on-chain.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "With GitFund, we've scaled our project while fairly compensating contributors from around the world. The transparency builds real trust.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="min-h-screen bg-white ">
      {/* Header/Navigation */}
      <header className="fixed bg-black top-0 left-0 right-0 z-50 border border-b-1 h-16   md:top-4 md:left-4 md:right-4 md:border-none">
              <div className="md:max-w-7xl w-full mx-auto md:bg-black md:dark:bg-[#1A1A1A]/80 md:backdrop-blur-md md:rounded-full md:border md:dark:border-custom-dark-gray/50">
                <div className="flex justify-between items-center px-4 py-3 md:px-6">
            <div>
              <Image
                src="/gitfund-white.webp"
                alt="GitFund logo"
                width={120}
                height={40}
              />
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/Browse"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/homepage"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/create-project"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Submit Project
              </Link>
            </nav>
            <div className="flex items-center space-x-4 hidden md:flex">
              <ShootingStarBorder href="/Login">Sign In</ShootingStarBorder>
            </div>
            <div className="md:hidden">
              <div
                
                className="text-white focus:outline-none"
              >
                {
  isMobileNavOpen ? (
    <button
      onClick={() => setMobileNavOpen(false)}
      aria-label="Close navigation menu"
      className="p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <Icon icon="maki:cross" width="24" height="24" />
    </button>
  ) : (
    <button
      onClick={() => setMobileNavOpen(true)}
      aria-label="Open navigation menu"
      className="p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <Icon icon="fluent:navigation-16-filled" width="24" height="24" />
    </button>
  )
}

                
              </div>
            </div>
          </div>
        </div>
      </header>

      {
        isMobileNavOpen?
        <>
          <div className="mt-16 z-50 bg-white   dark:bg-black fixed h-[calc(100%-_64px)] w-full">
                              <div>
                                <div className="px-4 flex flex-col h-[calc(100%-_64px)] justify-between">
                                          <div className="">
                                            
                                            <div>
                                              <div className="pt-4">
                                                <div className="text-[13px] text-gray-400 ">Explore</div>
                                                <Link href="/homepage">
                                                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="20"
                                                      height="20"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <g
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                      >
                                                        <circle cx="12" cy="12" r="9" />
                                                        <path d="M11.307 9.739L15 9l-.739 3.693a2 2 0 0 1-1.568 1.569L9 15l.739-3.693a2 2 0 0 1 1.568-1.568" />
                                                      </g>
                                                    </svg>
                                                    Discover
                                                  </div>
                                                </Link>
                                
                                                <Link href={`/Browse`}>
                                                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="20"
                                                      height="20"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="1.5"
                                                        d="M7 6.5h9.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 8.59 22 9.393 22 11.5m-10-5l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542C8.69 2.5 8.108 2.5 6.944 2.5c-1.816 0-2.724 0-3.406.38A3 3 0 0 0 2.38 4.038C2 4.72 2 5.628 2 7.444V10.5c0 4.714 0 7.071 1.464 8.535C4.822 20.394 6.944 20.493 11 20.5h1m10 1l-2.147-2.147m0 0a3.43 3.43 0 0 0 1.004-2.424a3.429 3.429 0 1 0-1.004 2.424"
                                                        color="currentColor"
                                                      />
                                                    </svg>
                                                    Browse
                                                  </div>
                                                </Link>
                                                <Link href="/GitBot">
                                                  <div className="rounded-lg text-sm active:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="20"
                                                      height="20"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        fill="currentColor"
                                                        d="M12 2.5c-3.81 0-6.5 2.743-6.5 6.119c0 1.536.632 2.572 1.425 3.56c.172.215.347.422.527.635l.096.112c.21.25.427.508.63.774c.404.531.783 1.128.995 1.834a.75.75 0 0 1-1.436.432c-.138-.46-.397-.89-.753-1.357a18 18 0 0 0-.582-.714l-.092-.11c-.18-.212-.37-.436-.555-.667C4.87 12.016 4 10.651 4 8.618C4 4.363 7.415 1 12 1s8 3.362 8 7.619c0 2.032-.87 3.397-1.755 4.5c-.185.23-.375.454-.555.667l-.092.109c-.21.248-.405.481-.582.714c-.356.467-.615.898-.753 1.357a.751.751 0 0 1-1.437-.432c.213-.706.592-1.303.997-1.834c.202-.266.419-.524.63-.774l.095-.112c.18-.213.355-.42.527-.634c.793-.99 1.425-2.025 1.425-3.561C18.5 5.243 15.81 2.5 12 2.5M8.75 18h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5m.75 3.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75"
                                                      />
                                                    </svg>
                                                    Recommendations
                                                  </div>
                                                </Link>
                                              </div>
                                              <div className="pt-3">
                                                <div className="text-[13px] text-gray-400 py-2">
                                                  Contributor
                                                </div>
                                                
                                                <Link href={{
                                                  pathname: '/userProfile',
                                                  query: {
                                                    user: (session?.user as any)?.username,
                                                  },
                                                }}>
                                                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z" clip-rule="evenodd"/></svg>
                                                    User Profile
                                                  </div>
                                                </Link>
                                                <Link href="/assignedProjects" className="">
                                                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="20"
                                                      height="20"
                                                      viewBox="0 0 48 48"
                                                    >
                                                      <defs>
                                                        <mask id="ipSSeoFolder0">
                                                          <g fill="none" stroke-width="4">
                                                            <path
                                                              fill="#fff"
                                                              stroke="#fff"
                                                              stroke-linejoin="round"
                                                              d="M5 8a2 2 0 0 1 2-2h12l5 6h17a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"
                                                            />
                                                            <path
                                                              stroke="#000"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"
                                                              d="m14 22l5 5l-5 5"
                                                            />
                                                            <path
                                                              stroke="#000"
                                                              stroke-linecap="round"
                                                              d="M26 32h8"
                                                            />
                                                          </g>
                                                        </mask>
                                                      </defs>
                                                      <path
                                                        fill="currentColor"
                                                        d="M0 0h48v48H0z"
                                                        mask="url(#ipSSeoFolder0)"
                                                      />
                                                    </svg>
                                                    Projects
                                                  </div>
                                                </Link>
                                                <a href="Rewards">
                                                  <div className="rounded-lg text-sm data-[active=true]:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="20"
                                                      height="20"
                                                      viewBox="0 0 12 12"
                                                    >
                                                      <path
                                                        fill="currentColor"
                                                        d="M2.25 1C1.56 1 1 1.56 1 2.25v1.162a1.5 1.5 0 0 0 .772 1.31l2.876 1.599a3 3 0 1 0 2.704 0l2.877-1.598A1.5 1.5 0 0 0 11 3.412V2.25C11 1.56 10.44 1 9.75 1zM2 2.25A.25.25 0 0 1 2.25 2H4v2.817l-1.743-.968A.5.5 0 0 1 2 3.412zm3 3.122V2h2v3.372l-1 .556zm3-.555V2h1.75a.25.25 0 0 1 .25.25v1.162a.5.5 0 0 1-.257.437zM8 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0"
                                                      />
                                                    </svg>
                                                    Rewards
                                                  </div>
                                                </a>
                                              </div>
                                              <div className="pt-3">
                                                <div className="text-[13px] text-gray-400 py-2">
                                                  Maintainer
                                                </div>
                                                <Link href="/contributorRequests">
                                                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      width="20"
                                                      className="my-auto mr-2"
                                                      height="20"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="1.5"
                                                        d="M8 12h.009m3.986 0h.01m3.986 0H16m2 9c1.232 0 2.231-1.151 2.231-2.571c0-2.248-.1-3.742 1.442-5.52c.436-.502.436-1.316 0-1.818c-1.542-1.777-1.442-3.272-1.442-5.52C20.231 4.151 19.232 3 18 3M6 21c-1.232 0-2.231-1.151-2.231-2.571c0-2.248.1-3.742-1.442-5.52c-.436-.502-.436-1.316 0-1.818C3.835 9.353 3.769 7.84 3.769 5.57C3.769 4.151 4.768 3 6 3"
                                                        color="currentColor"
                                                      />
                                                    </svg>
                                                    Contribution Requests
                                                  </div>
                                                </Link>
                                
                                                <Link href="/myProjects">
                                                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="my-auto mr-2"
                                                      width="16"
                                                      height="16"
                                                      viewBox="0 0 16 16"
                                                    >
                                                      <path
                                                        fill="currentColor"
                                                        d="M13.5 5.88c-.28 0-.5-.22-.5-.5V1.5c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v2c0 .28-.22.5-.5.5S2 3.78 2 3.5v-2C2 .67 2.67 0 3.5 0h9c.83 0 1.5.67 1.5 1.5v3.88c0 .28-.22.5-.5.5"
                                                      />
                                                      <path
                                                        fill="currentColor"
                                                        d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-10C0 3.67.67 3 1.5 3h4.75c.16 0 .31.07.4.2L8 5h6.5c.83 0 1.5.67 1.5 1.5v8c0 .83-.67 1.5-1.5 1.5M1.5 4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H7.75a.48.48 0 0 1-.4-.2L6 4z"
                                                      />
                                                      <path
                                                        fill="currentColor"
                                                        d="M5.5 13h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5"
                                                      />
                                                    </svg>
                                                    My Projects
                                                  </div>
                                                </Link>
                                                <Link href="/PullRequests" >
                                                  <div className="rounded-lg gap-2 text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path d="M37 44a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM11 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm0 32a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"/><path stroke-linecap="round" d="M11 12v24m13-26h9a4 4 0 0 1 4 4v22"/><path stroke-linecap="round" d="m30 16l-6-6l6-6"/></g></svg>
                                                    Pull Requests
                                                  </div>
                                                </Link>
                                                <Link href="/gitfundChat">
                                                  <div className="rounded-lg text-sm focus:bg-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] pl-1 pr-4 py-2 flex">
                                                    <div className="flex gap-1">
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <g fill="none" stroke="currentColor" stroke-width="1">
                                                          <path d="M4 12a8 8 0 1 1 16 0v5.09c0 .848 0 1.27-.126 1.609a2 2 0 0 1-1.175 1.175C18.36 20 17.937 20 17.09 20H12a8 8 0 0 1-8-8Z" />
                                                          <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M9 11h6m-3 4h3"
                                                          />
                                                        </g>
                                                      </svg>
                                                      Gitfund Chat
                                                    </div>
                                                  </div>
                                                </Link>
                                              </div>
                                            </div>{" "}
                                            {/* End of wrapper for top content */}
                                            <div
                                              onClick={() => open()}
                                              className=" px-4 py-2 dark:bg-custom-dark-gray bg-gray-200 dark:text-white text-black  rounded-lg cursor-pointer text-center mb-4"
                                            >
                                              {isConnected ? (
                                                <div
                                                  onClick={() => {
                                                    open;
                                                  }}
                                                >
                                                  <div className="flex gap-2">
                                                    <div>
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        className="mx-auto"
                                                      >
                                                        <path
                                                          fill="currentColor"
                                                          d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                                                        />
                                                      </svg>
                                                    </div>
                                                    {truncateAddress(address as string)}
                                                  </div>
                                                </div>
                                              ) : (
                                                "Connect Wallet"
                                              )}
                                            </div>
                                          </div>{" "}
                                          {/* End of flex container */}
                                        </div>
                              </div>
                  
                            </div>
        </>
        :
        <></>
      }

      <section>
        <div>
          <div className="bg-[url('')]">
            <div className="relative flex pt-[200px] items-center justify-center bg-white dark:bg-black">
              <div
                className={cn(
                  "absolute inset-0",
                  "[background-size:30px_30px]",
                  "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
                  "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
                )}
              />
              {/* Radial gradient for the container to give a faded look */}

              <div className="pointer-events-none absolute inset-0 block items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
              <div className="">
                <div className="text-center">
                  {" "}
                  {/* Added text-center to the parent div */}
                  <div className="relative rounded-full z-20 bg-[#ececec] dark:bg-[#1a1a1a] dark:text-white text-center px-5 py-2 inline-block">
                    {" "}
                    {/* Added inline-block */}
                    Trusted. Transparent. Blockchain-Powered.
                  </div>
                </div>
                <p className="text-center relative z-20 bg-black dark:bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
                  Fuel Open Source Innovation
                </p>
                <p className="mx-auto md:text-xl text-sm md:max-w-[60vw] text-center">
                  GitFund seamlessly bridges the gap between open-source
                  development and decentralized finance by integrating GitHub
                  repositories with blockchain smart contracts. This allows
                  project maintainers to post issues with pre-funded bounties
                  and enables developers to earn cryptocurrency—such as Pharos upon
                  successful code contributions, like merged pull requests. By
                  removing intermediaries and ensuring instant, transparent
                  payouts, GitFund creates a sustainable, trustless incentive
                  system that rewards real coding impact.
                </p>

                <div className="mt-50 mx-auto">
                  <div className="transition z-20">
                    <Image
                      onScroll={() => {}}
                      className="block z-20 dark:hidden "
                      src="/screen-white.png"
                      height={1600}
                      width={1600}
                      alt={`homepage`}
                    ></Image>
                    <Image
                      onScroll={() => {}}
                      className="hidden z-20 dark:block "
                      src="/screen.png"
                      height={1600}
                      width={1600}
                      alt={`homepage`}
                    ></Image>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <div className=" rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <p className="text-center relative z-20 bg-black dark:bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl"></p>
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>

      <div className={`pt-40 dark:bg-black `}>
        <div className="mx-auto flex justify-center">
          <div className="relative  rounded-full z-20 bg-[#ececec] dark:bg-[#1a1a1a] dark:text-white text-center px-5 py-2 inline-block ">
            {" "}
            {/* Added inline-block */}
            Reward Open-Source Work. Automatically.
          </div>
        </div>

        <h1 className="text-center relative z-20 bg-black dark:bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-6xl">
          How Gitfund Works?
        </h1>

        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {/* Maintainers Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="mt-10 mb-4">
              <h2 className="text-2xl font-bold">🔧 For Maintainers</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader>
                    <Link2Icon />
                    <h3 className="text-lg font-semibold">
                      Connect GitHub Repository
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Login via GitHub OAuth to access your repositories and
                      select one to fund.
                    </p>
                    <Button variant="outline" className="mt-2">
                      Connect GitHub
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CoinsIcon />
                    <h3 className="text-lg font-semibold">
                      List Issue & Set Bounty
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Choose an open issue and lock your bounty in Pharos/ via
                      smart contract escrow.
                    </p>
                    <Badge className="mt-2">Pharos </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <UsersIcon />
                    <h3 className="text-lg font-semibold">
                      Wait for Contributions
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Developers can view your issue with bounty, tags,
                      difficulty, and estimates to begin work.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <GitPullRequestIcon />
                    <h3 className="text-lg font-semibold">
                      Review Pull Request
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Merge PRs via GitHub as usual. Ensure code meets your
                      expectations.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <WalletIcon />
                    <h3 className="text-lg font-semibold">
                      Funds Auto-Released
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Smart contract releases bounty automatically on PR merge
                      via GitHub webhook.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </div>

          {/* Contributors Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="mt-10 mb-4">
              <h2 className="text-2xl font-bold">👨‍💻 For Contributors</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <LinkIcon />
                    <h3 className="text-lg font-semibold">
                      Connect GitHub and Wallet
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Sign in with GitHub and connect your wallet to get paid.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge>Kukai</Badge>
                      <Badge>Temple</Badge>
                      <Badge>MetaMask</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <SearchIcon />
                    <h3 className="text-lg font-semibold">
                      Browse Available Bounties
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>Explore by tech stack, reward, and repo popularity.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CodeIcon />
                    <h3 className="text-lg font-semibold">Solve the Issue</h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Fork, clone, and push code as with any open-source issue.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <ZapIcon />
                    <h3 className="text-lg font-semibold">
                      Get Paid Instantly
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Once merged, GitFund releases bounty trustlessly to your
                      wallet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </div>

          {/* Behind the Scenes */}
        </div>
        <div className="block md:flex justify-center mx-auto gap-6 px-10 md:p-0">
          <Card className="md:w-1/4">
            <CardHeader>
              <GitBranchIcon />
              <h2 className="text-xl font-semibold">GitHub Webhooks</h2>
            </CardHeader>
            <CardContent>
              <p>Track PRs and merges in real-time using GitHub APIs.</p>
            </CardContent>
          </Card>

          <Card className="md:w-1/4 mt-4 md:pt-0">
            <CardHeader>
              <AwardIcon />
              <h2 className="text-xl font-semibold">
                NFT Badge System(Upcomming)
              </h2>
            </CardHeader>
            <CardContent>
              <p>
                Earn on-chain NFT badges to showcase verified contributions and
                reputation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white dark:bg-black">
        <motion.div
          className="mx-[auto] text-center pt-40"
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ease: "easeOut", duration: 1 }}
        >
          <div className="text-6xl mb-4 lg:text-6xl px-20 text-center font-bold">
            Featured Projects
          </div>
          <div className="text-sm lg:text-lg mb-12 lg:text-lg px-20 text-gray-400 text-center ">
            Discover projects that match the languages you love to code in.
          </div>
        </motion.div>
        <div className="grid grid-cols-2 h-full px-10 lg:grid-cols-3 gap-4 lg:px-32">
          {repoData?.length > 0 ? (
            <>
              {repoData.slice(0, 6).map((repo: any) => {
                if (!repo?.image_url?.trim()) return null;

                return (
                  <>
                    <div
                      key={repo.projectName}
                      className="hover:scale-[1.02] h-full transition-transform duration-200"
                    >
                      <a
                        href={`/projects/${repo.project_repository}`}
                        className={`h-full`}
                      >
                        <Issue
                          image={repo.image_url || "back_2.jpg"}
                          Project={repo.projectName}
                          Fork="42"
                          Stars="128"
                          Contributors={8}
                          shortDescription={repo.shortdes}
                          languages={repo.languages}
                        />
                      </a>
                    </div>
                  </>
                );
              })}
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="mx-auto text-center py-10">
          <motion.button
            className="text-white bg-black dark:text-black dark:bg-white text-center justify-center mx-auto py-2 px-4 rounded-md" // Added rounded-md for better appearance
            whileHover={{ scale: 1.05 }} // Scale up slightly on hover
            whileTap={{ scale: 0.95 }} // Scale down slightly on tap
            transition={{ type: "spring", stiffness: 400, damping: 17 }} // Add a spring transition
          >
            <Link href={`/projects`}>View More Projects</Link>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col items-center w-full min-h-screen pt-40 bg-white dark:bg-black  text-black dark:text-white px-4">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-6xl font-bold mb-4">
            Simple & Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Choose the plan that works best for you and your team.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span
              className={`${billingCycle === "monthly" ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              Monthly
            </span>
            <button
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-700"
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "annually" : "monthly",
                )
              }
            >
              <span className="sr-only">Toggle billing cycle</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  billingCycle === "annually"
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`${billingCycle === "annually" ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              Annual{" "}
              <span className="text-emerald-400 text-sm ml-1">Save 17%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.featured
                  ? " dark:bg-[#0a0a0a]  bg-[#ececec]  border border-gray-700 shadow-lg"
                  : "bg-[#ececec] dark:bg-[#0a0a0a] border dark:border-custom-dark-gray"
              }`}
            >
              {plan.featured && (
                <span className="bg-[#1e1e1e] text-xs font-medium mr-2 px-2.5 py-0.5 rounded text-white mb-4 inline-block">
                  Most Popular
                </span>
              )}
              {!plan.featured && (
                <span className="bg-[#1e1e1e] text-xs font-medium mr-2 px-2.5 py-0.5 rounded text-white mb-4 inline-block">
                  Best for Starters
                </span>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-gray-400 mt-2">{plan.description}</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400">
                  /{billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.featured
                    ? "bg-[#1e1e1e] hover:bg-emerald-700 text-white"
                    : "bg-[#1e1e1e] hover:bg-gray-700 text-white"
                }`}
              >
                Get Started
              </button>

              <div className="mt-8">
                <p className="font-medium text-sm text-gray-400 mb-4">
                  What's included:
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-20 bg-white dark:bg-black">
        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl mx-4 md:mx-8 lg:mx-16 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Try our app now
            </h2>
            <Link
              href="/Signup"
              className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 md:px-8 lg:px-16 border-t dark:border-custom-dark-gray">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <Image
                  src="/gitfund.webp"
                  alt="GitFund logo"
                  width={100}
                  height={40}
                  className="mb-4 dark:hidden block"
                />
                <Image
                  src="/gitfund-white.webp"
                  alt="GitFund logo"
                  width={100}
                  height={40}
                  className="mb-4 dark:block hidden"
                />

                <p className="text-sm text-gray-400">
                  Empowering open-source communities through sustainable
                  funding.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      How it works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Discord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="hover:text-black dark:hover:text-white"
                    >
                      Twitter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t dark:border-custom-dark-gray flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2023 GitFund. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

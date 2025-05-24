'use client';

import React, { useState } from 'react';
import { NextPage } from 'next';
import { BarChart, Briefcase, CheckCircle, DollarSign, GitPullRequest, Star, User, MapPin, CalendarDays, Link as LinkIcon, Award, Activity as ActivityIcon } from 'lucide-react'; // Example icons
import Sidebar from '@/assets/components/sidebar';
import Topbar from '@/assets/components/topbar';
import { useSidebarContext } from '@/assets/components/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
// Dummy data - replace with actual data fetching
const userData = {
  name: 'Sarah Johnson',
  username: '@sarahdev',
  bio: 'Full-stack developer passionate about React and TypeScript. Love contributing to open source projects.',
  email: 'sarah@example.com',
  location: 'San Francisco, CA',
  joinedDate: '2022-03-15',
  githubProfileUrl: '#',
  avatarUrl: 'https://via.placeholder.com/150', // Replace with actual avatar URL
  rating: 4.8,
  skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'Python'],
  totalEarnings: 2450,
  pullRequestsCount: 12,
  projectsContributed: 5,
  averageRating: 4.8,
};

const completedPRs = [
  { id: 1, title: 'Fix SSR hydration mismatch in dynamic routes', project: 'next.js', difficulty: 'Medium', mergedDate: '2023-05-20', reward: 500, url: '#' },
  { id: 2, title: 'Add TypeScript support for API routes', project: 'next.js', difficulty: 'Hard', mergedDate: '2023-05-15', reward: 350, url: '#' },
  { id: 3, title: 'Improve error handling in useEffect', project: 'react', difficulty: 'Medium', mergedDate: '2023-05-10', reward: 400, url: '#' },
  { id: 4, title: 'Add documentation for server components', project: 'react', difficulty: 'Easy', mergedDate: '2023-05-05', reward: 200, url: '#' },
];

const achievementsData = [
  { id: 1, title: 'First Contribution', description: 'Merged your first pull request', earnedDate: '2022-03-20', icon: <CheckCircle className="w-8 h-8 text-green-500" /> },
  { id: 2, title: 'Big Earner', description: 'Earned over $1000 in rewards', earnedDate: '2023-04-15', icon: <DollarSign className="w-8 h-8 text-yellow-500" /> },
  { id: 3, title: 'Bug Hunter', description: 'Fixed 10 critical bugs', earnedDate: '2023-05-01', icon: <Award className="w-8 h-8 text-blue-500" /> }, 
  { id: 4, title: 'Team Player', description: 'Contributed to 5 different projects', earnedDate: '2023-06-10', icon: <User className="w-8 h-8 text-purple-500" /> }, 
];

// Example data for contribution activity chart (replace with actual chart implementation)
const contributionActivityData = [
  { month: 'Jan', contributions: 10 },
  { month: 'Feb', contributions: 12 },
  { month: 'Mar', contributions: 15 },
  { month: 'Apr', contributions: 18 },
  { month: 'May', contributions: 22 },
];

type TabName = 'Overview' | 'Pull Requests' | 'Achievements' | 'Activity';

const UserProfilePage: NextPage = () => {

  const router = useRouter();
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState<TabName>('Overview');

  const renderTabContent = () => {
    
    switch (activeTab) {
      case 'Overview':
        return (
            
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
              {/* Placeholder for Recent Activity Chart - you'll need a chart library like Recharts or Chart.js */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Activity Chart Placeholder</p>
              </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Pull Requests</h2>
              <ul className="space-y-3">
                {completedPRs.slice(0, 3).map(pr => (
                  <li key={pr.id} className="text-sm">
                    <a href={pr.url} className="text-blue-600 dark:text-blue-400 hover:underline">{pr.title}</a>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Project: {pr.project} | Reward: ${pr.reward}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'Pull Requests':
        return (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Completed Pull Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pull Request</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Merged Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reward</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {completedPRs.map((pr) => (
                    <tr key={pr.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{pr.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{pr.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pr.difficulty === 'Hard' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : pr.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'}`}>
                          {pr.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{pr.mergedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${pr.reward}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={pr.url} className="text-blue-600 dark:text-blue-400 hover:underline"><LinkIcon className="w-4 h-4 inline"/></a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Achievements':
        return (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Achievements</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Badges and milestones you've unlocked</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievementsData.map(ach => (
                <div key={ach.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start space-x-4">
                  <div>{ach.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ach.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ach.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Earned {ach.earnedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Activity':
        return (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contribution Activity</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Your contribution history over time</p>
            {/* Placeholder for Contribution Activity Chart */}
            <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Contribution Activity Chart Placeholder</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  const { isShrunk } = useSidebarContext();
  return (
    <div>
            <Sidebar />
            <div className={` ${isShrunk?'ml-[4rem] w-[calc(100%_-_4rem)]':'ml-[16rem] w-[calc(100%_-_16rem)]'}`}>
                <Topbar /> 
    <div className="mt-20 min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Info Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <img 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-gray-200 dark:border-gray-700"
              src={userData.avatarUrl} 
              alt={userData.name} 
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{userData.name}</h1>
              <p className="text-md text-gray-600 dark:text-gray-400">{userData.username}</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 max-w-xl">{userData.bio}</p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {userData.email}</span>
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {userData.location}</span>
                <span className="flex items-center"><CalendarDays className="w-3 h-3 mr-1" /> Joined {userData.joinedDate}</span>
                <a href={userData.githubProfileUrl} className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"><LinkIcon className="w-3 h-3 mr-1" /> GitHub Profile</a>
              </div>
              <div className="mt-3 flex items-center justify-center sm:justify-start">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userData.rating}/5.0 rating</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.map(skill => (
                <span key={skill} className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-700 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[ 
            { icon: <DollarSign className="w-6 h-6 text-green-500" />, label: 'Total Earnings', value: `$${userData.totalEarnings.toLocaleString()}`, subtext: 'From completed pull requests' },
            { icon: <GitPullRequest className="w-6 h-6 text-blue-500" />, label: 'Pull Requests', value: userData.pullRequestsCount, subtext: 'Successfully merged' },
            { icon: <Briefcase className="w-6 h-6 text-purple-500" />, label: 'Projects', value: userData.projectsContributed, subtext: 'Contributed to' },
            { icon: <Star className="w-6 h-6 text-yellow-500" />, label: 'Average Rating', value: `${userData.averageRating}/5.0`, subtext: 'From maintainers' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
              {(['Overview', 'Pull Requests', 'Achievements', 'Activity'] as TabName[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm 
                    ${activeTab === tab 
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {renderTabContent()}
        </div>

      </div>
    </div>
    </div>
    </div>
  );
};

export default UserProfilePage;

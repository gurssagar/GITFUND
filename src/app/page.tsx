'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useWeb3 } from '@/assets/components/web3Context';
import MetaMaskButton from '@/assets/components/metamask';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function LandingPage() {
  const { account, connectWallet } = useWeb3();
{/* Stats Section */}
      // Add these imports at the top
      
      // Add this data array before the Stats Section
      const growthData = [
        { name: "Sept 2023", value: 1000 },
        { name: "Oct 2023", value: 2000 },
        { name: "Nov 2023", value: 3000 },
        { name: "Dec 2023", value: 4000 },
        { name: "Jan 2024", value: 6000 },
        { name: "Feb 2024", value: 8000 },
        { name: "Mar 2024", value: 10000 },
      ];
      
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Image src="/gitfund-white.webp" alt="GitFund logo" width={120} height={40} />
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <Link href="/projects" className="hover:text-purple-400 transition-colors">Projects</Link>
            <Link href="/homepage" className="hover:text-purple-400 transition-colors">Dashboard</Link>
            <Link href="/create-project" className="hover:text-purple-400 transition-colors">Submit Project</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <MetaMaskButton />
            <Link 
              href="/Login" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full hover:from-purple-700 hover:to-blue-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            <span className="block">Open Source is tough, but it</span>
            <span className="block">doesn't have to be.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 text-center max-w-3xl mx-auto mb-10">
            Maintainers focus on code, contributors get rewarded, and projects thrive. We're here to fix it.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/Login" 
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
            >
              Fund a Project
            </Link>
          </div>

          {/* Circular flow diagram */}
          <div className="relative mt-20 max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20 rounded-full blur-3xl"></div>
            <div className="relative flex justify-between items-center">
              <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">Contributors</h3>
                <p className="text-gray-400">Get rewarded for your work</p>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600/30 backdrop-blur-md p-4 rounded-full">
                <Image src="/gitfund-white.webp" alt="GitFund" width={60} height={60} className="rounded-full" />
              </div>
              <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">Maintainers</h3>
                <p className="text-gray-400">Focus on building great software</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">A single platform for open-source collaboration</p>
          </div>
        </div>
      </section>

      {/* Growth Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f1a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="block">Your Functional Growth is</span>
                <span className="block">Our Mission.</span>
              </h2>
              <p className="text-gray-300 mb-8">
                We're committed to helping open-source projects grow sustainably. Our platform connects contributors with projects that value their skills and rewards their efforts.
              </p>
              <Link 
                href="/projects" 
                className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors inline-block"
              >
                Explore Projects
              </Link>
            </div>
            <div className="md:w-1/2 h-[20rem] bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      
      
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">248<span className="text-purple-500">+</span></h3>
              <p className="text-gray-400">Projects Funded</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">4390<span className="text-purple-500">+</span></h3>
              <p className="text-gray-400">Contributors</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">5<span className="text-purple-500">+</span></h3>
              <p className="text-gray-400">Years Active</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">One single platform for all<br />open-source stakeholders</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">For Blockchain Ecosystem</h3>
              <p className="text-gray-400">Connect your blockchain project with talented developers and grow your ecosystem.</p>
              <div className="mt-6">
                <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">For Open-Source Maintainers</h3>
              <p className="text-gray-400">Get the funding and support you need to focus on building great software.</p>
              <div className="mt-6">
                <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">For Open-Source Contributors</h3>
              <p className="text-gray-400">Get rewarded for your contributions to open-source projects you care about.</p>
              <div className="mt-6">
                <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our wall of love</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial cards would go here */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                <div>
                  <h4 className="font-semibold">Developer Name</h4>
                  <p className="text-sm text-gray-400">Project Maintainer</p>
                </div>
              </div>
              <p className="text-gray-300">"GitFund has transformed how I maintain my open-source projects. The funding model is transparent and the community support is incredible."</p>
            </div>
            
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                <div>
                  <h4 className="font-semibold">Contributor Name</h4>
                  <p className="text-sm text-gray-400">Open Source Developer</p>
                </div>
              </div>
              <p className="text-gray-300">"I've been able to contribute to projects I'm passionate about and get rewarded for my work. GitFund makes open-source sustainable for everyone."</p>
            </div>
            
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                <div>
                  <h4 className="font-semibold">Company Name</h4>
                  <p className="text-sm text-gray-400">Blockchain Project</p>
                </div>
              </div>
              <p className="text-gray-300">"We've found amazing talent through GitFund and have been able to accelerate our development roadmap significantly."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl mx-4 md:mx-8 lg:mx-16 my-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Try our app now</h2>
          <Link 
            href="/Signup" 
            className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Image src="/gitfund-white.webp" alt="GitFund logo" width={100} height={40} className="mb-4" />
              <p className="text-sm text-gray-400">Empowering open-source communities through sustainable funding.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">How it works</Link></li>
                <li><Link href="/" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">Terms</Link></li>
                <li><Link href="/" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">GitHub</Link></li>
                <li><Link href="/" className="hover:text-white">Discord</Link></li>
                <li><Link href="/" className="hover:text-white">Twitter</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2023 GitFund. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
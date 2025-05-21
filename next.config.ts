import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    domains: [
      'avatars.githubusercontent.com',
      's3.tebi.io',
      'gursagar.app.n8n.cloud',
      'gitfund-chat-app.vercel.app',
      // Add other domains you need here
    ],
  },
  
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
};


export default nextConfig;

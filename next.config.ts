import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      's3.tebi.io',
      'gursagar.app.n8n.cloud'
      // Add other domains you need here
    ],
  },};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      's3.tebi.io',
      'gursagar.app.n8n.cloud',
      
      // Add other domains you need here
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

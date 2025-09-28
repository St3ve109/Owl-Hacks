import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Keep these for potential future use when AP Images API is enabled
      {
        protocol: 'https',
        hostname: 'api.sportradar.com',
        pathname: '/mlb-images-t3/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sportradar.com',
        pathname: '/mlb-images-p3/**',
      },
    ],
  },
  // Ensure assets directory is properly served
  publicRuntimeConfig: {
    assetPrefix: '',
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Adjust this size as needed
    },
  },
};

export default nextConfig;

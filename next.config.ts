import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  // Exclude scripts directory from Next.js compilation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

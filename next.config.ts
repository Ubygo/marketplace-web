import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared with Expo mobile app; Next.js only inlines NEXT_PUBLIC_* by default.
  env: {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

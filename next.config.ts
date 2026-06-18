import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.29.242"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname:
          "owtlaecmdosqhrozhnst.supabase.co",
      },
    ],
  },
};

export default nextConfig;
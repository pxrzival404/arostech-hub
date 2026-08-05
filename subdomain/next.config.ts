import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Izinkan cross-origin requests dari z.ai preview domain saat dev.
  // Tanpa ini, Next.js warning: "Cross origin request detected from preview-*.space-z.ai".
  allowedDevOrigins: [
    "preview-chat-c5ccaae5-843d-4aed-99c6-9693d622aff8.space-z.ai",
    "*.space-z.ai",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;

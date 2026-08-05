import type { NextConfig } from "next";
import { writeHtmlVerificationFile } from "./src/lib/seo/gsc-verify";
import { withSentryConfig } from "@sentry/nextjs";

// Trigger HTML verification file creation
writeHtmlVerificationFile();

// Skip heavy Sentry wrapper during Cloudflare Pages build to stay under 25MB worker limit
const isCloudflareBuild = process.env.CF_PAGES === "1" || process.env.NEXT_ON_PAGES === "1" || process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  serverExternalPackages: ["resend", "@react-email/render"],
  turbopack: {},
  typescript: {
    // Run tsc separately; skip during Turbopack build to avoid OOM on Windows
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@portabletext/react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "clsx",
      "tailwind-merge",
      "@21st-sdk/react",
      "@ai-sdk/react",
      "ai",
      "zod",
      "zustand",
      "posthog-js",
      "@sanity/client",
      "@auth/prisma-adapter",
    ],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        providedExports: true,
        sideEffects: true,
        minimize: true,
      };
    }
    if (isCloudflareBuild) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@sentry/nextjs": false,
      };
    }
    return config;
  },
  allowedDevOrigins: [
    "lvh.me",
    "pju.lvh.me",
    "solarpanel.lvh.me",
    "solarcell.lvh.me",
    "penangkalpetir.lvh.me",
    "alatpetir.lvh.me",
    "baterai.lvh.me",
    "dashboard.lvh.me",
    "unknown.lvh.me",
  ],
};

export default isCloudflareBuild
  ? nextConfig
  : withSentryConfig(
      nextConfig,
      {
        org: process.env.SENTRY_ORG || "pt-daya-berkah-sentosa-nusanta",
        project: process.env.SENTRY_PROJECT || "javascript-nextjs",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: !process.env.CI,
        sourcemaps: {
          disable: true,
        },
        widenClientFileUpload: false,
        tunnelRoute: "/api/monitoring",
      }
    );


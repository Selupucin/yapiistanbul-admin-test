import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/db"],
  outputFileTracingIncludes: {
    "/**": ["../../packages/**/*"],
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;

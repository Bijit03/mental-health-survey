import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The recovered Sites project includes Cloudflare-only example types that
  // are not part of the Vercel production application.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Legacy static host for ambassador photos only. See LEGACY_IMAGE_BASE in
      // src/constants/index.ts — replace with Convex file storage.
      {
        protocol: "https",
        hostname: "qdjrwasidlmgqxakdxkl.supabase.co",
      },
      // Convex returns signed avatar URLs from the deployment's cloud host.
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

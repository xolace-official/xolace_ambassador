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
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@heizbua/ui", "@heizbua/db", "@heizbua/types"],
};

export default nextConfig;

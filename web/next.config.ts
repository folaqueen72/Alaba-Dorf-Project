import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // required for the production Docker image
};

export default nextConfig;

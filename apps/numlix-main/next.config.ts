import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    externalDir: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-router-dom": path.resolve(__dirname, "src/lib/react-router-dom-shim.tsx"),
    };
    return config;
  },
};

export default nextConfig;

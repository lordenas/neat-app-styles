import type { NextConfig } from "next";
import path from "node:path";

/** Запуск за Caddy (https://numlix.local): корректные абсолютные редиректы i18n по Host, не на 127.0.0.1:3000. */
const behindProxy = process.env.NUMLIX_BEHIND_PROXY === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Dev behind Caddy / *.numlix.local — иначе Next может отдавать 400 на служебные dev-запросы.
  allowedDevOrigins: ["numlix.local", "*.numlix.local"],
  experimental: {
    externalDir: true,
    // Внутренний флаг Next: см. resolve-routes (initURL). Не включать без прокси — сломает http://localhost:3000.
    ...(behindProxy ? { trustHostHeader: true } : {}),
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-router-dom": path.resolve(__dirname, "src/lib/react-router-dom-shim.tsx"),
      "@numlix/auth-shared": path.resolve(__dirname, "../../packages/auth-shared/src/index.ts"),
    };
    return config;
  },
};

export default nextConfig;

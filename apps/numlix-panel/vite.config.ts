import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8081,
    allowedHosts: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@numlix/auth-shared": path.resolve(__dirname, "../../packages/auth-shared/src/index.ts"),
    },
  },
});

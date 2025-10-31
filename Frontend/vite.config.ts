import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Dev proxy to forward auth/api requests to backend so cookies are same-origin
  server: {
    proxy: {
      // Proxy authentication and session verification endpoints
      "/login": "http://localhost:8787",
      "/logout": "http://localhost:8787",
      "/verify-session": "http://localhost:8787",
      // Proxy API routes under /api and student routes used by frontend
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/student": "http://localhost:8787",
    },
  },
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),          // único plugin por enquanto
    // se um dia precisar de algo só em dev:
    // mode === "development" && outroPlugin(),
  ].filter(Boolean),  // mantém o array limpo
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

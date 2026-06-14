import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Fully static app - no backend, no proxy. Builds to /dist for Cloudflare Pages.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});

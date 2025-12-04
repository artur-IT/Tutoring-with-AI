// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // Use static output for dev mode (faster), server for production
  output: import.meta.env.PROD ? "server" : "static",
  integrations: [
    react(),
    // Only enable sitemap in production builds
    ...(import.meta.env.PROD ? [sitemap()] : []),
  ],
  server: {
    port: 3000,
    // Faster startup by reducing file watching
    fs: {
      strict: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Optimize Vite for faster dev startup
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    // Exclude dist folder from watching
    server: {
      watch: {
        ignored: ["**/dist/**", "**/node_modules/**"],
      },
    },
  },
  // Only use adapter in production
  ...(import.meta.env.PROD && {
    adapter: node({
      mode: "standalone",
    }),
  }),
});

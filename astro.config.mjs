// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // Output mode: undefined in dev (faster), "server" in production
  // In dev mode, Astro ignores this setting and always uses dev server
  ...(import.meta.env.PROD && { output: "server" }),
  integrations: [
    react(),
    // Only enable sitemap in production builds
    ...(import.meta.env.PROD ? [sitemap()] : []),
  ],
  server: {
    port: 3000,
  },
  vite: {
    plugins: [tailwindcss()],
    // Optimize Vite for faster dev startup
    optimizeDeps: {
      include: ["react", "react-dom"],
      force: false, // Don't force re-optimization on every start
    },
    // Exclude dist folder from watching
    server: {
      watch: {
        ignored: ["**/dist/**", "**/node_modules/**", "**/.astro/**", "**/.git/**"],
      },
      fs: {
        // Restrict file system access for better performance
        strict: false,
      },
    },
    // Cache configuration for faster rebuilds
    cacheDir: "node_modules/.vite",
    build: {
      // Don't minify in dev mode
      minify: false,
    },
  },
  // Only use adapter in production
  ...(import.meta.env.PROD && {
    adapter: node({
      mode: "standalone",
    }),
  }),
});

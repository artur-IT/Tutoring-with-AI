// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  // Output mode: undefined in dev (faster), "server" in production
  // In dev mode, Astro ignores this setting and always uses dev server
  ...(import.meta.env.PROD && { output: "server" }),
  integrations: [
    react(),
    // Only enable sitemap in production builds
    ...(import.meta.env.PROD ? [sitemap()] : []),
    AstroPWA({
      mode: import.meta.env.PROD ? "production" : "development",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      registerType: "autoUpdate",
      injectRegister: false, // We handle registration manually in Layout.astro
      selfDestroying: false,
      manifest: {
        name: "Korepetytor AI",
        short_name: "Korepetytor AI",
        description: "Interactive AI tutor for teenagers",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: null, // Disable navigation fallback
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // Cache-first strategy for images and fonts (static assets)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // StaleWhileRevalidate for CSS and JS files
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          // NetworkFirst for HTML pages - try network first, fall back to cache
          {
            urlPattern: ({ request, url }) => {
              return request.mode === "navigate" || url.pathname.endsWith(".html") || !url.pathname.includes(".");
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          // NetworkFirst for local API endpoints
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // NetworkOnly for Mistral AI API (never cache)
          {
            urlPattern: /^https:\/\/api\.mistral\.ai\/.*/i,
            handler: "NetworkOnly",
            options: {
              cacheName: "mistral-api",
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable PWA in dev - it causes navigation issues
        navigateFallbackAllowlist: [/^\//],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  vite: {
    plugins: [tailwindcss()],
    // Optimize Vite for faster dev startup
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-avatar",
        "@radix-ui/react-dialog",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-select",
        "@radix-ui/react-slot",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
      ],
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
      hmr: {
        // Optimize HMR
        overlay: true,
      },
    },
    // Cache configuration for faster rebuilds
    cacheDir: "node_modules/.vite",
    build: {
      // Don't minify in dev mode
      minify: false,
    },
    // Disable ESLint in dev mode for faster startup
    clearScreen: false,
  },
  // Vercel-only: serverless output for deployment; dev server ignores adapter
  ...(import.meta.env.PROD && { adapter: vercel() }),
});

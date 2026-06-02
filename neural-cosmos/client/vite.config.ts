import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Neural Cosmos client.
// - dev: API on :4020 is proxied (see server.proxy).
// - static/PWA build: run `VITE_STATIC=1 vite build --base=/path/`; the client
//   then uses the in-browser repo (src/local) and ships an installable PWA.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // three.js is large
        navigateFallback: "index.html",
      },
      manifest: {
        name: "Neural Cosmos",
        short_name: "Cosmos",
        description: "A living business universe in 3D.",
        theme_color: "#04040a",
        background_color: "#04040a",
        display: "standalone",
        orientation: "any",
        start_url: ".",
        icons: [
          { src: "icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true, // listen on all interfaces so the container port can be forwarded
    proxy: {
      "/api": { target: "http://localhost:4020", changeOrigin: true },
    },
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});

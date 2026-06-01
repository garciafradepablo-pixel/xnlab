import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Neural Cosmos client. The API lives on :4020 in dev; proxy /api to it so the
// client can use same-origin relative fetches.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // dev API. Override by editing this target if your server runs elsewhere.
      "/api": {
        target: "http://localhost:4020",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2022",
    // three.js is large; split it out of the main chunk.
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

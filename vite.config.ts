import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

/**
 * `base` is where the built site will be served from.
 *
 * On GitHub Pages this repo publishes to https://band-agents.github.io/almadina-site/,
 * i.e. a sub-path — so every asset URL has to be prefixed with it or the
 * browser asks for /assets/… at the domain root and gets a 404 (which is what
 * a blank white page usually is). The deploy workflow sets VITE_BASE; local
 * `npm run dev` leaves it unset and serves from "/".
 */
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5190,
  },
  build: {
    // Remotion pulls a large dependency graph into the studio entry only;
    // the site itself never imports it, so keep the warning threshold sane.
    chunkSizeWarningLimit: 900,
  },
});

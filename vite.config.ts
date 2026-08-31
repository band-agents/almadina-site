import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
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

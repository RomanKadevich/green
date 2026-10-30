import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  server: {
    watch: { usePolling: true, interval: 300 },
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.js"],
    },
  },
});

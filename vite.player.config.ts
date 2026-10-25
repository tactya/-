import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [localIconPlugin(command), react()],
  build: {
    outDir: "dist-player",
    rollupOptions: {
      input: "player.html",
      output: {
        entryFileNames: "player.js",
        assetFileNames: "[name][extname]",
        inlineDynamicImports: true,
      },
    },
  },
}));

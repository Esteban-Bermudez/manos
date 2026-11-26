import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Relative asset URLs keep the single HTML usable from file:// as well as a web server.
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
});

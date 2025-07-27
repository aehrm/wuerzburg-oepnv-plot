import * as path from "path";
import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig(({ mode }) => ({
  build: {
    target: ["es2020"],
  },
  resolve: {
    mainFields: ["module"],
    alias: { "~": path.resolve(__dirname, "./node_modules") },
  },
  plugins: [
    angular({
      inlineStylesExtension: "sass",
    }),
  ],
  base: "./",
}));

import * as path from "path";
import { defineConfig, PluginOption } from "vite";
import angular from "@analogjs/vite-plugin-angular";

const globalPolyfill = (): PluginOption => {
  return {
    name: "vite:global-ployfill",
    transformIndexHtml: {
      transform(html: string) {
        return {
          html,
          tags: [
            {
              tag: "script",
              children: `
                function getGlobal() {
                  if (typeof globalThis === 'object') return globalThis;
                  if (typeof window === 'object') return window;
                }
                global = getGlobal()
              `,
              injectTo: "head-prepend",
            },
          ],
        };
      },
    },
  };
};

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
    globalPolyfill(),
  ],
  base: "./",
}));

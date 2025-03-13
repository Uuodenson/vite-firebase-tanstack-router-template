import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  // optimizeDeps: {  esbuildOptions: {  plugins: [  NodeGlobalsPolyfillPlugin({  buffer: true,  process: true,  })  ]  }  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";
import tailwindcss from "@tailwindcss/vite"
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite(),
  ],
  build: {
    commonjsOptions:{
      include: [/crypto-js/, /node_modules/]
    }
  },
  optimizeDeps: {
   include: ['crypto-js'], 
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
});

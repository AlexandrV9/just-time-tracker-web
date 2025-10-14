import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_API_ENDPOINT");
  const apiEndpoint = env.VITE_API_ENDPOINT;

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      VitePWA({
        registerType: "autoUpdate",

        strategies: "injectManifest", // для кастомного сервис-воркера
        srcDir: "src", // это папка в которой находится сервис-воркера
        filename: "sw.js", // это название файла сервис-воркера

        // Говорим, чтобы sw работал и в dev режиме
        devOptions: {
          enabled: false,
          type: "module",
          navigateFallback: "index.html",
          suppressWarnings: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    server: {
      open: true,
      proxy: {
        "/api": {
          target: apiEndpoint,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});

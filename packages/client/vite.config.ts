import path from "path";
import { readFileSync } from "fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import { getSiteUrl, sitemapPlugin } from "./scripts/sitemap";

const appVersion = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8"),
).version as string;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiEndpoint = env.VITE_API_ENDPOINT;

  return {
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routeFileIgnorePattern: "_ui",
      }),
      react(),
      sitemapPlugin(getSiteUrl(env)),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.js",
        injectManifest: {
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}",
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
        devOptions: {
          enabled: false,
          type: "module",
          navigateFallback: "index.html",
          suppressWarnings: true,
        },
      }),
      env.ANALYZE === "true" &&
        visualizer({
          filename: "reports/bundle.html",
          gzipSize: true,
          brotliSize: true,
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
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const clientIp = req.socket?.remoteAddress;

              if (clientIp) {
                proxyReq.setHeader("X-Forwarded-For", clientIp);
                proxyReq.setHeader("X-Real-IP", clientIp);
              }

              if (req.url?.includes("/activities/events")) {
                proxyReq.setHeader("Accept", "text/event-stream");
                proxyReq.setHeader("Cache-Control", "no-cache");
              }
            });

            proxy.on("proxyRes", (proxyRes, req) => {
              if (req.url?.includes("/activities/events")) {
                delete proxyRes.headers["content-length"];
                proxyRes.headers["cache-control"] = "no-cache";
                proxyRes.headers["connection"] = "keep-alive";
                proxyRes.headers["x-accel-buffering"] = "no";
              }
            });
          },
        },
      },
    },
  };
});

import type { Plugin } from "vite";

const ROUTES: { path: string; priority: string }[] = [
  { path: "/", priority: "1.0" },
  { path: "/landing", priority: "1.0" },
  { path: "/signin", priority: "0.8" },
  { path: "/signup", priority: "0.8" },
  { path: "/terms-of-service", priority: "0.3" },
  { path: "/privacy-policy", priority: "0.3" },
];

export function getSiteUrl(env: Record<string, string>) {
  const url = (env.VITE_APP_URL ?? "").trim().replace(/\/$/, "");
  return url.startsWith("http://localhost") ? "" : url;
}

export function sitemapPlugin(siteUrl: string): Plugin {
  return {
    name: "sitemap",
    apply: "build",
    generateBundle() {
      if (!siteUrl) return;

      const lastmod = new Date().toISOString().slice(0, 10);
      const urls = ROUTES.map(
        ({ path, priority }) =>
          `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`,
      ).join("\n");

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

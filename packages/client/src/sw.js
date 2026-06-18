/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

/** @type {ServiceWorkerGlobalScope} */
const sw = self;

const DEFAULT_NOTIFICATION_ICON = "/icons/logo-192x192.png";
const DEFAULT_NOTIFICATION_BADGE = "/icons/logo-120x120.png";

const CACHE_NAMES = {
  googleFonts: "google-fonts",
  publicAssets: "public-assets",
};

/** Injected at build time by vite-plugin-pwa (injectManifest). */
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

sw.addEventListener("install", () => {
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(clientsClaim());
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isEventStreamRequest(request, url) {
  return (
    request.headers.get("accept") === "text/event-stream" ||
    url.pathname.includes("/activities/events")
  );
}

// API и SSE — только сеть, без кэша.
registerRoute(
  ({ request, url }) => isApiRequest(url) || isEventStreamRequest(request, url),
  new NetworkOnly(),
);

// SPA-навигация: свежий HTML из сети, офлайн — precached index.html.
registerRoute(
  ({ request }) => request.mode === "navigate",
  async ({ request }) => {
    try {
      return await fetch(request);
    } catch {
      const cachedIndex = await matchPrecache("/index.html");
      return (
        cachedIndex ||
        new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    }
  },
);

// Локали и публичные ассеты (не попали в precache).
registerRoute(
  ({ url, request }) =>
    request.method === "GET" &&
    url.origin === sw.location.origin &&
    (url.pathname.startsWith("/locales/") || url.pathname.startsWith("/icons/")),
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.publicAssets,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

// Google Fonts.
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: CACHE_NAMES.googleFonts,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 24,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null;
}

/**
 * @param {PushEvent} event
 * @returns {Promise<void>}
 */
async function handlePush(event) {
  const fallback = {
    title: "Time Tracker",
    options: {
      body: "",
      icon: DEFAULT_NOTIFICATION_ICON,
      badge: DEFAULT_NOTIFICATION_BADGE,
      data: { url: "/" },
    },
  };

  if (!event.data) {
    await sw.registration.showNotification(
      fallback.title,
      fallback.options,
    );
    return;
  }

  let payload = fallback;

  try {
    const parsed = event.data.json();

    if (isRecord(parsed)) {
      payload = {
        title:
          typeof parsed.title === "string" ? parsed.title : fallback.title,
        options: {
          body: typeof parsed.body === "string" ? parsed.body : "",
          icon:
            typeof parsed.icon === "string"
              ? parsed.icon
              : DEFAULT_NOTIFICATION_ICON,
          badge:
            typeof parsed.badge === "string"
              ? parsed.badge
              : DEFAULT_NOTIFICATION_BADGE,
          tag: typeof parsed.tag === "string" ? parsed.tag : undefined,
          renotify:
            typeof parsed.renotify === "boolean" ? parsed.renotify : undefined,
          data: {
            url:
              typeof parsed.url === "string"
                ? parsed.url
                : isRecord(parsed.data) && typeof parsed.data.url === "string"
                  ? parsed.data.url
                  : "/",
            ...(isRecord(parsed.data) ? parsed.data : {}),
          },
        },
      };
    }
  } catch {
    const text = event.data.text().trim();
    if (text) {
      payload = {
        title: fallback.title,
        options: {
          ...fallback.options,
          body: text,
        },
      };
    }
  }

  await sw.registration.showNotification(payload.title, payload.options);
}

sw.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});

/**
 * @param {NotificationEvent} event
 * @returns {Promise<void>}
 */
async function handleNotificationClick(event) {
  event.notification.close();

  const data = isRecord(event.notification.data)
    ? event.notification.data
    : {};
  const targetUrl = typeof data.url === "string" ? data.url : "/";
  const absoluteUrl = new URL(targetUrl, sw.location.origin).href;

  const windowClients = await sw.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    if (!("focus" in client)) continue;

    if (new URL(client.url).origin !== sw.location.origin) continue;

    await client.focus();

    if ("navigate" in client) {
      await client.navigate(absoluteUrl);
    }

    return;
  }

  await sw.clients.openWindow(absoluteUrl);
}

sw.addEventListener("notificationclick", (event) => {
  event.waitUntil(handleNotificationClick(event));
});

sw.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    sw.skipWaiting();
  }
});

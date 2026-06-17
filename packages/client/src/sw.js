const CACHE_NAME = "time-tracker-v1.0.8";

const STATIC_CACHE_URLS = ["/", "https://fonts.googleapis.com/"];

/** Injected at build time by vite-plugin-pwa (injectManifest). */
const PRECACHE_MANIFEST = self.__WB_MANIFEST;

self.addEventListener("install", (event) => {
  console.log("🛠️ Service Worker: Installing...");

  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        console.log("📦 Service Worker: Caching static assets", cache);
        await cache.addAll(STATIC_CACHE_URLS);

        const precacheUrls = PRECACHE_MANIFEST.map((entry) =>
          typeof entry === "string" ? entry : entry.url,
        );

        await Promise.all(
          precacheUrls.map((url) =>
            cache.add(url).catch((error) => {
              console.warn("Service Worker: precache skipped", url, error);
            }),
          ),
        );
      })
      .then(() => {
        console.log("✅ Service Worker: Installation completed");
      })
      .catch((error) => {
        console.error("❌ Service Worker: Installation failed", error);
      }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("🎉 Service Worker: Activated");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("🗑️ Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .then(() => {
        console.log("✅ Service Worker: Ready to handle requests");
      }),
  );
});

function isEventStream(request) {
  return (
    request.headers.get("accept") === "text/event-stream" ||
    request.url.includes("/activities/events")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || !/^https?:/.test(request.url)) {
    return;
  }

  // Стримы (SSE) воркер не трогает — иначе ломается соединение и падает cache.put.
  if (isEventStream(request)) {
    return;
  }

  event.respondWith(
    handleFetch(request).catch(() => {
      return createOfflineResponse(request);
    }),
  );
});

async function handleFetch(request) {
  // HTML-навигации и API всегда тянем из сети, чтобы после релиза подхватывался свежий index.html.
  if (request.mode === "navigate" || request.url.includes("/api/")) {
    return networkFirstStrategy(request);
  }

  return cacheFirstStrategy(request);
}

// Кэширование best-effort: не кэшируем стримы и глушим возможные ошибки записи.
async function putInCache(request, response) {
  if (!response || response.status !== 200) {
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream")) {
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch {
    // тело могло оказаться стримом/непригодным для кэша — игнорируем
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    putInCache(request, networkResponse.clone());

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  putInCache(request, networkResponse.clone());

  return networkResponse;
}

function createOfflineResponse(request) {
  if (request.mode === "navigate") {
    return caches.match("/").then((cachedIndex) => {
      return (
        cachedIndex ||
        new Response("Offline", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        })
      );
    });
  }

  return new Response("Network error", {
    status: 408,
    headers: { "Content-Type": "text/plain" },
  });
}

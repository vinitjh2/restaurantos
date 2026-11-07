/**
 * RestaurantOS Progressive Web App (PWA) Service Worker
 * Ensures offline operation for POS, KDS, and dining room terminals.
 */

const CACHE_NAME = "restaurantos-cache-v2";
const STATIC_ASSETS = [
  "/pos",
  "/kitchen",
  "/tables",
  "/orders",
  "/sync-monitor",
  "/mobile/waiter",
  "/mobile/pos",
  "/manifest.json",
  "/favicon.ico"
];

// Install event: Pre-cache core app shells
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline shells");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[ServiceWorker] Pre-cache partial skip:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old cache iterations
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing obsolete cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first with offline cache fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip Next.js internal hot-reloads and API sync mutations from SW cache
  if (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.startsWith("/api/pos/sync")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid static responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith("/_next/static/") || STATIC_ASSETS.includes(url.pathname))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline: Fallback to cached version
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If request was for a navigation page, return the cached /pos shell
          if (event.request.mode === "navigate") {
            return caches.match("/pos");
          }
          return new Response("Network offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});

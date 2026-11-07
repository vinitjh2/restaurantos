/**
 * RestaurantOS Progressive Web App (PWA) Service Worker (v4)
 * Production-ready offline management with strict navigation isolation,
 * Next.js React Server Component (RSC) pass-through, and zero-cross-page cache leakage.
 */

const CACHE_NAME = "restaurantos-cache-v4";

// Explicit list of offline-capable terminal routes & core static assets
const OFFLINE_APP_SHELLS = [
  "/pos",
  "/kitchen",
  "/tables",
  "/orders",
  "/sync-monitor",
  "/mobile/waiter",
  "/mobile/pos",
  "/manifest.json",
  "/favicon.ico",
];

// Install event: Pre-cache offline shells and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[ServiceWorker v4] Pre-caching offline terminal shells");
      // Pre-cache assets safely without letting one failure abort the entire install
      for (const asset of OFFLINE_APP_SHELLS) {
        try {
          const res = await fetch(asset);
          if (res.ok && !res.redirected) {
            await cache.put(asset, res);
          }
        } catch (err) {
          console.warn("[ServiceWorker v4] Partial pre-cache skip for:", asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate event: Immediately purge ALL obsolete caches (v1, v2, v3, etc.) and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[ServiceWorker v4] Purging obsolete cache:", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message event: Listen for immediate skip-waiting or cache clear instructions
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_ALL_CACHES") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});

// Fetch event: Network-first navigation, strict RSC pass-through, and isolated offline fallbacks
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker entirely for:
  // - Cross-origin requests
  // - Server-side API routes (/api/)
  // - Next.js development HMR and socket connections
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  // 2. Next.js React Server Component (RSC) requests:
  // Identified by headers (rsc: 1) or query parameter (_rsc)
  const isRscRequest =
    event.request.headers.get("rsc") === "1" ||
    event.request.headers.get("next-router-state-tree") !== null ||
    url.searchParams.has("_rsc");

  if (isRscRequest) {
    // RSC data streams MUST ALWAYS be fetched fresh from network.
    // NEVER cache HTML for an RSC request, and NEVER return HTML for an RSC request!
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Offline RSC payload unavailable", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain" },
        });
      })
    );
    return;
  }

  // 3. Navigation requests (Full page visits, link clicks, reloads)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // CRITICAL SECURITY & ROUTING RULE:
          // Never cache redirected responses under the requested URL.
          // Only cache valid, authorized, non-redirected offline shell pages.
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            !networkResponse.redirected &&
            OFFLINE_APP_SHELLS.includes(url.pathname)
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // OFFLINE FALLBACK:
          // First, check if this EXACT requested URL was cached previously
          const cachedExact = await caches.match(event.request);
          if (cachedExact) {
            return cachedExact;
          }

          // Check if shell exists by pathname in cache
          const cachedShell = await caches.match(url.pathname);
          if (cachedShell) {
            return cachedShell;
          }

          // If requesting POS specifically while offline
          if (url.pathname === "/pos") {
            const posFallback = await caches.match("/pos");
            if (posFallback) return posFallback;
          }

          // For all other pages (/inventory, /orders, /menu, /reports, /settings, etc.):
          // NEVER return Operations Overview (/) or /pos!
          // Return a clean, standalone offline notification document.
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Offline — RestaurantOS</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
                  .card { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; max-width: 28rem; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center; }
                  h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
                  p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
                  .btn { display: inline-flex; align-items: center; justify-content: center; background: #0f172a; color: white; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; text-decoration: none; margin: 0.25rem; }
                  .btn-outline { background: white; color: #0f172a; border: 1px solid #cbd5e1; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Section Requires Network</h1>
                  <p>You are currently offline. <strong>${url.pathname}</strong> requires an active internet connection to synchronize latest data.</p>
                  <div>
                    <a href="/pos" class="btn">Launch Offline POS</a>
                    <a href="javascript:location.reload()" class="btn btn-outline">Retry Connection</a>
                  </div>
                </div>
              </body>
            </html>`,
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        })
    );
    return;
  }

  // 4. Static assets (_next/static, css, js, fonts, images, manifest, favicon)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            !networkResponse.redirected
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Default pass-through
  event.respondWith(fetch(event.request));
});


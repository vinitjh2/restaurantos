"use client";

import { useEffect } from "react";

const CURRENT_CACHE_VERSION = "restaurantos-cache-v4";

export function PwaRegister() {
  useEffect(() => {
    // In development mode, unregister any active service worker and clear caches
    // to guarantee Hot Module Replacement (HMR), fast refresh, and eliminate hydration mismatches.
    if (process.env.NODE_ENV === "development") {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
            console.log("[PWA] ServiceWorker unregistered in development environment.");
          }
        });
      }
      if (typeof window !== "undefined" && "caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    // 1. Client-Side Cache Sanitation: Clean up any legacy or poisoned caches
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== CURRENT_CACHE_VERSION) {
            console.log(`[PWA] Purging obsolete browser cache '${key}'`);
            caches.delete(key);
          }
        });
      }).catch(() => {});
    }

    // 2. Register Service Worker and manage lifecycle in production
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] ServiceWorker registered with scope:", registration.scope);

          // Proactively check for service worker updates on every page load
          registration.update().catch(() => {});

          // If a new worker is waiting, prompt it to take over immediately
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[PWA] New version installed; sending skip waiting");
                  installingWorker.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn("[PWA] ServiceWorker registration failed:", error);
        });

      // Reload smoothly when new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("[PWA] Service worker controller updated.");
        }
      });
    }
  }, []);

  return null;
}

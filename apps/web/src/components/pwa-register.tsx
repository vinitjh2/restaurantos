"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] ServiceWorker registered successfully:", registration.scope);
        })
        .catch((error) => {
          console.warn("[PWA] ServiceWorker registration failed:", error);
        });
    }
  }, []);

  return null;
}

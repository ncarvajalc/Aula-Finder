"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const basePath = "/Aula-Finder";
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
        .catch(() => {
          // Service worker registration failed silently
        });
    }
  }, []);

  return null;
}

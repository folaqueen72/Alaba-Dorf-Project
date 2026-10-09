"use client";

import { useEffect } from "react";

// Registers the service worker in production only (keeps dev refresh clean).
// Push.tsx reuses this registration for order-update subscriptions.
export function RegisterSW() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

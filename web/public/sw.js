/* Alaba Dorf service worker: push notifications + offline fallback.
   NOTE: the fetch handler below is required — browsers only offer
   "Install app" when the service worker handles fetch events. */
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open("alaba-static-v1")
      .then((cache) => cache.addAll([OFFLINE_URL, "/logo.png"]))
      .then(() => self.skipWaiting())
      .catch(() => null)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        throw new Error("offline");
      })
  );
});
self.addEventListener("push", (event) => {
  let data = { title: "Alaba Dorf", body: "Your order has an update.", url: "/track" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      data: { url: data.url || "/track" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/track";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const w of windows) {
          if ("focus" in w) return w.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});

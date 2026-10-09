"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function NotifyToggle({ phone }: { phone: string }) {
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
  );
  const [state, setState] = useState<"off" | "on" | "busy" | "blocked">("off");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => null);
  }, [supported]);

  if (!supported) return null;

  async function enable() {
    setState("busy");
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("blocked");
        setMsg("Notifications are blocked in your browser settings.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        }));
      const res = await fetch("/api/notify/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.toJSON().keys,
          phone: phone || undefined,
        }),
      });
      if (!res.ok) throw new Error("Could not save subscription.");
      setState("on");
    } catch {
      setState("off");
      setMsg("Could not enable notifications on this device.");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notify/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
    } catch {
      /* ignore */
    }
    setState("off");
  }

  if (state === "blocked") {
    return <p className="text-sm text-ash-600 mt-2">{msg}</p>;
  }

  return (
    <div className="mt-3">
      {state === "on" ? (
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">
            Notifications on — you&apos;ll get updates on your orders here.
          </p>
          <button
            type="button"
            onClick={disable}
            className="text-xs font-bold underline underline-offset-2"
          >
            Off
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={state === "busy"}
          onClick={enable}
          className="text-sm font-bold px-3 py-2 rounded-[10px] border border-lemon-600 bg-lemon-50 text-lemon-800"
        >
          {state === "busy" ? "Enabling…" : "Notify me about my orders"}
        </button>
      )}
      {msg ? (
        <p className="text-sm text-ash-600 mt-1">{msg}</p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

// Shows an install button only when the browser offers installation.
export function InstallApp() {
  const [deferred, setDeferred] = useState<unknown>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || installed) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const p = deferred as { prompt: () => Promise<void> };
        await p.prompt();
        setDeferred(null);
      }}
      className="text-sm font-semibold text-white/90 underline underline-offset-4"
    >
      Install this shop as an app
    </button>
  );
}

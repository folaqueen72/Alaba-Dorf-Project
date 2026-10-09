"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { r2Url } from "@/lib/images";

type Photo = {
  id: string;
  imageKey: string;
  caption: string | null;
  active: boolean;
};

export function GalleryManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    if (res.ok) setPhotos(data.images);
    else setMsg(data.error ?? "Could not load gallery.");
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMsg("Choose a photo first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/admin/upload?folder=sessions", {
        method: "POST",
        body: form,
      });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error ?? "Upload failed.");
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageKey: upData.key, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setCaption("");
      setFile(null);
      setMsg("Photo added to Previous works.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(p: Photo) {
    await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this photo from the gallery?")) return;
    await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    load();
  }

  return (
    <Card title="Previous works gallery" className="mt-4">
      <p className="text-sm text-ash-600 mt-1">
        Photos here appear on the customer studio page. Only show your best,
        real work.
      </p>
      <form onSubmit={add} className="flex flex-wrap gap-2 mt-3 items-end">
        <label className="block">
          <span className="block text-sm font-semibold mb-1">Photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </label>
        <label className="block flex-1 min-w-[160px]">
          <span className="block text-sm font-semibold mb-1">
            Caption (optional)
          </span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Family session, Dugbe"
            className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
          />
        </label>
        <Button size="sm" disabled={busy}>
          {busy ? "Uploading…" : "Add Photo"}
        </Button>
      </form>
      {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {photos.map((p) => {
          const src = r2Url(p.imageKey);
          return (
            <div
              key={p.id}
              className="border border-ash-200 rounded-[10px] p-1.5"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={p.caption ?? "Gallery photo"}
                  className={`w-full aspect-square rounded-lg object-cover ${p.active ? "" : "opacity-40"}`}
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-ash-100 flex items-center justify-center text-xs text-ash-600">
                  No preview (storage not set)
                </div>
              )}
              <p className="text-xs font-semibold mt-1 truncate">
                {p.caption || "No caption"}
              </p>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => toggle(p)}
                  className="text-xs font-bold underline underline-offset-2"
                >
                  {p.active ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs font-bold underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {photos.length === 0 ? (
        <p className="text-sm text-ash-600 mt-2">
          No photos yet — the gallery stays hidden until you add some.
        </p>
      ) : null}
    </Card>
  );
}

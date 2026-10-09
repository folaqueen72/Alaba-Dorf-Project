"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { r2Url } from "@/lib/images";
import { koboToNaira } from "@/lib/format";

type Item = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageKey: string | null;
  available: boolean;
};

export function MenuManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const res = await fetch("/api/admin/menu");
    const data = await res.json();
    if (res.ok) setItems(data.items);
    else setMsg(data.error ?? "Could not load menu.");
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(): Promise<string | undefined> {
    if (!file) return undefined;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload?folder=menu", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed.");
    return data.key as string;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const imageKey = await upload();
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Math.round(Number(form.price) * 100),
          description: form.description || undefined,
          imageKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed.");
      setForm({ name: "", price: "", description: "" });
      setFile(null);
      setMsg(`${data.item.name} added to the menu.`);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Create failed.");
    }
  }

  async function toggle(item: Item) {
    const res = await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, available: !item.available }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Update failed.");
    load();
  }

  return (
    <>
      <Card title="Add a dish">
        <form
          onSubmit={create}
          className="grid gap-3 sm:grid-cols-4 mt-2 items-end"
        >
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jollof Rice"
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Price (₦)</span>
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              Photo (optional)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </label>
          <Button>Add Dish</Button>
        </form>
      </Card>
      <div className="grid gap-2 mt-4">
        {items.map((m) => {
          const img = r2Url(m.imageKey);
          return (
            <div
              key={m.id}
              className="bg-white border border-ash-200 rounded-[10px] p-3 flex items-center gap-3"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={m.name}
                  className="w-12 h-12 rounded-lg object-cover border border-ash-200 flex-shrink-0"
                  loading="lazy"
                />
              ) : null}
              <div>
                <p className="font-bold flex items-center gap-2">
                  {m.name}
                  {!m.available ? (
                    <Badge status="pending">Hidden</Badge>
                  ) : null}
                </p>
                <p className="text-sm text-ash-600">
                  {koboToNaira(m.price)}
                  {m.description ? ` · ${m.description}` : ""}
                  {!img ? " · no photo yet" : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => toggle(m)}
              >
                {m.available ? "Hide" : "Show"}
              </Button>
            </div>
          );
        })}
      </div>
      {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
    </>
  );
}

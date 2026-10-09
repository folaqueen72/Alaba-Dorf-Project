"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { koboToNaira } from "@/lib/format";

type Animal = {
  id: string;
  type: string;
  tag: string;
  totalKg: number;
  availableKg: number;
  pricePerKg: number;
  livePrice: number | null;
  liveStock: number | null;
  status: string;
  _count: { reservations: number };
};

export function AnimalsManager() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "COW",
    tag: "",
    totalKg: "",
    pricePerKg: "",
    livePrice: "",
    liveStock: "",
  });

  async function load() {
    const res = await fetch("/api/admin/animals");
    const data = await res.json();
    if (res.ok) setAnimals(data.animals);
    else setMsg(data.error ?? "Could not load animals.");
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        tag: form.tag,
        totalKg: Number(form.totalKg),
        pricePerKg: Math.round(Number(form.pricePerKg) * 100),
        ...(form.livePrice ? { livePrice: Math.round(Number(form.livePrice) * 100) } : {}),
        ...(form.liveStock ? { liveStock: Number(form.liveStock) } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Create failed.");
      return;
    }
    setForm({ type: "COW", tag: "", totalKg: "", pricePerKg: "", livePrice: "", liveStock: "" });
    setMsg(`${data.animal.tag} listed.`);
    load();
  }

  async function adjust(
    id: string,
    finalKg: string,
    price: string,
    livePrice: string,
    liveStock: string
  ) {
    setMsg(null);
    const res = await fetch("/api/admin/animals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...(finalKg ? { finalKg: Number(finalKg) } : {}),
        ...(price ? { pricePerKg: Math.round(Number(price) * 100) } : {}),
        ...(livePrice ? { livePrice: Math.round(Number(livePrice) * 100) } : {}),
        ...(liveStock ? { liveStock: Number(liveStock) } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Update failed.");
      return;
    }
    setMsg("Animal updated and recorded.");
    load();
  }

  return (
    <>
      <Card title="List a new animal">
        <form
          onSubmit={create}
          className="grid gap-3 sm:grid-cols-3 mt-2 items-end"
        >
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 bg-white"
            >
              <option value="COW">Cow</option>
              <option value="PIG">Pig</option>
              <option value="TURKEY">Turkey</option>
              <option value="BROILER">Chicken</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Tag</span>
            <input
              required
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              placeholder="Cow #025"
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              Total kg
            </span>
            <input
              required
              type="number"
              min={1}
              step="any"
              value={form.totalKg}
              onChange={(e) => setForm({ ...form, totalKg: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">₦ per kg</span>
            <input
              type="number"
              min={0}
              value={form.pricePerKg}
              onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              ₦ per live bird (poultry)
            </span>
            <input
              type="number"
              min={0}
              value={form.livePrice}
              onChange={(e) => setForm({ ...form, livePrice: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              Live birds in stock
            </span>
            <input
              type="number"
              min={0}
              value={form.liveStock}
              onChange={(e) => setForm({ ...form, liveStock: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-3 outline-none focus:border-lemon-600"
            />
          </label>
          <Button>List Animal</Button>
        </form>
      </Card>

      <div className="grid gap-3 mt-4">
        {animals.map((a) => (
          <AnimalRow key={a.id} animal={a} onAdjust={adjust} />
        ))}
      </div>
      {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
    </>
  );
}

function AnimalRow({
  animal: a,
  onAdjust,
}: {
  animal: Animal;
  onAdjust: (
    id: string,
    finalKg: string,
    price: string,
    livePrice: string,
    liveStock: string
  ) => void;
}) {
  const [finalKg, setFinalKg] = useState("");
  const [price, setPrice] = useState("");
  const [livePrice, setLivePrice] = useState("");
  const [liveStock, setLiveStock] = useState("");
  const isPoultry = a.type === "TURKEY" || a.type === "BROILER";
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-xl font-semibold">{a.tag}</p>
        <Badge status={a.status === "AVAILABLE" ? "confirmed" : "pending"}>
          {a.status}
        </Badge>
        <span className="text-sm text-ash-600">
          {a.availableKg} / {a.totalKg} kg ·{" "}
          {a.pricePerKg > 0 ? `${koboToNaira(a.pricePerKg)}/kg` : "price TBC"} ·{" "}
          {a._count.reservations} reservation(s)
          {isPoultry && a.liveStock != null ? ` · ${a.liveStock} live` : ""}
          {isPoultry && a.livePrice ? ` · ${koboToNaira(a.livePrice)}/bird` : ""}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-4 mt-3 items-end">
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Final weight (kg)
          </span>
          <input
            type="number"
            min={0}
            step="any"
            value={finalKg}
            onChange={(e) => setFinalKg(e.target.value)}
            placeholder={String(a.totalKg)}
            className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1">₦ per kg</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={String(a.pricePerKg / 100)}
            className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
          />
        </label>
        {isPoultry ? (
          <>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                ₦ per live bird
              </span>
              <input
                type="number"
                min={0}
                value={livePrice}
                onChange={(e) => setLivePrice(e.target.value)}
                className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Live birds in stock
              </span>
              <input
                type="number"
                min={0}
                value={liveStock}
                onChange={(e) => setLiveStock(e.target.value)}
                className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
              />
            </label>
          </>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onAdjust(a.id, finalKg, price, livePrice, liveStock);
            setFinalKg("");
            setPrice("");
            setLivePrice("");
            setLiveStock("");
          }}
        >
          Apply
        </Button>
      </div>
    </Card>
  );
}

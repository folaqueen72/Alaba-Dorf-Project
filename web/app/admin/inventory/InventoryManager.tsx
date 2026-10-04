"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { koboToNaira } from "@/lib/format";

export function InventoryManager() {
  const [inv, setInv] = useState<{
    totalCrates: number;
    reservedCrates: number;
    soldCrates: number;
    pricePerCrate: number;
  } | null>(null);
  const [total, setTotal] = useState("");
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    if (res.ok) {
      setInv(data.inventory);
      setTotal(String(data.inventory.totalCrates));
      setPrice(String(data.inventory.pricePerCrate / 100));
    } else setMsg(data.error ?? "Could not load stock.");
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalCrates: Number(total),
        pricePerCrate: Math.round(Number(price) * 100),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error ?? "Save failed.");
      return;
    }
    setInv(data.inventory);
    setMsg("Stock updated and recorded.");
  }

  const available = inv
    ? inv.totalCrates - inv.reservedCrates - inv.soldCrates
    : 0;

  return (
    <Card title="Egg stock">
      {inv ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 mb-4 text-sm">
            <div className="border border-ash-200 rounded-lg p-2">
              <b className="font-display text-xl block">{inv.totalCrates}</b>
              Total
            </div>
            <div className="border border-ash-200 rounded-lg p-2">
              <b className="font-display text-xl block">{inv.reservedCrates}</b>
              Reserved
            </div>
            <div className="border border-ash-200 rounded-lg p-2">
              <b className="font-display text-xl block">{inv.soldCrates}</b>
              Sold
            </div>
            <div className="border border-lemon-600 bg-lemon-50 rounded-lg p-2">
              <b className="font-display text-xl block">{available}</b>
              Available
            </div>
          </div>
          <p className="text-sm text-ash-600 mb-3">
            Current price: {koboToNaira(inv.pricePerCrate)} per crate
          </p>
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Total crates
              </span>
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-[10px] border border-ash-400 px-4 py-3 outline-none focus:border-lemon-600"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Price per crate (₦)
              </span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-[10px] border border-ash-400 px-4 py-3 outline-none focus:border-lemon-600"
              />
            </label>
            <div className="flex items-end">
              <Button className="w-full" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <p className="text-ash-600 text-sm mt-2">Loading…</p>
      )}
      {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
    </Card>
  );
}

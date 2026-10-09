"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import {
  CustomerFields,
  type CustomerInput,
} from "../components/CustomerFields";
import {
  PaymentMethodPicker,
  type PayMethod,
} from "../components/PaymentMethodPicker";
import { OrderSuccess } from "../components/OrderSuccess";
import { koboToNaira } from "@/lib/format";

export type PoultryLine = {
  id: string;
  tag: string;
  bird: string;
  availableKg: number;
  pricePerKg: number;
  livePrice: number | null;
  liveStock: number | null;
  active: boolean;
  imageKey: string | null;
};

export function PoultryOrder({ batches }: { batches: PoultryLine[] }) {
  const live = batches.filter((b) => b.active);
  const [batchId, setBatchId] = useState(live[0]?.id ?? "");
  const batch = live.find((b) => b.id === batchId) ?? live[0];
  const [mode, setMode] = useState<"live" | "kg">("live");
  const [qty, setQty] = useState(1);
  const [kg, setKg] = useState(2);
  const [payMethod, setPayMethod] = useState<PayMethod>("CARD");
  const [customer, setCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{
    ref: string;
    total: number;
    method: PayMethod;
  } | null>(null);

  if (!batch) {
    return (
      <p className="font-semibold">
        No poultry available right now. Check back soon.
      </p>
    );
  }

  const liveMax = batch.liveStock ?? 0;
  const kgMax = Math.min(batch.availableKg, 99);
  const total =
    mode === "live"
      ? qty * (batch.livePrice ?? 0)
      : Math.round(kg * batch.pricePerKg);

  if (placed) {
    return (
      <OrderSuccess
        ref={placed.ref}
        total={placed.total}
        payNow={placed.method !== "CASH"}
        note={
          placed.method === "CASH"
            ? "Your poultry order is recorded. Pay cash on collection or delivery."
            : "Your poultry order is recorded. Complete payment now to confirm it."
        }
      />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dept: "FARM",
          lines: [
            mode === "live"
              ? { kind: "poultry", animalId: batch.id, mode: "live", qty }
              : { kind: "poultry", animalId: batch.id, mode: "kg", kg },
          ],
          customer,
          fulfillment: "PICKUP",
          paymentMethod: payMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed.");
      setPlaced({ ref: data.orderNo, total: data.total, method: payMethod });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {live.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setBatchId(b.id);
              setQty(1);
            }}
            className={`text-left border rounded-[10px] p-3 flex items-center gap-3 ${
              batchId === b.id
                ? "bg-lemon-50 border-lemon-600"
                : "bg-white border-ash-400"
            }`}
          >
            {b.imageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.imageKey}
                alt={b.bird}
                className="w-14 h-14 rounded-lg object-cover border border-ash-200 flex-shrink-0"
                loading="lazy"
              />
            ) : null}
            <span>
              <p className="font-bold">{b.bird}</p>
              <p className="text-sm text-ash-600">
                {b.liveStock != null ? `${b.liveStock} live` : ""}{" "}
                {b.liveStock != null && b.availableKg > 0 ? "·" : ""}{" "}
                {b.availableKg > 0 ? `${b.availableKg} kg` : ""}
              </p>
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(["live", "kg"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-[10px] text-sm font-semibold border ${
              mode === m
                ? "bg-lemon-100 border-lemon-600 text-lemon-800"
                : "bg-white border-ash-400"
            }`}
          >
            {m === "live" ? "Live birds" : "Per kg"}
          </button>
        ))}
      </div>

      {mode === "live" ? (
        <div className="flex items-center gap-4">
          <QuantityStepper
            value={qty}
            min={1}
            max={Math.max(1, liveMax)}
            onChange={setQty}
          />
          <span className="text-sm text-ash-600">
            birds ·{" "}
            {batch.livePrice ? koboToNaira(batch.livePrice) : "price TBC"} each
          </span>
        </div>
      ) : (
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Kilos (max {batch.availableKg})
          </span>
          <input
            type="number"
            min={0.5}
            step={0.5}
            max={batch.availableKg}
            value={kg}
            onChange={(e) => setKg(Number(e.target.value))}
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
      )}

      <p className="font-display text-3xl font-semibold">
        {koboToNaira(total)}
      </p>
      <CustomerFields value={customer} onChange={setCustomer} needAddress={false} />
      <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
      {error ? <p className="text-sm font-semibold">{error}</p> : null}
      <Button className="w-full" disabled={busy}>
        {busy ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}

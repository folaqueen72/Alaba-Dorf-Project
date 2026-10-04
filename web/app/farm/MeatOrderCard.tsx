"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  CustomerFields,
  type CustomerInput,
} from "../components/CustomerFields";
import { OrderSuccess } from "../components/OrderSuccess";

export function MeatOrderCard({
  animalId,
  tag,
  availableKg,
  priceLabel,
  active,
}: {
  animalId: string;
  tag: string;
  availableKg: number;
  priceLabel: string;
  active: boolean;
}) {
  const [kg, setKg] = useState(5);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
    address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ ref: string; total: number } | null>(
    null
  );

  if (placed) {
    return (
      <OrderSuccess
        ref={placed.ref}
        total={placed.total}
        note={`${kg} kg reserved on ${tag} in your name. We go call you on final weight and payment steps.`}
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
          lines: [{ kind: "meat", animalId, kg }],
          customer,
          fulfillment: "PICKUP",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reservation failed.");
      setPlaced({ ref: data.orderNo, total: data.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-ash-200 rounded-[10px] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-bold">{tag}</p>
          <p className="text-sm text-ash-600">
            {availableKg} kg left · {priceLabel}
          </p>
        </div>
        {active && availableKg > 0 ? (
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Reserve"}
          </Button>
        ) : (
          <Badge status="pending">Full</Badge>
        )}
      </div>
      {open && active && availableKg > 0 ? (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              Kilos (max {availableKg})
            </span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              max={availableKg}
              value={kg}
              onChange={(e) => setKg(Number(e.target.value))}
              className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
            />
          </label>
          <CustomerFields
            value={customer}
            onChange={setCustomer}
            needAddress={false}
          />
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy ? "Reserving…" : `Reserve ${kg} kg`}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

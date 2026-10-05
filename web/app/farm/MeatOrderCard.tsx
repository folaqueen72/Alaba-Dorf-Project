"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
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

export function MeatOrderCard({
  animalId,
  tag,
  availableKg,
  pricePerKg,
  active,
}: {
  animalId: string;
  tag: string;
  availableKg: number;
  pricePerKg: number;
  active: boolean;
}) {
  const [kg, setKg] = useState(5);
  const [open, setOpen] = useState(false);
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

  if (placed) {
    return (
      <OrderSuccess
        ref={placed.ref}
        total={placed.total}
        payNow={placed.method !== "CASH"}
        note={
          placed.method === "CASH"
            ? `${kg} kg reserved on ${tag} in your name. Pay cash when the final weight is confirmed and your portion is ready.`
            : `${kg} kg reserved on ${tag} in your name. Complete payment now; any final weight difference is settled with you directly.`
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
          lines: [{ kind: "meat", animalId, kg }],
          customer,
          fulfillment: "PICKUP",
          paymentMethod: payMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reservation failed.");
      setPlaced({ ref: data.orderNo, total: data.total, method: payMethod });
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
            {availableKg} kg left ·{" "}
            {pricePerKg > 0
              ? `${koboToNaira(pricePerKg)}/kg`
              : "Price to be confirmed"}
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
          {pricePerKg > 0 && kg > 0 ? (
            <p className="font-display text-2xl font-semibold">
              {koboToNaira(Math.round(kg * pricePerKg))}
            </p>
          ) : null}
          {pricePerKg > 0 && kg > 0 ? (
            <p className="text-sm text-ash-600 -mt-2">
              {kg} kg × {koboToNaira(pricePerKg)}/kg
            </p>
          ) : null}
          <CustomerFields
            value={customer}
            onChange={setCustomer}
            needAddress={false}
          />
          <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy ? "Reserving…" : `Reserve ${kg} kg`}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

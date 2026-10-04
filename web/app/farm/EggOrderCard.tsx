"use client";

import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import { Badge } from "../components/ui/Badge";
import {
  CustomerFields,
  type CustomerInput,
} from "../components/CustomerFields";
import { OrderSuccess } from "../components/OrderSuccess";
import { koboToNaira } from "@/lib/format";

export function EggOrderCard({
  available,
  pricePerCrate,
  soldOut,
}: {
  available: number;
  pricePerCrate: number;
  soldOut: boolean;
}) {
  const [crates, setCrates] = useState(1);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
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
        note="Your crates are reserved. Online payment is coming soon — for now, wait for our confirmation call, then collect your order or expect delivery."
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
          lines: [{ kind: "eggs", crates }],
          customer,
          fulfillment: mode === "pickup" ? "PICKUP" : "DELIVERY",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed.");
      setPlaced({ ref: data.orderNo, total: data.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Table Eggs</h2>
        {soldOut ? (
          <Badge status="pending">Sold out</Badge>
        ) : (
          <Badge status="confirmed">In stock</Badge>
        )}
      </div>
      <p className="text-ash-600 text-sm mt-1">
        {available} crates available · {koboToNaira(pricePerCrate)} per crate
      </p>
      {soldOut ? (
        <p className="mt-4 font-semibold">
          Eggs are finished for now. Check back soon — new stock is on the way.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <QuantityStepper
              value={crates}
              min={1}
              max={Math.min(available, 99)}
              onChange={setCrates}
            />
            <span className="text-sm text-ash-600">crates</span>
          </div>
          <div className="flex gap-2">
            {(["pickup", "delivery"] as const).map((m) => (
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
                {m === "pickup" ? "Pickup" : "Delivery"}
              </button>
            ))}
          </div>
          <CustomerFields
            value={customer}
            onChange={setCustomer}
            needAddress={mode === "delivery"}
          />
          <p className="font-display text-3xl font-semibold">
            {koboToNaira(crates * pricePerCrate)}
          </p>
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy ? "Placing order…" : "Place Order"}
          </Button>
        </form>
      )}
    </Card>
  );
}

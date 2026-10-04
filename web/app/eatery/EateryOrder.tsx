"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  CustomerFields,
  type CustomerInput,
} from "../components/CustomerFields";
import { OrderSuccess } from "../components/OrderSuccess";
import { koboToNaira } from "@/lib/format";

export type MenuLine = {
  id: string;
  name: string;
  desc: string;
  price: number;
  soldOut: boolean;
};

export function EateryOrder({ menu }: { menu: MenuLine[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
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

  const total = menu.reduce(
    (sum, m) => sum + (cart[m.id] ?? 0) * m.price,
    0
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const setQty = (id: string, qty: number) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));

  if (placed) {
    return (
      <OrderSuccess
        ref={placed.ref}
        total={placed.total}
        note="The kitchen has received your order. Online payment is coming soon — your food will be ready for collection or delivery."
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
          dept: "EATERY",
          lines: menu
            .filter((m) => (cart[m.id] ?? 0) > 0)
            .map((m) => ({
              kind: "food",
              menuItemId: m.id,
              qty: cart[m.id],
            })),
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
    <form onSubmit={submit}>
      {menu.length === 0 ? (
        <p className="font-semibold">
          The kitchen is on break — the menu will appear here when food is ready.
        </p>
      ) : null}
      {menu.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 border border-ash-200 rounded-[10px] p-3 mb-2"
        >
          <div>
            <p className="font-bold flex items-center gap-2">
              {m.name}
              {m.soldOut ? <Badge status="pending">Sold out</Badge> : null}
            </p>
            <p className="text-sm text-ash-600">{m.desc}</p>
          </div>
          <p className="ml-auto font-bold text-lemon-800 whitespace-nowrap">
            {koboToNaira(m.price)}
          </p>
          {m.soldOut ? (
            <Button size="sm" variant="disabled" disabled type="button">
              Sold Out
            </Button>
          ) : (cart[m.id] ?? 0) === 0 ? (
            <Button size="sm" type="button" onClick={() => setQty(m.id, 1)}>
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Remove one ${m.name}`}
                onClick={() => setQty(m.id, (cart[m.id] ?? 0) - 1)}
                className="w-8 h-8 rounded-lg border border-ash-400 font-bold"
              >
                −
              </button>
              <span className="font-bold w-5 text-center">{cart[m.id]}</span>
              <button
                type="button"
                aria-label={`Add one ${m.name}`}
                onClick={() => setQty(m.id, (cart[m.id] ?? 0) + 1)}
                className="w-8 h-8 rounded-lg bg-lemon-600 text-white font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>
      ))}

      {count > 0 ? (
        <div className="mt-4 border-t border-ash-200 pt-4 space-y-4">
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
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy
              ? "Placing order…"
              : `Place Order · ${koboToNaira(total)} (${count} items)`}
          </Button>
          <p className="text-sm text-ash-600">
            Food orders are prepaid — online payment arrives in the next
            update.
          </p>
        </div>
      ) : null}
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { koboToNaira } from "@/lib/format";

const MENU = [
  { id: "jollof", name: "Jollof Rice", desc: "Party style", price: 300000 },
  { id: "fried", name: "Fried Rice", desc: "With mixed veg", price: 350000 },
  { id: "chicken", name: "Grilled Chicken", desc: "Full portion", price: 250000 },
  { id: "dodo", name: "Fried Plantain", desc: "Side portion", price: 150000, soldOut: true },
];

export default function EateryPage() {
  const [cart, setCart] = useState<Record<string, number>>({ fried: 2 });
  const total = MENU.reduce(
    (sum, m) => sum + (cart[m.id] ?? 0) * m.price,
    0
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const setQty = (id: string, qty: number) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Eatery — Menu
        </h1>
        <p className="text-ash-600 mb-4">
          All food orders are prepaid online. No pay on delivery.
        </p>

        <Card>
          {MENU.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 border border-ash-200 rounded-[10px] p-3 mb-2"
            >
              <div>
                <p className="font-bold flex items-center gap-2">
                  {m.name}
                  {m.soldOut ? (
                    <Badge status="pending">Sold out</Badge>
                  ) : null}
                </p>
                <p className="text-sm text-ash-600">{m.desc}</p>
              </div>
              <p className="ml-auto font-bold text-lemon-800 whitespace-nowrap">
                {koboToNaira(m.price)}
              </p>
              {m.soldOut ? (
                <Button size="sm" variant="disabled" disabled>
                  Sold Out
                </Button>
              ) : (cart[m.id] ?? 0) === 0 ? (
                <Button size="sm" onClick={() => setQty(m.id, 1)}>
                  Add
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Remove one ${m.name}`}
                    onClick={() => setQty(m.id, (cart[m.id] ?? 0) - 1)}
                    className="w-8 h-8 rounded-lg border border-ash-400 font-bold"
                  >
                    −
                  </button>
                  <span className="font-bold w-5 text-center">
                    {cart[m.id]}
                  </span>
                  <button
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
          <Link
            href="/checkout"
            className={`block mt-3 ${count === 0 ? "pointer-events-none" : ""}`}
          >
            <Button
              className="w-full"
              variant={count === 0 ? "disabled" : "primary"}
              disabled={count === 0}
            >
              {count === 0
                ? "Cart is empty"
                : `Checkout · ${koboToNaira(total)} (${count} items)`}
            </Button>
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}

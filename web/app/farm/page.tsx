"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import { Badge } from "../components/ui/Badge";
import { koboToNaira } from "@/lib/format";

const PRICE_PER_CRATE = 750000; // kobo = ₦7,500
const STOCK = 80;

export default function FarmPage() {
  const [crates, setCrates] = useState(5);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Farm — Eggs
        </h1>
        <p className="text-ash-600 mb-4">
          Fresh crates. Stock updates the moment an order is paid.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                Table Eggs
              </h2>
              <Badge status="confirmed">In stock</Badge>
            </div>
            <p className="text-ash-600 text-sm mt-1">
              {STOCK} crates available · {koboToNaira(PRICE_PER_CRATE)} per
              crate
            </p>
            <div className="mt-4 flex items-center gap-4">
              <QuantityStepper
                value={crates}
                min={1}
                max={STOCK}
                onChange={setCrates}
              />
              <span className="text-sm text-ash-600">crates</span>
            </div>
            <div className="mt-4 flex gap-2">
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
            <p className="mt-4 font-display text-3xl font-semibold">
              {koboToNaira(crates * PRICE_PER_CRATE)}
            </p>
            <p className="text-sm text-ash-600">
              {crates} crates × {koboToNaira(PRICE_PER_CRATE)}
              {mode === "delivery" ? " + delivery fee at checkout" : ""}
            </p>
            <Link href="/checkout" className="block mt-4">
              <Button className="w-full">Continue to Checkout</Button>
            </Link>
          </Card>

          <Card title="Cow & Pig Sharing">
            <p className="text-sm text-ash-600 mt-1 mb-3">
              Reserve kilograms from a shared animal. Available weight drops as
              people reserve.
            </p>
            {[
              { tag: "Cow #024", total: "420 kg", avail: "355 kg", price: "₦X/kg" },
              { tag: "Pig #011", total: "95 kg", avail: "40 kg", price: "₦X/kg" },
            ].map((a) => (
              <div
                key={a.tag}
                className="border border-ash-200 rounded-[10px] p-3 mb-2 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold">{a.tag}</p>
                  <p className="text-sm text-ash-600">
                    {a.avail} of {a.total} left · {a.price}
                  </p>
                </div>
                <Link href="/checkout">
                  <Button size="sm" variant="outline">
                    Reserve
                  </Button>
                </Link>
              </div>
            ))}
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

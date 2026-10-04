"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const SESSIONS = [
  { id: "basic", name: "Basic Session", meta: "30 minutes", price: "₦X" },
  { id: "premium", name: "Premium Session", meta: "1 hour", price: "₦X" },
];

const SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM"];
const BOOKED = new Set(["11:00 AM"]);

export default function StudioPage() {
  const [session, setSession] = useState("premium");
  const [slot, setSlot] = useState<string | null>("12:00 PM");

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Photo Studio
        </h1>
        <p className="text-ash-600 mb-4">
          Pick a session, then a free slot. Booked slots lock instantly.
        </p>

        <Card title="Saturday, September 26">
          <div className="grid gap-2 sm:grid-cols-2 mt-2 mb-4">
            {SESSIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSession(s.id)}
                className={`text-left border rounded-[10px] p-3 ${
                  session === s.id
                    ? "bg-lemon-50 border-lemon-600"
                    : "bg-white border-ash-400"
                }`}
              >
                <p className="font-bold">{s.name}</p>
                <p className="text-sm text-ash-600">
                  {s.meta} · {s.price}
                </p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((t) =>
              BOOKED.has(t) ? (
                <div
                  key={t}
                  className="border border-ash-200 bg-ash-100 text-ash-400 rounded-lg p-3 text-center text-sm font-semibold line-through"
                >
                  {t}
                </div>
              ) : (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSlot(t)}
                  className={`border rounded-lg p-3 text-center text-sm font-semibold ${
                    slot === t
                      ? "bg-lemon-600 border-lemon-600 text-white"
                      : "bg-white border-ash-400"
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>
          <Link href="/checkout" className="block mt-4">
            <Button className="w-full" disabled={!slot}>
              {slot ? `Book ${slot}` : "Pick a time slot"}
            </Button>
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
